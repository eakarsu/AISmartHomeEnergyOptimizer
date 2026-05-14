const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const pool = require('./config/database');

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize ai_results table on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS ai_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    endpoint VARCHAR(100),
    input_data JSONB,
    result JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch((err) => console.error('Failed to create ai_results table:', err.message));

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

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
