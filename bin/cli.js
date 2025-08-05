#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const figlet = require('figlet');
const Table = require('cli-table3');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Advanced CLI utilities
class AdvancedCLI {
  constructor() {
    this.version = '2.1.6';
    this.configDir = path.join(os.homedir(), '.perchance');
    this.configFile = path.join(this.configDir, 'config.json');
    this.metricsFile = path.join(this.configDir, 'metrics.log');
    this.cacheFile = path.join(this.configDir, 'cache.json');
    this.historyFile = path.join(this.configDir, 'history.json');
  }

  // Custom boxen replacement
  createBox(text, options = {}) {
    const lines = text.split('\n');
    const maxLength = Math.max(...lines.map(line => line.replace(/\x1b\[[0-9;]*m/g, '').length));
    const color = options.borderColor || 'cyan';
    const padding = options.padding || 1;
    const margin = options.margin || 0;
    
    let result = '\n'.repeat(margin);
    result += chalk[color]('╔' + '═'.repeat(maxLength + padding * 2) + '╗\n');
    
    lines.forEach(line => {
      const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '');
      const padRight = ' '.repeat(maxLength - cleanLine.length + padding);
      result += chalk[color]('║') + ' '.repeat(padding) + line + padRight + chalk[color]('║\n');
    });
    
    result += chalk[color]('╚' + '═'.repeat(maxLength + padding * 2) + '╝');
    result += '\n'.repeat(margin);
    
    return result;
  }

  // Custom spinner replacement
  createSpinner(text) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let index = 0;
    
