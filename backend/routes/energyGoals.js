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

// GET /progress — compute progress_pct from actual consumption data
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const { rows: goals } = await pool.query(
      `SELECT * FROM energy_goals WHERE status = 'active' ORDER BY created_at DESC`
    );

    // Get total consumption for each goal's time period
    const goalsWithProgress = await Promise.all(goals.map(async (goal) => {
      let actualValue = goal.current_value;

      // If goal is kWh-based, pull from consumption data
      if (goal.unit && goal.unit.toLowerCase().includes('kwh')) {
        const { rows: consumption } = await pool.query(
          `SELECT COALESCE(SUM(consumption_kwh), 0) AS actual_kwh
           FROM energy_consumption
           WHERE date_recorded BETWEEN $1 AND $2`,
          [goal.start_date, goal.end_date || new Date()]
        );
        actualValue = parseFloat(consumption[0]?.actual_kwh) || goal.current_value;
      }

      const progress_pct = goal.target_value > 0
        ? Math.min(100, parseFloat(((actualValue / goal.target_value) * 100).toFixed(2)))
        : 0;

      // Determine status based on progress and dates
      const today = new Date();
      const endDate = goal.end_date ? new Date(goal.end_date) : null;
      let derived_status = 'on_track';
      if (progress_pct >= 100) derived_status = 'completed';
      else if (endDate && today > endDate) derived_status = 'overdue';
      else if (progress_pct < 30 && endDate) {
        const totalDays = (endDate - new Date(goal.start_date)) / 86400000;
        const elapsedDays = (today - new Date(goal.start_date)) / 86400000;
        if (elapsedDays / totalDays > 0.5 && progress_pct < 30) derived_status = 'at_risk';
      }

      return { ...goal, actual_value: actualValue, progress_pct, derived_status };
    }));

    const summary = {
      total: goalsWithProgress.length,
      completed: goalsWithProgress.filter((g) => g.progress_pct >= 100).length,
      on_track: goalsWithProgress.filter((g) => g.derived_status === 'on_track').length,
      at_risk: goalsWithProgress.filter((g) => g.derived_status === 'at_risk').length,
      overdue: goalsWithProgress.filter((g) => g.derived_status === 'overdue').length,
      avg_progress_pct: goalsWithProgress.length
        ? parseFloat((goalsWithProgress.reduce((s, g) => s + g.progress_pct, 0) / goalsWithProgress.length).toFixed(2))
        : 0,
    };

    res.json({ goals: goalsWithProgress, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
