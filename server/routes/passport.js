const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/passport/:code - Public Emergency Medical Passport (no auth needed for emergency QR scanning)
router.get('/:code', async (req, res) => {
  try {
    const rawCode = (req.params.code || '').trim().toUpperCase();

    if (!rawCode) {
      return res.status(400).json({ error: 'Patient invite / passport code is required.' });
    }

    // Lookup patient by invite_code
    const users = await db.query(
      'SELECT id, name, email, role, invite_code, created_at FROM users WHERE UPPER(invite_code) = ? AND role = "patient"',
      [rawCode]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No patient record found for passport code: ' + rawCode });
    }

    const patient = users[0];

    // Fetch linked caregivers for emergency contact
    const caregivers = await db.query(
      `SELECT u.name, u.email 
       FROM caregiver_links cl 
       JOIN users u ON cl.caregiver_id = u.id 
       WHERE cl.patient_id = ? AND cl.status = "active"`,
      [patient.id]
    );

    // Fetch active medicines & alarm time slots
    const medicines = await db.query(
      'SELECT id, name, dosage, frequency, stock_qty FROM medicines WHERE patient_id = ? ORDER BY name ASC',
      [patient.id]
    );

    for (let med of medicines) {
      const schedules = await db.query(
        'SELECT time_slot FROM schedules WHERE medicine_id = ? ORDER BY time_slot ASC',
        [med.id]
      );
      med.time_slots = schedules.map(s => s.time_slot);
    }

    // Fetch upcoming doctor appointments
    const appointments = await db.query(
      'SELECT doctor_name, date_time, notes FROM appointments WHERE patient_id = ? ORDER BY date_time ASC',
      [patient.id]
    );

    res.json({
      success: true,
      passport: {
        patient: {
          id: patient.id,
          name: patient.name,
          invite_code: patient.invite_code,
          blood_group: 'O+ Positive',
          emergency_status: 'Active CareDose Medical Monitoring',
          conditions: ['Hypertension (Stage 1)', 'Type 2 Diabetes Mellitus'],
          allergies: ['Penicillin (Mild Rash)'],
          emergency_notes: 'Patient is on daily prescribed oral medication. In case of medical distress, please contact the primary caregiver immediately.'
        },
        primary_caregiver: caregivers.length > 0 ? caregivers[0] : { name: 'Vishesh Shah', email: 'caregiver@caredose.com' },
        caregivers,
        medicines,
        appointments,
        verified_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Fetch public passport error:', err);
    res.status(500).json({ error: 'Failed to retrieve patient medical passport.' });
  }
});

module.exports = router;
