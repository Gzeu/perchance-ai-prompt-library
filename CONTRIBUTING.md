# Contributing to Perchance AI Toolkit

Thank you for your interest! This project is a focused Perchance.ai toolkit — contributions that improve generator quality, MCP tools, Playwright automation, or templates are very welcome.

---

## Getting Started

```bash
git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
cd perchance-ai-prompt-library
npm install
cp .env.example .env   # add your GROQ_API_KEY
npm run build
```

### For Playwright features
```bash
npm install playwright
npx playwright install chromium
```

---

## Project Structure

```
src/core/         → Syntax builder, validator, exporter, weighted-list
src/mcp/          → MCP server + tool handlers
src/playwright/   → Browser automation
src/agent/        → Agent workflows + Claude system prompt
src/cli/          → CLI entry point
src/types/        → TypeScript interfaces
skills/           → OpenClaw skill manifest
mcp-config/       → MCP configuration examples
templates/        → .perchance generator templates
```

---

## Ways to Contribute

### 1. Add a template
Add a `.perchance` file to the correct subfolder of `templates/`:
```
templates/
├── characters/
├── scenes/
├── items/
├── names/
├── dialogue/
├── images/
├── loot/
└── quests/
```
Template format:
```
// Template: <name>
// Category: <category>
// Description: <one line>

output
  [adjective] [noun]

adjective
  ...

noun
  ...
```

### 2. Improve the MCP tools
- Tools are in `src/mcp/tools/`
- Each tool exports a `schema` and `handler`
- Run `npm run mcp` to test locally

### 3. Fix Playwright selectors
- Selectors are in `src/playwright/loader.ts` and `roller.ts`
- Perchance.ai may update their UI — PRs to fix broken selectors are always welcome

### 4. Improve the validator
- `src/core/validator.ts` — add new syntax checks
- Keep error messages actionable (tell the user how to fix it)

---

## Pull Request Guidelines

- One feature / fix per PR
- Include a short description of what changed and why
- Make sure `npm run build` passes
- For new MCP tools: add the tool to `server.ts` switch and `skill.json`

---

## Code Style

- TypeScript strict mode
- ESM imports (`.js` extension in import paths)
- No `any` unless absolutely necessary — prefer typed interfaces from `src/types/`

---

MIT License — contributions are welcome under the same license.
