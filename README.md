# ⚡ Perchance AI Prompt Library

<div align="center">

[![Version](https://img.shields.io/badge/version-5.0.0-blue.svg)](https://github.com/Gzeu/perchance-ai-prompt-library/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![CI](https://github.com/Gzeu/perchance-ai-prompt-library/actions/workflows/ci.yml/badge.svg)](https://github.com/Gzeu/perchance-ai-prompt-library/actions)
[![GitHub Stars](https://img.shields.io/github/stars/Gzeu/perchance-ai-prompt-library?style=social)](https://github.com/Gzeu/perchance-ai-prompt-library/stargazers)

**Generate complete Perchance.org generators with AI — from a single description.**

*The only tool that understands Perchance syntax and generates valid, publish-ready generator code using Groq AI (free, fast, no limits for most use cases). Includes a built-in template library, web studio editor, and REST API.*

[✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [⚡ Perchance Studio](#-perchance-studio) • [🌐 REST API](#-rest-api) • [📚 Template Library](#-template-library) • [🔧 Development](#-development)

</div>

---

## 🎯 What This Project Does

Perchance.org is a platform for building random text generators using a simple but powerful DSL (domain-specific language). You write lists, reference them with `[listName]`, and Perchance combines them into infinitely varied outputs.

**The problem:** writing a good Perchance generator by hand takes time — you need to understand the syntax, structure the lists, balance variety, and handle edge cases.

**This project solves that:** describe what you want in plain English, and the AI generates a complete, valid Perchance generator you can paste directly on [perchance.org](https://perchance.org) and publish.

```
You type:  "A fantasy tavern name generator with adjectives and nouns, dark gothic theme"

AI outputs:
  output
    The [adjective] [noun]

  adjective
    Crimson
    Hollow
    Ashen
    Shrouded
    ...

  noun
    Raven
    Gallows
    Crypt
    ...
```

---

## 🌟 What's New in v5.0.0

- 🤖 **Groq AI Integration** — generate Perchance code via Llama 3.3 70B (free, 14,400 req/day)
- ⚡ **Perchance Studio** — full web editor: generate, refine, validate, and open directly on perchance.org
- 📚 **Template Library** — 10 ready-to-use generators across 7 categories (Characters, Locations, Items, Stories, Sci-Fi, Writing, Master)
- 🏗️ **Master Generators** — combine multiple generators with `[^import]` syntax for full session prep
- ✅ **Syntax Validator** — real-time validation with errors and warnings
- 💡 **Ideas Generator** — AI-powered brainstorming per category (6 ideas in ~1 second)
- 🔄 **Refine Mode** — iteratively improve existing generators with natural language instructions
- 🔒 **CI/CD hardened** — Dependabot grouping, auto-merge patches, CODEOWNERS

---

## 🎯 Features

### ⚡ Perchance Generator AI

- **Natural language → Perchance code** in seconds
- **3 complexity levels:** Simple (3-5 lists) · Medium (5-8 lists) · Master (8-12 lists + imports)
- **Theme/style control:** dark gothic, cyberpunk, cozy fantasy, etc.
- **Instant refinement:** "add more items", "make it darker", "add a curse mechanic"
- **One-click publish:** "Open on Perchance" button sends code directly to the editor

### 📚 Template Library

10 production-ready Perchance generators included, no AI needed:

| Template | Category | Complexity |
|----------|----------|------------|
| RPG Character Generator | Characters | Medium |
| Fantasy Location Generator | Locations | Medium |
| Magic Item Generator | Items | Medium |
| Story Hook Generator | Stories | Medium |
| NPC Dialogue Generator | Dialogue | Simple |
| Sci-Fi Planet Generator | Sci-Fi | Medium |
| Dungeon Room Generator | Locations | Medium |
| Creative Writing Prompt | Writing | Simple |
| Random Encounter Generator | Encounters | Medium |
| Master RPG World Builder | Master | Master |

### 🤖 Groq AI (Free)

- Model: `llama-3.3-70b-versatile` for generation/refinement
- Model: `llama-3.1-8b-instant` for fast ideas generation
- **Free tier:** 14,400 requests/day, 30 req/min
- No credit card needed — get key at [console.groq.com](https://console.groq.com)

### 🌐 REST API

Full Express.js API with Swagger UI, auth middleware, and rate limiting — plus 7 new Perchance-specific endpoints.

### 🖼️ AI Image Generation (Pollinations.ai)

Existing image generation features remain — no API key required.

---

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
cd perchance-ai-prompt-library
npm install
```

### Environment Setup

```env
# .env
PORT=3000
NODE_ENV=development

# Groq AI (required for AI generation)
# Get free key at https://console.groq.com
GROQ_API_KEY=gsk_your_key_here

# API authentication (comma-separated keys)
API_KEYS=your-key-here

# Skip auth in development
SKIP_AUTH=true

# Pollinations defaults (image generation)
POLLINATIONS_MODEL=flux
POLLINATIONS_TEXT_MODEL=mistral

LOG_LEVEL=info
```

### Start the API Server

```bash
npm run api:dev      # development (nodemon)
npm run api:start    # production

# Swagger UI → http://localhost:3000/api-docs
# Perchance API → http://localhost:3000/api/perchance
```

### Start the Web UI

```bash
cd web
npm install
npm run dev

# → http://localhost:5173
```

### Docker

```bash
npm run docker:build
npm run docker:run

# Or with Compose
npm run docker:prod
```

---

## ⚡ Perchance Studio

The web UI includes a full Perchance generator studio at `/perchance-studio`:

**Generate tab:**
1. Pick a category (Characters, Locations, Items, Stories, Sci-Fi, Writing, Encounters, Master, ...)
2. Describe what you want in plain English
3. Choose complexity: Simple · Medium · Master
4. Optionally add a theme/style
5. Click **Generate with AI** → Groq generates the Perchance code in ~2-3 seconds

**Editor features:**
- Full code editor with monospace font
- **Validate** — check syntax, list references, missing `output` list
- **Copy** — copy code to clipboard
- **Open on Perchance** — opens [perchance.org/edit](https://perchance.org/edit) with your code pre-loaded
- **Refine with AI** — "add 10 more names", "make the backstories darker", etc.

**Ideas tab:**
- Select a category and get 6 AI-generated generator ideas in ~1 second
- Click any idea to use it as your description

### Perchance Syntax Cheatsheet

| Syntax | What it does |
|--------|-------------|
| `[listName]` | Reference another list |
| `{a\|b\|c}` | Inline random choice |
| `{1-10}` | Random number in range |
| `[^gen-name.list]` | Import list from another generator |
| `item  5` | Weight (5x more likely than default) |
| `\n` | New line in output |
| `// comment` | Add a comment |
| `<b>text</b>` | HTML formatting in output |

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

### Perchance Endpoints (New in v5.0)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/perchance/templates` | Get all template library entries |
| `GET` | `/api/perchance/templates/:id` | Get a specific template by ID |
| `GET` | `/api/perchance/categories` | Get categories with template counts |
| `POST` | `/api/perchance/generate` | Generate Perchance code via Groq AI |
| `POST` | `/api/perchance/refine` | Refine existing code via AI |
| `POST` | `/api/perchance/ideas` | Get AI-generated ideas for a category |
| `POST` | `/api/perchance/validate` | Validate Perchance syntax |

#### POST `/api/perchance/generate`

```json
{
  "category": "Characters",
  "description": "A pirate crew member generator with personality and backstory",
  "complexity": "medium",
  "theme": "dark nautical"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "code": "output\n  [name] ...",
    "model": "llama-3.3-70b-versatile",
    "generationTime": 2341,
    "validation": {
      "valid": true,
      "errors": [],
      "warnings": []
    }
  }
}
```

#### POST `/api/perchance/refine`

```json
{
  "code": "output\n  [name]\n\nname\n  Aria\n  Brom",
  "request": "Add 15 more fantasy names and include surnames"
}
```

#### POST `/api/perchance/ideas`

```json
{
  "category": "Sci-Fi",
  "count": 6
}
```

#### POST `/api/perchance/validate`

```json
{
  "code": "output\n  [hero] fights [villain]\n\nhero\n  Aria\n  Brom"
}
```

### Prompt Endpoints (Existing)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/prompts` | List prompts (`?category=`, `?style=`, `?q=`) |
| `POST` | `/api/prompts/generate` | Generate a random image prompt |
| `POST` | `/api/prompts/batch` | Batch generate prompts |
| `POST` | `/api/prompts/mix` | Mix multiple styles |

### Image Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/images/generate` | Generate image URL (Pollinations.ai) |
| `POST` | `/api/images/batch` | Batch generate image URLs (max 50) |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check + feature list |

### Error Format

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

HTTP codes: `400` bad request · `401` unauthorized · `404` not found · `429` rate limited · `500` internal error · `503` AI unavailable (GROQ_API_KEY not set)

---

## 📚 Template Library

Templates are available via API and in the web UI. Each template includes:
- Complete, valid Perchance code ready to copy and paste
- Category, complexity level, and tags
- Preview in the UI before using

Browse at `/template-library` in the web UI or `GET /api/perchance/templates`.

**Categories:** Characters · Locations · Items · Stories · Dialogue · Encounters · Sci-Fi · Writing · Master

---

## 🏗️ Project Structure

```
perchance-ai-prompt-library/
├── src/
│   ├── index.js / index.ts           # Library entry points
│   ├── api/
│   │   ├── server.js                 # Express app + route registration
│   │   ├── config/swagger.js         # Swagger/OpenAPI config
│   │   ├── middleware/               # Auth, rate limit, validation
│   │   └── routes/
│   │       ├── health.js             # Health check
│   │       ├── prompts.js/.ts        # Prompts CRUD + generate
│   │       ├── images.js/.ts         # Image generation
│   │       ├── styles.js             # Styles browse
│   │       └── perchance.js          # ⚡ Perchance AI endpoints (NEW)
│   ├── data/
│   │   ├── styles.json               # 50+ art styles
│   │   ├── artists.json              # 75+ famous artists
│   │   ├── themes.json               # 200+ themes
│   │   └── perchance-templates/
│   │       └── index.js              # 📚 10 template library entries (NEW)
│   ├── services/
│   │   ├── groqService.ts            # 🤖 Groq AI client + validator (NEW)
│   │   ├── promptValidator.ts        # Prompt validation
│   │   ├── cacheService.ts           # TTL cache
│   │   ├── exportService.ts          # JSON/CSV/TXT/MD export
│   │   ├── analyticsService.ts       # Usage tracking
│   │   └── pollinationsService.ts    # Pollinations.ai image service
│   ├── generators/                   # Prompt generator classes
│   ├── utils/                        # Logger, formatters, helpers
│   └── validators/                   # Prompt validators
├── web/                              # React web interface
│   └── src/
│       ├── pages/
│       │   ├── PerchanceStudio.jsx   # ⚡ AI generator studio (NEW)
│       │   ├── TemplateLibrary.jsx   # 📚 Template browser (NEW)
│       │   ├── Dashboard.jsx
│       │   ├── PromptGenerator.jsx
│       │   ├── BatchGallery.jsx
│       │   ├── StyleMixer.jsx
│       │   ├── HistoryPage.jsx
│       │   ├── FavoritesPage.jsx
│       │   └── AnalyticsPage.jsx
│       └── utils/api.js              # Axios client
├── discord-bot/                      # Discord bot integration
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Lint, type-check, test, build
│   │   └── dependabot-auto.yml       # Auto-merge patch/minor deps
│   ├── CODEOWNERS                    # Auto-review assignment
│   └── dependabot.yml                # Monthly grouped updates
├── Dockerfile
├── docker-compose.yml
├── jest.config.ts
├── tsconfig.json
└── README.md
```

---

## 🔧 Development

### Setup

```bash
git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
cd perchance-ai-prompt-library
npm install
cp .env.example .env   # then add GROQ_API_KEY
```

### Available Scripts

```bash
# API server
npm run api:dev       # nodemon (development)
npm run api:start     # production

# TypeScript
npm run build         # tsc compile
npm run build:watch   # watch mode
npm run type-check    # tsc --noEmit

# Tests
npm test              # Jest (all tests)
npm run test:coverage # with Codecov report

# Code quality
npm run lint          # ESLint
npm run lint:fix      # ESLint auto-fix

# Docker
npm run docker:build
npm run docker:run
npm run docker:prod   # Docker Compose

# Utilities
npm run clean         # remove build artifacts
npm run audit         # security audit
```

### CI/CD

GitHub Actions on every push and PR:

1. **Lint** — ESLint check
2. **Type Check** — `tsc --noEmit`
3. **Test** — Jest on Node.js 20 & 22
4. **Build** — `npm run build`
5. **Dependabot** — monthly grouped updates, auto-merge patches, auto-close majors

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| ⚡ Perchance generation (Groq) | ~2-3 seconds |
| 💡 Ideas generation | ~1 second |
| 📚 Template fetch | <50ms (static) |
| 🔄 Prompt batch capacity | Up to 1000 prompts |
| 🖼️ Image batch | Up to 50 URLs/request |
| 🤖 Groq free tier | 14,400 req/day · 30 req/min |
| 🌐 Node.js compatibility | 20+ on all platforms |

---

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create a feature branch: `git checkout -b feature/amazing-feature`
3. ✅ Make changes with tests
4. 📝 Commit: `git commit -m 'feat: add amazing feature'`
5. 🚀 Push and open a Pull Request

**Guidelines:** clean code, tests for new features, update docs, TypeScript for new service files.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- 🤖 **Groq** — ultra-fast free AI inference for Perchance generation
- 🎨 **Pollinations.ai** — free AI image generation
- 🌐 **Perchance.org** — the platform this project generates for
- 👥 **Contributors** — everyone who helped improve this project

---

<div align="center">

| Resource | Link |
|----------|------|
| 🐛 **Issues** | [GitHub Issues](https://github.com/Gzeu/perchance-ai-prompt-library/issues) |
| 💬 **Discussions** | [GitHub Discussions](https://github.com/Gzeu/perchance-ai-prompt-library/discussions) |
| 📦 **NPM** | [npm registry](https://www.npmjs.com/package/perchance-ai-prompt-library) |
| 🤖 **Groq Console** | [console.groq.com](https://console.groq.com) |
| 🌐 **Perchance.org** | [perchance.org](https://perchance.org) |
| 👨‍💻 **Author** | [George Pricop (@Gzeu)](https://github.com/Gzeu) |

---

**Made with ❤️ by [George Pricop](https://github.com/Gzeu)**

*Describe it. Generate it. Publish it on Perchance.*

[![GitHub followers](https://img.shields.io/github/followers/Gzeu?style=social)](https://github.com/Gzeu)

</div>
