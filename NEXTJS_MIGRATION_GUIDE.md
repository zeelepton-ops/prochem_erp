# Next.js Migration Guide

## What Was Done

### 1. ✅ Project Structure Created
- Converted monorepo (separate frontend/backend) to unified Next.js app directory
- Set up Next.js 14 with TypeScript, Tailwind CSS, PostCSS
- Configured paths alias (@/*)
- Created directory structure: src/app, src/lib, src/components, src/styles

### 2. ✅ Prisma ORM Setup
- Migrated database schema to Prisma with 25+ models
- All relationships properly configured
- Indexes optimized for performance
- Ready for migrations and seeding

### 3. ✅ NextAuth Configuration
- Credentials-based authentication (email/password)
- JWT session strategy
- User role support (ADMIN, MANAGER, OPERATOR, VIEWER)
- Protected API routes
- Sign-in and sign-up pages

### 4. ✅ API Routes Framework
- Purchase Orders: GET (list), POST (create), GET/:id, PUT/:id, DELETE/:id
- Sales Orders: GET (list), POST (create), GET/:id, PUT/:id, DELETE/:id
- Registration endpoint: POST /api/auth/register
- Sample structure for material-tests, production, delivery-notes

### 5. ✅ Frontend Pages
- Home page with sign-in/sign-up
- Dashboard with workflow shortcuts
- Auth pages (signin, signup)
- Session management with NextAuth

### 6. ✅ Configuration Files
- package.json with all dependencies
- tsconfig.json for Next.js
- tailwind.config.ts for styling
- postcss.config.js
- next.config.js
- vercel.json for deployment
- .env.example for environment setup

## What You Need to Do

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Create .env file
cp .env.example .env

# Configure DATABASE_URL in .env
# Then run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 3. Complete Missing API Routes
These need to be implemented following the pattern of purchase-orders:

- [ ] Material Tests API (4 more endpoints)
- [ ] Production API (4 more endpoints)
- [ ] Delivery Notes API (4 more endpoints)
- [ ] Customers API (CRUD)
- [ ] Suppliers API (CRUD)
- [ ] Raw Materials API (CRUD)
- [ ] Products API (CRUD)
- [ ] Audit Logs API (GET only)
- [ ] Reports API

### 4. Complete Frontend Pages
These dashboard pages need implementation:

- [ ] Purchase Orders List & Detail pages
- [ ] Sales Orders List & Detail pages
- [ ] Material Tests List & Detail pages
- [ ] Production List & Detail pages
- [ ] Delivery Notes List & Detail pages
- [ ] Inventory Management page
- [ ] Reports & Analytics dashboard
- [ ] User Management page (admin only)
- [ ] Settings page

### 5. Add Components
Create reusable UI components:

- [ ] Form components (Input, Select, etc.)
- [ ] Table component for list views
- [ ] Modal/Dialog for details
- [ ] Navbar with user menu
- [ ] Sidebar navigation
- [ ] Status badges
- [ ] Pagination controls

### 6. Add Services/Utilities
- [ ] API client service (axios interceptors)
- [ ] Validation utilities
- [ ] Error handling
- [ ] Notification system (toast)
- [ ] PDF generation utilities
- [ ] Email sending utilities

### 7. Database Seeding
Create seed script with:
- [ ] Default admin user
- [ ] Sample suppliers
- [ ] Sample customers
- [ ] Sample materials
- [ ] Sample products

### 8. Testing & Deployment
- [ ] Test local development
- [ ] Test API endpoints
- [ ] Configure Vercel environment variables
- [ ] Deploy to Vercel
- [ ] Setup PostgreSQL production database

## API Routes Pattern

All new API routes should follow this pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'

// GET - List with pagination
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const skip = (page - 1) * limit

  const items = await prisma.model.findMany({ skip, take: limit })
  const total = await prisma.model.count()

  return NextResponse.json({
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  })
}

// POST - Create
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const item = await prisma.model.create({ data: body })
  return NextResponse.json(item, { status: 201 })
}

// GET/:id - Get single
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const item = await prisma.model.findUnique({ where: { id: params.id } })
  return NextResponse.json(item)
}

// PUT/:id - Update
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const item = await prisma.model.update({ where: { id: params.id }, data: body })
  return NextResponse.json(item)
}

// DELETE/:id - Delete
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await prisma.model.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Deleted' })
}
```

## Frontend Pages Pattern

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function PageName() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    const fetchData = async () => {
      try {
        const response = await axios.get('/api/endpoint')
        setItems(response.data.data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Items</h1>
      {/* Component content */}
    </div>
  )
}
```

## Environment Variables

Required in `.env`:
```env
DATABASE_URL=              # PostgreSQL connection
NEXTAUTH_URL=              # App URL (http://localhost:3000 for dev)
NEXTAUTH_SECRET=           # Generated with openssl rand -base64 32

# Optional for features
EMAIL_HOST=
EMAIL_USER=
EMAIL_PASS=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## Key Differences from Previous Setup

| Old (Express + React) | New (Next.js) |
|---|---|
| Separate frontend/backend | Unified full-stack |
| Vite dev server | Next.js dev server |
| Custom JWT auth | NextAuth (industry standard) |
| Separate package.json files | Single package.json |
| Mock database initially | Prisma ORM from start |
| Docker compose | Can still use Docker |
| Manual CORS setup | Built-in |
| React Router | Next.js routing |
| Zustand state | Can still use Zustand |

## Database Seeding Example

Create `scripts/seed.ts`:

```typescript
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  // Clear existing data
  // await prisma.user.deleteMany()

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const user = await prisma.user.create({
    data: {
      email: 'admin@bmm.local',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('Admin user created:', user)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## Deployment Checklist

- [ ] Database set up on production (Vercel Postgres or external PostgreSQL)
- [ ] Environment variables configured in Vercel dashboard
- [ ] NEXTAUTH_SECRET generated and set
- [ ] NEXTAUTH_URL set to production domain
- [ ] Database migrations run on production
- [ ] Admin user created in production
- [ ] Email/SMS credentials configured (if needed)
- [ ] SSL/TLS enabled
- [ ] Domain configured
- [ ] Backup strategy planned

## Support Files

- `README_NEXTJS.md` - Comprehensive project documentation
- `.env.example` - Environment variable template
- `prisma/schema.prisma` - Complete database schema
- `src/lib/auth/auth.ts` - NextAuth configuration
- `next.config.js` - Next.js configuration

## Quick Start After Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your PostgreSQL URL

# 3. Setup database
npm run db:migrate
npm run db:seed

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
# Sign in with: admin@bmm.local / admin123
```

---

**This migration eliminates the need for Render or external servers by consolidating to a single Next.js application that can be deployed on Vercel for free tier support.**
