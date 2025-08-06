#!/usr/bin/env node

/**
 * CLI command for generating images using Pollinations.ai
 */

const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');
const { PollinationsService } = require('../services/PollinationsService');
const { version } = require('../../package.json');

// Initialize the command
const program = new Command();

// Configure the command
program
  .name('generate-image')
  .description('Generate images using Pollinations.ai')
  .version(version)
  .requiredOption('-p, --prompt <prompt>', 'The prompt for image generation')
  .option('-n, --negative-prompt <negativePrompt>', 'Negative prompt (things to avoid in the image)')
  .option('-s, --style <style>', 'Style preset (e.g., photorealistic, digital-art, anime)', 'photorealistic')
  .option('-w, --width <width>', 'Image width', '512')
  .option('-h, --height <height>', 'Image height', '512')
  .option('--steps <steps>', 'Number of diffusion steps', '50')
  .option('--guidance-scale <scale>', 'Guidance scale (1-20)', '7.5')
  .option('--seed <seed>', 'Random seed (-1 for random)', '-1')
  .option('-o, --output <path>', 'Output directory', './output')
  .option('--filename <name>', 'Output filename (without extension)')
  .option('--show-progress', 'Show progress bar', false)
  .option('--api-key <key>', 'Pollinations.ai API key (or set POLLINATIONS_API_KEY env var)')
  .option('--save-settings', 'Save generation settings to a JSON file', false)
  .option('--list-styles', 'List available style presets and exit', false);

// Available style presets
const STYLE_PRESETS = {
  'photorealistic': 'Photorealistic style',
  'digital-art': 'Digital art style',
  'fantasy': 'Fantasy art style',
  'anime': 'Anime/manga style',
  'watercolor': 'Watercolor painting style',
  'oil-painting': 'Oil painting style',
  'pixel-art': 'Pixel art style',
  'cyberpunk': 'Cyberpunk style',
  'steampunk': 'Steampunk style',
  'surreal': 'Surreal art style',
};

/**
 * List available style presets
 */
function listStyles() {
  console.log(chalk.cyan.bold('\nAvailable Style Presets:\n'));
  
  const maxNameLength = Math.max(...Object.keys(STYLE_PRESETS).map(k => k.length));
  
  for (const [key, description] of Object.entries(STYLE_PRESETS)) {
    console.log(
      `  ${chalk.green(key.padEnd(maxNameLength + 2))} ${chalk.dim(description)}`
    );
  }
  
  console.log('');
  process.exit(0);
}

/**
 * Ensure output directory exists
 * @param {string} dir - Directory path
 */
async function ensureOutputDir(dir) {
  try {
    await fs.ensureDir(dir);
    return true;
  } catch (err) {
    console.error(chalk.red(`Error creating output directory: ${err.message}`));
    return false;
  }
}

/**
 * Generate a filename based on the prompt and timestamp
 * @param {string} prompt - The generation prompt
 * @param {string} style - The style preset
 * @returns {string} Generated filename
 */
function generateFilename(prompt, style) {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
  
  // Create a safe filename from the prompt
  const safePrompt = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 50);
    
  return `generated-${safePrompt || 'image'}-${style}-${timestamp}`;
}

/**
 * Save generation settings to a JSON file
 * @param {Object} settings - Generation settings
 * @param {string} outputPath - Output directory
 * @param {string} baseFilename - Base filename (without extension)
 */
