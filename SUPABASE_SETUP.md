# ☁️ Supabase Setup Guide (Free & Online)

## Why Supabase?

✅ **Free forever** - 500MB database  
✅ **Zero setup** - managed PostgreSQL  
✅ **Production-ready** - automatic backups  
✅ **Real-time** - built-in subscriptions  
✅ **Easy scaling** - upgrade anytime  

---

## Step 1: Create Supabase Account

1. Go to: https://supabase.com
2. Click **"Start your project for free"**
3. Sign up with **GitHub** (easiest) or email
4. Verify your email

## Step 2: Create New Project

1. Click **"New project"** or **"Create project"**
2. **Project name**: `bmm` (or any name)
3. **Database password**: Create strong password (remember this!)
4. **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait 2-3 minutes for provisioning ⏳

## Step 3: Get Connection Details

Once project is ready:

1. Click **"Settings"** (bottom left)
2. Click **"Database"**
3. Under **"Connection string"** section:

You'll see something like:
```
postgresql://postgres:YOUR_PASSWORD@YOUR_PROJECT.supabase.co:5432/postgres
```

Copy these values:
- **Host**: `YOUR_PROJECT.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: `YOUR_PASSWORD`

## Step 4: Update Backend Configuration

In `backend/.env`:

```env
# Supabase Settings
DB_HOST=your-project-ref.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL=require
MOCK_MODE=false
```

Replace `your-project-ref` with your actual Supabase project reference.

## Step 5: Run Migrations

```bash
cd backend
npm run db:migrate
```

This runs the SQL schema on your Supabase database.

## Step 6: Restart and Test

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Then:
1. Open http://localhost:3000
2. Login with: `admin@bmm.local / admin123`

✅ You're now using **Supabase**!

---

## Verify Connection in Supabase UI

1. Go to https://app.supabase.com
2. Open your project
3. Click **"SQL Editor"** (left sidebar)
4. Run this query:
   ```sql
   SELECT COUNT(*) FROM users;
   ```
5. You should see count **≥ 1** ✅

---

## Backup Your Data

Supabase automatically backs up your database daily!

To manually export:

1. Go to Settings → Database → Backups
2. Click **"Request backup now"**
3. Click **"Download"** on any backup

---

## Scale to Production

**Free tier includes:**
- 500MB database
- Unlimited API calls
- Automatic backups (weekly)
- Email support

**To upgrade:**
1. Click Settings → Billing
2. Choose **Pro** plan ($25/month)
   - 8GB database
   - 100GB bandwidth
   - Priority support
   - Daily backups (hourly on Pro)

---

## Troubleshooting

### Error: "connection refused"

- Verify Supabase project is created
- Check you're using correct project ref
- Ensure SSL is set to `require` in `.env`

### Error: "password authentication failed"

- Verify password in `.env` matches Supabase dashboard
- Check no typos in connection string
- Try resetting password in Settings → Database

### Error: "network timeout"

- Check internet connection
- Supabase servers might be down (check status.supabase.com)
- Try connecting from different network

---

## Sync Local Database to Supabase

If you already have local PostgreSQL data:

```bash
# Export from local
pg_dump -U bmm_user -d bmm_db > backup.sql

# Import to Supabase
psql -h PROJECT_REF.supabase.co -U postgres -d postgres -f backup.sql
```

---

## Environment Files

**For easy switching between databases:**

### Local Development
Edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bmm_db
DB_USER=bmm_user
DB_PASSWORD=secure_password_here
DB_SSL=false
```

### Production (Supabase)
Edit `backend/.env`:
```env
DB_HOST=your-project.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=require
```

Just change these 5 lines and restart backend!

---

## Other Free Database Options

| Provider | Free Tier | Setup | Notes |
|----------|-----------|-------|-------|
| **Supabase** | 500MB | 2 min | **Recommended** |
| **Railway** | $5/month | 3 min | Pay as you go |
| **Render** | 256MB | 3 min | Limited queries |
| **PlanetScale** | 1GB | 2 min | MySQL (different) |
| **MongoDB Atlas** | 512MB | 3 min | NoSQL (different) |

**Supabase is recommended** because:
- Best free tier (500MB)
- Managed PostgreSQL (same as local)
- Zero configuration
- Auto backups
- Real-time capabilities

---

## Quick Links

- **Supabase Dashboard**: https://app.supabase.com
- **Status Page**: https://status.supabase.com
- **Documentation**: https://supabase.com/docs
- **Community**: https://github.com/supabase/supabase/discussions

---

## Support

Stuck? Check:

1. [Supabase Docs](https://supabase.com/docs)
2. [GitHub Issues](https://github.com/supabase/supabase/issues)
3. [Community Discord](https://discord.supabase.com)
