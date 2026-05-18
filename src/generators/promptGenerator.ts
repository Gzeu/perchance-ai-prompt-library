// src/generators/promptGenerator.ts — v5.0.0
import { randomUUID } from 'crypto';
import { seedFromString } from '../services/pollinationsService.js';
import type { GeneratedPrompt, PromptCategory, ArtStyle, QualityLevel } from '../types/index.js';

// ─── Lorebook Context ────────────────────────────────────────────────────────

/**
 * Three-layer context system inspired by Perchance ACC / NPC-World-Lore boxes.
 * Each layer is optional — omit what you don't need.
 *
 * Layer semantics:
 *  - npc   → WHO is in the scene (characters, relationships, traits)
 *  - world → WHERE / WHEN (current setting, time of day, events)
 *  - lore  → WHY / HISTORY (backstory, mythology, established facts)
 *
 * Layers collapse gracefully: you can use just `world`, just `lore`, or all three.
 */
export interface PromptContext {
  npc?:   string;   // e.g. "Elena, a scarred elven assassin with silver eyes"
  world?: string;   // e.g. "ruined citadel at dusk, after the siege ended"
  lore?:  string;   // e.g. "the citadel fell to the Void Order a century ago"
}

/**
 * Compile a PromptContext into a weighted suffix string.
 * Layer priority: world > npc > lore (visual layers first).
 * Each present layer adds specific, non-redundant detail.
 */
export function compileContext(ctx: PromptContext): string {
  const parts: string[] = [];
  // World layer → sets the visual stage first
  if (ctx.world) parts.push(ctx.world);
  // NPC layer → describes visible subjects
  if (ctx.npc)   parts.push(ctx.npc);
  // Lore layer → atmospheric/thematic colour (kept brief for prompt efficiency)
  if (ctx.lore) {
    // Truncate lore to 120 chars to avoid overwhelming the model
    const loreSummary = ctx.lore.length > 120 ? ctx.lore.slice(0, 117) + '...' : ctx.lore;
    parts.push(loreSummary);
  }
  return parts.join(', ');
}

// ─── Art Style Presets (Perchance-aligned) ───────────────────────────────────

/**
 * Extended style preset map.
 * Key → matches the `key` field in styles.json.
 * Each preset provides the quality suffix cluster used when this style is active.
 * Aligned with Perchance AI Image Generator's built-in style names.
 */
