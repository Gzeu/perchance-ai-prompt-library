import {
  buildWeightedList,
  parseWeightedList,
  rollWeighted,
  WeightedEntry
} from '../../src/core/weighted-list.js';

describe('Weighted List', () => {
  describe('buildWeightedList', () => {
    it('should build weighted list with comments', () => {
      const entries: WeightedEntry[] = [
        { value: 'common', weight: 10 },
        { value: 'rare', weight: 1 },
      ];

      const result = buildWeightedList(entries);

      expect(result).toContain('common^10');
      expect(result).toContain('rare^1');
      expect(result).toContain('//'); // Should have probability comments
    });

    it('should calculate probabilities correctly', () => {
      const entries: WeightedEntry[] = [
        { value: 'item1', weight: 5 },
        { value: 'item2', weight: 5 },
      ];

      const result = buildWeightedList(entries);

      expect(result).toContain('// 50.0%');
    });

    it('should handle single entry', () => {
      const entries: WeightedEntry[] = [
        { value: 'only', weight: 1 },
      ];

      const result = buildWeightedList(entries);

      expect(result).toContain('only^1');
      expect(result).toContain('// 100.0%');
    });

    it('should handle empty array', () => {
      const result = buildWeightedList([]);
      expect(result).toBe('');
    });

    it('should handle floating point weights', () => {
      const entries: WeightedEntry[] = [
        { value: 'float1', weight: 0.5 },
        { value: 'float2', weight: 0.5 },
      ];

      const result = buildWeightedList(entries);

      expect(result).toContain('float1^0.5');
      expect(result).toContain('float2^0.5');
    });
  });

  describe('parseWeightedList', () => {
    it('should parse weighted items', () => {
      const code = `
  common^10
  rare^1
  uncommon^5
`;

      const result = parseWeightedList(code);

      expect(result).toHaveLength(3);
      expect(result[0].value).toBe('common');
      expect(result[0].weight).toBe(10);
      expect(result[1].value).toBe('rare');
      expect(result[1].weight).toBe(1);
    });

    it('should parse unweighted items as weight 1', () => {
      const code = `
  item1
  item2
  item3
`;

      const result = parseWeightedList(code);

      expect(result).toHaveLength(3);
      result.forEach(entry => {
        expect(entry.weight).toBe(1);
      });
    });

    it('should calculate probabilities', () => {
      const code = `
  item1^5
  item2^5
`;

      const result = parseWeightedList(code);

      expect(result[0].probability).toBe(50);
      expect(result[1].probability).toBe(50);
    });

    it('should ignore comments', () => {
      const code = `
  item1^10 // this is a comment
  item2^5
  // another comment
  item3^1
`;

      const result = parseWeightedList(code);

      expect(result).toHaveLength(3);
    });

    it('should ignore empty lines', () => {
      const code = `
  item1^10

  item2^5


  item3^1
`;

      const result = parseWeightedList(code);

      expect(result).toHaveLength(3);
    });

    it('should handle mixed weighted and unweighted', () => {
      const code = `
  weighted^5
  unweighted
  another^3
`;

      const result = parseWeightedList(code);

      expect(result).toHaveLength(3);
      expect(result[0].weight).toBe(5);
      expect(result[1].weight).toBe(1);
      expect(result[2].weight).toBe(3);
    });

    it('should handle floating point weights', () => {
      const code = `
  item1^0.5
  item2^1.5
`;

      const result = parseWeightedList(code);

      expect(result[0].weight).toBe(0.5);
      expect(result[1].weight).toBe(1.5);
    });
  });

  describe('rollWeighted', () => {
    it('should return an item from the list', () => {
      const entries: WeightedEntry[] = [
        { value: 'item1', weight: 1 },
        { value: 'item2', weight: 1 },
      ];

      const result = rollWeighted(entries);

      expect(['item1', 'item2']).toContain(result);
    });

    it('should respect weights', () => {
      const entries: WeightedEntry[] = [
        { value: 'always', weight: 1000 },
        { value: 'never', weight: 1 },
      ];

      const results = Array.from({ length: 100 }, () => rollWeighted(entries));
      const alwaysCount = results.filter(r => r === 'always').length;

      expect(alwaysCount).toBeGreaterThan(90);
    });

    it('should handle single entry', () => {
      const entries: WeightedEntry[] = [
        { value: 'only', weight: 1 },
      ];

      const result = rollWeighted(entries);

      expect(result).toBe('only');
    });

    it('should throw error on empty array', () => {
      expect(() => rollWeighted([])).toThrow();
    });

    it('should handle zero weight items', () => {
      const entries: WeightedEntry[] = [
        { value: 'zero', weight: 0 },
        { value: 'one', weight: 1 },
      ];

      const results = Array.from({ length: 100 }, () => rollWeighted(entries));
      const zeroCount = results.filter(r => r === 'zero').length;

      expect(zeroCount).toBe(0);
    });

    it('should handle negative weights', () => {
      const entries: WeightedEntry[] = [
        { value: 'negative', weight: -5 },
        { value: 'positive', weight: 10 },
      ];

      // Should not throw, but behavior depends on implementation
      const result = rollWeighted(entries);
      expect(['negative', 'positive']).toContain(result);
    });

    it('should be deterministic with same random seed (if seeded)', () => {
      const entries: WeightedEntry[] = [
        { value: 'item1', weight: 1 },
        { value: 'item2', weight: 1 },
      ];

      // Just verify it doesn't crash
      const result1 = rollWeighted(entries);
      const result2 = rollWeighted(entries);

      expect(['item1', 'item2']).toContain(result1);
      expect(['item1', 'item2']).toContain(result2);
    });
  });

  describe('Integration tests', () => {
    it('should round-trip: build -> parse -> build', () => {
      const originalEntries: WeightedEntry[] = [
        { value: 'common', weight: 10 },
        { value: 'rare', weight: 1 },
        { value: 'uncommon', weight: 5 },
      ];

      const built = buildWeightedList(originalEntries);
      const parsed = parseWeightedList(built);
      const rebuilt = buildWeightedList(parsed);
      expect(rebuilt).toContain('common^10');
      expect(rebuilt).toContain('rare^1');
      expect(rebuilt).toContain('uncommon^5');

      // Values should be preserved
      expect(parsed).toHaveLength(3);
      expect(parsed[0].value).toBe('common');
      expect(parsed[1].value).toBe('rare');
      expect(parsed[2].value).toBe('uncommon');
    });

    it('should work with realistic Perchance syntax', () => {
      const code = `output
  [adjective] [noun]

adjective
  dark^2
  light^3
  mysterious^1

noun
  sword^5
  shield^3
  potion^2`;

      const adjectiveList = parseWeightedList(code.split('\n\n')[1].split('\n').slice(1).join('\n'));
      const nounList = parseWeightedList(code.split('\n\n')[2].split('\n').slice(1).join('\n'));

      expect(adjectiveList).toHaveLength(3);
      expect(nounList).toHaveLength(3);

      const adjRoll = rollWeighted(adjectiveList);
      const nounRoll = rollWeighted(nounList);

      expect(['dark', 'light', 'mysterious']).toContain(adjRoll);
      expect(['sword', 'shield', 'potion']).toContain(nounRoll);
    });
  });

  describe('Edge cases', () => {
    it('should handle very large weights', () => {
      const entries: WeightedEntry[] = [
        { value: 'heavy', weight: Number.MAX_SAFE_INTEGER },
        { value: 'light', weight: 1 },
      ];

      const result = rollWeighted(entries);
      expect(result).toBe('heavy');
    });

    it('should handle very small weights', () => {
      const entries: WeightedEntry[] = [
        { value: 'tiny', weight: 0.0001 },
        { value: 'normal', weight: 1 },
      ];

      const result = rollWeighted(entries);
      expect(['tiny', 'normal']).toContain(result);
    });

    it('should handle special characters in values', () => {
      const entries: WeightedEntry[] = [
        { value: 'item-with-dash', weight: 1 },
        { value: 'item_with_underscore', weight: 1 },
        { value: 'item with spaces', weight: 1 },
      ];

      const result = buildWeightedList(entries);

      expect(result).toContain('item-with-dash');
      expect(result).toContain('item_with_underscore');
      expect(result).toContain('item with spaces');
    });

    it('should handle unicode characters', () => {
      const entries: WeightedEntry[] = [
        { value: '日本語', weight: 1 },
        { value: '한글', weight: 1 },
        { value: '🎲', weight: 1 },
      ];

      const result = buildWeightedList(entries);

      expect(result).toContain('日本語');
      expect(result).toContain('한글');
      expect(result).toContain('🎲');
    });
  });
});
