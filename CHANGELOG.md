# Changelog

## [8.0.0] — 2026-07-20

### 💥 Complete rewrite — Perchance.ai Dedicated Toolkit

Transformed from a generic full-stack platform into a focused **Perchance.ai toolkit** with MCP server, agent layer, Playwright automation, and OpenClaw skill support.

#### Added
- `src/core/` — syntax builder, weighted-list roller, validator, exporter
- `src/mcp/` — MCP server (`npx perchance-mcp`) with 6 tools:
  - `generate_perchance` — AI generate via Groq LLaMA 3.3
  - `list_templates` / `get_template` — browse 150+ built-in templates
  - `validate_syntax` — syntax errors + warnings + stats
  - `preview_rolls` — local preview without browser
  - `run_on_perchance` — Playwright live run on perchance.ai
- `src/playwright/` — Chromium controller, loader, roller, scraper, exporter
- `src/agent/` — OpenClaw skill manifest, Claude system prompt, 3 workflows
- `src/cli/` — CLI: `perchance-gen create|preview|validate|run|scrape`
- `src/types/perchance.d.ts` — full TypeScript types
- `skills/perchance-skill/` — OpenClaw skill package
- `mcp-config/` — Claude Desktop + OpenClaw MCP configs
- `tsconfig.json`, `.gitignore`, `CHANGELOG.md`

#### Changed
- `package.json` — v8.0.0, dual bin (`perchance-gen` + `perchance-mcp`), ESM module
- `README.md` — complete rewrite focused on Perchance.ai toolkit

#### Removed
- Discord bot integration (moved to separate repo if needed)
- Express REST API + web studio
- Docker configs
- Multi-agent brainstorm system (replaced by focused agent workflows)

---

## [7.0.0] — 2026-05-01

- Ultra Agentic Multi-Agent Brainstorm System
- REST API with Swagger docs
- Discord Bot (slash commands)
- Web Studio (Vite + React)
- Docker support
