const PromptGenerator = require('../src/generators/PromptGenerator');

describe('PromptGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new PromptGenerator();
  });

  test('should generate a valid anime prompt', () => {
    const config = { style: 'anime', subject: 'magical girl', age: '18' };
    const result = generator.generate(config);
    
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('style', 'anime');
    expect(result.text).toContain('anime');
    expect(result.text).toContain('magical girl');
    expect(result.variables.subject).toBe('magical girl');
  });

  test('should generate variations', () => {
    const variations = generator.generateVariations('cinematic', { subject: 'detective' }, 2);
    expect(variations).toHaveLength(2);
    variations.forEach(variation => {
      expect(variation).toHaveProperty('text');
      expect(variation).toHaveProperty('variationNumber');
    });
  });

  test('should throw error for invalid style', () => {
    expect(() => {
      generator.generate({ style: 'invalid_style', subject: 'test' });
    }).toThrow('Style "invalid_style" not found');
  });

  test('should return statistics', () => {
    const stats = generator.getStats();
    expect(stats).toHaveProperty('totalStyles');
    expect(stats.totalStyles).toBeGreaterThan(0);
  });
});
