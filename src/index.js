const PromptGenerator = require('./generators/PromptGenerator');
const StyleManager = require('./utils/StyleManager');
const TemplateManager = require('./utils/TemplateManager');

class PerchancePromptLibrary {
  constructor(options = {}) {
    this.generator = new PromptGenerator(options);
    this.styleManager = new StyleManager();
    this.templateManager = new TemplateManager();
  }

  generate(config) {
    return this.generator.generate(config);
  }

  generateVariations(style, config, count = 3) {
    return this.generator.generateVariations(style, config, count);
  }

  listStyles() {
    return this.styleManager.getAllStyles();
  }

  getStyleInfo(styleName) {
    return this.styleManager.getStyleInfo(styleName);
  }

  saveTemplate(name, config) {
    return this.templateManager.save(name, config);
  }

  loadTemplate(name) {
    return this.templateManager.load(name);
  }

  listTemplates() {
    return this.templateManager.list();
  }

  getStats() {
    const generatorStats = this.generator.getStats();
    return generatorStats;
  }
}

module.exports = {
  PerchancePromptLibrary,
  PromptGenerator,
  StyleManager,
  TemplateManager
};
