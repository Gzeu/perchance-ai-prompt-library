const stylesData = require('../data/styles.json');
const { randomChoice, replacePlaceholders, validateConfig } = require('../utils/helpers');

class PromptGenerator {
  constructor(options = {}) {
    this.styles = stylesData;
    this.options = {
      includeQuality: true,
      includeNegativePrompt: true,
      randomizeVariables: false,
      ...options
    };
  }

  generate(config) {
    const validation = validateConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    // Find the style by key (supports both string keys and array indices)
    let style;
    if (Array.isArray(this.styles)) {
      // If styles is an array, find by key
      style = this.styles.find(s => s.key === config.style);
    } else {
      // If styles is an object, access by key
      style = this.styles[config.style];
    }
    
    if (!style) {
      const availableStyles = Array.isArray(this.styles) 
        ? this.styles.map(s => s.key).join(', ')
        : Object.keys(this.styles).join(', ');
      throw new Error(`Style "${config.style}" not found. Available: ${availableStyles}`);
    }

    // Ensure style has required properties
    if (!style.formula || !style.variables) {
      throw new Error(`Invalid style configuration for "${config.style}". Missing required properties.`);
    }

    // Initialize prompt with the style's formula
    let prompt = style.formula;
    
    // Prepare variables for placeholder replacement
    const variables = { ...config };

    // Handle variables defined in the style
    if (Array.isArray(style.variables)) {
      // If variables is an array of variable names
      style.variables.forEach(varName => {
        if (!variables[varName] && style.examples && style.examples[0]) {
          // Use the first example as a default value if available
          variables[varName] = style.examples[0];
        }
      });
    } else if (typeof style.variables === 'object' && style.variables !== null) {
      // If variables is an object with variable names as keys and possible values as arrays
      Object.keys(style.variables).forEach(key => {
        if (!variables[key] && Array.isArray(style.variables[key]) && style.variables[key].length > 0) {
          variables[key] = this.options.randomizeVariables ? 
            randomChoice(style.variables[key]) : 
            style.variables[key][0];
        }
      });
    }

    // Ensure subject is set
    if (config.subject) {
      variables.subject = config.subject;
    } else if (!variables.subject) {
      // If no subject is provided, use a default based on the style
      variables.subject = style.examples && style.examples.length > 0 
        ? style.examples[0] 
        : 'a character';
    }

    // Replace placeholders in the prompt
    prompt = replacePlaceholders(prompt, variables);

    // Add quality modifiers if enabled
    if (this.options.includeQuality && style.quality_modifiers && Array.isArray(style.quality_modifiers)) {
      const qualityMods = style.quality_modifiers.slice(0, 3).join(', ');
      prompt += `, ${qualityMods}`;
    }

    const result = {
      text: prompt,
      style: style.key || config.style,  // Use the style's key or the provided style name
      variables: variables,
      timestamp: new Date().toISOString(),
      metadata: {
        wordCount: prompt.split(' ').length,
        characterCount: prompt.length
      }
    };

    if (this.options.includeNegativePrompt && style.negative_prompt) {
      result.negativePrompt = style.negative_prompt;
    }

    return result;
  }

  generateVariations(style, config, count = 3) {
    const variations = [];
    for (let i = 0; i < count; i++) {
      const originalRandomize = this.options.randomizeVariables;
      this.options.randomizeVariables = true;
      try {
        const variation = this.generate({ ...config, style: style });
        variation.variationNumber = i + 1;
        variations.push(variation);
      } catch (error) {
        console.warn(`Failed to generate variation ${i + 1}:`, error.message);
      }
      this.options.randomizeVariables = originalRandomize;
    }
    return variations;
  }

  getStats() {
    const styleCount = Object.keys(this.styles).length;
    let totalVariables = 0;
    Object.values(this.styles).forEach(style => {
      totalVariables += Object.keys(style.variables).length;
    });
    return {
      totalStyles: styleCount,
      totalVariables: totalVariables,
      availableStyles: Object.keys(this.styles)
    };
  }
}

module.exports = PromptGenerator;
