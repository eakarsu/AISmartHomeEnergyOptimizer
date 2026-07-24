const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { queryAI, parseAIJson } = require('../services/openrouter');

// ─── Rate Limiter ────────────────────────────────────────────────────────────
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user ? 'user:' + (req.user.id || req.user.userId) : ipKeyGenerator(req.ip),
  message: { error: 'AI rate limit exceeded. Max 20 requests per hour.' },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function persistAIResult(userId, endpoint, inputData, result) {
  try {
    await pool.query(
      `INSERT INTO ai_results (user_id, endpoint, input_data, result, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId || null, endpoint, JSON.stringify(inputData), JSON.stringify(result)]
    );
  } catch (e) {
    console.error('Failed to persist AI result:', e.message);
  }
}

function validate(rules) {
  return [...rules, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    next();
  }];
}

// ─── POST /api/ai/bill-simulate ──────────────────────────────────────────────
// AI bill forecasting based on current usage patterns
router.post('/bill-simulate', authenticateToken, aiRateLimiter, validate([
  body('months_ahead').optional().isInt({ min: 1, max: 12 }).withMessage('months_ahead must be 1-12'),
]), async (req, res) => {
  try {
    const { months_ahead = 3 } = req.body;
    const userId = req.user.id;

    // Get recent consumption data
    const { rows: consumption } = await pool.query(
      `SELECT device_name, category, consumption_kwh, cost_usd, date_recorded
       FROM energy_consumption
       WHERE user_id IS NULL OR user_id = $1
       ORDER BY date_recorded DESC LIMIT 60`,
      [userId]
    );

    // Get utility rates
    const { rows: rates } = await pool.query(
      'SELECT * FROM utility_rates ORDER BY created_at DESC LIMIT 5'
    );

    const systemPrompt = `You are an energy bill forecasting expert. Analyze consumption patterns and utility rates to forecast future bills.
    Respond with JSON only:
    {
      "forecast": [
        {
          "month": "YYYY-MM",
          "estimated_kwh": <number>,
          "estimated_cost_usd": <number>,
          "confidence": "low|medium|high",
          "notes": "brief note"
        }
      ],
      "total_estimated_cost_usd": <number>,
      "average_monthly_kwh": <number>,
      "trend": "increasing|stable|decreasing",
      "cost_saving_tips": ["tip1", "tip2", "tip3"],
      "summary": "brief forecast summary"
    }`;

    const userMessage = `Forecast energy bills for the next ${months_ahead} months.

Recent Consumption Data:
${JSON.stringify(consumption, null, 2)}

Current Utility Rates:
${JSON.stringify(rates, null, 2)}

Provide a month-by-month bill forecast.`;

    const result = await queryAI(systemPrompt, userMessage);
    const parsed = parseAIJson(result.content) || { summary: result.content };
    const responseData = { forecast: parsed, model: result.model, usage: result.usage };

    await persistAIResult(userId, 'bill-simulate', { months_ahead }, responseData);
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /api/ai/optimize-usage ─────────────────────────────────────────────
router.post('/optimize-usage', authenticateToken, aiRateLimiter, validate([
  body('category').optional().isString(),
]), async (req, res) => {
  try {
    const { category } = req.body;
    const userId = req.user.id;

    const query = category
      ? `SELECT * FROM energy_consumption WHERE category = $1 ORDER BY date_recorded DESC LIMIT 50`
      : `SELECT * FROM energy_consumption ORDER BY date_recorded DESC LIMIT 50`;
    const params = category ? [category] : [];
    const { rows } = await pool.query(query, params);

    const systemPrompt = `You are a smart home energy optimization expert. Analyze usage patterns and recommend specific optimizations.
    Respond with JSON:
    {
      "efficiency_score": <0-100>,
      "top_consuming_devices": [{"device": "...", "kwh": <number>, "cost_usd": <number>}],
      "recommendations": [{"device": "...", "action": "...", "estimated_savings_usd_monthly": <number>}],
      "quick_wins": ["immediate actions with big impact"],
      "summary": "brief summary"
    }`;

    const result = await queryAI(systemPrompt, `Analyze and optimize:\n${JSON.stringify(rows, null, 2)}`);
    const parsed = parseAIJson(result.content) || { summary: result.content };
    const responseData = { optimization: parsed, model: result.model };

    await persistAIResult(userId, 'optimize-usage', req.body, responseData);
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /api/ai/consumption-forecast ───────────────────────────────────────
// Predict near-term household energy consumption
router.post('/consumption-forecast', authenticateToken, aiRateLimiter, validate([
  body('days_ahead').optional().isInt({ min: 1, max: 30 }).withMessage('days_ahead must be 1-30'),
]), async (req, res) => {
  try {
    const { days_ahead = 7 } = req.body;
    const userId = req.user.id;

    const { rows: consumption } = await pool.query(
      `SELECT device_name, category, consumption_kwh, cost_usd, date_recorded
       FROM energy_consumption
       WHERE user_id IS NULL OR user_id = $1
       ORDER BY date_recorded DESC LIMIT 90`,
      [userId]
    );

    const systemPrompt = `You are an energy consumption forecasting expert. Analyze recent kWh usage patterns by device/category to project upcoming consumption.
Respond with JSON only:
{
  "daily_forecast": [{"date": "YYYY-MM-DD", "estimated_kwh": <number>, "confidence": "low|medium|high"}],
  "by_category": [{"category": "...", "estimated_kwh": <number>}],
  "peak_days": ["YYYY-MM-DD"],
  "summary": "brief forecast summary"
}`;

    const userMessage = `Forecast household energy consumption for the next ${days_ahead} days.

Recent Consumption Data:
${JSON.stringify(consumption, null, 2)}`;

    const result = await queryAI(systemPrompt, userMessage);
    const parsed = parseAIJson(result.content) || { summary: result.content };
    const responseData = { forecast: parsed, model: result.model, usage: result.usage };

    await persistAIResult(userId, 'consumption-forecast', { days_ahead }, responseData);
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /api/ai/equipment-scheduling ───────────────────────────────────────
// Recommend optimal times to run high-load appliances (laundry, EV charging, etc.)
router.post('/equipment-scheduling', authenticateToken, aiRateLimiter, validate([
  body('equipment').optional().isString(),
]), async (req, res) => {
  try {
    const { equipment } = req.body;
    const userId = req.user.id;

    const { rows: rates } = await pool.query(
      'SELECT * FROM utility_rates ORDER BY created_at DESC LIMIT 10'
    );
    const { rows: devices } = await pool.query(
      'SELECT * FROM energy_consumption ORDER BY date_recorded DESC LIMIT 30'
    );

    const systemPrompt = `You are a load-shifting optimization expert. Given utility rates (time-of-use if any) and recent device usage, recommend the best times to run high-load equipment.
Respond with JSON only:
{
  "schedule": [{"equipment": "...", "recommended_window": "HH:MM-HH:MM", "rationale": "..."}],
  "estimated_monthly_savings_usd": <number>,
  "tou_aware": <boolean>,
  "summary": "brief summary"
}`;

    const userMessage = `Recommend equipment scheduling for ${equipment || 'all controllable loads (laundry, dishwasher, EV charging, pool pump)'}.

Utility Rates:
${JSON.stringify(rates, null, 2)}

Recent Device Usage:
${JSON.stringify(devices, null, 2)}`;

    const result = await queryAI(systemPrompt, userMessage);
    const parsed = parseAIJson(result.content) || { summary: result.content };
    const responseData = { scheduling: parsed, model: result.model, usage: result.usage };

    await persistAIResult(userId, 'equipment-scheduling', req.body, responseData);
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /api/ai/solar-forecast ─────────────────────────────────────────────
// Predict solar generation for the upcoming days
router.post('/solar-forecast', authenticateToken, aiRateLimiter, validate([
  body('days_ahead').optional().isInt({ min: 1, max: 14 }).withMessage('days_ahead must be 1-14'),
]), async (req, res) => {
  try {
    const { days_ahead = 5 } = req.body;
    const userId = req.user.id;

    let solar = [];
    try {
      const { rows } = await pool.query(
        'SELECT * FROM solar_panels ORDER BY created_at DESC LIMIT 10'
      );
      solar = rows;
    } catch (_) {}

    const systemPrompt = `You are a residential solar generation forecasting expert. Use installed capacity and historical generation patterns to project upcoming solar output.
Respond with JSON only:
{
  "daily_forecast": [{"date": "YYYY-MM-DD", "estimated_kwh": <number>, "confidence": "low|medium|high"}],
  "total_kwh": <number>,
  "self_consumption_tips": ["..."],
  "summary": "brief summary"
}`;

    const userMessage = `Forecast solar generation for the next ${days_ahead} days.

Installed Solar Configuration:
${JSON.stringify(solar, null, 2)}`;

    const result = await queryAI(systemPrompt, userMessage);
    const parsed = parseAIJson(result.content) || { summary: result.content };
    const responseData = { forecast: parsed, model: result.model, usage: result.usage };

    await persistAIResult(userId, 'solar-forecast', { days_ahead }, responseData);
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Helper: detect missing AI key for 503 handling ─────────────────────────
function aiKeyMissing() {
  const k = process.env.OPENROUTER_API_KEY;
  return !k || k === 'your_openrouter_api_key_here' || k === 'your-openrouter-api-key-here';
}

// ─── POST /api/ai/rate-optimization ──────────────────────────────────────────
// Recommend load shifting for time-of-use rate schedules
router.post('/rate-optimization', authenticateToken, aiRateLimiter, validate([
  body('horizon_days').optional().isInt({ min: 1, max: 30 }),
]), async (req, res) => {
  try {
    if (aiKeyMissing()) return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured.' });

    const { horizon_days = 7 } = req.body;
    const userId = req.user.id;

    const { rows: rates } = await pool.query(
      'SELECT * FROM utility_rates ORDER BY created_at DESC LIMIT 20'
    );
    const { rows: consumption } = await pool.query(
      `SELECT device_name, category, consumption_kwh, cost_usd, date_recorded
       FROM energy_consumption
       WHERE user_id IS NULL OR user_id = $1
       ORDER BY date_recorded DESC LIMIT 60`,
      [userId]
    );

    const systemPrompt = `You are a time-of-use rate optimization expert. Given utility rate schedules and recent device usage, recommend the cheapest TOU windows to shift flexible loads to.
Respond with JSON only:
{
  "tou_windows": [{"label": "off-peak|mid-peak|peak", "hours": "HH:MM-HH:MM", "rate_usd_per_kwh": <number>}],
  "shiftable_loads": [{"device": "...", "from_window": "...", "to_window": "...", "estimated_savings_usd_monthly": <number>}],
  "estimated_total_savings_usd_monthly": <number>,
  "summary": "brief summary"
}`;

    const userMessage = `Optimize household energy use against TOU rates over the next ${horizon_days} days.

Utility Rates:
${JSON.stringify(rates, null, 2)}

Recent Consumption:
${JSON.stringify(consumption, null, 2)}`;

    const result = await queryAI(systemPrompt, userMessage);
    const parsed = parseAIJson(result.content) || { summary: result.content };
    const responseData = { optimization: parsed, model: result.model, usage: result.usage };

    await persistAIResult(userId, 'rate-optimization', { horizon_days }, responseData);
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /api/ai/battery-management-optimization ────────────────────────────
// Recommend battery charge/discharge timing
router.post('/battery-management-optimization', authenticateToken, aiRateLimiter, validate([
  body('horizon_days').optional().isInt({ min: 1, max: 14 }),
]), async (req, res) => {
  try {
    if (aiKeyMissing()) return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured.' });

    const { horizon_days = 3 } = req.body;
    const userId = req.user.id;

    let batteries = [];
    try {
      const { rows } = await pool.query(
        'SELECT * FROM batteries ORDER BY created_at DESC LIMIT 10'
      );
      batteries = rows;
    } catch (_) {}

    let solar = [];
    try {
      const { rows } = await pool.query(
        'SELECT * FROM solar_panels ORDER BY created_at DESC LIMIT 10'
      );
      solar = rows;
    } catch (_) {}

    const { rows: rates } = await pool.query(
      'SELECT * FROM utility_rates ORDER BY created_at DESC LIMIT 10'
    );

    const systemPrompt = `You are a residential battery management optimization expert. Given installed battery capacity, solar generation, and TOU utility rates, recommend optimal charge/discharge schedules to minimize cost and maximize self-consumption.
Respond with JSON only:
{
  "schedule": [{"date": "YYYY-MM-DD", "actions": [{"start": "HH:MM", "end": "HH:MM", "action": "charge|discharge|idle", "from_source": "grid|solar|none", "rationale": "..."}]}],
  "estimated_monthly_savings_usd": <number>,
  "self_consumption_pct_estimate": <number>,
  "warnings": ["..."],
  "summary": "brief summary"
}`;

    const userMessage = `Optimize battery management for the next ${horizon_days} days.

Batteries:
${JSON.stringify(batteries, null, 2)}

Solar Configuration:
${JSON.stringify(solar, null, 2)}

Utility Rates:
${JSON.stringify(rates, null, 2)}`;

    const result = await queryAI(systemPrompt, userMessage);
    const parsed = parseAIJson(result.content) || { summary: result.content };
    const responseData = { optimization: parsed, model: result.model, usage: result.usage };

    await persistAIResult(userId, 'battery-management-optimization', { horizon_days }, responseData);
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /api/ai/demand-response-automation ─────────────────────────────────
// Recommend automated participation in DR (demand response) events
router.post('/demand-response-automation', authenticateToken, aiRateLimiter, validate([
  body('event_window').optional().isString(),
  body('event_severity').optional().isString(),
  body('expected_incentive_usd').optional().isNumeric(),
]), async (req, res) => {
  try {
    if (aiKeyMissing()) return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured.' });

    const { event_window, event_severity = 'standard', expected_incentive_usd } = req.body;
    const userId = req.user.id;

    const { rows: devices } = await pool.query(
      'SELECT * FROM energy_consumption ORDER BY date_recorded DESC LIMIT 30'
    );

    let batteries = [];
    try {
      const { rows } = await pool.query('SELECT * FROM batteries ORDER BY created_at DESC LIMIT 5');
      batteries = rows;
    } catch (_) {}

    const systemPrompt = `You are a demand response automation expert. Given a DR event window, household devices, and battery state, recommend specific automated actions (precool, defer load, discharge battery) to maximize the DR incentive while preserving comfort.
Respond with JSON only:
{
  "actions": [{"device": "...", "action": "precool|defer|discharge_battery|setback|run_now", "start": "HH:MM", "end": "HH:MM", "rationale": "..."}],
  "estimated_kw_curtailment": <number>,
  "estimated_incentive_usd": <number>,
  "comfort_impact": "minimal|moderate|noticeable",
  "go_no_go": "go|conditional|skip",
  "summary": "brief summary"
}`;

    const userMessage = `Plan automated demand response for event_window=${event_window || 'TBD'} severity=${event_severity} incentive=${expected_incentive_usd || 'unknown'}.

Recent Device Usage:
${JSON.stringify(devices, null, 2)}

Batteries:
${JSON.stringify(batteries, null, 2)}`;

    const result = await queryAI(systemPrompt, userMessage);
    const parsed = parseAIJson(result.content) || { summary: result.content };
    const responseData = { plan: parsed, model: result.model, usage: result.usage };

    await persistAIResult(userId, 'demand-response-automation', req.body, responseData);
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /api/ai/results ─────────────────────────────────────────────────────
router.get('/results', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      'SELECT * FROM ai_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );
    const { rows: countRows } = await pool.query(
      'SELECT COUNT(*) FROM ai_results WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countRows[0].count);

    res.json({
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
