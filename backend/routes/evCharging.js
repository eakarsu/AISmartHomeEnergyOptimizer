const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { queryAI } = require('../services/openrouter');

// GET all EV vehicles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM ev_vehicles ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single EV vehicle
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM ev_vehicles WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'EV vehicle not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create EV vehicle
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { vehicle_name, battery_capacity_kwh, current_charge_pct, target_charge_pct, charging_speed_kw, departure_time, priority, status } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO ev_vehicles (vehicle_name, battery_capacity_kwh, current_charge_pct, target_charge_pct, charging_speed_kw, departure_time, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [vehicle_name, battery_capacity_kwh, current_charge_pct, target_charge_pct, charging_speed_kw, departure_time, priority, status]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update EV vehicle
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { vehicle_name, battery_capacity_kwh, current_charge_pct, target_charge_pct, charging_speed_kw, departure_time, priority, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE ev_vehicles SET vehicle_name = $1, battery_capacity_kwh = $2, current_charge_pct = $3, target_charge_pct = $4,
       charging_speed_kw = $5, departure_time = $6, priority = $7, status = $8, updated_at = NOW() WHERE id = $9 RETURNING *`,
      [vehicle_name, battery_capacity_kwh, current_charge_pct, target_charge_pct, charging_speed_kw, departure_time, priority, status, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'EV vehicle not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE EV vehicle
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM ev_vehicles WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'EV vehicle not found.' });
    }
    res.json({ message: 'EV vehicle deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST AI scheduling for EV charging
router.post('/schedule', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM ev_vehicles ORDER BY created_at DESC');
    const dataContext = rows.map(r =>
      `${r.vehicle_name}: battery=${r.battery_capacity_kwh}kWh, current_charge=${r.current_charge_pct}%, target=${r.target_charge_pct}%, charging_speed=${r.charging_speed_kw}kW, departure=${r.departure_time}, priority=${r.priority}, status=${r.status}`
    ).join('\n');

    const systemPrompt = `You are an expert EV charging optimization specialist for a smart home energy system. Analyze the EV vehicle data and create an optimal charging schedule. Provide:
1) Optimal charging schedule for each vehicle based on departure times and priority levels
2) Estimated charging duration for each vehicle to reach target charge level
3) Load balancing strategy when multiple vehicles need charging simultaneously
4) Integration with solar panel output - maximize solar-powered charging during peak production
5) Utility rate optimization - schedule charging during off-peak hours when possible
6) Battery health recommendations - optimal charging speeds and levels to preserve EV battery life
7) Emergency fast-charge scenarios and contingency plans
8) Cost estimates for each charging session based on current utility rates
9) Smart pre-conditioning recommendations based on departure schedules
10) Weekly charging pattern analysis and optimization suggestions`;

    const userMessage = `Create an optimal charging schedule for these EV vehicles:\n${dataContext}\n\n${req.body.additionalContext || 'Provide comprehensive charging schedule and optimization.'}`;
    const result = await queryAI(systemPrompt, userMessage);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
