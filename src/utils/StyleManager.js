const stylesData = require('../data/styles.json');

class StyleManager {
  constructor() {
    this.styles = stylesData;
  }

  getAllStyles() {
    return Object.keys(this.styles).map(key => ({
      key: key,
      name: this.styles[key].name,
      description: this.styles[key].description || '',
      variableCount: Object.keys(this.styles[key].variables).length,
      hasExamples: (this.styles[key].examples || []).length > 0
    }));
  }

  getStyleInfo(styleName) {
    const style = this.styles[styleName];
    if (!style) {
      throw new Error(`Style "${styleName}" not found`);
    }
    return {
      name: style.name,
      formula: style.formula,
      variables: style.variables,
      negative_prompt: style.negative_prompt,
      quality_modifiers: style.quality_modifiers,
      examples: style.examples || [],
      description: style.description || '',
      bestFor: style.best_for || []
    };
  }
}

module.exports = StyleManager;
