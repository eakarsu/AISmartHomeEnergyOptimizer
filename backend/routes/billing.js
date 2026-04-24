const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM billing_records ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM billing_records WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { billing_period, provider, amount_usd, kwh_used, due_date, payment_status, payment_method, notes } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO billing_records (billing_period, provider, amount_usd, kwh_used, due_date, payment_status, payment_method, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [billing_period, provider, amount_usd, kwh_used, due_date, payment_status, payment_method, notes]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { billing_period, provider, amount_usd, kwh_used, due_date, payment_status, payment_method, notes } = req.body;
    const { rows } = await pool.query(
      'UPDATE billing_records SET billing_period=$1, provider=$2, amount_usd=$3, kwh_used=$4, due_date=$5, payment_status=$6, payment_method=$7, notes=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [billing_period, provider, amount_usd, kwh_used, due_date, payment_status, payment_method, notes, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM billing_records WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
