---
name: perchance-generator
description: Fully autonomous Perchance.ai generator system. Use whenever the user wants a random generator, interactive HTML generator/game, name/character/scene/item/loot/quest/dialogue generator, or to validate/preview/run/improve/test Perchance code. Features autonomous decision-making, self-improvement, batch processing, and multi-format support. Also a reference for Perchance syntax (both the classic list format and the HTML/index.html + main.pjs format).
---

# How to use Perchance

Perchance is a **free platform for random generators and interactive HTML toys**, hosted at
**`perchance.org`** (NOT `perchance.ai` — that domain is wrong).

There are two ways to build a generator:

1. **List format** (simple random text) — a `.perchance` grammar. Best for
   names, loot tables, scenes, quests. This toolkit can validate/preview it locally.
2. **HTML generator** (interactive apps / games / canvas) — split across **two panels**:
   `main.pjs` (params, `$meta`, plugin imports) and `index.html` (HTML + CSS + JS).
   This is what most real Perchance projects use (e.g. top-down games, simulators).

You can build either by writing the code directly into the editor at
**`https://perchance.org/minimal#edit`**, or by using Perchance's built-in **AI coding helper**.

---

## Format A — List syntax (`.perchance`)

A small declarative grammar. The toolkit's `validate_syntax` / `preview_rolls` handle this format.

```
output                      ← first list = what the user sees
  [adjective] [noun] of the [place]

adjective                   ← indented items = possible values
  dark^2                    ← ^N = weight (higher = more common)
  ancient
  forgotten^3

noun
  sword
  temple

place
  [adjective] mountains     ← [listName] = reference another list
  shadow realm
```

Rules:
- The **first list is named `output`** and is what users see.
- List **header = no indent**; list **items = 2-space indent**.
- `^N` after an item = **weight** (more rolls).
- `[listName]` inside an item = **reference** that list (nest as deep as you like).
- `//` = comment.
- Reuse another generator: `import https://perchance.org/other-generator`
- Built-ins: `capitalize()`, `a_an()`, `select()`, etc.

Good shape: start with `output`; use weighted items (`^2`,`^3`) for rarity; nest
references for variety; aim for 3–8 lists, 8–20 items each.

---

## Format B — HTML generator (`index.html` + `main.pjs`)  ← the real format

Perchance generators are authored in **two places**:

### `main.pjs` — params, `$meta`, plugin imports
```js
$meta
  title = Abis
  description = A serene top-down underwater exploration.
  tags = underwater, exploration, atmospheric

// Bare top-level assignments become root.* properties:
worldW = 72
tile = 32
worldSeed = 3311

// Plugins are imported here and used from index.html:
BUG = {import:bug-error-plugin}
PCP = {import:public-comment-plugin}
```
- `$meta` sets the browser-tab title, the listing description, and tags.
- **Bare assignments** (`worldW = 72`, no `let`/`const`) attach to `root`, so the
  `index.html` script can read them as `root.worldW`, `root.tile`, etc.
- Plugins imported with `{import:name}` become `root.PLUGIN` functions.

### `index.html` — HTML + `<style>` + `<script type="module">`
```html
<style> /* CSS for HUD, canvas, panels */ </style>

<div id="app"><canvas id="game"></canvas></div>
<button id="infoBtn">ⓘ</button>

[BUG({showIcon: true, position: "top-right"})]   <!-- plugin used via [Name(...)] -->

<script type="module">
const TILE = root.tile;          // reads main.pjs
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
// draw with the Canvas2D API; rAF loop; input handlers, etc.
document.getElementById('commentsCtn').innerHTML = root.PCP({ channel: 'abis' });
</script>
```
- `[Name(...)]` square blocks run an imported plugin in the HTML.
- `root.PLUGIN({...})` calls a plugin from JS.
- The `<script>` runs as a module; it can freely use `root.*` from `main.pjs`.
- **Always close the `<script>` tag** and keep `$meta` in `main.pjs`.

### Common plugin imports
`bug-error-plugin` (dev error badge), `public-comment-plugin` (community chat),
`dynamic-import-plugin`, `create-instance-plugin`, etc. — name them in `{import:...}`.

---

## Autonomous workflow (the agent)

1. Take the user's **topic**; decide format:
   - simple random output → **list format** (`.perchance`);
   - interactive / visual / game → **HTML generator** (`index.html` + `main.pjs`).
