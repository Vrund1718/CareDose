const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// Helper to format Date as YYYY-MM-DD in Indian Standard Time (IST, UTC+5:30)
function getTodayString() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

// GET /api/schedules/today - Get today's doses for current patient (or specified linked patient)
router.get('/today', verifyToken, async (req, res) => {
  try {
    let targetPatientId = req.user.id;

    if (req.query.patient_id) {
      targetPatientId = Number(req.query.patient_id);
      if (req.user.role === 'caregiver') {
        const link = await db.query(
          'SELECT id FROM caregiver_links WHERE caregiver_id = ? AND patient_id = ? AND status = "active"',
          [req.user.id, targetPatientId]
        );
        if (!link || link.length === 0) {
          return res.status(403).json({ error: 'Unauthorized to view this patient schedule.' });
        }
      } else if (req.user.id !== targetPatientId) {
        return res.status(403).json({ error: 'Unauthorized.' });
      }
    } else if (req.user.role === 'caregiver') {
      return res.status(400).json({ error: 'Caregivers must specify patient_id query parameter.' });
    }

    const todayStr = getTodayString();

    // Auto-heal: Ensure medicines with "Twice daily" or "Three times daily" frequencies have proper time slots
    const patientMeds = await db.query('SELECT id, frequency FROM medicines WHERE patient_id = ?', [targetPatientId]);
    for (const med of patientMeds) {
      const existingSlots = await db.query('SELECT id, time_slot FROM schedules WHERE medicine_id = ?', [med.id]);
      const freqLower = (med.frequency || '').toLowerCase();
      
      if ((freqLower.includes('twice') || freqLower.includes('2 time')) && existingSlots.length === 1) {
        // Automatically add second slot (e.g. 20:00 if 08:00 exists, or 08:00 if night exists)
        const hasNight = existingSlots.some(s => s.time_slot >= '17:00');
        const newSlot = hasNight ? '08:00' : '20:00';
        await db.query('INSERT INTO schedules (medicine_id, time_slot) VALUES (?, ?)', [med.id, newSlot]);
      } else if ((freqLower.includes('three') || freqLower.includes('3 time')) && existingSlots.length < 3) {
        if (!existingSlots.some(s => s.time_slot >= '12:00' && s.time_slot < '17:00')) {
          await db.query('INSERT INTO schedules (medicine_id, time_slot) VALUES (?, ?)', [med.id, '14:00']);
        }
        if (!existingSlots.some(s => s.time_slot >= '17:00')) {
          await db.query('INSERT INTO schedules (medicine_id, time_slot) VALUES (?, ?)', [med.id, '20:00']);
        }
      }
    }

    // Fetch all schedules for target patient's active medicines
    const rawSchedules = await db.query(
      `SELECT s.id as schedule_id, s.time_slot, m.id as medicine_id, m.name as medicine_name, 
              m.dosage, m.frequency, m.stock_qty, m.refill_threshold
       FROM schedules s
       JOIN medicines m ON s.medicine_id = m.id
       WHERE m.patient_id = ?
       ORDER BY s.time_slot ASC`,
      [targetPatientId]
    );

    const doses = [];
    for (let item of rawSchedules) {
      // Check existing dose log for today
      let logs = await db.query(
        'SELECT id, status, logged_at FROM dose_logs WHERE schedule_id = ? AND date = ?',
        [item.schedule_id, todayStr]
      );

      let logId = null;
      let status = 'pending';
      let loggedAt = null;

      if (logs && logs.length > 0) {
        logId = logs[0].id;
        status = logs[0].status;
        loggedAt = logs[0].logged_at;
      } else {
        // Automatically insert initial pending log for today
        const ins = await db.query(
          'INSERT INTO dose_logs (schedule_id, date, status) VALUES (?, ?, ?)',
          [item.schedule_id, todayStr, 'pending']
        );
        logId = ins.insertId;
      }

      doses.push({
        dose_id: logId,
        schedule_id: item.schedule_id,
        medicine_id: item.medicine_id,
        medicine_name: item.medicine_name,
        dosage: item.dosage,
        frequency: item.frequency,
        time_slot: item.time_slot,
        stock_qty: item.stock_qty,
        refill_threshold: item.refill_threshold,
        date: todayStr,
        status: status,
        logged_at: loggedAt
      });
    }

    res.json({
      date: todayStr,
      patient_id: targetPatientId,
      doses
    });
  } catch (err) {
    console.error('Fetch today schedule error:', err);
    res.status(500).json({ error: 'Failed to retrieve today\'s schedule.' });
  }
});

