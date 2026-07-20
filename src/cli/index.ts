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
  .description('🎲 Perchance.ai Generator Toolkit — AI-powered .perchance generator builder')
  .version('8.0.0');

// CREATE command
program
  .command('create <topic>')
  .description('Create a new .perchance generator with AI')
  .option('-c, --category <category>', 'Category: names|characters|scenes|items|dialogue|images|loot|quests|custom', 'custom')
  .option('-s, --style <style>', 'Style: simple|weighted|nested|complex', 'nested')
  .option('-n, --count <number>', 'Items per list', '15')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('--clipboard', 'Copy to clipboard')
  .option('--run', 'Run on perchance.ai after generating (requires Playwright)')
  .action(async (topic, opts) => {
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
    console.log(`\n🎯 Preview rolls:`);
    result.previewRolls?.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));
    console.log(`\n🌐 Paste at: https://perchance.ai/tools/generate`);

    if (opts.run) {
      console.log('\n🚀 Running on perchance.ai...');
      const { runOnPerchance } = await import('../playwright/roller.js');
      const run = await runOnPerchance({ code: result.code, rolls: 10 });
      console.log('\n🎲 Live results:');
      run.results.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));
    }
  });

// PREVIEW command
program
  .command('preview <file>')
  .description('Preview rolls from a .perchance file')
  .option('-n, --count <number>', 'Number of rolls', '10')
  .action((file, opts) => {
    const code = fs.readFileSync(file, 'utf-8');
    const results = previewRolls(code, parseInt(opts.count));
    console.log(`\n🎲 Preview (${results.length} rolls):`);
    results.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));
  });

// VALIDATE command
program
  .command('validate <file>')
  .description('Validate .perchance syntax')
  .action((file) => {
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
  });

// RUN command (Playwright)
program
  .command('run <file>')
  .description('Run .perchance file on perchance.ai via Playwright')
  .option('-n, --rolls <number>', 'Number of rolls', '10')
  .option('--screenshot', 'Save screenshot')
  .action(async (file, opts) => {
    const code = fs.readFileSync(file, 'utf-8');
    console.log('\n🚀 Running on perchance.ai...');
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
  });

// SCRAPE command
program
  .command('scrape <url>')
  .description('Scrape a public perchance.ai generator')
  .option('-o, --output <dir>', 'Output directory', './output/cloned')
  .action(async (url, opts) => {
    console.log(`\n🔍 Scraping: ${url}`);
    const { scrapeAndCloneWorkflow } = await import('../agent/workflows/scrape-and-clone.js');
    const result = await scrapeAndCloneWorkflow(url);
    console.log(`\n✅ Scraped! Saved to: ${result.savedTo}`);
    console.log('\n🎲 Preview:');
    result.preview.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));
  });

program.parse();
