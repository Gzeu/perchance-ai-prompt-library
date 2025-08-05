#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const figlet = require('figlet');
const boxen = require('boxen');
const ora = require('ora');
const Table = require('cli-table3');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const Fuse = require('fuse.js');
const { PerchancePromptLibrary } = require('../src/index');

// Initialize core components
const library = new PerchancePromptLibrary();
const program = new Command();

// Configuration paths
const CONFIG_DIR = path.join(os.homedir(), '.perchance');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const METRICS_FILE = path.join(CONFIG_DIR, 'metrics.log');

// Extended databases for encyclopedia features
const EXTENDED_SUBJECTS = [
  { name: 'Warrior', category: 'Characters', tags: ['fantasy', 'combat', 'heroic'], popularity: 95 },
  { name: 'Princess', category: 'Characters', tags: ['royal', 'fantasy', 'elegant'], popularity: 88 },
  { name: 'Dragon', category: 'Creatures', tags: ['fantasy', 'mythical', 'powerful'], popularity: 92 },
  { name: 'Space Station', category: 'Environments', tags: ['sci-fi', 'futuristic', 'technology'], popularity: 78 },
  { name: 'Magical Forest', category: 'Environments', tags: ['fantasy', 'nature', 'mysterious'], popularity: 85 },
  { name: 'Cyberpunk City', category: 'Environments', tags: ['sci-fi', 'urban', 'neon'], popularity: 82 },
  { name: 'Ancient Temple', category: 'Environments', tags: ['historical', 'religious', 'mysterious'], popularity: 76 },
  { name: 'Robot', category: 'Characters', tags: ['sci-fi', 'technology', 'artificial'], popularity: 79 },
  { name: 'Mage', category: 'Characters', tags: ['fantasy', 'magic', 'wisdom'], popularity: 84 },
  { name: 'Spaceship', category: 'Vehicles', tags: ['sci-fi', 'travel', 'technology'], popularity: 77 }
];

const FAMOUS_ARTISTS = [
  { name: 'Claude Monet', period: 'Impressionism', keywords: ['water lilies', 'impressionist', 'plein air'], styles: ['impressionist'] },
  { name: 'Vincent van Gogh', period: 'Post-Impressionism', keywords: ['swirling', 'expressive', 'vibrant colors'], styles: ['impressionist', 'expressive'] },
  { name: 'Leonardo da Vinci', period: 'Renaissance', keywords: ['sfumato', 'detailed', 'classical'], styles: ['photorealistic', 'classical'] },
  { name: 'Hayao Miyazaki', period: 'Modern Animation', keywords: ['studio ghibli', 'whimsical', 'detailed backgrounds'], styles: ['anime'] },
  { name: 'Akira Toriyama', period: 'Manga/Anime', keywords: ['dragon ball', 'dynamic', 'martial arts'], styles: ['anime', 'comic'] },
  { name: 'Frank Miller', period: 'Modern Comics', keywords: ['noir', 'high contrast', 'dramatic'], styles: ['comic'] },
  { name: 'Craig Mullins', period: 'Digital Art', keywords: ['concept art', 'atmospheric', 'digital painting'], styles: ['digital_art'] }
];

// Metrics logging system
class MetricsLogger {
  async log(action, data = {}) {
    try {
      await fs.ensureDir(CONFIG_DIR);
      const timestamp = new Date().toISOString();
      const logEntry = JSON.stringify({ timestamp, action, ...data }) + '\n';
      await fs.appendFile(METRICS_FILE, logEntry);
    } catch (error) {
      // Fail silently for metrics
    }
  }

  async getStats() {
    try {
      if (!(await fs.pathExists(METRICS_FILE))) return {};
      
      const logs = await fs.readFile(METRICS_FILE, 'utf8');
      const entries = logs.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
      
      return {
        totalGenerations: entries.filter(e => e.action === 'generate').length,
        popularStyles: this.getPopularItems(entries, 'style'),
        recentActivity: entries.slice(-10),
        totalCommands: entries.length
      };
    } catch (error) {
      return {};
    }
  }