export const STYLE_PRESETS: Record<string, StylePreset> = {
  // ── Photography ────────────────────────────────────────────────────────
  photorealistic: {
    suffix:   'photorealistic, 8K, RAW photo, sharp focus, natural lighting',
    negative: 'cartoon, painting, illustration, distorted, unrealistic skin',
    model:    'flux-realism',
  },
  cinematic: {
    suffix:   'cinematic photograph, dramatic lighting, anamorphic lens, film grain, shallow DOF',
    negative: 'flat lighting, overexposed, blurry, amateur',
    model:    'flux',
  },
  portrait: {
    suffix:   'studio portrait, soft box lighting, bokeh background, sharp eyes, 85mm lens',
    negative: 'ugly, deformed, bad proportions, extra limbs',
    model:    'flux-realism',
  },
  macro: {
    suffix:   'extreme macro photography, 1:1 magnification, shallow focus, fine detail',
    negative: 'wide angle, landscape, full body',
    model:    'flux-realism',
  },
  // ── Illustration ───────────────────────────────────────────────────────
  anime: {
    suffix:   'anime key visual, vibrant cel-shading, studio quality, dynamic composition',
    negative: '3d render, photorealistic, western cartoon',
    model:    'flux',
  },
  'concept-art': {
    suffix:   'professional concept art, production quality, Artstation trending, detailed linework',
    negative: 'sketch, rough draft, low detail',
    model:    'flux',
  },
  'digital-painting': {
    suffix:   'digital painting, detailed brushwork, vibrant colors, professional illustration',
    negative: 'photograph, 3D render, pixel art',
    model:    'flux',
  },
  'art-nouveau': {
    suffix:   'art nouveau style, Alphonse Mucha, flowing organic lines, decorative border, gold accents',
    negative: 'minimalist, geometric, modern, flat',
    model:    'flux',
  },
  // ── Traditional ────────────────────────────────────────────────────────
  'oil-painting': {
    suffix:   'oil on canvas, impasto texture, Rembrandt lighting, classical composition',
    negative: 'digital, vector, flat colors, photograph',
    model:    'flux',
  },
  watercolor: {
    suffix:   'watercolor on paper, wet-on-wet technique, soft edges, luminous washes',
    negative: 'digital, sharp edges, flat colors, photograph',
    model:    'flux',
  },
  'chalk-pastel': {
    suffix:   'chalk pastel artwork, soft blending, textured paper, Edgar Degas style',
    negative: 'digital, sharp edges, flat colors',
    model:    'flux',
  },
  // ── Digital / Genre ────────────────────────────────────────────────────
  cyberpunk: {
    suffix:   'cyberpunk aesthetic, neon lights, rain-slicked streets, volumetric fog, Blade Runner mood',
    negative: 'medieval, pastoral, pastel, soft',
    model:    'flux',
  },
  fantasy: {
    suffix:   'epic fantasy illustration, dramatic lighting, magical atmosphere, Greg Rutkowski style',
    negative: 'modern, contemporary, mundane',
    model:    'flux',
  },
  surrealism: {
    suffix:   'surrealist art, dreamlike atmosphere, Salvador Dalí influence, impossible geometry',
    negative: 'realistic, mundane, ordinary, photograph',
    model:    'flux',
  },
  steampunk: {
    suffix:   'steampunk aesthetic, brass and copper, Victorian-era, intricate clockwork, warm lighting',
    negative: 'modern, digital, minimalist, flat',
    model:    'flux',
  },
  // ── 3D / Game ──────────────────────────────────────────────────────────
  'pixel-art': {
    suffix:   'pixel art, limited color palette, crisp pixels, retro game style',
    negative: 'high resolution, smooth gradients, vector, photograph',
    model:    'turbo',
  },
  'low-poly': {
    suffix:   'low poly 3D, flat shading, geometric shapes, clean render',
    negative: 'high poly, realistic, photograph, painting',
    model:    'turbo',
  },
  // ── Perchance-specific additions ───────────────────────────────────────
  ethereal: {
    suffix:   'ethereal glowing atmosphere, soft luminosity, dream-like haze, otherworldly light',
    negative: 'harsh lighting, dark, gritty, concrete',
    model:    'flux',
  },
  'dark-fantasy': {
    suffix:   'dark fantasy, brooding atmosphere, chiaroscuro, Gothic architecture, somber palette',
    negative: 'bright, cheerful, pastel, modern',
    model:    'flux',
  },
  'flat-design': {
    suffix:   'flat design illustration, clean vector, minimal shadows, bold color blocks',
    negative: 'photograph, 3D, texture, gradient',
    model:    'turbo',
  },
  'line-art': {
    suffix:   'clean line art, ink illustration, precise linework, white background, minimal shading',
    negative: 'color, photograph, 3D, watercolor',
    model:    'flux',
  },
};

export interface StylePreset {
  suffix:    string;   // quality + atmosphere suffix appended to prompt
  negative:  string;   // negative prompt for this style
  model:     'flux' | 'flux-realism' | 'flux-cablyai' | 'turbo';
}

/** Lookup a preset by key; falls back to 'photorealistic' if unknown. */
export function getStylePreset(key: string): StylePreset {
  return STYLE_PRESETS[key] ?? STYLE_PRESETS['photorealistic']!;
}

// ─── Base Prompts ────────────────────────────────────────────────────────────

const BASE_PROMPTS: Record<PromptCategory, string[]> = {
  anime: [
    'cinematic anime portrait with vibrant cel-shading',
    'dynamic manga panel with expressive linework',
    'soft pastel anime scenery at golden hour',
    'detailed mecha anime illustration with dramatic lighting',
  ],
  realistic: [
    'photorealistic 8K portrait with subsurface scattering',
    'hyperdetailed close-up with cinematic depth of field',
    'golden hour photography with lens flare',
    'studio lighting product shot on neutral background',
  ],
  fantasy: [
    'epic fantasy landscape with sweeping mountain vistas',
    'magical ethereal forest with bioluminescent flora',
    'dramatic concept art for a dark fantasy world',
    'ancient ruined temple overgrown by mystical nature',
  ],
  scifi: [
    'futuristic cyberpunk megacity at night with neon reflections',
    'sci-fi spaceship bridge with holographic displays',
    'dystopian cityscape in a perpetual rainstorm',
    'alien planet surface with twin moons on the horizon',
  ],
  portrait: [
    'intimate close-up portrait with natural window light',
    'dramatic chiaroscuro portrait inspired by Rembrandt',
    'environmental portrait in a carefully crafted interior',
    'editorial fashion portrait with bold color grading',
  ],
  landscape: [
    'aerial view of a volcanic archipelago at sunrise',
    'misty mountain valley with a still reflective lake',
    'vast desert dunes casting long sunset shadows',
    'dense rainforest canopy from below with light rays',
  ],
  abstract: [
    'fluid art with marbling ink in complementary colors',
    'geometric hard-edge abstraction with bold primaries',
    'organic biomorphic forms in muted earth tones',
    'kinetic light painting with long exposure streaks',
  ],
};

