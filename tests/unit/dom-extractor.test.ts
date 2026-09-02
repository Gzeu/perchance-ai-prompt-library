import { extractGeneratorFromDocument, extractDescriptionFromDocument } from '../../src/utils/dom-extractor.js';

/**
 * Lightweight mock DOM builder for testing extraction logic.
 * Mimics the subset of the Document API used by the extractor.
 */
function mockElement(props: Partial<{
  value: string;
  textContent: string;
  content: string;
}> = {}) {
  return {
    value: props.value ?? '',
    textContent: props.textContent ?? '',
    content: props.content ?? '',
  };
}

function mockDocument(elements: Record<string, { el: any; all?: any[] }>) {
  return {
    querySelector: (selector: string) => {
      if (elements[selector]?.el) return elements[selector].el;
      // Also support matching by partial selector
      for (const [sel, entry] of Object.entries(elements)) {
        if (selector.includes(sel)) return entry.el;
      }
      return null;
    },
    querySelectorAll: (selector: string) => {
      if (elements[selector]?.all) return elements[selector].all;
      // Fallback: return empty
      for (const [sel, entry] of Object.entries(elements)) {
        if (selector.includes(sel) && entry.all) return entry.all;
      }
      return [];
    },
  } as unknown as Document;
}

describe('extractGeneratorFromDocument', () => {
  it('should extract from textarea#generator-code', () => {
    const doc = mockDocument({
      'textarea#generator-code': {
        el: mockElement({ value: 'output\n  hello world' }),
      },
    });
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBe('output\n  hello world');
    expect(result.description).toBeNull();
  });

  it('should extract from textarea.code-editor', () => {
    const doc = mockDocument({
      'textarea.code-editor': {
        el: mockElement({ value: 'output\n  test code' }),
      },
    });
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBe('output\n  test code');
  });

  it('should extract from generatorCode script variable', () => {
    const doc = mockDocument({
      'script': {
        el: null,
        all: [
          mockElement({
            textContent: 'var generatorCode = "output\\n  hello";',
          }),
        ],
      },
    });
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toContain('hello');
  });

  it('should extract from pre.generator-source', () => {
    const doc = mockDocument({
      'pre.generator-source': {
        el: mockElement({ textContent: 'output\n  from pre block' }),
      },
    });
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBe('output\n  from pre block');
  });

  it('should extract from code.perchance-code', () => {
    const doc = mockDocument({
      'code.perchance-code': {
        el: mockElement({ textContent: 'output\n  from code block' }),
      },
    });
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBe('output\n  from code block');
  });

  it('should return null when no generator code is found', () => {
    const doc = mockDocument({});
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBeNull();
    expect(result.description).toBeNull();
  });

  it('should handle empty textarea value', () => {
    const doc = mockDocument({
      'textarea#generator-code': {
        el: mockElement({ value: '' }),
      },
    });
    const result = extractGeneratorFromDocument(doc);
    // Empty value should fall through to other methods
    expect(result.code).toBeNull();
  });

  it('should prefer textarea over script tags', () => {
    const doc = mockDocument({
      'textarea#generator-code': {
        el: mockElement({ value: 'from textarea' }),
      },
      'script': {
        el: null,
        all: [mockElement({ textContent: 'generatorCode = "from script"' })],
      },
    });
    const result = extractGeneratorFromDocument(doc);
    expect(result.code).toBe('from textarea');
  });
});

describe('extractDescriptionFromDocument', () => {
  it('should extract meta description content', () => {
    const doc = mockDocument({
      'meta[name="description"]': {
        el: mockElement({ content: 'A test generator description' }),
      },
    });
    const result = extractDescriptionFromDocument(doc);
    expect(result).toBe('A test generator description');
  });

  it('should return null when no description meta tag is found', () => {
    const doc = mockDocument({});
    const result = extractDescriptionFromDocument(doc);
    expect(result).toBeNull();
  });

  it('should return null when description content is empty', () => {
    const doc = mockDocument({
      'meta[name="description"]': {
        el: mockElement({ content: '' }),
      },
    });
    const result = extractDescriptionFromDocument(doc);
    expect(result).toBeNull();
  });
});
