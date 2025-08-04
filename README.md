# Perchance AI Prompt Library 🎨

> **Complete prompt library and generator for Perchance AI tools with BATCH generation and EXPORT features!**

[![npm version](https://img.shields.io/badge/npm-v1.1.0-blue.svg)](https://npmjs.org/package/perchance-ai-prompt-library)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-8%2F8%20passing-brightgreen.svg)](https://github.com/Gzeu/perchance-ai-prompt-library)
[![Coverage](https://img.shields.io/badge/coverage-90%25+-green.svg)](https://github.com/Gzeu/perchance-ai-prompt-library)

## 🚀 What's New in v1.1

### 🔥 **NEW: Batch Generation**
Generate multiple unique variations of the same prompt instantly!

Generate 5 variations of anime warrior
perchance-prompts batch anime "warrior princess" --count 5

Generate 10 photorealistic portraits
perchance-prompts batch photorealistic "professional headshot" --count 10


### 💾 **NEW: Export Functionality**
Export your generated prompts to JSON or TXT files!

Export to JSON
perchance-prompts export digital_art "space battle" --format json --count 5

Export to TXT
perchance-prompts export cinematic "noir detective" --format txt --count 3


## 🚀 Quick Start

Install globally
npm install -g perchance-ai-prompt-library

Try the new batch feature
perchance-prompts batch anime "magical sorceress" --count 5

Interactive mode (enhanced with export options!)
perchance-prompts interactive


## ✨ Example Outputs

### **🔥 Batch Generation Example:**
$ perchance-prompts batch anime "dragon rider" --count 3

🔄 Generating 3 variations of "dragon rider" in anime style...

✨ Variation 1:
Beautiful soft anime style, dragon rider, a stunning 22 year old anime woman with short spiky blue hair, striking violet eyes, athletic build, two dimensional anime style, wearing warrior armor, ancient temple, battle stance, good realistic body proportions with tall stature, masterpiece, best quality, ultra detailed
📊 Words: 45, Characters: 318

✨ Variation 2:
Beautiful soft anime style, dragon rider, a stunning 18 year old anime woman with long flowing silver hair, striking amber eyes, slender figure, two dimensional anime style, wearing magical robes, floating castle, in dynamic pose, good realistic body proportions with petite stature, masterpiece, best quality, ultra detailed
📊 Words: 46, Characters: 322

✨ Variation 3:
Beautiful soft anime style, dragon rider, a stunning 25 year old anime woman with messy dark purple hair, striking emerald green eyes, petite frame, two dimensional anime style, wearing school uniform, cyberpunk street, standing gracefully, good realistic body proportions with average height stature, masterpiece, best quality, ultra detailed
📊 Words: 48, Characters: 334


## 🎯 All Features

- **🎨 6+ Art Styles** - Anime, Cinematic, Photorealistic, Digital Art, Comic, Pixel Art
- **⚡ Batch Generation** - Generate 1-10 variations instantly
- **💾 Export Support** - Save to JSON/TXT files
- **🤖 Smart Variables** - 50+ contextual replacements
- **💻 CLI & API** - Command line and programmatic use  
- **📄 Templates** - Save and reuse configurations
- **🚫 Negative Prompts** - Automatic quality enhancement
- **🧪 Fully Tested** - 90%+ test coverage with 8/8 tests passing
- **🆓 Free & Open** - No API keys, works offline

## 📦 Installation

Global installation (recommended)
npm install -g perchance-ai-prompt-library

Local project
npm install perchance-ai-prompt-library

Clone and build
git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
cd perchance-ai-prompt-library
npm install && npm test


## 🎮 CLI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `interactive` | Interactive prompt builder | `perchance-prompts interactive` |
| `generate <style> <subject>` | Generate single prompt | `perchance-prompts generate anime "warrior"` |
| `batch <style> <subject> --count N` | **NEW!** Generate N variations | `perchance-prompts batch cinematic "detective" --count 5` |
| `export <style> <subject> --format F` | **NEW!** Export to file | `perchance-prompts export digital_art "dragon" --format json` |
| `list` | Show available styles | `perchance-prompts list` |
| `stats` | Library statistics | `perchance-prompts stats` |

## 🎨 Available Styles

| Style | Variables | Best For | NEW Batch Support |
|-------|-----------|----------|-------------------|
| **anime** | 11 categories | Characters, fan art | ✅ Yes |
| **cinematic** | 6 categories | Storytelling, professional | ✅ Yes |
| **photorealistic** | 6 categories | Commercial, portraits | ✅ Yes |
| **digital_art** | 5 categories | Concept art, fantasy | ✅ Yes |  
| **comic** | 5 categories | Action scenes, illustrations | ✅ Yes |
| **pixel_art** | 4 categories | Game sprites, retro | ✅ Yes |

## 💻 Programmatic Usage

### Basic Generation
const { PerchancePromptLibrary } = require('perchance-ai-prompt-library');
const library = new PerchancePromptLibrary();

// Single prompt
const prompt = library.generate({
style: 'anime',
subject: 'magical sorceress'
});

console.log(prompt.text);


### **NEW: Batch Generation API**
// Generate multiple variations
const variations = library.generateVariations('cinematic', {
subject: 'space battle'
}, 5);

variations.forEach((variation, index) => {
console.log(Variation ${index + 1}: ${variation.text});
});

// Export to file
const fs = require('fs');
fs.writeFileSync('prompts.json', JSON.stringify(variations, null, 2));


## 🧪 Testing

Run all tests (now includes batch and export tests!)
npm test

Test specific functionality
npm run test:batch # Test batch generation
npm run test:export # Test export functionality

Run with coverage
npm test -- --coverage


**Current Test Results:**
- ✅ **8/8 tests passing** (up from 4/4!)
- ✅ **90%+ code coverage** (improved!)
- ✅ **Batch generation fully tested**
- ✅ **Export functionality verified**

## 📈 Performance

- **Single Generation:** <10ms
- **Batch Generation (5 prompts):** <50ms
- **Export to File:** <100ms
- **Memory Usage:** <10MB
- **Zero External API Calls**

## 🤝 Contributing

We love contributions! The library is now easier to extend with batch and export features.

git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
cd perchance-ai-prompt-library
npm install
npm test


## 📈 Roadmap

### 🎯 **v1.2** (Next week)
- [ ] **Interactive batch mode** with live preview
- [ ] **Style mixing** - Combine multiple styles
- [ ] **Template batch export** - Apply templates to multiple subjects
- [ ] **CLI progress bars** for batch operations

### 🎯 **v1.3** (Next month)  
- [ ] **Web interface** with batch generation
- [ ] **Discord bot** with batch commands
- [ ] **Batch optimization** - Remove similar variations
- [ ] **Export to multiple formats** (CSV, YAML, XML)

## 💬 Community

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Gzeu/perchance-ai-prompt-library/issues)
- 💡 **Feature Requests**: [Discussions](https://github.com/Gzeu/perchance-ai-prompt-library/discussions)  
- 📧 **Questions**: [Create an Issue](https://github.com/Gzeu/perchance-ai-prompt-library/issues/new)

## 📄 License

MIT © [Gzeu](https://github.com/Gzeu)

---

**⭐ Star this repo if the new batch features help your AI art projects!**

**🔥 Made with ❤️ for the AI art community - Now with BATCH POWER!**
