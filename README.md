# ⚡ Perchance AI Prompt Library v7.0

**Advanced AI-powered Perchance.org generator** with **Ultra Agentic Brainstorm System**.

## Key Features

- Ultra Agentic Multi-Agent System (7+ specialized agents)
- Dynamic Skill Scoring System
- Collaborative Debate & Weighted Voting
- Persistent Memory & Context Evolution
- 150+ Categorized Templates
- CLI, Web Studio, API, Discord Bot

## Ultra Agentic Mode

Agents with skills like NarrativeDepth, SyntacticPerfection, Originality, Consistency etc. collaborate to create the best Perchance generators.

## Quick Start

```bash
git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
cd perchance-ai-prompt-library
npm install && cd web && npm install && cd ..
cp .env.example .env   # add GROQ_API_KEY
npm run dev            # API :3000 + Web :5173
```

**Ultra Agentic (CLI):**

```bash
npm start
pai agentic "fantasy tavern name generator" --category names
```

**Web:** open `http://localhost:5173/agentic`

See `AGENTIC-SYSTEM.md` for architecture, API curl examples, and deployment notes.

Compile agents for production: `npm run build:agents` (outputs to `dist/agents/`).

### Deployment

| Component | Host | Notes |
|-----------|------|--------|
| Web UI | [Vercel](https://perchance-ai-prompt-library.vercel.app) | Static Vite build |
| API | Self-hosted | Set `VITE_API_URL` on web build to your API URL |

MIT License © Gzeu