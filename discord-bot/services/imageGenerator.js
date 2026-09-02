const axios = require('axios');

class ImageGenerator {
  async generateImage(prompt) {
    // All generation is 100% local — no external AI providers (Pollinations, Groq, etc.)
    // Perchance.org is a text generator; image generation is not supported natively.
    console.log('🎲 Image generation requested (local — no external AI)');

    // Fallback: use a text-based placeholder image service
    try {
      const encodedPrompt = encodeURIComponent(prompt.substring(0, 100));
      const response = await axios.get(
        `https://placehold.co/512x512/1a1a2e/00bcd4/png?text=${encodedPrompt}`,
        { responseType: 'arraybuffer', timeout: 10000 }
      );
      return Buffer.from(response.data);
    } catch (error) {
      console.warn('❌ Placeholder image failed:', error.message);
      return Buffer.from('Image generation temporarily unavailable', 'utf-8');
    }
  }
}

const generator = new ImageGenerator();
module.exports = {
  generateImage: generator.generateImage.bind(generator)
};
