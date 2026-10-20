@echo off
TITLE Apna Bazar Admin Dashboard
cd /d "%~dp0"
echo Installing admin dashboard dependencies...
call npm install
echo Starting Admin Dashboard on http://localhost:5173...
npm run dev
pause
