@echo off
TITLE Apna Bazar - Localhost Services Status
COLOR 0E

echo ======================================================================
echo           ShopEase Apna Bazar - Localhost Service Checker
echo ======================================================================
echo.

echo Checking ports...
echo.

netstat -ano | findstr ":5000" >nul
if %errorlevel% equ 0 (
  echo  [OK] Backend API Server is RUNNING on Port 5000 -> http://localhost:5000/api/health
) else (
  echo  [--] Backend API Server is NOT running (Port 5000)
)

netstat -ano | findstr ":5173" >nul
if %errorlevel% equ 0 (
  echo  [OK] Admin Dashboard is RUNNING on Port 5173   -> http://localhost:5173
) else (
  echo  [--] Admin Dashboard is NOT running (Port 5173)
)

netstat -ano | findstr ":8081" >nul
if %errorlevel% equ 0 (
  echo  [OK] Customer Mobile App is RUNNING on Port 8081 -> http://localhost:8081
) else (
  echo  [--] Customer Mobile App is NOT running (Port 8081)
)

echo.
echo ======================================================================
echo  To launch all services at once, double-click: start-all.bat
echo ======================================================================
pause
