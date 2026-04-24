const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { queryAI } = require('../services/openrouter');

// GET all solar panels
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM solar_panels ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single solar panel
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM solar_panels WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Solar panel not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create solar panel
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { panel_name, capacity_kw, current_output_kw, efficiency_pct, installation_date, location, status } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO solar_panels (panel_name, capacity_kw, current_output_kw, efficiency_pct, installation_date, location, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [panel_name, capacity_kw, current_output_kw, efficiency_pct, installation_date, location, status]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update solar panel
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { panel_name, capacity_kw, current_output_kw, efficiency_pct, installation_date, location, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE solar_panels SET panel_name = $1, capacity_kw = $2, current_output_kw = $3, efficiency_pct = $4,
       installation_date = $5, location = $6, status = $7, updated_at = NOW() WHERE id = $8 RETURNING *`,
      [panel_name, capacity_kw, current_output_kw, efficiency_pct, installation_date, location, status, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Solar panel not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE solar panel
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM solar_panels WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Solar panel not found.' });
    }
    res.json({ message: 'Solar panel deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST AI optimization for solar panels
router.post('/optimize', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM solar_panels ORDER BY created_at DESC');
    const dataContext = rows.map(r =>
      `${r.panel_name}: capacity=${r.capacity_kw}kW, output=${r.current_output_kw}kW, efficiency=${r.efficiency_pct}%, location=${r.location}, installed=${r.installation_date}, status=${r.status}`
    ).join('\n');

    const systemPrompt = `You are an expert solar energy engineer and optimization specialist for a smart home system. Analyze the solar panel data and provide:
1) Overall solar array performance assessment - compare actual output vs rated capacity
2) Panel-by-panel efficiency analysis and identification of underperforming panels
3) Positioning and angle optimization recommendations based on location data
4) Seasonal output predictions and adjustments needed
5) Maintenance recommendations for panels showing degraded efficiency
6) ROI analysis and payback period estimates
7) Recommendations for additional panel installations or upgrades
8) Energy storage pairing suggestions to maximize solar utilization
9) Grid export optimization strategies during peak solar production`;

    const userMessage = `Optimize these solar panels:\n${dataContext}\n\n${req.body.additionalContext || 'Provide comprehensive optimization recommendations.'}`;
    const result = await queryAI(systemPrompt, userMessage);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
