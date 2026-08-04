import { z } from 'zod';
import { runWithPlaywright } from '../playwright/cloud-adapter.js';

export const playwrightToolSchema = z.object({
  code: z.string().min(1).describe('.perchance source code to run'),
  rolls: z.number().int().min(1).max(100).default(10).describe('Number of rolls'),
  screenshot: z.boolean().default(false).describe('Save a screenshot'),
});

export type PlaywrightToolInput = z.infer<typeof playwrightToolSchema>;

export async function runOnPerchanceTool(input: PlaywrightToolInput) {
  const { code, rolls, screenshot } = playwrightToolSchema.parse(input);

  const result = await runWithPlaywright(code, rolls, screenshot);

  return {
    mode: result.mode,
    rolls: result.rolls,
    count: result.rolls.length,
    has_screenshot: !!result.screenshot,
    note:
      result.mode === 'fallback'
        ? 'Playwright not installed — results generated locally. Set PERCHANCE_CLOUD_MODE=true and install playwright for live browser execution.'
        : `Executed live on perchance.ai via Playwright (${result.mode === 'browser' && process.env.PERCHANCE_CLOUD_MODE ? 'cloud mode' : 'local mode'}).`,
  };
}
