import { parseHtml, fetchAndParseHtml } from '../../src/utils/html-scraper.js';

// Mock jsdom to avoid loading the real package (which has ESM-only deps
// that can't be loaded by Jest's CommonJS runtime).
jest.mock('jsdom', () => {
  const mockDoc = {
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
  };
  const mockWindow = { document: mockDoc };
  return {
    JSDOM: jest.fn().mockImplementation(() => ({
      window: mockWindow,
    })),
    VirtualConsole: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      removeListener: jest.fn(),
    })),
  };
});

// Mock fetchHtml to avoid network calls
jest.mock('../../src/utils/html-fetcher.js', () => ({
  fetchHtml: jest.fn(),
  extractGeneratorFromDocument: jest.fn(),
  extractDescriptionFromDocument: jest.fn(),
}));

import { fetchHtml } from '../../src/utils/html-fetcher.js';
import { JSDOM } from 'jsdom';
import { apiResponseCache } from '../../src/utils/cache.js';

describe('parseHtml', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a JSDOM instance with provided HTML', () => {
    const html = '<html><body><p>hello</p></body></html>';
    const result = parseHtml(html);
    expect(JSDOM).toHaveBeenCalledWith(
      html,
      expect.objectContaining({
        url: undefined,
        runScripts: undefined,
        resources: undefined,
      }),
    );
    expect(result.window).toBeDefined();
    expect(result.document).toBeDefined();
    expect(result.virtualConsole).toBeDefined();
  });

  it('should NOT run scripts by default', () => {
    const html = '<script>alert("xss")</script>';
    parseHtml(html);
    expect(JSDOM).toHaveBeenCalledWith(
      html,
      expect.objectContaining({ runScripts: undefined }),
    );
  });

  it('should run scripts when runScripts option is true', () => {
    const html = '<script>var x = 1</script>';
    parseHtml(html, { runScripts: true });
    expect(JSDOM).toHaveBeenCalledWith(
      html,
      expect.objectContaining({ runScripts: 'dangerously' }),
    );
  });

  it('should enable resources when resources option is true', () => {
    parseHtml('<html></html>', { resources: true });
    expect(JSDOM).toHaveBeenCalledWith(
      '<html></html>',
      expect.objectContaining({ resources: 'usable' }),
    );
  });

  it('should pass URL option', () => {
    parseHtml('<html></html>', { url: 'https://example.com' });
    expect(JSDOM).toHaveBeenCalledWith(
      '<html></html>',
      expect.objectContaining({ url: 'https://example.com' }),
    );
  });
});

describe('fetchAndParseHtml', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiResponseCache.clear();
  });

  it('should fetch HTML and parse it with jsdom', async () => {
    const html = '<html><body>test</body></html>';
    (fetchHtml as jest.Mock).mockResolvedValue(html);

    const result = await fetchAndParseHtml('https://example.com');
    expect(fetchHtml).toHaveBeenCalledWith('https://example.com', 20000);
    expect(JSDOM).toHaveBeenCalledWith(html, expect.objectContaining({
      url: 'https://example.com',
    }));
    expect(result.document).toBeDefined();
  });

  it('should use custom timeout', async () => {
    (fetchHtml as jest.Mock).mockResolvedValue('<html></html>');
    await fetchAndParseHtml('https://example.com', 5000);
    expect(fetchHtml).toHaveBeenCalledWith('https://example.com', 5000);
  });

  it('should propagate fetch errors', async () => {
    (fetchHtml as jest.Mock).mockRejectedValue(new Error('Network failure'));
    await expect(fetchAndParseHtml('https://example.com')).rejects.toThrow('Network failure');
  });
});
