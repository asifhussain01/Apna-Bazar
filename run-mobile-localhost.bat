@echo off
TITLE Apna Bazar - Mobile App on Localhost
COLOR 0A

echo ======================================================================
echo          Apna Bazar - Customer Mobile App (Localhost Web)
echo ======================================================================
echo.

echo [1/3] Updating dependencies and assets...
cd /d %~dp0mobile
node create-assets.js
call npm install --legacy-peer-deps

echo.
echo [2/3] Starting Backend API Server (Port 5000)...
start "Apna Bazar - Backend API" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Launching Mobile App on Localhost (Port 8081)...
cd /d %~dp0mobile
start http://localhost:8081
call npm run web

pause
