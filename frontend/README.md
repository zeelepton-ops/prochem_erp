# Building Materials Management System - Frontend

React/TypeScript frontend for the Building Materials Management System with Vite and Tailwind CSS.

## Features

- Modern React 18 with TypeScript
- Vite for fast development and builds
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation
- Axios for API calls
- JWT authentication
- Responsive design
- Component-based architecture

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file:

```bash
VITE_API_URL=http://localhost:5000/api
```

### Development

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable React components
│   ├── pages/           # Page components
│   ├── services/        # API service calls
│   ├── hooks/           # Custom React hooks
│   ├── context/         # Context providers and stores
│   ├── types/           # TypeScript type definitions
│   ├── styles/          # Global styles
│   ├── App.tsx          # Main App component
│   └── main.tsx         # Entry point
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── package.json
```

## Pages

- **Home** - Landing page
- **Login** - User authentication
- **Dashboard** - Main dashboard with overview
- **Purchase Orders** - Manage purchase orders
- **Sales Orders** - Manage sales orders
- **Production** - Track production batches
- **Delivery Notes** - Manage deliveries

## Components

- **Button** - Reusable button component
- **FormInput** - Form input with validation
- **Navbar** - Navigation bar
- **ProtectedRoute** - Route protection for authenticated users

## Services

- **authService** - Authentication and user management
- **orderService** - Purchase and sales orders
- **workflowService** - Production, material tests, and delivery notes

## State Management

Uses Zustand for simple and efficient state management:

- `useAuthStore` - Authentication state (user, token, login/logout)

## Styling

Tailwind CSS with custom utility classes for common patterns:

- `.btn` - Button styles
- `.card` - Card container
- `.form-group` - Form field containers
- `.badge` - Status badges
- `.table` - Table styles

## API Integration

All API calls go through a configured Axios instance with:
- Automatic token attachment to requests
- Error handling with 401 redirect to login
- Base URL configuration

## Authentication Flow

1. User logs in via LoginPage
2. Token is stored in localStorage
3. Token is automatically attached to all API requests
4. Protected routes check authentication status
5. Logout clears token and user data

## Build and Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Docker Build
```bash
docker build -t bmm-frontend .
docker run -p 3000:3000 bmm-frontend
```

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Type Safety

Full TypeScript support with:
- Strict mode enabled
- Type definitions for all modules
- Shared types with backend

## License

Proprietary
