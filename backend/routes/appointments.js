const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { validateAppointment } = require('../middleware/validate');

// Helper check caregiver link
async function canAccessPatientData(userId, userRole, patientId) {
  if (userRole === 'patient') {
    return userId === Number(patientId);
  }
  if (userRole === 'caregiver') {
    const links = await db.query(
      'SELECT id FROM caregiver_links WHERE caregiver_id = ? AND patient_id = ? AND status = "active"',
      [userId, patientId]
    );
    return links && links.length > 0;
  }
  return false;
}

// GET /api/appointments - Fetch appointments for patient (or linked patient for caregiver)
router.get('/', verifyToken, async (req, res) => {
  try {
    let targetPatientId = req.user.id;

    if (req.query.patient_id) {
      targetPatientId = Number(req.query.patient_id);
      const allowed = await canAccessPatientData(req.user.id, req.user.role, targetPatientId);
      if (!allowed) {
        return res.status(403).json({ error: 'Unauthorized to view appointments.' });
      }
    } else if (req.user.role === 'caregiver') {
      return res.status(400).json({ error: 'Caregivers must specify patient_id parameter.' });
    }

    const appointments = await db.query(
      'SELECT * FROM appointments WHERE patient_id = ? ORDER BY date_time ASC',
      [targetPatientId]
    );

    res.json({ appointments });
  } catch (err) {
    console.error('Fetch appointments error:', err);
    res.status(500).json({ error: 'Failed to retrieve appointments.' });
  }
});

// POST /api/appointments - Add appointment (Patient only)
router.post('/', verifyToken, validateAppointment, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can create appointments.' });
    }

    const { doctor_name, date_time, notes } = req.body;
    const formattedDateTime = new Date(date_time).toISOString().replace('T', ' ').substring(0, 19);

    const result = await db.query(
      'INSERT INTO appointments (patient_id, doctor_name, date_time, notes) VALUES (?, ?, ?, ?)',
      [req.user.id, doctor_name.trim(), formattedDateTime, notes ? notes.trim() : null]
    );

    res.status(201).json({
      message: 'Appointment added successfully',
      appointment: {
        id: result.insertId,
        patient_id: req.user.id,
        doctor_name: doctor_name.trim(),
        date_time: formattedDateTime,
        notes: notes ? notes.trim() : null
      }
    });
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ error: 'Failed to create appointment.' });
  }
});

// DELETE /api/appointments/:id - Delete appointment (Patient only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can delete appointments.' });
    }

    const apptId = Number(req.params.id);
    const existing = await db.query('SELECT id FROM appointments WHERE id = ? AND patient_id = ?', [apptId, req.user.id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or unauthorized.' });
    }

    await db.query('DELETE FROM appointments WHERE id = ?', [apptId]);
    res.json({ message: 'Appointment deleted successfully.' });
  } catch (err) {
    console.error('Delete appointment error:', err);
    res.status(500).json({ error: 'Failed to delete appointment.' });
  }
});

// PUT /api/appointments/:id - Update appointment details or notes (Patient only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can update appointments.' });
    }

    const apptId = Number(req.params.id);
    const existing = await db.query('SELECT * FROM appointments WHERE id = ? AND patient_id = ?', [apptId, req.user.id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or unauthorized.' });
    }

    const current = existing[0];
    const doctor_name = req.body.doctor_name ? req.body.doctor_name.trim() : current.doctor_name;
    const notes = req.body.notes !== undefined ? req.body.notes.trim() : current.notes;
    let formattedDateTime = current.date_time;

    if (req.body.date_time) {
      formattedDateTime = new Date(req.body.date_time).toISOString().replace('T', ' ').substring(0, 19);
    }

    await db.query(
      'UPDATE appointments SET doctor_name = ?, date_time = ?, notes = ? WHERE id = ? AND patient_id = ?',
      [doctor_name, formattedDateTime, notes, apptId, req.user.id]
    );

    res.json({
      message: 'Appointment updated successfully',
      appointment: {
        id: apptId,
        patient_id: req.user.id,
        doctor_name,
        date_time: formattedDateTime,
        notes
      }
    });
  } catch (err) {
    console.error('Update appointment error:', err);
    res.status(500).json({ error: 'Failed to update appointment.' });
  }
});

module.exports = router;
