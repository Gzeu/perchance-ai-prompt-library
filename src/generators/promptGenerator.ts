// src/generators/promptGenerator.ts — v4.0.0
import { randomUUID } from 'crypto';
import type { GeneratedPrompt, PromptCategory, ArtStyle, QualityLevel, CLIOptions } from '../types/index.js';

// ─── Data ────────────────────────────────────────────────────────────────────
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

const NEGATIVE_PROMPTS: Record<PromptCategory, string> = {
  anime:     'deformed, extra limbs, low quality, blurry, bad anatomy',
  realistic: 'cartoon, painting, illustration, distorted, unrealistic skin',
  fantasy:   'modern, contemporary, ugly, deformed',
  scifi:     'medieval, fantasy, ugly, low quality',
  portrait:  'deformed, extra limbs, bad proportions, ugly',
  landscape: 'people, buildings, urban, modern, ugly',
  abstract:  'figurative, realistic, ugly, muddy colors',
};

// ─── Generator ───────────────────────────────────────────────────────────────
export function generatePrompt(
  category: PromptCategory,
  style: ArtStyle,
  keywords: string[],
  quality: QualityLevel = 'high'
): GeneratedPrompt {
  const bases = BASE_PROMPTS[category];
  const base = bases[Math.floor(Math.random() * bases.length)];
  const qualitySuffix = QUALITY_SUFFIXES[quality];

  const prompt = [
    base,
    keywords.join(', '),
    `${style} style`,
    qualitySuffix,
  ]
    .filter(Boolean)
    .join(', ');

  return {
    prompt,
    negativePrompt: NEGATIVE_PROMPTS[category],
    category,
    style,
    quality: Math.round(quality === 'ultra' ? 92 + Math.random() * 8 : quality === 'high' ? 82 + Math.random() * 13 : 65 + Math.random() * 20),
    tags: keywords,
    metadata: {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '4.0.0',
      source: 'cli',
    },
  };
}

export function generateBatch(
  category: PromptCategory,
  style: ArtStyle,
  keywordSets: string[][],
  quality: QualityLevel = 'high'
): GeneratedPrompt[] {
  return keywordSets.map((kw) => generatePrompt(category, style, kw, quality));
}

export function getRandomCategory(): PromptCategory {
  const cats = Object.keys(BASE_PROMPTS) as PromptCategory[];
  return cats[Math.floor(Math.random() * cats.length)];
}
