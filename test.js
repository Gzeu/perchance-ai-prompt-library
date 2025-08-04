// Creează un fișier test.js
const { PerchancePromptLibrary } = require('./src/index');

const library = new PerchancePromptLibrary();

// Generează un prompt
const result = library.generate({
  style: 'anime',
  subject: 'magical sorceress',
  age: '22',
  clothing: 'magical robes'
});

console.log('✨ Generated Prompt:');
console.log(result.text);
console.log('\n🚫 Negative Prompt:');
console.log(result.negativePrompt);
