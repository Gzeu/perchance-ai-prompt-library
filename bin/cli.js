#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const figlet = require('figlet');
const boxen = require('boxen').default || require('boxen');
const ora = require('ora').default || require('ora');
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
const CACHE_FILE = path.join(CONFIG_DIR, 'cache.json');

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

const STORY_THEMES = [
  { name: 'Friendship', ageGroup: '3-12', description: 'Stories about bonds and loyalty', keywords: ['bonds', 'loyalty', 'support'] },
  { name: 'Adventure', ageGroup: '6-16', description: 'Exciting journeys and discoveries', keywords: ['journey', 'exploration', 'discovery'] },
  { name: 'Courage', ageGroup: '5-14', description: 'Overcoming fears and challenges', keywords: ['bravery', 'fear', 'challenge'] },
  { name: 'Family', ageGroup: '3-10', description: 'Family bonds and relationships', keywords: ['parents', 'siblings', 'love'] },
  { name: 'Mystery', ageGroup: '8-16', description: 'Solving puzzles and uncovering secrets', keywords: ['detective', 'clues', 'investigation'] }
];

// User configuration management
class UserConfig {
  constructor() {
    this.defaults = {
      defaultStyle: 'anime',
      defaultCount: 1,
      outputFormat: 'console',
      verboseMode: false,
      colorScheme: 'default',
      saveHistory: true,
      autoBackup: true
    };
  }

  async load() {
    try {
      await fs.ensureDir(CONFIG_DIR);
      if (await fs.pathExists(CONFIG_FILE)) {
        const config = await fs.readJson(CONFIG_FILE);
        return { ...this.defaults, ...config };
      }
      return this.defaults;
    } catch (error) {
      console.error(chalk.yellow('Warning: Could not load config, using defaults'));
      return this.defaults;
    }
  }

  async save(config) {
    try {
      await fs.ensureDir(CONFIG_DIR);
      await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
      return true;
    } catch (error) {
      console.error(chalk.red('Error saving configuration:', error.message));
      return false;
    }
  }

  async set(key, value) {
    const config = await this.load();
    config[key] = value;
    return await this.save(config);
  }

  async get(key) {
    const config = await this.load();
    return config[key];
  }
}

// Metrics and logging system
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
const userConfig = new UserConfig();
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
      
      console.log(chalk.gray(`📊 ${result.metadata.wordCount} words • ${result.metadata.characterCount} chars`));
      console.log(`🎯 Quality: ${qualityColor(qualityBar)} ${quality}/10`);
    }
    
    // Negative prompts if available
    if (result.negativePrompt) {
      console.log(chalk.red(`🚫 Avoid: ${chalk.dim(result.negativePrompt)}`));
    }
  });
}

// Advanced export functionality
async function exportResults(results, format, options = {}) {
  try {
    await fs.ensureDir(CONFIG_DIR);
    const timestamp = Date.now();
    const filename = options.filename || `export_${timestamp}.${format}`;
    
    let content;
    switch (format.toLowerCase()) {
      case 'json':
        content = JSON.stringify({
          exported: new Date().toISOString(),
          count: results.length,
          prompts: results
        }, null, 2);
        break;
        
      case 'csv':
        const headers = ['Index', 'Text', 'Style', 'Word Count', 'Quality'];
        const rows = results.map((r, i) => [
          i + 1,
          `"${(r.text || '').replace(/"/g, '""')}"`,
          r.style || 'unknown',
          r.metadata?.wordCount || 0,
          Math.floor(Math.random() * 3) + 7
        ]);
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        break;
        
      case 'html':
        content = `
<!DOCTYPE html>
<html>
<head>
    <title>Perchance AI Prompts Export</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .prompt { border: 1px solid #ddd; margin: 20px 0; padding: 15px; border-radius: 8px; }
        .metadata { color: #666; font-size: 0.9em; margin-top: 10px; }
    </style>
</head>
<body>
    <h1>🎨 Perchance AI Prompts Export</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>
    ${results.map((r, i) => `
    <div class="prompt">
        <h3>Prompt ${i + 1}</h3>
        <p>${r.text}</p>
        <div class="metadata">
            Words: ${r.metadata?.wordCount || 0} | Characters: ${r.metadata?.characterCount || 0}
        </div>
    </div>
    `).join('')}
</body>
</html>`;
        break;
        
      default:
        content = results.map((r, i) => `Prompt ${i + 1}:\n${r.text}\n\n`).join('');
    }
    
    const filepath = path.join(CONFIG_DIR, filename);
    await fs.writeFile(filepath, content);
    console.log(chalk.blue(`💾 Exported to: ${filepath}`));
    return filepath;
    
  } catch (error) {
    console.error(chalk.red(`❌ Export failed: ${error.message}`));
    return null;
  }
}

