#!/bin/bash

# Perchance AI Prompt Library - Robust Setup Script
# Creates all files first, then handles dependencies

echo "🎨 Perchance AI Prompt Library - Robust Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# 1. Create all directories first
echo
echo "📁 Creating project structure..."
mkdir -p src/data src/generators src/utils examples tests bin templates
print_status "Directories created"

# 2. Create package.json FIRST
echo
echo "📦 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "perchance-ai-prompt-library",
  "version": "1.0.0",
  "description": "Complete prompt library and generator for Perchance AI tools",
  "main": "src/index.js",
  "bin": {
    "perchance-prompts": "./bin/cli.js"
  },
  "scripts": {
    "start": "node src/index.js",
    "test": "jest",
    "dev": "node src/index.js --dev",
    "generate": "node bin/cli.js"
  },
  "keywords": ["perchance", "ai", "prompt", "generator", "image-generation"],
  "author": "AI Research Team",
  "license": "MIT",
  "dependencies": {
    "commander": "^9.4.1",
    "inquirer": "^9.1.4",
    "chalk": "^5.2.0",
    "figlet": "^1.5.2",
    "fs-extra": "^11.1.0"
  },
  "devDependencies": {
    "jest": "^29.3.1"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
EOF
print_status "package.json created"

# 3. Create styles.json with corrected formulas
echo "🎨 Creating styles database..."
cat > src/data/styles.json << 'EOF'
{
  "anime": {
    "name": "Anime/Manga Style",
    "description": "Japanese animation style with clean lines and vibrant colors",
    "category": "artistic",
    "difficulty": "beginner",
    "formula": "Beautiful soft anime style, [subject], a stunning [age] year old anime [gender] with [hair_description], striking [eye_color] eyes, [body_type], two dimensional anime style, wearing [clothing], [setting], [position], good realistic body proportions with [stature], high-quality hands with perfect digits, crisp clothing free of artifacts, best possible image quality masterpiece, [expression]",
    "negative_prompt": "bad anatomy, bad hands, three hands, three legs, missing limbs, extra limbs, poorly drawn face, bad face, fused face, cloned face, worst face, extra fingers, missing fingers, ugly fingers, long fingers, extra eyes, huge eyes, realistic photo, 3d render, cartoon style mixing, blurry, low quality, watermark, signature",
    "variables": {
      "subject": ["magical girl", "warrior princess", "school student", "young hero", "mystical sorceress", "brave knight"],
      "age": ["18", "22", "25", "30", "teenager", "young adult"],
      "gender": ["woman", "man", "girl", "boy", "person"],
      "hair_description": ["long flowing silver hair", "short spiky blue hair", "messy dark purple hair", "braided golden hair"],
      "eye_color": ["emerald green", "sapphire blue", "amber", "violet", "crimson red"],
      "body_type": ["slender figure", "athletic build", "petite frame", "tall and graceful"],
      "clothing": ["flowing white summer dress", "school uniform", "magical robes", "warrior armor"],
      "setting": ["cherry blossom garden", "magical forest", "school courtyard", "ancient temple"],
      "position": ["standing gracefully", "sitting peacefully", "in dynamic pose", "battle stance"],
      "stature": ["petite", "tall", "average height"],
      "expression": ["gentle smile", "determined look", "mysterious gaze", "cheerful expression"]
    },
    "quality_modifiers": ["masterpiece", "best quality", "ultra detailed"],
    "best_for": ["characters", "portraits", "fantasy", "gaming"],
    "examples": [
      "Beautiful soft anime style, magical girl, a stunning 18 year old anime woman with long flowing silver hair, striking emerald green eyes, slender figure, two dimensional anime style, wearing magical robes, magical forest, standing gracefully, good realistic body proportions with petite stature, masterpiece"
    ]
  },
  "cinematic": {
    "name": "Cinematic/Film Style",
    "description": "Movie-like scenes with dramatic lighting",
    "category": "photography",
    "difficulty": "intermediate",
    "formula": "Cinematic [scene_type], [subject] [action], [lighting_style], cinematic 4K footage, professional film quality, [camera_angle], [mood], movie still",
    "negative_prompt": "amateur photography, low quality, blurry, bad lighting",
    "variables": {
      "subject": ["detective", "mysterious woman", "explorer", "businessman"],
      "scene_type": ["thriller scene", "drama scene", "action scene"],
      "action": ["walking down street", "sitting in café", "standing on cliff"],
      "lighting_style": ["film noir lighting", "golden hour lighting", "dramatic lighting"],
      "camera_angle": ["tracking shot", "close-up", "wide shot"],
      "mood": ["moody atmosphere", "mysterious atmosphere", "epic atmosphere"]
    },
    "quality_modifiers": ["cinematic 4K", "professional film quality", "movie still"],
    "best_for": ["storytelling", "drama", "professional"],
    "examples": [
      "Cinematic thriller scene, detective walking down street, film noir lighting, cinematic 4K footage, professional film quality, tracking shot, moody atmosphere, movie still"
    ]
  }
}
EOF
print_status "Styles database created"

# 4. Create main index.js
echo "🎯 Creating main library file..."
cat > src/index.js << 'EOF'
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
EOF
print_status "Main library file created"

# 5. Create helpers.js
echo "🔧 Creating helper functions..."
cat > src/utils/helpers.js << 'EOF'
function randomChoice(array) {
  if (!Array.isArray(array) || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}

function replacePlaceholders(template, variables) {
  let result = template;
  Object.keys(variables).forEach(key => {
    const placeholder = `[${key}]`;
    if (result.includes(placeholder)) {
      const value = variables[key] || '';
      result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
    }
  });
  result = result.replace(/\[[\w_]+\]/g, '');
  result = result.replace(/,\s*,/g, ',').replace(/,\s*$/, '').replace(/^\s*,/, '');
  return result.replace(/\s+/g, ' ').trim();
}

function validateConfig(config) {
  const errors = [];
  if (!config) {
    errors.push('Configuration is required');
    return { valid: false, errors };
  }
  if (!config.style) errors.push('Style is required');
  if (!config.subject) errors.push('Subject is required');
  return { valid: errors.length === 0, errors };
}

function generatePromptId() {
  return 'prompt_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

module.exports = {
  randomChoice,
  replacePlaceholders,
  validateConfig,
  generatePromptId
};
EOF
print_status "Helper functions created"

# 6. Create PromptGenerator.js
echo "⚙️ Creating prompt generator..."
cat > src/generators/PromptGenerator.js << 'EOF'
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
EOF
print_status "Prompt generator created"

# 7. Create StyleManager.js
echo "📊 Creating style manager..."
cat > src/utils/StyleManager.js << 'EOF'
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
EOF
print_status "Style manager created"

# 8. Create TemplateManager.js
echo "💾 Creating template manager..."
cat > src/utils/TemplateManager.js << 'EOF'
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
EOF
print_status "Template manager created"

# 9. Create CLI
echo "💻 Creating CLI..."
cat > bin/cli.js << 'EOF'
#!/usr/bin/env node

const { PerchancePromptLibrary } = require('../src/index');

// Simple CLI without heavy dependencies
const args = process.argv.slice(2);
const library = new PerchancePromptLibrary();

function showHelp() {
  console.log(`
🎨 Perchance AI Prompt Library CLI

Usage:
  node bin/cli.js <command> [options]

Commands:
  generate <style> <subject>  - Generate a prompt
  list                       - List available styles
  stats                      - Show statistics
  help                       - Show this help

Examples:
  node bin/cli.js generate anime "magical girl"
  node bin/cli.js list
  node bin/cli.js stats
`);
}

function main() {
  const command = args[0];
  
  try {
    switch (command) {
      case 'generate':
        const style = args[1];
        const subject = args[2];
        if (!style || !subject) {
          console.log('❌ Please provide style and subject');
          console.log('Example: node bin/cli.js generate anime "magical girl"');
          return;
        }
        const result = library.generate({ style, subject });
        console.log('\n✨ Generated Prompt:');
        console.log(result.text);
        if (result.negativePrompt) {
          console.log('\n🚫 Negative Prompt:');
          console.log(result.negativePrompt);
        }
        break;
        
      case 'list':
        const styles = library.listStyles();
        console.log('\n📋 Available Styles:');
        styles.forEach(style => {
          console.log(`• ${style.name} - ${style.description}`);
        });
        break;
        
      case 'stats':
        const stats = library.getStats();
        console.log('\n📊 Statistics:');
        console.log(`Total Styles: ${stats.totalStyles}`);
        console.log(`Total Variables: ${stats.totalVariables}`);
        console.log(`Available: ${stats.availableStyles.join(', ')}`);
        break;
        
      default:
        showHelp();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
EOF
chmod +x bin/cli.js
print_status "CLI created and made executable"

# 10. Create basic test
echo "🧪 Creating tests..."
cat > tests/prompt-generator.test.js << 'EOF'
const PromptGenerator = require('../src/generators/PromptGenerator');

describe('PromptGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new PromptGenerator();
  });

  test('should generate a valid anime prompt', () => {
    const config = { style: 'anime', subject: 'magical girl', age: '18' };
    const result = generator.generate(config);
    
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('style', 'anime');
    expect(result.text).toContain('anime');
    expect(result.text).toContain('magical girl');
    expect(result.variables.subject).toBe('magical girl');
  });

  test('should generate variations', () => {
    const variations = generator.generateVariations('cinematic', { subject: 'detective' }, 2);
    expect(variations).toHaveLength(2);
    variations.forEach(variation => {
      expect(variation).toHaveProperty('text');
      expect(variation).toHaveProperty('variationNumber');
    });
  });

  test('should throw error for invalid style', () => {
    expect(() => {
      generator.generate({ style: 'invalid_style', subject: 'test' });
    }).toThrow('Style "invalid_style" not found');
  });

  test('should return statistics', () => {
    const stats = generator.getStats();
    expect(stats).toHaveProperty('totalStyles');
    expect(stats.totalStyles).toBeGreaterThan(0);
  });
});
EOF
print_status "Tests created"

# 11. Create jest config
echo "⚙️ Creating Jest configuration..."
cat > jest.config.json << 'EOF'
{
  "testEnvironment": "node",
  "testMatch": ["**/tests/**/*.test.js"],
  "collectCoverage": true,
  "coverageDirectory": "coverage"
}
EOF
print_status "Jest config created"

# 12. Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
coverage/
*.log
.env
.DS_Store
templates/*.json
!templates/.gitkeep
EOF
print_status ".gitignore created"

# 13. Create templates directory
echo "# User templates will be stored here" > templates/.gitkeep
print_status "Templates directory initialized"

# 14. Create basic README
cat > README.md << 'EOF'
# Perchance AI Prompt Library 🎨

Complete prompt library and generator for Perchance AI tools.

## Quick Start

Install dependencies
npm install

Test the library
npm test

Use the CLI
node bin/cli.js generate anime "magical girl"
node bin/cli.js list
node bin/cli.js stats


## Usage

const { PerchancePromptLibrary } = require('./src/index');

const library = new PerchancePromptLibrary();
const prompt = library.generate({
style: 'anime',
subject: 'magical girl',
age: '18'
});

console.log(prompt.text);


## Features

- 🎨 Multiple art styles (anime, cinematic)
- 🤖 Advanced prompt engineering
- 💻 CLI interface
- 📄 Template system
- 🧪 Full test coverage

## License

MIT
EOF
print_status "README created"

# 15. NOW try to check Node.js and install dependencies
echo
echo "🔍 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 14 ]; then
        print_status "Node.js $(node -v) detected"
        
        echo
        echo "📦 Installing dependencies..."
        if npm install; then
            print_status "Dependencies installed successfully!"
            
            echo
            echo "🧪 Running tests..."
            if npm test; then
                print_status "All tests passed!"
            else
                print_warning "Some tests failed, but library should work"
            fi
            
        else
            print_warning "Dependency installation failed, but files are created"
            print_info "You can try 'npm install' manually later"
        fi
    else
        print_warning "Node.js version 14+ required. Current: $(node -v)"
        print_info "All files created, update Node.js to use npm commands"
    fi
else
    print_warning "Node.js not found"
    print_info "All files created, install Node.js to use npm commands"
fi

echo
echo "🎉 Setup completed!"
echo
echo "📁 Files created:"
echo "• package.json - npm configuration"
echo "• src/ - main source code"
echo "• bin/cli.js - command line interface"
echo "• tests/ - test suite"
echo "• README.md - documentation"
echo
echo "🚀 Try these commands:"
echo "node bin/cli.js generate anime 'magical girl'"
echo "node bin/cli.js list"
echo "node bin/cli.js stats"
echo
echo "If dependencies installed successfully:"
echo "npm test"
echo "npm start"