// src/services/pollinationsService.ts — v5.0.0
import axios from 'axios';
import type { APIResponse } from '../types/index.js';

const BASE_URL = 'https://image.pollinations.ai';
const TEXT_URL  = 'https://text.pollinations.ai';

// ─── Seed Utilities ──────────────────────────────────────────────────────────

/**
 * Deterministic seed from a string (djb2 hash).
 * Same string → same seed every time, enabling reproducible series.
 */
export function seedFromString(text: string): number {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
  }
  return Math.abs(hash) % 2_147_483_647;
}

/**
 * Derive a series of related seeds (variations that stay visually coherent).
 * baseSeed + prime-step offsets keeps images in the same "family".
 */
export function seedSeries(baseSeed: number, count: number): number[] {
  const PRIME = 1_000_003;
  return Array.from({ length: count }, (_, i) =>
    (baseSeed + i * PRIME) % 2_147_483_647
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PollinationsImageOptions {
  width?:   number;
  height?:  number;
  seed?:    number;
  model?:   'flux' | 'flux-realism' | 'flux-cablyai' | 'turbo';
  nologo?:  boolean;
  enhance?: boolean;
}

export interface PollinationsTextOptions {
  model?:  'openai' | 'mistral' | 'claude' | 'llama';
  seed?:   number;
  system?: string;
}

/** Options for a consistent image series (same subject, varied seeds). */
export interface ConsistentSeriesOptions extends PollinationsImageOptions {
  /** Base seed — omit to derive deterministically from prompt text. */
  baseSeed?: number;
  count:     number;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class PollinationsService {
  // ── Image ────────────────────────────────────────────────────────────────

  getImageUrl(prompt: string, options: PollinationsImageOptions = {}): string {
    const params = new URLSearchParams();
    if (options.width)              params.set('width',   String(options.width));
    if (options.height)             params.set('height',  String(options.height));
    if (options.seed !== undefined) params.set('seed',    String(options.seed));
    if (options.model)              params.set('model',   options.model);
    if (options.nologo)             params.set('nologo',  'true');
    if (options.enhance)            params.set('enhance', 'true');
    const qs  = params.toString();
    const enc = encodeURIComponent(prompt);
    return `${BASE_URL}/prompt/${enc}${qs ? `?${qs}` : ''}`;
  }

  /**
   * Generate a series of image URLs that stay visually consistent.
   * Uses deterministic seed derivation so results are reproducible.
   *
   * @example
   * const urls = svc.getConsistentSeries('cyberpunk warrior', { count: 4 });
   * // → 4 URLs with seeds [baseSeed, baseSeed+1000003, ...]
   */
  getConsistentSeries(
    prompt:  string,
    options: ConsistentSeriesOptions
  ): Array<{ url: string; seed: number; index: number }> {
    const base   = options.baseSeed ?? seedFromString(prompt);
    const seeds  = seedSeries(base, options.count);
    const { count: _count, baseSeed: _bs, ...imgOpts } = options;
    return seeds.map((seed, index) => ({
      index,
      seed,
      url: this.getImageUrl(prompt, { ...imgOpts, seed }),
    }));
  }

  // ── Text ─────────────────────────────────────────────────────────────────

  async generateText(
    prompt:  string,
    options: PollinationsTextOptions = {}
  ): Promise<APIResponse<string>> {
    try {
      const params = new URLSearchParams();
      if (options.model)              params.set('model',  options.model);
      if (options.seed !== undefined) params.set('seed',   String(options.seed));
      if (options.system)             params.set('system', options.system);

      const res = await axios.get<string>(
        `${TEXT_URL}/${encodeURIComponent(prompt)}?${params.toString()}`,
        { timeout: 30_000, responseType: 'text' }
      );

      return { success: true, data: res.data, timestamp: new Date().toISOString(), version: '5.0.0' };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error', timestamp: new Date().toISOString(), version: '5.0.0' };
    }
  }

  /**
   * Expand a short subject into a full, style-aware prompt.
   * This is the auto-expansion step — mirrors Perchance's AI prompt expansion.
   *
   * @param subject   Raw user input, e.g. "angry viking warrior"
   * @param style     Art style name, e.g. "cyberpunk" or "oil painting"
   * @param context   Optional lorebook context (npc/world/lore layers)
   */
  async expandPrompt(
    subject: string,
    style:   string,
    context: PromptContext = {}
  ): Promise<string> {
    const ctxParts: string[] = [];
    if (context.npc)   ctxParts.push(`Characters: ${context.npc}`);
    if (context.world) ctxParts.push(`Setting: ${context.world}`);
    if (context.lore)  ctxParts.push(`Background: ${context.lore}`);
    const ctxBlock = ctxParts.length ? `\n\nContext:\n${ctxParts.join('\n')}` : '';

    const system = [
      'You are an expert at writing Stable Diffusion / Flux image generation prompts.',
      `The art style is: ${style}.`,
      'Expand the user\'s short subject into a detailed image generation prompt.',
      'Include lighting, atmosphere, composition, and quality tags relevant to the style.',
      'If context is provided, weave it into the scene naturally.',
      'Return ONLY the final prompt string — no explanations, no quotes.',
    ].join(' ');

    const result = await this.generateText(`${subject}${ctxBlock}`, {
      model: 'openai',
      system,
      // Seed derived from subject so same subject always expands similarly
      seed: seedFromString(subject + style),
    });

    return result.success && result.data
      ? result.data.trim().replace(/^"|"$/g, '')
      : subject;
  }

  /** Legacy alias kept for backward compatibility. */
  async enhancePrompt(basePrompt: string): Promise<string> {
    return this.expandPrompt(basePrompt, 'photorealistic');
  }
}

export const pollinationsService = new PollinationsService();

// ─── Re-export context type so other modules can import from here ────────────
export type { PromptContext } from '../generators/promptGenerator.js';
