const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

// Generate JWT token helper
function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'caredose_secret',
    { expiresIn: '7d' }
  );
}

// Generate unique invite code for patients
function generateInviteCode() {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `PAT-${randNum}-CD`;
}

// POST /api/auth/register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // Check if email exists
    const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const invite_code = role === 'patient' ? generateInviteCode() : null;

    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role, invite_code) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), cleanEmail, password_hash, role, invite_code]
    );

    const userId = result.insertId;
    const user = { id: userId, name: name.trim(), email: cleanEmail, role, invite_code };
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const users = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userRow = users[0];
    const isMatch = await bcrypt.compare(password, userRow.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      role: userRow.role,
      invite_code: userRow.invite_code
    };
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const users = await db.query('SELECT id, name, email, role, invite_code, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: users[0] });
  } catch (err) {
    console.error('Me endpoint error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

module.exports = router;
