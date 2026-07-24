const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function provisionDemoUser() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Local demo user provisioning is forbidden in production');
  }
  if (process.env.ENABLE_DEMO_CREDENTIAL_AUTOFILL !== 'true') {
    throw new Error('Set ENABLE_DEMO_CREDENTIAL_AUTOFILL=true to provision the local demo user');
  }

  const email = String(process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.SEED_ADMIN_PASSWORD || '');
  if (!email) throw new Error('SEED_ADMIN_EMAIL is required');
  if (password.length < 12) throw new Error('SEED_ADMIN_PASSWORD must contain at least 12 characters');

  const table = await pool.query("SELECT to_regclass('public.users') AS users_table");
  if (!table.rows[0].users_table) {
    throw new Error('Database schema is missing; initialize the database before provisioning the demo user');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `INSERT INTO users (email, password, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE
       SET password = EXCLUDED.password,
           name = EXCLUDED.name
     RETURNING id, email`,
    [email, passwordHash, 'Local Demo Admin']
  );
  console.log(`Local demo user provisioned: ${rows[0].email}`);
}

provisionDemoUser()
  .catch((error) => {
    console.error(`Demo user provisioning failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