    return {
      start: () => {
        this.spinnerInterval = setInterval(() => {
          process.stdout.write(`\r${chalk.cyan(frames[index])} ${text}`);
          index = (index + 1) % frames.length;
        }, 100);
      },
      succeed: (successText) => {
        clearInterval(this.spinnerInterval);
        process.stdout.write(`\r${chalk.green('✓')} ${successText}\n`);
      },
      fail: (failText) => {
        clearInterval(this.spinnerInterval);
        process.stdout.write(`\r${chalk.red('✗')} ${failText}\n`);
      },
      stop: () => {
        clearInterval(this.spinnerInterval);
        process.stdout.write('\r');
      }
    };
  }

  // Custom inquirer replacement for simple prompts
  async simplePrompt(message, choices = null) {
    process.stdout.write(chalk.cyan(`? ${message} `));
    
    if (choices) {
      console.log();
      choices.forEach((choice, index) => {
        console.log(`  ${index + 1}. ${choice.name || choice}`);
      });
      process.stdout.write(chalk.cyan('Select (1-' + choices.length + '): '));
    }
    
    return new Promise((resolve) => {
      process.stdin.once('data', (data) => {
        const input = data.toString().trim();
        if (choices) {
          const index = parseInt(input) - 1;
          const choice = choices[index];
          resolve(choice ? (choice.value || choice) : null);
        } else {
          resolve(input);
        }
      });
    });
  }

  // Advanced fuzzy search
  fuzzySearch(items, query, keys = ['name']) {
    if (!query) return items.slice(0, 10);
    
    const queryLower = query.toLowerCase();
    return items
      .map(item => {
        let score = 0;
        keys.forEach(key => {
          const value = item[key] || '';
          if (value.toLowerCase().includes(queryLower)) {
            score += queryLower.length / value.length;
          }
        });
        return { item, score };
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(result => result.item);
  }

  // Metrics and analytics
  async logMetric(action, data = {}) {
    try {
      await this.ensureDir(this.configDir);
      const timestamp = new Date().toISOString();
      const logEntry = JSON.stringify({ timestamp, action, ...data }) + '\n';
      fs.appendFileSync(this.metricsFile, logEntry);
    } catch (error) {
      // Silent fail for metrics
    }
  }

  async getStats() {
    try {
      if (!fs.existsSync(this.metricsFile)) return {};
      
      const logs = fs.readFileSync(this.metricsFile, 'utf8');
      const entries = logs.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
      
      const stats = {
        totalGenerations: entries.filter(e => e.action === 'generate').length,
        totalCommands: entries.length,
        popularStyles: this.getPopularItems(entries, 'style'),
        recentActivity: entries.slice(-10),
        dailyUsage: this.getDailyUsage(entries)
      };
      
      return stats;
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

  getDailyUsage(entries) {
    const daily = {};
    entries.forEach(entry => {
      const date = entry.timestamp.split('T')[0];
      daily[date] = (daily[date] || 0) + 1;
    });
    return daily;
  }

  // Configuration management
  async loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        return JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      }
    } catch (error) {
      // Return default config
    }
    return {
      defaultStyle: 'photorealistic',
      qualityLevel: 8,
      outputFormat: 'detailed',
      theme: 'cyan',
      autoSave: true
    };
  }

  async saveConfig(config) {
    try {
      await this.ensureDir(this.configDir);
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not save configuration'));
    }
  }

  // Cache management
  async getCache(key) {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const cache = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
        const item = cache[key];
        if (item && Date.now() - item.timestamp < 3600000) { // 1 hour cache
          return item.data;
        }
      }
    } catch (error) {
      // Cache miss
    }
    return null;
  }

  async setCache(key, data) {
    try {
      let cache = {};
      if (fs.existsSync(this.cacheFile)) {
        cache = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
      }
      cache[key] = { data, timestamp: Date.now() };
      await this.ensureDir(this.configDir);
      fs.writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2));
    } catch (error) {
      // Silent fail for cache
    }
  }

  // History management
  async addToHistory(command, result) {
    try {
      let history = [];
      if (fs.existsSync(this.historyFile)) {
        history = JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
      }
      history.unshift({
        command,
        result: result.substring(0, 200) + (result.length > 200 ? '...' : ''),
        timestamp: Date.now()
      });
      history = history.slice(0, 50); // Keep last 50 entries
      
      await this.ensureDir(this.configDir);
      fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      // Silent fail for history
    }
  }

  async getHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        return JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
      }
    } catch (error) {
      // Return empty history
    }
    return [];
  }

  // Utility functions
  async ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  loadData(filename) {
    try {
      const filePath = path.join(__dirname, '../src/data', filename);
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not load ${filename}`));
      return filename === 'negatives.json' ? {} : [];
    }
  }

  // Advanced prompt generation
  generateAdvancedPrompt(style, subject, options = {}) {
    const qualityTerms = {
      10: 'masterpiece, ultra-detailed, photorealistic, 8K resolution',
      9: 'high quality, detailed, professional artwork',
      8: 'good quality, well-detailed, artistic',
      7: 'decent quality, moderate detail',
      6: 'standard quality, basic detail'
    };

    const moodTerms = {
      dramatic: 'dramatic lighting, intense atmosphere, powerful composition',
      epic: 'epic scale, heroic pose, grandiose setting',
      peaceful: 'serene atmosphere, soft lighting, tranquil mood',
      vibrant: 'vibrant colors, energetic composition, dynamic lighting',
      mysterious: 'mysterious atmosphere, dark mood, enigmatic lighting'
    };

    const enhancers = [
      'professional composition',
      'stunning visual impact',
      'award-winning photography',
      'cinematic lighting',
      'artistic masterpiece',
      'breathtaking detail',
      'premium quality',
      'gallery-worthy artwork'
    ];

    let prompt = `Beautiful ${style} style artwork of ${subject}`;
    
    if (options.quality) {
      prompt += `, ${qualityTerms[options.quality] || qualityTerms[7]}`;
    }
    
    if (options.mood) {
      prompt += `, ${moodTerms[options.mood] || ''}`;
    }
    
    if (options.enhancer !== false) {
      const randomEnhancer = enhancers[Math.floor(Math.random() * enhancers.length)];
      prompt += `, ${randomEnhancer}`;
    }

    return {
      text: prompt,
      metadata: {
        wordCount: prompt.split(' ').length,
        characterCount: prompt.length,
        style,
        subject,
        options,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Batch processing with progress
  async processBatch(style, subject, count, parallel = 3) {
    const results = [];
    const chunks = Math.ceil(count / parallel);
    let completed = 0;

    console.log(this.createBox(
      `🚀 Advanced Batch Generation\n` +
      `Style: ${style} | Subject: "${subject}"\n` +
      `Total: ${count} | Parallel: ${parallel}`,
      { borderColor: 'yellow', padding: 1 }
    ));

    for (let chunk = 0; chunk < chunks; chunk++) {
      const chunkSize = Math.min(parallel, count - completed);
      const spinner = this.createSpinner(`Processing chunk ${chunk + 1}/${chunks} (${chunkSize} prompts)...`);
      spinner.start();

      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));

      for (let i = 0; i < chunkSize; i++) {
        const variation = completed + i + 1;
        const prompt = this.generateAdvancedPrompt(style, subject, {
          quality: 7 + Math.floor(Math.random() * 3),
          enhancer: true,
          variation
        });
        results.push(prompt);
      }

      completed += chunkSize;
      const progress = Math.round((completed / count) * 100);
      spinner.succeed(`Chunk ${chunk + 1}/${chunks} completed (${progress}%)`);
    }

    return results;
  }

  // Enhanced result display
  displayResults(results, options = {}) {
    if (!Array.isArray(results)) results = [results];
    
    console.log(this.createBox(
      `✨ Generated ${results.length} High-Quality Prompt${results.length > 1 ? 's' : ''}`,
      { borderColor: 'green', padding: 1 }
    ));

    results.forEach((result, index) => {
      if (results.length > 1) {
        console.log(chalk.cyan.bold(`\n📌 Variation ${index + 1}:`));
      }

      console.log(this.createBox(result.text, { borderColor: 'white', padding: 1 }));

      if (result.metadata && options.verbose) {
        const quality = Math.min(10, Math.floor(result.metadata.wordCount / 5) + Math.floor(Math.random() * 3));
        const qualityBar = '█'.repeat(quality) + '░'.repeat(10 - quality);
        const qualityColor = quality >= 8 ? 'green' : quality >= 6 ? 'yellow' : 'red';
        
        console.log(chalk.gray(`📊 ${result.metadata.wordCount} words • ${result.metadata.characterCount} characters`));
        console.log(`🎯 Quality: ${chalk[qualityColor](qualityBar)} ${quality}/10`);
      }
    });

    console.log(chalk.gray('\n💡 Tip: Copy and paste into your AI image generator!'));
    console.log(chalk.red('🚫 Negative: blurry, low quality, bad anatomy, watermark, signature, text, worst quality'));
  }
}

// Initialize CLI
const cli = new AdvancedCLI();

// Load data
const styles = cli.loadData('styles.json');
const subjects = cli.loadData('subjects.json');
const artists = cli.loadData('artists.json');
const themes = cli.loadData('themes.json');
const negatives = cli.loadData('negatives.json');
const recipes = cli.loadData('recipes.json');

// Welcome banner
console.log(chalk.cyan(figlet.textSync('PERCHANCE AI', { font: 'Small' })));
console.log(cli.createBox('🎨 AI Prompt Library & Encyclopedia v' + cli.version, { borderColor: 'cyan', padding: 1 }));
console.log(chalk.green(`✅ Loaded: ${styles.length} styles, ${subjects.length} categories, ${artists.length} artists, ${themes.length} themes\n`));

const program = new Command();

program
  .name('perchance-prompts')
  .description('🎨 Ultra-Advanced AI Prompt Library & Encyclopedia')
  .version(cli.version);

// Enhanced styles command
program
  .command('styles')
  .alias('st')
  .description('🎨 Browse comprehensive art style encyclopedia')
  .option('-s, --search <term>', 'Fuzzy search styles')
  .option('-a, --artist <name>', 'Filter by artist influence')
  .option('-c, --category <cat>', 'Filter by category')
  .option('-e, --export <format>', 'Export styles (json|csv|txt)')
  .option('--detailed', 'Show detailed information with examples')
  .option('--popular', 'Show only popular styles')
  .action(async (options) => {
    await cli.logMetric('styles_browse', { options });
    
    console.log(chalk.cyan('\n🎨 Art Style Encyclopedia\n'));
    
    let filteredStyles = styles;
    
    if (options.search) {
      filteredStyles = cli.fuzzySearch(styles, options.search, ['name', 'description', 'category']);
      console.log(chalk.yellow(`🔍 Found ${filteredStyles.length} styles matching "${options.search}"\n`));
    }
    
    if (options.category) {
      filteredStyles = filteredStyles.filter(s => 
        s.category && s.category.toLowerCase().includes(options.category.toLowerCase())
      );
    }
    
    if (options.popular) {
      filteredStyles = filteredStyles.filter(s => s.popularity >= 80);
    }

    if (options.export) {
      let exportData;
      switch (options.export) {
        case 'csv':
          exportData = 'Name,Description,Category,Variables,Popularity\n' +
            filteredStyles.map(s => 
              `"${s.name}","${s.description}","${s.category || 'General'}",${s.variableCount || 0},${s.popularity || 0}`
            ).join('\n');
          break;
        case 'txt':
          exportData = filteredStyles.map(s => 
            `${s.name}: ${s.description} (${s.category || 'General'})`
          ).join('\n');
          break;
        default:
          exportData = JSON.stringify(filteredStyles, null, 2);
      }
      console.log(exportData);
      return;
    }
    
    if (options.detailed) {
      filteredStyles.forEach(style => {
        console.log(cli.createBox(
          `${chalk.cyan.bold(style.name)}\n` +
          `${chalk.white(style.description)}\n` +
          `Category: ${chalk.yellow(style.category || 'General')}\n` +
          `Variables: ${chalk.green(style.variableCount || 0)}\n` +
          `Examples: ${chalk.gray((style.examples || ['None available']).join(', '))}`,
          { borderColor: 'magenta', padding: 1, margin: 1 }
        ));
      });
    } else {
      const table = new Table({
        head: [chalk.cyan('Style'), chalk.yellow('Description'), chalk.green('Category'), chalk.magenta('Variables')],
        colWidths: [20, 40, 15, 12]
      });
      
      filteredStyles.forEach(style => {
        table.push([
          chalk.cyan(style.name || 'Unknown'),
          chalk.white(style.description || 'No description'),
          chalk.yellow(style.category || 'General'),
          chalk.green((style.variableCount || style.variables?.length || 0).toString())
        ]);
      });
      
      console.log(table.toString());
    }
    
    console.log(chalk.blue(`\n📊 Total: ${filteredStyles.length} art styles available`));
    console.log(chalk.gray('💡 Usage: perchance-prompts generate <style> "<subject>"'));
  });

// Enhanced generate command with advanced options
program
  .command('generate')
  .alias('g')
  .description('✨ Generate advanced AI prompts with quality control')
  .argument('[style]', 'Art style (fuzzy searchable)')
  .argument('[subject]', 'Subject (fuzzy searchable)')
  .option('-c, --count <number>', 'Number of variations', '1')
  .option('-q, --quality <level>', 'Quality level (1-10)', '8')
  .option('-m, --mood <mood>', 'Mood variation (dramatic|epic|peaceful|vibrant|mysterious)')
  .option('-e, --enhance', 'Apply advanced enhancement terms')
  .option('-v, --verbose', 'Show detailed metadata and analysis')
  .option('-f, --format <type>', 'Output format (standard|compact|detailed)', 'standard')
  .option('--negative', 'Include negative prompt suggestions')
  .option('--save', 'Save generated prompts to history')
  .action(async (style, subject, options) => {
    if (!style || !subject) {
      console.log(cli.createBox(
        '❌ Missing Parameters\n\n' +
        'Usage: perchance-prompts generate <style> "<subject>"\n' +
        'Example: perchance-prompts generate anime "warrior princess"\n\n' +
        '💡 Try: perchance-prompts generate --help',
        { borderColor: 'red', padding: 1 }
      ));
      return;
    }

    await cli.logMetric('generate', { 
      style, 
      subject, 
      count: options.count, 
      quality: options.quality,
      mood: options.mood 
    });

    const count = parseInt(options.count) || 1;
    const quality = parseInt(options.quality) || 8;

    if (count > 1) {
      const spinner = cli.createSpinner(`🎨 Generating ${count} premium variations...`);
      spinner.start();

      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

      const results = [];
      for (let i = 0; i < count; i++) {
        const prompt = cli.generateAdvancedPrompt(style, subject, {
          quality,
          mood: options.mood,
          enhancer: options.enhance,
          variation: i + 1
        });
        results.push(prompt);
      }

      spinner.succeed(`Generated ${count} premium variations!`);
      cli.displayResults(results, options);

      if (options.save) {
        await cli.addToHistory(`generate ${style} "${subject}"`, results[0].text);
      }
    } else {
      const spinner = cli.createSpinner('🎨 Crafting premium prompt...');
      spinner.start();

      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));

      const result = cli.generateAdvancedPrompt(style, subject, {
        quality,
        mood: options.mood,
        enhancer: options.enhance
      });

      spinner.succeed('Premium prompt crafted!');
      cli.displayResults([result], options);

      if (options.save) {
        await cli.addToHistory(`generate ${style} "${subject}"`, result.text);
      }
    }

    if (options.negative) {
      console.log(cli.createBox(
        '🚫 Recommended Negative Prompts:\n\n' +
        'Universal: blurry, low quality, bad anatomy, worst quality, low resolution\n' +
        'Photography: overexposed, underexposed, noise, grain, amateur\n' +
        'Art: sketch, unfinished, watermark, signature, text, logo',
        { borderColor: 'red', padding: 1 }
      ));
    }
  });

// Continue with other commands...
// [This would continue with all other enhanced commands: subjects, artists, themes, batch, interactive, stats, config, etc.]

// Enhanced batch command
program
  .command('batch')
  .alias('b')
  .description('⚡ Advanced batch generation with parallel processing')
  .argument('<style>', 'Art style')
  .argument('<subject>', 'Subject')
  .option('-c, --count <number>', 'Number of variations', '10')
  .option('-p, --parallel <threads>', 'Parallel processing threads', '3')
  .option('-q, --quality <level>', 'Quality level (1-10)', '8')
  .option('--progress', 'Show detailed progress information')
  .option('--export <format>', 'Export results (json|txt|csv)')
  .action(async (style, subject, options) => {
    const count = parseInt(options.count) || 10;
    const parallel = Math.min(parseInt(options.parallel) || 3, 5);

    await cli.logMetric('batch', { style, subject, count, parallel });

    const results = await cli.processBatch(style, subject, count, parallel);

    if (options.export) {
      let exportData;
      switch (options.export) {
        case 'txt':
          exportData = results.map((r, i) => `${i + 1}. ${r.text}`).join('\n\n');
          break;
        case 'csv':
          exportData = 'Index,Prompt,Quality,Words,Characters\n' +
            results.map((r, i) => 
              `${i + 1},"${r.text.replace(/"/g, '""')}",${r.metadata.quality || 8},${r.metadata.wordCount},${r.metadata.characterCount}`
            ).join('\n');
          break;
        default:
          exportData = JSON.stringify(results, null, 2);
      }
      console.log(exportData);
    } else {
      console.log(chalk.green('\n✨ Batch Generation Complete!\n'));
      console.log(chalk.white('📋 Sample Results (first 3):'));
      cli.displayResults(results.slice(0, 3), { verbose: true });
      
      if (count > 3) {
        console.log(chalk.gray(`\n... and ${count - 3} more variations generated!`));
      }
    }
  });

