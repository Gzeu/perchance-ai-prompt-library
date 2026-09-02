import {
  extractGeneratorFromDocument,
  extractDescriptionFromDocument,
} from '../../src/utils/dom-extractor.js';

/**
 * Build a minimal mock Document for testing extraction logic.
 * Supports querySelector / querySelectorAll with CSS selector keys.
 */
function mockDocument(elements: Record<string, { value?: string; textContent?: string; content?: string }>): Document {
  return {
    querySelector: (selector: string) => {
      // Exact match first
      if (elements[selector]) return elements[selector];
      // Then substring match (e.g. "textarea#generator-code, textarea.code-editor" contains "textarea#generator-code")
      for (const sel of Object.keys(elements)) {
        if (selector.includes(sel) || sel.includes(selector)) {
          return elements[sel];
        }
      }
      return null;
    },
    querySelectorAll: (selector: string) => {
      if (selector === 'script') {
        return Object.entries(elements)
          .filter(([sel]) => sel.startsWith('script'))
          .map(([, el]) => el) as any;
      }
      return [] as any;
    },
  } as Document;
}

describe('dom-extractor — extractGeneratorFromDocument', () => {
  it('extracts code from textarea#generator-code', () => {
    const doc = mockDocument({
      '#generator-code': { value: 'output\n  hello\n  world' },
    });
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBe('output\n  hello\n  world');
  });

  it('extracts code from textarea.code-editor', () => {
    const doc = mockDocument({
      '.code-editor': { value: 'output\n  editorContent' },
    });
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBe('output\n  editorContent');
  });

  it('extracts code from script tag with generatorCode variable', () => {
    const code = 'output\n  item1\n  item2';
    const doc = mockDocument({
      'script': { textContent: `var generatorCode = \`${code}\`;` },
    });
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBe(code);
  });

  it('extracts code from pre.generator-source', () => {
    const doc = mockDocument({
      '.generator-source': { textContent: 'output\n  preBlock' },
    });
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBe('output\n  preBlock');
  });

  it('extracts code from code.perchance-code', () => {
    const doc = mockDocument({
      '.perchance-code': { textContent: 'output\n  codeBlock' },
    });
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBe('output\n  codeBlock');
  });

  it('returns null when no code element is found', () => {
    const doc = mockDocument({});
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBeNull();
  });

  it('prefers textarea over script and pre', () => {
    const doc = mockDocument({
      '#generator-code': { value: 'fromTextarea' },
      'script': { textContent: 'var generatorCode = "fromScript"' },
      '.generator-source': { textContent: 'fromPre' },
    });
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBe('fromTextarea');
  });

  it('extracts code from script#preloaded-generator-data (perchance.org API format)', () => {
    const code = 'output\n  item1\n  item2';
    const jsonData = JSON.stringify({
      name: 'test-gen',
      modelText: code,
      outputTemplate: '<p>{output}</p>',
    });
    const doc = mockDocument({
      'script#preloaded-generator-data': { textContent: jsonData },
    });
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBe(code);
    expect(result.description).toBeNull();
  });

  it('extracts description from preloaded-generator-data when code has no description', () => {
    const code = 'output\n  hello';
    const jsonData = JSON.stringify({
      name: 'test-gen',
      modelText: code,
      description: 'A test generator description',
    });
    const doc = mockDocument({
      'script#preloaded-generator-data': { textContent: jsonData },
    });
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBe(code);
    expect(result.description).toBe('A test generator description');
  });

  it('falls through to generatorCode script when preloaded data has no modelText', () => {
    const doc = mockDocument({
      'script#preloaded-generator-data': { textContent: '{"name":"test"}' },
      'script': { textContent: 'var generatorCode = "fallback"' },
    });
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBe('fallback');
  });
});

describe('dom-extractor — extractDescriptionFromDocument', () => {
  it('extracts meta description content', () => {
    const doc = mockDocument({
      'meta[name="description"]': { content: 'A fantasy name generator' },
    });
    expect(extractDescriptionFromDocument(doc)).toBe('A fantasy name generator');
  });

  it('returns null when no meta description', () => {
    const doc = mockDocument({});
    expect(extractDescriptionFromDocument(doc)).toBeNull();
  });
});
