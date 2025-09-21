# Deployment Guide

## Perchance AI Prompt Library Deployment

This guide covers various deployment scenarios for the Perchance AI Prompt Library.

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Production Deployment](#production-deployment)
4. [Cloud Platforms](#cloud-platforms)
5. [NPM Package Publishing](#npm-package-publishing)
6. [Environment Configuration](#environment-configuration)

---

## Local Development

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
cd perchance-ai-prompt-library

# Install dependencies
npm install

# Install web dependencies
cd web && npm install && cd ..

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Link for global CLI testing
npm link

# Start development servers
npm run dev
```

### Development Scripts

```bash
# Start API server
npm run dev

# Start web interface (separate terminal)
cd web && npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Test CLI commands
npm run test:cli
```

---

## Docker Deployment

### Single Container

```bash
# Build the image
docker build -t perchance-ai .

# Run development container
docker run -p 3000:3000 -p 5173:5173 \
  -v $(pwd):/app \
  -e NODE_ENV=development \
  perchance-ai

# Run production container
docker run -p 8000:3000 \
  -e NODE_ENV=production \
  perchance-ai
```

### Docker Compose

#### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Production

```bash
# Start production services
docker-compose --profile production up -d

# Scale API service
docker-compose --profile production up -d --scale prod=3
```

### Docker Configuration

**Environment Variables:**
```bash
# Create .env file for Docker
cat > .env << EOF
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
POLLINATIONS_TOKEN=your_token_here
DB_PATH=/data/prompts.db
EOF
```

**Volume Mounts:**
```yaml
# docker-compose.override.yml
version: '3.8'
services:
  api:
    volumes:
      - ./data:/data
      - ./logs:/app/logs
    environment:
      - DB_PATH=/data/prompts.db
```

---

## Production Deployment

### Server Requirements

- **CPU**: 1+ cores (2+ recommended)
- **RAM**: 512MB minimum (1GB+ recommended)
- **Storage**: 100MB+ free space
- **OS**: Linux (Ubuntu 20.04+ recommended)
- **Node.js**: 14.0.0+ (18.x LTS recommended)

### Production Setup

#### 1. System Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash perchance
sudo usermod -aG sudo perchance
```

#### 2. Application Deployment

```bash
# Switch to application user
sudo su - perchance

# Clone and setup application
git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
cd perchance-ai-prompt-library

# Install dependencies (production only)
NODE_ENV=production npm ci --only=production
cd web && NODE_ENV=production npm ci --only=production && cd ..

# Build web interface
cd web && npm run build && cd ..

# Create production environment file
cp .env.example .env
# Edit .env with production settings

# Set up PM2 ecosystem
cp ecosystem.config.js.example ecosystem.config.js
# Edit ecosystem configuration
```

#### 3. Process Management with PM2

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [
    {
      name: 'perchance-api',
      script: 'src/api/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log'
    }
  ]
};
```

```bash
# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u perchance --hp /home/perchance

# Enable PM2 resurrection
pm2 save
```

#### 4. Reverse Proxy with Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/perchance << EOF
server {
    listen 80;
    server_name your-domain.com;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    
    # API proxy
    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static files
    location / {
        root /home/perchance/perchance-ai-prompt-library/web/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Caching
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/perchance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Test renewal
sudo certbot renew --dry-run
```

#### 6. Monitoring and Logging

```bash
# Setup log rotation
sudo tee /etc/logrotate.d/perchance << EOF
/home/perchance/perchance-ai-prompt-library/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    create 644 perchance perchance
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Monitor with PM2
pm2 monit

# View logs
pm2 logs
pm2 logs perchance-api --lines 100
```

---

## Cloud Platforms

### Heroku

#### 1. Prepare for Heroku

**Procfile:**
```
web: npm start
worker: npm run worker
```

**package.json scripts:**
```json
{
  "scripts": {
    "start": "node src/api/server.js",
    "heroku-postbuild": "cd web && npm install && npm run build"
  }
}
```

#### 2. Deploy

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create application
heroku create perchance-ai-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set NPM_CONFIG_PRODUCTION=false
heroku config:set POLLINATIONS_TOKEN=your_token

# Deploy
git push heroku main

# Scale dynos
heroku ps:scale web=1

# View logs
heroku logs --tail
```

### Vercel

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/api/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "web/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/api/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "web/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add POLLINATIONS_TOKEN
```

### Railway

**railway.json:**
```json
{
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables
railway variables set POLLINATIONS_TOKEN=your_token
```

### DigitalOcean App Platform

**.do/app.yaml:**
```yaml
name: perchance-ai
services:
- name: api
  source_dir: /
  github:
    repo: Gzeu/perchance-ai-prompt-library
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: production
  - key: POLLINATIONS_TOKEN
    value: ${POLLINATIONS_TOKEN}
    type: SECRET
static_sites:
- name: web
  source_dir: /web
  github:
    repo: Gzeu/perchance-ai-prompt-library
    branch: main
  build_command: npm install && npm run build
  output_dir: /dist
```

---

## NPM Package Publishing

### Automated Publishing

The CI/CD pipeline automatically publishes to npm on pushes to main branch.

**Setup NPM Token:**
```bash
# Generate token at https://www.npmjs.com/settings/tokens
# Add to GitHub Secrets as NPM_TOKEN
```

### Manual Publishing

```bash
# Login to NPM
npm login

# Update version
npm version patch # or minor, major

# Publish
npm publish --access public

# Create GitHub release
git push origin main --tags
```

### Pre-publish Checklist

- [ ] All tests passing
- [ ] Version number updated
- [ ] CHANGELOG.md updated
- [ ] Documentation updated
- [ ] Build successful
- [ ] No sensitive data in package

---

## Environment Configuration

### Environment Variables

```bash
# Core Configuration
NODE_ENV=production                    # Environment mode
PORT=3000                             # Server port
LOG_LEVEL=info                        # Logging level

# API Keys
POLLINATIONS_TOKEN=your_token_here    # Pollinations.ai API token

# Database
DB_PATH=./data/prompts.db             # SQLite database path

# Features
ENABLE_ANALYTICS=true                 # Enable usage analytics
ENABLE_CACHING=true                   # Enable prompt caching
CACHE_TTL=3600                        # Cache TTL in seconds

# Rate Limiting
RATE_LIMIT_ENABLED=true               # Enable rate limiting
RATE_LIMIT_WINDOW=900000              # Window in milliseconds
RATE_LIMIT_MAX=100                    # Max requests per window

# Security
CORS_ORIGIN=https://yourdomain.com    # CORS allowed origins
TRUST_PROXY=true                      # Trust proxy headers
```

### Configuration Files

**Production (.env.production):**
```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn
ENABLE_ANALYTICS=true
RATE_LIMIT_ENABLED=true
TRUST_PROXY=true
```

**Development (.env.development):**
```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
ENABLE_ANALYTICS=false
RATE_LIMIT_ENABLED=false
```

### Health Checks

**Health Check Endpoint:**
```javascript
// Add to server.js
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    uptime: process.uptime()
  });
});
```

**Docker Health Check:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

---

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find and kill process using port
   lsof -ti:3000 | xargs kill -9
   ```

2. **Permission Errors**
   ```bash
   # Fix file permissions
   chmod -R 755 /home/perchance/perchance-ai-prompt-library
   chown -R perchance:perchance /home/perchance/perchance-ai-prompt-library
   ```

3. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   export NODE_OPTIONS="--max-old-space-size=1024"
   ```

4. **SSL Certificate Issues**
   ```bash
   # Renew Let's Encrypt certificate
   sudo certbot renew --force-renewal
   sudo systemctl reload nginx
   ```

### Monitoring

```bash
# System resources
htop
df -h
free -m

# Application logs
pm2 logs --lines 100
tail -f /var/log/nginx/access.log

# Application status
pm2 status
sudo systemctl status nginx
```

---

**For additional deployment support, please check our [troubleshooting guide](https://github.com/Gzeu/perchance-ai-prompt-library/wiki/Troubleshooting) or [create an issue](https://github.com/Gzeu/perchance-ai-prompt-library/issues).**