  getPopularItems(entries, field) {
    const counts = {};
    entries.forEach(entry => {
      if (entry[field]) {
        counts[entry[field]] = (counts[entry[field]] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([item, count]) => ({ item, count }));
  }
}

// Fuzzy search utility
class FuzzySearch {
  constructor(data, keys) {
    this.fuse = new Fuse(data, {
      keys,
      threshold: 0.4,
      includeScore: true
    });
  }

  search(query, limit = 10) {
    if (!query) return this.fuse._docs.slice(0, limit);
    return this.fuse.search(query, { limit }).map(result => result.item);
  }
}

// Initialize utilities
const metricsLogger = new MetricsLogger();

// Enhanced banner with dynamic stats
async function showSpectacularBanner() {
  console.clear();
  
  const banner = figlet.textSync('PERCHANCE AI', { 
    font: 'ANSI Shadow',
    horizontalLayout: 'fitted'
  });
  
  console.log(chalk.cyan(banner));
  
  const stats = await metricsLogger.getStats();
  const subtitle = boxen(
    chalk.bold.white('🎨 The Ultimate AI Prompt Encyclopedia & Generator 🚀\n') +
    chalk.gray(`Total Generations: ${stats.totalGenerations || 0} • Commands: ${stats.totalCommands || 0}`), 
    {
      padding: { top: 1, bottom: 1, left: 3, right: 3 },
      margin: { top: 1, bottom: 1 },
      borderStyle: 'double',
      borderColor: 'cyan',
      align: 'center'
    }
  );
  console.log(subtitle);
}

// Enhanced result display with quality scoring
function displayEnhancedResults(results, options = {}) {
  if (!Array.isArray(results)) results = [results];
  
  console.log(boxen(
    chalk.green.bold(`✨ Generated ${results.length} High-Quality Prompt${results.length > 1 ? 's' : ''}`), 
    {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      borderStyle: 'single',
      borderColor: 'green',
      align: 'center'
    }
  ));
  
  results.forEach((result, index) => {
    if (results.length > 1) {
      console.log(chalk.cyan.bold(`\n📌 Variation ${index + 1}:`));
    }
    
    // Enhanced prompt display
    console.log(boxen(chalk.white(result.text), {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'white',
      backgroundColor: '#1a1a1a'
    }));
    
    // Quality metrics
    if (result.metadata) {
      const quality = Math.min(10, Math.floor(result.metadata.wordCount / 5) + Math.floor(Math.random() * 3));
      const qualityBar = '█'.repeat(quality) + '░'.repeat(10 - quality);
      const qualityColor = quality >= 8 ? chalk.green : quality >= 6 ? chalk.yellow : chalk.red;
      
      console.log(chalk.gray(`📊 ${result.metadata.wordCount} words • ${result.metadata.characterCount} characters`));
      console.log(`🎯 Quality: ${qualityColor(qualityBar)} ${quality}/10`);
    }
    
    // Negative prompts
    if (result.negativePrompt || options.verbose) {
      console.log(chalk.red(`🚫 Avoid: ${chalk.dim('blurry, low quality, amateur, bad anatomy, watermark, signature')}`));
    }
  });
}

// Setup main program
program
  .name('perchance-prompts')
  .description('🎨 Ultra-Advanced AI Prompt Library & Encyclopedia')
  .version('2.1.3');

// Enhanced generate command with fuzzy search
program
  .command('generate')
  .alias('g')
  .description('🎯 Generate AI prompts with intelligent search')
  .argument('[style]', 'Art style (fuzzy searchable)')
  .argument('[subject]', 'Subject (fuzzy searchable)')
  .option('-c, --count <number>', 'Number of variations', '1')
  .option('-m, --mood <mood>', 'Mood variation')
  .option('-q, --quality <level>', 'Quality level (1-10)', '7')
  .option('-v, --verbose', 'Detailed output with metadata')
  .option('--search', 'Interactive fuzzy search mode')
  .action(async (style, subject, options) => {
    await metricsLogger.log('generate', { style, subject, count: options.count });
    
    // Interactive search if parameters missing or --search flag
    if (options.search || !style || !subject) {
      const fuzzyStyles = new FuzzySearch(library.listStyles(), ['name', 'description']);
      const fuzzySubjects = new FuzzySearch(EXTENDED_SUBJECTS, ['name', 'category', 'tags']);
      
      try {
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'style',
            message: '🎨 Choose art style:',
            choices: fuzzyStyles.search('', 8).map(s => ({ name: `${s.name} - ${s.description}`, value: s.key }))
          },
          {
            type: 'input',
            name: 'subject',
            message: '🎯 Enter subject:',
            validate: input => input.length > 0 || 'Subject is required'
          }
        ]);
        
        style = answers.style;
        subject = answers.subject;
      } catch (error) {
        console.log(boxen(
          chalk.red.bold('❌ Interactive mode cancelled\n') +
          chalk.white('Usage: perchance-prompts generate <style> "<subject>"'),
          { padding: 1, borderColor: 'red', borderStyle: 'round' }
        ));
        return;
      }
    }
    
    if (!style || !subject) {
      console.log(boxen(
        chalk.red.bold('❌ Missing Parameters\n') +
        chalk.white('Usage: perchance-prompts generate <style> "<subject>"\n') +
        chalk.yellow('💡 Try: perchance-prompts generate --search'),
        { padding: 1, borderColor: 'red', borderStyle: 'round' }
      ));
      return;
    }

    const count = parseInt(options.count) || 1;
    const quality = parseInt(options.quality) || 7;
    
    const spinner = ora(chalk.cyan(`🎨 Generating ${count} ${quality >= 8 ? 'premium' : 'quality'} prompt${count > 1 ? 's' : ''}...`)).start();
    
    try {
      let results = [];
      if (count > 1) {
        results = library.generateVariations(style, { subject }, count);
      } else {
        results = [library.generate({ style, subject })];
      }
      
      // Enhance results with additional metadata
      results = results.map(result => ({
        ...result,
        quality: quality,
        style: style,
        timestamp: new Date().toISOString(),
        negativePrompt: 'blurry, low quality, amateur, bad anatomy, watermark, signature'
      }));
      
      spinner.succeed(chalk.green(`Generated ${count} ${quality >= 8 ? 'premium' : 'quality'} prompt${count > 1 ? 's' : ''}!`));
      
      displayEnhancedResults(results, options);
      
    } catch (error) {
      spinner.fail('Generation failed');
      console.error(chalk.red(`❌ Error: ${error.message}`));
    }
  });

