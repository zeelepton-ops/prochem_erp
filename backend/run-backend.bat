@echo off
REM Run this file to start the backend locally.
REM It uses npm run dev so the backend starts even if TypeScript build fails.

cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing backend dependencies...
  npm install
  if errorlevel 1 (
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)

echo Starting backend server...
npm run dev

pause