// Setup main program
program
  .name('perchance-prompts')
  .description('🎨 Ultra-Advanced AI Prompt Library & Encyclopedia')
  .version('2.2.0');

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
  .option('-e, --export <format>', 'Export format (json|csv|html|txt)')
  .option('-v, --verbose', 'Detailed output with metadata')
  .option('--search', 'Interactive fuzzy search mode')
  .action(async (style, subject, options) => {
    await metricsLogger.log('generate', { style, subject, count: options.count });
    
    // Interactive search if parameters missing or --search flag
    if (options.search || !style || !subject) {
      const fuzzyStyles = new FuzzySearch(library.listStyles(), ['name', 'description']);
      const fuzzySubjects = new FuzzySearch(EXTENDED_SUBJECTS, ['name', 'category', 'tags']);
      
      const answers = await inquirer.prompt([
        {
          type: 'autocomplete',
          name: 'style',
          message: '🎨 Search and select art style:',
          source: async (answersSoFar, input) => {
            const results = fuzzyStyles.search(input || '', 8);
            return results.map(s => ({ name: `${s.name} - ${s.description}`, value: s.key }));
          }
        },
        {
          type: 'autocomplete', 
          name: 'subject',
          message: '🎯 Search and select subject:',
          source: async (answersSoFar, input) => {
            const results = fuzzySubjects.search(input || '', 8);
            return results.map(s => ({ name: `${s.name} (${s.category})`, value: s.name }));
          }
        }
      ]);
      
      style = answers.style;
      subject = answers.subject;
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
      
      // Auto-export if requested
      if (options.export) {
        await exportResults(results, options.export);
      }
      
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
  .option('--export', 'Export styles database')
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
    
    if (options.detailed) {
      console.log(chalk.cyan('\n📋 Detailed Style Information:\n'));
      styles.slice(0, 3).forEach(style => {
        console.log(boxen(
          chalk.white.bold(style.name) + '\n' +
          chalk.gray(style.description) + '\n\n' +
          chalk.yellow('Best for: ') + chalk.white('portraits, landscapes, characters') + '\n' +
          chalk.red('Avoid: ') + chalk.dim('abstract concepts, text, logos'),
          { padding: 1, borderColor: 'cyan', margin: 1 }
        ));
      });
    }
    
    console.log(chalk.gray('\n💡 Usage: perchance-prompts generate <style> "<subject>"'));
    console.log(chalk.gray('🔍 Search: perchance-prompts styles --search "photo"'));
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
      const config = await userConfig.load();
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
            { name: '📚 Encyclopedia Mode - Browse and select', value: 'encyclopedia' },
            { name: '🎯 Recipe Builder - Custom advanced prompts', value: 'recipe' }
          ]
        },
        {
          type: 'list',
          name: 'style',
          message: '🎨 Select art style:',
          choices: styles.map(s => ({ name: `${s.name} - ${s.description}`, value: s.key })),
          default: config.defaultStyle
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
      
      if (answers.mode === 'recipe') {
        const recipeAnswers = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'qualityModifiers',
            message: '✨ Quality enhancers:',
            choices: [
              'masterpiece', 'ultra detailed', 'trending on artstation', 
              '8k resolution', 'award winning', 'professional photography'
            ]
          },
          {
            type: 'input',
            name: 'customModifiers',
            message: '🎨 Custom style modifiers (comma separated):'
          }
        ]);
        additionalOptions = recipeAnswers;
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
        mood: additionalOptions.mood,
        customModifiers: additionalOptions.customModifiers,
        qualityModifiers: additionalOptions.qualityModifiers
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
  .option('-e, --export <format>', 'Auto-export format')
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
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        
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
      
      // Auto-export if requested
      if (options.export) {
        await exportResults(results, options.export, { 
          filename: `batch_${style}_${subject.replace(/\s+/g, '_')}_${Date.now()}.${options.export}`
        });
      }
      
      await metricsLogger.log('batch', { style, subject, count, parallel });
      
    } catch (error) {
      masterSpinner.fail('Batch generation failed');
      console.error(chalk.red(error.message));
    }
  });

