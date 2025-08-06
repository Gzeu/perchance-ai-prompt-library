import React, { useState, useEffect } from 'react';
import { usePollinationsImage } from '@pollinations/react';
import './ImageGenerator.css';

const ImageGenerator = ({ prompt, width = 512, height = 512, model = 'stable-diffusion-xl' }) => {
  const [imagePrompt, setImagePrompt] = useState(prompt);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Use the Pollinations image generation hook
  const imageUrl = usePollinationsImage(imagePrompt, {
    width,
    height,
    model,
  });

  // Update loading state based on image generation status
  useEffect(() => {
    if (imagePrompt && !imageUrl) {
      setIsGenerating(true);
    } else if (imageUrl) {
      setIsGenerating(false);
    }
  }, [imageUrl, imagePrompt]);

  // Update prompt if it changes
  useEffect(() => {
    setImagePrompt(prompt);
  }, [prompt]);

  // Generate a new image with the current prompt
  const handleRegenerate = () => {
    setImagePrompt(''); // Clear to trigger re-render
    setTimeout(() => setImagePrompt(prompt), 0);
  };

  return (
    <div className="image-generator">
      {isGenerating ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating your image...</p>
          <p className="prompt-preview">"{imagePrompt}"</p>
        </div>
      ) : imageUrl ? (
        <div className="image-result">
          <img 
            src={imageUrl} 
            alt={`AI generated: ${imagePrompt}`} 
            className="generated-image"
            onError={(e) => {
              console.error('Error loading image:', e);
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <div className="error-message" style={{display: 'none'}}>
            Failed to load image. Please try again.
          </div>
          <div className="image-actions">
            <button 
              onClick={handleRegenerate}
              className="regenerate-btn"
              title="Generate a new image with the same prompt"
            >
              🔄 Regenerate
            </button>
            <a 
              href={imageUrl} 
              download={`ai-image-${Date.now()}.png`}
              className="download-btn"
              title="Download this image"
            >
              💾 Download
            </a>
          </div>
        </div>
      ) : (
        <div className="prompt-required">
          <p>Enter a prompt to generate an image</p>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
