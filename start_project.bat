@echo off
echo ===================================================
echo     Starting SmartPark Development Servers...
echo ===================================================
echo.
echo 1. Launching Backend (Port 5000)
start "SmartPark Backend" cmd.exe /k "cd backend && npm install && npm run dev"

echo 2. Launching Frontend (Port 3000)
start "SmartPark Frontend" cmd.exe /k "cd frontend && npm install && npm run dev"

echo.
echo Both terminals have been opened! Wait 10-15 seconds for Next.js to compile.
echo.
echo Once the terminal says "Ready", hold Ctrl and click here:
echo http://localhost:3000
echo.
pause
