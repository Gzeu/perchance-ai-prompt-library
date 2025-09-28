#!/usr/bin/env node

/**
 * Health check script
 * Validates application health and dependencies
 */

const http = require('http');

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

// Check basic package.json exists
try {
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Package: ${pkg.name}@${pkg.version}`);
} catch (error) {
  console.error(`❌ Package.json check failed: ${error.message}`);
  process.exit(1);
}

console.log('✅ All health checks passed!');
process.exit(0);