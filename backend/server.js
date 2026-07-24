const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const pool = require('./config/database');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/energy-workflow', authenticateToken, require('./routes/energyWorkflow'));
app.use(/^\/api\/(?:gap-|ai-)/, authenticateToken, (req, res) => res.status(503).json({
  error: 'Generated AI and gap routes are quarantined; use /api/energy-workflow', retryable: false,
}));
app.use('/api', authenticateToken);
app.use('/api/energy-consumption', require('./routes/energyConsumption'));
app.use('/api/solar-panels', require('./routes/solarPanel'));
app.use('/api/batteries', require('./routes/batteryManagement'));
app.use('/api/utility-rates', require('./routes/utilityRates'));
app.use('/api/ev-charging', require('./routes/evCharging'));
app.use('/api/carbon-tracking', require('./routes/carbonTracking'));
app.use('/api/thermostats', require('./routes/thermostat'));
app.use('/api/appliances', require('./routes/applianceEfficiency'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/energy-goals', require('./routes/energyGoals'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/usage-reports', require('./routes/usageReports'));
app.use('/api/ai', require('./routes/ai'));

// Custom views (VIZ + NON-VIZ) — mount BEFORE 404 handler
app.use('/api/custom-views', require('./routes/customViews'));

// AI feature mount: load-shift
app.use('/api/ai/load-shift', require('./routes/ai-load-shift'));
// === Batch 07 Gaps & Frontend Mounts ===
app.use('/api/gap-no-consumptionforecast-predict-energy-use', require('./routes/gap-no-consumptionforecast-predict-energy-use'));
app.use('/api/gap-no-equipmentscheduling-runwhencheap', require('./routes/gap-no-equipmentscheduling-runwhencheap'));
app.use('/api/gap-no-rateoptimization-load-shifting-for-tou', require('./routes/gap-no-rateoptimization-load-shifting-for-tou'));
app.use('/api/gap-no-solarforecast-generation-prediction', require('./routes/gap-no-solarforecast-generation-prediction'));
app.use('/api/gap-no-batterymanagementoptimization', require('./routes/gap-no-batterymanagementoptimization'));
app.use('/api/gap-no-demandresponseautomation', require('./routes/gap-no-demandresponseautomation'));
app.use('/api/gap-no-smart-device-api-integration-nest-tesla-e', require('./routes/gap-no-smart-device-api-integration-nest-tesla-e'));
app.use('/api/gap-no-realtime-monitoring-dashboard-backend', require('./routes/gap-no-realtime-monitoring-dashboard-backend'));
app.use('/api/gap-no-utilitynetmetering-api-integration', require('./routes/gap-no-utilitynetmetering-api-integration'));
app.use('/api/gap-no-live-solar-monitoring-enphase-solaredge', require('./routes/gap-no-live-solar-monitoring-enphase-solaredge'));
app.use('/api/gap-no-home-automation-triggers-scenes', require('./routes/gap-no-home-automation-triggers-scenes'));
app.use('/api/gap-no-public-webhooks-for-grid-signals', require('./routes/gap-no-public-webhooks-for-grid-signals'));
// === End Batch 07 ===

// Custom views — re-mount after Batch 07 to keep BEFORE 404
app.use('/api/custom-views', require('./routes/customViews'));

// 404 fallback for unknown /api routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});
app.use((err, req, res, next) => {
  console.error('Unhandled request error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

async function start(){const result=await pool.query("SELECT to_regclass('public.energy_dispatch_cases') AS workflow_table");if(!result.rows[0].workflow_table)throw new Error('Database migrations are required; run ./scripts/migrate.sh');app.listen(PORT,()=>console.log(`Backend server running on port ${PORT}`));}
start().catch(error=>{console.error('Failed to start server:',error.message);process.exitCode=1;});
