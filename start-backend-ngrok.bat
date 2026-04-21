@echo off
echo 🚀 Starting BMM ERP Backend with Ngrok Tunnel
echo ===============================================
echo.
echo This will give you a stable tunnel URL (requires ngrok account)
echo.
echo If you don't have ngrok:
echo 1. Download from https://ngrok.com/download
echo 2. Sign up for free account
echo 3. Run 'ngrok config add-authtoken YOUR_TOKEN'
echo.
echo Press any key to continue...
pause >nul

cd "%~dp0backend"

if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
)

echo.
echo 🔄 Starting backend...
start "BMM Backend" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo 🌐 Starting ngrok tunnel...
start "Ngrok Tunnel" cmd /k "ngrok http 5000"

echo.
echo ✅ Backend and tunnel started!
echo.
echo 🔗 Your ngrok URL will appear in the tunnel window
echo 📝 Update VITE_API_URL in Vercel with the ngrok URL
echo.
echo Press any key to exit...
pause >nul