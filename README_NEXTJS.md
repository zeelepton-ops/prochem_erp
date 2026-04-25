# Building Materials Management System - Next.js Full-Stack

A unified full-stack ERP application built with Next.js 14, React 18, TypeScript, Prisma ORM, and NextAuth for authentication.

## Tech Stack

- **Framework**: Next.js 14.0.4
- **Frontend**: React 18.2.0 with TypeScript 5.3
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM 5.7.1
- **Authentication**: NextAuth 4.24.13
- **Styling**: Tailwind CSS 3.3.0 with Radix UI
- **UI Components**: Lucide React, Radix UI
- **Build Tools**: TypeScript, ESLint
- **Utilities**: date-fns, clsx, Zustand for state
- **Reporting**: Playwright, Puppeteer Core for PDF generation
- **Communications**: Twilio (SMS), Nodemailer (Email)
- **Data Export**: xlsx for Excel
- **Hosting**: Vercel

## Project Structure

```
src/
├── app/
│   ├── api/                 # Next.js API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── purchase-orders/ # Purchase order CRUD
│   │   ├── sales-orders/   # Sales order CRUD
│   │   ├── material-tests/ # Material testing
│   │   ├── production/     # Production tracking
│   │   └── delivery-notes/ # Delivery management
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Main dashboard
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── lib/
│   ├── auth/              # NextAuth configuration
│   └── prisma.ts          # Prisma client instance
├── components/            # React components
└── styles/               # Global styles
prisma/
├── schema.prisma         # Database schema
└── migrations/           # Database migrations
```

## Database Models

The system includes 25+ interconnected tables:
- Users, Suppliers, Customers
- Raw Materials, Products, Inventory
- Purchase Orders, Sales Orders
- Material Tests, Production, Batch Cards
- Delivery Notes, Invoices
- Received Goods, Store Issue Vouchers
- Audit Logs

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bmm"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Setup Database

```bash
# Create database migrations
npm run db:migrate

# Seed initial data (admin user, etc.)
npm run db:seed
```

### 4. Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### 5. Build & Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

### Purchase Orders
- `GET /api/purchase-orders` - List all
- `POST /api/purchase-orders` - Create
- `GET /api/purchase-orders/[id]` - Get one
- `PUT /api/purchase-orders/[id]` - Update
- `DELETE /api/purchase-orders/[id]` - Delete

### Sales Orders
- `GET /api/sales-orders` - List all
- `POST /api/sales-orders` - Create
- `GET /api/sales-orders/[id]` - Get one
- `PUT /api/sales-orders/[id]` - Update
- `DELETE /api/sales-orders/[id]` - Delete

### Material Tests
- `GET /api/material-tests` - List all
- `POST /api/material-tests` - Create
- `GET /api/material-tests/[id]` - Get one
- `PUT /api/material-tests/[id]` - Update
- `DELETE /api/material-tests/[id]` - Delete

### Production
- `GET /api/production` - List all
- `POST /api/production` - Create
- `GET /api/production/[id]` - Get one
- `PUT /api/production/[id]` - Update
- `DELETE /api/production/[id]` - Delete

### Delivery Notes
- `GET /api/delivery-notes` - List all
- `POST /api/delivery-notes` - Create
- `GET /api/delivery-notes/[id]` - Get one
- `PUT /api/delivery-notes/[id]` - Update
- `DELETE /api/delivery-notes/[id]` - Delete

## Features

✅ Full-stack TypeScript
✅ JWT + NextAuth authentication
✅ Role-based access control (Admin, Manager, Operator, Viewer)
✅ Database ORM with Prisma
✅ Responsive Tailwind CSS design
✅ Material testing workflow
✅ Production batch tracking
✅ Order management (Purchase & Sales)
✅ Delivery note management
✅ Audit logging
✅ Error handling & validation
✅ PDF report generation
✅ Email & SMS notifications
✅ Excel export functionality

## Deployment

### Vercel

```bash
# Push to GitHub
git add .
git commit -m "Next.js full-stack migration"
git push

# Connect to Vercel and set environment variables in project settings:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
```

### Environment Variables for Vercel

1. DATABASE_URL - Your PostgreSQL connection string
2. NEXTAUTH_SECRET - Generate with `openssl rand -base64 32`
3. NEXTAUTH_URL - Your production URL (https://yourdomain.com)
4. EMAIL_HOST, EMAIL_USER, EMAIL_PASS - For Nodemailer
5. TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN - For SMS

## Default Credentials

After seeding:
- Email: `admin@bmm.local`
- Password: `admin123`

⚠️ Change in production!

## Next Steps

1. ✅ Create API endpoints for all workflows
2. ✅ Build dashboard components
3. ✅ Implement purchase order forms
4. ✅ Implement sales order forms
5. ✅ Add material testing UI
6. ✅ Add production tracking UI
7. ✅ Add reports & analytics
8. ✅ Setup email/SMS notifications
9. ✅ Add audit log viewer
10. ✅ Deploy to production

## Development Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm start             # Start production server
npm run lint          # Run ESLint
npm run typecheck     # Type check with TypeScript
npm run db:migrate    # Run database migrations
npm run db:seed       # Seed database with initial data
```

## File Structure Notes

### API Routes Structure

```
src/app/api/
├── auth/
│   ├── register/route.ts
│   ├── signin/route.ts
│   └── [...nextauth]/route.ts
├── purchase-orders/
│   ├── route.ts          # GET list, POST create
│   └── [id]/route.ts     # GET, PUT, DELETE
└── ...
```

### Pages Structure

```
src/app/
├── auth/
│   ├── signin/page.tsx
│   ├── signup/page.tsx
│   └── layout.tsx
├── dashboard/
│   ├── page.tsx          # Main dashboard
│   ├── purchase-orders/
│   ├── sales-orders/
│   └── ...
└── page.tsx              # Home/landing page
```

## Security Considerations

- ✅ Password hashing with bcryptjs
- ✅ JWT session tokens
- ✅ NextAuth CSRF protection
- ✅ SQL injection prevention via Prisma
- ✅ Protected API routes
- ✅ Environment variable management
- ✅ Audit logging for all operations

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Built with ❤️ for enterprise building materials management**