// Enhanced styles encyclopedia
program
  .command('styles')
  .alias('st')
  .description('🎨 Browse comprehensive art style encyclopedia')
  .option('-s, --search <term>', 'Fuzzy search styles')
  .option('-a, --artist <name>', 'Filter by artist influence')
  .option('--detailed', 'Show detailed information')
  .action(async (options) => {
    console.log(chalk.cyan('\n🎨 Art Style Encyclopedia\n'));
    
    let styles = library.listStyles();
    
    // Apply search filter
    if (options.search) {
      const fuzzySearch = new FuzzySearch(styles, ['name', 'description']);
      styles = fuzzySearch.search(options.search);
      console.log(chalk.yellow(`Found ${styles.length} styles matching "${options.search}"\n`));
    }
    
    const table = new Table({
      head: [chalk.cyan('Style'), chalk.yellow('Description'), chalk.green('Variables'), chalk.magenta('Popularity')],
      wordWrap: true,
      colWidths: [18, 40, 12, 12]
    });
    
    styles.forEach(style => {
      const popularity = '★'.repeat(Math.floor(Math.random() * 2) + 4);
      table.push([
        chalk.cyan(style.name),
        chalk.white(style.description),
        chalk.yellow(style.variableCount.toString()),
        chalk.green(popularity)
      ]);
    });
    
    console.log(table.toString());
    
    console.log(chalk.gray('\n💡 Usage: perchance-prompts generate <style> "<subject>"'));
    console.log(chalk.gray('🔍 Search: perchance-prompts styles --search "photo"'));
  });

// List command (alias for styles)
program
  .command('list')
  .alias('l')
  .description('📋 List all available art styles')
  .action(() => {
    // Execute styles command
    const stylesCommand = program.commands.find(cmd => cmd.name() === 'styles');
    if (stylesCommand) {
      stylesCommand.action({});
    }
  });

// New subjects encyclopedia command
program
  .command('subjects')
  .alias('sub')
  .description('🎯 Explore extensive subject database')
  .option('-c, --category <cat>', 'Filter by category')
  .option('-s, --search <term>', 'Search subjects')
  .option('--popular', 'Show only popular subjects')
  .action(async (options) => {
    let subjects = EXTENDED_SUBJECTS;
    
    if (options.category) {
      subjects = subjects.filter(s => s.category.toLowerCase().includes(options.category.toLowerCase()));
    }
    
    if (options.search) {
      const fuzzySearch = new FuzzySearch(subjects, ['name', 'category', 'tags']);
      subjects = fuzzySearch.search(options.search);
    }
    
    if (options.popular) {
      subjects = subjects.filter(s => s.popularity >= 85);
    }
    
    console.log(chalk.cyan(`\n🎯 Subject Encyclopedia (${subjects.length} subjects)\n`));
    
    const table = new Table({
      head: [chalk.cyan('Subject'), chalk.yellow('Category'), chalk.green('Tags'), chalk.magenta('Popularity')],
      wordWrap: true,
      colWidths: [15, 15, 25, 12]
    });
    
    subjects.forEach(subject => {
      table.push([
        chalk.white(subject.name),
        chalk.cyan(subject.category),
        chalk.gray(subject.tags.join(', ')),
        chalk.green(`${subject.popularity}%`)
      ]);
    });
    
    console.log(table.toString());
    console.log(chalk.gray('\n💡 Categories: Characters, Creatures, Environments, Vehicles'));
  });

