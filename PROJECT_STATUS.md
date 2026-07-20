# Project Status — Perchance AI Toolkit v8.0.0

> Last updated: 2026-07-20

## ✅ Stable — v8.0.0

The project has been fully rewritten as a focused **Perchance.ai toolkit** with MCP server, agent layer, Playwright automation, and OpenClaw skill support.

---

## Architecture

```
src/
├── core/          Syntax builder, validator, exporter, weighted-list
├── mcp/           MCP server + 6 tools (generate, templates, validate, preview, run)
├── playwright/    Browser automation (loader, roller, scraper, exporter)
├── agent/         OpenClaw skill + Claude system prompt + 3 workflows
├── cli/           perchance-gen CLI (create|preview|validate|run|scrape)
├── services/      Groq AI integration
└── types/         TypeScript types

skills/            OpenClaw skill manifest + README
mcp-config/        Claude Desktop + OpenClaw MCP configs
templates/         150+ .perchance generator templates
```

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| MCP Server | ✅ Stable | `npx perchance-mcp` |
| CLI | ✅ Stable | `perchance-gen create\|preview\|validate\|run\|scrape` |
| AI Generation (Groq) | ✅ Stable | LLaMA 3.3 70B |
| Syntax Validator | ✅ Stable | Errors + warnings + stats |
| Local Preview | ✅ Stable | No browser required |
| Playwright Automation | ✅ Stable | Requires `playwright install chromium` |
| OpenClaw Skill | ✅ Stable | `skills/perchance-skill/` |
| Claude Desktop MCP | ✅ Stable | `mcp-config/claude_desktop_config.json` |
| 150+ Templates | ✅ Available | `templates/` directory |

## What was removed in v8.0.0

| Feature | Reason |
|---------|--------|
| Discord Bot | Out of scope for focused toolkit |
| Express REST API | Replaced by MCP server |
| Vite/React Web Studio | Out of scope |
| Docker configs | Not needed for CLI/MCP tool |
| Multi-agent brainstorm | Replaced by focused agent workflows |

---

## Roadmap

- [ ] `npm publish` — make available as `npx perchance-mcp`
- [ ] GitHub Release v8.0.0 with binary assets
- [ ] Add more templates (images, TTRPG, worldbuilding)
- [ ] Perchance.ai API integration when/if available
- [ ] Test suite for core validator + exporter
