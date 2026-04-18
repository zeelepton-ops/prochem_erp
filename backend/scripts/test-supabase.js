#!/usr/bin/env node

const pgp = require('pg-promise')();
require('dotenv').config();

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbSSL = process.env.DB_SSL === 'require';

console.log('🔍 Testing Supabase Connection...\n');
console.log('Connection Details:');
console.log(`  Host: ${dbHost}`);
console.log(`  Port: ${dbPort}`);
console.log(`  Database: ${dbName}`);
console.log(`  User: ${dbUser}`);
console.log(`  SSL: ${dbSSL ? 'required' : 'disabled'}\n`);

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
    // Test connection
    console.log('🔗 Attempting connection...');
    const result = await db.one('SELECT NOW() as current_time');
    console.log('✅ Connection successful!\n');
    console.log('Current database time:', result.current_time);

    // Check tables
    console.log('\n📊 Checking for tables...');
    const tables = await db.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tables.length === 0) {
      console.log('❌ No tables found in database');
      console.log('\n📋 Running migrations...');
      
      const fs = require('fs');
      const path = require('path');
      const migrationFile = path.join(__dirname, '../database/migrations/001_initial_schema.sql');
      const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
      
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      let successCount = 0;
      for (let i = 0; i < statements.length; i++) {
        try {
          await db.none(statements[i]);
          successCount++;
        } catch (err) {
          if (!err.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1}: ${err.message.split('\n')[0]}`);
          }
        }
      }

      console.log(`✅ Migration complete: ${successCount}/${statements.length} statements\n`);

      // Get updated table list
      const newTables = await db.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);

      console.log(`📊 Created ${newTables.length} tables:`);
      newTables.forEach(row => console.log(`   ✓ ${row.table_name}`));
    } else {
      console.log(`✅ Found ${tables.length} tables:`);
      tables.forEach(row => console.log(`   ✓ ${row.table_name}`));
    }

    // Check admin user
    console.log('\n🔐 Checking admin user...');
    const adminUser = await db.oneOrNone(
      "SELECT id, email, role FROM users WHERE email = 'admin@bmm.local'"
    );

    if (adminUser) {
      console.log(`✅ Admin user found: ${adminUser.email} (${adminUser.role})`);
    } else {
      console.log('❌ Admin user not found');
    }

    console.log('\n✅ Supabase setup complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\nMake sure:');
    console.error('  1. Your Supabase project is running');
    console.error('  2. Credentials in backend/.env are correct');
    console.error('  3. Database host is accessible from your network\n');
    process.exit(1);
  } finally {
    pgp.end();
  }
})();
