/**
 * HTML Scraper Utility
 * Lightweight HTML fetching and parsing using jsdom.
 * Provides a DOM-like API without launching a full browser (Playwright).
 */

import { JSDOM, VirtualConsole } from 'jsdom';
import type { DOMWindow } from 'jsdom';
import { getOrCompute, apiResponseCache } from './cache.js';
import { extractGeneratorFromDocument, extractDescriptionFromDocument } from './dom-extractor.js';

const DEFAULT_TIMEOUT_MS = 20000;
const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/120.0.0.0 Safari/537.36';

/**
 * Fetch raw HTML from a URL with a timeout and default user-agent.
 */
export async function fetchHtml(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'User-Agent': DEFAULT_UA },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} for ${url}`);
  }

  return response.text();
}

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
  timeoutMs = DEFAULT_TIMEOUT_MS
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

/**
 * Extract the generator name from a perchance.org URL.
 * e.g. https://perchance.org/fdqirttayk → "fdqirttayk"
 * e.g. https://perchance.org/abc123#edit → "abc123"
 */
export function extractGeneratorNameFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith('perchance.org')) return null;
    return parsed.pathname.split('/').filter(Boolean).pop() || null;
  } catch {
    return null;
  }
}

/**
 * Fetch a perchance.org generator page via the official downloadGenerator API.
 * This returns HTML with the full generator code embedded in a
 * <script id="preloaded-generator-data" type="notjs"> element, which jsdom
 * can parse without executing scripts.
 * Uses a cache-busting parameter to get fresh data when needed.
 */
export async function fetchPerchanceGeneratorHtml(
  generatorName: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<string> {
  const url = `https://perchance.org/api/downloadGenerator?generatorName=${encodeURIComponent(generatorName)}&__cacheBust=${Math.random()}`;
  return fetchHtml(url, timeoutMs);
}

/**
 * Fetch and parse a perchance.org generator via the downloadGenerator API.
 * Uses jsdom to parse the HTML and make the #preloaded-generator-data script
 * element available for extraction (no script execution needed).
 */
export async function fetchAndParsePerchanceGenerator(
  generatorName: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<{ window: DOMWindow; document: Document; virtualConsole: VirtualConsole }> {
  const cacheKey = `perchance:${generatorName}`;
  return getOrCompute(
    apiResponseCache,
    cacheKey,
    async () => {
      const html = await fetchPerchanceGeneratorHtml(generatorName, timeoutMs);
      return parseHtml(html, { url: `https://perchance.org/${generatorName}` });
    },
    300000,
  );
}

// Re-export extraction utilities for convenience
export { extractGeneratorFromDocument, extractDescriptionFromDocument };
