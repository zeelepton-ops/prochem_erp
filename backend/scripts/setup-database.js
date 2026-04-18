#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const dbHost = 'localhost';
const dbPort = 5432;
const dbName = 'bmm_db';
const dbUser = 'bmm_user';
const dbPassword = 'secure_password_here';

console.log('📝 PostgreSQL Database Setup for Windows');
console.log('=========================================\n');

rl.question('Enter PostgreSQL "postgres" user password: ', (postgresPassword) => {
  rl.close();

  const env = {
    ...process.env,
    PGPASSWORD: postgresPassword,
  };

  console.log('\n🔄 Setting up database...');

  // Step 1: Create user
  console.log('1️⃣  Creating database user...');
  const createUserCmd = spawn('psql', [
    '-U', 'postgres',
    '-h', dbHost,
    '-p', dbPort,
    '-c', `CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}';`,
  ], { env });

  createUserCmd.on('close', (code) => {
    if (code !== 0 && code !== 1) {
      // Code 1 might mean user already exists, which is OK
      console.error('❌ Failed to create user');
      process.exit(1);
    }

    // Step 2: Create database
    console.log('2️⃣  Creating database...');
    const createDbCmd = spawn('psql', [
      '-U', 'postgres',
      '-h', dbHost,
      '-p', dbPort,
      '-c', `CREATE DATABASE ${dbName} OWNER ${dbUser};`,
    ], { env });

    createDbCmd.on('close', (code) => {
      if (code !== 0 && code !== 1) {
        console.error('❌ Failed to create database');
        process.exit(1);
      }

      // Step 3: Grant privileges
      console.log('3️⃣  Granting privileges...');
      const grantCmd = spawn('psql', [
        '-U', 'postgres',
        '-h', dbHost,
        '-p', dbPort,
        '-c', `GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};`,
      ], { env });

      grantCmd.on('close', (code) => {
        if (code !== 0) {
          console.error('❌ Failed to grant privileges');
          process.exit(1);
        }

        // Step 4: Enable extensions
        console.log('4️⃣  Enabling extensions...');
        env.PGPASSWORD = dbPassword;

        const extCmd = spawn('psql', [
          '-U', dbUser,
          '-d', dbName,
          '-h', dbHost,
          '-p', dbPort,
          '-c', 'CREATE EXTENSION IF NOT EXISTS uuid-ossp; CREATE EXTENSION IF NOT EXISTS pgcrypto;',
        ], { env });

        extCmd.on('close', (code) => {
          if (code === 0) {
            console.log('\n✅ Database setup complete!');
            console.log('\n📋 Next steps:');
            console.log('   1. Restart backend: npm run dev');
            console.log('   2. Run migrations: npm run db:migrate');
            console.log('   3. Test login: http://localhost:3000');
            console.log('   4. Credentials: admin@bmm.local / admin123\n');
          } else {
            console.error('⚠️  Database setup completed but with warnings');
          }
          process.exit(code);
        });
      });
    });
  });
});
