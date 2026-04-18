# Database Setup Guide

## Quick Start - 3 Options

### Option 1: **Supabase Cloud (Recommended - Free Tier)**

Fastest way to get a production-ready database online.

#### Steps:
1. Go to https://supabase.com
2. Click "Start your project for free"
3. Sign up with GitHub or email
4. Create a new project
5. Wait for provisioning (~2 minutes)
6. Copy the connection string from Settings > Database

#### Update Backend .env:
```env
DB_HOST=your-project.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=require
```

---

### Option 2: **Local PostgreSQL (Windows)**

#### Installation:
1. Download PostgreSQL 16 from: https://www.postgresql.org/download/windows/
2. Run installer
3. Remember the password you set for `postgres` user
4. Keep default port 5432
5. Skip Stack Builder at the end

#### Configuration:
```bash
# After installation, open PowerShell as Administrator
$env:PGPASSWORD='your_password'
psql -U postgres

# In psql terminal:
CREATE USER bmm_user WITH PASSWORD 'secure_password_here';
CREATE DATABASE bmm_db OWNER bmm_user;
GRANT ALL PRIVILEGES ON DATABASE bmm_db TO bmm_user;
\q
```

#### Update Backend .env:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bmm_db
DB_USER=bmm_user
DB_PASSWORD=secure_password_here
DB_SSL=false
MOCK_MODE=false
```

---

### Option 3: **Docker PostgreSQL (If Docker Works)**

```bash
docker run -d \
  --name bmm-postgres \
  -e POSTGRES_USER=bmm_user \
  -e POSTGRES_PASSWORD=secure_password_here \
  -e POSTGRES_DB=bmm_db \
  -p 5432:5432 \
  postgres:16-alpine
```

---

## Initialize Database Schema

After setting up PostgreSQL:

```bash
cd backend
psql -U bmm_user -d bmm_db -f ../database/migrations/001_initial_schema.sql
```

Or using the npm script:
```bash
cd backend
npm run db:migrate
```

---

## Connection Verification

```bash
# Test connection
psql -U bmm_user -d bmm_db -h localhost

# List tables
\dt

# Verify admin user
SELECT * FROM users WHERE email = 'admin@bmm.local';
```

---

## Switching Between Local & Cloud

Edit `backend/.env`:

**For Local:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bmm_db
DB_USER=bmm_user
DB_PASSWORD=secure_password_here
DB_SSL=false
MOCK_MODE=false
```

**For Supabase:**
```env
DB_HOST=your-project.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=require
MOCK_MODE=false
```

---

## Free Cloud Options

| Provider | Free Tier | Setup Time | Backup |
|----------|-----------|-----------|--------|
| **Supabase** | 500MB database | 2 min | Automatic |
| **Railway** | $5/month | 3 min | Optional |
| **Render** | 256MB database | 3 min | Optional |
| **PlanetScale** | 1GB database | 2 min | Automatic |

---

## Troubleshooting

### "psql: command not found"
- Ensure PostgreSQL bin folder is in PATH
- Windows: `C:\Program Files\PostgreSQL\16\bin`
- Add to PATH in Environment Variables

### Connection timeout
- Verify PostgreSQL is running (Services on Windows)
- Check firewall allows port 5432
- Verify credentials in .env

### Schema already exists
```sql
-- Drop existing schema (be careful!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

---

## Next Steps

1. **Choose an option above**
2. **Update `.env` file** with your credentials
3. **Restart backend**: `npm run dev`
4. **Run migrations**: `npm run db:migrate`
5. **Test login**: http://localhost:3000 → admin@bmm.local / admin123
