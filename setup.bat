@echo off
REM Building Materials Management System - Setup Script for Windows

echo.
echo 🚀 Setting up Building Materials Management System...
echo.

REM Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is required but not installed.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Setup Backend
echo 📦 Setting up Backend...
cd backend
call npm install
if exist .env (
    echo .env already exists, skipping...
) else (
    copy .env.example .env
)
cd ..
echo ✅ Backend setup complete
echo.

REM Setup Frontend
echo 📦 Setting up Frontend...
cd frontend
call npm install
if exist .env (
    echo .env already exists, skipping...
) else (
    copy .env.example .env
)
cd ..
echo ✅ Frontend setup complete
echo.

REM Check for Docker
where docker >nul 2>nul
if %errorlevel% equ 0 (
    echo 🐳 Docker found
    echo.
    echo To start the application, run:
    echo   docker-compose up -d
    echo.
    echo Then access:
    echo   Frontend: http://localhost:3000
    echo   Backend: http://localhost:5000
) else (
    echo 📝 Docker not found. For manual setup:
    echo.
    echo Backend:
    echo   cd backend ^&^& npm run dev
    echo.
    echo Frontend (in new terminal):
    echo   cd frontend ^&^& npm run dev
)

echo.
echo ✅ Setup complete!
echo.
echo 📚 Documentation:
echo   - GETTING_STARTED.md
echo   - README.md
echo   - backend/README.md
echo   - frontend/README.md
echo.
pause