async function saveSettings(settings, outputPath, baseFilename) {
  try {
    const settingsPath = path.join(outputPath, `${baseFilename}.json`);
    await fs.writeJson(settingsPath, settings, { spaces: 2 });
    console.log(chalk.dim(`  Settings saved to: ${settingsPath}`));
    return true;
  } catch (err) {
    console.warn(chalk.yellow(`  Warning: Could not save settings: ${err.message}`));
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  // Parse command line arguments
  program.parse(process.argv);
  const options = program.opts();
  
  // Handle list-styles flag
  if (options.listStyles) {
    listStyles();
    return;
  }
  
  // Validate style
  if (!STYLE_PRESETS[options.style]) {
    console.error(chalk.red(`Error: Invalid style '${options.style}'. Use --list-styles to see available options.`));
    process.exit(1);
  }
  
  // Prepare parameters
  const params = {
    prompt: options.prompt,
    negativePrompt: options.negativePrompt || '',
    style: options.style,
    width: parseInt(options.width, 10),
    height: parseInt(options.height, 10),
    steps: parseInt(options.steps, 10),
    guidanceScale: parseFloat(options.guidanceScale),
    seed: parseInt(options.seed, 10),
  };
  
  // Validate parameters
  if (params.width < 64 || params.width > 1024) {
    console.error(chalk.red('Error: Width must be between 64 and 1024'));
    process.exit(1);
  }
  
  if (params.height < 64 || params.height > 1024) {
    console.error(chalk.red('Error: Height must be between 64 and 1024'));
    process.exit(1);
  }
  
  if (params.steps < 1 || params.steps > 150) {
    console.error(chalk.red('Error: Steps must be between 1 and 150'));
    process.exit(1);
  }
  
  if (params.guidanceScale < 1 || params.guidanceScale > 20) {
    console.error(chalk.red('Error: Guidance scale must be between 1 and 20'));
    process.exit(1);
  }
  
  // Ensure output directory exists
  const outputDir = path.resolve(process.cwd(), options.output);
  if (!(await ensureOutputDir(outputDir))) {
    process.exit(1);
  }
  
  // Generate filename
  const baseFilename = options.filename || generateFilename(params.prompt, params.style);
  const imagePath = path.join(outputDir, `${baseFilename}.png`);
  
  // Initialize the service
  const apiKey = options.apiKey || process.env.POLLINATIONS_API_KEY;
  const pollinations = new PollinationsService(apiKey);
  
  // Show generation info
  console.log(chalk.cyan.bold('\nImage Generation Settings:'));
  console.log(chalk.dim('----------------------------------------'));
  console.log(`  ${chalk.bold('Prompt:')} ${params.prompt}`);
  if (params.negativePrompt) {
    console.log(`  ${chalk.bold('Negative Prompt:')} ${params.negativePrompt}`);
  }
  console.log(`  ${chalk.bold('Style:')} ${params.style} ${chalk.dim(`(${STYLE_PRESETS[params.style]})`)}`);
  console.log(`  ${chalk.bold('Dimensions:')} ${params.width}×${params.height}px`);
  console.log(`  ${chalk.bold('Steps:')} ${params.steps}`);
  console.log(`  ${chalk.bold('Guidance Scale:')} ${params.guidanceScale}`);
  console.log(`  ${chalk.bold('Seed:')} ${params.seed === -1 ? 'random' : params.seed}`);
  console.log(`  ${chalk.bold('Output:')} ${imagePath}`);
  console.log(chalk.dim('----------------------------------------\n'));
  
  // Start generation
  const spinner = ora('Generating image...').start();
  
  try {
    // Generate the image
    const imageBuffer = await pollinations.generateImage({
      prompt: `${params.prompt}, ${params.style} style, high quality, detailed`,
      negative_prompt: params.negativePrompt,
      width: params.width,
      height: params.height,
      steps: params.steps,
      guidance_scale: params.guidanceScale,
      seed: params.seed === -1 ? undefined : params.seed,
    }, {
      onProgress: (progress) => {
        if (options.showProgress) {
          spinner.text = `Generating... ${Math.round(progress * 100)}%`;
        }
      },
    });
    
    // Save the image
    await fs.writeFile(imagePath, imageBuffer);
    
    // Save settings if requested
    if (options.saveSettings) {
      await saveSettings(params, outputDir, baseFilename);
    }
    
    spinner.succeed(chalk.green(`Image generated successfully!`));
    console.log(chalk.green(`  Saved to: ${chalk.underline(imagePath)}`));
    
  } catch (error) {
    spinner.fail(chalk.red('Error generating image'));
    console.error(chalk.red(`  ${error.message}`));
    
    if (error.response) {
      console.error(chalk.dim(`  Status: ${error.response.status}`));
      if (error.response.data) {
        console.error(chalk.dim(`  Response: ${JSON.stringify(error.response.data)}`));
      }
    }
    
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error(chalk.red(`\nUnhandled error: ${error.message}`));
  if (error.stack) {
    console.error(chalk.dim(error.stack));
  }
  process.exit(1);
});
