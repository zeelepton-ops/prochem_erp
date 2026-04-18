# 🚀 Local PostgreSQL Setup Guide (Windows)

## Step 1: Download PostgreSQL

1. Visit: https://www.postgresql.org/download/windows/
2. Click **"Download the installer"**
3. Download **PostgreSQL 16** (latest stable)

## Step 2: Install PostgreSQL

1. Run the installer
2. Choose installation path (default is fine)
3. **Set a password for the `postgres` user** - remember this!
4. Keep default port: **5432**
5. Choose locale: **Default locale**
6. Click **Finish**

⚠️ **DO NOT install Stack Builder at the end** - just click Next or Finish

## Step 3: Verify Installation

Open PowerShell and run:

```powershell
psql --version
```

You should see: `psql (PostgreSQL) 16.x` ✅

## Step 4: Initialize Database

Run this command in the `backend` folder:

```bash
npm run db:setup
```

You'll be prompted to enter the PostgreSQL `postgres` password you set during installation.

This script will:
- ✅ Create `bmm_user` user
- ✅ Create `bmm_db` database  
- ✅ Grant all privileges
- ✅ Enable required extensions

## Step 5: Run Database Migrations

```bash
npm run db:migrate
```

This creates all 25 database tables with proper relationships.

## Step 6: Verify Everything Works

```bash
# Start backend
npm run dev

# In another terminal, start frontend
cd ../frontend
npm run dev
```

Then:
1. Open http://localhost:3000
2. Click "Sign In"
3. Enter credentials:
   - **Email**: `admin@bmm.local`
   - **Password**: `admin123`
4. Click "Sign In"

✅ You should see the **Dashboard** with all modules!

---

## Troubleshooting

### Error: "psql: command not found"

PostgreSQL `bin` folder is not in your PATH.

**Fix:**
1. Press `Win + X` → Search for **"Environment Variables"**
2. Click **"Edit the system environment variables"**
3. Click **"Environment Variables..."**
4. Under "User variables" or "System variables", click **"New"**
5. Variable name: `PATH`
6. Variable value: `C:\Program Files\PostgreSQL\16\bin`
7. Click **OK** three times
8. Restart PowerShell

### Error: "database already exists"

The database was already created.

**Fix:**
```bash
npm run db:migrate
```

Just run migrations - it will work fine.

### Error: "connection refused"

PostgreSQL is not running.

**Fix:**
1. Press `Win + R`
2. Type `services.msc`
3. Find **"postgresql-x64-16"**
4. Right-click → **"Start"**

### Error: "role already exists"

User already created.

**Fix:**
```bash
npm run db:migrate
```

Run migrations - it will skip duplicate roles.

---

## Database Connection Details

After setup, your backend connects with:

```
Host:     localhost
Port:     5432
Database: bmm_db
User:     bmm_user
Password: secure_password_here
```

This is configured in `backend/.env`.

---

## Next: Switch to Supabase (Free & Online)

Once you have local setup working, you can easily switch to **Supabase** for production.

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for instructions.

---

## Quick Commands Reference

```bash
# Initial setup (one-time)
npm run db:setup

# Run migrations (creates tables)
npm run db:migrate

# Start backend
npm run dev

# Start frontend
cd ../frontend && npm run dev

# Check PostgreSQL version
psql --version

# Connect to database directly
psql -U bmm_user -d bmm_db -h localhost
```
