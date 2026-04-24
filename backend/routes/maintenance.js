const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM maintenance_tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM maintenance_tasks WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { device_name, task_type, description, scheduled_date, priority, assigned_to, cost_usd } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO maintenance_tasks (device_name, task_type, description, scheduled_date, priority, assigned_to, cost_usd) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [device_name, task_type, description, scheduled_date, priority, assigned_to, cost_usd]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { device_name, task_type, description, scheduled_date, completed_date, priority, assigned_to, cost_usd, status } = req.body;
    const { rows } = await pool.query(
      'UPDATE maintenance_tasks SET device_name=$1, task_type=$2, description=$3, scheduled_date=$4, completed_date=$5, priority=$6, assigned_to=$7, cost_usd=$8, status=$9, updated_at=NOW() WHERE id=$10 RETURNING *',
      [device_name, task_type, description, scheduled_date, completed_date, priority, assigned_to, cost_usd, status, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM maintenance_tasks WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
