const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM energy_goals ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM energy_goals WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { goal_name, target_value, current_value, unit, category, start_date, end_date } = req.body;
    const progress_pct = target_value > 0 ? Math.min(100, ((current_value / target_value) * 100)).toFixed(2) : 0;
    const { rows } = await pool.query(
      'INSERT INTO energy_goals (goal_name, target_value, current_value, unit, category, start_date, end_date, progress_pct) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [goal_name, target_value, current_value, unit, category, start_date, end_date, progress_pct]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { goal_name, target_value, current_value, unit, category, start_date, end_date, status } = req.body;
    const progress_pct = target_value > 0 ? Math.min(100, ((current_value / target_value) * 100)).toFixed(2) : 0;
    const { rows } = await pool.query(
      'UPDATE energy_goals SET goal_name=$1, target_value=$2, current_value=$3, unit=$4, category=$5, start_date=$6, end_date=$7, progress_pct=$8, status=$9, updated_at=NOW() WHERE id=$10 RETURNING *',
      [goal_name, target_value, current_value, unit, category, start_date, end_date, progress_pct, status || 'active', req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM energy_goals WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
