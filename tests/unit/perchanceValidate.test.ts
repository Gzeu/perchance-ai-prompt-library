const { validateCode } = require('../../src/utils/perchanceValidate');

describe('perchanceValidate', () => {
  it('accepts valid generator with output first', () => {
    const code = `output
  [adj] [noun]

adj
  cool
  warm

noun
  cat
  dog`;
    const result = validateCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('flags missing output list', () => {
    const result = validateCode(`names\n  Alice\n  Bob`);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('output');
  });

  it('warns on orphan references', () => {
    const code = `output
  [missing]

other
  x`;
    const result = validateCode(code);
    expect(result.warnings.some((w: string) => w.includes('missing'))).toBe(true);
  });
});
