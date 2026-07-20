/**
 * Perchance Roller
 * Clicks generate button and captures results from perchance.ai
 */

import { Page } from 'playwright';
import { PerchanceBrowser } from './perchance-browser.js';
import { injectGeneratorCode } from './loader.js';
import type { PlaywrightRunOptions, PlaywrightRunResult } from '../types/perchance.js';

export async function runOnPerchance(options: PlaywrightRunOptions): Promise<PlaywrightRunResult> {
  const {
    code,
    rolls = 10,
    headless = true,
    screenshot = false,
    timeout = 30000,
  } = options;

  const browser = new PerchanceBrowser();
  await browser.launch(headless);
  const page = await browser.newPage();

  try {
    await injectGeneratorCode(page, code, timeout);

    const results: string[] = [];

    for (let i = 0; i < rolls; i++) {
      // Click the generate/roll button
      await page.click(
        'button.generate-btn, button[id*="generate"], button:has-text("Generate"), button:has-text("Roll")',
        { timeout: 5000 }
      ).catch(() => {});

      await page.waitForTimeout(300);

      // Capture the latest output
      const output = await page.evaluate(() => {
        const el =
          document.querySelector('.output-text')
          || document.querySelector('#output')
          || document.querySelector('.result')
          || document.querySelector('[data-output]');
        return el?.textContent?.trim() || null;
      });

      if (output && !results.includes(output)) {
        results.push(output);
      }
    }

    let screenshotB64: string | undefined;
    if (screenshot) {
      const buf = await page.screenshot({ type: 'png' });
      screenshotB64 = buf.toString('base64');
    }

    return { results, screenshot: screenshotB64 };
  } catch (err: any) {
    return { results: [], error: err.message };
  } finally {
    await browser.close();
  }
}
