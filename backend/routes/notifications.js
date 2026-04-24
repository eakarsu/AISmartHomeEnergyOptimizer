const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM notifications WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, message, type, priority, source, action_url } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO notifications (title, message, type, priority, source, action_url) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title, message, type, priority, source, action_url]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, message, type, priority, source, action_url } = req.body;
    const { rows } = await pool.query(
      'UPDATE notifications SET title=$1, message=$2, type=$3, priority=$4, source=$5, action_url=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [title, message, type, priority, source, action_url, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE notifications SET is_read = true, updated_at=NOW() WHERE id=$1 RETURNING *',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM notifications WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
