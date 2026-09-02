#!/usr/bin/env node
/**
 * Perchance AI Toolkit CLI
 * Usage: perchance-gen <command> [options]
 */

import { Command } from 'commander';
import { createGeneratorWorkflow } from '../agent/workflows/create-generator.js';
import { previewRolls, exportGenerator } from '../core/exporter.js';
import { validatePerchance } from '../core/validator.js';
import fs from 'fs';

const program = new Command();

program
  .name('perchance-gen')
  .description('🎲 Perchance.ai Generator Toolkit — perchance-native generation, scraping, and testing')
  .version('8.0.0');

// Error handling helper
function handleError(error: unknown, context: string): void {
  console.error(`\n❌ Error in ${context}:`);

  if (error instanceof Error) {
    console.error(`   ${error.message}`);

    // Provide helpful suggestions based on error type
    if (error.message.includes('ENOENT') || error.message.includes('file not found')) {
      console.error('\n💡 Solution: Check that the file path is correct');
      console.error('   Use absolute path or ensure you\'re in the right directory');
    } else if (error.message.includes('EACCES')) {
      console.error('\n💡 Solution: Check file permissions');
      console.error('   Ensure you have read/write access to the file/directory');
    } else if (error.message.includes('playwright') || error.message.includes('browser')) {
      console.error('\n💡 Solution: Install Playwright');
      console.error('   npm install playwright');
      console.error('   npx playwright install chromium');
    }
  } else {
    console.error('   Unknown error occurred');
  }

  console.error('\n📚 For help, run: perchance-gen --help');
  process.exit(1);
}

// CREATE command
program
  .command('create <topic>')
  .description('Create a new .perchance generator from a topic using perchance-native templates')
  .option('-c, --category <category>', 'Category: names|characters|scenes|items|dialogue|images|loot|quests|custom', 'custom')
  .option('-s, --style <style>', 'Style: simple|weighted|nested|complex', 'nested')
  .option('-n, --count <number>', 'Items per list', '15')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('--clipboard', 'Copy to clipboard')
  .option('--run', 'Run on perchance.org after generating (requires Playwright)')
  .action(async (topic, opts) => {
    try {
      console.log(`\n🎲 Generating: "${topic}"\n`);
      const result = await createGeneratorWorkflow(topic, {
        category: opts.category,
        style: opts.style,
        itemCount: parseInt(opts.count),
      });
      await exportGenerator(result.code, {
        filename: result.filename,
        outputDir: opts.output,
        clipboard: opts.clipboard,
      });
      console.log('\n✅ Generator created!');
      console.log(`📁 Saved to: ${opts.output}/${result.filename}`);
      console.log('\n🎯 Preview rolls:');
      result.previewRolls?.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));
      console.log('\n🌐 Paste at: https://perchance.org/minimal#edit');

      if (opts.run) {
        console.log('\n🚀 Running on perchance.org...');
        const { runOnPerchance } = await import('../playwright/roller.js');
        const run = await runOnPerchance({ code: result.code, rolls: 10 });
        console.log('\n🎲 Live results:');
        run.results.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));
      }
    } catch (error) {
      handleError(error, 'create command');
    }
  });

// PREVIEW command
program
  .command('preview <file>')
  .description('Preview rolls from a .perchance file')
  .option('-n, --count <number>', 'Number of rolls', '10')
  .action((file, opts) => {
    try {
      const code = fs.readFileSync(file, 'utf-8');
      const results = previewRolls(code, parseInt(opts.count));
      console.log(`\n🎲 Preview (${results.length} rolls):`);
      results.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));
    } catch (error) {
      handleError(error, 'preview command');
    }
  });

// VALIDATE command
program
  .command('validate <file>')
  .description('Validate .perchance syntax')
  .action((file) => {
    try {
      const code = fs.readFileSync(file, 'utf-8');
      const result = validatePerchance(code);
      console.log(`\n${result.valid ? '✅ Valid' : '❌ Invalid'}`);
      if (result.errors.length) {
        console.log('\nErrors:');
        result.errors.forEach(e => console.log(`  Line ${e.line}: ${e.message}`));
      }
      if (result.warnings.length) {
        console.log('\nWarnings:');
        result.warnings.forEach(w => console.log(`  Line ${w.line}: ${w.message}`));
      }
      console.log(`\nStats: ${result.stats.listCount} lists, ${result.stats.totalItems} items`);
    } catch (error) {
      handleError(error, 'validate command');
    }
  });

// RUN command (Playwright)
program
  .command('run <file>')
  .description('Run .perchance file on perchance.org via Playwright')
  .option('-n, --rolls <number>', 'Number of rolls', '10')
  .option('--screenshot', 'Save screenshot')
  .action(async (file, opts) => {
    try {
      const code = fs.readFileSync(file, 'utf-8');
      console.log('\n🚀 Running on perchance.org...');
      const { runOnPerchance } = await import('../playwright/roller.js');
      const result = await runOnPerchance({
        code, rolls: parseInt(opts.rolls), screenshot: opts.screenshot
      });
      if (result.error) {
        console.error(`\n❌ Error: ${result.error}`);
        return;
      }
      console.log(`\n🎲 Results (${result.results.length}):`);
      result.results.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));
    } catch (error) {
      handleError(error, 'run command');
    }
  });

// SCRAPE command
program
  .command('scrape <url>')
  .description('Scrape a public perchance.org generator')
  .option('-o, --output <dir>', 'Output directory', './output/cloned')
  .action(async (url, _opts) => {
    try {
      console.log(`\n🔍 Scraping: ${url}`);
      const { scrapeAndCloneWorkflow } = await import('../agent/workflows/scrape-and-clone.js');
      const result = await scrapeAndCloneWorkflow(url);
      console.log(`\n✅ Scraped! Saved to: ${result.savedTo}`);
      console.log('\n🎲 Preview:');
      result.preview.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));
    } catch (error) {
      handleError(error, 'scrape command');
    }
  });

// UI command — launch web interface
program
  .command('ui')
  .description('Launch web UI for scraping perchance.org generators')
  .option('-p, --port <number>', 'Port to listen on', '3000')
  .action(async (opts) => {
    const port = parseInt(opts.port, 10);
    const { createUiServer } = await import('../ui/server.js');
    await createUiServer(port);
  });

// Global error handler
process.on('unhandledRejection', (error) => {
  handleError(error, 'unhandled promise rejection');
});

// Resolve symlinks so the global bin (`perchance-gen`) also works.
const mainPath = fs.realpathSync(process.argv[1]);
// Only parse when run directly (not when imported by tests)
if (import.meta.url === `file://${mainPath}`) {
  program.parseAsync(process.argv);
}
