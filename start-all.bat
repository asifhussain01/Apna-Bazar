@echo off
TITLE Apna Bazar - Localhost Launcher
COLOR 0A

echo ======================================================================
echo              Apna Bazar - Localhost Launcher
echo ======================================================================
echo.

echo [1/3] Launching Backend API (Port 5000)...
start "Apna Bazar - Backend Server (Port 5000)" cmd /k "cd /d %~dp0backend && npm install && npm run seed && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/3] Launching Admin Dashboard (Port 5173)...
start "Apna Bazar - Admin Dashboard (Port 5173)" cmd /k "cd /d %~dp0admin && npm install && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Launching Customer Mobile App (Expo)...
start "Apna Bazar - Customer Mobile App" cmd /k "cd /d %~dp0mobile && node create-assets.js && npm install --legacy-peer-deps && npm run web"

echo.
echo ======================================================================
echo  All 3 services have been launched in separate terminal windows!
echo.
echo  * Backend API:       http://localhost:5000/api/health
echo  * Admin Dashboard:   http://localhost:5173
echo  * Customer Mobile:   http://localhost:8081 (Web browser preview)
echo.
echo  Admin Portal:
echo  - Open http://localhost:5173
echo  - Click "लॉगिन (Log In)" or "नया खाता (Create Account)" to sign up!
echo.
echo  If Phone scanning says "Could not connect to server":
echo  - Run run-mobile-tunnel.bat to connect phone via Tunnel mode!
echo ======================================================================
pause
