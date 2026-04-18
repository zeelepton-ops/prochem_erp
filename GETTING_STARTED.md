# Building Materials Management System - Getting Started Guide

## Prerequisites

- Node.js 20 or higher
- Docker and Docker Compose (optional, for containerized deployment)
- PostgreSQL 14+ (if running without Docker)
- npm or yarn

## Quick Start with Docker (Recommended)

The easiest way to get started is using Docker Compose:

### 1. Clone and Navigate

```bash
cd c:\Users\X\VS Codes\BMM
```

### 2. Start Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Express backend on port 5000
- React frontend on port 3000

### 3. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### 4. Login

Use the default admin credentials:
- **Email**: admin@bmm.local
- **Password**: admin123

⚠️ **Important**: Change these credentials in production!

## Manual Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` and configure:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bmm_db
DB_USER=bmm_user
DB_PASSWORD=your_password
```

5. Create PostgreSQL database:
```bash
createdb -U bmm_user bmm_db
```

6. Run migrations:
```bash
npm run db:migrate
```

7. Start development server:
```bash
npm run dev
```

Backend will run at: http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

5. Start development server:
```bash
npm run dev
```

Frontend will run at: http://localhost:3000

## Database Setup

### Option 1: Using Docker (Automatic)

Docker Compose automatically initializes the database with the migration file.

### Option 2: Manual Setup

1. Connect to PostgreSQL:
```bash
psql -U postgres
```

2. Create database and user:
```sql
CREATE USER bmm_user WITH PASSWORD 'secure_password_here';
CREATE DATABASE bmm_db OWNER bmm_user;
GRANT ALL PRIVILEGES ON DATABASE bmm_db TO bmm_user;
```

3. Run migration:
```bash
psql -U bmm_user -d bmm_db -f database/migrations/001_initial_schema.sql
```

## Project Structure

```
bmm/
├── backend/              # Express.js API
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/             # React application
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── database/
│   └── migrations/       # SQL migrations
│
├── docker-compose.yml    # Docker orchestration
└── README.md             # Main documentation
```

## Common Commands

### Backend

```bash
cd backend

npm run dev         # Start development server
npm run build       # Build for production
npm start           # Run production build
npm run typecheck   # TypeScript type checking
npm run lint        # Run ESLint
npm run db:migrate  # Run database migrations
```

### Frontend

```bash
cd frontend

npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run typecheck   # TypeScript type checking
npm run lint        # Run ESLint
```

### Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild images
docker-compose up -d --build

# Stop and remove volumes
docker-compose down -v
```

## API Testing

### Health Check

```bash
curl http://localhost:5000/health
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bmm.local",
    "password": "admin123"
  }'
```

### Create Purchase Order

```bash
curl -X POST http://localhost:5000/api/purchase-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "supplierId": "uuid",
    "expectedDeliveryDate": "2026-05-01",
    "totalAmount": 50000
  }'
```

## Troubleshooting

### Port Already in Use

If ports 3000, 5000, or 5432 are already in use:

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Error

1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure database migration was run
4. Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql.log`

### Frontend Cannot Connect to Backend

1. Verify backend is running: `curl http://localhost:5000/health`
2. Check VITE_API_URL in frontend `.env`
3. Ensure CORS is enabled in backend
4. Check browser console for errors

### Docker Issues

```bash
# Restart services
docker-compose restart

# Check service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Remove all and rebuild
docker-compose down -v
docker-compose up -d --build
```

## Production Deployment

### Environment Variables

Update `.env` files with production values:

```bash
# Backend .env
NODE_ENV=production
JWT_SECRET=strong_random_secret_key
DB_PASSWORD=strong_password
FRONTEND_URL=https://your-domain.com
```

### Build

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### Deploy

```bash
# Using Docker Compose
docker-compose -f docker-compose.yml up -d

# Or manually on your server
npm start  # backend
npm run preview  # frontend
```

### SSL/TLS

Configure nginx or your reverse proxy to handle SSL certificates.

## Features Overview

### 12 Integrated Workflows

1. **Purchase Management** - Track supplier orders
2. **Store Receiving** - Record incoming materials
3. **Raw Material Testing** - Quality control
4. **Local Purchase Orders** - Internal requests
5. **Sales Orders** - Customer orders
6. **Batch Card Issuance** - Production tracking
7. **Production Tracking** - Batch monitoring
8. **Quality Testing** - Production QA
9. **Production Entry** - Output recording
10. **Store Issue Vouchers** - Material issuance
11. **Delivery Notes** - Shipment tracking
12. **Invoice Generation** - Billing

### User Roles

- **Admin** - Full system access
- **Manager** - Order and production management
- **Operator** - Day-to-day operations
- **Viewer** - Read-only access

## Next Steps

1. Review [Backend README](./backend/README.md) for API details
2. Review [Frontend README](./frontend/README.md) for UI details
3. Explore database schema in `database/migrations/`
4. Customize features for your needs
5. Set up monitoring and logging
6. Plan backup strategy
7. Deploy to production

## Support Resources

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Database Schema](./database/migrations/001_initial_schema.sql)
- [Main README](./README.md)

---

**Last Updated**: April 2026
**Version**: 1.0.0
