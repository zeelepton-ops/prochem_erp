#!/usr/bin/env node

const pgp = require('pg-promise')();
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = pgp({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.none(
      `INSERT INTO users (email, password, first_name, last_name, role, department, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (email) DO NOTHING`,
      ['admin@bmm.local', hashedPassword, 'System', 'Administrator', 'admin', 'Management', true]
    );
    console.log('✅ Admin user created: admin@bmm.local');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    pgp.end();
  }
})();
