const fs = require('fs');
const path = require('path');

const files = [
  'src/data/styles.json',
  'src/data/subjects.json', 
  'src/data/artists.json',
  'src/data/themes.json',
  'src/data/negatives.json',
  'src/data/recipes.json'
];

console.log('🔍 COMPLETE DATA STRUCTURE VALIDATION');
console.log('='.repeat(60));

files.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const data = JSON.parse(content);
      
      console.log(`✅ ${file}:`);
      console.log(`   📊 Type: ${Array.isArray(data) ? 'Array' : 'Object'}`);
      console.log(`   📏 Size: ${Array.isArray(data) ? data.length + ' items' : Object.keys(data).length + ' keys'}`);
      console.log(`   🔑 First keys: [${Object.keys(Array.isArray(data) ? (data[0] || {}) : data).slice(0, 5).join(', ')}]`);
      console.log('');
    } else {
      console.log(`❌ ${file}: FILE NOT FOUND`);
    }
  } catch (error) {
    console.log(`💥 ${file}: JSON ERROR - ${error.message}`);
  }
});

// Test node_modules data too
const nodeModulesPath = 'node_modules/perchance-ai-prompt-library/src/data/styles.json';
if (fs.existsSync(nodeModulesPath)) {
  console.log('📦 NPM Package data found in node_modules');
} else {
  console.log('📦 No NPM package data in node_modules');
}
