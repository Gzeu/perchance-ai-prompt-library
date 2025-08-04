#!/usr/bin/env node

const { PerchancePromptLibrary } = require('../src/index');
const path = require('path');
const fs = require('fs');

// Try to load inquirer and chalk, fallback to simple mode if not available
let inquirer, chalk;
try {
  inquirer = require('inquirer');
  chalk = require('chalk');
} catch (error) {
  // Fallback mode without fancy CLI
  console.log('⚠️  Running in basic mode. Install inquirer and chalk for enhanced experience.');
}

const library = new PerchancePromptLibrary();

function showBanner() {
  if (chalk) {
    console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════╗
║           🎨 PERCHANCE AI PROMPT LIBRARY 🎨           ║
║              Advanced Prompt Generator                ║
╚═══════════════════════════════════════════════════════╝
    `));
    console.log(chalk.yellow('✨ Generate amazing AI prompts instantly!\n'));
  } else {
    console.log(`
🎨 PERCHANCE AI PROMPT LIBRARY 🎨
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
  generate <style> <subject>     Generate a prompt
  interactive                   Interactive prompt builder (recommended)
  batch <style> <subject>       Generate multiple variations

📋 INFORMATION:
  list                          Show available styles
  stats                         Show library statistics
  styles <style>                Show detailed style information

📄 TEMPLATES:
  templates                     List saved templates
  save-template <name>          Save current config as template
  use-template <name>           Generate from template

🔧 UTILITIES:
  export <format>               Export prompts to file
  help                          Show this help

📖 EXAMPLES:
  perchance-prompts interactive
  perchance-prompts generate anime "magical girl"
  perchance-prompts batch photorealistic "portrait" --count 5
  perchance-prompts list

🌟 TIP: Use 'interactive' for the best experience!
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
          value: s.key,
          short: s.name
        })),
        pageSize: 10
      },
      {
        type: 'input',
        name: 'subject',
        message: '🎯 What is your main subject?',
        validate: input => input.length > 0 || 'Subject is required',
        transformer: input => chalk.cyan(input)
      },
      {
        type: 'confirm',
        name: 'addDetails',
        message: '🔧 Would you like to add more details?',
        default: true
      },
      {
        type: 'input',
        name: 'age',
        message: '👤 Age (optional):',
        when: (answers) => answers.addDetails && ['anime', 'photorealistic', 'cinematic'].includes(answers.style)
      },
      {
        type: 'list',
        name: 'gender',
        message: '⚧ Gender:',
        choices: ['woman', 'man', 'person', 'girl', 'boy'],
        when: (answers) => answers.addDetails && ['anime', 'photorealistic', 'cinematic'].includes(answers.style)
      },
      {
        type: 'input',
        name: 'clothing',
        message: '👕 Clothing description (optional):'
      },
      {
        type: 'input',
        name: 'setting',
        message: '🌍 Setting/Background (optional):'
      },
      {
        type: 'confirm',
        name: 'generateVariations',
        message: '🔄 Generate multiple variations?',
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
        name: 'includeNegative',
        message: '🚫 Include negative prompt?',
        default: true
      },
      {
        type: 'confirm',
        name: 'saveAsTemplate',
        message: '💾 Save this configuration as template?',
        default: false
      },
      {
        type: 'input',
        name: 'templateName',
        message: '📄 Template name:',
        when: (answers) => answers.saveAsTemplate,
        validate: input => input.length > 0 || 'Template name is required'
      }
    ]);
    
    // Clean up answers
    Object.keys(answers).forEach(key => {
      if (answers[key] === '' || answers[key] === undefined) {
        delete answers[key];
      }
    });
    
    console.log(chalk.green('\n🔄 Generating your prompts...\n'));
    
    if (answers.generateVariations) {
      const variations = library.generateVariations(answers.style, answers, answers.variationCount || 3);
      
      variations.forEach((variation, index) => {
        console.log(chalk.green(`✨ Variation ${index + 1}:`));
        console.log(chalk.white(variation.text));
        console.log(chalk.gray(`📊 Words: ${variation.metadata.wordCount}, Characters: ${variation.metadata.characterCount}\n`));
      });
      
      if (answers.includeNegative && variations[0].negativePrompt) {
        console.log(chalk.red('🚫 Negative Prompt (same for all):'));
        console.log(chalk.gray(variations[0].negativePrompt));
      }
    } else {
      const result = library.generate(answers);
      
      console.log(chalk.green('✨ Generated Prompt:\n'));
      console.log(chalk.white(result.text));
      
      if (result.negativePrompt && answers.includeNegative) {
        console.log(chalk.red('\n🚫 Negative Prompt:\n'));
        console.log(chalk.gray(result.negativePrompt));
      }
      
      console.log(chalk.blue('\n📊 Metadata:'));
      console.log(chalk.gray(`Words: ${result.metadata.wordCount}, Characters: ${result.metadata.characterCount}`));
    }
    
    // Save template if requested
    if (answers.saveAsTemplate && answers.templateName) {
      try {
        const configToSave = { ...answers };
        delete configToSave.saveAsTemplate;
        delete configToSave.templateName;
        delete configToSave.generateVariations;
        delete configToSave.variationCount;
        delete configToSave.includeNegative;
        delete configToSave.addDetails;
        
        library.saveTemplate(answers.templateName, configToSave);
        console.log(chalk.blue(`\n💾 Template "${answers.templateName}" saved successfully!`));
      } catch (error) {
        console.log(chalk.red(`\n❌ Failed to save template: ${error.message}`));
      }
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  }
}

function generatePrompt(style, subject, options = {}) {
  try {
    const config = {
      style: style,
      subject: subject,
      ...options
    };
    
    const result = library.generate(config);
    
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
      console.log(chalk.blue(`  Variables: ${style.variableCount} | Examples: ${style.hasExamples ? 'Yes' : 'No'}\n`));
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
    console.log(chalk.cyan(`📁 Categories: ${stats.categories ? stats.categories.join(', ') : 'N/A'}`));
    console.log(chalk.cyan(`🎯 Difficulties: ${stats.difficulties ? stats.difficulties.join(', ') : 'N/A'}`));
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
      
    case 'list':
    case 'l':
      listStyles();
      break;
      
    case 'stats':
    case 's':
      showStats();
      break;
      
    case 'batch':
      // TODO: Implement batch generation
      console.log('🚧 Batch generation coming soon!');
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
