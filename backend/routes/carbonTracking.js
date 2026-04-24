const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { queryAI } = require('../services/openrouter');

// GET all carbon records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM carbon_records ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single carbon record
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM carbon_records WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Carbon record not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create carbon record
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { source, emission_kg, offset_kg, net_emission_kg, category, date_recorded, notes, status } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO carbon_records (source, emission_kg, offset_kg, net_emission_kg, category, date_recorded, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [source, emission_kg, offset_kg, net_emission_kg, category, date_recorded, notes, status]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update carbon record
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { source, emission_kg, offset_kg, net_emission_kg, category, date_recorded, notes, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE carbon_records SET source = $1, emission_kg = $2, offset_kg = $3, net_emission_kg = $4,
       category = $5, date_recorded = $6, notes = $7, status = $8, updated_at = NOW() WHERE id = $9 RETURNING *`,
      [source, emission_kg, offset_kg, net_emission_kg, category, date_recorded, notes, status, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Carbon record not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE carbon record
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM carbon_records WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Carbon record not found.' });
    }
    res.json({ message: 'Carbon record deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST AI analysis of carbon footprint
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM carbon_records ORDER BY date_recorded DESC');
    const dataContext = rows.map(r =>
      `${r.source}: emission=${r.emission_kg}kg, offset=${r.offset_kg}kg, net=${r.net_emission_kg}kg, category=${r.category}, date=${r.date_recorded}, notes=${r.notes}, status=${r.status}`
    ).join('\n');

    const systemPrompt = `You are an expert environmental sustainability analyst and carbon footprint specialist for a smart home system. Analyze the carbon emissions data and provide:
1) Total carbon footprint assessment - emissions vs offsets breakdown
2) Category-by-category emission analysis identifying the largest contributors
3) Carbon neutrality progress report - how close is the household to net-zero
4) Specific reduction strategies prioritized by impact and feasibility
5) Carbon offset recommendations - most effective offset programs and investments
6) Comparison to average household carbon footprint benchmarks
7) Monthly and seasonal emission trends and patterns
8) Renewable energy transition recommendations to reduce grid-based emissions
9) Lifestyle changes that would have the biggest carbon reduction impact
10) Carbon reduction roadmap with quarterly targets to achieve net-zero`;

    const userMessage = `Analyze this carbon footprint data:\n${dataContext}\n\n${req.body.additionalContext || 'Provide comprehensive carbon footprint analysis and reduction plan.'}`;
    const result = await queryAI(systemPrompt, userMessage);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
