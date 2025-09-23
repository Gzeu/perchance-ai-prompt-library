# 🎨 Perchance AI Prompt Library

<div align="center">

[![Version](https://img.shields.io/badge/version-2.3.2-blue.svg)](https://github.com/Gzeu/perchance-ai-prompt-library/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![NPM](https://img.shields.io/badge/npm-%3E%3D6.0.0-red)](https://www.npmjs.com/)
[![GitHub Stars](https://img.shields.io/github/stars/Gzeu/perchance-ai-prompt-library?style=social)](https://github.com/Gzeu/perchance-ai-prompt-library/stargazers)

**🚀 The Ultimate AI Prompt Generation Toolkit**

*Professional-grade AI prompt library with advanced CLI, batch processing, Discord bot integration, web interface, and AI image generation powered by Pollinations.ai*

[✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [📖 Documentation](#-complete-documentation) • [🔧 Development](#-development) • [🤝 Contributing](#-contributing)

</div>

---

## 🌟 What's New in v2.3.2

- 🖼️ **AI Image Generation** - Direct integration with Pollinations.ai
- ⚡ **Enhanced Performance** - Optimized batch processing with up to 5 parallel threads
- 🎯 **Advanced Quality Control** - 10-level quality system with mood variations
- 📊 **Comprehensive Analytics** - Detailed usage statistics and metrics
- 🔍 **Smart Search** - Fuzzy search across styles, artists, subjects, and themes
- 💾 **Multi-Format Export** - JSON, CSV, TXT export capabilities

## 🎯 Key Features

### 🚀 **Core Capabilities**
- **📚 Comprehensive Database**: 50+ art styles, 100+ subjects, 75+ famous artists, 200+ themes
- **⚡ Lightning-Fast CLI**: Professional command-line interface with 600+ lines of optimized code
- **🔄 Batch Processing**: Generate 1-1000+ prompts with parallel processing (up to 5 threads)
- **📊 Advanced Analytics**: Real-time usage statistics, popular styles tracking, performance metrics
- **💾 Smart Export**: Multi-format export (JSON, CSV, TXT) for seamless integration
- **🎯 Quality Enhancement**: 10-level quality system with professional enhancement terms

### 🖼️ **AI Image Generation**
- **🎨 Pollinations.ai Integration**: Generate high-quality AI images directly from prompts
- **🎭 Multiple Artistic Styles**: Photorealistic, digital art, anime, oil painting, watercolor, and more
- **⚙️ Advanced Parameters**: Custom steps, guidance scale, seed control, aspect ratios
- **🌐 Web Interface**: Real-time preview with intuitive controls
- **⚡ CLI Automation**: Command-line interface for batch image generation
- **💨 Smart Caching**: Optimized performance with intelligent caching system

### 🛠 **Professional Tools**
- **🔍 Intelligent Search**: Fuzzy search with advanced filtering across all data
- **⚙️ Configuration Management**: Persistent settings with custom themes and preferences
- **📚 History Tracking**: Complete command history with search and export capabilities
- **🎭 Mood System**: 5 distinct mood variations (dramatic, epic, peaceful, vibrant, mysterious)
- **💨 Performance Optimization**: Smart caching, progress indicators, error handling
- **🎨 Beautiful UI**: ASCII art banners, colored tables, professional formatting

### 🌐 **Multi-Platform Support**
- **🖥️ Advanced CLI**: Full-featured command-line interface for power users
- **🌐 Web Interface**: React-based frontend with real-time generation
- **🤖 Discord Bot**: Server integration with slash commands
- **📱 Cross-Platform**: Windows, macOS, Linux support

## 🚀 Quick Start

### 📦 Installation

```bash
# Install globally (recommended)
npm install -g perchance-ai-prompt-library

# Or install locally
npm install perchance-ai-prompt-library

# Verify installation
perchance-prompts --version
```

### ⚙️ Environment Setup

Create a `.env` file in your project root:

```env
# Required for AI Image Generation
POLLINATIONS_TOKEN=your_pollinations_ai_token_here

# Optional Configuration
LOG_LEVEL=info
PORT=3000
DB_PATH=./data/prompts.db
```

### 🎨 Basic Usage

```bash
# Generate a single high-quality prompt
perchance-prompts generate anime "cyberpunk warrior" -q 10

# Create multiple variations with mood
perchance-prompts generate photorealistic "sunset landscape" -c 5 -m epic

# Batch process with analytics
perchance-prompts batch "digital art" "space exploration" -c 20 -p 3 --progress

# Browse available styles
perchance-prompts styles --detailed

# View usage statistics
perchance-prompts stats --export json
```

### 🖼️ AI Image Generation

```bash
# Generate image from prompt
perchance-prompts generate-image -p "Epic dragon in cyberpunk city, neon lights"

# Custom style and dimensions
perchance-prompts generate-image -p "Peaceful forest scene" -s photorealistic --width 1024 --height 768

# List available styles
perchance-prompts generate-image --list-styles
```

### 🌐 Web Interface

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# Enjoy the intuitive web interface with real-time generation
```

## 🏗️ System Architecture

```
📦 Perchance AI Prompt Library
├── 🖥️  Advanced CLI Tool          → Power user interface
├── 🌐  React Web Interface       → Visual prompt generation
├── 🤖  Discord Bot Integration   → Server automation
├── ⚙️  Node.js API Server        → Backend processing
├── 🖼️  AI Image Generation      → Pollinations.ai integration
├── 📊  Analytics Engine          → Usage tracking & metrics
├── 💾  Multi-format Export       → JSON, CSV, TXT support
└── 🔍  Smart Search System       → Fuzzy search & filtering
```

## 📚 Complete Documentation

### 🎨 **Core Commands**

#### Generate Command
```bash
perchance-prompts generate <style> "<subject>" [options]
```

**Options:**
- `-c, --count <number>` - Number of variations (default: 1)
- `-q, --quality <level>` - Quality level 1-10 (default: 8)
- `-m, --mood <mood>` - Mood: dramatic|epic|peaceful|vibrant|mysterious
- `-v, --verbose` - Show detailed metadata
- `--save` - Save to history
- `--negative` - Include negative prompt suggestions

**Examples:**
```bash
# High-quality single prompt
perchance-prompts generate anime "warrior princess" -q 10 -m epic

# Multiple variations with mood
perchance-prompts generate photorealistic "sunset landscape" -c 3 -m peaceful --verbose

# Save to history with negative prompts
perchance-prompts generate "oil painting" "portrait" --save --negative
```

#### Batch Processing
```bash
perchance-prompts batch <style> "<subject>" [options]
```

**Options:**
- `-c, --count <number>` - Number of variations (default: 10)
- `-p, --parallel <threads>` - Parallel threads 1-5 (default: 3)
- `-q, --quality <level>` - Quality level 1-10 (default: 8)
- `--progress` - Show detailed progress
- `--export <format>` - Export: json|txt|csv

**Examples:**
```bash
# Large batch with progress tracking
perchance-prompts batch anime "mecha robot" -c 50 -p 5 --progress

# Export batch results
perchance-prompts batch photorealistic "nature scene" -c 20 --export csv
```

#### Browse Encyclopedia
```bash
# Browse art styles
perchance-prompts styles [-s search] [-e export] [--detailed]

# Browse subjects
perchance-prompts subjects [-c category] [-s search]

# Browse famous artists
perchance-prompts artists [-s search] [--period era]

# Browse themes
perchance-prompts themes [-s search] [--category cat]
```

### 📊 **Analytics & Management**

#### Statistics
```bash
perchance-prompts stats [--export format]
```

**Features:**
- Total generations and commands executed
- Popular styles ranking and usage patterns
- Daily/weekly/monthly usage analytics
- Performance metrics and optimization insights
- Export capabilities for external analysis

#### Configuration
```bash
# View current configuration
perchance-prompts config --show

# Set configuration options
perchance-prompts config --set defaultStyle=anime
perchance-prompts config --set qualityLevel=9

# Reset to defaults
perchance-prompts config --reset
```

#### History Management
```bash
# View command history
perchance-prompts history [-n 20]

# Clear history
perchance-prompts history --clear

# Export history
perchance-prompts history --export json
```

## 🎯 Advanced Usage Examples

### 🏆 **Professional Workflow**
```bash
# 1. Configure optimal settings
perchance-prompts config --set qualityLevel=10
perchance-prompts config --set defaultStyle=photorealistic

# 2. Generate high-quality prompts with analytics
perchance-prompts generate anime "cyberpunk samurai" -c 5 -q 10 -m epic --save --verbose

# 3. Batch process for production
perchance-prompts batch photorealistic "architectural photography" -c 100 -p 5 --export csv

# 4. Review analytics and performance
perchance-prompts stats --export json
perchance-prompts history -n 10
```

### 🎨 **Creative Exploration**
```bash
# Explore different moods
perchance-prompts generate "oil painting" "forest scene" -m peaceful -c 3
perchance-prompts generate "digital art" "space battle" -m dramatic -c 3
perchance-prompts generate "watercolor" "flower garden" -m vibrant -c 3

# Mix styles with famous artists
perchance-prompts artists -s "van gogh"
perchance-prompts generate "van gogh style" "starry cityscape" -q 9
```

### 🖼️ **AI Image Generation Workflow**
```bash
# Generate prompt and image in one workflow
perchance-prompts generate anime "dragon warrior" -q 10 --save
perchance-prompts generate-image -p "Epic dragon warrior, anime style, high detail" --width 1024 --height 1024

# Batch image generation
for i in {1..5}; do
  perchance-prompts generate-image -p "Fantasy landscape $i" -s photorealistic
done
```

## 🔧 Development

### 🛠️ **Setup Development Environment**

```bash
# Clone repository
git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
cd perchance-ai-prompt-library

# Install dependencies
npm install

# Install web dependencies
cd web && npm install && cd ..

# Link for development
npm link

# Run tests
npm test
npm run test:cli
```

### 📜 **Available Scripts**

```bash
# Development
npm run dev              # Start API server in development mode
npm run start           # Start production server

# Testing
npm test                # Run all tests
npm run test:cli        # Test CLI functionality
npm run test:generate   # Test prompt generation
npm run test:batch      # Test batch processing

# Utilities
npm run lint            # Code linting
npm run docs            # Generate documentation
npm run release         # Create release
```

### 🏗️ **Project Structure**

```
perchance-ai-prompt-library/
├── 📁 bin/                    # CLI executable
│   └── cli.js                # Advanced CLI (600+ lines)
├── 📁 src/                   # Core library
│   ├── index.js             # Main library entry
│   ├── 📁 data/             # Encyclopedia JSON files
│   │   ├── styles.json      # Art styles database
│   │   ├── subjects.json    # Subject categories
│   │   ├── artists.json     # Famous artists
│   │   ├── themes.json      # Thematic elements
│   │   ├── negatives.json   # Negative prompts
│   │   └── recipes.json     # Prompt recipes
│   ├── 📁 api/              # API server
│   ├── 📁 utils/            # Utility functions
│   └── 📁 services/         # Service integrations
├── 📁 web/                   # React web interface
├── 📁 discord-bot/           # Discord bot integration
├── 📁 docs/                  # Documentation
├── 📁 tests/                 # Test suites
├── 📁 templates/             # Generation templates
└── 📄 README.md             # This file
```

## 🚀 Performance & Scalability

| Metric | Performance |
|--------|-------------|
| ⚡ **Generation Speed** | 1-5 prompts/second |
| 🔄 **Batch Capacity** | Up to 1000 prompts |
| 🧵 **Parallel Threads** | 1-5 configurable |
| 💾 **Memory Usage** | ~50MB for full encyclopedia |
| 🌐 **Compatibility** | Node.js 14+ on all platforms |
| 📡 **Network** | Offline-first, optional cloud features |
| 🖼️ **Image Generation** | Pollinations.ai integration |

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🌟 **Ways to Contribute**
- 🎨 **Add Content**: New art styles, artists, subjects, or themes
- 📝 **Documentation**: Improve guides, examples, and API docs
- 🐛 **Bug Reports**: Report issues with detailed reproduction steps
- 💡 **Feature Requests**: Suggest new CLI commands or functionality
- 🧪 **Testing**: Add test cases and improve coverage
- 🔧 **Code**: Fix bugs, optimize performance, add features

### 📋 **Contribution Process**
1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. ✅ Make your changes with tests
4. 📝 Commit with conventional commits (`git commit -m 'feat: add amazing feature'`)
5. 🚀 Push to your branch (`git push origin feature/amazing-feature`)
6. 🔄 Open a Pull Request

### 🧪 **Development Guidelines**
- Write clean, well-documented code
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation as needed
- Test on multiple platforms when possible

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 🎨 **Pollinations.ai** - AI image generation capabilities
- 🎯 **OpenAI Community** - Inspiration and best practices
- 🌟 **Contributors** - Everyone who helped make this project better
- 💡 **AI Art Community** - Feedback and feature suggestions

## 📞 Support & Links

<div align="center">

| Resource | Link |
|----------|------|
| 📖 **Documentation** | [Full Docs](https://github.com/Gzeu/perchance-ai-prompt-library/wiki) |
| 🐛 **Issues** | [GitHub Issues](https://github.com/Gzeu/perchance-ai-prompt-library/issues) |
| 💬 **Discussions** | [GitHub Discussions](https://github.com/Gzeu/perchance-ai-prompt-library/discussions) |
| 📦 **NPM Package** | [npm registry](https://www.npmjs.com/package/perchance-ai-prompt-library) |
| ⭐ **Star the Repo** | [GitHub Repository](https://github.com/Gzeu/perchance-ai-prompt-library) |
| 👨‍💻 **Author** | [George Pricop (@Gzeu)](https://github.com/Gzeu) |

---

**Made with ❤️ by [George Pricop](https://github.com/Gzeu)**

*Transform your AI image generation workflow with professional-grade prompts and advanced automation tools.*

[![GitHub followers](https://img.shields.io/github/followers/Gzeu?style=social)](https://github.com/Gzeu)
[![X Follow](https://img.shields.io/twitter/follow/GeorgeP95539774?style=social&logo=x)](https://x.com/GeorgeP95539774)

</div>