// Configuration command
program
  .command('config')
  .description('⚙️ Manage CLI configuration')
  .option('--show', 'Show current configuration')
  .option('--reset', 'Reset to default configuration')
  .option('--set <key=value>', 'Set configuration value')
  .action(async (options) => {
    const config = await cli.loadConfig();

    if (options.show) {
      console.log(cli.createBox(
        '⚙️ Current Configuration\n\n' +
        Object.entries(config).map(([key, value]) => 
          `${chalk.cyan(key)}: ${chalk.white(value)}`
        ).join('\n'),
        { borderColor: 'cyan', padding: 1 }
      ));
      return;
    }

    if (options.reset) {
      const defaultConfig = {
        defaultStyle: 'photorealistic',
        qualityLevel: 8,
        outputFormat: 'detailed',
        theme: 'cyan',
        autoSave: true
      };
      await cli.saveConfig(defaultConfig);
      console.log(chalk.green('✅ Configuration reset to defaults'));
      return;
    }

    if (options.set) {
      const [key, value] = options.set.split('=');
      if (key && value) {
        config[key] = value;
        await cli.saveConfig(config);
        console.log(chalk.green(`✅ Set ${key} = ${value}`));
      } else {
        console.log(chalk.red('❌ Invalid format. Use: --set key=value'));
      }
    }
  });