// POST /api/schedules/log-adhoc - Log an extra dose for a medicine on demand
router.post('/log-adhoc', verifyToken, async (req, res) => {
  try {
    const { medicine_id } = req.body;
    if (!medicine_id) return res.status(400).json({ error: 'medicine_id is required.' });

    const meds = await db.query('SELECT * FROM medicines WHERE id = ? AND patient_id = ?', [medicine_id, req.user.id]);
    if (!meds || meds.length === 0) return res.status(404).json({ error: 'Medicine not found.' });
    const med = meds[0];

    // Current time in IST (e.g. 19:45)
    const nowTime = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
    const schRes = await db.query('INSERT INTO schedules (medicine_id, time_slot) VALUES (?, ?)', [med.id, nowTime]);
    const scheduleId = schRes.insertId;

    const todayStr = getTodayString();
    const nowIso = new Date().toISOString();
    const insLog = await db.query(
      'INSERT INTO dose_logs (schedule_id, date, status, logged_at) VALUES (?, ?, "taken", ?)',
      [scheduleId, todayStr, nowIso]
    );

    const updatedStock = Math.max(0, med.stock_qty - 1);
    await db.query('UPDATE medicines SET stock_qty = ? WHERE id = ?', [updatedStock, med.id]);

    res.json({
      message: `Extra dose of ${med.name} logged as TAKEN!`,
      dose_id: insLog.insertId,
      new_stock_qty: updatedStock
    });
  } catch (err) {
    console.error('Log adhoc dose error:', err);
    res.status(500).json({ error: 'Failed to log extra dose.' });
  }
});

// PATCH /api/doses/:id/status - Mark dose as taken/missed/pending
router.patch('/doses/:id/status', verifyToken, async (req, res) => {
  try {
    const doseId = Number(req.params.id);
    const { status } = req.body;

    if (!['taken', 'missed', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "taken", "missed", or "pending".' });
    }

    // Retrieve dose log & associated medicine info
    const logs = await db.query(
      `SELECT dl.*, s.medicine_id, m.patient_id, m.stock_qty, m.name as medicine_name
       FROM dose_logs dl
       JOIN schedules s ON dl.schedule_id = s.id
       JOIN medicines m ON s.medicine_id = m.id
       WHERE dl.id = ?`,
      [doseId]
    );

    if (!logs || logs.length === 0) {
      return res.status(404).json({ error: 'Dose record not found.' });
    }

    const log = logs[0];

    // Check authorization: patient owns it OR caregiver is linked
    if (req.user.role === 'patient' && req.user.id !== log.patient_id) {
      return res.status(403).json({ error: 'Unauthorized to update this dose.' });
    }
    if (req.user.role === 'caregiver') {
      const link = await db.query(
        'SELECT id FROM caregiver_links WHERE caregiver_id = ? AND patient_id = ? AND status = "active"',
        [req.user.id, log.patient_id]
      );
      if (!link || link.length === 0) {
        return res.status(403).json({ error: 'Unauthorized caregiver action.' });
      }
    }

    const prevStatus = log.status;
    const now = new Date().toISOString(); // Store standard ISO UTC string with Z

    // Update dose log
    await db.query(
      'UPDATE dose_logs SET status = ?, logged_at = ? WHERE id = ?',
      [status, status === 'pending' ? null : now, doseId]
    );

    // Stock auto-decrement logic
    let updatedStock = log.stock_qty;
    if (prevStatus !== 'taken' && status === 'taken') {
      // Decrement stock if greater than 0
      updatedStock = Math.max(0, log.stock_qty - 1);
      await db.query('UPDATE medicines SET stock_qty = ? WHERE id = ?', [updatedStock, log.medicine_id]);
    } else if (prevStatus === 'taken' && status !== 'taken') {
      // Restore stock if reverted from taken back to pending or missed
      updatedStock = log.stock_qty + 1;
      await db.query('UPDATE medicines SET stock_qty = ? WHERE id = ?', [updatedStock, log.medicine_id]);
    }

    res.json({
      message: `Dose marked as ${status}.`,
      dose: {
        id: doseId,
        status,
        logged_at: status === 'pending' ? null : now,
        medicine_id: log.medicine_id,
        medicine_name: log.medicine_name,
        new_stock_qty: updatedStock
      }
    });
  } catch (err) {
    console.error('Update dose status error:', err);
    res.status(500).json({ error: 'Failed to update dose status.' });
  }
});

module.exports = router;
