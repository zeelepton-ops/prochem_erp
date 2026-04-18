# Deployment Guide

This repository is split into two deployable parts:

- `frontend/` → Vercel static site
- `backend/` → Docker-based Express API server

## Frontend deployment (Vercel)

1. Import the repository into Vercel.
2. Set the project root to `frontend`.
3. Set these build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables in Vercel:
   - `VITE_API_URL=https://<your-backend-url>/api`
   - `VITE_APP_NAME=Building Materials Management`
   - `VITE_SUPABASE_URL=<your-supabase-url>`
   - `VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-key>`
5. Deploy.

> The frontend reads `import.meta.env.VITE_API_URL` from `frontend/.env` during local dev and from Vercel env vars in production.

## Backend deployment (Render)

This repo includes `render.yaml` for Render deployment. If you use Render:

1. Import the repository into Render.
2. Use the `render.yaml` service definitions.
3. Confirm the `prochem-erp-backend` service uses `backend/Dockerfile`.
4. Set backend environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `JWT_SECRET=<strong-secret>`
   - `DATABASE_URL=<render-database-url>` or set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

### Render database

If you use Render's managed Postgres service, the `DATABASE_URL` provided by Render will be parsed automatically by the backend.

## Alternative backend hosts

If you use another host (Railway / Fly / DigitalOcean):

- Build the backend with `npm run build`
- Run it with `npm start`
- Ensure the backend is exposed on port `5000`
- Provide the same database env vars as above

## Connecting frontend to backend

Once backend is deployed, set Vercel env vars:

- `VITE_API_URL=https://<your-backend-host>/api`

Then redeploy the frontend.

## Notes

- `frontend/vercel.json` is already configured for Vercel static deployment.
- `frontend/.vercelignore` excludes `.env` so local secrets are not uploaded.
- `backend/Dockerfile` is ready for containerized deployment.
