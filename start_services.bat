@echo off
echo Starting Perchance AI Prompt Library Services...
echo =========================================

echo [1/3] Starting API Server...
start "Perchance API" cmd /k "cd /d %~dp0 && node src/api/server.js"

echo [2/3] Starting Web Interface...
start "Perchance Web" cmd /k "cd /d %~dp0\web && npm start"

echo [3/3] Starting Discord Bot...
start "Perchance Discord Bot" cmd /k "cd /d %~dp0 && node src/bot/bot.js"

echo =========================================
echo All services started! Access them at:
echo - API: http://localhost:3000
echo - Web Interface: http://localhost:3001
echo - API Documentation: http://localhost:3000/api-docs
echo =========================================

pause
