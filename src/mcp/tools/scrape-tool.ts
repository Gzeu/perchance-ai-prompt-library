/**
 * MCP Tool: scrape_generator
 * Scrapes a public perchance.org generator and returns its full source code,
 * extracted via lightweight jsdom parsing (no browser required in most cases).
 */

import { scrapeGenerator } from '../../playwright/scraper.js';
import { validatePerchance } from '../../core/validator.js';
import { previewRolls } from '../../core/exporter.js';

export const scrapeGeneratorTool = {
  schema: {
    name: 'scrape_generator',
    description:
      'Scrape a public perchance.org generator and extract its full source code. Uses lightweight jsdom parsing first (no browser needed); falls back to Playwright for JS-rendered pages.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The perchance.org generator URL to scrape (e.g. https://perchance.org/fdqirttayk)',
        },
        previewCount: {
          type: 'number',
          description: 'Generate local preview rolls after scraping (default: 8)',
          default: 8,
        },
      },
      required: ['url'],
    },
  },

  handler: async (args: Record<string, unknown>) => {
    const url = args.url as string;
    const previewCount = (args.previewCount as number) || 8;

    try {
      const scraped = await scrapeGenerator(url);

      const validation = validatePerchance(scraped.code);
      const preview = previewRolls(scraped.code, previewCount);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            url,
            name: scraped.name,
            code: scraped.code,
            description: scraped.description,
            scrapedAt: scraped.scrapedAt,
            stats: validation.stats,
            valid: validation.valid,
            preview,
            previewCount: preview.length,
            tip: 'You can run this generator locally with perchance-gen preview or inject the code at https://perchance.org/minimal#edit',
          }, null, 2),
        }],
      };
    } catch (err: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            url,
            error: err.message,
            suggestion: 'Ensure the URL is a valid public perchance.org generator. If it requires JavaScript rendering, install Playwright: npm install playwright && npx playwright install chromium',
          }, null, 2),
        }],
      };
    }
  },
};
