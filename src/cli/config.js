const path = require('path');
const os = require('os');
const fs = require('fs-extra');

// Default configuration
const defaults = {
  // API settings
  api: {
    baseUrl: 'https://api.pollinations.ai',
    endpoints: {
      generate: '/api/v1/generate',
      status: '/api/v1/status',
      models: '/api/v1/models',
    },
    timeout: 30000, // 30 seconds
    maxRetries: 3,
    retryDelay: 1000, // 1 second
  },
  
  // Generation defaults
  generation: {
    width: 512,
    height: 512,
    steps: 50,
    guidanceScale: 7.5,
    seed: -1, // -1 for random
    style: 'photorealistic',
    model: 'stability-ai/sd3', // Default model
  },
  
  // Output settings
  output: {
    directory: path.join(os.homedir(), 'perchance-ai', 'generated'),
    format: 'png',
    quality: 90,
    saveSettings: true,
    overwrite: false,
  },
  
  // UI settings
  ui: {
    showProgress: true,
    colors: true,
    spinner: 'dots',
    logLevel: 'info', // 'error', 'warn', 'info', 'debug', 'silly'
  },
  
  // Cache settings
  cache: {
    enabled: true,
    directory: path.join(os.homedir(), '.cache', 'perchance-ai'),
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },
};

// Load user configuration
let userConfig = {};
const configPath = path.join(os.homedir(), '.config', 'perchance-ai', 'config.json');

try {
  if (fs.existsSync(configPath)) {
    userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (error) {
  console.warn(`Warning: Could not load user config from ${configPath}: ${error.message}`);
}

// Merge defaults with user config
const config = {
  ...defaults,
  ...userConfig,
  // Deep merge for nested objects
  api: { ...defaults.api, ...(userConfig.api || {}) },
  generation: { ...defaults.generation, ...(userConfig.generation || {}) },
  output: { ...defaults.output, ...(userConfig.output || {}) },
  ui: { ...defaults.ui, ...(userConfig.ui || {}) },
  cache: { ...defaults.cache, ...(userConfig.cache || {}) },
};

// Ensure output and cache directories exist
const ensureDirs = async () => {
  try {
    await fs.ensureDir(config.output.directory);
    if (config.cache.enabled) {
      await fs.ensureDir(config.cache.directory);
    }
    return true;
  } catch (error) {
    console.error(`Error creating directories: ${error.message}`);
    return false;
  }
};

// Save configuration
const saveConfig = async (newConfig = {}) => {
  try {
    // Ensure the config directory exists
    await fs.ensureDir(path.dirname(configPath));
    
    // Merge the new config with the existing one
    const updatedConfig = {
      ...config,
      ...newConfig,
      // Deep merge for nested objects
      api: { ...config.api, ...(newConfig.api || {}) },
      generation: { ...config.generation, ...(newConfig.generation || {}) },
      output: { ...config.output, ...(newConfig.output || {}) },
      ui: { ...config.ui, ...(newConfig.ui || {}) },
      cache: { ...config.cache, ...(newConfig.cache || {}) },
    };
    
    // Save to file
    await fs.writeJson(configPath, updatedConfig, { spaces: 2 });
    
    // Update the in-memory config
    Object.assign(config, updatedConfig);
    
    return true;
  } catch (error) {
    console.error(`Error saving configuration: ${error.message}`);
    return false;
  }
};

// Reset to defaults
const resetConfig = async () => {
  try {
    await fs.writeJson(configPath, defaults, { spaces: 2 });
    Object.assign(config, defaults);
    return true;
  } catch (error) {
    console.error(`Error resetting configuration: ${error.message}`);
    return false;
  }
};

// Export the configuration and helper functions
module.exports = {
  config,
  defaults,
  ensureDirs,
  saveConfig,
  resetConfig,
  configPath,
};
