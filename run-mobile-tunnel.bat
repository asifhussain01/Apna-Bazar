@echo off
TITLE Apna Bazar - Mobile Expo Tunnel Mode
COLOR 0B

echo ======================================================================
echo       Apna Bazar - Mobile Expo Tunnel Mode (Phone Scan)
echo ======================================================================
echo.

echo [1/2] Updating dependencies and assets...
cd /d %~dp0mobile
node create-assets.js
call npm install --legacy-peer-deps

echo.
echo [2/2] Starting Expo in Tunnel mode...
echo This connects your phone EVEN IF:
echo  - Your phone is on Mobile Data (Jio/Airtel/Vi)
echo  - Your PC is on a different Wi-Fi network
echo  - Windows Firewall is blocking LAN traffic
echo.
echo Scan the generated QR code with Expo Go on your Android phone!
echo ======================================================================
echo.

call npm run tunnel

pause
