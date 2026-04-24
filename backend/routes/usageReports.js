const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM usage_reports ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM usage_reports WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { report_name, report_type, period_start, period_end, total_consumption_kwh, total_cost_usd, total_solar_kwh, total_carbon_kg } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO usage_reports (report_name, report_type, period_start, period_end, total_consumption_kwh, total_cost_usd, total_solar_kwh, total_carbon_kg) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [report_name, report_type, period_start, period_end, total_consumption_kwh, total_cost_usd, total_solar_kwh, total_carbon_kg]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { report_name, report_type, period_start, period_end, total_consumption_kwh, total_cost_usd, total_solar_kwh, total_carbon_kg, status } = req.body;
    const { rows } = await pool.query(
      'UPDATE usage_reports SET report_name=$1, report_type=$2, period_start=$3, period_end=$4, total_consumption_kwh=$5, total_cost_usd=$6, total_solar_kwh=$7, total_carbon_kg=$8, status=$9, updated_at=NOW() WHERE id=$10 RETURNING *',
      [report_name, report_type, period_start, period_end, total_consumption_kwh, total_cost_usd, total_solar_kwh, total_carbon_kg, status || 'active', req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM usage_reports WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