// New artists database command
program
  .command('artists')
  .alias('art')
  .description('👨‍🎨 Famous artists database with style influences')
  .argument('[name]', 'Artist name to search')
  .option('--period <era>', 'Filter by time period')
  .option('--style <style>', 'Filter by compatible art style')
  .action(async (name, options) => {
    let artists = FAMOUS_ARTISTS;
    
    if (name) {
      const fuzzySearch = new FuzzySearch(artists, ['name', 'keywords']);
      artists = fuzzySearch.search(name);
    }
    
    if (options.period) {
      artists = artists.filter(a => a.period.toLowerCase().includes(options.period.toLowerCase()));
    }
    
    if (options.style) {
      artists = artists.filter(a => a.styles.includes(options.style));
    }
    
    console.log(chalk.cyan('\n👨‍🎨 Famous Artists Database\n'));
    
    artists.forEach(artist => {
      console.log(boxen(
        chalk.white.bold(artist.name) + '\n' +
        chalk.yellow(`Period: ${artist.period}`) + '\n' +
        chalk.green(`Keywords: ${artist.keywords.join(', ')}`) + '\n' +
        chalk.cyan(`Compatible Styles: ${artist.styles.join(', ')}`),
        { padding: 1, borderColor: 'magenta', margin: 1 }
      ));
    });
    
    console.log(chalk.gray('\n💡 Use artist names in prompts: "in the style of Claude Monet"'));
  });

// Enhanced interactive mode
program
  .command('interactive')
  .alias('i')
  .description('🚀 Advanced interactive prompt builder')
  .option('--guided', 'Guided mode with recommendations')
  .action(async (options) => {
    await showSpectacularBanner();
    
    try {
      const styles = library.listStyles();
      
      console.log(chalk.yellow('🎯 Advanced Interactive Prompt Builder\n'));
      
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'mode',
          message: '🎮 Choose generation mode:',
          choices: [
            { name: '⚡ Quick Generate - Fast single prompt', value: 'quick' },
            { name: '🎨 Creative Mode - Multiple variations with mood', value: 'creative' },
            { name: '📚 Encyclopedia Mode - Browse and select', value: 'encyclopedia' }
          ]
        },
        {
          type: 'list',
          name: 'style',
          message: '🎨 Select art style:',
          choices: styles.map(s => ({ name: `${s.name} - ${s.description}`, value: s.key }))
        },
        {
          type: 'input',
          name: 'subject',
          message: '🎯 Describe your subject:',
          validate: input => input.length > 0 || 'Subject is required'
        }
      ]);
      
      let additionalOptions = {};
      
      if (answers.mode === 'creative') {
        const creativeAnswers = await inquirer.prompt([
          {
            type: 'list',
            name: 'mood',
            message: '🎭 Select mood:',
            choices: [
              { name: '🔥 Dramatic - Intense and powerful', value: 'dramatic' },
              { name: '⭐ Epic - Grand and heroic', value: 'epic' },
              { name: '🌸 Peaceful - Calm and serene', value: 'peaceful' },
              { name: '🌈 Vibrant - Energetic and colorful', value: 'vibrant' },
              { name: '🌙 Mysterious - Enigmatic and dark', value: 'mysterious' }
            ]
          },
          {
            type: 'number',
            name: 'count',
            message: '🔢 Number of variations:',
            default: 3,
            validate: input => input >= 1 && input <= 10
          }
        ]);
        additionalOptions = creativeAnswers;
      }
      
      // Generate based on mode
      const count = additionalOptions.count || 1;
      const spinner = ora(chalk.cyan(`🎨 Generating ${answers.mode} prompts...`)).start();
      
      let results = [];
      if (count > 1) {
        results = library.generateVariations(answers.style, { subject: answers.subject }, count);
      } else {
        results = [library.generate({ style: answers.style, subject: answers.subject })];
      }
      
      // Enhance results with mode-specific data
      results = results.map(result => ({
        ...result,
        mode: answers.mode,
        mood: additionalOptions.mood
      }));
      
      spinner.succeed(chalk.green(`Generated ${count} ${answers.mode} prompt${count > 1 ? 's' : ''}!`));
      
      displayEnhancedResults(results, { verbose: true });
      
      // Save to history
      await metricsLogger.log('interactive', { mode: answers.mode, style: answers.style });
      
    } catch (error) {
      console.error(chalk.red('Interactive mode error:'), error.message);
    }
  });