2. Build the code:
    - list format: use `generate_perchance` (local, no API key) or template-based
     from the syntax above;
   - HTML format: write `main.pjs` (params + `$meta` + plugin imports) and
     `index.html` (markup + style + module script).
3. **Always validate before showing:**
   - list format → `validate_syntax` + `preview_rolls` (≥5 samples);
   - HTML format → syntax-check the embedded `<script>` (e.g. `node --check` on the
     extracted JS), confirm `<script>` is closed and `$meta` exists in `main.pjs`.
4. Hand back the code with the editor link: `https://perchance.org/minimal#edit`
   (for HTML: tell the user to paste `main.pjs` into the JS panel and `index.html`
   into the HTML panel).
5. Optionally `run_on_perchance` for a live check (needs a browser / Playwright).

## Categories you can build
`names | characters | scenes | items | dialogue | images | loot | quests | interactive games | custom`
Styles: `simple | weighted | nested | complex | html-canvas`

## MCP tools available

| Tool | Use |
|------|-----|
| `autonomous_generate` | **Fully autonomous** generator creation with intelligent decision-making |
| `batch_generate` | Generate multiple related generators in parallel with coordination |
| `improve_generator` | Self-improvement workflow with iterative refinement |
| `autonomous_test` | Comprehensive automated testing suite |
| `multi_format_generate` | Intelligent multi-format generation (.perchance or HTML) |
| `generate_perchance` | Generate a full generator from a topic (local templates, no API key) |
| `list_templates` / `get_template` | browse/read built-in templates |
| `validate_syntax` | check `.perchance` list code for errors/warnings |
| `preview_rolls` | show sample outputs locally (no browser) |
| `run_on_perchance` | run live on perchance.org via Playwright (needs browser) |
| `scrape_generator` | scrape any public perchance.org generator — extract full source via lightweight jsdom (no browser), validate, preview, download |

> Note: `validate_syntax` / `preview_rolls` only understand the **list format**.
> For HTML generators, validate the JS yourself and verify on perchance.org.

## CLI
```
perchance-gen create "fantasy tavern name" --style weighted
perchance-gen preview ./output/generators/fantasy-tavern-name.perchance
perchance-gen validate ./my-generator.perchance
perchance-gen run ./my-generator.perchance --rolls 20
perchance-gen scrape https://perchance.org/some-generator
perchance-gen ui                      # launch web UI for scraping
```

## Scraping any public generator (NEW)

You can **clone the entire generator** from any public perchance.org page — not just images.
Use `scrape_generator` (MCP), `perchance-gen scrape` (CLI), or `perchance-gen ui` (web UI).

The scraper uses **jsdom** (no browser needed) and hits the official download API
(`perchance.org/api/downloadGenerator`) to bypass Cloudflare. It extracts the full
`.perchance` source code, description, validates it, and generates preview rolls — all locally.

**Example:**
```
perchance-gen scrape https://perchance.org/fdqirttayk
```
This saves the complete generator source to `output/cloned/` and shows 8 preview rolls.

Or in the web UI:
```
perchance-gen ui
```
Then paste any perchance.org URL in your browser — no CLI needed.

## Autonomous workflows (NEW)

The agent can now operate fully autonomously:

### 1. Autonomous Generation
Use `autonomous_generate` for hands-off creation:
- Automatically decides optimal format (.perchance vs HTML)
- Intelligently selects complexity and parameters
- Auto-validates and tests results
- Self-improves if quality below threshold

### 2. Self-Improvement
Use `improve_generator` to enhance existing code:
- Analyzes validation results
- Applies targeted improvements (error correction, content expansion, etc.)
- Iteratively refines until quality goal met
- Learns from successful patterns

### 3. Batch Processing
Use `batch_generate` for multiple related generators:
- Coordinates parallel generation
- Intelligently creates topic variations
- Validates all results consistently
- Returns best performers

### 4. Comprehensive Testing
Use `autonomous_test` for thorough validation:
- Edge case detection
- Stress testing (optional)
- Regression testing
- Quality benchmarking

### 5. Multi-Format Generation
Use `multi_format_generate` for format flexibility:
- Auto-detects when HTML format is better
- Generates both formats for comparison
- Converts between formats
- Optimizes for platform capabilities
