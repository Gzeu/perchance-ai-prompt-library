# 🎲 Perchance AI Toolkit

> **The ultimate tool for building [Perchance.ai](https://perchance.ai) generators** — AI-powered syntax generation, 150+ templates, local preview, live browser execution, MCP server for Claude/OpenClaw agents, and Playwright automation.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)
[![Version](https://img.shields.io/badge/version-8.0.0-blue)](CHANGELOG.md)
[![MCP](https://img.shields.io/badge/MCP-compatible-purple)](mcp-config/)

---

## What is this?

A focused toolkit for [Perchance.ai](https://perchance.ai) — the creative random generator platform.

- **Generate** `.perchance` syntax with AI (Groq LLaMA 3.3)
- **150+ templates** for characters, scenes, items, dialogue, image prompts
- **Validate** syntax before running
- **Preview** results locally without a browser
- **Run live** on perchance.ai via Playwright automation
- **Scrape** existing public generators
- **MCP server** — call all features from Claude Desktop, OpenClaw, or any MCP agent

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
├── generators/     AI-assisted generator engine (Groq)
├── mcp/            MCP server + 5 tools
├── playwright/     Browser automation (loader, roller, scraper)
├── agent/          OpenClaw skill + Claude system prompt + workflows
├── cli/            CLI entry point
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
| `PLAYWRIGHT_HEADLESS` | No | Set to `false` to see the browser |

---

MIT License © [Gzeu](https://github.com/Gzeu)
