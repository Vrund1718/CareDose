const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { validateMedicine } = require('../middleware/validate');

// Helper to check if a caregiver is linked to a patient
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

// GET /api/medicines - Get all medicines for a patient (or linked patient for caregiver)
router.get('/', verifyToken, async (req, res) => {
  try {
    let targetPatientId = req.user.id;

    if (req.query.patient_id) {
      targetPatientId = Number(req.query.patient_id);
      const allowed = await canAccessPatientData(req.user.id, req.user.role, targetPatientId);
      if (!allowed) {
        return res.status(403).json({ error: 'Unauthorized to view this patient\'s medicines.' });
      }
    } else if (req.user.role === 'caregiver') {
      return res.status(400).json({ error: 'Caregivers must specify a patient_id query parameter.' });
    }

    const medicines = await db.query(
      'SELECT * FROM medicines WHERE patient_id = ? ORDER BY id DESC',
      [targetPatientId]
    );

    // Fetch schedules for each medicine
    for (let med of medicines) {
      const schedules = await db.query('SELECT id, time_slot FROM schedules WHERE medicine_id = ? ORDER BY time_slot ASC', [med.id]);
      med.schedules = schedules;
      med.time_slots = schedules.map(s => s.time_slot);
    }

    res.json({ medicines });
  } catch (err) {
    console.error('Fetch medicines error:', err);
    res.status(500).json({ error: 'Failed to retrieve medicines.' });
  }
});

// POST /api/medicines - Create new medicine + time slots (Patient only)
router.post('/', verifyToken, validateMedicine, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can create medication records.' });
    }

    const { name, dosage, frequency, stock_qty, refill_threshold = 5, time_slots } = req.body;

    const medResult = await db.query(
      'INSERT INTO medicines (patient_id, name, dosage, frequency, stock_qty, refill_threshold) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, name.trim(), dosage.trim(), frequency.trim(), Number(stock_qty), Number(refill_threshold)]
    );

    const medicineId = medResult.insertId;

    // Create schedules for each time slot
    for (let slot of time_slots) {
      if (slot && typeof slot === 'string' && slot.trim() !== '') {
        await db.query(
          'INSERT INTO schedules (medicine_id, time_slot) VALUES (?, ?)',
          [medicineId, slot.trim()]
        );
      }
    }

    const createdSchedules = await db.query('SELECT id, time_slot FROM schedules WHERE medicine_id = ?', [medicineId]);

    res.status(201).json({
      message: 'Medication added successfully',
      medicine: {
        id: medicineId,
        patient_id: req.user.id,
        name,
        dosage,
        frequency,
        stock_qty: Number(stock_qty),
        refill_threshold: Number(refill_threshold),
        schedules: createdSchedules,
        time_slots
      }
    });
  } catch (err) {
    console.error('Create medicine error:', err);
    res.status(500).json({ error: 'Failed to create medicine.' });
  }
});

// PUT /api/medicines/:id - Update medicine details & time slots (Patient only)
router.put('/:id', verifyToken, validateMedicine, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can modify medication records.' });
    }

    const medId = Number(req.params.id);
    const { name, dosage, frequency, stock_qty, refill_threshold = 5, time_slots } = req.body;

    // Check ownership
    const existing = await db.query('SELECT id FROM medicines WHERE id = ? AND patient_id = ?', [medId, req.user.id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Medicine not found or unauthorized.' });
    }

    await db.query(
      'UPDATE medicines SET name = ?, dosage = ?, frequency = ?, stock_qty = ?, refill_threshold = ? WHERE id = ?',
      [name.trim(), dosage.trim(), frequency.trim(), Number(stock_qty), Number(refill_threshold), medId]
    );

    // Delete existing schedules and re-insert
    await db.query('DELETE FROM schedules WHERE medicine_id = ?', [medId]);
    for (let slot of time_slots) {
      if (slot && typeof slot === 'string' && slot.trim() !== '') {
        await db.query('INSERT INTO schedules (medicine_id, time_slot) VALUES (?, ?)', [medId, slot.trim()]);
      }
    }

    const updatedSchedules = await db.query('SELECT id, time_slot FROM schedules WHERE medicine_id = ?', [medId]);

    res.json({
      message: 'Medication updated successfully',
      medicine: {
        id: medId,
        patient_id: req.user.id,
        name,
        dosage,
        frequency,
        stock_qty: Number(stock_qty),
        refill_threshold: Number(refill_threshold),
        schedules: updatedSchedules,
        time_slots
      }
    });
  } catch (err) {
    console.error('Update medicine error:', err);
    res.status(500).json({ error: 'Failed to update medicine.' });
  }
});

// DELETE /api/medicines/:id - Delete medicine (Patient only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can delete medication records.' });
    }

    const medId = Number(req.params.id);
    const existing = await db.query('SELECT id FROM medicines WHERE id = ? AND patient_id = ?', [medId, req.user.id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Medicine not found or unauthorized.' });
    }

    await db.query('DELETE FROM medicines WHERE id = ?', [medId]);
    res.json({ message: 'Medicine deleted successfully.' });
  } catch (err) {
    console.error('Delete medicine error:', err);
    res.status(500).json({ error: 'Failed to delete medicine.' });
  }
});

// POST /api/medicines/:id/refill - Refill stock quantity
router.post('/:id/refill', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can refill medication stock.' });
    }

    const medId = Number(req.params.id);
    const { add_quantity = 30 } = req.body;
    const qty = Number(add_quantity);

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Please enter a valid positive quantity to add.' });
    }

    const existing = await db.query('SELECT * FROM medicines WHERE id = ? AND patient_id = ?', [medId, req.user.id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Medicine not found or unauthorized.' });
    }

    const newStock = existing[0].stock_qty + qty;
    await db.query('UPDATE medicines SET stock_qty = ? WHERE id = ?', [newStock, medId]);

    res.json({
      message: `Successfully added ${qty} units to stock!`,
      medicine_id: medId,
      new_stock_qty: newStock
    });
  } catch (err) {
    console.error('Refill error:', err);
    res.status(500).json({ error: 'Failed to refill stock.' });
  }
});

module.exports = router;
