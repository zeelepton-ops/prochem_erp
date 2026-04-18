@echo off
REM Stop the backend server running on port 5000.
cd /d "%~dp0"

echo Searching for backend process on port 5000...
set PID=
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /R "LISTENING" ^| findstr ":5000"') do set PID=%%a

if "%PID%"=="" (
  echo No process found listening on port 5000.
  pause
  exit /b 0
)

echo Killing process ID %PID%...
taskkill /PID %PID% /F
if errorlevel 1 (
  echo Failed to stop the backend process.
  pause
  exit /b 1
)
echo Backend stopped.
pause