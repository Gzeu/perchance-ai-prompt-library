/**
 * Perchance Scraper
 * Scrapes existing public Perchance.ai generators to extract their source code.
 * Uses the lightweight downloadGenerator API + jsdom parsing as the primary
 * method (no browser required). Falls back to full Playwright browser for
 * edge cases where the API doesn't return the expected structure.
 */

import { PerchanceBrowser } from './perchance-browser.js';
import {
  extractGeneratorNameFromUrl,
  fetchAndParsePerchanceGenerator,
  extractGeneratorFromDocument,
  extractDescriptionFromDocument,
} from '../utils/html-scraper.js';

export interface ScrapedGenerator {
  url: string;
  name: string;
  code: string;
  description?: string;
  tags?: string[];
  scrapedAt: string;
}

/**
 * Scrape a generator using the perchance.org downloadGenerator API + jsdom.
 * Lightweight — no browser needed. The API returns HTML with the full
 * generator code embedded in a <script id="preloaded-generator-data"> element.
 */
export async function scrapeGeneratorWithJsdom(url: string): Promise<ScrapedGenerator> {
  let generatorName: string | null;

  if (url.includes('perchance.org')) {
    generatorName = extractGeneratorNameFromUrl(url);
    if (!generatorName) {
      throw new Error('Could not extract generator name from URL');
    }
  } else {
    // Treat the input as a generator name directly
    generatorName = url;
  }

  const { document } = await fetchAndParsePerchanceGenerator(generatorName);

  const { code, description: docDescription } = extractGeneratorFromDocument(document);
  const metaDescription = extractDescriptionFromDocument(document);
  const description = docDescription || metaDescription;

  return {
    url,
    name: generatorName,
    code: code || '// Could not extract source code (try Playwright fallback)',
    description: description || undefined,
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Scrape a generator using Playwright (full browser, JS execution).
 * Used as a fallback when the jsdom/API approach fails.
 */
export async function scrapeGeneratorWithPlaywright(
  url: string,
  headless = true,
): Promise<ScrapedGenerator> {
  let generatorName: string;
  let fullUrl: string;

  if (url.includes('perchance.org')) {
    generatorName = extractGeneratorNameFromUrl(url) || url.split('/').filter(Boolean).pop() || 'unknown';
    fullUrl = url;
  } else {
    generatorName = url;
    fullUrl = `https://perchance.org/${url}`;
  }
  const browser = new PerchanceBrowser();
  await browser.launch(headless);
  const page = await browser.newPage();

  try {
    await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const name = generatorName;

    const code = await page.evaluate(() => {
      // Method 1: look for code textarea
      const textarea = document.querySelector(
        'textarea#generator-code, textarea.code-editor',
      ) as HTMLTextAreaElement | null;
      if (textarea?.value) return textarea.value;

      // Method 2: look for #preloaded-generator-data (perchance.org download API format)
      const dataScript = document.querySelector('script#preloaded-generator-data') as HTMLScriptElement | null;
      if (dataScript?.textContent) {
        try {
          const data = JSON.parse(dataScript.textContent.trim());
          if (data.modelText) return data.modelText;
        } catch {}
      }

      // Method 3: look for script tags with generatorCode variable
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const script of scripts) {
        if (script.textContent?.includes('generatorCode')) {
          const match = script.textContent.match(/generatorCode\s*=\s*[`'"]([\s\S]*?)[`'"]/);
          if (match) return match[1];
        }
      }

      // Method 4: look for pre/code blocks
      const pre = document.querySelector('pre.generator-source, code.perchance-code');
      if (pre?.textContent) return pre.textContent;

      return null;
    });

    const description = await page.evaluate(() => {
      const el = document.querySelector(
        'meta[name="description"]',
      ) as HTMLMetaElement | null;
      return el?.content || undefined;
    });

    await browser.close();

    return {
      url,
      name,
      code: code || '// Could not extract source code automatically',
      description,
      scrapedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    await browser.close();
    throw new Error(`Scraping failed: ${err.message}`);
  }
}

/**
 * Scrape a generator — tries the lightweight jsdom/API method first,
 * falls back to full Playwright browser for edge cases.
 */
export async function scrapeGenerator(
  url: string,
  options?: { headless?: boolean },
): Promise<ScrapedGenerator> {
  // Attempt lightweight jsdom scrape (via downloadGenerator API) first
  const jsdomResult = await scrapeGeneratorWithJsdom(url).catch(() => null);

  if (jsdomResult && jsdomResult.code && !jsdomResult.code.startsWith('// Could not extract')) {
    return jsdomResult;
  }

  return scrapeGeneratorWithPlaywright(url, options?.headless);
}

export async function scrapeMultiple(urls: string[]): Promise<ScrapedGenerator[]> {
  const results: ScrapedGenerator[] = [];
  for (const url of urls) {
    try {
      const result = await scrapeGenerator(url);
      results.push(result);
    } catch {
      results.push({ url, name: 'error', code: '', scrapedAt: new Date().toISOString() });
    }
  }
  return results;
}

// Re-export shared extraction utilities for testing and reuse
export { extractGeneratorFromDocument, extractDescriptionFromDocument };