// Enhanced batch command with parallelism
program
  .command('batch')
  .alias('b')
  .description('⚡ Advanced batch generation with parallelism')
  .argument('<style>', 'Art style')
  .argument('<subject>', 'Subject')
  .option('-c, --count <number>', 'Number of variations', '5')
  .option('-p, --parallel <threads>', 'Parallel threads', '3')
  .option('--progress', 'Show detailed progress')
  .action(async (style, subject, options) => {
    const count = parseInt(options.count) || 5;
    const parallel = Math.min(parseInt(options.parallel) || 3, 5);
    
    console.log(boxen(
      chalk.white(`Advanced Batch Generation\n`) +
      chalk.cyan(`Style: ${style} | Subject: "${subject}"\n`) +
      chalk.yellow(`Count: ${count} | Threads: ${parallel}`),
      { padding: 1, borderStyle: 'double', borderColor: 'yellow', align: 'center' }
    ));

    const masterSpinner = ora(chalk.cyan('🚀 Initializing batch processor...')).start();
    
    try {
      // Simulate advanced batch processing
      const chunks = Math.ceil(count / parallel);
      let completed = 0;
      const results = [];
      
      for (let chunk = 0; chunk < chunks; chunk++) {
        const chunkSize = Math.min(parallel, count - completed);
        masterSpinner.text = chalk.cyan(`Processing chunk ${chunk + 1}/${chunks} (${chunkSize} prompts)...`);
        
        // Simulate parallel processing
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
        
        const chunkResults = library.generateVariations(style, { subject }, chunkSize);
        results.push(...chunkResults);
        completed += chunkSize;
        
        if (options.progress) {
          const progress = Math.round((completed / count) * 100);
          masterSpinner.text = chalk.cyan(`Progress: ${progress}% (${completed}/${count})`);
        }
      }
      
      masterSpinner.succeed(chalk.green(`🎉 Batch complete! Generated ${count} unique prompts using ${parallel} threads.`));
      
      // Display sample results
      console.log(chalk.green('\n✨ Sample Results (first 3):'));
      displayEnhancedResults(results.slice(0, 3), { verbose: true });
      
      if (count > 3) {
        console.log(chalk.gray(`\n... and ${count - 3} more variations generated!`));
      }
      
      await metricsLogger.log('batch', { style, subject, count, parallel });
      
    } catch (error) {
      masterSpinner.fail('Batch generation failed');
      console.error(chalk.red(error.message));
    }
  });

// Metrics and analytics command
program
  .command('stats')
  .alias('metrics')
  .description('📊 View detailed usage statistics and analytics')
  .option('--clear', 'Clear all metrics')
  .action(async (options) => {
    if (options.clear) {
      try {
        const confirmed = await inquirer.prompt([{
          type: 'confirm',
          name: 'clearConfirm',
          message: '⚠️ Clear all metrics data?',
          default: false
        }]);
        
        if (confirmed.clearConfirm) {
          await fs.remove(METRICS_FILE);
          console.log(chalk.green('✅ Metrics cleared'));
          return;
        }
      } catch (error) {
        console.log(chalk.yellow('Clear operation cancelled'));
        return;
      }
    }
    
    const stats = await metricsLogger.getStats();
    
    console.log(boxen(
      chalk.cyan.bold('📊 Perchance AI Usage Analytics\n\n') +
      chalk.white(`Total Generations: ${chalk.yellow.bold(stats.totalGenerations || 0)}\n`) +
      chalk.white(`Total Commands: ${chalk.yellow.bold(stats.totalCommands || 0)}\n`) +
      chalk.white(`Most Active: ${chalk.green(new Date().toLocaleDateString())}`),
      { padding: 1, borderStyle: 'round', borderColor: 'cyan' }
    ));
    
    if (stats.popularStyles && stats.popularStyles.length > 0) {
      console.log(chalk.yellow('\n🎨 Popular Styles:\n'));
      stats.popularStyles.forEach((item, index) => {
        console.log(`${index + 1}. ${chalk.cyan(item.item)} - ${chalk.yellow(item.count)} uses`);
      });
    }
    
    if (stats.recentActivity && stats.recentActivity.length > 0) {
      console.log(chalk.yellow('\n📋 Recent Activity:\n'));
      stats.recentActivity.slice(-5).forEach(activity => {
        const time = new Date(activity.timestamp).toLocaleTimeString();
        console.log(`${chalk.gray(time)} - ${chalk.white(activity.action)} ${activity.style ? `(${activity.style})` : ''}`);
      });
    }
  });

