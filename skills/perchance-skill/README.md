# Perchance Generator — OpenClaw Skill

This skill gives any OpenClaw agent the ability to create, validate, preview and run [Perchance.ai](https://perchance.ai) generators.

## Install

```bash
npm install -g perchance-ai-prompt-library
```

Add to your OpenClaw agent config:
```json
{
  "skills": ["perchance-generator"],
  "env": {
    "GROQ_API_KEY": "your-key"
  }
}
```

## What the agent can do

| Action | Description |
|--------|-------------|
| `create-generator` | AI-generate a full `.perchance` generator from a topic |
| `browse-templates` | Browse 150+ built-in templates |
| `validate-generator` | Validate syntax before using |
| `preview-generator` | See local sample results |
| `run-on-perchance` | Run on real perchance.ai via Playwright |
| `scrape-generator` | Clone a public generator from URL |

## Example agent conversations

> "Create a dungeon loot table generator with rare/common/legendary items"
> "Show me all character templates"
> "Validate this perchance code: output\n  hello\n  world"
> "Run my generator on perchance.ai and show me 20 results"
> "Clone this generator: https://perchance.ai/fantasy-name-generator"