const QUALITY_SUFFIXES: Record<QualityLevel, string> = {
  draft:    'sketch quality, rough draft',
  standard: 'high quality, detailed',
  high:     'masterpiece, best quality, highly detailed, 4K',
  ultra:    'masterpiece, ultra-detailed, 8K resolution, award winning, professional',
};

// ─── Core Generator ──────────────────────────────────────────────────────────

export interface GenerateOptions {
  category:  PromptCategory;
  style:     ArtStyle;
  keywords:  string[];
  quality?:  QualityLevel;
  /** Lorebook context layers */
  context?:  PromptContext;
  /**
   * Explicit seed. If omitted, derived deterministically from
   * category + style + keywords so the same inputs always produce
   * the same seed (reproducible without storing it).
   */
  seed?:     number;
}

export function generatePrompt(options: GenerateOptions): GeneratedPrompt;
/** @deprecated Pass an options object instead. */
export function generatePrompt(
  category: PromptCategory,
  style:    ArtStyle,
  keywords: string[],
  quality?: QualityLevel
): GeneratedPrompt;
export function generatePrompt(
  categoryOrOptions: PromptCategory | GenerateOptions,
  style?:    ArtStyle,
  keywords?: string[],
  quality?:  QualityLevel
): GeneratedPrompt {
  // Normalise overloads
  let opts: GenerateOptions;
  if (typeof categoryOrOptions === 'string') {
    opts = { category: categoryOrOptions, style: style!, keywords: keywords!, quality };
  } else {
    opts = categoryOrOptions;
  }

  const { category, style: styleKey, keywords: kw, quality: qual = 'high', context = {}, seed } = opts;
  const preset       = getStylePreset(styleKey);
  const bases        = BASE_PROMPTS[category];
  const base         = bases[Math.floor(Math.random() * bases.length)];
  const qualSuffix   = QUALITY_SUFFIXES[qual];
  const ctxSuffix    = compileContext(context);

  // Deterministic seed: subject-stable (same call → same seed → same image family)
  const resolvedSeed = seed ?? seedFromString(`${category}:${styleKey}:${kw.join(',')}`);

  const prompt = [
    base,
    kw.join(', '),
    ctxSuffix,           // lorebook layers woven in here
    preset.suffix,       // style-specific quality suffix (replaces generic style string)
    qualSuffix,
  ]
    .filter(Boolean)
    .join(', ');

  const qualityScore = qual === 'ultra'
    ? 92 + Math.random() * 8
    : qual === 'high'
    ? 82 + Math.random() * 13
    : 65 + Math.random() * 20;

  return {
    prompt,
    negativePrompt: preset.negative,   // style-specific negatives instead of generic per-category
    category,
    style: styleKey,
    quality: Math.round(qualityScore),
    tags: kw,
    // Expose seed in metadata so callers can store / reproduce
    metadata: {
      id:        randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version:   '5.0.0',
      source:    'cli',
      seed:      resolvedSeed,
      context:   Object.keys(context).length ? context : undefined,
    } as any,
  };
}

export function generateBatch(
  category:    PromptCategory,
  style:       ArtStyle,
  keywordSets: string[][],
  quality?:    QualityLevel,
  context?:    PromptContext
): GeneratedPrompt[] {
  return keywordSets.map((kw) =>
    generatePrompt({ category, style, keywords: kw, quality, context })
  );
}

export function getRandomCategory(): PromptCategory {
  const cats = Object.keys(BASE_PROMPTS) as PromptCategory[];
  return cats[Math.floor(Math.random() * cats.length)];
}