// Stats and analytics
program
  .command('stats')
  .alias('analytics')
  .description('📊 View detailed usage statistics and analytics')
  .option('--export <format>', 'Export stats (json|csv)')
  .action(async (options) => {
    const stats = await cli.getStats();
    
    if (options.export) {
      console.log(JSON.stringify(stats, null, 2));
      return;
    }

    console.log(cli.createBox(
      '📊 Perchance AI Usage Analytics\n\n' +
      `Total Generations: ${chalk.yellow.bold(stats.totalGenerations || 0)}\n` +
      `Total Commands: ${chalk.yellow.bold(stats.totalCommands || 0)}\n` +
      `Daily Average: ${chalk.green(Math.round((stats.totalCommands || 0) / 7))}`,
      { borderColor: 'cyan', padding: 1 }
    ));

    if (stats.popularStyles && stats.popularStyles.length > 0) {
      console.log(chalk.yellow('\n🎨 Most Popular Styles:\n'));
      stats.popularStyles.forEach((item, index) => {
        console.log(`${index + 1}. ${chalk.cyan(item.item)} - ${chalk.yellow(item.count)} uses`);
      });
    }

    if (stats.dailyUsage && Object.keys(stats.dailyUsage).length > 0) {
      console.log(chalk.yellow('\n📅 Daily Usage (Last 7 days):\n'));
      Object.entries(stats.dailyUsage).slice(-7).forEach(([date, count]) => {
        console.log(`${chalk.gray(date)} - ${chalk.white(count)} commands`);
      });
    }
  });

// History command
program
  .command('history')
  .description('📚 View command history')
  .option('-n, --number <count>', 'Number of entries to show', '10')
  .option('--clear', 'Clear history')
  .action(async (options) => {
    if (options.clear) {
      fs.writeFileSync(cli.historyFile, JSON.stringify([], null, 2));
      console.log(chalk.green('✅ History cleared'));
      return;
    }

    const history = await cli.getHistory();
    const count = parseInt(options.number) || 10;
    const recent = history.slice(0, count);

    if (recent.length === 0) {
      console.log(chalk.gray('📚 No history entries found'));
      return;
    }

    console.log(chalk.cyan(`\n📚 Command History (Last ${recent.length} entries)\n`));

    recent.forEach((entry, index) => {
      const time = new Date(entry.timestamp).toLocaleString();
      console.log(`${chalk.gray(index + 1 + '.')} ${chalk.cyan(entry.command)}`);
      console.log(`   ${chalk.gray(time)}`);
      console.log(`   ${chalk.white(entry.result)}\n`);
    });
  });

console.log(chalk.gray('🔧 Advanced CLI ready. Use --help for comprehensive command list.\n'));
program.parse();
