# 🎨 Perchance AI Prompt Library v2.1.0

[![NPM Version](https://img.shields.io/npm/v/perchance-ai-prompt-library)](https://npmjs.com/package/perchance-ai-prompt-library) [![Downloads](https://img.shields.io/npm/dm/perchance-ai-prompt-library)](https://npmjs.com/package/perchance-ai-prompt-library) [![Coverage](https://img.shields.io/codecov/c/github/Gzeu/perchance-ai-prompt-library)](https://codecov.io/gh/Gzeu/perchance-ai-prompt-library) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![GitHub Stars](https://img.shields.io/github/stars/Gzeu/perchance-ai-prompt-library)](https://github.com/Gzeu/perchance-ai-prompt-library)

> Complete prompt library and generator for Perchance AI tools, with CLI, API, Web, and Discord integration - 100% free and open source

## 🚀 Quick Start

Install globally
npm install -g perchance-ai-prompt-library

Generate your first prompt
perchance-prompts generate anime "space warrior"

Batch generation with export
perchance-prompts batch cinematic "detective" --count 5 --export json


## 🎯 Features

- [x] **CLI Prompt Generation** - 6+ professional art styles
- [x] **Batch Processing** - Generate multiple variations instantly
- [x] **REST API Server** - OpenAPI compliant with full documentation
- [x] **Web Interface** - React/Material-UI dashboard with live preview
- [x] **Discord Bot Integration** - Slash commands with AI image generation
- [x] **Unlimited AI Art** - Free image generation via Pollinations AI
- [x] **Professional Export** - PDF, JSON, CSV, TXT formats
- [x] **100% Cost-Free** - No API keys, no quotas, no hidden fees
- [x] **Open Source** - MIT license, community-driven development

## 🛠️ Usage

### CLI Examples
Single prompt generation
perchance-prompts generate photorealistic "sunset landscape" --export pdf

Batch generation with variations
perchance-prompts batch anime "magical girl" --count 3 --output ./results

Interactive mode
perchance-prompts interactive

List all available styles
perchance-prompts list


### API Examples
Generate single prompt
curl -X POST http://localhost:3000/api/prompts/generate
-H "Content-Type: application/json"
-d '{"style":"anime","subject":"dragon warrior"}'

Batch generation
curl -X POST http://localhost:3000/api/prompts/batch
-H "Content-Type: application/json"
-d '{"style":"cinematic","subject":"space battle","count":5}'


### Discord Bot
/generate anime "space warrior" image:true mood:epic
/batch cinematic "detective story" count:3


### Web Interface
Start the development server and visit: `http://localhost:5173`

cd web && npm run dev


## 🗂️ Available Styles

| Style | Description | Example Prompt |
|-------|-------------|----------------|
| `anime` | Japanese animation style with vibrant colors | "warrior princess" |
| `cinematic` | Movie-quality dramatic compositions | "epic space battle" |
| `photorealistic` | Hyper-realistic photography style | "sunset landscape" |
| `digital_art` | Modern digital painting techniques | "fantasy castle" |
| `comic` | Comic book illustration style | "superhero action" |
| `pixel_art` | 8-bit retro gaming aesthetic | "retro game hero" |

## ⚡ Why is it 100% Free?

- **No External Dependencies** - Self-hosted, no paid APIs required
- **Open Source Libraries** - Built with OSS tools and Pollinations AI (unlimited)
- **Community Driven** - NPM distribution, zero vendor lock-in
- **Educational Focus** - Designed to democratize AI art prompt generation

## 🤖 Who is this for?

- [x] **AI Artists & Prompt Engineers** - Professional prompt generation tools
- [x] **CLI Power Users** - Terminal-based workflow integration
- [x] **API Integrators** - Node.js, Python, or any HTTP client
- [x] **Discord Communities** - Server owners and bot builders
- [x] **Educators & Teachers** - Story generation tools (coming in v2.2)
- [x] **Content Creators** - Batch processing for social media

## ❓ FAQ

**Q: How do I add a new art style?**  
A: Add an entry to `src/data/styles.json` and run `node deploy-commands.js` for Discord Bot.

**Q: How can I change the default export directory?**  
A: Use `perchance-prompts config --set outputDirectory=/custom/path`

**Q: Do I ever need API keys?**  
A: No! All core functionality is 100% free with no quotas or hidden costs.

**Q: Can I use this commercially?**  
A: Yes, it's released under MIT license with no restrictions.

**Q: How do I contribute new templates?**  
A: Fork the repo, add templates to the appropriate directory, and submit a PR.

## 🛡️ Security

- **No Secrets Required** - Zero API keys for core functionality
- **Privacy First** - All processing happens locally or on your infrastructure
- **Zero Vendor Lock-in** - Complete control over your data and workflows
- **Safe Examples** - All documentation uses placeholder values only

## 🛤️ Roadmap & Planned Features

### ✅ **Completed (v2.1.0)**
- [x] CLI Prompt Generation with 6+ art styles
- [x] Discord Bot with AI image generation
- [x] Professional export formats (PDF/JSON/CSV)
- [x] Web interface with Material-UI
- [x] REST API with OpenAPI documentation
- [x] Enhanced prompt templates with mood variations

### 🚧 **In Development (v2.2.0)**
- [ ] **Interactive Story Generation** - Children's story creation tools
- [ ] **Character & World Builders** - Detailed narrative components
- [ ] **Multi-language Support** - Prompts in multiple languages
- [ ] **Plugin API** - Custom style extensions
- [ ] **Advanced Export** - ePub format with illustrations

### 💡 **Future Considerations**
- [ ] Browser extension for universal access
- [ ] Mobile PWA support
- [ ] Community template marketplace
- [ ] Advanced AI integrations (optional)

## 📦 Changelog

### [2.1.0] - 2025-08-05
- ✨ Enhanced prompt generation with professional templates
- 🖼️ Real AI image generation via Pollinations.ai integration
- 🤖 Discord Bot with mood variations and metadata embeds
- 🛡️ Comprehensive security improvements and .env protection
- 📚 Complete documentation overhaul with examples

### [2.0.1] - 2025-08-04
- 🌐 Web interface improvements and batch gallery
- 🔄 API enhancements with better error handling
- 📊 Performance optimizations for CLI operations

### [1.1.0] - 2025-08-03
- 🚀 Initial NPM release with CLI functionality
- 🎨 6 professional art styles implementation
- 📁 Export functionality for generated prompts

## 🤝 How to Contribute

We welcome contributions from the community! Here's how you can help:

### **Getting Started**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request with detailed description

### **Development Guidelines**
- Follow existing code style and use Prettier for formatting
- Add tests for new functionality
- Update documentation for any API changes
- Ensure all CI checks pass before submitting PR

### **Types of Contributions**
- 🐛 Bug fixes and issue reports
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🎨 New art style templates
- 🌍 Translations and localization
- 🧪 Test coverage improvements

## 📞 Support & Community

### **Get Help**
- 📋 **Issues**: [GitHub Issues](https://github.com/Gzeu/perchance-ai-prompt-library/issues) for bug reports and feature requests
- 📧 **Email**: pricopgeorge@gmail.com for direct support
- 💬 **Discord**: Join our community (link in repository)

### **Stay Updated**
- ⭐ Star the repository for updates
- 👀 Watch releases for new versions
- 🐦 Follow development updates

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**[⬆ Back to Top](#-perchance-ai-prompt-library)**

Made with ❤️ by the open source community

</div>