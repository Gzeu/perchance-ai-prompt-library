// tests/unit/generators.test.ts — v5.0.0
import {
  generatePrompt,
  generateBatch,
  getRandomCategory,
} from '../../src/generators/promptGenerator';
import type { PromptCategory, ArtStyle, QualityLevel } from '../../src/types/index';

const CATEGORY: PromptCategory = 'anime';
const STYLE: ArtStyle = 'cinematic';
const KEYWORDS = ['dragon', 'sakura'];

describe('generatePrompt()', () => {
  it('returns a GeneratedPrompt object', () => {
    const p = generatePrompt(CATEGORY, STYLE, KEYWORDS);
    expect(p).toHaveProperty('prompt');
    expect(p).toHaveProperty('negativePrompt');
    expect(p).toHaveProperty('category', CATEGORY);
    expect(p).toHaveProperty('style', STYLE);
    expect(p).toHaveProperty('quality');
    expect(p).toHaveProperty('tags');
    expect(p.metadata).toHaveProperty('id');
    expect(p.metadata).toHaveProperty('version', '4.0.0');
  });

  it('includes keywords in the prompt', () => {
    const p = generatePrompt(CATEGORY, STYLE, KEYWORDS);
    expect(p.prompt).toContain('dragon');
    expect(p.prompt).toContain('sakura');
  });

  it('works for all quality levels', () => {
    const levels: QualityLevel[] = ['draft', 'standard', 'high', 'ultra'];
    for (const quality of levels) {
      const p = generatePrompt('realistic', 'painterly', [], quality);
      expect(p.quality).toBeGreaterThan(0);
      expect(p.quality).toBeLessThanOrEqual(100);
    }
  });

  it('generates unique IDs each call', () => {
    const ids = Array.from({ length: 10 }, () =>
      generatePrompt(CATEGORY, STYLE, []).metadata.id
    );
    const unique = new Set(ids);
    expect(unique.size).toBe(10);
  });

  it('includes style in the prompt string', () => {
    const p = generatePrompt(CATEGORY, 'watercolor', []);
    expect(p.prompt).toContain('watercolor');
  });
});

describe('generateBatch()', () => {
  it('returns the correct number of prompts', () => {
    const kw = [[], [], ['magic']];
    const batch = generateBatch(CATEGORY, STYLE, kw);
    expect(batch).toHaveLength(3);
  });

  it('all prompts are valid objects', () => {
    const batch = generateBatch('fantasy', 'painterly', Array(5).fill([]));
    for (const p of batch) {
      expect(p.prompt.length).toBeGreaterThan(0);
      expect(p.category).toBe('fantasy');
    }
  });

  it('handles empty keyword sets', () => {
    expect(() => generateBatch(CATEGORY, STYLE, [])).not.toThrow();
  });
});

describe('getRandomCategory()', () => {
  const VALID_CATEGORIES: PromptCategory[] = [
    'anime','realistic','fantasy','scifi','portrait','landscape','abstract',
  ];

  it('returns a valid category', () => {
    for (let i = 0; i < 20; i++) {
      expect(VALID_CATEGORIES).toContain(getRandomCategory());
    }
  });
});
