const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { jwtSecret } = require('../config/security');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 12) {
      return res.status(400).json({ error: 'Name, email, and a password of at least 12 characters are required.' });
    }
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );
    const token = jwt.sign({ id: rows[0].id, email: rows[0].email, role: 'home_owner' }, jwtSecret, { expiresIn: '24h' });
    res.status(201).json({ user: rows[0], token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role || 'home_owner' }, jwtSecret, { expiresIn: '24h' });
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.json({ ...rows[0], role: 'home_owner' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
