const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { queryAI } = require('../services/openrouter');

// GET all thermostats
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM thermostats ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single thermostat
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM thermostats WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Thermostat not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create thermostat
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { zone_name, current_temp_f, target_temp_f, mode, humidity_pct, occupancy, schedule_start, schedule_end, status } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO thermostats (zone_name, current_temp_f, target_temp_f, mode, humidity_pct, occupancy, schedule_start, schedule_end, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [zone_name, current_temp_f, target_temp_f, mode, humidity_pct, occupancy, schedule_start, schedule_end, status]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update thermostat
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { zone_name, current_temp_f, target_temp_f, mode, humidity_pct, occupancy, schedule_start, schedule_end, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE thermostats SET zone_name = $1, current_temp_f = $2, target_temp_f = $3, mode = $4, humidity_pct = $5,
       occupancy = $6, schedule_start = $7, schedule_end = $8, status = $9, updated_at = NOW() WHERE id = $10 RETURNING *`,
      [zone_name, current_temp_f, target_temp_f, mode, humidity_pct, occupancy, schedule_start, schedule_end, status, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Thermostat not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE thermostat
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM thermostats WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Thermostat not found.' });
    }
    res.json({ message: 'Thermostat deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST AI optimization for thermostats
router.post('/optimize', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM thermostats ORDER BY created_at DESC');
    const dataContext = rows.map(r =>
      `${r.zone_name}: current=${r.current_temp_f}F, target=${r.target_temp_f}F, mode=${r.mode}, humidity=${r.humidity_pct}%, occupancy=${r.occupancy}, schedule=${r.schedule_start}-${r.schedule_end}, status=${r.status}`
    ).join('\n');

    const systemPrompt = `You are an expert HVAC optimization specialist and smart home climate control engineer. Analyze the thermostat data and provide:
1) Zone-by-zone temperature optimization recommendations for comfort and efficiency
2) Energy savings estimates from adjusting target temperatures by zone and occupancy
3) Humidity management recommendations for each zone
4) Occupancy-based scheduling optimization - reduce heating/cooling in unoccupied zones
5) Mode recommendations (heat, cool, auto, eco) based on current conditions
6) Cross-zone airflow optimization to reduce HVAC workload
7) Seasonal adjustment recommendations for maximum efficiency
8) Night setback temperature recommendations for sleeping zones
9) Pre-conditioning schedules to reach target temps before occupancy
10) Estimated cost savings from implementing all recommended optimizations
11) Integration suggestions with other home systems (windows, fans, shades) for passive climate control`;

    const userMessage = `Optimize these thermostat settings:\n${dataContext}\n\n${req.body.additionalContext || 'Provide comprehensive climate optimization recommendations.'}`;
    const result = await queryAI(systemPrompt, userMessage);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
