const fs = require('fs');
const path = require('path');
const { generatePromptId } = require('./helpers');

class TemplateManager {
  constructor() {
    this.templatesDir = path.resolve(process.cwd(), 'templates');
    this.ensureTemplatesDir();
  }

  ensureTemplatesDir() {
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }
  }

  save(name, config) {
    if (!name || !config) {
      throw new Error('Template name and configuration are required');
    }
    const templateData = {
      id: generatePromptId(),
      name: name,
      config: config,
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };
    const filePath = path.join(this.templatesDir, `${name}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(templateData, null, 2));
      return { success: true, message: `Template "${name}" saved successfully` };
    } catch (error) {
      throw new Error(`Failed to save template: ${error.message}`);
    }
  }

  load(name) {
    const filePath = path.join(this.templatesDir, `${name}.json`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template "${name}" not found`);
    }
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load template "${name}": ${error.message}`);
    }
  }

  list() {
    this.ensureTemplatesDir();
    try {
      return fs.readdirSync(this.templatesDir)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const name = path.basename(file, '.json');
          return { name: name, filePath: path.join(this.templatesDir, file) };
        });
    } catch (error) {
      return [];
    }
  }
}

module.exports = TemplateManager;
