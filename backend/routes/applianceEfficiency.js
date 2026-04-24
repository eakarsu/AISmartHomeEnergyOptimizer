const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { queryAI } = require('../services/openrouter');

// GET all appliances
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM appliances ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single appliance
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM appliances WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appliance not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create appliance
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { appliance_name, brand, model, energy_rating, annual_consumption_kwh, age_years, category, replacement_cost, status } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO appliances (appliance_name, brand, model, energy_rating, annual_consumption_kwh, age_years, category, replacement_cost, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [appliance_name, brand, model, energy_rating, annual_consumption_kwh, age_years, category, replacement_cost, status]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update appliance
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { appliance_name, brand, model, energy_rating, annual_consumption_kwh, age_years, category, replacement_cost, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE appliances SET appliance_name = $1, brand = $2, model = $3, energy_rating = $4, annual_consumption_kwh = $5,
       age_years = $6, category = $7, replacement_cost = $8, status = $9, updated_at = NOW() WHERE id = $10 RETURNING *`,
      [appliance_name, brand, model, energy_rating, annual_consumption_kwh, age_years, category, replacement_cost, status, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appliance not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE appliance
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM appliances WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appliance not found.' });
    }
    res.json({ message: 'Appliance deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST AI advice on appliance efficiency
router.post('/advise', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM appliances ORDER BY created_at DESC');
    const dataContext = rows.map(r =>
      `${r.appliance_name}: brand=${r.brand}, model=${r.model}, rating=${r.energy_rating}, consumption=${r.annual_consumption_kwh}kWh/yr, age=${r.age_years}yrs, category=${r.category}, replacement_cost=$${r.replacement_cost}, status=${r.status}`
    ).join('\n');

    const systemPrompt = `You are an expert home appliance efficiency consultant and energy auditor for a smart home system. Analyze the appliance data and provide:
1) Overall appliance efficiency assessment with a score (1-10) for the entire household
2) Identification of the most energy-inefficient appliances that should be prioritized for replacement
3) Cost-benefit analysis for each recommended replacement (energy savings vs replacement cost with payback period)
4) Energy Star or equivalent upgrade recommendations with specific model suggestions
5) Usage optimization tips for existing appliances to reduce consumption without replacement
6) Age-based replacement timeline - which appliances are approaching end-of-life
7) Category-by-category efficiency comparison against modern standards
8) Estimated total annual savings from implementing all recommendations
9) Rebate and incentive programs that may apply to recommended upgrades
10) Maintenance recommendations to extend life and improve efficiency of current appliances`;

    const userMessage = `Advise on these appliances:\n${dataContext}\n\n${req.body.additionalContext || 'Provide comprehensive appliance efficiency advice and replacement recommendations.'}`;
    const result = await queryAI(systemPrompt, userMessage);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
