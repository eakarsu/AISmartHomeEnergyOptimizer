const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET aggregated dashboard stats
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [
      consumptionResult,
      solarResult,
      batteryResult,
      carbonResult,
      devicesResult,
      costResult
    ] = await Promise.all([
      pool.query('SELECT COALESCE(SUM(consumption_kwh), 0) AS total_consumption_kwh FROM energy_consumption'),
      pool.query('SELECT COALESCE(SUM(current_output_kw), 0) AS total_solar_output_kw FROM solar_panels WHERE status = \'active\''),
      pool.query('SELECT COALESCE(AVG(current_charge_pct), 0) AS avg_battery_level FROM batteries WHERE status = \'active\''),
      pool.query('SELECT COALESCE(SUM(net_emission_kg), 0) AS total_carbon_footprint_kg FROM carbon_records'),
      pool.query('SELECT COUNT(*) AS active_devices FROM devices WHERE is_online = true'),
      pool.query(`SELECT COALESCE(SUM(amount_usd), 0) AS monthly_cost FROM billing_records WHERE payment_status = 'pending'`)
    ]);

    res.json({
      total_consumption_kwh: parseFloat(consumptionResult.rows[0].total_consumption_kwh),
      total_solar_output_kw: parseFloat(solarResult.rows[0].total_solar_output_kw),
      avg_battery_level: parseFloat(batteryResult.rows[0].avg_battery_level),
      total_carbon_footprint_kg: parseFloat(carbonResult.rows[0].total_carbon_footprint_kg),
      active_devices: parseInt(devicesResult.rows[0].active_devices),
      monthly_cost: parseFloat(costResult.rows[0].monthly_cost)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
