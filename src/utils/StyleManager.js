const stylesData = require('../data/styles.json');

class StyleManager {
  constructor() {
    this.styles = stylesData;
  }

  getAllStyles() {
    // If styles is an array, map over it directly
    if (Array.isArray(this.styles)) {
      return this.styles.map(style => ({
        key: style.key,
        name: style.name,
        description: style.description || '',
        variableCount: style.variables ? Object.keys(style.variables).length : 0,
        hasExamples: (style.examples || []).length > 0
      }));
    }
    
    // Fallback for object-style storage (legacy support)
    return Object.keys(this.styles).map(key => ({
      key: key,
      name: this.styles[key].name,
      description: this.styles[key].description || '',
      variableCount: this.styles[key].variables ? Object.keys(this.styles[key].variables).length : 0,
      hasExamples: (this.styles[key].examples || []).length > 0
    }));
  }

  getStyleInfo(styleName) {
    let style;
    
    // Handle array-based styles
    if (Array.isArray(this.styles)) {
      style = this.styles.find(s => s.key === styleName);
    } else {
      // Fallback for object-based styles
      style = this.styles[styleName];
    }
    
    if (!style) {
      // Get available style keys for better error message
      const availableStyles = Array.isArray(this.styles) 
        ? this.styles.map(s => s.key).join(', ')
        : Object.keys(this.styles).join(', ');
        
      throw new Error(`Style "${styleName}" not found. Available styles: ${availableStyles}`);
    }
    
    // Return style info with defaults for all fields
    return {
      name: style.name || 'Unnamed Style',
      formula: style.formula || '',
      variables: style.variables || {},
      negative_prompt: style.negative_prompt || '',
      quality_modifiers: style.quality_modifiers || [],
      examples: style.examples || [],
      description: style.description || '',
      bestFor: style.best_for || []
    };
  }
}

module.exports = StyleManager;
