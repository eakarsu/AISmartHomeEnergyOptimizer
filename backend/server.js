const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
