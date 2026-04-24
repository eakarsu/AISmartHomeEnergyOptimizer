const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { queryAI } = require('../services/openrouter');

// GET all utility rates
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM utility_rates ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single utility rate
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM utility_rates WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utility rate not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create utility rate
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { provider_name, rate_type, rate_per_kwh, peak_hours, off_peak_rate, time_of_use, region, status } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO utility_rates (provider_name, rate_type, rate_per_kwh, peak_hours, off_peak_rate, time_of_use, region, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [provider_name, rate_type, rate_per_kwh, peak_hours, off_peak_rate, time_of_use, region, status]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update utility rate
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { provider_name, rate_type, rate_per_kwh, peak_hours, off_peak_rate, time_of_use, region, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE utility_rates SET provider_name = $1, rate_type = $2, rate_per_kwh = $3, peak_hours = $4,
       off_peak_rate = $5, time_of_use = $6, region = $7, status = $8, updated_at = NOW() WHERE id = $9 RETURNING *`,
      [provider_name, rate_type, rate_per_kwh, peak_hours, off_peak_rate, time_of_use, region, status, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utility rate not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE utility rate
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM utility_rates WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utility rate not found.' });
    }
    res.json({ message: 'Utility rate deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST AI arbitrage analysis for utility rates
router.post('/arbitrage', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM utility_rates ORDER BY created_at DESC');
    const dataContext = rows.map(r =>
      `${r.provider_name}: type=${r.rate_type}, rate=$${r.rate_per_kwh}/kWh, peak_hours=${r.peak_hours}, off_peak=$${r.off_peak_rate}/kWh, TOU=${r.time_of_use}, region=${r.region}, status=${r.status}`
    ).join('\n');

    const systemPrompt = `You are an expert energy market analyst and utility rate optimization specialist for a smart home system. Analyze the utility rate data and provide:
1) Rate comparison across providers - identify the cheapest options for different usage patterns
2) Time-of-use arbitrage opportunities - when to shift consumption for maximum savings
3) Peak vs off-peak rate differential analysis and optimal load shifting strategies
4) Battery charge/discharge scheduling to exploit rate differences (charge during off-peak, discharge during peak)
5) Solar export optimization - best times to sell back to the grid based on rates
6) Estimated monthly savings from optimal rate arbitrage strategies
7) Provider switching recommendations based on usage patterns
8) Seasonal rate variation analysis and preparation strategies
9) Demand response program participation recommendations
10) Projected annual savings from implementing all recommended arbitrage strategies`;

    const userMessage = `Analyze these utility rates for arbitrage opportunities:\n${dataContext}\n\n${req.body.additionalContext || 'Provide comprehensive rate arbitrage analysis.'}`;
    const result = await queryAI(systemPrompt, userMessage);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
