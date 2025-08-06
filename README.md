# 🎨 Perchance AI Prompt Library v2.4.0

> **Now with AI Image Generation powered by Pollinations.ai!**

[![npm version](https://badge.fury.io/js/perchance-ai-prompt-library.svg)](https://www.npmjs.com/package/perchance-ai-prompt-library)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)

> **The ultimate AI prompt library and generator with advanced CLI, batch processing, Discord bot, web interface, and professional-quality output**

## 🏗️ **System Components**

1. **Backend API** - Node.js server that handles prompt generation
2. **Web Interface** - React-based frontend for easy interaction
3. **Discord Bot** - Integration for Discord servers
4. **CLI Tool** - Command-line interface for power users

## ✨ **Features**

### 🚀 **Core Features**
- **📚 Comprehensive Encyclopedia**: 2+ art styles, 3+ subjects categories, 3+ famous artists, 3+ themes
- **⚡ Advanced CLI**: Professional command-line interface with 600+ lines of optimized code
- **🔄 Batch Processing**: Generate 1-100+ prompts with parallel processing (up to 5 threads)
- **📊 Analytics & Metrics**: Detailed usage statistics, popular styles tracking, daily usage patterns
- **💾 Multi-format Export**: JSON, CSV, TXT export for all data and generated prompts
- **🎯 Quality Control**: 10-level quality system with professional enhancement terms
- **🖼️ AI Image Generation**: Generate AI images directly from prompts using Pollinations AI integration
  - Multiple artistic styles (photorealistic, digital art, anime, etc.)
  - Advanced generation parameters (steps, guidance scale, seed, etc.)
  - Web interface with real-time preview
  - Command-line interface for automation
  - Caching for improved performance

### 🛠 **Advanced Features**
- **🔍 Fuzzy Search**: Intelligent search across styles, artists, subjects, and themes  
- **⚙️ Configuration Management**: Persistent settings with custom themes and preferences
- **📚 History Tracking**: Complete command history with export capabilities
- **🎭 Mood Variations**: 5 mood types (dramatic, epic, peaceful, vibrant, mysterious)
- **💨 Performance Optimization**: Intelligent caching and progress indicators
- **🎨 Custom Styling**: Beautiful ASCII banners, colored tables, and professional formatting

## 🚀 **Quick Start**

### 📥 Installation
```bash
# Install globally
npm install -g perchance-ai-prompt-library

# Or install locally
npm install perchance-ai-prompt-library
```

### 🖼️ AI Image Generation with Pollinations.ai

### Web Interface
```bash
# Start the development server
npm run dev

# Then open http://localhost:3000 in your browser
```

### CLI Usage
```bash
# Generate an image from a prompt
npx perchance generate-image -p "A beautiful sunset over mountains"

# Generate with specific style and size
npx perchance generate-image -p "A cyberpunk city" -s cyberpunk --width 768 --height 512

# List available styles
npx perchance generate-image --list-styles
```

### API Integration
```javascript
const { PollinationsService } = require('perchance-ai-prompt-library');

const pollinations = new PollinationsService('your-api-key');

// Generate an image
const imageBuffer = await pollinations.generateImage({
  prompt: 'A beautiful sunset over mountains, photorealistic style',
  width: 512,
  height: 512,
  steps: 50,
  guidance_scale: 7.5
});

// Save the image
await fs.writeFile('output.png', imageBuffer);
```

For detailed documentation, see [POLLINATIONS-INTEGRATION.md](docs/POLLINATIONS-INTEGRATION.md)

## 🚦 Starting the Application

### 🏃‍♂️ Quick Start (Windows)

1. **Using the Batch File (Recommended)**
   ```bash
   # Double-click on start_services.bat
   # OR run from command line:
   .\start_services.bat
   ```
   This will start all services in separate command windows.

2. **Manual Start**
   ```bash
   # 1. Start the Backend Server
   node src/api/server.js
   
   # 2. In a new terminal, start the Web Interface
   cd web
   npm start
   
   # 3. (Optional) In another terminal, start the Discord Bot
   node src/bot/bot.js
   ```

### 🧹 Cleanup

To remove temporary and unnecessary files:
```bash
.\cleanup.bat
```

### 🔍 Accessing the Services

- **Web Interface**: http://localhost:3001
- **API Documentation**: http://localhost:3000/api-docs
- **API Endpoint**: http://localhost:3000/api

### 🛠 Development

1. **Install Dependencies**
   ```bash
   npm install
   cd web
   npm install
   cd ..
   ```

2. **Environment Variables**
   - Copy `.env.example` to `.env` and update the values
   - For Discord bot, update the token in `.env`

3. **Available Scripts**
   ```bash
   # Start API server in development mode
   npm run dev
   
   # Start web interface
   cd web
   npm start
   
   # Run tests
   npm test
   ```
   npm start
   ```

2. **Start the Web Interface** (in a new terminal)
   ```bash
   cd web
   npm install
   npm run dev
   # Access the web interface at http://localhost:5173
   ```

3. **Start the Discord Bot** (in a new terminal)
   ```bash
   cd discord-bot
   npm start
   # Make sure to set up your Discord bot token in .env file
   ```

4. **Use the CLI** (in a new terminal)
   ```bash
   # From the project root directory
   node bin/cli.js --help
   ```

### 🖥️ Basic CLI Usage

```bash
# Generate a single prompt
node bin/cli.js generate anime "space warrior"

# Generate multiple variations
node bin/cli.js generate photorealistic "cyberpunk city" -c 5 -q 10

# Browse available styles
node bin/cli.js styles

# Batch processing
node bin/cli.js batch anime "dragon" -c 20 -p 5
```

### 🤖 Discord Bot Commands
```
/batch <style> <subject> [count] [quality] [mood]
```

### 🌐 Web Interface
Access the web interface at `http://localhost:5173` after starting the web server.

## 📖 **Complete Documentation**

### **Core Commands**

#### 🎨 **Generate Command**
perchance-prompts generate <style> "<subject>" [options]

Options:
-c, --count <number> Number of variations (default: 1)
-q, --quality <level> Quality level 1-10 (default: 8)
-m, --mood <mood> Mood: dramatic|epic|peaceful|vibrant|mysterious
-v, --verbose Show detailed metadata
--save Save to history
--negative Include negative prompt suggestions



**Examples:**
High-quality single prompt
perchance-prompts generate anime "warrior princess" -q 10 -m epic

Multiple variations with mood
perchance-prompts generate photorealistic "sunset landscape" -c 3 -m peaceful --verbose

Save to history with negative prompts
perchance-prompts generate "oil painting" "portrait" --save --negative


#### ⚡ **Batch Processing**
perchance-prompts batch <style> "<subject>" [options]

Options:
-c, --count <number> Number of variations (default: 10)
-p, --parallel <threads> Parallel threads 1-5 (default: 3)
-q, --quality <level> Quality level 1-10 (default: 8)
--progress Show detailed progress
--export <format> Export: json|txt|csv



**Examples:**
Large batch with progress tracking
perchance-prompts batch anime "mecha robot" -c 50 -p 5 --progress

Export batch results
perchance-prompts batch photorealistic "nature scene" -c 20 --export csv


#### 🎨 **Browse Encyclopedia**
Browse art styles
perchance-prompts styles [-s search] [-e export] [--detailed]

Browse subjects
perchance-prompts subjects [-c category] [-s search]

Browse famous artists
perchance-prompts artists [-s search] [--period era]

Browse themes
perchance-prompts themes [-s search] [--category cat]


**Examples:**
Search and export styles
perchance-prompts styles -s "realistic" --export json

Detailed artist information
perchance-prompts artists --detailed

Filter themes by category
perchance-prompts themes --category "action"


### **Analytics & Management**

#### 📊 **Statistics**
perchance-prompts stats [--export format]


**Features:**
- Total generations and commands
- Popular styles ranking  
- Daily usage patterns
- Recent activity log
- Export capabilities

#### ⚙️ **Configuration**
Show current config
perchance-prompts config --show

Set configuration
perchance-prompts config --set defaultStyle=anime
perchance-prompts config --set qualityLevel=9

Reset to defaults
perchance-prompts config --reset


#### 📚 **History Management**
View history
perchance-prompts history [-n 20]

Clear history
perchance-prompts history --clear


## 🎯 **Advanced Usage Examples**

### **Professional Workflow**
1. Configure for optimal settings
perchance-prompts config --set qualityLevel=10
perchance-prompts config --set defaultStyle=photorealistic

2. Generate high-quality prompts with analytics
perchance-prompts generate anime "cyberpunk samurai" -c 5 -q 10 -m epic --save --verbose

3. Batch process for production
perchance-prompts batch photorealistic "architectural photography" -c 100 -p 5 --export csv

4. Review analytics
perchance-prompts stats
perchance-prompts history -n 10


### **Creative Exploration**
Explore different moods
perchance-prompts generate "oil painting" "forest scene" -m peaceful -c 3
perchance-prompts generate "digital art" "space battle" -m dramatic -c 3
perchance-prompts generate "watercolor" "flower garden" -m vibrant -c 3

Mix styles with artists
perchance-prompts artists -s "van gogh"
perchance-prompts generate "van gogh style" "starry cityscape" -q 9


## 📁 **Project Structure**

perchance-ai-prompt-library/
├── bin/
│ └── cli.js # Advanced CLI (600+ lines)
├── src/
│ ├── index.js # Main library
│ ├── data/ # Encyclopedia JSON files
│ │ ├── styles.json # Art styles database
│ │ ├── subjects.json # Subject categories
│ │ ├── artists.json # Famous artists
│ │ ├── themes.json # Thematic elements
│ │ ├── negatives.json # Negative prompts
│ │ └── recipes.json # Prompt recipes
│ └── utils/ # Utility functions
├── tests/ # Test suites
├── docs/ # Documentation
├── README.md # This file
├── CHANGELOG.md # Version history
└── package.json # Package configuration


## 🔧 **Development**

### **Setup Development Environment**
Clone repository
git clone https://github.com/perchance-ai/prompt-library.git
cd prompt-library

Install dependencies
npm install

Link for development
npm link

Run tests
npm test
npm run test:cli


### **Available Scripts**
npm run dev # Development mode
npm run test # Run all tests
npm run test:cli # Test CLI functionality
npm run lint # Code linting
npm run docs # Generate documentation
npm run release # Create release


## 📊 **Performance & Scale**

- **⚡ Generation Speed**: 1-3 prompts/second
- **🔄 Batch Capacity**: Up to 100 prompts with 5 parallel threads
- **💾 Memory Usage**: ~50MB for full encyclopedia
- **📱 Compatibility**: Node.js 14+ on Windows, macOS, Linux
- **🌐 Network**: Offline-first, no external API dependencies

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md).

### **Ways to Contribute:**
- 🎨 Add new art styles or artists
- 📝 Improve documentation  
- 🐛 Report bugs or request features
- 💡 Suggest new CLI commands
- 🧪 Add test cases

## 📝 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🆕 **What's New in v2.2.0**

- ✨ **Advanced CLI**: Complete rewrite with 600+ lines of professional code
- ⚡ **Batch Processing**: Parallel processing with progress tracking
- 📊 **Analytics System**: Comprehensive usage statistics and metrics
- 💾 **Export Capabilities**: Multi-format export (JSON, CSV, TXT)
- 🎯 **Quality Control**: 10-level quality system with mood variations
- ⚙️ **Configuration Management**: Persistent settings and preferences
- 📚 **History Tracking**: Complete command history with search
- 🔍 **Fuzzy Search**: Intelligent search across all data
- 🎨 **Professional UI**: Beautiful formatting and ASCII art
- 💨 **Performance**: Caching, optimization, and error handling

## 📞 **Support & Links**

- 📖 **Documentation**: [Full Documentation](https://github.com/perchance-ai/prompt-library/wiki)
- 🐛 **Issues**: [GitHub Issues](https://github.com/perchance-ai/prompt-library/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/perchance-ai/prompt-library/discussions)
- 📦 **NPM**: [npm package](https://www.npmjs.com/package/perchance-ai-prompt-library)
- ⭐ **Star us**: [GitHub Repository](https://github.com/perchance-ai/prompt-library)

---

**Made with ❤️ by the AI Research Team**

*Transform your AI image generation workflow with professional-grade prompts and advanced CLI tools.*