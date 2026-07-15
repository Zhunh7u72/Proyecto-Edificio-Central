require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'FEUE',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123',
});

async function run() {
  try {
    await pool.query('ALTER TABLE actividades ADD COLUMN mostrar_fecha BOOLEAN DEFAULT true');
    console.log('Column mostrar_fecha added successfully.');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Column already exists.');
    } else {
      console.error('Error:', err.message);
    }
  } finally {
    pool.end();
  }
}

run();
