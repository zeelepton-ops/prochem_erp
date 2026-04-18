# Building Materials Management System

A comprehensive full-stack web application for managing building materials, chemicals, and equipment with workflows for purchase orders, production, inventory, sales orders, and delivery management.

## 🚀 Quick Start

### With Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
```

### Manual Setup

#### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Database

```bash
# Create database
createdb bmm_db

# Run migrations
psql bmm_db < database/migrations/001_initial_schema.sql
```

## 📋 Features

### Core Workflows

1. **Purchase Management** - Create and track purchase orders from suppliers
2. **Store Receiving** - Record and manage incoming materials
3. **Raw Material Testing** - Quality control and testing workflows
4. **LPO (Local PO)** - Local purchase order management
5. **Sales Orders** - Customer order management
6. **Batch Card Issuance** - Track production batches
7. **Production Tracking** - Monitor production progress
8. **Quality Testing** - Production quality validation
9. **Production Entry** - Record production output
10. **Store Issue Vouchers** - Material issuance tracking
11. **Delivery Notes** - Track shipments and deliveries
12. **Invoice Generation** - Automated invoicing

### Technical Features

- **Authentication**: JWT-based with role-based access control
- **Database**: PostgreSQL with comprehensive schema and relationships
- **API**: RESTful API with Express.js
- **Frontend**: React 18 with TypeScript and Tailwind CSS
- **Containerization**: Docker and Docker Compose
- **Security**: Password hashing, input validation, CORS, Helmet
- **Logging**: Audit logs for all critical operations
- **Error Handling**: Comprehensive error handling and validation

## 🏗️ Project Structure

```
bmm/
├── backend/                    # Express.js backend
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # Database models
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utilities
│   │   └── server.ts          # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── hooks/             # Custom hooks
│   │   ├── context/           # State management
│   │   ├── types/             # TypeScript types
│   │   ├── styles/            # CSS styles
│   │   ├── App.tsx            # Main component
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── .env.example
│
├── database/
│   └── migrations/            # Database schemas
│
├── docker-compose.yml         # Docker orchestration
└── README.md
```

## 🗄️ Database Schema

25 interconnected tables:
- users (authentication & authorization)
- suppliers & customers
- raw_materials & products
- purchase_orders & purchase_order_items
- sales_orders & sales_order_items
- material_tests
- production & batch_cards
- inventory & stock_movements
- delivery_notes
- invoices
- store_issue_vouchers
- received_goods
- audit_logs

## 🔐 Authentication & Authorization

### Roles

- **admin** - Full system access
- **manager** - Manage orders and production
- **operator** - Create and update records
- **viewer** - Read-only access

### Login Credentials (Default)

- Email: `admin@bmm.local`
- Password: `admin123` (change in production!)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/profile`

### Purchase Orders
- `POST /api/purchase-orders`
- `GET /api/purchase-orders`
- `GET /api/purchase-orders/:id`
- `PUT /api/purchase-orders/:id`
- `DELETE /api/purchase-orders/:id`

### Sales Orders
- `POST /api/sales-orders`
- `GET /api/sales-orders`
- `GET /api/sales-orders/:id`
- `PUT /api/sales-orders/:id`
- `DELETE /api/sales-orders/:id`

### Material Tests
- `POST /api/material-tests`
- `GET /api/material-tests`
- `GET /api/material-tests/:id`
- `PUT /api/material-tests/:id`
- `DELETE /api/material-tests/:id`

### Production
- `POST /api/production`
- `GET /api/production`
- `GET /api/production/:id`
- `PUT /api/production/:id`
- `DELETE /api/production/:id`

### Delivery Notes
- `POST /api/delivery-notes`
- `GET /api/delivery-notes`
- `GET /api/delivery-notes/:id`
- `PUT /api/delivery-notes/:id`
- `DELETE /api/delivery-notes/:id`

## 🐳 Docker Compose Services

- **postgres** - PostgreSQL database (port 5432)
- **backend** - Express API server (port 5000)
- **frontend** - React application (port 3000)

## 📝 Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=bmm_db
DB_USER=bmm_user
DB_PASSWORD=secure_password_here
JWT_SECRET=your_jwt_secret_key_change_in_production
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev           # Start development server
npm run typecheck     # Type checking
npm run lint          # Linting
npm run build         # Production build
```

### Frontend Development
```bash
cd frontend
npm run dev           # Start development server
npm run typecheck     # Type checking
npm run lint          # Linting
npm run build         # Production build
npm run preview       # Preview production build
```

## 📦 Dependencies

### Backend
- Express.js 4.18
- TypeScript 5.3
- pg-promise 11.5
- bcryptjs 2.4
- jsonwebtoken 9.1
- Helmet 7.1
- CORS 2.8

### Frontend
- React 18.2
- React Router 6.20
- Vite 5.0
- TypeScript 5.3
- Tailwind CSS 3.4
- Zustand 4.4
- Axios 1.6

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs with salt rounds
- **Input Validation** - express-validator for all inputs
- **CORS Protection** - Configured CORS middleware
- **Helmet Security** - HTTP headers security
- **Role-Based Access Control** - Route-level authorization
- **Audit Logging** - Track all critical operations
- **SQL Injection Prevention** - Parameterized queries via pg-promise

## 📊 Monitoring

- Health check endpoint: `/health`
- Structured logging throughout
- Audit trail for all data modifications
- API error responses with detailed error codes

## 🚀 Production Deployment

### Prerequisites
- Docker and Docker Compose
- PostgreSQL backup strategy
- SSL/TLS certificates
- Environment configuration

### Deployment Steps

1. Set production environment variables
2. Update JWT_SECRET and database password
3. Build Docker images
4. Run migrations
5. Start services with Docker Compose
6. Configure reverse proxy (nginx)
7. Set up SSL certificates
8. Configure backups

## 📚 Additional Documentation

- [Backend README](./backend/README.md) - Backend-specific details
- [Frontend README](./frontend/README.md) - Frontend-specific details
- [Database Schema](./database/migrations/001_initial_schema.sql) - Database structure

## 🤝 Support

For issues or questions, refer to the respective README files or contact the development team.

## 📄 License

Proprietary - All rights reserved.

---

**Last Updated:** April 2026
**Version:** 1.0.0
