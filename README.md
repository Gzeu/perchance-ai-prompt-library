# ⚡ Perchance AI Prompt Library v7.0

> **Advanced AI-powered Perchance.org generator** with an Ultra Agentic Multi-Agent Brainstorm System, REST API, CLI, Discord Bot, and web studio.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)
[![Version](https://img.shields.io/badge/version-7.0.0-blue)](CHANGELOG.md)
[![Live Demo](https://img.shields.io/badge/demo-Vercel-black)](https://perchance-ai-prompt-library.vercel.app)

---

## Features

| Surface | What it does |
|---|---|
| **CLI** (`pai`) | Interactive terminal — generate, batch, style-mix, agentic mode |
| **REST API** | Express 5 + Swagger docs at `/api-docs`, rate-limited, helmet-secured |
| **Web Studio** | Vite/React UI at `http://localhost:5173`, Agentic view at `/agentic` |
| **Discord Bot** | Slash commands: `/generate`, `/batch`, `/agentic` via discord.js v14 |
| **Agentic System** | 7+ specialized agents with skill scoring, debate & weighted voting |
| **Templates** | 150+ categorized Perchance generators ready to use or extend |

---

## Quick Start

### Prerequisites

- Node.js ≥ 20, npm ≥ 10
- A free [Groq API key](https://console.groq.com) for AI generation

### Install & Run

```bash
git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
cd perchance-ai-prompt-library
npm install
cd web && npm install && cd ..
cp .env.example .env        # add your GROQ_API_KEY
npm run dev                 # API :3000 + Web Studio :5173
```

### CLI

```bash
# Install globally (optional)
npm install -g .

# Generate a single prompt
pai generate "cyberpunk city" --style photorealistic

# Ultra Agentic mode — multi-agent brainstorm
pai agentic "fantasy tavern name generator" --category names

# Batch generation
pai batch "space explorer" --count 10 --export json
```

### REST API

```bash
# Health check
curl http://localhost:3000/api/health

# Generate a prompt
curl -X POST http://localhost:3000/api/prompts/generate \
  -H "Content-Type: application/json" \
  -d '{"style": "anime", "subject": "dragon"}'

# Agentic generation
curl -X POST http://localhost:3000/api/perchance/agentic \
  -H "Content-Type: application/json" \
  -d '{"topic": "dungeon loot table", "category": "items"}'

# Full API reference
open http://localhost:3000/api-docs
```

### Discord Bot

```bash
cd discord-bot
cp .env.example .env    # add DISCORD_TOKEN + DISCORD_CLIENT_ID
npm install
npm run dev
```

### Docker

```bash
# Development
npm run docker:dev

# Production (optimized image)
docker build -f Dockerfile.optimized -t perchance-ai:prod .
docker run -p 3000:3000 --env-file .env perchance-ai:prod
```

---

## Deployment

| Component | Host | Notes |
|---|---|---|
| **Web UI** | [Vercel](https://perchance-ai-prompt-library.vercel.app) | Static Vite build, auto-deploy on push |
| **API** | Self-hosted / Railway / Render | Set `VITE_API_URL` on web build to your API URL |
| **Discord Bot** | Any VPS | Keep process alive with `pm2` or systemd |

---

## Architecture

```
src/
├── agents/        Ultra Agentic multi-agent system
├── api/
│   ├── middleware/ helmet · cors · morgan · rateLimit · auth · errorHandler
│   ├── routes/    health · prompts · styles · images · perchance · perchance-pack
│   └── server.js  Express 5 entry point
├── cli/           commander CLI (pai / perchance-prompts)
├── generators/    Core prompt generation engine
├── services/      Groq AI + Pollinations integration
├── types/         TypeScript types
└── validators/    Zod schemas

discord-bot/       Isolated Discord.js v14 bot
web/               Vite + React studio UI
templates/         150+ Perchance generator templates
```

See [`AGENTIC-SYSTEM.md`](AGENTIC-SYSTEM.md) for the full multi-agent architecture and design rationale.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key for AI generation |
| `PORT` | No | API port (default: `3000`) |
| `CORS_ORIGIN` | No | Restrict CORS to a specific origin |
| `NODE_ENV` | No | `production` disables HTTP logs verbosity |

Copy `.env.example` to `.env` and fill in values.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | API + Web Studio in parallel |
| `npm run build` | Compile TypeScript |
| `npm run build:agents` | Compile agents module (required for production) |
| `npm test` | Jest test suite with coverage |
| `npm run lint` | ESLint |
| `npm run docker:dev` | Docker Compose development profile |
| `npm run docker:prod` | Docker Compose production profile |

---

MIT License © [Gzeu](https://github.com/Gzeu)
