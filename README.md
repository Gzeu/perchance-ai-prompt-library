# Perchance AI Prompt Library 🎨

Complete prompt library and generator for Perchance AI tools.

## Quick Start

Install dependencies
npm install

Test the library
npm test

Use the CLI
node bin/cli.js generate anime "magical girl"
node bin/cli.js list
node bin/cli.js stats


## Usage

const { PerchancePromptLibrary } = require('./src/index');

const library = new PerchancePromptLibrary();
const prompt = library.generate({
style: 'anime',
subject: 'magical girl',
age: '18'
});

console.log(prompt.text);


## Features

- 🎨 Multiple art styles (anime, cinematic)
- 🤖 Advanced prompt engineering
- 💻 CLI interface
- 📄 Template system
- 🧪 Full test coverage

## License

MIT
