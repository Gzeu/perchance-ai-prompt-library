class EnhancedPromptGenerator {
  constructor() {
    this.styleTemplates = {
      anime: {
        prefix: "highly detailed anime character illustration, dynamic action pose, colorful fantasy background, crisp clean lineart, masterpiece, soft cell shading, expressive face, trending on artstation, detailed 4k rendering",
        suffix: "anime style, best quality",
        negatives: "bad anatomy, bad hands, poorly drawn face, signature, watermark, blurry, distorted, out of frame, chibi, deformed, mutation"
      },
      photorealistic: {
        prefix: "photorealistic, ultra detailed, hyper-realistic texture, dramatic lighting, realistic skin, sharp focus, professional photography, 8k, high definition, perfect composition",
        suffix: "professional photography, award winning",
        negatives: "cartoon, anime, painting, drawing, sketch, blurry, low quality, distorted, watermark, artificial"
      },
      cinematic: {
        prefix: "cinematic composition, film lighting, dramatic mood, wide establishing shot, epic scene, volumetric lighting, professional color grading, detailed environment, movie depth of field",
        suffix: "cinematic masterpiece, film quality",
        negatives: "amateur, low budget, poor lighting, flat composition, watermark, signature, low quality"
      },
      digital_art: {
        prefix: "digital painting masterpiece, concept art, vibrant colors, dynamic composition, detailed brushwork, trending on artstation, high resolution, professional illustration",
        suffix: "digital art, concept art quality",
        negatives: "blurry, low quality, amateur, sketch, unfinished, watermark, signature, pixelated"
      },
      comic: {
        prefix: "comic book style illustration, bold inked lines, dynamic panel composition, vibrant pop art colors, dramatic action pose, professional comic art, halftone effects",
        suffix: "comic book art, professional illustration",
        negatives: "blurry, realistic photo, watermark, poor anatomy, bad hands, distorted, amateur"
      },
      pixel_art: {
        prefix: "pixel art, 8-bit retro style, crisp pixel edges, nostalgic gaming aesthetic, minimalist design, retro color palette, classic arcade game style",
        suffix: "high quality pixel art, retro gaming",
        negatives: "blurry, anti-aliased, smooth gradients, photorealistic, watermark, low resolution"
      }
    };

    this.qualityModifiers = [
      "masterpiece", "best quality", "ultra detailed", "sharp focus",
      "professionally made", "award winning", "trending on artstation",
      "highly detailed", "4k resolution", "perfect composition", "vivid colors"
    ];

    this.moodVariations = {
      dramatic: "dramatic lighting, intense atmosphere, high contrast, bold shadows",
      peaceful: "soft lighting, calm atmosphere, serene mood, gentle colors",
      epic: "epic scale, grandiose composition, heroic pose, majestic lighting",
      mysterious: "mysterious atmosphere, shadowy lighting, enigmatic mood, dark ambiance",
      vibrant: "bright vivid colors, energetic composition, lively atmosphere, dynamic lighting"
    };

    this.subjectExpansions = {
      'vasile': 'Romanian medieval warrior named Vasile wearing traditional armor',
      'dragon': 'majestic dragon with detailed scales, powerful wings, and fierce expression',
      'warrior': 'heroic warrior in battle armor wielding a legendary weapon',
      'princess': 'elegant princess in royal dress with ornate crown and jewels',
      'robot': 'futuristic robot with advanced technology, glowing details, and sleek design',
      'castle': 'medieval castle with towering spires and detailed stone architecture',
      'forest': 'mystical forest with ancient trees and magical glowing atmosphere',
      'city': 'futuristic cityscape with towering buildings and neon lighting',
      'knight': 'noble knight in shining armor with heraldic symbols',
      'mage': 'powerful mage with flowing robes and magical energy',
      'cat': 'adorable cat with expressive eyes and detailed fur texture',
      'house': 'detailed architectural house with intricate design elements'
    };
  }

  expandSubject(subject) {
    const lowercaseSubject = subject.toLowerCase().trim();
    
    // Check for exact matches first
    if (this.subjectExpansions[lowercaseSubject]) {
      return this.subjectExpansions[lowercaseSubject];
    }
    
    // Check for partial matches
    for (const [key, expansion] of Object.entries(this.subjectExpansions)) {
      if (lowercaseSubject.includes(key) || key.includes(lowercaseSubject)) {
        return expansion.replace(key, subject);
      }
    }
    
    // If no expansion found, enhance with basic descriptors
    if (subject.length <= 3) {
      return `detailed ${subject} with intricate features`;
    }
    
    return subject;
  }

  enhancePrompt(style, subject, options = {}) {
    const template = this.styleTemplates[style] || this.styleTemplates.anime;
    const mood = options.mood || 'dramatic';
    const moodModifier = this.moodVariations[mood] || this.moodVariations.dramatic;
    
    // Expand subject if it's too simple
    const expandedSubject = this.expandSubject(subject);
    
    // Select quality modifiers (rotate to avoid repetition)
    const selectedModifiers = this.qualityModifiers.slice(0, 4).join(', ');
    
    // Build enhanced prompt with proper structure
    const enhancedPrompt = [
      expandedSubject,
      template.prefix,
      moodModifier,
      template.suffix,
      selectedModifiers
    ].filter(Boolean).join(', ');

    return {
      text: enhancedPrompt,
      negatives: template.negatives,
      style: style,
      metadata: {
        wordCount: enhancedPrompt.split(' ').length,
        characterCount: enhancedPrompt.length,
        enhanced: true,
        originalSubject: subject,
        expandedSubject: expandedSubject,
        mood: mood,
        templateUsed: style
      }
    };
  }

  generateEnhanced(style, subject, options = {}) {
    console.log(`🔧 Enhancing prompt for style: ${style}, subject: "${subject}", options:`, options);
    
    // Generate enhanced prompt
    const result = this.enhancePrompt(style, subject, options);
    
    console.log(`✅ Enhanced prompt generated: ${result.metadata.wordCount} words, ${result.metadata.characterCount} characters`);
    
    return result;
  }

  // Batch generation support
  generateBatch(style, subject, options = {}) {
    const count = options.count || 3;
    const moods = Object.keys(this.moodVariations);
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      const moodForVariation = moods[i % moods.length];
      const variation = this.enhancePrompt(style, subject, { 
        ...options, 
        mood: moodForVariation 
      });
      
      variations.push({
        text: variation.text,
        variationNumber: i + 1,
        metadata: variation.metadata,
        negatives: variation.negatives
      });
    }
    
    return {
      results: variations,
      style: style,
      subject: subject,
      totalCount: count
    };
  }
}

module.exports = { EnhancedPromptGenerator };
