# Building Materials Management System - Backend

Node.js/Express backend for the Building Materials Management System using TypeScript and PostgreSQL.

## Features

- JWT Authentication
- RESTful API endpoints
- PostgreSQL database with migrations
- Role-based access control (RBAC)
- Comprehensive error handling
- Input validation
- CORS and security headers (Helmet)
- Audit logging

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Update the environment variables with your configuration.

### Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed
```

### Development

```bash
npm run dev
```

The server will start at `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile (requires auth)

### Purchase Orders
- `POST /api/purchase-orders` - Create PO
- `GET /api/purchase-orders` - List POs
- `GET /api/purchase-orders/:id` - Get PO details
- `PUT /api/purchase-orders/:id` - Update PO
- `DELETE /api/purchase-orders/:id` - Delete PO

### Sales Orders
- `POST /api/sales-orders` - Create SO
- `GET /api/sales-orders` - List SOs
- `GET /api/sales-orders/:id` - Get SO details
- `PUT /api/sales-orders/:id` - Update SO
- `DELETE /api/sales-orders/:id` - Delete SO

### Material Tests
- `POST /api/material-tests` - Create test
- `GET /api/material-tests` - List tests
- `GET /api/material-tests/:id` - Get test details
- `PUT /api/material-tests/:id` - Update test
- `DELETE /api/material-tests/:id` - Delete test

### Production
- `POST /api/production` - Create production batch
- `GET /api/production` - List batches
- `GET /api/production/:id` - Get batch details
- `PUT /api/production/:id` - Update batch
- `DELETE /api/production/:id` - Delete batch

### Delivery Notes
- `POST /api/delivery-notes` - Create delivery note
- `GET /api/delivery-notes` - List delivery notes
- `GET /api/delivery-notes/:id` - Get delivery note details
- `PUT /api/delivery-notes/:id` - Update delivery note
- `DELETE /api/delivery-notes/:id` - Delete delivery note

## Roles and Permissions

- **admin** - Full system access
- **manager** - Manage orders and production
- **operator** - Create and update operational records
- **viewer** - Read-only access

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route handlers
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── server.ts        # Entry point
├── dist/                # Compiled output
└── package.json
```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation and sanitization
- CORS protection
- SQL injection prevention (via pg-promise)
- Audit logging for critical operations
- Role-based access control

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "error": "Error message",
  "errorCode": "ERROR_CODE"
}
```

## License

Proprietary
