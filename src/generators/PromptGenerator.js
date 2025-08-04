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

    const styleName = config.style;
    const style = this.styles[styleName];
    
    if (!style) {
      throw new Error(`Style "${styleName}" not found. Available: ${Object.keys(this.styles).join(', ')}`);
    }

    let prompt = style.formula;
    const variables = { ...config };

    Object.keys(style.variables).forEach(key => {
      if (!variables[key] && style.variables[key].length > 0) {
        variables[key] = this.options.randomizeVariables ? 
          randomChoice(style.variables[key]) : 
          style.variables[key][0];
      }
    });

    if (config.subject) variables.subject = config.subject;
    prompt = replacePlaceholders(prompt, variables);

    if (this.options.includeQuality && style.quality_modifiers) {
      const qualityMods = style.quality_modifiers.slice(0, 3).join(', ');
      prompt += `, ${qualityMods}`;
    }

    const result = {
      text: prompt,
      style: styleName,
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
