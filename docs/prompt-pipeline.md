# Unified Prompt Pipeline

> v5.0.0 — Lorebook Context · Consistent Seeds · Style Presets · Auto-Expansion

The four features introduced in v5 form a single logical pipeline:

```
PromptContext (lorebook)
       ↓
  expandPrompt()          ← auto-expansion via Pollinations text model
       ↓
  generatePrompt()        ← context compiled + style preset applied
       ↓
  getConsistentSeries()   ← deterministic seed series for coherent images
       ↓
  Pollinations image URLs
```

---

## 1 · Lorebook Context Layers

Inspired by Perchance ACC's NPC / World / Lore boxes. Three optional layers,
combined in visual priority order (world → npc → lore).

```ts
import { generatePrompt } from './src/generators/promptGenerator.js';

const result = generatePrompt({
  category: 'fantasy',
  style:    'dark-fantasy',
  keywords: ['battle scene'],
  context: {
    npc:   'Elena, scarred elven assassin with silver eyes',
    world: 'ruined citadel at dusk, smouldering rubble',
    lore:  'the citadel fell to the Void Order a century ago',
  },
});

console.log(result.prompt);
// → "epic fantasy landscape..., battle scene,
//    ruined citadel at dusk smouldering rubble,
//    Elena scarred elven assassin with silver eyes,
//    the citadel fell to the Void Order...,
//    dark fantasy, brooding atmosphere..."
```

**Layer semantics:**

| Layer | What goes here | Visual priority |
|-------|---------------|-----------------|
| `npc` | Characters — traits, appearance, relationships | Mid |
| `world` | Setting — location, time, current events | High (first) |
| `lore` | History/backstory — truncated to 120 chars | Low (last) |

---

## 2 · Deterministic Seeds

The same input always maps to the same seed. No need to store seeds — they are
derived on demand via a djb2 hash of the prompt components.

```ts
import { seedFromString, seedSeries } from './src/services/pollinationsService.js';

// Same subject always gets the same base seed
const seed = seedFromString('angry viking warrior:oil-painting:sword,shield');

// Generate 4 related seeds (same visual family, subtle variation)
const seeds = seedSeries(seed, 4);
// → [seed, seed+1_000_003, seed+2_000_006, seed+3_000_009]
```

`generatePrompt()` automatically stores `seed` in `result.metadata.seed`, so you
can always regenerate the exact image later.

---

## 3 · Consistent Image Series

```ts
import { pollinationsService } from './src/services/pollinationsService.js';

const series = pollinationsService.getConsistentSeries(
  'cyberpunk warrior queen in neon rain',
  { count: 4, width: 1024, height: 1024, model: 'flux' }
);

// series[0] = { index: 0, seed: 847291, url: '...' }
// series[1] = { index: 1, seed: 1847294, url: '...' }  ← same family
// ...

// All 4 images share the same visual DNA — good for character sheets,
// story boards, or consistent style across a campaign.
```

Omit `baseSeed` → derived from prompt text (reproducible).
Pass explicit `baseSeed` → you control the anchor.

---

## 4 · Auto-Expansion

Mirrors Perchance's built-in prompt expansion: short subject → full, style-aware prompt.
Uses Pollinations text model (OpenAI-compatible) with a style-specific system prompt.

```ts
import { pollinationsService } from './src/services/pollinationsService.js';

const expanded = await pollinationsService.expandPrompt(
  'angry viking warrior',   // short subject
  'oil-painting',           // target style
  {                         // optional lorebook context
    world: 'burning Norse longhouse at midnight',
    npc:   'berserker with rune-carved axe, wild white hair',
  }
);

// expanded →
// "A towering berserker with wild white hair gripping a rune-carved axe,
//  silhouetted against the roaring flames of a Norse longhouse at midnight,
//  oil on canvas, impasto texture, Rembrandt lighting..."

// Then generate the image
const url = pollinationsService.getImageUrl(expanded, { model: 'flux', width: 1024 });
```

The expansion seed is deterministic (`seedFromString(subject + style)`) so the
same subject+style pair always expands similarly — useful for batch consistency.

---

## 5 · Style Presets Reference

Every preset in `STYLE_PRESETS` maps to a Perchance-aligned `suffix`, `negative`, and `model`.

| Key | Category | Model | Notable suffix |
|-----|----------|-------|----------------|
| `photorealistic` | Photography | flux-realism | RAW photo, 8K, sharp focus |
| `cinematic` | Photography | flux | anamorphic lens, film grain |
| `portrait` | Photography | flux-realism | soft box lighting, 85mm |
| `anime` | Animation | flux | cel-shading, studio quality |
| `concept-art` | Digital Art | flux | Artstation trending |
| `digital-painting` | Digital Art | flux | detailed brushwork |
| `cyberpunk` | Digital Art | flux | neon, Blade Runner mood |
| `fantasy` | Fantasy | flux | Greg Rutkowski |
| `dark-fantasy` | Fantasy | flux | chiaroscuro, Gothic |
| `ethereal` | Digital Art | flux | soft luminosity, dream-like haze |
| `oil-painting` | Traditional | flux | impasto, Rembrandt |
| `watercolor` | Traditional | flux | wet-on-wet, luminous washes |
| `surrealism` | Fine Art | flux | Salvador Dalí |
| `steampunk` | Fantasy | flux | brass, clockwork |
| `art-nouveau` | Illustration | flux | Alphonse Mucha, gold |
| `line-art` | Illustration | flux | ink, white background |
| `flat-design` | Illustration | turbo | bold color blocks |
| `pixel-art` | Digital Art | turbo | limited palette, crisp |
| `low-poly` | 3D Art | turbo | flat shading, geometric |

Access any preset programmatically:
```ts
import { getStylePreset } from './src/generators/promptGenerator.js';
const preset = getStylePreset('ethereal');
// → { suffix: '...', negative: '...', model: 'flux' }
```
