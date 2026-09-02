/**
 * Tests for html-scraper utility.
 * jsdom cannot be loaded directly in Jest due to its ESM-only transitive
 * dependencies, so we mock the jsdom module with a minimal DOM implementation.
 * We test parseHtml, fetchHtml, fetchAndParseHtml, and the re-exported
 * extraction functions — all from src/utils/html-scraper.ts (no playwright
 * import chain).
 */

// Mock jsdom with a lightweight DOM that supports the extraction queries
jest.mock('jsdom', () => {
  function createDocument(html: string): Document {
    const elements: Record<string, any> = {};
    const scripts: any[] = [];

    const textareaIdMatch = html.match(/<textarea[^>]*id=["']([^"']*)["'][^>]*>([\s\S]*?)<\/textarea>/i);
    if (textareaIdMatch) {
      elements[`#${textareaIdMatch[1]}`] = { value: textareaIdMatch[2] };
    }

    const textareaClassMatch = html.match(/<textarea[^>]*class=["']([^"']*)["'][^>]*>([\s\S]*?)<\/textarea>/i);
    if (textareaClassMatch) {
      const cls = textareaClassMatch[1].split(/\s/)[0];
      elements[`.${cls}`] = { value: textareaClassMatch[2] };
    }

    const scriptMatches = html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    for (const m of scriptMatches) {
      const tag = m[0];
      const content = m[1];
      scripts.push({ textContent: content });
      // Also capture scripts with id attribute
      const idMatch = tag.match(/id=["']([^"']*)["']/i);
      if (idMatch) {
        elements[`script#${idMatch[1]}`] = { textContent: content };
      }
    }

    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    if (metaMatch) {
      elements['meta[name="description"]'] = { content: metaMatch[1] };
    }
    const metaMatch2 = html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
    if (metaMatch2) {
      elements['meta[name="description"]'] = { content: metaMatch2[1] };
    }

    const preMatch = html.match(/<pre[^>]*class=["']([^"']*)["'][^>]*>([\s\S]*?)<\/pre>/i);
    if (preMatch) {
      elements[`.${preMatch[1].split(/\s/)[0]}`] = { textContent: preMatch[2] };
    }

    const codeMatch = html.match(/<code[^>]*class=["']([^"']*)["'][^>]*>([\s\S]*?)<\/code>/i);
    if (codeMatch) {
      elements[`.${codeMatch[1].split(/\s/)[0]}`] = { textContent: codeMatch[2] };
    }

    return {
      querySelector: (selector: string): any => {
        for (const [sel, el] of Object.entries(elements)) {
          if (selector.includes(sel) || sel.includes(selector.replace(/,.*/, '').trim())) {
            return el;
          }
        }
        return null;
      },
      querySelectorAll: (selector: string): any => {
        if (selector === 'script') return scripts;
        return [];
      },
    } as Document;
  }

  class MockJSDOM {
    window: any;
    constructor(html: string, _options?: any) {
      this.window = { document: createDocument(html) };
    }
  }

  class MockVirtualConsole {
    // Minimal mock — VirtualConsole methods are jest fns
  }

  return { JSDOM: MockJSDOM, VirtualConsole: MockVirtualConsole };
});

import {
  parseHtml,
  fetchHtml,
  fetchAndParseHtml,
  extractGeneratorNameFromUrl,
  extractGeneratorFromDocument,
  extractDescriptionFromDocument,
} from '../../src/utils/html-scraper.js';
import { apiResponseCache } from '../../src/utils/cache.js';

describe('html-scraper — parseHtml', () => {
  it('parses HTML and returns a document with working querySelector', () => {
    const { document } = parseHtml('<textarea id="generator-code">output\n  hi</textarea>');
    const el = document.querySelector('textarea#generator-code') as any;
    expect(el?.value).toBe('output\n  hi');
  });

  it('returns a window and virtualConsole', () => {
    const { window, virtualConsole } = parseHtml('<html></html>');
    expect(window).toBeDefined();
    expect(virtualConsole).toBeDefined();
  });
});

describe('html-scraper — fetchHtml (mocked fetch)', () => {
  const ORIGINAL_FETCH = global.fetch;

  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
  });

  it('fetches and returns HTML text', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<html><body>content</body></html>'),
    }) as any;

    const html = await fetchHtml('https://perchance.org/test');
    expect(html).toBe('<html><body>content</body></html>');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://perchance.org/test',
      expect.objectContaining({
        headers: { 'User-Agent': expect.any(String) },
      }),
    );
  });

  it('throws on non-OK HTTP response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    }) as any;

    await expect(fetchHtml('https://perchance.org/missing')).rejects.toThrow('HTTP 404');
  });
});

describe('html-scraper — fetchAndParseHtml', () => {
  const ORIGINAL_FETCH = global.fetch;

  beforeEach(() => {
    apiResponseCache.clear();
  });

  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
    apiResponseCache.clear();
  });

  it('fetches HTML then parses it into a document', async () => {
    const fakeHtml =
      '<html><head><meta name="description" content="Desc here"></head>' +
      '<body><textarea id="generator-code">output\n  hello</textarea></body></html>';

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(fakeHtml),
    }) as any;

    const { document } = await fetchAndParseHtml('https://perchance.org/gen1');
    expect(extractGeneratorFromDocument(document).code).toBe('output\n  hello');
    expect(extractDescriptionFromDocument(document)).toBe('Desc here');
  });

  it('caches results to avoid re-fetching', async () => {
    const fakeHtml = '<html><body><textarea id="generator-code">cached</textarea></body></html>';

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(fakeHtml),
    }) as any;

    const url = 'https://perchance.org/cached-gen';
    await fetchAndParseHtml(url);
    await fetchAndParseHtml(url);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('html-scraper — extractGeneratorNameFromUrl', () => {
  it('extracts generator name from a simple perchance.org URL', () => {
    expect(extractGeneratorNameFromUrl('https://perchance.org/fdqirttayk')).toBe('fdqirttayk');
  });

  it('extracts generator name from a URL with hash', () => {
    expect(extractGeneratorNameFromUrl('https://perchance.org/fdqirttayk#edit')).toBe('fdqirttayk');
  });

  it('extracts generator name from a URL with trailing slash', () => {
    expect(extractGeneratorNameFromUrl('https://perchance.org/fdqirttayk/')).toBe('fdqirttayk');
  });

  it('returns null for non-perchance URLs', () => {
    expect(extractGeneratorNameFromUrl('https://example.com/gen')).toBeNull();
  });

  it('returns null for invalid URLs', () => {
    expect(extractGeneratorNameFromUrl('not-a-url')).toBeNull();
  });
});

describe('html-scraper — parseHtml with preloaded-generator-data (perchance.org API format)', () => {
  it('extracts modelText from #preloaded-generator-data script', () => {
    const code = 'output\n  item1\n  item2';
    const jsonData = JSON.stringify({ name: 'test', modelText: code });
    const html = `<script id="preloaded-generator-data" type="notjs">${jsonData}</script>`;

    const { document } = parseHtml(html);
    const result = extractGeneratorFromDocument(document);
    expect(result.code).toBe(code);
  });
});
