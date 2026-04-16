# 🎨 Perchance AI Prompt Library

<div align="center">

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/Gzeu/perchance-ai-prompt-library/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![CI](https://github.com/Gzeu/perchance-ai-prompt-library/actions/workflows/ci.yml/badge.svg)](https://github.com/Gzeu/perchance-ai-prompt-library/actions)
[![GitHub Stars](https://img.shields.io/github/stars/Gzeu/perchance-ai-prompt-library?style=social)](https://github.com/Gzeu/perchance-ai-prompt-library/stargazers)

**🚀 The Ultimate AI Prompt Generation Toolkit**

*Professional-grade AI prompt library with REST API, advanced CLI, batch processing, TypeScript support, and AI image generation powered by Pollinations.ai — no API key required.*

[✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [🌐 REST API](#-rest-api) • [📖 CLI Docs](#-cli-documentation) • [🔧 Development](#-development) • [🤝 Contributing](#-contributing)

</div>

---

## 🌟 What's New in v3.0.0

- 🟦 **Full TypeScript Support** — dual JS/TS codebase, type-safe services and validators
- 🌐 **REST API** — Express.js API with Swagger UI, auth middleware, rate limiting
- 🖼️ **AI Image Generation** — direct Pollinations.ai integration, no API key needed
- ⚡ **Enhanced Performance** — optimized batch processing with parallel threads
- 🎯 **Advanced Quality Control** — 10-level quality system with mood variations
- 📊 **Comprehensive Analytics** — usage statistics, category tracking, daily activity
- 🔍 **Smart Search** — fuzzy search across styles, artists, subjects, and themes
- 💾 **Multi-Format Export** — JSON, CSV, TXT, Markdown export
- 🔒 **Validation & Security** — prompt validation, sanitization, rate limiting
- ✅ **CI/CD Pipeline** — GitHub Actions with tests on Node.js 20 & 22, Codecov coverage

---

## 🎯 Features

### 🚀 Core Capabilities
- **📚 Rich Database** — 50+ art styles, 100+ subjects, 75+ famous artists, 200+ themes
- **⚡ Lightning-Fast CLI** — professional command-line interface with full flag support
- **🔄 Batch Processing** — generate 1–1000+ prompts with configurable parallel threads
- **📊 Analytics Engine** — real-time usage stats, popular styles tracking, daily activity
- **💾 Smart Export** — JSON, CSV, TXT, Markdown for seamless integration
- **🎯 Quality Enhancement** — 10-level quality system with professional enhancement terms

### 🖼️ AI Image Generation (Pollinations.ai)
- **No API key required** — free image generation via Pollinations.ai
- Multiple models: `flux`, `turbo`, `stable-diffusion`, and more
- Advanced parameters: seed, width, height, enhance, nologo
- CLI, REST API, and TypeScript service interfaces
- Batch URL generation (up to 50 per request)

### 🟦 TypeScript Services
- `promptValidator.ts` — validate, sanitize, warn on forbidden terms
- `cacheService.ts` — TTL cache with hit-rate stats, `promptCache` & `apiCache` singletons
- `exportService.ts` — export to JSON/CSV/TXT/Markdown with auto `ensureDir`
- `analyticsService.ts` — track usage per category, style, tags, daily activity
- `pollinationsService.ts` — type-safe Pollinations image & text completion service
- `comfyui.ts` — ComfyUI workflow integration
- `promptGenerator.ts` — generate prompts per category with quality suffixes & negative prompts

### 🛠 Professional Tools
- **🔍 Intelligent Search** — fuzzy search with advanced filtering
- **⚙️ Config Management** — persistent settings with custom themes and preferences
- **📚 History Tracking** — complete command history with search and export
- **🎭 Mood System** — dramatic, epic, peaceful, vibrant, mysterious
- **💨 Caching** — in-memory cache with TTL and hit-rate statistics
- **🎨 Beautiful CLI** — ASCII art banners, colored tables, progress indicators

---

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g perchance-ai-prompt-library

# Or locally
npm install perchance-ai-prompt-library

# Verify
perchance-prompts --version
```

### Environment Setup

```env
# .env
PORT=3000
NODE_ENV=development

# API authentication (comma-separated keys)
API_KEYS=your-key-here

# Skip auth in development
SKIP_AUTH=true

# Pollinations defaults
POLLINATIONS_MODEL=flux
POLLINATIONS_TEXT_MODEL=mistral

LOG_LEVEL=info
```

### CLI Usage

```bash
# Generate a single prompt
perchance-prompts generate anime "cyberpunk warrior" -q 10

# Multiple variations with mood
perchance-prompts generate photorealistic "sunset landscape" -c 5 -m epic

# Batch process with export
perchance-prompts batch "digital art" "space exploration" -c 20 -p 3 --export csv

# Browse styles
perchance-prompts styles --detailed

# View analytics
perchance-prompts stats --export json

# Generate image
perchance-prompts generate-image -p "Epic dragon in cyberpunk city" --width 1024 --height 1024
```

### Start REST API

```bash
# Development
npm run api:dev

# Production
npm run api:start

# Swagger UI → http://localhost:3000/api-docs
```

### Docker

```bash
npm run docker:build
npm run docker:run

# Or with Compose
npm run docker:prod
```

---

## 🌐 REST API

Base URL: `http://localhost:3000`  
Swagger UI: `http://localhost:3000/api-docs`

### Authentication

All endpoints accept an API key via:
- `Authorization: Bearer <key>`
- `x-api-key: <key>` header
- `?api_key=<key>` query param

Set `SKIP_AUTH=true` or `NODE_ENV=development` to bypass auth locally.

### Rate Limiting

| Limit | Scope |
|-------|-------|
| 100 req/min | Default (all endpoints) |
| 20 req/min | Generation endpoints |

Headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Endpoints

#### Prompts

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/prompts` | List prompts (`?category=`, `?style=`, `?q=`, `?page=`, `?limit=`) |
| `POST` | `/api/prompts` | Create a new prompt |
| `GET` | `/api/prompts/:id` | Get prompt by ID |
| `PUT` | `/api/prompts/:id` | Update prompt |
| `DELETE` | `/api/prompts/:id` | Delete prompt |
| `POST` | `/api/prompts/generate` | Generate a random prompt |
| `POST` | `/api/prompts/enhance` | Enhance an existing prompt |
| `POST` | `/api/prompts/batch` | Batch generate prompts |

#### Images

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/images/generate` | Generate image URL (Pollinations.ai) |
| `POST` | `/api/images/url` | Build image URL without downloading |
| `POST` | `/api/images/batch` | Batch generate image URLs (max 50) |

#### Styles

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/styles` | List all available styles |
| `GET` | `/api/styles/:id` | Get style details |
| `GET` | `/api/styles/categories` | Get style categories |

#### Templates

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/templates` | List saved templates (paginated) |
| `POST` | `/api/templates` | Save a new template |
| `GET` | `/api/templates/:id` | Get template by ID |
| `PUT` | `/api/templates/:id` | Update template |
| `DELETE` | `/api/templates/:id` | Delete template |

#### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check + uptime |
| `GET` | `/api/health/ready` | Readiness probe |

### Error Format

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

HTTP codes: `400` bad request · `401` unauthorized · `404` not found · `429` rate limited · `500` internal error

---

## 📖 CLI Documentation

### Generate

```bash
perchance-prompts generate <style> "<subject>" [options]

Options:
  -c, --count <n>     Number of variations (default: 1)
  -q, --quality <n>   Quality level 1-10 (default: 8)
  -m, --mood <mood>   dramatic | epic | peaceful | vibrant | mysterious
  -v, --verbose       Show detailed metadata
  --save              Save to history
  --negative          Include negative prompt suggestions
```

### Batch

```bash
perchance-prompts batch <style> "<subject>" [options]

Options:
  -c, --count <n>       Number of prompts (default: 10)
  -p, --parallel <n>    Parallel threads 1-5 (default: 3)
  -q, --quality <n>     Quality level 1-10 (default: 8)
  --progress            Show detailed progress
  --export <format>     json | txt | csv
```

### Browse Encyclopedia

```bash
perchance-prompts styles    [-s search] [--detailed]
perchance-prompts subjects  [-c category] [-s search]
perchance-prompts artists   [-s search] [--period era]
perchance-prompts themes    [-s search] [--category cat]
```

### Analytics & Config

```bash
perchance-prompts stats   [--export json|csv]
perchance-prompts config  --show | --set key=value | --reset
perchance-prompts history [-n 20] | --clear | --export json
```

---

## 🏗️ Project Structure

```
perchance-ai-prompt-library/
├── bin/
│   └── cli.js                    # CLI entry point
├── src/
│   ├── index.js / index.ts       # Library main entry
│   ├── api/                      # REST API (Express.js)
│   │   ├── README.md             # API docs
│   │   ├── config/
│   │   │   └── swagger.js        # Swagger/OpenAPI config
│   │   ├── middleware/
│   │   │   ├── index.js          # Barrel export
│   │   │   ├── auth.js           # API key authentication
│   │   │   ├── rateLimit.js      # In-memory rate limiter
│   │   │   ├── rateLimit.ts      # TypeScript version
│   │   │   ├── auth.ts           # TypeScript version
│   │   │   ├── errorHandler.ts   # Global error handler
│   │   │   ├── validation.js     # Request validation
│   │   │   ├── apiKeyAuth.js     # API key middleware
│   │   │   └── rateLimiter.js    # Express rate limiter
│   │   └── routes/
│   │       ├── index.js          # registerRoutes() barrel
│   │       ├── health.js/.ts     # Health check
│   │       ├── prompts.js/.ts    # Prompts CRUD + generate
│   │       ├── images.js/.ts     # Image generation
│   │       ├── styles.js         # Styles browse
│   │       └── templates.js      # Templates CRUD
│   ├── cli/
│   │   ├── config.js             # CLI config commands
│   │   ├── generateImage.js      # Image generation CLI
│   │   └── utils/
│   │       └── imageUtils.js     # Image download/save utils
│   ├── config/
│   │   ├── index.ts              # Barrel export
│   │   ├── app.ts                # App configuration
│   │   └── pollinations.js       # Pollinations config
│   ├── data/                     # Encyclopedia JSON
│   │   ├── styles.json           # 50+ art styles
│   │   ├── subjects.json         # 100+ subjects
│   │   ├── artists.json          # 75+ famous artists
│   │   ├── themes.json           # 200+ themes
│   │   ├── negatives.json        # Negative prompt terms
│   │   └── recipes.json          # Prompt recipes
│   ├── generators/
│   │   ├── index.ts              # Barrel export
│   │   ├── promptGenerator.ts    # TS generator (category-based)
│   │   ├── PromptGenerator.js    # JS class generator
│   │   └── EnhancedPromptGenerator.js  # Extended generator
│   ├── services/
│   │   ├── index.ts              # Barrel export
│   │   ├── promptValidator.ts    # Validate & sanitize prompts
│   │   ├── cacheService.ts       # TTL cache with hit-rate stats
│   │   ├── exportService.ts      # JSON/CSV/TXT/MD export
│   │   ├── analyticsService.ts   # Usage tracking & metrics
│   │   ├── pollinationsService.ts # Pollinations.ai service (TS)
│   │   ├── PollinationsService.js # Pollinations service (JS)
│   │   ├── comfyui.ts            # ComfyUI integration
│   │   └── cache.ts              # Low-level cache
│   ├── utils/
│   │   ├── index.ts              # Barrel export
│   │   ├── logger.ts/.js         # Colored logger (chalk)
│   │   ├── idGenerator.ts        # UUID & short ID generation
│   │   ├── formatters.ts         # Format quality, tags, durations
│   │   ├── helpers.js            # Misc JS helpers
│   │   ├── cache.js              # Cache utilities
│   │   ├── errorHandler.js       # Error handling utils
│   │   ├── StyleManager.js       # Style data manager
│   │   └── TemplateManager.js    # Template manager
│   └── validators/
│       ├── index.ts              # Barrel export
│       └── promptValidator.ts    # Re-export from services
├── tests/                        # Test suites
├── scripts/                      # Build & deployment scripts
├── web/                          # React web interface
├── discord-bot/                  # Discord bot integration
├── docs/                         # Additional documentation
├── .github/
│   └── workflows/
│       └── ci.yml                # CI: lint, type-check, test, build
├── jest.config.ts                # Jest config (ts-jest, 70% coverage)
├── tsconfig.json                 # TypeScript config
├── Dockerfile                    # Docker config
├── docker-compose.yml            # Docker Compose
└── README.md
```

---

## 🔧 Development

### Setup

```bash
git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
cd perchance-ai-prompt-library

npm install
npm link   # for CLI dev

# TypeScript build
npm run build

# Run tests
npm test
npm run test:coverage
```

### Available Scripts

```bash
# API
npm run api:dev       # Start API server (nodemon)
npm run api:start     # Start API server (production)

# Build
npm run build         # tsc compile
npm run build:watch   # watch mode

# Test
npm test              # Jest (all tests)
npm run test:coverage # With coverage report
npm run test:cli      # CLI tests
npm run test:generate # Generator tests
npm run test:batch    # Batch tests

# Code quality
npm run lint          # ESLint
npm run lint:fix      # ESLint auto-fix
npm run type-check    # tsc --noEmit

# Utilities
npm run docs          # Generate API docs
npm run clean         # Remove build artifacts
npm run audit         # Security audit
npm run monitor       # Performance monitoring

# Docker
npm run docker:build  # Build image
npm run docker:run    # Run container
npm run docker:prod   # Docker Compose production
```

### CI/CD

GitHub Actions runs on every push and PR:

1. **Lint** — ESLint check
2. **Type Check** — `tsc --noEmit`
3. **Test** — Jest on Node.js 20 & 22 with coverage upload to Codecov
4. **Build** — `npm run build` with artifact upload

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| ⚡ Generation Speed | 1–5 prompts/second |
| 🔄 Batch Capacity | Up to 1000 prompts |
| 🧵 Parallel Threads | 1–5 configurable |
| 💾 Memory Usage | ~50MB full encyclopedia |
| 🖼️ Image Batch | Up to 50 URLs per request |
| 🌐 Compatibility | Node.js 20+ on all platforms |
| 📡 Network | Offline-first, optional cloud |

---

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create a feature branch: `git checkout -b feature/amazing-feature`
3. ✅ Make changes with tests
4. 📝 Commit: `git commit -m 'feat: add amazing feature'`
5. 🚀 Push: `git push origin feature/amazing-feature`
6. 🔄 Open a Pull Request

**Guidelines:** clean code, tests for new features, update docs, follow TypeScript conventions for new files.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- 🎨 **Pollinations.ai** — free AI image generation
- 🌟 **Contributors** — everyone who helped improve this project
- 💡 **AI Art Community** — feedback and feature suggestions

---

<div align="center">

| Resource | Link |
|----------|------|
| 📖 **Wiki** | [GitHub Wiki](https://github.com/Gzeu/perchance-ai-prompt-library/wiki) |
| 🐛 **Issues** | [GitHub Issues](https://github.com/Gzeu/perchance-ai-prompt-library/issues) |
| 💬 **Discussions** | [GitHub Discussions](https://github.com/Gzeu/perchance-ai-prompt-library/discussions) |
| 📦 **NPM** | [npm registry](https://www.npmjs.com/package/perchance-ai-prompt-library) |
| 👨‍💻 **Author** | [George Pricop (@Gzeu)](https://github.com/Gzeu) |

---

**Made with ❤️ by [George Pricop](https://github.com/Gzeu)**

*Transform your AI image generation workflow with professional-grade prompts and advanced automation tools.*

[![GitHub followers](https://img.shields.io/github/followers/Gzeu?style=social)](https://github.com/Gzeu)

</div>
