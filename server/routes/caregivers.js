const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST /api/caregivers/link - Link caregiver to patient via invite_code or email
router.post('/link', verifyToken, async (req, res) => {
  try {
    const { invite_code, patient_email } = req.body;

    if (!invite_code && !patient_email) {
      return res.status(400).json({ error: 'Please provide either a Patient Invite Code or Email.' });
    }

    let patientId = null;
    let patientName = '';

    if (invite_code) {
      const patients = await db.query('SELECT id, name, role FROM users WHERE invite_code = ?', [invite_code.trim().toUpperCase()]);
      if (!patients || patients.length === 0) {
        return res.status(404).json({ error: 'No patient found with that invite code.' });
      }
      patientId = patients[0].id;
      patientName = patients[0].name;
    } else {
      const patients = await db.query('SELECT id, name, role FROM users WHERE LOWER(email) = ? AND role = "patient"', [patient_email.trim().toLowerCase()]);
      if (!patients || patients.length === 0) {
        return res.status(404).json({ error: 'No patient account found with that email address.' });
      }
      patientId = patients[0].id;
      patientName = patients[0].name;
    }

    // Determine link direction (Patient inviting caregiver or Caregiver adding patient)
    let caregiverId = req.user.id;
    if (req.user.role === 'patient') {
      return res.status(400).json({ error: 'Caregivers should initiate linking using the Patient Invite Code, or provide caregiver email.' });
    }

    // Check if link already exists
    const existing = await db.query(
      'SELECT id, status FROM caregiver_links WHERE patient_id = ? AND caregiver_id = ?',
      [patientId, caregiverId]
    );

    if (existing && existing.length > 0) {
      if (existing[0].status === 'active') {
        return res.status(409).json({ error: `You are already linked with patient ${patientName}.` });
      } else {
        await db.query('UPDATE caregiver_links SET status = "active" WHERE id = ?', [existing[0].id]);
        return res.json({ message: `Re-activated link with patient ${patientName}.` });
      }
    }

    await db.query(
      'INSERT INTO caregiver_links (patient_id, caregiver_id, status) VALUES (?, ?, "active")',
      [patientId, caregiverId]
    );

    res.status(201).json({
      message: `Successfully linked with patient ${patientName}!`,
      patient: { id: patientId, name: patientName }
    });
  } catch (err) {
    console.error('Caregiver link error:', err);
    res.status(500).json({ error: 'Failed to create caregiver link.' });
  }
});

// GET /api/caregivers/patients - Caregiver dashboard listing linked patients with adherence summaries
router.get('/patients', verifyToken, requireRole('caregiver'), async (req, res) => {
  try {
    const caregiverId = req.user.id;

    // Get linked patients
    const linkedPatients = await db.query(
      `SELECT u.id, u.name, u.email, u.invite_code, cl.created_at as linked_since
       FROM caregiver_links cl
       JOIN users u ON cl.patient_id = u.id
       WHERE cl.caregiver_id = ? AND cl.status = 'active'`,
      [caregiverId]
    );

    const todayStr = new Date().toISOString().substring(0, 10);

    const patientsWithStats = [];
    for (let patient of linkedPatients) {
      // Medicines & Stock count
      const meds = await db.query('SELECT id, name, stock_qty, refill_threshold FROM medicines WHERE patient_id = ?', [patient.id]);
      const lowStockMeds = meds.filter(m => m.stock_qty <= m.refill_threshold);

      // Total doses logged in last 30 days
      const d30 = new Date();
      d30.setDate(d30.getDate() - 30);
      const startDateStr = d30.toISOString().substring(0, 10);

      const logs = await db.query(
        `SELECT dl.status, dl.date
         FROM dose_logs dl
         JOIN schedules s ON dl.schedule_id = s.id
         JOIN medicines m ON s.medicine_id = m.id
         WHERE m.patient_id = ? AND dl.date >= ?`,
        [patient.id, startDateStr]
      );

      const totalLogged = logs.length;
      const takenCount = logs.filter(l => l.status === 'taken').length;
      const missedCount = logs.filter(l => l.status === 'missed').length;

      // Adherence rate %
      const adherenceRate = totalLogged > 0 ? Math.round((takenCount / totalLogged) * 100) : 100;

      // Today's missed doses
      const todayMissed = logs.filter(l => l.date === todayStr && l.status === 'missed').length;

      // Next appointment
      const appointments = await db.query(
        'SELECT doctor_name, date_time FROM appointments WHERE patient_id = ? AND date_time >= ? ORDER BY date_time ASC LIMIT 1',
        [patient.id, new Date().toISOString().replace('T', ' ').substring(0, 19)]
      );

      patientsWithStats.push({
        id: patient.id,
        name: patient.name,
        email: patient.email,
        invite_code: patient.invite_code,
        linked_since: patient.linked_since,
        medicines_count: meds.length,
        low_stock_count: lowStockMeds.length,
        low_stock_medicines: lowStockMeds,
        adherence_rate: adherenceRate,
        taken_count: takenCount,
        missed_count: missedCount,
        today_missed_count: todayMissed,
        next_appointment: appointments.length > 0 ? appointments[0] : null
      });
    }

    res.json({ patients: patientsWithStats });
  } catch (err) {
    console.error('Fetch linked patients error:', err);
    res.status(500).json({ error: 'Failed to retrieve linked patients.' });
  }
});

