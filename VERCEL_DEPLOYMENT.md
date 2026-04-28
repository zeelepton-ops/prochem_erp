# Vercel Deployment Guide

This guide covers deploying the full-stack BMM Next.js application to Vercel.

## Project Structure

```
bmm/ (deployed to Vercel)
├── src/            # Next.js frontend + API routes
├── backend/        # Express backend (separate deployment)
├── prisma/         # Database schema
└── vercel.json     # Vercel configuration
```

## Frontend Deployment (Vercel)

### Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **GitHub Repository** - Push code to GitHub
3. **Environment Variables** - Prepared and ready to configure

### Step 1: Connect Repository

1. Go to **Vercel Dashboard** → **Add New Project**
2. Select your GitHub repository
3. **DO NOT modify the root directory** - leave it as is (Vercel will auto-detect Next.js)

### Step 2: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | PostgreSQL connection string | Use Supabase or managed Postgres |
| `SHADOW_DATABASE_URL` | PostgreSQL shadow DB connection | For Prisma migrations |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` | Keep secret, don't share |
| `NEXT_PUBLIC_API_URL` | Backend API URL | e.g., `https://your-backend.com/api` |
| `JWT_SECRET` | Generate with: `openssl rand -base64 32` | Keep secret |

**Optional:**
| Variable | Value |
|----------|-------|
| `EMAIL_HOST` | SMTP host (e.g., smtp.gmail.com) |
| `EMAIL_PORT` | SMTP port (e.g., 587) |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password or app-specific password |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number |

### Step 3: Deploy

1. Click **Deploy**
2. Vercel will:
   - Install dependencies (`npm install`)
   - Build Next.js app (`npm run build`)
   - Generate Prisma client
   - Deploy to Vercel CDN

**Expected build output:**
```
✓ Collecting build inputs
✓ Generating Prisma Client
✓ Building application
✓ Exporting static content
✓ Deployed to Vercel
```

### Step 4: Set Up Database

#### Option A: Use Supabase (Recommended)

1. Go to https://supabase.com and create a project
2. Copy the PostgreSQL connection string
3. Run migrations:
   ```bash
   npm run db:migrate
   ```

#### Option B: Use Managed Database

- Vercel Postgres
- AWS RDS
- Google Cloud SQL
- DigitalOcean Managed Database

### Step 5: Run Migrations on Vercel

After deploying for the first time:

```bash
# In your local terminal
DATABASE_URL="your_production_db_url" npm run db:migrate
```

Or run migrations manually via:
1. SSH into a Vercel instance
2. Or use a post-deployment hook (see below)

## Backend Deployment (Separate Service)

The backend (Express API in `/backend`) must be deployed separately to:
- **Render** (recommended, free tier available)
- **Railway**
- **Fly.io**
- **DigitalOcean**

### Backend Environment Variables

When deploying backend, set:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=<same-as-frontend-database>
JWT_SECRET=<use-same-value-as-frontend>
NEXTAUTH_URL=https://<your-vercel-url>
```

### Connect Frontend to Backend

Update Vercel environment variable:
```
NEXT_PUBLIC_API_URL=https://<your-backend-url>/api
```

Then redeploy frontend.

## Post-Deployment Setup

### 1. Test Backend Connection

```bash
curl https://<your-backend-url>/health
# Expected: 200 OK
```

### 2. Test Frontend

Visit `https://<your-vercel-url>`

### 3. Test Authentication

1. Go to login page
2. Use default credentials:
   - Email: `admin@bmm.local`
   - Password: `admin123` (change in production!)

## Troubleshooting

### Build Fails: "Cannot find module 'prisma'"

**Cause:** Prisma client not generated

**Fix:**
```bash
npm run build  # Generates prisma client locally
git add prisma/.prisma/
git commit -m "Generate Prisma client"
git push
```

### Build Fails: "DATABASE_URL is not set"

**Cause:** Environment variable not configured

**Fix:**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add `DATABASE_URL`
3. Redeploy (trigger new build)

### Frontend Can't Connect to Backend

**Cause:** `NEXT_PUBLIC_API_URL` not set or incorrect

**Fix:**
1. Set correct backend URL in Vercel env vars
2. Ensure backend is deployed and running
3. Check CORS configuration on backend

### Database Migrations Fail

**Cause:** Migration not run on production database

**Fix:**
```bash
# Locally, with production DATABASE_URL
DATABASE_URL="production_url" npm run db:migrate
```

## Performance & Optimization

1. **Enable Vercel Analytics**
   - Vercel Dashboard → Analytics → Enable

2. **Set Up CDN for Static Assets**
   - Already done by Vercel automatically

3. **Configure Custom Domain**
   - Vercel Dashboard → Domains

4. **Enable HTTPS**
   - Automatic with Vercel

## Environment Variable Security

✅ **DO:**
- Generate secrets with `openssl rand -base64 32`
- Use Vercel's encrypted environment variable storage
- Rotate secrets periodically

❌ **DON'T:**
- Commit secrets to Git
- Share secret keys
- Use weak passwords
- Reuse production secrets in development

## Rollback & Debugging

### View Deployment Logs
- Vercel Dashboard → Deployments → [latest] → Logs

### Rollback to Previous Deployment
1. Vercel Dashboard → Deployments
2. Click the deployment you want to restore
3. Click "Promote to Production"

### Access Production Logs
```bash
# Via Vercel CLI
vercel logs <url>
```

## SSL/TLS Certificates

✅ **Already handled by Vercel**
- Free SSL/TLS certificate
- Auto-renewal
- HTTPS enforced

## Backup & Disaster Recovery

### Database Backups

**Supabase:**
- Automatic daily backups
- 7-day backup retention (free tier)
- Manual backups available

**Other providers:**
- Implement backup strategy
- Consider daily snapshots
- Test restore procedures

### Application Rollback

All deployments are preserved in Vercel:
1. Go to Deployments
2. Select any previous deployment
3. Promote to production

## Monitoring & Alerts

### Set Up Alerts

1. Vercel Dashboard → Project → Settings → Git Integration
2. Enable notifications for:
   - Deployment failures
   - Build errors

### Monitor Application Health

- Check `/health` endpoint regularly
- Set up uptime monitoring (e.g., UptimeRobot)
- Monitor database performance

## Cost Estimation

| Component | Free Tier | Pro Tier |
|-----------|-----------|----------|
| **Vercel Hosting** | 100GB bandwidth | $20/mo + overage |
| **Supabase DB** | 500MB storage | Pay-as-you-go |
| **Backend (Render)** | Free tier (~$0) | Starting $7/mo |

Total estimated cost: **$0-30/month** for small deployments

## Next Steps

1. ✅ Configure environment variables in Vercel
2. ✅ Set up database (Supabase or managed Postgres)
3. ✅ Deploy backend separately
4. ✅ Run database migrations
5. ✅ Test application
6. ✅ Configure custom domain
7. ✅ Set up monitoring

## Support & Documentation

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/learn/foundations/how-nextjs-works/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/orm/overview/databases/vercel-postgres)
- [Supabase Docs](https://supabase.com/docs)

---

**Status:** ✅ Ready for deployment  
**Last Updated:** 2026-04-28  
**Version:** 1.0.0
