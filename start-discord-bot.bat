@echo off
echo 🤖 Starting Perchance Discord Bot...
echo.
echo Make sure:
echo 1. Perchance API is running on localhost:3000
echo 2. .env file has valid DISCORD_TOKEN
echo 3. Bot has been invited to your server
echo.
cd discord-bot
node index.js
