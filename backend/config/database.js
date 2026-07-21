const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { databaseUrl } = require('./security');

const pool = new Pool({
  connectionString: databaseUrl,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
