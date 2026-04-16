// tests/unit/formatters.test.ts — v5.0.0
import {
  formatQuality,
  formatTags,
  truncate,
  formatDuration,
  capitalizeFirst,
} from '../../src/utils/formatters';

describe('formatQuality()', () => {
  it('shows Excelent for >= 90', () => expect(formatQuality(95)).toContain('Excelent'));
  it('shows Bun for 75-89',     () => expect(formatQuality(80)).toContain('Bun'));
  it('shows Mediu for 60-74',   () => expect(formatQuality(65)).toContain('Mediu'));
  it('shows Slab for < 60',     () => expect(formatQuality(50)).toContain('Slab'));
  it('includes the score',      () => expect(formatQuality(92)).toContain('92'));
});

describe('formatTags()', () => {
  it('prefixes each tag with #', () => {
    expect(formatTags(['dragon', 'fire'])).toBe('#dragon #fire');
  });
  it('handles empty array', () => expect(formatTags([])).toBe(''));
  it('handles single tag',  () => expect(formatTags(['anime'])).toBe('#anime'));
});

describe('truncate()', () => {
  it('does not truncate short strings', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });
  it('truncates long strings with ellipsis', () => {
    const result = truncate('a'.repeat(100), 20);
    expect(result).toHaveLength(20);
    expect(result.endsWith('...')).toBe(true);
  });
  it('uses default max of 80', () => {
    const s = 'x'.repeat(90);
    expect(truncate(s)).toHaveLength(80);
  });
});

describe('formatDuration()', () => {
  it('formats milliseconds', () => expect(formatDuration(500)).toBe('500ms'));
  it('formats seconds',      () => expect(formatDuration(3500)).toBe('3.5s'));
  it('formats minutes',      () => expect(formatDuration(90_000)).toBe('1m 30s'));
});

describe('capitalizeFirst()', () => {
  it('capitalizes first letter', () => expect(capitalizeFirst('hello')).toBe('Hello'));
  it('handles empty string',     () => expect(capitalizeFirst('')).toBe(''));
  it('does not change others',   () => expect(capitalizeFirst('hELLO')).toBe('HELLO'));
});
