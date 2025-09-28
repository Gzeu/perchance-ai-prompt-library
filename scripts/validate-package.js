#!/usr/bin/env node

/**
 * Package validation script
 * Validates package structure, dependencies, and configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating package structure...');

// Check required files
const requiredFiles = [
  'package.json',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  '.env.example',
  'src/index.js',
  'bin/cli.js'
];

let hasErrors = false;

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    console.error(`❌ Missing required file: ${file}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found: ${file}`);
  }
}

// Validate package.json
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check required fields
  const requiredFields = ['name', 'version', 'description', 'main', 'bin', 'author', 'license'];
  for (const field of requiredFields) {
    if (!pkg[field]) {
      console.error(`❌ Missing package.json field: ${field}`);
      hasErrors = true;
    }
  }
  
  console.log(`✅ Package: ${pkg.name}@${pkg.version}`);
} catch (error) {
  console.error(`❌ Invalid package.json: ${error.message}`);
  hasErrors = true;
}

if (hasErrors) {
  console.error('❌ Package validation failed!');
  process.exit(1);
} else {
  console.log('✅ Package validation passed!');
  process.exit(0);
}