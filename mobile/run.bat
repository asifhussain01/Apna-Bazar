@echo off
TITLE Apna Bazar Mobile App
cd /d "%~dp0"
echo Installing mobile app dependencies...
call npm install
echo Starting Expo mobile app...
npx expo start --web
pause
