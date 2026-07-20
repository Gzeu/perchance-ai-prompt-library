/**
 * MCP Tool: run_on_perchance
 * Uses Playwright to load generator code on perchance.ai and capture results
 */

import type { PlaywrightRunOptions, PlaywrightRunResult } from '../../types/perchance.js';

export const playwrightTool = {
  schema: {
    name: 'run_on_perchance',
    description:
      'Load .perchance generator code on perchance.ai using a real browser (Playwright) and return generated results. Use for final testing before sharing.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The .perchance generator code to run',
        },
        rolls: {
          type: 'number',
          description: 'How many results to generate (default: 10)',
          default: 10,
        },
        screenshot: {
          type: 'boolean',
          description: 'Capture a screenshot of the results (default: false)',
          default: false,
        },
        scrapeUrl: {
          type: 'string',
          description: 'Optional: scrape an existing public perchance.ai generator URL instead of running custom code',
        },
      },
      required: ['code'],
    },
  },

  handler: async (args: Record<string, unknown>): Promise<{ content: Array<{ type: string; text: string }> }> => {
    const options: PlaywrightRunOptions = {
      code: args.code as string,
      rolls: (args.rolls as number) || 10,
      headless: true,
      screenshot: (args.screenshot as boolean) || false,
      timeout: 30000,
    };

    try {
      // Dynamic import so Playwright is optional
      const { runOnPerchance } = await import('../../playwright/roller.js');
      const result: PlaywrightRunResult = await runOnPerchance(options);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: !result.error,
            results: result.results,
            count: result.results.length,
            screenshot: result.screenshot ? '[base64 PNG attached]' : undefined,
            error: result.error,
            tip: 'Paste your code at https://perchance.ai/tools/generate to use it live',
          }, null, 2),
        }],
      };
    } catch (err: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: `Playwright not available: ${err.message}. Install with: npm install playwright && npx playwright install chromium`,
            fallback: 'Use preview_rolls tool for local preview without a browser',
          }, null, 2),
        }],
      };
    }
  },
};
