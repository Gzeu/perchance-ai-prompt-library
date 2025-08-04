#!/usr/bin/env node

const { PerchancePromptLibrary } = require('../src/index');

// Simple CLI without heavy dependencies
const args = process.argv.slice(2);
const library = new PerchancePromptLibrary();

function showHelp() {
  console.log(`
🎨 Perchance AI Prompt Library CLI

Usage:
  node bin/cli.js <command> [options]

Commands:
  generate <style> <subject>  - Generate a prompt
  list                       - List available styles
  stats                      - Show statistics
  help                       - Show this help

Examples:
  node bin/cli.js generate anime "magical girl"
  node bin/cli.js list
  node bin/cli.js stats
`);
}

function main() {
  const command = args[0];
  
  try {
    switch (command) {
      case 'generate':
        const style = args[1];
        const subject = args[2];
        if (!style || !subject) {
          console.log('❌ Please provide style and subject');
          console.log('Example: node bin/cli.js generate anime "magical girl"');
          return;
        }
        const result = library.generate({ style, subject });
        console.log('\n✨ Generated Prompt:');
        console.log(result.text);
        if (result.negativePrompt) {
          console.log('\n🚫 Negative Prompt:');
          console.log(result.negativePrompt);
        }
        break;
        
      case 'list':
        const styles = library.listStyles();
        console.log('\n📋 Available Styles:');
        styles.forEach(style => {
          console.log(`• ${style.name} - ${style.description}`);
        });
        break;
        
      case 'stats':
        const stats = library.getStats();
        console.log('\n📊 Statistics:');
        console.log(`Total Styles: ${stats.totalStyles}`);
        console.log(`Total Variables: ${stats.totalVariables}`);
        console.log(`Available: ${stats.availableStyles.join(', ')}`);
        break;
        
      default:
        showHelp();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
