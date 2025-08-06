const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class PollinationsService {
  constructor() {
    this.apiUrl = 'https://image.pollinations.ai';
    if (!process.env.POLLINATIONS_TOKEN) {
      throw new Error('POLLINATIONS_TOKEN environment variable is not set');
    }
    this.token = process.env.POLLINATIONS_TOKEN;
    this.cache = new Map();
    this.rateLimits = {
      remaining: 100,
      resetTime: null
    };
  }

  /**
   * Generate an image from a prompt
   * @param {string} prompt - The prompt to generate an image from
   * @param {object} options - Additional options for image generation
   * @returns {Promise<Buffer>} - The generated image as a buffer
   */
  async generateImage(prompt, options = {}) {
    const requestId = uuidv4();
    const cacheKey = this._generateCacheKey(prompt, options);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      logger.debug(`Cache hit for prompt: ${prompt.substring(0, 30)}...`);
      return this.cache.get(cacheKey);
    }

    // Check rate limits
    await this._checkRateLimit();

    try {
      const params = new URLSearchParams({
        prompt: this._enhancePrompt(prompt, options),
        ...options
      });

      logger.info(`Generating image for prompt: ${prompt.substring(0, 50)}...`);
      
      const response = await axios.get(`${this.apiUrl}/text2image?${params.toString()}`, {
        responseType: 'arraybuffer',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'X-Request-ID': requestId
        },
        timeout: 30000 // 30 second timeout
      });

      // Update rate limit info from headers if available
      this._updateRateLimits(response.headers);

      // Cache the result
      this.cache.set(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      logger.error('Error generating image:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Generate multiple images in batch
   * @param {string[]} prompts - Array of prompts
   * @param {object} options - Generation options
   * @returns {Promise<Array<{prompt: string, image: Buffer}>>}
   */
  async generateBatch(prompts, options = {}) {
    const results = [];
    
    for (const prompt of prompts) {
      try {
        const image = await this.generateImage(prompt, options);
        results.push({ prompt, image, success: true });
      } catch (error) {
        results.push({ 
          prompt, 
          error: error.message,
          success: false 
        });
      }
      
      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  /**
   * Get current rate limit status
   * @returns {object} Rate limit information
   */
  getRateLimitStatus() {
    return {
      remaining: this.rateLimits.remaining,
      resetTime: this.rateLimits.resetTime,
      resetIn: this.rateLimits.resetTime ? 
        Math.max(0, this.rateLimits.resetTime - Date.now()) : 0
    };
  }

  /**
   * Enhance the prompt with additional keywords based on options
   * @private
   */
  _enhancePrompt(prompt, options) {
    // Add quality boosters if not already present
    const qualityTerms = [];
    
    if (options.highQuality && !prompt.toLowerCase().includes('high quality')) {
      qualityTerms.push('high quality');
    }
    
    if (options.detailed && !prompt.toLowerCase().includes('highly detailed')) {
      qualityTerms.push('highly detailed');
    }
    
    if (qualityTerms.length > 0) {
      return `${prompt}, ${qualityTerms.join(', ')}`;
    }
    
    return prompt;
  }

  /**
   * Generate a cache key from prompt and options
   * @private
   */
  _generateCacheKey(prompt, options) {
    const { width = 512, height = 512, ...rest } = options;
    const optionsKey = Object.entries(rest)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    
    return `${prompt}|${width}x${height}|${optionsKey}`;
  }

  /**
   * Check and handle rate limits
   * @private
   */
  async _checkRateLimit() {
    if (this.rateLimits.remaining <= 0 && this.rateLimits.resetTime) {
      const waitTime = this.rateLimits.resetTime - Date.now();
      if (waitTime > 0) {
        logger.warn(`Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Update rate limit info from response headers
   * @private
   */
  _updateRateLimits(headers) {
    if (headers['x-ratelimit-remaining']) {
      this.rateLimits.remaining = parseInt(headers['x-ratelimit-remaining'], 10);
    }
    
    if (headers['x-ratelimit-reset']) {
      this.rateLimits.resetTime = parseInt(headers['x-ratelimit-reset'], 10) * 1000;
    }
  }

  /**
   * Handle API errors
   * @private
   */
  _handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(`Invalid request: ${data.message || 'Bad request'}`);
        case 401:
          return new Error('Invalid or missing API token');
        case 429:
          return new Error('Rate limit exceeded. Please try again later.');
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          return new Error(`API error: ${data.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      // No response received
      return new Error('No response from the server. Please check your connection.');
    } else {
      // Request setup error
      return new Error(`Request error: ${error.message}`);
    }
  }
}

module.exports = new PollinationsService();
