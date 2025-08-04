# Creează start-dev.ps1 cu acest conținut:

Write-Host "🚀 Starting Perchance AI v2.0 Development" -ForegroundColor Cyan

# Check if .env exists
if (!(Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Created .env from example" -ForegroundColor Green
    }
}

# Install dependencies if needed
if (!(Test-Path "node_modules\express")) {
    Write-Host "📦 Installing API dependencies..." -ForegroundColor Yellow
    npm install express cors helmet express-rate-limit sqlite3 dotenv nodemon concurrently
}

# Start API server
Write-Host "🌐 Starting API server on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-noexit", "-command", "node src\api\server.js"

Write-Host "✅ Development environment started!" -ForegroundColor Green
Write-Host "📡 API: http://localhost:3000" -ForegroundColor Cyan
Write-Host "❤️  Health: http://localhost:3000/api/health" -ForegroundColor Cyan
