#!/bin/bash

# Building Materials Management System - Setup Script

echo "🚀 Setting up Building Materials Management System..."
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend
npm install
cp .env.example .env
cd ..
echo "✅ Backend setup complete"
echo ""

# Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend
npm install
cp .env.example .env
cd ..
echo "✅ Frontend setup complete"
echo ""

# Check for Docker
if command -v docker &> /dev/null; then
    echo "🐳 Docker found: $(docker --version)"
    echo ""
    echo "To start the application, run:"
    echo "  docker-compose up -d"
    echo ""
    echo "Then access:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend: http://localhost:5000"
else
    echo "📝 Docker not found. For manual setup:"
    echo ""
    echo "Backend:"
    echo "  cd backend && npm run dev"
    echo ""
    echo "Frontend (in new terminal):"
    echo "  cd frontend && npm run dev"
    echo ""
    echo "Database:"
    echo "  psql -U bmm_user -d bmm_db -f database/migrations/001_initial_schema.sql"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Documentation:"
echo "  - GETTING_STARTED.md"
echo "  - README.md"
echo "  - backend/README.md"
echo "  - frontend/README.md"