// GET /api/caregivers/alerts - Surface missed dose & low-stock alerts prominently
router.get('/alerts', verifyToken, requireRole('caregiver'), async (req, res) => {
  try {
    const caregiverId = req.user.id;
    const todayStr = new Date().toISOString().substring(0, 10);

    const alerts = [];

    // Linked patients
    const linkedPatients = await db.query(
      `SELECT u.id, u.name
       FROM caregiver_links cl
       JOIN users u ON cl.patient_id = u.id
       WHERE cl.caregiver_id = ? AND cl.status = 'active'`,
      [caregiverId]
    );

    for (let p of linkedPatients) {
      // Missed doses today
      const missedDoses = await db.query(
        `SELECT dl.id, dl.logged_at, s.time_slot, m.name as medicine_name, m.dosage
         FROM dose_logs dl
         JOIN schedules s ON dl.schedule_id = s.id
         JOIN medicines m ON s.medicine_id = m.id
         WHERE m.patient_id = ? AND dl.date = ? AND dl.status = 'missed'`,
        [p.id, todayStr]
      );

      for (let m of missedDoses) {
        alerts.push({
          type: 'missed_dose',
          patient_id: p.id,
          patient_name: p.name,
          title: `Missed Dose Alert: ${p.name}`,
          description: `${p.name} missed taking ${m.medicine_name} (${m.dosage}) scheduled at ${m.time_slot}.`,
          time_slot: m.time_slot,
          medicine_name: m.medicine_name,
          timestamp: m.logged_at || todayStr
        });
      }

      // Low stock medicines
      const lowStock = await db.query(
        'SELECT id, name, stock_qty, refill_threshold FROM medicines WHERE patient_id = ? AND stock_qty <= refill_threshold',
        [p.id]
      );

      for (let ls of lowStock) {
        alerts.push({
          type: 'low_stock',
          patient_id: p.id,
          patient_name: p.name,
          title: `Low Stock Alert: ${ls.name}`,
          description: `${p.name}'s ${ls.name} has only ${ls.stock_qty} dose(s) left (Refill threshold: ${ls.refill_threshold}).`,
          medicine_name: ls.name,
          stock_qty: ls.stock_qty
        });
      }
    }

    res.json({ alerts });
  } catch (err) {
    console.error('Fetch caregiver alerts error:', err);
    res.status(500).json({ error: 'Failed to retrieve alerts.' });
  }
});

// GET /api/caregivers/links/my-caregivers - For Patients: List linked caregivers
router.get('/my-caregivers', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Patient endpoint only.' });
    }

    const caregivers = await db.query(
      `SELECT u.id, u.name, u.email, cl.created_at
       FROM caregiver_links cl
       JOIN users u ON cl.caregiver_id = u.id
       WHERE cl.patient_id = ? AND cl.status = 'active'`,
      [req.user.id]
    );

    res.json({ caregivers });
  } catch (err) {
    console.error('Fetch patient caregivers error:', err);
    res.status(500).json({ error: 'Failed to retrieve caregivers.' });
  }
});

module.exports = router;
