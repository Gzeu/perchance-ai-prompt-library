# Project Status

**Project:** Perchance AI Prompt Library
**Version:** 8.0.0
**Last Updated:** August 4, 2026
**Status:** Active development — CLI + MCP Toolkit

---

## v8.0.0 Highlights

- **Complete rewrite** — Transformed from full-stack platform to focused CLI + MCP toolkit
- **MCP Server** — 11 tools for Claude Desktop, OpenClaw, and any MCP-compatible agent
- **CLI** — `perchance-gen` command with create, preview, validate, run, scrape commands
- **Agent Layer** — Universal interface, decision engine, autonomous workflows
- **Playwright Automation** — Live execution on perchance.org, scraping capabilities
- **150+ Templates** — Ready-to-use generators for various categories
- **OpenClaw Skill** — Native skill integration for autonomous agents

---

## Requirements

- Node.js >= 20
- Playwright (optional, for `run` and `scrape` fallback commands)
- No external API keys required — all generation is 100% local

---

## Architecture

```
src/
├── core/           Syntax builder, validator, exporter, weighted lists
├── mcp/            MCP server + 11 tools
├── playwright/     Browser automation (loader, roller, scraper)
├── agent/          Universal interface, decision engine, autonomous workflows
├── cli/            CLI entry point
└── types/          TypeScript types for Perchance syntax

templates/          150+ ready-to-use .perchance generators
skills/             OpenClaw skill manifest
mcp-config/         MCP server configs (Claude Desktop, OpenClaw)
```

---

## Key Features

### CLI Commands
- `perchance-gen create` — AI-powered generator creation
- `perchance-gen preview` — Local preview without browser
- `perchance-gen validate` — Syntax validation
- `perchance-gen run` — Live execution on perchance.org
- `perchance-gen scrape` — Clone public generators

### MCP Tools
- `generate_perchance` — AI generation from topic
- `list_templates` / `get_template` — Template browsing
- `validate_syntax` — Syntax checking
- `preview_rolls` — Local preview
- `run_on_perchance` — Live execution
- `autonomous_generate` — Fully autonomous creation
- `batch_generate` — Parallel batch generation
- `improve_generator` — AI-powered improvement
- `autonomous_test` — Automated testing
- `multi_format_generate` — Optimal format selection

### Agent Workflows
- Decision engine for intelligent tool selection
- Self-improvement system for iterative refinement
- Batch coordinator for parallel processing
- Autonomous testing suite
- Multi-format generator (Perchance/HTML)

---

## Deployment

- **NPM**: Global CLI installation
- **MCP**: Direct integration with AI agents
- **No web interface**: Focused on CLI + MCP integration

---

## Links

| Resource | URL |
|----------|-----|
| Repository | https://github.com/Gzeu/perchance-ai-prompt-library |
| NPM | https://www.npmjs.com/package/perchance-ai-prompt-library |
| Perchance.org | https://perchance.org |

---

## Migration from v7.0.0

See [`MIGRATION.md`](MIGRATION.md) for detailed migration guide.

---

*Maintained by [George Pricop (@Gzeu)](https://github.com/Gzeu)*
