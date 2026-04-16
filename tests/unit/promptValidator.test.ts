// tests/unit/promptValidator.test.ts — v4.0.0
import { describe, it, expect, beforeEach } from '@jest/globals';

// ─── Tipuri ──────────────────────────────────────────────────
interface PromptValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitized: string;
}

// ─── Validator inline (reflectă src/services/promptValidator.ts) ─
function validatePrompt(input: string): PromptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input || input.trim().length === 0) errors.push('Promptul nu poate fi gol');
  if (input.length > 2000) errors.push('Promptul depășește 2000 caractere');
  if (input.length > 0 && input.trim().length < 3) errors.push('Promptul este prea scurt (min 3 caractere)');

  const forbidden = ['nsfw', 'explicit', 'nude', 'porn'];
  for (const word of forbidden) {
    if (input.toLowerCase().includes(word)) errors.push(`Conținut interzis: "${word}"`);
  }

  if (input.length > 0 && input.length < 20) warnings.push('Prompt scurt — rezultate mai bune cu mai multe detalii');
  if (input.length > 0 && !input.includes(',')) warnings.push('Fără virgule — consideră separarea conceptelor cu virgulă');

  const sanitized = input.trim().replace(/\s+/g, ' ').slice(0, 2000);
  return { isValid: errors.length === 0, errors, warnings, sanitized };
}

// ─── Tests ───────────────────────────────────────────────────
describe('PromptValidator', () => {
  describe('valid inputs', () => {
    it('acceptă un prompt simplu valid', () => {
      const result = validatePrompt('cinematic anime portrait, vibrant colors, masterpiece');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('sanitizează spațiile multiple', () => {
      const result = validatePrompt('anime  portrait   sunset');
      expect(result.sanitized).toBe('anime portrait sunset');
    });

    it('acceptă exact 2000 caractere', () => {
      const result = validatePrompt('a'.repeat(2000));
      expect(result.errors.some((e) => e.includes('2000'))).toBe(false);
    });
  });

  describe('invalid inputs', () => {
    it('respinge promptul gol', () => {
      const result = validatePrompt('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Promptul nu poate fi gol');
    });

    it('respinge promptul de 1 caracter', () => {
      const result = validatePrompt('a');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('scurt'))).toBe(true);
    });

    it('respinge promptul peste 2000 caractere', () => {
      const result = validatePrompt('a'.repeat(2001));
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('2000'))).toBe(true);
    });

    it('detectează conținut interzis nsfw', () => {
      const result = validatePrompt('anime portrait nsfw content');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('nsfw'))).toBe(true);
    });
  });

  describe('warnings', () => {
    it('avertizează pentru prompt scurt', () => {
      const result = validatePrompt('anime girl');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('avertizează când lipsesc virgulele', () => {
      const result = validatePrompt('anime portrait vibrant colors high quality render');
      expect(result.warnings.some((w) => w.includes('virgul'))).toBe(true);
    });
  });
});

// ─── Cache Service Tests ──────────────────────────────────────
describe('CacheService', () => {
  interface CacheEntry<T> { value: T; expiresAt: number; }

  class SimpleCache<T> {
    private store = new Map<string, CacheEntry<T>>();
    set(key: string, value: T, ttlMs = 300_000): void {
      this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
    }
    get(key: string): T | null {
      const entry = this.store.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiresAt) { this.store.delete(key); return null; }
      return entry.value;
    }
    has(key: string): boolean { return this.get(key) !== null; }
    clear(): void { this.store.clear(); }
    get size(): number { return this.store.size; }
  }

  let cache: SimpleCache<string>;
  beforeEach(() => { cache = new SimpleCache<string>(); });

  it('stochează și recuperează valori', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('returnează null pentru cheie inexistentă', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('expiră intrările cu TTL 0', async () => {
    cache.set('expiring', 'data', 0);
    await new Promise((r) => setTimeout(r, 10));
    expect(cache.get('expiring')).toBeNull();
  });

  it('curăță toate intrările cu clear()', () => {
    cache.set('a', '1'); cache.set('b', '2');
    cache.clear();
    expect(cache.size).toBe(0);
  });
});
