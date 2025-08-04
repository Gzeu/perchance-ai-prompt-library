const { PerchancePromptLibrary } = require('../src/index');

describe('Batch Generation Features', () => {
  let library;

  beforeEach(() => {
    library = new PerchancePromptLibrary({ randomizeVariables: true });
  });

  test('should generate multiple unique variations', () => {
    const variations = library.generateVariations('anime', {
      subject: 'test warrior'
    }, 3);

    expect(variations).toHaveLength(3);
    
    // Check each variation has required properties
    variations.forEach(variation => {
      expect(variation).toHaveProperty('text');
      expect(variation).toHaveProperty('variationNumber');
      expect(variation).toHaveProperty('metadata');
      expect(typeof variation.text).toBe('string');
      expect(variation.text.length).toBeGreaterThan(50);
    });

    // Check variations are different (at least some variation)
    const texts = variations.map(v => v.text);
    const uniqueTexts = new Set(texts);
    expect(uniqueTexts.size).toBeGreaterThan(1);
  });

  test('should handle different styles for batch generation', () => {
    const styles = ['anime', 'cinematic', 'photorealistic'];
    
    styles.forEach(style => {
      const variations = library.generateVariations(style, {
        subject: 'test subject'
      }, 2);
      
      expect(variations).toHaveLength(2);
      variations.forEach(variation => {
        expect(variation.style).toBe(style);
        expect(variation.text).toContain(style === 'anime' ? 'anime' : style);
      });
    });
  });

  test('should generate different results with randomization enabled', () => {
    const batch1 = library.generateVariations('digital_art', {
      subject: 'dragon'
    }, 2);
    
    const batch2 = library.generateVariations('digital_art', {
      subject: 'dragon'  
    }, 2);

    // Should have some variation due to randomization
    expect(batch1[0].text).not.toBe(batch2[0].text);
  });

  test('should maintain quality modifiers in batch generation', () => {
    const variations = library.generateVariations('anime', {
      subject: 'magical girl'
    }, 3);

    variations.forEach(variation => {
      expect(variation.text).toMatch(/masterpiece|best quality|ultra detailed/);
    });
  });

  test('should include metadata for each variation', () => {
    const variations = library.generateVariations('comic', {
      subject: 'superhero'
    }, 2);

    variations.forEach(variation => {
      expect(variation.metadata).toHaveProperty('wordCount');
      expect(variation.metadata).toHaveProperty('characterCount');
      expect(variation.metadata.wordCount).toBeGreaterThan(0);
      expect(variation.metadata.characterCount).toBeGreaterThan(0);
    });
  });
});