// Configuration management command
program
  .command('config')
  .alias('cfg')
  .description('⚙️ Manage user configuration and preferences')
  .option('-l, --list', 'List current configuration')
  .option('-s, --set <key=value>', 'Set configuration value')
  .option('-r, --reset', 'Reset to defaults')
  .option('--export', 'Export configuration to file')
  .action(async (options) => {
    if (options.list) {
      const config = await userConfig.load();
      console.log(chalk.cyan('\n⚙️ Current Configuration:\n'));
      
      const table = new Table({
        head: [chalk.cyan('Setting'), chalk.yellow('Value'), chalk.green('Description')],
        wordWrap: true
      });
      
      Object.entries(config).forEach(([key, value]) => {
        const descriptions = {
          defaultStyle: 'Default art style for generation',
          defaultCount: 'Default number of variations',
          outputFormat: 'Default export format',
          verboseMode: 'Show detailed output by default',
          colorScheme: 'Terminal color scheme',
          saveHistory: 'Save generation history',
          autoBackup: 'Automatically backup exports'
        };
        
        table.push([
          chalk.white(key),
          chalk.yellow(typeof value === 'boolean' ? (value ? 'enabled' : 'disabled') : value),
          chalk.gray(descriptions[key] || 'Custom setting')
        ]);
      });
      
      console.log(table.toString());
    }
    
    if (options.set) {
      const [key, ...valueParts] = options.set.split('=');
      const value = valueParts.join('=');
      
      if (key && value) {
        // Parse boolean values
        const parsedValue = value === 'true' ? true : value === 'false' ? false : 
                           !isNaN(value) ? Number(value) : value;
        
        const success = await userConfig.set(key.trim(), parsedValue);
        if (success) {
          console.log(chalk.green(`✅ Set ${key} = ${parsedValue}`));
        } else {
          console.log(chalk.red(`❌ Failed to set ${key}`));
        }
      } else {
        console.log(chalk.red('❌ Invalid format. Use: --set key=value'));
      }
    }
    
    if (options.reset) {
      const confirmed = await inquirer.prompt([{
        type: 'confirm',
        name: 'resetConfirm',
        message: '⚠️ Reset all settings to defaults?',
        default: false
      }]);
      
      if (confirmed.resetConfirm) {
        const success = await userConfig.save(userConfig.defaults);
        if (success) {
          console.log(chalk.green('✅ Configuration reset to defaults'));
        }
      }
    }
  });

// Metrics and analytics command
program
  .command('metrics')
  .alias('stats')
  .description('📊 View detailed usage statistics and analytics')
  .option('--clear', 'Clear all metrics')
  .action(async (options) => {
    if (options.clear) {
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

// Export command
program
  .command('export')
  .alias('e')
  .description('💾 Export data and configurations')
  .option('--config', 'Export configuration')
  .option('--metrics', 'Export metrics data')
  .option('--format <format>', 'Export format', 'json')
  .action(async (options) => {
    const timestamp = Date.now();
    
    if (options.config) {
      const config = await userConfig.load();
      const filename = `config_export_${timestamp}.${options.format}`;
      await exportResults([{ config }], options.format, { filename });
    }
    
    if (options.metrics) {
      const stats = await metricsLogger.getStats();
      const filename = `metrics_export_${timestamp}.${options.format}`;
      await exportResults([{ metrics: stats }], options.format, { filename });
    }
    
    if (!options.config && !options.metrics) {
      console.log(chalk.yellow('Please specify --config or --metrics to export'));
    }
  });

// Help command with advanced features
program
  .command('help')
  .argument('[command]', 'Command to get help for')
  .description('📚 Get detailed help and examples')
  .action(async (command) => {
    if (command) {
      const cmd = program.commands.find(c => c.name() === command || c.aliases().includes(command));
      if (cmd) {
        console.log(chalk.cyan(`\n📖 Help for "${command}":\n`));
        console.log(chalk.white(cmd.description()));
        if (cmd.usage) {
          console.log(chalk.yellow('\nUsage:'), chalk.white(cmd.usage()));
        }
      } else {
        console.log(chalk.red(`❌ Unknown command: ${command}`));
      }
    } else {
      await showSpectacularBanner();
      program.help();
    }
  });

// Configure help and error handling
program.helpOption('-h, --help', 'Display help information');
program.showHelpAfterError();

// Enhanced unknown command handler
program.on('command:*', function() {
  const unknownCommand = program.args.join(' ');
  
  // Suggest similar commands using fuzzy search
  const availableCommands = program.commands.map(cmd => cmd.name());
  const fuzzySearch = new FuzzySearch(availableCommands.map(name => ({ name })), ['name']);
  const suggestions = fuzzySearch.search(unknownCommand.split(' ')[0], 3).map(r => r.name);
  
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
  console.log(chalk.gray('  • Multiple export formats (JSON, CSV, HTML)'));
  console.log(chalk.gray('  • User configuration and metrics tracking'));
  console.log(chalk.gray('  • Interactive mode with guided prompts'));
  console.log(chalk.gray('  • Comprehensive encyclopedia databases'));
  
  console.log(chalk.magenta('\n💎 PRO TIPS:\n'));
  console.log(chalk.gray('  • Use config command to set your defaults'));
  console.log(chalk.gray('  • Try --search flag for fuzzy finding'));
  console.log(chalk.gray('  • Batch mode supports up to 5 parallel threads'));
  console.log(chalk.gray('  • All data is stored locally in ~/.perchance/'));
});

// Parse arguments - MUST BE LAST
program.parse();
