const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'backend/database/migrations/003_add_missing_delivery_columns.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log('✓ Executed:', statement.substring(0, 60) + '...');
      } catch (err) {
        console.error('✗ Error:', err.message);
        console.error('  Statement:', statement.substring(0, 100) + '...');
      }
    }

    console.log('\n✅ Migration 003 completed successfully');
    
  } catch (error) {
    console.error('Connection error:', error.message);
  } finally {
    await client.end();
  }
}

runMigration();
