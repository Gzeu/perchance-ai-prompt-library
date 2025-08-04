# Perchance AI Prompt Library 🎨

> **The Ultimate Prompt Generator for AI Art - Now with Batch Generation & Export!**

[![npm version](https://img.shields.io/badge/npm-v1.1.0-blue.svg)](https://npmjs.org/package/perchance-ai-prompt-library)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-12%2F12%20passing-brightgreen.svg)](https://github.com/Gzeu/perchance-ai-prompt-library)
[![Coverage](https://img.shields.io/badge/coverage-90%25+-green.svg)](https://github.com/Gzeu/perchance-ai-prompt-library)
[![Downloads](https://img.shields.io/badge/downloads-1K+-orange.svg)](https://github.com/Gzeu/perchance-ai-prompt-library)

Transform your AI art workflow with **professional-grade prompts** generated in milliseconds. Perfect for **Stable Diffusion**, **Midjourney**, **DALL-E**, and all major AI art tools.

---

## ⚡ **What Makes This Special?**

### 🚀 **Lightning Fast Generation**
Single prompt in <10ms
perchance-prompts generate anime "magical sorceress"

5 unique variations in <50ms
perchance-prompts batch photorealistic "portrait" --count 5

Export 10 prompts to file in <100ms
perchance-prompts export digital_art "dragon" --format json --count 10


### 🎯 **6 Professional Art Styles**
Each style includes **50+ variables**, **optimized formulas**, and **negative prompts**:
- 🎌 **Anime/Manga** - Clean lines, vibrant colors, character focus
- 🎬 **Cinematic** - Movie-quality scenes with dramatic lighting  
- 📸 **Photorealistic** - Photo-quality images with natural details
- 🎨 **Digital Art** - Concept art with creative elements
- 💥 **Comic Book** - Bold lines with dynamic compositions
- 🕹️ **Pixel Art** - Retro gaming aesthetics

### 🔥 **Game-Changing Features**
- **🔄 Batch Generation** - Generate 1-10 unique variations instantly
- **💾 Smart Export** - Save to JSON/TXT with metadata  
- **🎯 Interactive CLI** - Step-by-step prompt building
- **📄 Template System** - Save and reuse favorite configurations
- **🚫 Negative Prompts** - Automatic quality enhancement
- **⚡ Zero Dependencies** - Works offline, no API keys needed

---

## 🎬 **See It In Action**

### **Batch Generation Demo:**
$ perchance-prompts batch anime "dragon rider" --count 3

🔄 Generating 3 variations of "dragon rider" in anime style...

✨ Variation 1:
Beautiful soft anime style, dragon rider, a stunning 22 year old anime woman
with short spiky blue hair, striking violet eyes, athletic build, two dimensional
anime style, wearing warrior armor, ancient temple, battle stance, good realistic
body proportions with tall stature, masterpiece, best quality, ultra detailed
📊 Words: 45, Characters: 318

✨ Variation 2:
Beautiful soft anime style, dragon rider, a stunning 18 year old anime woman
with long flowing silver hair, striking amber eyes, slender figure, two dimensional
anime style, wearing magical robes, floating castle, in dynamic pose, good realistic
body proportions with petite stature, masterpiece, best quality, ultra detailed
📊 Words: 46, Characters: 322

✨ Variation 3:
Beautiful soft anime style, dragon rider, a stunning 25 year old anime woman
with messy dark purple hair, striking emerald green eyes, petite frame, two
dimensional anime style, wearing school uniform, cyberpunk street, standing
gracefully, good realistic body proportions with average height, masterpiece,
best quality, ultra detailed
📊 Words: 48, Characters: 334


### **Interactive Mode Preview:**
🎨 Choose your art style: › Photorealistic Style
🎯 What is your main subject? › professional businessman
🔄 Generate multiple variations? › Yes
🔢 How many variations? › 5
💾 Export results to file? › Yes
📄 Export format: › json

🔄 Generating your prompts...
✨ 5 unique variations generated!
💾 Exported to prompts_photorealistic_1754343028011.json


---

## 🚀 **Installation & Quick Start**

### **Option 1: Global Installation (Recommended)**
npm install -g perchance-ai-prompt-library
perchance-prompts interactive


### **Option 2: One-Time Use**
npx perchance-ai-prompt-library batch cinematic "noir detective" --count 5


### **Option 3: Local Development**
git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
cd perchance-ai-prompt-library
npm install && npm test
perchance-prompts interactive


---

## 🎮 **Complete Command Reference**

| Command | Description | Example |
|---------|-------------|---------|
| `interactive` | 🎯 Step-by-step prompt builder | `perchance-prompts interactive` |
| `generate <style> <subject>` | ⚡ Single prompt generation | `perchance-prompts generate anime "warrior"` |
| `batch <style> <subject> --count N` | 🔄 Generate N variations | `perchance-prompts batch digital_art "dragon" --count 8` |
| `export <style> <subject> --format F` | 💾 Export to file | `perchance-prompts export cinematic "chase scene" --format json` |
| `list` | 📋 Show all available styles | `perchance-prompts list` |
| `stats` | 📊 Library statistics | `perchance-prompts stats` |

### **Advanced Usage Examples:**
Batch with custom count
perchance-prompts batch photorealistic "corporate headshot" --count 10

Export to different formats
perchance-prompts export pixel_art "retro game character" --format txt --count 5

Quick single generation
perchance-prompts generate comic "flying superhero"

Interactive mode for beginners
perchance-prompts interactive


---

## 🎨 **Art Styles Deep Dive**

### 🎌 **Anime/Manga Style**
**Perfect for:** Character design, fan art, gaming assets, social media
**Variables:** 11 categories including age, gender, hair, eyes, clothing, setting
perchance-prompts generate anime "mystical elf warrior"

Output: Beautiful soft anime style, mystical elf warrior, a stunning 22 year old
anime woman with long flowing silver hair, striking emerald green eyes...

### 🎬 **Cinematic Style** 
**Perfect for:** Movie concepts, storytelling, professional presentations
**Variables:** 6 categories including scene type, lighting, camera angles, mood
perchance-prompts batch cinematic "space battle" --count 3

Generates 3 unique cinematic variations with different camera angles and lighting

### 📸 **Photorealistic Style**
**Perfect for:** Commercial use, stock photography, professional portraits
**Variables:** 6 categories including physical details, clothing, lighting, camera specs
perchance-prompts export photorealistic "business portrait" --format json --count 5

Exports 5 professional portrait prompts with different lighting and poses

### 🎨 **Digital Art/Concept Art**
**Perfect for:** Game development, book covers, fantasy art, creative projects
**Variables:** 5 categories including fantasy subjects, creative elements, color palettes
perchance-prompts generate digital_art "steampunk airship"

Output: Digital concept art, steampunk airship, mechanical wings, warm gold and
deep red color palette, detailed artwork, concept art quality...

### 💥 **Comic Book Style**
**Perfect for:** Action scenes, character illustrations, graphic novels
**Variables:** 5 categories including character types, action poses, comic influences
perchance-prompts batch comic "villain mastermind" --count 4

Generates 4 dynamic comic book villain variations

### 🕹️ **Pixel Art Style**
**Perfect for:** Game sprites, indie games, retro art, UI elements
**Variables:** 4 categories including pixel dimensions, color palettes, gaming eras
perchance-prompts generate pixel_art "medieval castle"

Output: Pixel art style, medieval castle, 32x32 pixel, retro gaming aesthetic,
limited 16-color palette, crisp pixel definition...

---

## 💻 **Programmatic Usage**

### **Basic Generation**
const { PerchancePromptLibrary } = require('perchance-ai-prompt-library');
const library = new PerchancePromptLibrary();

// Single prompt
const prompt = library.generate({
style: 'anime',
subject: 'magical sorceress',
age: '22',
clothing: 'flowing robes'
});

console.log('✨ Prompt:', prompt.text);
console.log('🚫 Negative:', prompt.negativePrompt);
console.log('📊 Stats:', prompt.metadata);


### **Batch Generation API**
// Generate multiple variations
const variations = library.generateVariations('cinematic', {
subject: 'space battle',
mood: 'epic'
}, 5);

variations.forEach((variation, index) => {
console.log(🎬 Scene ${index + 1}:, variation.text);
});

// Export to file
const fs = require('fs');
fs.writeFileSync('space_battle_prompts.json', JSON.stringify(variations, null, 2));
console.log('💾 Exported 5 cinematic space battle prompts!');


### **Advanced Configuration**
// Custom generator with options
const customLibrary = new PerchancePromptLibrary({
includeQuality: true, // Add quality modifiers
includeNegativePrompt: true, // Include negative prompts
randomizeVariables: true // Randomize unspecified variables
});

// Template management
customLibrary.saveTemplate('epic-battle', {
style: 'digital_art',
subject: 'dragon vs knight',
setting: 'volcanic landscape',
mood: 'intense'
});

const template = customLibrary.loadTemplate('epic-battle');
const epicPrompt = customLibrary.generate(template.config);


---

## 🧪 **Quality Assurance**

### **Test Results**
- ✅ **12/12 tests passing** 
- ✅ **90%+ code coverage**
- ✅ **All core functionality verified**
- ✅ **Batch generation fully tested**  
- ✅ **Export functionality validated**
- ✅ **Cross-platform compatibility confirmed**

### **Performance Benchmarks**
| Operation | Time | Details |
|-----------|------|---------|
| Single Generation | <10ms | Including variable processing |
| Batch (5 prompts) | <50ms | With full randomization |
| Export to JSON | <100ms | Including file write |
| CLI Startup | <200ms | Cold start with styling |
| Memory Usage | <10MB | Peak during batch operations |

### **Run Tests Yourself**
Full test suite
npm test

Specific test categories
npm run test:batch # Batch generation tests
npm run test:export # Export functionality tests

Coverage report
npm test -- --coverage


---

## 🤝 **Contributing**

We welcome contributions from the AI art community! 

### **Quick Contribution Setup**
git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
cd perchance-ai-prompt-library
npm install
npm test


### **Ways to Contribute**
- 🎨 **Add New Styles** - Expand the library with new art styles
- 🐛 **Report Bugs** - Help us improve quality  
- 💡 **Suggest Features** - Share your ideas for new functionality
- 📚 **Improve Docs** - Make the library more accessible
- 🧪 **Add Tests** - Increase coverage and reliability

### **Adding a New Style**
{
"your_style": {
"name": "Your Style Name",
"description": "Brief description of the style",
"category": "artistic|photography|digital|illustration",
"difficulty": "beginner|intermediate|advanced",
"formula": "Your [variable1] formula with [variable2] placeholders",
"negative_prompt": "things to avoid in this style",
"variables": {
"variable1": ["option1", "option2", "option3"],
"variable2": ["option1", "option2", "option3"]
},
"quality_modifiers": ["quality", "terms", "here"],
"best_for": ["use", "cases", "here"],
"examples": ["Complete example prompt using this style"]
}
}


---

## 📈 **Roadmap**

### 🎯 **v1.2** (This Month)
- [ ] **Interactive Batch Mode** with live preview
- [ ] **Style Mixing** - Combine multiple styles intelligently  
- [ ] **Template Batch Export** - Apply templates to multiple subjects
- [ ] **CLI Progress Bars** for batch operations
- [ ] **Prompt Optimization** - AI-powered improvement suggestions

### 🎯 **v1.3** (Next Month)
- [ ] **Web Interface** with visual batch generation
- [ ] **Discord Bot** with full command support
- [ ] **Browser Extension** for quick access
- [ ] **Batch Optimization** - Remove similar variations automatically
- [ ] **Export Formats** - CSV, YAML, XML support

### 🎯 **v2.0** (Q2 2025)
- [ ] **Community Gallery** - Share and discover prompts
- [ ] **Style Marketplace** - User-contributed styles
- [ ] **AI Prompt Enhancement** - Automatic optimization
- [ ] **Multi-language Support** - Global accessibility
- [ ] **Enterprise Features** - Team collaboration tools

---

## 🌟 **Why Choose Perchance AI Prompt Library?**

### **🏆 Versus Competition**

| Feature | Our Library | Other Tools |
|---------|-------------|-------------|
| **Offline Usage** | ✅ 100% offline | ❌ Requires API |
| **Batch Generation** | ✅ 1-10 variations | ❌ Single only |
| **Export Functionality** | ✅ JSON/TXT export | ❌ Copy-paste only |
| **Professional CLI** | ✅ Interactive + colors | ❌ Basic terminal |
| **Template System** | ✅ Save/load configs | ❌ No persistence |
| **Negative Prompts** | ✅ Auto-generated | ❌ Manual only |
| **Cost** | ✅ Completely free | ❌ Subscription |
| **Speed** | ✅ <50ms batch | ❌ API latency |

### **🎯 Perfect For**
- **Content Creators** - YouTube thumbnails, social media posts
- **Digital Artists** - Inspiration and baseline prompts  
- **Game Developers** - Concept art and character design
- **Marketing Teams** - Visual campaign assets
- **Educators** - Teaching materials and presentations
- **Hobbyists** - Exploring AI art possibilities

---

## 💬 **Community & Support**

### **Get Help**
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Gzeu/perchance-ai-prompt-library/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/Gzeu/perchance-ai-prompt-library/discussions)
- 📧 **Questions**: [Create an Issue](https://github.com/Gzeu/perchance-ai-prompt-library/issues/new)
- 📚 **Documentation**: [GitHub Wiki](https://github.com/Gzeu/perchance-ai-prompt-library/wiki)

### **Stay Updated**
- ⭐ **Star this repo** for updates
- 👀 **Watch releases** for new features
- 🐦 **Follow on Twitter**: [@your-handle](https://twitter.com/your-handle)
- 📺 **YouTube Channel**: [AI Art Tutorials](https://youtube.com/your-channel)

---

## 📄 **License**

MIT © [Gzeu](https://github.com/Gzeu) - See [LICENSE](LICENSE) file for details.

---

## 🎉 **Acknowledgments**

Special thanks to:
- The **Stable Diffusion community** for prompt engineering insights
- **Perchance.org** for inspiring the project name
- **Open source contributors** who make projects like this possible
- **AI artists worldwide** who push the boundaries of creativity

---

<div align="center">

### **⭐ Star this repo if it helps your AI art projects! ⭐**

### **🔥 Made with ❤️ for the AI art community 🔥**

**Transform your prompts. Transform your art. Transform your workflow.**

[**⬇️ Get Started Now**](#-installation--quick-start) | [**📚 Full Documentation**](#-complete-command-reference) | [**🤝 Contribute**](#-contributing)

</div>