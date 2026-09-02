# 🎲 Perchance AI Toolkit

> **CLI, MCP, and Web UI toolkit for [Perchance.ai](https://perchance.org)** — generate `.perchance` syntax with 150+ local templates, scrape & clone public generators via lightweight jsdom, validate, preview locally, run live via Playwright, and integrate with Claude Desktop / OpenClaw via MCP.

All generation is **100% local** — no external AI providers (Groq, Pollinations, OpenAI, etc.). Text, images, and sounds are produced entirely through Perchance-native capabilities and local template libraries.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)
[![Version](https://img.shields.io/badge/version-8.0.0-blue)](CHANGELOG.md)
[![MCP](https://img.shields.io/badge/MCP-compatible-purple)](mcp-config/)

---

## What is this?

A focused toolkit for [Perchance.ai](https://perchance.org) — the creative random generator platform.

- **Generate** `.perchance` syntax from 150+ local templates (Romanian & English word bases)
- **150+ templates** for characters, scenes, items, dialogue, image prompts
- **Scrape** any public Perchance generator — full source code via lightweight jsdom
- **Validate** syntax before running
- **Preview** results locally without a browser
- **Run live** on perchance.org via Playwright automation
- **Web UI** — `http://localhost:3000` for scraping, previewing, and downloading
- **MCP server** — call all features from Claude Desktop, OpenClaw, or any MCP agent
- **Programmatic API** — import and use directly in TypeScript/JavaScript projects
- **Autonomous agent workflows** — self-improvement, batch generation, multi-format output

---

## Quick Start

```bash
npm install -g perchance-ai-prompt-library

# Launch web UI (scraping, preview, validation, download)
perchance-gen ui                      # opens http://localhost:3000

# Scrape a generator from perchance.org (jsdom, no browser needed)
perchance-gen scrape https://perchance.org/fdqirttayk

# Create a generator from local templates
perchance-gen create "fantasy tavern name" --style weighted

# Preview rolls from a file (local, no browser)
perchance-gen preview ./output/fantasy-tavern-name.perchance

# Validate syntax
perchance-gen validate ./my-generator.perchance

# Run live on perchance.org (requires Playwright)
perchance-gen run ./my-generator.perchance --rolls 20
```

### Programmatic API

```typescript
import { scrapeGenerator, scrapeGeneratorWithJsdom, fetchHtml, parseHtml } from 'perchance-ai-prompt-library';

// Full scrape: fetch, extract, validate, preview, save — all in one call
const result = await scrapeGenerator('https://perchance.org/fdqirttayk');
console.log(result.original);    // full .perchance source code
console.log(result.preview);     // sample rolls
console.log(result.savedTo);     // path to saved file

// Lightweight parsing (jsdom only, no Playwright)
const { document } = await scrapeGeneratorWithJsdom('fdqirttayk');
const { extractGeneratorFromDocument } = await import('perchance-ai-prompt-library');
const { code, description } = extractGeneratorFromDocument(document);
```

---

## How Scraping Works

The scraper uses the official Perchance API endpoint:

```
https://perchance.org/api/downloadGenerator?generatorName=<name>
```

This returns the full generator page HTML without hitting Cloudflare challenges
that a naive `fetch()` to the main page would encounter.

**Strategy (in order):**

1. **jsdom** (primary) — Parse HTML with jsdom, extract `modelText` from the
   `<script id="preloaded-generator-data" type="notjs">` JSON blob. No script
   execution, no browser required. Fast and lightweight.
2. **Playwright** (fallback) — If jsdom extraction fails (e.g., content is
   JS-rendered), fall back to a headless Chromium browser.

The extracted code is the full `.perchance` source including `$meta`, lists,
logic, output sections, imports, and any embedded JavaScript.

---

## MCP Server (Claude Desktop / OpenClaw)

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "perchance": {
      "command": "npx",
      "args": ["perchance-mcp"]
    }
  }
}
```

---

## CLI Reference

```
perchance-gen create <topic>    Create generator from local templates
  --category  names|characters|scenes|items|dialogue|images|loot|quests|custom
  --style     simple|weighted|nested|complex
  --count     Items per list (default: 15)
  --output    Output directory
  --clipboard Copy to clipboard
  --run       Run on perchance.org after generating

perchance-gen preview <file>    Preview rolls locally
  --count     Number of rolls (default: 10)

perchance-gen validate <file>   Validate .perchance syntax

perchance-gen run <file>        Run on perchance.org via Playwright
  --rolls     Number of rolls (default: 10)
  --screenshot Save screenshot

perchance-gen scrape <url>      Scrape & clone a public generator (jsdom first)
  --output    Output directory (default: ./output/cloned)

perchance-gen ui [options]        Launch web UI
  -p, --port    Port (default: 3000)
```

---

## Web UI

Launch with `perchance-gen ui` (default: `http://localhost:3000`).

Built with Node.js built-in `http` module (no Express or extra runtime deps).
Features:

- Scrape any public Perchance generator by URL or generator name
- View full extracted source code with syntax highlighting
- Validate syntax and see errors/warnings inline
- Preview 10 random rolls instantly
- Copy code to clipboard or download as `.perchance` file

---

## Architecture

```
src/
├── core/           Syntax builder, validator, exporter, weighted lists
├── utils/          HTML scraper (jsdom-first), DOM extractor, cache
├── playwright/     Browser automation (loader, roller, scraper with fallback)
├── mcp/            MCP server + 12 tools
├── agent/          Template library, decision engine, autonomous workflows
├── ui/             Web UI (built-in http server, no Express)
├── cli/            CLI entry point
└── types/          TypeScript types for Perchance syntax
```

| Layer | Technology |
|-------|-----------|
| Scraping (primary) | `jsdom` (no browser, extract from JSON) |
| Scraping (fallback) | `playwright` (headless Chromium) |
| Generation | Local `TemplateLibrary` (150+ templates, Romanian/English) |
| CLI | `commander` |
| MCP | `@modelcontextprotocol/sdk` |
| Web UI | Node.js built-in `http` |
| Testing | `jest` + `ts-jest` |

---

## MCP Tools Reference

| Tool | Description |
|------|-------------|
| `generate_perchance` | Generate a generator from a topic using local templates |
| `list_templates` | Browse 150+ templates by category |
| `get_template` | Get full code of a template |
| `validate_syntax` | Check code for errors/warnings |
| `preview_rolls` | Local preview without browser |
| `run_on_perchance` | Live run on perchance.org via Playwright |
| `autonomous_generate` | Fully autonomous generator creation |
| `batch_generate` | Generate multiple variations in parallel |
| `improve_generator` | Improve existing code using local templates |
| `autonomous_test` | Automated testing suite for generators |
| `multi_format_generate` | Generate in optimal format (Perchance/HTML) |
| `scrape_generator` | Scrape a public perchance.org generator — extract full source via jsdom, preview, validate, save |

---

## OpenClaw Skill

Install the skill in any OpenClaw agent:

```json
{
  "skills": ["perchance-generator"]
}
```

See [`skills/perchance-skill/README.md`](skills/perchance-skill/README.md) for full docs.

---

## Playwright Setup

Required only for the `run`, `scrape`, and `--run` commands (Playwright fallback):

```bash
npm install playwright
npx playwright install chromium
```

The `scrape` command works without Playwright using jsdom as the primary method.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PLAYWRIGHT_HEADLESS` | No | Set to `false` to see the browser during run/scrape fallback |

No API keys required — all generation is local.

---

## Development

See [`DEVELOPMENT.md`](DEVELOPMENT.md) for setup instructions and contributing guidelines.

---

MIT License © [Gzeu](https://github.com/Gzeu)
