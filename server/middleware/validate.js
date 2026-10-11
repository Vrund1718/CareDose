function validateRegister(req, res, next) {
  const { name, email, password, role } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Valid name (at least 2 characters) is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (!role || !['patient', 'caregiver'].includes(role)) {
    return res.status(400).json({ error: 'Role must be either "patient" or "caregiver".' });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  next();
}

function validateMedicine(req, res, next) {
  const { name, dosage, frequency, stock_qty, time_slots } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Medicine name is required.' });
  }

  if (!dosage || dosage.trim() === '') {
    return res.status(400).json({ error: 'Dosage (e.g., 10mg) is required.' });
  }

  if (!frequency || frequency.trim() === '') {
    return res.status(400).json({ error: 'Frequency description is required.' });
  }

  if (stock_qty === undefined || isNaN(Number(stock_qty)) || Number(stock_qty) < 0) {
    return res.status(400).json({ error: 'Valid stock quantity (0 or greater) is required.' });
  }

  if (!Array.isArray(time_slots) || time_slots.length === 0) {
    return res.status(400).json({ error: 'At least one time slot (e.g., ["08:00"]) is required.' });
  }

  next();
}

function validateAppointment(req, res, next) {
  const { doctor_name, date_time } = req.body;

  if (!doctor_name || doctor_name.trim() === '') {
    return res.status(400).json({ error: 'Doctor name is required.' });
  }

  if (!date_time || isNaN(Date.parse(date_time))) {
    return res.status(400).json({ error: 'Valid date and time are required.' });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateMedicine,
  validateAppointment
};
