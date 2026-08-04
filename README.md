# ⚡ Perchance AI Toolkit v8.0.0

> **The ultimate toolkit for building [Perchance.ai](https://perchance.ai) generators** — AI-powered syntax generation, 150+ templates, local preview, live browser execution, MCP server for Claude/OpenClaw agents, and Playwright automation.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)
[![Version](https://img.shields.io/badge/version-8.0.0-blue)](CHANGELOG.md)
[![MCP](https://img.shields.io/badge/MCP-compatible-purple)](mcp-config/)
[![npm](https://img.shields.io/badge/npm-perchance--ai--prompt--library-red)](https://www.npmjs.com/package/perchance-ai-prompt-library)

---

## What is this?

A focused toolkit for [Perchance.ai](https://perchance.ai) — the creative random generator platform.

- **Generate** `.perchance` syntax with AI (Groq LLaMA 3.3)
- **150+ templates** for characters, scenes, items, dialogue, image prompts
- **Validate** syntax before running
- **Preview** results locally without a browser
- **Run live** on perchance.ai via Playwright automation
- **Scrape** existing public generators
- **MCP server** — call all features from Claude Desktop, OpenClaw, or any MCP-compatible agent

> ⚠️ **v8.0.0 Breaking Changes:** Discord Bot, REST API, and Web Studio have been removed. Use the new `perchance-gen` CLI and `perchance-mcp` server instead.

---

## Quick Start

```bash
npm install -g perchance-ai-prompt-library
export GROQ_API_KEY=your-key

# Create a generator
perchance-gen create "fantasy tavern name" --style weighted

# Preview rolls from a file
perchance-gen preview ./output/fantasy-tavern-name.perchance

# Validate syntax
perchance-gen validate ./my-generator.perchance

# Run live on perchance.ai (requires Playwright)
perchance-gen run ./my-generator.perchance --rolls 20

# Scrape & clone a public generator
perchance-gen scrape https://perchance.ai/some-generator
```

---

## MCP Server (Claude Desktop / OpenClaw)

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "perchance": {
      "command": "npx",
      "args": ["perchance-mcp"],
      "env": { "GROQ_API_KEY": "your-key" }
    }
  }
}
```

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `generate_perchance` | AI-generate a generator from a topic |
| `list_templates` | Browse 150+ templates by category |
| `get_template` | Get full code of a template |
| `validate_syntax` | Check code for errors/warnings |
| `preview_rolls` | Local preview without browser |
| `run_on_perchance` | Live run on perchance.ai via Playwright |

---

## CLI Reference

```
perchance-gen create <topic>    Create generator with AI
  --category  names|characters|scenes|items|dialogue|images|loot|quests|custom
  --style     simple|weighted|nested|complex
  --count     Items per list (default: 15)
  --output    Output directory
  --clipboard Copy to clipboard
  --run       Run on perchance.ai after generating

perchance-gen preview <file>    Preview rolls locally
  --count     Number of rolls (default: 10)

perchance-gen validate <file>   Validate .perchance syntax

perchance-gen run <file>        Run on perchance.ai via Playwright
  --rolls     Number of rolls (default: 10)
  --screenshot Save screenshot

perchance-gen scrape <url>      Scrape & clone a public generator
  --output    Output directory
```

---

## Architecture

```
src/
├── core/           Syntax builder, validator, exporter, weighted lists
├── generators/     AI-assisted generator engine (Groq LLaMA 3.3)
├── mcp/            MCP server + 6 tools
├── playwright/     Browser automation (loader, roller, scraper)
├── agent/          OpenClaw skill + Claude system prompt + workflows
├── cli/            CLI entry point (perchance-gen)
├── middleware/     Centralized security middleware
├── services/       Groq AI + Pollinations.ai
└── types/          TypeScript types for Perchance syntax

templates/          150+ ready-to-use .perchance generators
skills/             OpenClaw skill manifest
mcp-config/         MCP server configs (Claude Desktop, OpenClaw)
```

---

## OpenClaw Skill

Install the skill in any OpenClaw agent:

```json
{
  "skills": ["perchance-generator"],
  "env": { "GROQ_API_KEY": "your-key" }
}
```

See [`skills/perchance-skill/README.md`](skills/perchance-skill/README.md) for full docs.

---

## Playwright Setup

Required only for `run` and `scrape` commands:

```bash
npm install playwright
npx playwright install chromium
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key for AI generation |
| `PLAYWRIGHT_HEADLESS` | No | Set to `false` to see the browser (default: `true`) |

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for full version history.

| Version | Highlights |
|---------|-----------|
| **v8.0.0** | MCP Toolkit, Playwright automation, OpenClaw skill, new CLI — removes Discord bot, REST API, Web Studio |
| v7.0.0 | Ultra Agentic multi-agent system, Groq pipeline, Pack Builder |
| v5.0.0 | Full TypeScript migration, middleware layer |
| v4.0.0 | Discord Bot TS, Jest tests |
| v1.0.0 | Initial release — 150+ templates, CLI |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Please open an issue before submitting large PRs.

---

MIT License © [Gzeu](https://github.com/Gzeu)
