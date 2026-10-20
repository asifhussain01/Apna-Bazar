@echo off
TITLE Apna Bazar Backend
cd /d "%~dp0"
echo Installing backend dependencies...
call npm install
echo Seeding initial admin and rural grocery catalog...
call npm run seed
echo Starting backend server on http://localhost:5000...
npm run dev
pause
