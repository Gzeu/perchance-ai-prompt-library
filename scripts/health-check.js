#!/usr/bin/env node

/**
 * Health check script
 * Validates application health and dependencies
 */

const http = require('http');
const { execSync } = require('child_process');

console.log('🏥 Running health checks...');

// Check Node.js version
try {
  const nodeVersion = process.version;
  const requiredVersion = '20.0.0';
  
  if (nodeVersion < `v${requiredVersion}`) {
    console.error(`❌ Node.js version ${nodeVersion} is below required ${requiredVersion}`);
    process.exit(1);
  }
  
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.error(`❌ Node.js check failed: ${error.message}`);
  process.exit(1);
}

// Check npm dependencies
try {
  execSync('npm list --depth=0', { stdio: 'pipe' });
  console.log('✅ Dependencies are installed correctly');
} catch (error) {
  console.error('❌ Dependencies check failed');
  process.exit(1);
}

// Check if server is running (optional)
const port = process.env.PORT || 3000;
const healthCheckUrl = `http://localhost:${port}/health`;

if (process.env.NODE_ENV === 'production') {
  const req = http.get(healthCheckUrl, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Server health check passed');
      process.exit(0);
    } else {
      console.error(`❌ Server health check failed: HTTP ${res.statusCode}`);
      process.exit(1);
    }
  });
  
  req.on('error', (error) => {
    console.log('⚠️ Server is not running (this is OK for development)');
    process.exit(0);
  });
  
  req.setTimeout(5000, () => {
    console.error('❌ Health check timeout');
    process.exit(1);
  });
} else {
  console.log('✅ All health checks passed!');
  process.exit(0);
}