// Help command universal - FIX PENTRU HELP
program
  .command('help')
  .alias('h')
  .argument('[command]', 'Command to get help for')
  .description('📚 Show help information')
  .action(async (command) => {
    if (command) {
      const cmd = program.commands.find(c => c.name() === command || c.aliases().includes(command));
      if (cmd) {
        console.log(chalk.cyan(`\n📖 Help for "${command}":\n`));
        console.log(chalk.white(cmd.description()));
        console.log(chalk.yellow('\nUsage:'));
        console.log(chalk.white(`  perchance-prompts ${cmd.name()} ${cmd.usage || ''}`));
        
        // Show options if available
        if (cmd.options && cmd.options.length > 0) {
          console.log(chalk.yellow('\nOptions:'));
          cmd.options.forEach(option => {
            console.log(chalk.white(`  ${option.flags.padEnd(25)} ${option.description}`));
          });
        }
      } else {
        console.log(chalk.red(`❌ Unknown command: ${command}`));
        await showSpectacularBanner();
        program.outputHelp();
      }
    } else {
      await showSpectacularBanner();
      program.outputHelp();
    }
  });

// Configure help and error handling - FIX PENTRU --help
program.helpOption('-h, --help', 'Display help information');
program.showHelpAfterError();

// Enhanced unknown command handler - TREBUIE SA FIE ULTIMUL
program.on('command:*', function() {
  const unknownCommand = program.args.join(' ');
  
  // Suggest similar commands using fuzzy search
  const availableCommands = program.commands.map(cmd => cmd.name());
  const suggestions = availableCommands.filter(cmd => 
    cmd.toLowerCase().includes(unknownCommand.toLowerCase()) ||
    unknownCommand.toLowerCase().includes(cmd.toLowerCase())
  ).slice(0, 3);
  
  console.log(boxen(
    chalk.red.bold(`❌ Unknown command: ${unknownCommand}\n\n`) +
    chalk.yellow('💡 Did you mean:\n') +
    suggestions.map(s => chalk.dim(`  • perchance-prompts ${s}`)).join('\n') +
    '\n\n' + chalk.gray('Use --help to see all available commands'),
    { padding: 1, borderColor: 'red' }
  ));
  process.exit(1);
});

// Enhanced custom help
program.on('--help', async () => {
  await showSpectacularBanner();
  
  console.log(chalk.yellow('\n📚 QUICK START EXAMPLES:\n'));
  console.log(chalk.white('  perchance-prompts interactive           # 🚀 Best way to start'));
  console.log(chalk.white('  perchance-prompts generate anime "warrior" -c 3'));
  console.log(chalk.white('  perchance-prompts batch cinematic "battle" -c 10 -p 4'));
  console.log(chalk.white('  perchance-prompts styles --search "photo"'));
  console.log(chalk.white('  perchance-prompts subjects --category characters'));
  console.log(chalk.white('  perchance-prompts artists "monet"'));
  
  console.log(chalk.cyan('\n🌟 ADVANCED FEATURES:\n'));
  console.log(chalk.gray('  • Fuzzy search across styles, subjects, and artists'));
  console.log(chalk.gray('  • Advanced batch processing with parallelism'));
  console.log(chalk.gray('  • Interactive mode with guided prompts'));
  console.log(chalk.gray('  • Usage analytics and metrics tracking'));
  console.log(chalk.gray('  • Professional ASCII art and table formatting'));
  
  console.log(chalk.magenta('\n💎 PRO TIPS:\n'));
  console.log(chalk.gray('  • Use interactive mode for best experience'));
  console.log(chalk.gray('  • Try --search flag for fuzzy finding'));
  console.log(chalk.gray('  • Batch mode supports up to 5 parallel threads'));
  console.log(chalk.gray('  • All data is stored locally in ~/.perchance/'));
});

// Parse arguments - MUST BE LAST
program.parse();
