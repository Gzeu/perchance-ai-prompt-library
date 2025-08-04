#!/bin/bash
echo "🚀 Starting Perchance AI Prompt Library v2.0 Development Environment"

# Install web dependencies if not exists
if [ ! -d "web/node_modules" ]; then
    echo "📦 Installing web dependencies..."
    cd web && npm install && cd ..
fi

# Copy env file if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "📝 Created .env file from example"
fi

# Start all services
echo "🌐 Starting API server and Web interface..."
npm run dev
EOF_START_DEV

chmod +x start-dev.sh