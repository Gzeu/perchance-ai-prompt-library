/**
 * Perchance Scraper
 * Scrapes existing public Perchance.ai generators to extract their source code
 * Useful for cloning, studying, and adapting popular generators
 */

import { PerchanceBrowser } from './perchance-browser.js';

export interface ScrapedGenerator {
  url: string;
  name: string;
  code: string;
  description?: string;
  tags?: string[];
  scrapedAt: string;
}

export async function scrapeGenerator(
  url: string,
  headless = true
): Promise<ScrapedGenerator> {
  if (!url.includes('perchance.ai')) {
    throw new Error('Only perchance.ai URLs are supported');
  }

  const browser = new PerchanceBrowser();
  await browser.launch(headless);
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });

    // Extract generator name from URL slug
    const name = url.split('/').filter(Boolean).pop() || 'unknown';

    // Try to get the source code (usually in a hidden textarea or script)
    const code = await page.evaluate(() => {
      // Method 1: look for code textarea
      const textarea = document.querySelector('textarea#generator-code, textarea.code-editor') as HTMLTextAreaElement;
      if (textarea?.value) return textarea.value;

      // Method 2: look for script tags with generator data
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const script of scripts) {
        if (script.textContent?.includes('generatorCode')) {
          const match = script.textContent.match(/generatorCode\s*=\s*[`'"]([\s\S]*?)[`'"]/);
          if (match) return match[1];
        }
      }

      // Method 3: look for pre/code blocks
      const pre = document.querySelector('pre.generator-source, code.perchance-code');
      if (pre?.textContent) return pre.textContent;

      return null;
    });

    // Get description if available
    const description = await page.evaluate(() => {
      const el = document.querySelector('meta[name="description"]') as HTMLMetaElement;
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

export async function scrapeMultiple(urls: string[]): Promise<ScrapedGenerator[]> {
  const results: ScrapedGenerator[] = [];
  for (const url of urls) {
    try {
      const result = await scrapeGenerator(url);
      results.push(result);
    } catch (err: any) {
      results.push({ url, name: 'error', code: '', scrapedAt: new Date().toISOString() });
    }
  }
  return results;
}
