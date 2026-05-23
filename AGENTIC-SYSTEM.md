# Ultra Agentic System v7.0

Multi-agent collaborative pipeline for generating superior Perchance.org generators.

## Architecture

```
User request → selectAgents (max 3) → parallel Groq generation
  → debate rounds (fast model critiques) → weighted voting
  → SyntaxMaster refine → validate → persist memory
```

## Agents (7)

| Agent | Expertise | Key skills |
|-------|-----------|------------|
| CharacterExpert | characters, npcs, dialogue | NarrativeDepth, PersonalityConsistency |
| WorldBuilder | locations, worlds, fantasy | WorldCoherence, AtmosphereCreation |
| NarrativeMaster | stories, plots, events | NarrativeDepth, PlotStructure |
| ConsistencyChecker | validation, references | Consistency, ReferenceIntegrity |
| CreativityBooster | items, magic, variety | Originality, SurpriseFactor |
| SyntaxMaster | perchance syntax | SyntacticPerfection, PerchanceSyntax |
| ThemeSpecialist | genre, tone | ThemeCoherence, GenreFit |

Agent definitions live in `src/agents/specialists/` and `src/agents/registry.ts`.

## API

### Status

```bash
curl http://localhost:3000/api/perchance/agentic/status
```

### Preview selected agents (no Groq call)

```bash
curl "http://localhost:3000/api/perchance/agentic/preview?description=fantasy%20tavern%20names&category=names"
```

Returns up to 3 agents that would run for the given description and category.

### Generate (Ultra Agentic)

```bash
curl -X POST http://localhost:3000/api/perchance/agentic \
  -H "Content-Type: application/json" \
  -d '{
    "description": "fantasy tavern name generator",
    "category": "names",
    "iterations": 2,
    "complexity": "medium"
  }'
```

Requires `GROQ_API_KEY` in the API server `.env`.

## CLI

```bash
npm start
pai agentic "fantasy weapon generator" --category items --iterations 2
pai agentic "cozy cafe names" --json
```

## Web Studio

Run `npm run dev`, open `/agentic` for the Ultra Agentic UI with step timeline and live validation.

## Cost & limits

- At most **3 agents** per request (not all 7)
- **1–3 debate rounds** (`iterations` body param)
- Groq routes rate-limited (30 req/min per IP)
- Debate uses `llama-3.1-8b-instant`; generation uses `llama-3.3-70b-versatile`

## Memory

Sessions are stored under `.perchance-agentic-memory/` (gitignored) for context evolution across runs.
