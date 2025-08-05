// validate-encyclopedia.js
const fs = require('fs');

const files = [
  './src/data/styles.json',
  './src/data/subjects.json',
  './src/data/artists.json', 
  './src/data/themes.json',
  './src/data/negatives.json',
  './src/data/recipes.json'
];

console.log('🔍 ENCYCLOPEDIA STRUCTURE VALIDATION');
console.log('='.repeat(50));

let allValid = true;

files.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ ${filePath}: FILE NOT FOUND`);
      allValid = false;
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);
    
    if (Array.isArray(parsed)) {
      const firstItem = parsed[0] || {};
      console.log(`✅ ${filePath}: Array with ${parsed.length} items`);
      console.log(`   First item keys: [${Object.keys(firstItem).join(', ')}]`);
    } else if (parsed && typeof parsed === 'object') {
      console.log(`✅ ${filePath}: Object with keys: [${Object.keys(parsed).join(', ')}]`);
    } else {
      console.log(`⚠️  ${filePath}: Unknown structure type`);
    }
    
  } catch (error) {
    console.error(`❌ ${filePath}: ERROR - ${error.message}`);
    allValid = false;
  }
});

console.log('='.repeat(50));
if (allValid) {
  console.log('🎉 ALL FILES VALID! Ready for npm publish.');
} else {
  console.log('💥 ERRORS FOUND! Fix before publishing.');
  process.exit(1);
}
