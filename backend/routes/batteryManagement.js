const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { queryAI } = require('../services/openrouter');

// GET all batteries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM batteries ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single battery
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM batteries WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Battery not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create battery
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { battery_name, capacity_kwh, current_charge_pct, charge_rate_kw, discharge_rate_kw, health_pct, status } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO batteries (battery_name, capacity_kwh, current_charge_pct, charge_rate_kw, discharge_rate_kw, health_pct, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [battery_name, capacity_kwh, current_charge_pct, charge_rate_kw, discharge_rate_kw, health_pct, status]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update battery
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { battery_name, capacity_kwh, current_charge_pct, charge_rate_kw, discharge_rate_kw, health_pct, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE batteries SET battery_name = $1, capacity_kwh = $2, current_charge_pct = $3, charge_rate_kw = $4,
       discharge_rate_kw = $5, health_pct = $6, status = $7, updated_at = NOW() WHERE id = $8 RETURNING *`,
      [battery_name, capacity_kwh, current_charge_pct, charge_rate_kw, discharge_rate_kw, health_pct, status, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Battery not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE battery
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM batteries WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Battery not found.' });
    }
    res.json({ message: 'Battery deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST AI optimization for battery management
router.post('/optimize', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM batteries ORDER BY created_at DESC');
    const dataContext = rows.map(r =>
      `${r.battery_name}: capacity=${r.capacity_kwh}kWh, charge=${r.current_charge_pct}%, charge_rate=${r.charge_rate_kw}kW, discharge_rate=${r.discharge_rate_kw}kW, health=${r.health_pct}%, status=${r.status}`
    ).join('\n');

    const systemPrompt = `You are an expert battery storage engineer and energy management specialist for a smart home system. Analyze the battery data and provide:
1) Overall battery fleet health assessment and degradation analysis
2) Optimal charge/discharge cycle scheduling to maximize battery lifespan
3) Peak shaving strategy - when to discharge batteries to avoid peak utility rates
4) Solar energy storage optimization - best times to charge from solar panels
5) Battery health preservation recommendations (optimal charge levels, temperature management)
6) Emergency reserve recommendations - minimum charge levels to maintain
7) Load balancing strategies across multiple batteries
8) Replacement timeline predictions based on health degradation trends
9) Cost savings analysis from optimal battery utilization vs grid-only power`;

    const userMessage = `Optimize these battery systems:\n${dataContext}\n\n${req.body.additionalContext || 'Provide comprehensive battery optimization strategy.'}`;
    const result = await queryAI(systemPrompt, userMessage);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
