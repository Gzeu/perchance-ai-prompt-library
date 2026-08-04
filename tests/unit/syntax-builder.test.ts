import { SyntaxBuilder, PerchanceItem } from '../../src/core/syntax-builder.js';

describe('Syntax Builder', () => {
  describe('Constructor', () => {
    it('should create builder with title', () => {
      const builder = new SyntaxBuilder('Test Generator');
      const result = builder.build();

      expect(result).toContain('// Test Generator');
    });

    it('should create builder without title', () => {
      const builder = new SyntaxBuilder();
      const result = builder.build();

      expect(result).not.toContain('//');
    });
  });

  describe('addList', () => {
    it('should add simple list', () => {
      const builder = new SyntaxBuilder();
      builder.addList('testList', [{ value: 'item1' }, { value: 'item2' }]);

      const result = builder.build();

      expect(result).toContain('testList');
      expect(result).toContain('item1');
      expect(result).toContain('item2');
    });

    it('should add list with weights', () => {
      const builder = new SyntaxBuilder();
      builder.addList('weightedList', [
        { value: 'rare', weight: 1 },
        { value: 'common', weight: 10 },
      ]);

      const result = builder.build();

      expect(result).toContain('rare^1');
      expect(result).toContain('common^10');
    });

    it('should mark list as output', () => {
      const builder = new SyntaxBuilder();
      builder.addList('output', [{ value: 'test' }], true);

      const result = builder.build();

      // Output list should come first
      const lines = result.split('\n');
      const outputIndex = lines.findIndex(line => line.trim() === 'output');
      expect(outputIndex).toBe(0);
    });

    it('should chain multiple list additions', () => {
      const builder = new SyntaxBuilder();
      const result = builder
        .addList('list1', [{ value: 'item1' }])
        .addList('list2', [{ value: 'item2' }])
        .build();

      expect(result).toContain('list1');
      expect(result).toContain('list2');
    });
  });

  describe('addSimpleList', () => {
    it('should add list from string array', () => {
      const builder = new SyntaxBuilder();
      builder.addSimpleList('simpleList', ['item1', 'item2', 'item3']);

      const result = builder.build();

      expect(result).toContain('simpleList');
      expect(result).toContain('item1');
      expect(result).toContain('item2');
      expect(result).toContain('item3');
    });

    it('should handle empty array', () => {
      const builder = new SyntaxBuilder();
      builder.addSimpleList('emptyList', []);

      const result = builder.build();

      expect(result).toContain('emptyList');
    });
  });

  describe('addWeightedList', () => {
    it('should add list from object with weights', () => {
      const builder = new SyntaxBuilder();
      builder.addWeightedList('weighted', {
        rare: 1,
        uncommon: 5,
        common: 10,
      });

      const result = builder.build();

      expect(result).toContain('rare^1');
      expect(result).toContain('uncommon^5');
      expect(result).toContain('common^10');
    });

    it('should handle empty object', () => {
      const builder = new SyntaxBuilder();
      builder.addWeightedList('empty', {});

      const result = builder.build();

      expect(result).toContain('empty');
    });
  });

  describe('addImport', () => {
    it('should add import statement', () => {
      const builder = new SyntaxBuilder();
      builder.addImport('someGenerator');
      builder.addList('output', [{ value: 'test' }]);

      const result = builder.build();

      expect(result).toContain('import someGenerator');
      // Import should come before lists
      const importIndex = result.indexOf('import');
      const listIndex = result.indexOf('output');
      expect(importIndex).toBeLessThan(listIndex);
    });

    it('should handle multiple imports', () => {
      const builder = new SyntaxBuilder();
      builder.addImport('generator1');
      builder.addImport('generator2');
      builder.addList('output', [{ value: 'test' }]);

      const result = builder.build();

      expect(result).toContain('import generator1');
      expect(result).toContain('import generator2');
    });
  });

  describe('build', () => {
    it('should produce valid Perchance syntax', () => {
      const builder = new SyntaxBuilder('Test Generator');
      builder
        .addList('output', [{ value: '[adjective] [noun]' }], true)
        .addSimpleList('adjective', ['dark', 'light', 'mysterious'])
        .addSimpleList('noun', ['sword', 'shield', 'potion']);

      const result = builder.build();

      expect(result).toContain('// Test Generator');
      expect(result).toContain('output');
      expect(result).toContain('[adjective] [noun]');
      expect(result).toContain('adjective');
      expect(result).toContain('noun');
    });

    it('should handle weight of 1 (should not display)', () => {
      const builder = new SyntaxBuilder();
      builder.addList('test', [{ value: 'item', weight: 1 }]);

      const result = builder.build();

      expect(result).toContain('item');
      expect(result).not.toContain('item^1');
    });

    it('should handle weight not equal to 1', () => {
      const builder = new SyntaxBuilder();
      builder.addList('test', [{ value: 'item', weight: 5 }]);

      const result = builder.build();

      expect(result).toContain('item^5');
    });

    it('should produce properly indented output', () => {
      const builder = new SyntaxBuilder();
      builder.addList('testList', [{ value: 'item1' }, { value: 'item2' }]);

      const result = builder.build();

      const lines = result.split('\n');
      const itemLines = lines.filter(line => line.trim().startsWith('item'));
      itemLines.forEach(line => {
        expect(line).toMatch(/^  /); // Should start with 2 spaces
      });
    });

    it('should trim trailing whitespace', () => {
      const builder = new SyntaxBuilder();
      builder.addList('test', [{ value: 'item' }]);

      const result = builder.build();

      expect(result).not.toMatch(/\n$/); // Should not end with newline
      expect(result).not.toMatch(/ +$/); // Should not have trailing spaces
    });

    it('should handle complex generator with all features', () => {
      const builder = new SyntaxBuilder('Complex Generator');
      builder
        .addImport('externalGenerator')
        .addList('output', [{ value: '[type] of [element]' }], true)
        .addSimpleList('type', ['Sword', 'Shield', 'Staff'])
        .addWeightedList('element', {
          Fire: 5,
          Ice: 5,
          Lightning: 3,
          Void: 1,
        });

      const result = builder.build();

      expect(result).toContain('// Complex Generator');
      expect(result).toContain('import externalGenerator');
      expect(result).toContain('output');
      expect(result).toContain('[type] of [element]');
      expect(result).toContain('Fire^5');
      expect(result).toContain('Void^1');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty builder', () => {
      const builder = new SyntaxBuilder();
      const result = builder.build();

      expect(result).toBe('');
    });

    it('should handle list with special characters', () => {
      const builder = new SyntaxBuilder();
      builder.addSimpleList('special', ['item-with-dash', 'item_with_underscore', 'item with spaces']);

      const result = builder.build();

      expect(result).toContain('item-with-dash');
      expect(result).toContain('item_with_underscore');
      expect(result).toContain('item with spaces');
    });

    it('should handle very long item names', () => {
      const longItem = 'a'.repeat(1000);
      const builder = new SyntaxBuilder();
      builder.addSimpleList('long', [longItem]);

      const result = builder.build();

      expect(result).toContain(longItem);
    });

    it('should handle unicode characters', () => {
      const builder = new SyntaxBuilder();
      builder.addSimpleList('unicode', ['日本語', '한글', 'العربية', '🎲']);

      const result = builder.build();

      expect(result).toContain('日本語');
      expect(result).toContain('한글');
      expect(result).toContain('العربية');
      expect(result).toContain('🎲');
    });
  });
});
