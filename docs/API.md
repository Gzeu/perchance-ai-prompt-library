# API Documentation

## Perchance AI Prompt Library API

The Perchance AI Prompt Library provides both a programmatic API and a REST API for generating AI prompts.

## Table of Contents

1. [Library API](#library-api)
2. [REST API](#rest-api)
3. [CLI API](#cli-api)
4. [Examples](#examples)
5. [Error Handling](#error-handling)

---

## Library API

### Installation

```bash
npm install perchance-ai-prompt-library
```

### Basic Usage

```javascript
const { PerchancePromptLibrary } = require('perchance-ai-prompt-library');

// Initialize the library
const promptLib = new PerchancePromptLibrary({
  defaultQuality: 8,
  cacheEnabled: true
});

// Generate a single prompt
const prompt = promptLib.generate({
  style: 'anime',
  subject: 'warrior princess',
  quality: 10,
  mood: 'epic'
});

console.log(prompt.text);
// Output: "Magnificent anime masterpiece featuring legendary fighter..."
```

### Core Classes

#### PerchancePromptLibrary

Main class for prompt generation and management.

**Constructor Options:**
```javascript
const options = {
  defaultQuality: 8,        // Default quality level (1-10)
  cacheEnabled: true,       // Enable prompt caching
  dataPath: './data',       // Path to data files
  logLevel: 'info'          // Logging level
};
```

**Methods:**

##### `generate(config)` → `Object`

Generates a single AI prompt.

**Parameters:**
- `config.style` (string): Art style (e.g., 'anime', 'photorealistic')
- `config.subject` (string): Subject of the prompt
- `config.quality` (number, optional): Quality level 1-10
- `config.mood` (string, optional): Mood variation
- `config.enhancer` (boolean, optional): Apply enhancement terms

**Returns:**
```javascript
{
  text: "Generated prompt text...",
  metadata: {
    style: "anime",
    subject: "warrior princess",
    quality: 10,
    wordCount: 45,
    characterCount: 280,
    timestamp: "2025-09-21T20:42:33Z",
    enhancementLevel: "advanced"
  }
}
```

##### `generateVariations(style, config, count)` → `Array`

Generates multiple prompt variations.

**Parameters:**
- `style` (string): Art style
- `config` (object): Configuration object
- `count` (number): Number of variations to generate

**Example:**
```javascript
const variations = promptLib.generateVariations('cyberpunk', {
  subject: 'neon city',
  quality: 9
}, 5);

variations.forEach((prompt, index) => {
  console.log(`Variation ${index + 1}: ${prompt.text}`);
});
```

##### `listStyles()` → `Array`

Returns all available art styles.

```javascript
const styles = promptLib.listStyles();
styles.forEach(style => {
  console.log(`${style.name}: ${style.description}`);
});
```

##### `getStyleInfo(styleName)` → `Object`

Get detailed information about a specific style.

```javascript
const animeStyle = promptLib.getStyleInfo('anime');
console.log(animeStyle.description);
console.log(animeStyle.artists); // Associated artists
console.log(animeStyle.examples); // Example subjects
```

#### StyleManager

Manages art styles and categories.

```javascript
const { StyleManager } = require('perchance-ai-prompt-library');
const styleManager = new StyleManager();

// Get all styles
const allStyles = styleManager.getAllStyles();

// Search styles
const searchResults = styleManager.searchStyles('realistic');

// Get styles by category
const digitalArt = styleManager.getStylesByCategory('Digital Art');
```

#### TemplateManager

Manages prompt templates and recipes.

```javascript
const { TemplateManager } = require('perchance-ai-prompt-library');
const templateManager = new TemplateManager();

// Save a template
templateManager.save('my-template', {
  style: 'anime',
  subject: 'magical girl',
  quality: 9,
  mood: 'vibrant'
});

// Load a template
const template = templateManager.load('my-template');
const prompt = promptLib.generate(template);

// List all templates
const templates = templateManager.list();
```

---

## REST API

### Starting the Server

```bash
# Start the API server
npm run dev
# or
node src/api/server.js
```

The server runs on `http://localhost:3000` by default.

### Endpoints

#### `POST /api/generate`

Generate a single prompt.

**Request Body:**
```json
{
  "style": "anime",
  "subject": "warrior princess",
  "quality": 10,
  "mood": "epic",
  "enhancer": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "Magnificent anime masterpiece featuring...",
    "metadata": {
      "style": "anime",
      "quality": 10,
      "wordCount": 45,
      "timestamp": "2025-09-21T20:42:33Z"
    }
  }
}
```

#### `POST /api/batch`

Generate multiple prompts.

**Request Body:**
```json
{
  "style": "photorealistic",
  "subject": "sunset landscape",
  "count": 5,
  "quality": 8,
  "parallel": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prompts": [
      {
        "text": "Ultra-realistic sunset landscape...",
        "metadata": { ... }
      }
    ],
    "totalCount": 5,
    "processingTime": "2.3s"
  }
}
```

#### `GET /api/styles`

Get all available art styles.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "key": "anime",
      "name": "Anime/Manga Style",
      "description": "Japanese animation style...",
      "category": "Animation",
      "popularity": 95
    }
  ]
}
```

#### `GET /api/styles/:styleName`

Get information about a specific style.

#### `GET /api/subjects`

Get all subject categories.

#### `GET /api/artists`

Get all artists in the database.

#### `GET /api/themes`

Get all available themes.

### Error Responses

```json
{
  "success": false,
  "error": {
    "code": "INVALID_STYLE",
    "message": "The specified style 'invalid' was not found",
    "details": {
      "availableStyles": ["anime", "photorealistic", ...]
    }
  }
}
```

---

## CLI API

The CLI provides a command-line interface to all functionality.

### Installation

```bash
npm install -g perchance-ai-prompt-library
```

### Commands

#### Generate Prompts

```bash
# Basic generation
perchance-prompts generate anime "warrior princess"

# Advanced generation
perchance-prompts generate anime "warrior princess" \
  --quality 10 \
  --mood epic \
  --count 3 \
  --verbose \
  --save
```

#### Batch Processing

```bash
# Batch generation
perchance-prompts batch photorealistic "landscape" \
  --count 20 \
  --parallel 5 \
  --progress \
  --export json
```

#### Browse Data

```bash
# List styles
perchance-prompts styles --detailed

# Search styles
perchance-prompts styles --search "realistic"

# Export styles
perchance-prompts styles --export csv
```

#### Configuration

```bash
# Show current config
perchance-prompts config --show

# Set configuration
perchance-prompts config --set defaultStyle=anime
perchance-prompts config --set qualityLevel=9

# Reset configuration
perchance-prompts config --reset
```

---

## Examples

### Advanced Prompt Generation

```javascript
const { PerchancePromptLibrary } = require('perchance-ai-prompt-library');
const promptLib = new PerchancePromptLibrary();

// Professional photography prompt
const photoPrompt = promptLib.generate({
  style: 'photorealistic',
  subject: 'mountain landscape at golden hour',
  quality: 10,
  mood: 'peaceful'
});

// Anime character prompt
const animePrompt = promptLib.generate({
  style: 'anime',
  subject: 'cyberpunk samurai with neon katana',
  quality: 9,
  mood: 'dramatic',
  enhancer: true
});

// Digital art prompt
const digitalPrompt = promptLib.generate({
  style: 'digital_art',
  subject: 'floating island with ancient ruins',
  quality: 8,
  mood: 'mysterious'
});
```

### Batch Processing Workflow

```javascript
// Generate multiple variations for A/B testing
const variations = promptLib.generateVariations('concept_art', {
  subject: 'futuristic vehicle design',
  quality: 9
}, 10);

// Filter by quality score
const highQuality = variations.filter(p => p.metadata.quality >= 9);

// Export results
const fs = require('fs');
fs.writeFileSync('prompts.json', JSON.stringify(highQuality, null, 2));
```

### Template System

```javascript
const { TemplateManager } = require('perchance-ai-prompt-library');
const templateManager = new TemplateManager();

// Create reusable templates
templateManager.save('character-portrait', {
  style: 'oil_painting',
  subject: 'noble character portrait',
  quality: 10,
  mood: 'dramatic'
});

templateManager.save('landscape-scene', {
  style: 'watercolor',
  subject: 'serene nature landscape',
  quality: 8,
  mood: 'peaceful'
});

// Use templates
const portraitPrompt = promptLib.generate(
  templateManager.load('character-portrait')
);
```

---

## Error Handling

### Common Errors

```javascript
try {
  const prompt = promptLib.generate({
    style: 'invalid_style',
    subject: 'test'
  });
} catch (error) {
  switch (error.code) {
    case 'STYLE_NOT_FOUND':
      console.log('Available styles:', error.availableStyles);
      break;
    case 'INVALID_QUALITY':
      console.log('Quality must be between 1 and 10');
      break;
    case 'EMPTY_SUBJECT':
      console.log('Subject cannot be empty');
      break;
    default:
      console.error('Unexpected error:', error.message);
  }
}
```

### Error Codes

- `STYLE_NOT_FOUND`: Specified style doesn't exist
- `INVALID_QUALITY`: Quality level outside 1-10 range
- `EMPTY_SUBJECT`: Subject string is empty or whitespace
- `TEMPLATE_NOT_FOUND`: Template doesn't exist
- `TEMPLATE_SAVE_ERROR`: Failed to save template
- `DATA_LOAD_ERROR`: Failed to load data files

---

## Performance Tips

1. **Enable Caching**: Use `cacheEnabled: true` for repeated generations
2. **Batch Processing**: Use `generateVariations()` for multiple prompts
3. **Parallel Processing**: Use CLI batch mode with `--parallel 5`
4. **Template Reuse**: Save common configurations as templates
5. **Quality Optimization**: Lower quality levels (6-7) generate faster

---

**For more examples and tutorials, visit our [documentation](https://github.com/Gzeu/perchance-ai-prompt-library/wiki).**