-- AI Smart Home Energy Optimizer - Database Schema
-- PostgreSQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Energy consumption tracking
CREATE TABLE IF NOT EXISTS energy_consumption (
  id SERIAL PRIMARY KEY,
  device_name VARCHAR(255),
  category VARCHAR(100),
  consumption_kwh DECIMAL(10,2),
  cost_usd DECIMAL(10,2),
  date_recorded DATE,
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Solar panel installations
CREATE TABLE IF NOT EXISTS solar_panels (
  id SERIAL PRIMARY KEY,
  panel_name VARCHAR(255),
  capacity_kw DECIMAL(10,2),
  current_output_kw DECIMAL(10,2),
  efficiency_pct DECIMAL(5,2),
  installation_date DATE,
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Battery storage systems
CREATE TABLE IF NOT EXISTS batteries (
  id SERIAL PRIMARY KEY,
  battery_name VARCHAR(255),
  capacity_kwh DECIMAL(10,2),
  current_charge_pct DECIMAL(5,2),
  charge_rate_kw DECIMAL(10,2),
  discharge_rate_kw DECIMAL(10,2),
  health_pct DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Utility rate plans
CREATE TABLE IF NOT EXISTS utility_rates (
  id SERIAL PRIMARY KEY,
  provider_name VARCHAR(255),
  rate_type VARCHAR(100),
  rate_per_kwh DECIMAL(10,4),
  peak_hours VARCHAR(255),
  off_peak_rate DECIMAL(10,4),
  time_of_use VARCHAR(255),
  region VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Electric vehicles
CREATE TABLE IF NOT EXISTS ev_vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_name VARCHAR(255),
  battery_capacity_kwh DECIMAL(10,2),
  current_charge_pct DECIMAL(5,2),
  target_charge_pct DECIMAL(5,2),
  charging_speed_kw DECIMAL(10,2),
  departure_time TIME,
  priority VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Carbon emission records
CREATE TABLE IF NOT EXISTS carbon_records (
  id SERIAL PRIMARY KEY,
  source VARCHAR(255),
  emission_kg DECIMAL(10,2),
  offset_kg DECIMAL(10,2),
  net_emission_kg DECIMAL(10,2),
  category VARCHAR(100),
  date_recorded DATE,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Thermostat zones
CREATE TABLE IF NOT EXISTS thermostats (
  id SERIAL PRIMARY KEY,
  zone_name VARCHAR(255),
  current_temp_f DECIMAL(5,1),
  target_temp_f DECIMAL(5,1),
  mode VARCHAR(50),
  humidity_pct DECIMAL(5,1),
  occupancy BOOLEAN DEFAULT false,
  schedule_start TIME,
  schedule_end TIME,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Household appliances
CREATE TABLE IF NOT EXISTS appliances (
  id SERIAL PRIMARY KEY,
  appliance_name VARCHAR(255),
  brand VARCHAR(255),
  model VARCHAR(255),
  energy_rating VARCHAR(10),
  annual_consumption_kwh DECIMAL(10,2),
  age_years INTEGER,
  category VARCHAR(100),
  replacement_cost DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Smart home devices
CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,
  device_name VARCHAR(255),
  device_type VARCHAR(100),
  manufacturer VARCHAR(255),
  ip_address VARCHAR(45),
  firmware_version VARCHAR(50),
  room VARCHAR(100),
  power_consumption_w DECIMAL(10,2),
  is_online BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Billing records
CREATE TABLE IF NOT EXISTS billing_records (
  id SERIAL PRIMARY KEY,
  billing_period VARCHAR(100),
  provider VARCHAR(255),
  amount_usd DECIMAL(10,2),
  kwh_used DECIMAL(10,2),
  due_date DATE,
  payment_status VARCHAR(50),
  payment_method VARCHAR(100),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Maintenance tasks
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id SERIAL PRIMARY KEY,
  device_name VARCHAR(255),
  task_type VARCHAR(100),
  description TEXT,
  scheduled_date DATE,
  completed_date DATE,
  priority VARCHAR(50),
  assigned_to VARCHAR(255),
  cost_usd DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Energy saving goals
CREATE TABLE IF NOT EXISTS energy_goals (
  id SERIAL PRIMARY KEY,
  goal_name VARCHAR(255),
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2),
  unit VARCHAR(50),
  category VARCHAR(100),
  start_date DATE,
  end_date DATE,
  progress_pct DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- System notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50),
  priority VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  source VARCHAR(255),
  action_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage reports
CREATE TABLE IF NOT EXISTS usage_reports (
  id SERIAL PRIMARY KEY,
  report_name VARCHAR(255),
  report_type VARCHAR(100),
  period_start DATE,
  period_end DATE,
  total_consumption_kwh DECIMAL(10,2),
  total_cost_usd DECIMAL(10,2),
  total_solar_kwh DECIMAL(10,2),
  total_carbon_kg DECIMAL(10,2),
  generated_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
