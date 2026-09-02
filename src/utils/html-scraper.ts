/**
 * HTML Scraper Utility
 * Lightweight HTML parsing using jsdom.
 * Provides a DOM-like API without launching a full browser (Playwright).
 */

import { JSDOM, VirtualConsole } from 'jsdom';
import type { DOMWindow } from 'jsdom';
import { getOrCompute, apiResponseCache } from './cache.js';
import { fetchHtml } from './html-fetcher.js';
import { extractGeneratorFromDocument, extractDescriptionFromDocument } from './dom-extractor.js';

/**
 * Parse raw HTML into a JSDOM instance with the window and document exposed.
 * Scripts are NOT executed by default (safe, lightweight).
 */
export function parseHtml(html: string, options?: {
  url?: string;
  runScripts?: boolean;
  resources?: boolean;
}): { window: DOMWindow; document: Document; virtualConsole: VirtualConsole } {
  const virtualConsole = new VirtualConsole();

  const dom = new JSDOM(html, {
    url: options?.url || undefined,
    runScripts: options?.runScripts ? 'dangerously' : undefined,
    resources: options?.resources ? 'usable' : undefined,
    virtualConsole,
  });

  return {
    window: dom.window,
    document: dom.window.document,
    virtualConsole,
  };
}

/**
 * Fetch HTML from a URL and parse it with jsdom in one step.
 * Results are cached (TTL: 5 minutes) for repeated scrapes.
 */
export async function fetchAndParseHtml(
  url: string,
  timeoutMs = 20000
): Promise<{ window: DOMWindow; document: Document; virtualConsole: VirtualConsole }> {
  return getOrCompute(
    apiResponseCache,
    `html:${url}`,
    async () => {
      const html = await fetchHtml(url, timeoutMs);
      return parseHtml(html, { url });
    },
    300000,
  );
}

// Re-export fetchHtml and extraction utilities for convenience
export { fetchHtml, extractGeneratorFromDocument, extractDescriptionFromDocument };

/**
 * Extract a generator name from a perchance.org URL.
 * If the input is not a URL, it's returned as-is (treated as a generator name).
 */
export function extractGeneratorNameFromUrl(url: string): string {
  if (url.includes('perchance.org')) {
    const match = url.match(/perchance\.org\/([a-z0-9]+)/i);
    if (match) return match[1];
  }
  return url;
}

/**
 * Fetch raw HTML from the Perchance.org downloadGenerator API.
 * Uses the official API endpoint to avoid Cloudflare challenges.
 */
export async function fetchPerchanceGeneratorHtml(
  generatorName: string,
  timeoutMs = 20000
): Promise<string> {
  const cacheKey = `perchance:${generatorName}`;
  return getOrCompute(
    apiResponseCache,
    cacheKey,
    async () => {
      const cacheBust = Date.now();
      const apiUrl = `https://perchance.org/api/downloadGenerator?generatorName=${generatorName}&__cacheBust=${cacheBust}`;
      return fetchHtml(apiUrl, timeoutMs);
    },
    300000, // 5 min cache
  );
}

/**
 * Fetch and parse a Perchance generator page via the downloadGenerator API.
 * Returns the raw HTML and a parsed jsdom Document.
 */
export async function fetchAndParsePerchanceGenerator(
  generatorName: string,
): Promise<{ html: string; document: Document; generatorName: string }> {
  const html = await fetchPerchanceGeneratorHtml(generatorName);
  const { document } = parseHtml(html, {
    url: `https://perchance.org/${generatorName}`,
  });
  return { html, document, generatorName };
}
