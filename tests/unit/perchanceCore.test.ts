import { validatePerchance } from '../../src/core/validator.js';
import { previewRolls } from '../../src/core/exporter.js';

describe('Perchance core — validatePerchance', () => {
  const goodCode = `output
  [adjective] [noun]

adjective
  dark^2
  ancient

noun
  sword
  temple^3`;

  it('marks a well-formed generator as valid', () => {
    const r = validatePerchance(goodCode);
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
    expect(r.stats.hasOutput).toBe(true);
    expect(r.stats.listCount).toBe(3);
    expect(r.stats.totalItems).toBe(5);
  });

  it('reports when the output list is missing', () => {
    const r = validatePerchance(`adjective\n  dark\n  ancient`);
    expect(r.valid).toBe(true);
    expect(r.stats.hasOutput).toBe(false);
  });

  it('detects weighted items', () => {
    const r = validatePerchance(goodCode);
    expect(r.stats.hasWeighted).toBe(true);
  });
});

describe('Perchance core — previewRolls', () => {
  const code = `output
  The [mood] [creature]

mood
  cursed^2
  radiant

creature
  dragon^3
  phoenix`;

  it('returns the requested number of rolls', () => {
    const rolls = previewRolls(code, 4);
    expect(rolls).toHaveLength(4);
    rolls.forEach((r) => expect(typeof r).toBe('string'));
  });

  it('defaults to 5 rolls', () => {
    expect(previewRolls(code)).toHaveLength(5);
  });
});
