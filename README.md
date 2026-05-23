# ⚡ Perchance AI Prompt Library v7.0

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](package.json)
[![Version](https://img.shields.io/badge/version-7.0.0-blue)](CHANGELOG.md)
[![Live Demo](https://img.shields.io/badge/demo-vercel-black)](https://perchance-ai-prompt-library.vercel.app)

**Advanced AI-powered Perchance.org generator** with an **Ultra Agentic Brainstorm System** — featuring 7+ specialized AI agents that collaborate, debate, and vote to produce the best possible Perchance generators.

---

## ✨ Feature Matrix

| Feature | Surface | Description |
|---------|---------|-------------|
| Ultra Agentic System | CLI / API / Web | 7+ agents with skill scoring, debate & weighted voting |
| 150+ Templates | All | Categorized prompt templates across art, names, fantasy, sci-fi & more |
| Prompt Generator | All | AI-powered Perchance-syntax output via Groq |
| Batch Processing | CLI / API | Generate multiple prompts in one run |
| Analytics | API / Web | Usage stats and export |
| REST API | API | Express 5 + Swagger docs at `/api-docs` |
| Discord Bot | Discord | `/generate` slash commands via discord.js v14 |
| Web Studio | Web | Vite + React UI at `http://localhost:5173` |
| Docker Support | Infra | Single-container and docker-compose profiles |
| Vercel Deploy | Infra | Static web build + self-hosted API |

---

## 🚀 Quick Start

### Prerequisites
```bash
node >= 20.0.0
npm >= 10.0.0
```

### 1. Clone & Install
```bash
git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
cd perchance-ai-prompt-library
npm install
cd web && npm install && cd ..
cp .env.example .env   # add your GROQ_API_KEY
```

### 2. API + Web (Development)
```bash
npm run dev
# API running at  → http://localhost:3000
# Web Studio at   → http://localhost:5173
# Swagger docs at → http://localhost:3000/api-docs
```

### 3. CLI
```bash
# Install globally
npm install -g .

# Generate a prompt
pai generate "fantasy tavern name generator" --category names

# Ultra Agentic mode (multi-agent brainstorm)
pai agentic "cyberpunk city generator" --category places

# Batch mode
pai batch --input prompts.txt --output results.json
```

### 4. Discord Bot
```bash
# Add to .env: DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID
npm run bot:dev
```

### 5. Docker
```bash
# Development
npm run docker:dev

# Production
npm run docker:prod

# Or manually
docker build -t perchance-ai:latest .
docker run -p 3000:3000 perchance-ai:latest
```

---

## 🧠 Ultra Agentic Mode

Agents with skills like `NarrativeDepth`, `SyntacticPerfection`, `Originality`, and `Consistency` collaborate to create the best Perchance generators:

1. **Brainstorm Agent** — generates initial ideas
2. **Critic Agent** — finds weaknesses and gaps
3. **Refiner Agent** — iterates on critique
4. **Syntax Agent** — enforces Perchance syntax rules
5. **Quality Agent** — scores output against rubric
6. **Debate Agent** — facilitates structured debate
7. **Voting Agent** — weighted vote on final output

```bash
# Web UI
open http://localhost:5173/agentic

# API
curl -X POST http://localhost:3000/api/perchance/agentic \
  -H "Content-Type: application/json" \
  -d '{"topic": "fantasy tavern names", "category": "names"}'
```

See [`AGENTIC-SYSTEM.md`](AGENTIC-SYSTEM.md) for full architecture documentation.

---

## 📦 Build for Production

```bash
# Build TypeScript (includes agents)
npm run build

# Type-check agents only
npm run type-check:agents

# Run tests
npm test
```

---

## 🌐 Deployment

| Component | Host | Notes |
|-----------|------|-------|
| Web UI | [Vercel](https://perchance-ai-prompt-library.vercel.app) | Vite static build, auto-deploy on push |
| API | Self-hosted / Railway / Render | Set `VITE_API_URL` on web build |
| Discord Bot | Self-hosted / Railway | Always-on Node process |
| Full stack | Docker | `docker-compose --profile production up -d` |

See [`deployment/`](deployment/) for platform-specific configs.

---

## 📚 Documentation

- [`AGENTIC-SYSTEM.md`](AGENTIC-SYSTEM.md) — Multi-agent architecture & API examples
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — How to contribute
- [`SECURITY.md`](SECURITY.md) — Security policy
- [`CHANGELOG.md`](CHANGELOG.md) — Release history
- [`docs/`](docs/) — Additional docs and improvement notes
- [`src/api/README.md`](src/api/README.md) — REST API reference

---

## 📄 License

MIT License © [Gzeu](https://github.com/Gzeu)
