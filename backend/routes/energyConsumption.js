const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { queryAI } = require('../services/openrouter');

// GET all energy consumption records (with pagination)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { rows } = await pool.query('SELECT * FROM energy_consumption ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM energy_consumption');
    const total = parseInt(countRows[0].count);
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single energy consumption record
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM energy_consumption WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Energy consumption record not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create energy consumption record
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { device_name, category, consumption_kwh, cost_usd, date_recorded, location, status } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO energy_consumption (device_name, category, consumption_kwh, cost_usd, date_recorded, location, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [device_name, category, consumption_kwh, cost_usd, date_recorded, location, status]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update energy consumption record
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { device_name, category, consumption_kwh, cost_usd, date_recorded, location, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE energy_consumption SET device_name = $1, category = $2, consumption_kwh = $3, cost_usd = $4,
       date_recorded = $5, location = $6, status = $7, updated_at = NOW() WHERE id = $8 RETURNING *`,
      [device_name, category, consumption_kwh, cost_usd, date_recorded, location, status, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Energy consumption record not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE energy consumption record
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM energy_consumption WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Energy consumption record not found.' });
    }
    res.json({ message: 'Energy consumption record deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST AI analysis of energy consumption
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM energy_consumption ORDER BY date_recorded DESC');
    const dataContext = rows.map(r =>
      `${r.device_name}: ${r.consumption_kwh}kWh, $${r.cost_usd}, category=${r.category}, location=${r.location}, status=${r.status}, date=${r.date_recorded}`
    ).join('\n');

    const systemPrompt = `You are an expert energy analyst for a smart home energy optimization system. Analyze the following energy consumption data and provide:
1) Key patterns and trends in energy usage across devices and categories
2) Cost-saving recommendations with estimated savings in dollars
3) Peak usage analysis - identify which devices and time periods consume the most energy
4) Efficiency score (1-10) for the overall home energy usage
5) Specific actionable steps to reduce consumption, prioritized by impact
6) Comparison of consumption across different locations/zones in the home
7) Anomaly detection - flag any unusual consumption patterns that may indicate issues`;

    const userMessage = `Analyze this energy consumption data:\n${dataContext}\n\n${req.body.additionalContext || 'Provide comprehensive analysis.'}`;
    const result = await queryAI(systemPrompt, userMessage);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /cost-summary — kWh × rate calculation per category
router.get('/cost-summary', authenticateToken, async (req, res) => {
  try {
    const { rows: consumption } = await pool.query(
      `SELECT category, SUM(consumption_kwh) AS total_kwh, SUM(cost_usd) AS total_cost
       FROM energy_consumption
       GROUP BY category ORDER BY total_cost DESC`
    );
    // Get current average rate
    const { rows: rates } = await pool.query(
      'SELECT AVG(rate_per_kwh) AS avg_rate FROM utility_rates WHERE status = $1',
      ['active']
    );
    const avg_rate = parseFloat(rates[0]?.avg_rate) || 0.12;

    const summary = consumption.map((row) => ({
      category: row.category,
      total_kwh: parseFloat(row.total_kwh) || 0,
      total_cost_usd: parseFloat(row.total_cost) || 0,
      calculated_cost_usd: parseFloat(((row.total_kwh || 0) * avg_rate).toFixed(2)),
    }));

    const totals = summary.reduce((acc, row) => {
      acc.total_kwh += row.total_kwh;
      acc.total_cost_usd += row.total_cost_usd;
      return acc;
    }, { total_kwh: 0, total_cost_usd: 0 });

    res.json({ summary, totals, avg_rate_per_kwh: avg_rate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /timeline — time-series for charts
router.get('/timeline', authenticateToken, async (req, res) => {
  try {
    const { days = 30, category } = req.query;
    let query = `
      SELECT date_recorded AS date,
             SUM(consumption_kwh) AS total_kwh,
             SUM(cost_usd) AS total_cost,
             COUNT(*) AS record_count
      FROM energy_consumption
      WHERE date_recorded >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
    `;
    const params = [];
    if (category) {
      query += ` AND category = $1`;
      params.push(category);
    }
    query += ' GROUP BY date_recorded ORDER BY date_recorded ASC';

    const { rows } = await pool.query(query, params);
    res.json({
      timeline: rows.map((row) => ({
        date: row.date,
        kwh: parseFloat(row.total_kwh) || 0,
        cost: parseFloat(row.total_cost) || 0,
        count: parseInt(row.record_count),
      })),
      days: parseInt(days),
      category: category || 'all',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
