const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();

  try {
    // Read and execute schema
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schemaSQL);
    console.log('Schema created successfully.');

    // Seed default user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(
      `INSERT INTO users (email, password, name) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING`,
      ['admin@smarthome.com', hashedPassword, 'Admin User']
    );
    console.log('Default user seeded.');

    // Seed energy_consumption (15 records)
    const energyConsumption = [
      ['Central HVAC System', 'heating_cooling', 45.20, 5.87, '2026-03-01', 'Whole House', 'active'],
      ['Samsung Refrigerator', 'kitchen', 1.80, 0.23, '2026-03-01', 'Kitchen', 'active'],
      ['LG Front-Load Washer', 'laundry', 2.30, 0.30, '2026-03-02', 'Laundry Room', 'active'],
      ['Whirlpool Dryer', 'laundry', 4.50, 0.59, '2026-03-02', 'Laundry Room', 'active'],
      ['Philips Hue Lighting', 'lighting', 0.60, 0.08, '2026-03-03', 'Living Room', 'active'],
      ['Bosch Dishwasher', 'kitchen', 1.50, 0.20, '2026-03-03', 'Kitchen', 'active'],
      ['Home Office Setup', 'electronics', 3.20, 0.42, '2026-03-04', 'Office', 'active'],
      ['Tesla Wall Charger', 'ev_charging', 30.00, 3.90, '2026-03-04', 'Garage', 'active'],
      ['Pool Pump', 'outdoor', 8.50, 1.11, '2026-03-05', 'Backyard', 'active'],
      ['Water Heater', 'water_heating', 12.00, 1.56, '2026-03-05', 'Utility Room', 'active'],
      ['Gaming PC', 'electronics', 4.80, 0.62, '2026-03-06', 'Basement', 'active'],
      ['Ceiling Fans', 'cooling', 1.20, 0.16, '2026-03-06', 'Bedrooms', 'active'],
      ['Garage Door Opener', 'garage', 0.30, 0.04, '2026-03-07', 'Garage', 'active'],
      ['Security System', 'security', 0.90, 0.12, '2026-03-07', 'Whole House', 'active'],
      ['Dehumidifier', 'climate', 2.80, 0.36, '2026-03-08', 'Basement', 'active'],
    ];
    for (const row of energyConsumption) {
      await client.query(
        `INSERT INTO energy_consumption (device_name, category, consumption_kwh, cost_usd, date_recorded, location, status) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        row
      );
    }
    console.log('Energy consumption seeded (15 records).');

    // Seed solar_panels (15 records)
    const solarPanels = [
      ['SunPower Maxeon 6 AC', 0.44, 0.38, 22.80, '2024-06-15', 'Roof - South', 'active'],
      ['LG NeON R Prime', 0.40, 0.34, 21.70, '2024-06-15', 'Roof - South', 'active'],
      ['REC Alpha Pure-R', 0.43, 0.36, 22.30, '2024-06-15', 'Roof - South', 'active'],
      ['Panasonic EverVolt HK', 0.41, 0.35, 21.60, '2024-07-01', 'Roof - East', 'active'],
      ['Canadian Solar HiHero', 0.44, 0.37, 22.50, '2024-07-01', 'Roof - East', 'active'],
      ['Q CELLS Q.PEAK DUO', 0.40, 0.33, 20.90, '2024-07-01', 'Roof - East', 'active'],
      ['Silfab Elite', 0.42, 0.35, 21.40, '2024-07-01', 'Roof - West', 'active'],
      ['Tesla Solar Panel', 0.43, 0.36, 21.50, '2024-08-10', 'Roof - West', 'active'],
      ['Trina Vertex S+', 0.44, 0.37, 22.10, '2024-08-10', 'Roof - West', 'active'],
      ['JA Solar DeepBlue 4.0', 0.42, 0.34, 21.00, '2024-08-10', 'Roof - South', 'active'],
      ['LONGi Hi-MO 7', 0.43, 0.36, 22.00, '2024-08-10', 'Roof - South', 'active'],
      ['Jinko Tiger Neo', 0.44, 0.37, 22.40, '2024-09-01', 'Carport', 'active'],
      ['Hanwha Q.PEAK DUO ML', 0.39, 0.31, 20.60, '2024-09-01', 'Carport', 'active'],
      ['Risen Titan S', 0.41, 0.33, 21.10, '2024-09-01', 'Ground Mount', 'active'],
      ['Astronergy ASTRO N7', 0.42, 0.35, 21.80, '2024-09-01', 'Ground Mount', 'active'],
    ];
    for (const row of solarPanels) {
      await client.query(
        `INSERT INTO solar_panels (panel_name, capacity_kw, current_output_kw, efficiency_pct, installation_date, location, status) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        row
      );
    }
    console.log('Solar panels seeded (15 records).');

    // Seed batteries (15 records)
    const batteries = [
      ['Tesla Powerwall 3', 13.50, 78.00, 11.50, 5.00, 97.50, 'active'],
      ['Tesla Powerwall 3 #2', 13.50, 82.00, 11.50, 5.00, 96.80, 'active'],
      ['Enphase IQ Battery 5P', 5.00, 65.00, 3.84, 3.84, 98.20, 'active'],
      ['Enphase IQ Battery 5P #2', 5.00, 90.00, 3.84, 3.84, 97.90, 'active'],
      ['Franklin WholePower', 13.60, 55.00, 10.00, 10.00, 95.00, 'active'],
      ['SonnenCore 2', 10.00, 70.00, 4.80, 4.80, 99.10, 'active'],
      ['LG RESU Prime', 16.00, 45.00, 7.00, 7.00, 94.50, 'active'],
      ['Generac PWRcell', 9.00, 88.00, 4.50, 4.50, 96.30, 'active'],
      ['BYD Battery-Box Premium', 12.80, 72.00, 5.12, 5.12, 98.00, 'active'],
      ['Panasonic EverVolt 2.0', 17.10, 60.00, 9.00, 9.00, 97.10, 'active'],
      ['SolarEdge Home Battery', 9.70, 85.00, 5.00, 5.00, 99.00, 'active'],
      ['EcoFlow Delta Pro Ultra', 6.00, 40.00, 3.60, 3.60, 93.80, 'active'],
      ['Bluetti EP900', 19.80, 50.00, 9.00, 9.00, 95.50, 'active'],
      ['SimpliPhi AccESS', 15.20, 68.00, 6.00, 6.00, 96.70, 'active'],
      ['Electriq PowerPod 2', 10.00, 75.00, 4.80, 4.80, 97.40, 'active'],
    ];
    for (const row of batteries) {
      await client.query(
        `INSERT INTO batteries (battery_name, capacity_kwh, current_charge_pct, charge_rate_kw, discharge_rate_kw, health_pct, status) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        row
      );
    }
    console.log('Batteries seeded (15 records).');

    // Seed utility_rates (15 records)
    const utilityRates = [
      ['Pacific Gas & Electric', 'Time-of-Use', 0.3850, '4pm-9pm', 0.2200, 'TOU-C', 'California - Bay Area', 'active'],
      ['Southern California Edison', 'Time-of-Use', 0.4100, '4pm-9pm', 0.2400, 'TOU-D-4-9', 'California - SoCal', 'active'],
      ['San Diego Gas & Electric', 'Time-of-Use', 0.4500, '4pm-9pm', 0.2800, 'TOU-DR', 'California - San Diego', 'active'],
      ['Con Edison', 'Flat Rate', 0.3200, 'N/A', 0.3200, 'Standard', 'New York - NYC', 'active'],
      ['ComEd', 'Real-Time Pricing', 0.1250, '1pm-7pm', 0.0850, 'RTP', 'Illinois - Chicago', 'active'],
      ['Duke Energy', 'Tiered Rate', 0.1180, '2pm-7pm', 0.0920, 'Residential', 'North Carolina', 'active'],
      ['Florida Power & Light', 'Flat Rate', 0.1350, 'N/A', 0.1350, 'Standard', 'Florida', 'active'],
      ['Xcel Energy', 'Time-of-Use', 0.1520, '2pm-6pm', 0.0980, 'TOU', 'Colorado', 'active'],
      ['Dominion Energy', 'Tiered Rate', 0.1280, '1pm-7pm', 0.0950, 'Schedule 1', 'Virginia', 'active'],
      ['National Grid', 'Flat Rate', 0.2850, 'N/A', 0.2850, 'Basic Service', 'Massachusetts', 'active'],
      ['Arizona Public Service', 'Time-of-Use', 0.1080, '3pm-8pm', 0.0650, 'Saver Choice', 'Arizona', 'active'],
      ['Georgia Power', 'Tiered Rate', 0.1200, '2pm-7pm', 0.0890, 'Schedule R', 'Georgia', 'active'],
      ['Puget Sound Energy', 'Flat Rate', 0.1150, 'N/A', 0.1150, 'Standard', 'Washington', 'active'],
      ['Eversource', 'Time-of-Use', 0.2980, '12pm-8pm', 0.1950, 'TOU Optional', 'Connecticut', 'active'],
      ['Austin Energy', 'Tiered Rate', 0.1050, '2pm-8pm', 0.0720, 'Value of Solar', 'Texas - Austin', 'active'],
    ];
    for (const row of utilityRates) {
      await client.query(
        `INSERT INTO utility_rates (provider_name, rate_type, rate_per_kwh, peak_hours, off_peak_rate, time_of_use, region, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        row
      );
    }
    console.log('Utility rates seeded (15 records).');

    // Seed ev_vehicles (15 records)
    const evVehicles = [
      ['Tesla Model 3 Long Range', 82.00, 65.00, 90.00, 11.50, '07:30', 'high', 'active'],
      ['Tesla Model Y Performance', 75.00, 45.00, 80.00, 11.50, '08:00', 'high', 'active'],
      ['Tesla Model S Plaid', 100.00, 80.00, 95.00, 19.20, '09:00', 'medium', 'active'],
      ['Ford F-150 Lightning', 131.00, 30.00, 85.00, 19.20, '06:00', 'high', 'active'],
      ['Rivian R1T Adventure', 135.00, 55.00, 90.00, 11.50, '07:00', 'medium', 'active'],
      ['Rivian R1S', 135.00, 70.00, 85.00, 11.50, '08:30', 'low', 'active'],
      ['Chevrolet Equinox EV', 85.00, 40.00, 80.00, 11.50, '07:00', 'high', 'active'],
      ['Hyundai Ioniq 6', 77.40, 58.00, 90.00, 10.90, '08:00', 'medium', 'active'],
      ['BMW iX xDrive50', 76.60, 72.00, 80.00, 11.00, '09:30', 'low', 'active'],
      ['Mercedes EQS 450+', 108.40, 50.00, 85.00, 11.00, '07:00', 'medium', 'active'],
      ['Kia EV9', 99.80, 35.00, 90.00, 11.50, '06:30', 'high', 'active'],
      ['Volkswagen ID.4 Pro S', 82.00, 88.00, 90.00, 11.00, '10:00', 'low', 'active'],
      ['Polestar 2 Long Range', 79.00, 62.00, 85.00, 11.00, '08:00', 'medium', 'active'],
      ['Lucid Air Grand Touring', 112.00, 25.00, 95.00, 19.20, '06:00', 'high', 'active'],
      ['Nissan Ariya Evolve+', 87.00, 47.00, 80.00, 7.40, '07:30', 'medium', 'active'],
    ];
    for (const row of evVehicles) {
      await client.query(
        `INSERT INTO ev_vehicles (vehicle_name, battery_capacity_kwh, current_charge_pct, target_charge_pct, charging_speed_kw, departure_time, priority, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        row
      );
    }
    console.log('EV vehicles seeded (15 records).');

    // Seed carbon_records (15 records)
    const carbonRecords = [
      ['Grid Electricity', 18.50, 6.20, 12.30, 'electricity', '2026-03-01', 'Daily grid consumption offset by solar', 'active'],
      ['Natural Gas Heating', 8.40, 0.00, 8.40, 'heating', '2026-03-01', 'Furnace usage for heating', 'active'],
      ['Solar Generation', 0.00, 22.50, -22.50, 'renewable', '2026-03-02', 'Full day solar production offset', 'active'],
      ['EV Charging (Grid)', 12.00, 4.00, 8.00, 'transportation', '2026-03-02', 'Tesla Model 3 charging session', 'active'],
      ['Water Heater', 5.20, 1.80, 3.40, 'water_heating', '2026-03-03', 'Gas water heater daily usage', 'active'],
      ['Cooking (Gas Range)', 1.80, 0.00, 1.80, 'cooking', '2026-03-03', 'Daily cooking emissions', 'active'],
      ['Grid Electricity', 15.30, 8.40, 6.90, 'electricity', '2026-03-04', 'Partly cloudy day, less solar offset', 'active'],
      ['Pool Heater', 3.60, 0.50, 3.10, 'recreation', '2026-03-04', 'Gas pool heater operation', 'active'],
      ['Solar Generation', 0.00, 25.00, -25.00, 'renewable', '2026-03-05', 'Clear sky maximum generation', 'active'],
      ['Generator Backup', 9.80, 0.00, 9.80, 'backup_power', '2026-03-05', 'Brief outage backup generator use', 'active'],
      ['EV Charging (Solar)', 0.00, 14.00, -14.00, 'transportation', '2026-03-06', 'Midday solar-powered EV charge', 'active'],
      ['Dryer (Gas)', 2.10, 0.00, 2.10, 'laundry', '2026-03-06', 'Two loads of laundry', 'active'],
      ['Grid Electricity', 20.00, 5.00, 15.00, 'electricity', '2026-03-07', 'Rainy day low solar production', 'active'],
      ['Fireplace (Gas)', 4.50, 0.00, 4.50, 'heating', '2026-03-07', 'Evening fireplace usage', 'active'],
      ['Solar Generation', 0.00, 18.00, -18.00, 'renewable', '2026-03-08', 'Partial cloud coverage day', 'active'],
    ];
    for (const row of carbonRecords) {
      await client.query(
        `INSERT INTO carbon_records (source, emission_kg, offset_kg, net_emission_kg, category, date_recorded, notes, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        row
      );
    }
    console.log('Carbon records seeded (15 records).');

    // Seed thermostats (15 records)
    const thermostats = [
      ['Living Room', 72.5, 72.0, 'cooling', 45.0, true, '06:00', '22:00', 'active'],
      ['Master Bedroom', 70.0, 68.0, 'cooling', 42.0, true, '21:00', '07:00', 'active'],
      ['Kids Bedroom 1', 71.0, 70.0, 'auto', 44.0, true, '20:00', '07:30', 'active'],
      ['Kids Bedroom 2', 72.0, 70.0, 'auto', 43.0, false, '20:00', '07:30', 'active'],
      ['Guest Bedroom', 74.0, 72.0, 'off', 40.0, false, '08:00', '22:00', 'active'],
      ['Kitchen', 73.5, 72.0, 'cooling', 48.0, true, '05:30', '21:00', 'active'],
      ['Home Office', 71.0, 70.0, 'cooling', 41.0, true, '08:00', '18:00', 'active'],
      ['Basement', 68.0, 66.0, 'heating', 55.0, false, '10:00', '20:00', 'active'],
      ['Garage', 62.0, 60.0, 'off', 35.0, false, '00:00', '00:00', 'active'],
      ['Dining Room', 73.0, 72.0, 'cooling', 44.0, true, '06:00', '22:00', 'active'],
      ['Family Room', 72.0, 71.0, 'auto', 46.0, true, '07:00', '23:00', 'active'],
      ['Sunroom', 78.0, 74.0, 'cooling', 38.0, false, '09:00', '18:00', 'active'],
      ['Hallway Upper', 71.5, 72.0, 'auto', 43.0, false, '06:00', '22:00', 'active'],
      ['Laundry Room', 74.0, 72.0, 'off', 52.0, false, '08:00', '20:00', 'active'],
      ['Attic Studio', 76.0, 72.0, 'cooling', 36.0, true, '09:00', '17:00', 'active'],
    ];
    for (const row of thermostats) {
      await client.query(
        `INSERT INTO thermostats (zone_name, current_temp_f, target_temp_f, mode, humidity_pct, occupancy, schedule_start, schedule_end, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        row
      );
    }
    console.log('Thermostats seeded (15 records).');

    // Seed appliances (15 records)
    const appliances = [
      ['French Door Refrigerator', 'Samsung', 'RF28T5001SR', 'A++', 648.00, 3, 'kitchen', 2899.00, 'active'],
      ['Front-Load Washer', 'LG', 'WM4000HWA', 'A+++', 120.00, 2, 'laundry', 1049.00, 'active'],
      ['Heat Pump Dryer', 'Whirlpool', 'WED5000DW', 'A++', 475.00, 4, 'laundry', 899.00, 'active'],
      ['Dishwasher', 'Bosch', 'SHPM88Z75N', 'A+++', 270.00, 1, 'kitchen', 1249.00, 'active'],
      ['Induction Range', 'GE Profile', 'PHS930YPFS', 'A+', 520.00, 2, 'kitchen', 2499.00, 'active'],
      ['Microwave Oven', 'Panasonic', 'NN-SN966S', 'B', 95.00, 5, 'kitchen', 229.00, 'active'],
      ['Central Air Conditioner', 'Carrier', 'Infinity 24ANB1', 'A+++', 2400.00, 6, 'whole_house', 5800.00, 'active'],
      ['Gas Furnace', 'Trane', 'XR95', 'A+', 1200.00, 8, 'whole_house', 3500.00, 'active'],
      ['Water Heater', 'Rheem', 'PROPH50 T2 RH375', 'A+', 1825.00, 5, 'utility', 1599.00, 'active'],
      ['Chest Freezer', 'GE', 'FCM7SKWW', 'A+', 310.00, 7, 'garage', 549.00, 'active'],
      ['Dehumidifier', 'Frigidaire', 'FFAD5033W1', 'B+', 620.00, 3, 'basement', 329.00, 'active'],
      ['Pool Pump', 'Pentair', 'IntelliFlo VSF', 'A++', 1500.00, 4, 'outdoor', 1799.00, 'active'],
      ['Wine Cooler', 'NewAir', 'NWC033SS01', 'C', 160.00, 2, 'kitchen', 449.00, 'active'],
      ['Robot Vacuum', 'iRobot', 'Roomba j7+', 'A', 28.00, 1, 'whole_house', 599.00, 'active'],
      ['Air Purifier', 'Dyson', 'Purifier Cool TP07', 'A', 40.00, 1, 'living_room', 569.00, 'active'],
    ];
    for (const row of appliances) {
      await client.query(
        `INSERT INTO appliances (appliance_name, brand, model, energy_rating, annual_consumption_kwh, age_years, category, replacement_cost, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        row
      );
    }
    console.log('Appliances seeded (15 records).');

    // Seed devices (15 records)
    const devices = [
      ['Ecobee Smart Thermostat', 'thermostat', 'Ecobee', '192.168.1.10', '4.8.7.2', 'Living Room', 3.50, true, 'active'],
      ['Ring Video Doorbell Pro 2', 'doorbell_camera', 'Ring', '192.168.1.11', '3.52.18', 'Front Door', 4.20, true, 'active'],
      ['Lutron Caseta Dimmer', 'smart_switch', 'Lutron', '192.168.1.12', '10.2.1', 'Master Bedroom', 0.50, true, 'active'],
      ['TP-Link Kasa Smart Plug', 'smart_plug', 'TP-Link', '192.168.1.13', '1.1.4', 'Office', 2.50, true, 'active'],
      ['Arlo Pro 4 Camera', 'security_camera', 'Arlo', '192.168.1.14', '2.4.6_278', 'Backyard', 5.80, true, 'active'],
      ['August Wi-Fi Smart Lock', 'smart_lock', 'August', '192.168.1.15', '4.4.0', 'Front Door', 3.00, false, 'active'],
      ['Sonos Era 300', 'smart_speaker', 'Sonos', '192.168.1.16', '16.1', 'Living Room', 6.00, true, 'active'],
      ['Philips Hue Bridge', 'hub', 'Philips', '192.168.1.17', '1.60.1960149080', 'Utility Closet', 2.00, true, 'active'],
      ['Samsung SmartThings Hub', 'hub', 'Samsung', '192.168.1.18', '0.48.12', 'Office', 2.50, true, 'active'],
      ['Emporia Vue Gen 2', 'energy_monitor', 'Emporia', '192.168.1.19', '2.10.0', 'Electrical Panel', 1.20, true, 'active'],
      ['Rachio 3 Sprinkler', 'irrigation_controller', 'Rachio', '192.168.1.20', '4.0.942', 'Garage', 1.80, true, 'active'],
      ['myQ Smart Garage', 'garage_controller', 'Chamberlain', '192.168.1.21', '5.227.1.65028', 'Garage', 3.20, true, 'active'],
      ['Eve Room Sensor', 'air_quality_sensor', 'Eve', '192.168.1.22', '2.2.4', 'Kids Bedroom', 0.80, true, 'active'],
      ['Wyze Cam v3 Pro', 'security_camera', 'Wyze', '192.168.1.23', '4.36.11.7396', 'Driveway', 4.50, true, 'active'],
      ['Shelly Plus 1PM', 'smart_relay', 'Shelly', '192.168.1.24', '1.0.8', 'Laundry Room', 1.00, true, 'active'],
    ];
    for (const row of devices) {
      await client.query(
        `INSERT INTO devices (device_name, device_type, manufacturer, ip_address, firmware_version, room, power_consumption_w, is_online, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        row
      );
    }
    console.log('Devices seeded (15 records).');

    // Seed billing_records (15 records)
    const billingRecords = [
      ['January 2026', 'Pacific Gas & Electric', 245.80, 1890.00, '2026-02-15', 'paid', 'autopay', 'Includes baseline credit', 'active'],
      ['February 2026', 'Pacific Gas & Electric', 218.50, 1680.00, '2026-03-15', 'paid', 'autopay', 'Lower heating usage', 'active'],
      ['March 2026', 'Pacific Gas & Electric', 195.20, 1502.00, '2026-04-15', 'pending', 'autopay', 'Solar offset increasing', 'active'],
      ['January 2026', 'City Water & Sewer', 85.40, null, '2026-02-10', 'paid', 'credit_card', 'Water and sewer combined', 'active'],
      ['February 2026', 'City Water & Sewer', 78.90, null, '2026-03-10', 'paid', 'credit_card', null, 'active'],
      ['March 2026', 'City Water & Sewer', 82.10, null, '2026-04-10', 'pending', 'credit_card', null, 'active'],
      ['January 2026', 'SoCalGas', 120.50, 850.00, '2026-02-12', 'paid', 'bank_transfer', 'High heating month', 'active'],
      ['February 2026', 'SoCalGas', 98.30, 695.00, '2026-03-12', 'paid', 'bank_transfer', null, 'active'],
      ['March 2026', 'SoCalGas', 72.40, 512.00, '2026-04-12', 'pending', 'bank_transfer', 'Warmer weather', 'active'],
      ['Q1 2026', 'Tesla Solar Lease', 150.00, null, '2026-03-01', 'paid', 'autopay', 'Quarterly solar panel lease', 'active'],
      ['January 2026', 'ChargePoint Home', 62.30, 480.00, '2026-02-08', 'paid', 'credit_card', 'EV charging at home', 'active'],
      ['February 2026', 'ChargePoint Home', 55.80, 430.00, '2026-03-08', 'paid', 'credit_card', 'Fewer commute days', 'active'],
      ['March 2026', 'ChargePoint Home', 48.90, 376.00, '2026-04-08', 'pending', 'credit_card', null, 'active'],
      ['Annual 2026', 'Home Warranty Co.', 600.00, null, '2026-01-15', 'paid', 'credit_card', 'Annual appliance warranty', 'active'],
      ['January 2026', 'Vivint Smart Home', 45.99, null, '2026-02-01', 'paid', 'autopay', 'Security monitoring service', 'active'],
    ];
    for (const row of billingRecords) {
      await client.query(
        `INSERT INTO billing_records (billing_period, provider, amount_usd, kwh_used, due_date, payment_status, payment_method, notes, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        row
      );
    }
    console.log('Billing records seeded (15 records).');

    // Seed maintenance_tasks (15 records)
    const maintenanceTasks = [
      ['Central HVAC System', 'filter_replacement', 'Replace MERV-13 air filters in all return vents', '2026-04-01', null, 'high', 'HVAC Pro Services', 85.00, 'pending'],
      ['Solar Panel Array', 'cleaning', 'Annual solar panel cleaning and inspection', '2026-04-15', null, 'medium', 'SunClean LLC', 350.00, 'pending'],
      ['Tesla Powerwall 3', 'firmware_update', 'Schedule Tesla firmware update v24.8.1', '2026-03-25', null, 'low', 'Self', 0.00, 'pending'],
      ['Pool Pump', 'inspection', 'Inspect seals and impeller for wear', '2026-05-01', null, 'medium', 'Pool Masters Inc', 150.00, 'pending'],
      ['Water Heater', 'anode_rod_check', 'Check and replace anode rod if corroded', '2026-04-10', null, 'medium', 'Roto-Rooter', 220.00, 'pending'],
      ['Ecobee Thermostat', 'calibration', 'Recalibrate temperature sensors in all zones', '2026-03-20', '2026-03-20', 'low', 'Self', 0.00, 'completed'],
      ['Ring Doorbell Pro 2', 'battery_replacement', 'Replace rechargeable battery pack', '2026-03-15', '2026-03-15', 'medium', 'Self', 29.99, 'completed'],
      ['Rachio Sprinkler', 'winterization', 'Spring system startup and leak check', '2026-04-05', null, 'high', 'Green Lawn Services', 120.00, 'pending'],
      ['Gas Furnace', 'annual_service', 'Annual furnace tune-up and safety inspection', '2026-10-01', null, 'high', 'HVAC Pro Services', 180.00, 'pending'],
      ['EV Charger', 'electrical_inspection', 'Inspect 240V outlet and wiring connections', '2026-06-01', null, 'medium', 'Spark Electric', 95.00, 'pending'],
      ['Arlo Camera', 'firmware_update', 'Update firmware on all Arlo cameras', '2026-03-18', '2026-03-18', 'low', 'Self', 0.00, 'completed'],
      ['Philips Hue Bridge', 'network_optimization', 'Optimize Zigbee mesh network for new devices', '2026-04-20', null, 'low', 'Self', 0.00, 'pending'],
      ['Roof Insulation', 'inspection', 'Inspect attic insulation R-value and gaps', '2026-05-15', null, 'medium', 'InsulPro Contractors', 75.00, 'pending'],
      ['Garage Door Opener', 'lubrication', 'Lubricate tracks, rollers, and springs', '2026-04-08', null, 'low', 'Self', 15.00, 'pending'],
      ['Whole House Fan', 'belt_inspection', 'Inspect and replace drive belt if worn', '2026-05-20', null, 'medium', 'Self', 35.00, 'pending'],
    ];
    for (const row of maintenanceTasks) {
      await client.query(
        `INSERT INTO maintenance_tasks (device_name, task_type, description, scheduled_date, completed_date, priority, assigned_to, cost_usd, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        row
      );
    }
    console.log('Maintenance tasks seeded (15 records).');

    // Seed energy_goals (15 records)
    const energyGoals = [
      ['Reduce Monthly Electricity', 1500.00, 1680.00, 'kWh', 'electricity', '2026-01-01', '2026-12-31', 12.00, 'active'],
      ['Solar Self-Sufficiency', 80.00, 62.00, 'percent', 'solar', '2026-01-01', '2026-12-31', 77.50, 'active'],
      ['Carbon Neutral Home', 0.00, 85.00, 'kg_co2_per_month', 'carbon', '2026-01-01', '2026-12-31', 35.00, 'active'],
      ['Peak Demand Reduction', 8.00, 11.20, 'kW', 'demand', '2026-01-01', '2026-06-30', 28.60, 'active'],
      ['EV Solar Charging', 90.00, 58.00, 'percent', 'ev_charging', '2026-03-01', '2026-09-30', 64.40, 'active'],
      ['Annual Energy Savings', 3000.00, 820.00, 'USD', 'cost_savings', '2026-01-01', '2026-12-31', 27.30, 'active'],
      ['Battery Utilization', 85.00, 68.00, 'percent', 'battery', '2026-01-01', '2026-06-30', 80.00, 'active'],
      ['Appliance Efficiency Upgrade', 5.00, 2.00, 'appliances', 'efficiency', '2026-01-01', '2026-12-31', 40.00, 'active'],
      ['Water Heating Electrification', 100.00, 0.00, 'percent', 'electrification', '2026-06-01', '2026-12-31', 0.00, 'active'],
      ['Smart Home Device Coverage', 20.00, 15.00, 'devices', 'automation', '2026-01-01', '2026-06-30', 75.00, 'active'],
      ['Off-Peak Usage Shift', 70.00, 52.00, 'percent', 'load_shifting', '2026-01-01', '2026-12-31', 74.30, 'active'],
      ['Monthly Gas Reduction', 400.00, 512.00, 'therms', 'gas', '2026-01-01', '2026-12-31', 22.00, 'active'],
      ['Grid Export Target', 500.00, 185.00, 'kWh_per_month', 'solar_export', '2026-03-01', '2026-09-30', 37.00, 'active'],
      ['HVAC Runtime Reduction', 6.00, 8.50, 'hours_per_day', 'hvac', '2026-04-01', '2026-10-31', 29.40, 'active'],
      ['Lighting LED Conversion', 100.00, 85.00, 'percent', 'lighting', '2026-01-01', '2026-06-30', 85.00, 'active'],
    ];
    for (const row of energyGoals) {
      await client.query(
        `INSERT INTO energy_goals (goal_name, target_value, current_value, unit, category, start_date, end_date, progress_pct, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        row
      );
    }
    console.log('Energy goals seeded (15 records).');

    // Seed notifications (15 records)
    const notifications = [
      ['Peak Rate Period Starting', 'Electricity peak rates begin at 4:00 PM. Consider shifting heavy loads to off-peak hours.', 'warning', 'high', false, 'Utility Rate Monitor', '/dashboard/rates'],
      ['Solar Production Milestone', 'Your solar panels generated 50 kWh today - a new daily record!', 'info', 'low', true, 'Solar Monitor', '/dashboard/solar'],
      ['Battery Fully Charged', 'Tesla Powerwall 3 has reached 100% charge. Ready for peak shaving.', 'info', 'medium', true, 'Battery Manager', '/dashboard/battery'],
      ['HVAC Filter Due', 'HVAC air filter replacement is overdue by 5 days. Schedule maintenance.', 'alert', 'high', false, 'Maintenance Scheduler', '/maintenance'],
      ['EV Charging Complete', 'Tesla Model 3 Long Range has reached target charge of 90%.', 'info', 'medium', true, 'EV Charger', '/dashboard/ev'],
      ['Unusual Energy Spike', 'Energy consumption spiked 40% above normal at 2:15 PM. Check connected devices.', 'alert', 'high', false, 'Anomaly Detector', '/dashboard/consumption'],
      ['Monthly Report Ready', 'Your February 2026 energy usage report is ready to view.', 'info', 'low', true, 'Report Generator', '/reports/february-2026'],
      ['Thermostat Schedule Conflict', 'Guest Bedroom thermostat is running outside scheduled hours.', 'warning', 'medium', false, 'Thermostat Manager', '/dashboard/thermostats'],
      ['Firmware Update Available', 'Ecobee Smart Thermostat has a new firmware update (v4.8.8.0).', 'info', 'low', false, 'Device Manager', '/devices'],
      ['Grid Outage Detected', 'Grid power loss detected. Switching to battery backup automatically.', 'alert', 'high', false, 'Grid Monitor', '/dashboard/battery'],
      ['Energy Goal Progress', 'You are 77.5% toward your Solar Self-Sufficiency goal. Keep it up!', 'info', 'low', true, 'Goals Tracker', '/goals'],
      ['Bill Payment Reminder', 'PG&E bill of $195.20 is due on April 15, 2026.', 'warning', 'medium', false, 'Billing Manager', '/billing'],
      ['Device Offline', 'August Wi-Fi Smart Lock (Front Door) has gone offline. Check connection.', 'alert', 'high', false, 'Device Monitor', '/devices'],
      ['Carbon Offset Achievement', 'Net negative carbon day achieved! Solar offset exceeded all emissions.', 'info', 'low', true, 'Carbon Tracker', '/dashboard/carbon'],
      ['Water Heater Efficiency Drop', 'Water heater efficiency has decreased 12% over the past month. Consider maintenance.', 'warning', 'medium', false, 'Efficiency Monitor', '/maintenance'],
    ];
    for (const row of notifications) {
      await client.query(
        `INSERT INTO notifications (title, message, type, priority, is_read, source, action_url) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        row
      );
    }
    console.log('Notifications seeded (15 records).');

    // Seed usage_reports (15 records)
    const usageReports = [
      ['January 2026 Monthly Report', 'monthly', '2026-01-01', '2026-01-31', 1890.00, 245.80, 680.00, 156.50, 'active'],
      ['February 2026 Monthly Report', 'monthly', '2026-02-01', '2026-02-28', 1680.00, 218.50, 820.00, 132.40, 'active'],
      ['March 2026 Monthly Report', 'monthly', '2026-03-01', '2026-03-31', 1502.00, 195.20, 1050.00, 98.20, 'active'],
      ['Q1 2026 Quarterly Report', 'quarterly', '2026-01-01', '2026-03-31', 5072.00, 659.50, 2550.00, 387.10, 'active'],
      ['Week 1 March 2026', 'weekly', '2026-03-01', '2026-03-07', 385.00, 50.05, 280.00, 24.50, 'active'],
      ['Week 2 March 2026', 'weekly', '2026-03-08', '2026-03-14', 362.00, 47.06, 310.00, 21.80, 'active'],
      ['Week 3 March 2026', 'weekly', '2026-03-15', '2026-03-20', 298.00, 38.74, 295.00, 18.40, 'active'],
      ['January 2026 Solar Report', 'solar_monthly', '2026-01-01', '2026-01-31', 0.00, 0.00, 680.00, -88.40, 'active'],
      ['February 2026 Solar Report', 'solar_monthly', '2026-02-01', '2026-02-28', 0.00, 0.00, 820.00, -106.60, 'active'],
      ['March 2026 Solar Report', 'solar_monthly', '2026-03-01', '2026-03-31', 0.00, 0.00, 1050.00, -136.50, 'active'],
      ['January 2026 EV Report', 'ev_monthly', '2026-01-01', '2026-01-31', 480.00, 62.30, 140.00, 44.20, 'active'],
      ['February 2026 EV Report', 'ev_monthly', '2026-02-01', '2026-02-28', 430.00, 55.80, 185.00, 31.85, 'active'],
      ['March 2026 EV Report', 'ev_monthly', '2026-03-01', '2026-03-31', 376.00, 48.90, 210.00, 21.58, 'active'],
      ['2025 Annual Summary', 'annual', '2025-01-01', '2025-12-31', 19800.00, 2574.00, 8200.00, 1506.00, 'active'],
      ['Year-to-Date 2026', 'ytd', '2026-01-01', '2026-03-20', 5072.00, 659.50, 2550.00, 387.10, 'active'],
    ];
    for (const row of usageReports) {
      await client.query(
        `INSERT INTO usage_reports (report_name, report_type, period_start, period_end, total_consumption_kwh, total_cost_usd, total_solar_kwh, total_carbon_kg, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        row
      );
    }
    console.log('Usage reports seeded (15 records).');

    console.log('\nAll seed data inserted successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
    console.log('Database connection closed.');
  }
}

seed();
