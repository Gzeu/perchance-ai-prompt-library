const axios = require('axios');

class ImageGenerator {
  async generateImage(prompt) {
    try {
      console.log('🌸 Using Pollinations AI for real image generation...');
      const encodedPrompt = encodeURIComponent(prompt);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
      
      const response = await axios.get(url, { 
        responseType: 'arraybuffer', 
        timeout: 20000 
      });
      
      console.log('✅ Real AI image generated successfully!');
      return Buffer.from(response.data);
      
    } catch (error) {
      console.warn('❌ Pollinations AI failed:', error.message);
      
      // Fallback la placeholder profesional
      try {
        const placeholder = await axios.get(
          'https://placehold.co/512x512/1a1a1a/00bcd4/png?text=AI+Image+Unavailable', 
          { responseType: 'arraybuffer', timeout: 10000 }
        );
        return Buffer.from(placeholder.data);
      } catch (fallbackError) {
        // Ultimate fallback
        return Buffer.from('Image generation temporarily unavailable', 'utf-8');
      }
    }
  }
}

const generator = new ImageGenerator();
module.exports = { 
  generateImage: generator.generateImage.bind(generator) 
};
