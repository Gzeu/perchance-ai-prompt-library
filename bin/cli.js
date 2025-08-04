#!/usr/bin/env node

const { PerchancePromptLibrary } = require('../src/index');
const fs = require('fs');

let inquirer, chalk;
try {
  inquirer = require('inquirer');
  chalk = require('chalk');
} catch (error) {
  console.log('⚠️  Running in basic mode. Install inquirer and chalk for enhanced experience.');
}

const library = new PerchancePromptLibrary();

function showBanner() {
  if (chalk) {
    console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════╗
║           🎨 PERCHANCE AI PROMPT LIBRARY 🎨           ║
║              Advanced Prompt Generator v1.1           ║
╚═══════════════════════════════════════════════════════╝
    `));
    console.log(chalk.yellow('✨ Generate amazing AI prompts instantly! Now with BATCH support!\n'));
  } else {
    console.log(`
🎨 PERCHANCE AI PROMPT LIBRARY v1.1 🎨
   Advanced Prompt Generator
✨ Generate amazing AI prompts instantly!
`);
  }
}

function showHelp() {
  showBanner();
  const helpText = `
📚 AVAILABLE COMMANDS:

🎯 GENERATION:
  generate <style> <subject>     Generate a single prompt
  interactive                   Interactive prompt builder (recommended)
  batch <style> <subject> [--count N]  Generate multiple variations (NEW!)

📋 INFORMATION:
  list                          Show available styles
  stats                         Show library statistics
  styles <style>                Show detailed style information

🔧 UTILITIES:
  export <style> <subject> [--format json|txt] Export prompts to file (NEW!)
  help                          Show this help

📖 EXAMPLES:
  perchance-prompts interactive
  perchance-prompts generate anime "magical girl"
  perchance-prompts batch photorealistic "portrait" --count 5
  perchance-prompts export digital_art "dragon" --format json
  perchance-prompts list

🌟 NEW in v1.1: Batch generation and export functionality!
`;
  console.log(helpText);
}

async function interactiveMode() {
  if (!inquirer || !chalk) {
    console.log('❌ Interactive mode requires inquirer and chalk. Please install them:');
    console.log('npm install inquirer chalk');
    return;
  }

  showBanner();
  
  try {
    const styles = library.listStyles();
    
    console.log(chalk.yellow('🎯 Welcome to Interactive Prompt Builder!\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'style',
        message: '🎨 Choose your art style:',
        choices: styles.map(s => ({
          name: `${s.name} - ${s.description}`,
          value: s.key
        }))
      },
      {
        type: 'input',
        name: 'subject',
        message: '🎯 What is your main subject?',
        validate: input => input.length > 0 || 'Subject is required'
      },
      {
        type: 'confirm',
        name: 'generateVariations',
        message: '🔄 Generate multiple variations? (NEW!)',
        default: false
      },
      {
        type: 'number',
        name: 'variationCount',
        message: '🔢 How many variations?',
        default: 3,
        validate: input => input > 0 && input <= 10 || 'Please enter 1-10 variations',
        when: (answers) => answers.generateVariations
      },
      {
        type: 'confirm',
        name: 'exportResults',
        message: '💾 Export results to file? (NEW!)',
        default: false
      },
      {
        type: 'list',
        name: 'exportFormat',
        message: '📄 Export format:',
        choices: ['json', 'txt'],
        when: (answers) => answers.exportResults
      }
    ]);
    
    console.log(chalk.green('\n🔄 Generating your prompts...\n'));
    
    let results = [];
    
    if (answers.generateVariations) {
      const variations = library.generateVariations(answers.style, answers, answers.variationCount || 3);
      results = variations;
      
      variations.forEach((variation, index) => {
        console.log(chalk.green(`✨ Variation ${index + 1}:`));
        console.log(chalk.white(variation.text));
        console.log(chalk.gray(`📊 Words: ${variation.metadata.wordCount}\n`));
      });
    } else {
      const result = library.generate(answers);
      results = [result];
      
      console.log(chalk.green('✨ Generated Prompt:\n'));
      console.log(chalk.white(result.text));
      console.log(chalk.blue('\n📊 Metadata:'));
      console.log(chalk.gray(`Words: ${result.metadata.wordCount}, Characters: ${result.metadata.characterCount}`));
    }
    
    // Export functionality
    if (answers.exportResults) {
      const filename = `prompts_${answers.style}_${Date.now()}.${answers.exportFormat}`;
      let content;
      
      if (answers.exportFormat === 'json') {
        content = JSON.stringify(results, null, 2);
      } else {
        content = results.map((r, i) => `Prompt ${i+1}:\n${r.text}\n\n`).join('');
      }
      
      fs.writeFileSync(filename, content);
      console.log(chalk.blue(`\n💾 Exported to ${filename}`));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
  }
}

function generateBatch(style, subject, count = 3) {
  try {
    if (chalk) {
      console.log(chalk.yellow(`\n🔄 Generating ${count} variations of "${subject}" in ${style} style...\n`));
    } else {
      console.log(`\nGenerating ${count} variations of "${subject}" in ${style} style...\n`);
    }
    
    const variations = library.generateVariations(style, { subject }, count);
    
    variations.forEach((variation, index) => {
      if (chalk) {
        console.log(chalk.green(`✨ Variation ${index + 1}:`));
        console.log(chalk.white(variation.text));
        console.log(chalk.gray(`📊 Words: ${variation.metadata.wordCount}, Characters: ${variation.metadata.characterCount}\n`));
      } else {
        console.log(`✨ Variation ${index + 1}:`);
        console.log(variation.text);
        console.log(`📊 Words: ${variation.metadata.wordCount}\n`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function exportPrompts(style, subject, format = 'json', count = 5) {
  try {
    const variations = library.generateVariations(style, { subject }, count);
    const filename = `exported_${style}_${subject.replace(/\s+/g, '_')}_${Date.now()}.${format}`;
    
    let content;
    if (format === 'json') {
      content = JSON.stringify(variations, null, 2);
    } else {
      content = `# Exported Prompts - ${style} style: "${subject}"\n\n`;
      content += variations.map((v, i) => `## Prompt ${i+1}\n${v.text}\n\n`).join('');
    }
    
    fs.writeFileSync(filename, content);
    console.log(`✅ Exported ${count} prompts to ${filename}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function generatePrompt(style, subject) {
  try {
    const result = library.generate({ style, subject });
    
    if (chalk) {
      console.log(chalk.green('\n✨ Generated Prompt:'));
      console.log(chalk.white(result.text));
      if (result.negativePrompt) {
        console.log(chalk.red('\n🚫 Negative Prompt:'));
        console.log(chalk.gray(result.negativePrompt));
      }
    } else {
      console.log('\n✨ Generated Prompt:');
      console.log(result.text);
      if (result.negativePrompt) {
        console.log('\n🚫 Negative Prompt:');
        console.log(result.negativePrompt);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function listStyles() {
  const styles = library.listStyles();
  
  if (chalk) {
    console.log(chalk.yellow('\n📋 Available Styles:\n'));
    styles.forEach(style => {
      console.log(chalk.cyan(`• ${style.name}`));
      console.log(chalk.gray(`  ${style.description}`));
      console.log(chalk.blue(`  Variables: ${style.variableCount}\n`));
    });
  } else {
    console.log('\n📋 Available Styles:\n');
    styles.forEach(style => {
      console.log(`• ${style.name} - ${style.description}`);
    });
  }
}

function showStats() {
  const stats = library.getStats();
  
  if (chalk) {
    console.log(chalk.yellow('\n📊 Library Statistics:\n'));
    console.log(chalk.cyan(`🎨 Total Styles: ${stats.totalStyles}`));
    console.log(chalk.cyan(`🔧 Total Variables: ${stats.totalVariables}`));
    console.log(chalk.yellow('\n🎨 Available Styles:'));
    stats.availableStyles.forEach(style => {
      console.log(chalk.gray(`  • ${style}`));
    });
  } else {
    console.log('\n📊 Statistics:');
    console.log(`Total Styles: ${stats.totalStyles}`);
    console.log(`Total Variables: ${stats.totalVariables}`);
    console.log(`Available: ${stats.availableStyles.join(', ')}`);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'interactive':
    case 'i':
      await interactiveMode();
      break;
      
    case 'generate':
    case 'g':
      const style = args[1];
      const subject = args[2];
      if (!style || !subject) {
        console.log('❌ Please provide style and subject');
        console.log('Example: perchance-prompts generate anime "magical girl"');
        return;
      }
      generatePrompt(style, subject);
      break;
      
    case 'batch':
    case 'b':
      const batchStyle = args[1];
      const batchSubject = args[2];
      const countIndex = args.indexOf('--count');
      const count = countIndex !== -1 ? parseInt(args[countIndex + 1]) || 3 : 3;
      
      if (!batchStyle || !batchSubject) {
        console.log('❌ Please provide style and subject for batch generation');
        console.log('Example: perchance-prompts batch anime "warrior" --count 5');
        return;
      }
      generateBatch(batchStyle, batchSubject, count);
      break;
      
    case 'export':
    case 'e':
      const exportStyle = args[1];
      const exportSubject = args[2];
      const formatIndex = args.indexOf('--format');
      const format = formatIndex !== -1 ? args[formatIndex + 1] || 'json' : 'json';
      const exportCountIndex = args.indexOf('--count');
      const exportCount = exportCountIndex !== -1 ? parseInt(args[exportCountIndex + 1]) || 5 : 5;
      
      if (!exportStyle || !exportSubject) {
        console.log('❌ Please provide style and subject for export');
        console.log('Example: perchance-prompts export anime "mage" --format json --count 5');
        return;
      }
      exportPrompts(exportStyle, exportSubject, format, exportCount);
      break;
      
    case 'list':
    case 'l':
      listStyles();
      break;
      
    case 'stats':
    case 's':
      showStats();
      break;
      
    case 'help':
    case 'h':
    case undefined:
      showHelp();
      break;
      
    default:
      console.log(`❌ Unknown command: ${command}`);
      showHelp();
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
