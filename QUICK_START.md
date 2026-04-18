# ⚡ Quick Start Guide

## Current Status

✅ **Frontend running**: http://localhost:3000  
✅ **Backend running**: http://localhost:5000  
✅ **Mock Mode active**: Can test UI without database

---

## 🎯 Choose Your Path

### Path A: Test UI First (Fastest ⚡)

**Already working!**

1. Open http://localhost:3000
2. Click "Sign In"
3. Try credentials: `admin@bmm.local / admin123`
4. Explore the dashboard

**This uses Mock Mode** - UI works, but no real data persistence.

---

### Path B: Local PostgreSQL (Recommended 🏆)

**Setup time: ~10 minutes**

```bash
# 1. Download & install PostgreSQL from:
#    https://www.postgresql.org/download/windows/

# 2. Initialize database (runs setup script)
cd backend
npm run db:setup

# 3. Run migrations (creates tables)
npm run db:migrate

# 4. Restart backend
npm run dev

# 5. Test login at http://localhost:3000
```

**Result**: Full-featured system with local database  
**Best for**: Development, testing  
**Persistence**: ✅ Yes, data saved locally  

👉 **See [LOCAL_POSTGRES_SETUP.md](LOCAL_POSTGRES_SETUP.md) for detailed steps**

---

### Path C: Supabase (Cloud ☁️)

**Setup time: ~5 minutes**

```bash
# 1. Go to https://supabase.com
# 2. Create free account
# 3. Create new project
# 4. Copy connection details

# 5. Update backend/.env with Supabase credentials

# 6. Run migrations
cd backend
npm run db:migrate

# 7. Restart backend
npm run dev

# 8. Test login at http://localhost:3000
```

**Result**: Database in the cloud  
**Best for**: Production, always-online, team collaboration  
**Persistence**: ✅ Yes, data in cloud with automatic backups  
**Free tier**: 500MB database

👉 **See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed steps**

---

## 📋 Comparison

| Feature | Mock Mode | Local DB | Supabase |
|---------|-----------|----------|----------|
| **Setup Time** | 0 min ⚡ | 10 min | 5 min |
| **Data Persistence** | ❌ No | ✅ Yes | ✅ Yes |
| **Internet Required** | ❌ No | ❌ No | ✅ Yes |
| **Cost** | Free | Free | Free (500MB) |
| **Best For** | Quick demo | Development | Production |
| **Backups** | ❌ No | Manual | ✅ Automatic |

---

## 🔄 Switching Between Databases

All three options work with the same codebase!

Just edit `backend/.env`:

**For Mock Mode:**
```env
MOCK_MODE=true
```

**For Local PostgreSQL:**
```env
MOCK_MODE=false
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bmm_db
DB_USER=bmm_user
DB_PASSWORD=secure_password_here
```

**For Supabase:**
```env
MOCK_MODE=false
DB_HOST=your-project.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
```

Then restart backend: `npm run dev`

---

## ✅ Verify Setup

### Check Frontend
```bash
# Should see VITE running on port 3000
curl http://localhost:3000
```

### Check Backend
```bash
# Should return 200 OK
curl http://localhost:5000/health
```

### Check Database (if using real DB)
```bash
# Replace with your DB credentials
psql -U bmm_user -d bmm_db -h localhost
```

---

## 📚 Full Documentation

- **Local Setup**: [LOCAL_POSTGRES_SETUP.md](LOCAL_POSTGRES_SETUP.md)
- **Supabase Setup**: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- **General DB Guide**: [DATABASE_SETUP.md](DATABASE_SETUP.md)
- **Architecture**: [README.md](README.md)

---

## 🚀 Next Steps

**1. Choose your database** (Path A, B, or C)  
**2. Follow the guide** (links above)  
**3. Test the application**  
**4. Start building features!**

---

## 💡 Pro Tips

- **Mock Mode** → test UI quickly
- **Local DB** → full development environment
- **Supabase** → ready for production immediately
- **Easy switch** → just change `.env` file

You can use all three during different phases of development!

---

## 🆘 Need Help?

1. Check relevant setup guide (links above)
2. See "Troubleshooting" section in setup guides
3. Check backend logs: `npm run dev` output
4. Verify credentials in `.env` match your setup

---

## 📊 System Overview

```
┌─────────────┐
│   Browser   │ http://localhost:3000
└──────┬──────┘
       │ React UI
       │ (TypeScript + Tailwind)
       │
┌──────▼──────┐
│  Frontend   │
│  Vite Dev   │
└──────┬──────┘
       │ API calls
       │ (Axios)
       │
┌──────▼──────┐
│  Backend    │ http://localhost:5000
│  Express.js │ (TypeScript)
└──────┬──────┘
       │ Database queries
       │ (pg-promise)
       │
┌──────▼──────────────────────┐
│   PostgreSQL Database        │
│ ┌─────────────────────────┐ │
│ │ Local or Supabase       │ │
│ │ (25 tables)             │ │
│ │ JWT Auth, RBAC          │ │
│ └─────────────────────────┘ │
└──────────────────────────────┘
```

---

**Status**: ✅ Ready to go!  
**Last Updated**: 2026-04-17  
**Version**: 1.0.0
