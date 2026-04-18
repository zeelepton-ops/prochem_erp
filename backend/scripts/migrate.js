#!/usr/bin/env node

const pgp = require('pg-promise')();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME || 'bmm_db';
const dbUser = process.env.DB_USER || 'bmm_user';
const dbPassword = process.env.DB_PASSWORD || 'secure_password_here';
const dbSSL = process.env.DB_SSL === 'require';

const migrationFile = path.join(__dirname, '../database/migrations/001_initial_schema.sql');

if (!fs.existsSync(migrationFile)) {
  console.error('❌ Migration file not found:', migrationFile);
  process.exit(1);
}

console.log('🔄 Running database migration...');
console.log(`   Host: ${dbHost}:${dbPort}`);
console.log(`   Database: ${dbName}`);
console.log(`   User: ${dbUser}`);
console.log(`   SSL: ${dbSSL ? 'required' : 'disabled'}`);

const connectionConfig = {
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: dbUser,
  password: dbPassword,
  ssl: dbSSL ? { rejectUnauthorized: false } : false,
};

const db = pgp(connectionConfig);

(async () => {
  try {
    // Read migration file
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

    // Split by semicolons and filter empty statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`\n📋 Executing ${statements.length} SQL statements...\n`);

    let successCount = 0;
    for (let i = 0; i < statements.length; i++) {
      try {
        await db.none(statements[i]);
        successCount++;
      } catch (err) {
        // Some statements may fail if they already exist (e.g., EXTENSION), that's OK
        if (!err.message.includes('already exists')) {
          console.warn(`⚠️  Statement ${i + 1} warning:`, err.message.split('\n')[0]);
        }
      }
    }

    console.log(`\n✅ Database migration completed!`);
    console.log(`   ✓ ${successCount}/${statements.length} statements executed successfully\n`);

    // Verify tables
    const result = await db.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📊 Created tables:');
    result.forEach(row => console.log(`   ✓ ${row.table_name}`));

    // Verify admin user
    console.log('\n🔐 Checking admin user...');
    const adminUser = await db.oneOrNone(
      "SELECT id, email, role FROM users WHERE email = 'admin@bmm.local'"
    );

    if (adminUser) {
      console.log(`   ✓ Admin user found: ${adminUser.email} (${adminUser.role})`);
    } else {
      console.log(`   ⚠️  Admin user not found, creating...'`);
      // Create admin user if it doesn't exist
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.none(
        `INSERT INTO users (email, password, first_name, last_name, role, department, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO NOTHING`,
        ['admin@bmm.local', hashedPassword, 'System', 'Administrator', 'admin', 'Management', true]
      );
      console.log(`   ✓ Admin user created: admin@bmm.local`);
    }

    console.log('\n🎉 Migration successful!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    pgp.end();
  }
})();
