const axios = require('axios');

class PerchanceIntegration {
  constructor() {
    this.baseUrl = 'https://perchance.org';
    this.timeout = 15000;
  }

  async generateText(generator, prompt, options = {}) {
    try {
      const { count = 1, format = 'json' } = options;
      
      console.log(`🔗 Calling Perchance.org: ${generator} with prompt: ${prompt}`);
      
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        generator: generator,
        prompt: prompt,
        count: count,
        format: format
      }, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Perchance-Discord-Bot/2.0'
        }
      });

      return {
        success: true,
        data: response.data,
        source: 'perchance.org'
      };
      
    } catch (error) {
      console.error('❌ Perchance API error:', error.message);
      return {
        success: false,
        error: error.message,
        source: 'perchance.org'
      };
    }
  }

  async generatePrompt(style, subject, options = {}) {
    const promptText = `Create a ${style} style prompt for: ${subject}`;
    
    // Try different Perchance generators
    const generators = [
      'ai-prompt-generator',
      'art-prompt-generator', 
      'image-prompt-generator'
    ];

    for (const generator of generators) {
      const result = await this.generateText(generator, promptText, options);
      if (result.success) {
        return result;
      }
    }

    // Fallback to basic text generation
    return await this.generateText('text-generator', promptText, options);
  }

  async generateImage(prompt, options = {}) {
    const imageGenerators = [
      'ai-image-generator',
      'text-to-image',
      'stable-diffusion-generator'
    ];

    for (const generator of imageGenerators) {
      try {
        const response = await axios.post(`${this.baseUrl}/api/generate`, {
          generator: generator,
          prompt: prompt,
          style: options.style || 'realistic'
        }, {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Perchance-Discord-Bot/2.0'
          }
        });

        if (response.data && response.data.imageUrl) {
          return {
            success: true,
            imageUrl: response.data.imageUrl,
            source: 'perchance.org'
          };
        }
      } catch (error) {
        console.warn(`❌ Perchance generator ${generator} failed:`, error.message);
        continue;
      }
    }

    return {
      success: false,
      error: 'No Perchance image generators available',
      source: 'perchance.org'
    };
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/status`, {
        timeout: 5000
      });
      return {
        connected: true,
        status: response.data
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

module.exports = new PerchanceIntegration();
