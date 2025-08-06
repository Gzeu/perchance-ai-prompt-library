/**
 * Pollinations.ai Configuration
 * 
 * This file contains configuration for the Pollinations.ai API integration.
 * Update these settings according to your requirements.
 */

module.exports = {
  // API Configuration
  api: {
    baseUrl: process.env.POLLINATIONS_API_URL || 'https://image.pollinations.ai',
    timeout: process.env.POLLINATIONS_TIMEOUT || 30000, // 30 seconds
    retries: process.env.POLLINATIONS_RETRIES || 3,
    retryDelay: process.env.POLLINATIONS_RETRY_DELAY || 1000, // 1 second
  },
  
  // Image Generation Defaults
  defaults: {
    width: 512,
    height: 512,
    steps: 50,
    guidanceScale: 7.5,
    numInferenceSteps: 50,
  },
  
  // Rate Limiting
  rateLimiting: {
    enabled: true,
    windowMs: 60 * 1000, // 1 minute
    max: process.env.POLLINATIONS_RATE_LIMIT || 60, // requests per windowMs
    message: 'Too many requests, please try again later.',
  },
  
  // Caching
  cache: {
    enabled: true,
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 100, // Maximum number of items to cache
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: 'logs/pollinations.log',
    maxSize: '10m',
    maxFiles: '7d',
  },
  
  // Security
  security: {
    // List of allowed domains for CORS
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      // Add production domains here
    ],
    
    // API key validation
    requireApiKey: process.env.REQUIRE_API_KEY !== 'false',
    apiKeys: process.env.API_KEYS ? process.env.API_KEYS.split(',') : [],
  },
  
  // Batch Processing
  batch: {
    maxConcurrent: 3, // Maximum concurrent image generations
    delayBetween: 500, // ms between batch items
    maxBatchSize: 10, // Maximum number of items per batch
  },
  
  // Image Processing
  image: {
    // Allowed MIME types for image uploads
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
    ],
    
    // Maximum file size (in bytes)
    maxFileSize: 5 * 1024 * 1024, // 5MB
    
    // Output formats
    outputFormats: ['png', 'jpeg', 'webp'],
    
    // Default output format
    defaultFormat: 'png',
    
    // Quality settings (0-100)
    quality: {
      jpeg: 85,
      webp: 85,
      png: 90,
    },
  },
  
  // Prompt Enhancement
  promptEnhancement: {
    enabled: true,
    
    // Terms to append based on quality settings
    qualityTerms: {
      high: 'high quality, highly detailed, 8k, 4k, professional photography',
      medium: 'good quality, detailed, sharp focus',
      low: 'decent quality',
    },
    
    // Style presets
    stylePresets: {
      photorealistic: 'photorealistic, realistic, ultra-detailed',
      digitalArt: 'digital art, concept art, matte painting',
      fantasy: 'fantasy art, ethereal, dreamy',
      anime: 'anime style, vibrant colors, clean lines',
      watercolor: 'watercolor painting, artistic, brush strokes',
      oilPainting: 'oil painting, impasto, textured',
      pixelArt: 'pixel art, 8-bit, retro gaming',
      cyberpunk: 'cyberpunk, neon, futuristic',
      steampunk: 'steampunk, mechanical, brass and copper',
      surreal: 'surreal, dreamlike, impossible architecture',
    },
    
    // Lighting presets
    lightingPresets: {
      studio: 'studio lighting, soft light, professional photo',
      dramatic: 'dramatic lighting, chiaroscuro, high contrast',
      goldenHour: 'golden hour, warm glow, sunset',
      neon: 'neon lighting, cyberpunk, colorful',
      rimLight: 'rim lighting, backlit, silhouette',
      ambient: 'ambient lighting, soft shadows, even lighting',
    },
    
    // Composition presets
    compositionPresets: {
      portrait: 'portrait, close-up, shallow depth of field',
      landscape: 'landscape, wide shot, vast, epic',
      macro: 'macro, extreme close-up, detailed',
      isometric: 'isometric view, top-down, 3D render',
      dutchAngle: 'dutch angle, dynamic composition',
      ruleOfThirds: 'rule of thirds, balanced composition',
    },
  },
};

// Apply environment variable overrides if needed
if (process.env.NODE_ENV === 'development') {
  module.exports.logging.level = 'debug';
  module.exports.cache.enabled = false;
  module.exports.security.allowedOrigins.push('*');
}
