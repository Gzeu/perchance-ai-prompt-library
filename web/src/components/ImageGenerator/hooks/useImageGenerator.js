import { useState, useCallback } from 'react';
import axios from 'axios';

const useImageGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  /**
   * Generate an image using the Pollinations.ai API
   * @param {Object} params - Generation parameters
   * @param {string} params.prompt - The prompt for image generation
   * @param {string} [params.negativePrompt=''] - Negative prompt
   * @param {string} [params.style='photorealistic'] - Style preset
   * @param {number} [params.width=512] - Image width
   * @param {number} [params.height=512] - Image height
   * @param {number} [params.steps=50] - Number of diffusion steps
   * @param {number} [params.guidanceScale=7.5] - Guidance scale
   * @param {number} [params.seed=-1] - Random seed (-1 for random)
   * @returns {Promise<Object>} - Generated image data
   */
  const generateImage = useCallback(async ({
    prompt,
    negativePrompt = '',
    style = 'photorealistic',
    width = 512,
    height = 512,
    steps = 50,
    guidanceScale = 7.5,
    seed = -1,
  }) => {
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      // Add style to the prompt
      const fullPrompt = `${prompt}, ${style} style, high quality, detailed`;
      
      // Generate a random seed if not provided
      const finalSeed = seed === -1 ? Math.floor(Math.random() * 1000000) : seed;
      
      // Make the API call
      const response = await axios.post(
        '/api/images/generate',
        {
          prompt: fullPrompt,
          negative_prompt: negativePrompt,
          width,
          height,
          steps,
          guidance_scale: guidanceScale,
          seed: finalSeed,
        },
        {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'image/*',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setProgress(percentCompleted);
          },
        }
      );

      // Convert the response to a data URL
      const blob = new Blob([response.data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(blob);
      
      // Create the image data object
      const imageData = {
        url: imageUrl,
        prompt: fullPrompt,
        negativePrompt,
        style,
        width,
        height,
        steps,
        guidanceScale,
        seed: finalSeed,
        timestamp: new Date().toISOString(),
      };

      // Update state
      setGeneratedImage(imageData);
      setProgress(100);
      
      // Save to history
      saveToHistory(imageData);
      
      return imageData;
    } catch (err) {
      console.error('Error generating image:', err);
      const errorMessage = err.response?.data?.message || 'Failed to generate image';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Save the generated image to the history in localStorage
   * @param {Object} imageData - The image data to save
   */
  const saveToHistory = (imageData) => {
    try {
      const history = JSON.parse(localStorage.getItem('imageGenerationHistory') || '[]');
      const newHistory = [imageData, ...history].slice(0, 50); // Keep only the last 50 items
      localStorage.setItem('imageGenerationHistory', JSON.stringify(newHistory));
    } catch (err) {
      console.error('Error saving to history:', err);
      // Silently fail - this is not critical functionality
    }
  };

  /**
   * Get the generation history from localStorage
   * @returns {Array} - Array of previously generated images
   */
  const getHistory = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('imageGenerationHistory') || '[]');
    } catch (err) {
      console.error('Error getting history:', err);
      return [];
    }
  }, []);

  /**
   * Clear the generation history
   */
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem('imageGenerationHistory');
      return true;
    } catch (err) {
      console.error('Error clearing history:', err);
      return false;
    }
  }, []);

  /**
   * Download the generated image
   * @param {string} url - The image URL
   * @param {string} [filename] - Optional custom filename
   */
  const downloadImage = useCallback((url, filename) => {
    if (!url) return;
    
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `generated-image-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (err) {
      console.error('Error downloading image:', err);
      return false;
    }
  }, []);

  /**
   * Copy the image to clipboard
   * @param {string} url - The image URL
   * @returns {Promise<boolean>} - Whether the operation was successful
   */
  const copyToClipboard = useCallback(async (url) => {
    if (!url) return false;
    
    try {
      // Fetch the image
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      return true;
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      
      // Fallback: Copy just the URL
      try {
        await navigator.clipboard.writeText(url);
        return true;
      } catch (e) {
        console.error('Error copying URL to clipboard:', e);
        return false;
      }
    }
  }, []);

  return {
    // State
    isGenerating,
    generatedImage,
    error,
    progress,
    
    // Actions
    generateImage,
    downloadImage,
    copyToClipboard,
    getHistory,
    clearHistory,
    
    // Reset
    reset: () => {
      setGeneratedImage(null);
      setError(null);
      setProgress(0);
    },
  };
};

export default useImageGenerator;
