const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET all devices
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM devices ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single device
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM devices WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Device not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create device
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { device_name, device_type, manufacturer, ip_address, firmware_version, room, power_consumption_w, is_online, status } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO devices (device_name, device_type, manufacturer, ip_address, firmware_version, room, power_consumption_w, is_online, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [device_name, device_type, manufacturer, ip_address, firmware_version, room, power_consumption_w, is_online, status]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update device
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { device_name, device_type, manufacturer, ip_address, firmware_version, room, power_consumption_w, is_online, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE devices SET device_name = $1, device_type = $2, manufacturer = $3, ip_address = $4, firmware_version = $5,
       room = $6, power_consumption_w = $7, is_online = $8, status = $9, updated_at = NOW() WHERE id = $10 RETURNING *`,
      [device_name, device_type, manufacturer, ip_address, firmware_version, room, power_consumption_w, is_online, status, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Device not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE device
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM devices WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Device not found.' });
    }
    res.json({ message: 'Device deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
