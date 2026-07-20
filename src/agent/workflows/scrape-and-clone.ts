/**
 * Agent Workflow: Scrape & Clone
 * Scrapes a public Perchance.ai generator and adapts it
 */

import { scrapeGenerator } from '../../playwright/scraper.js';
import { validatePerchance } from '../../core/validator.js';
import { previewRolls, exportGenerator } from '../../core/exporter.js';

export async function scrapeAndCloneWorkflow(
  url: string,
  adaptInstructions?: string
): Promise<{ original: string; adapted: string; preview: string[]; savedTo?: string }> {
  console.log(`[Scrape] Fetching: ${url}`);
  const scraped = await scrapeGenerator(url);

  if (!scraped.code || scraped.code.startsWith('//')) {
    throw new Error(`Could not extract source from ${url}`);
  }

  let adapted = scraped.code;

  if (adaptInstructions) {
    const { improveGeneratorWorkflow } = await import('./improve-generator.js');
    const result = await improveGeneratorWorkflow(scraped.code, adaptInstructions);
    adapted = result.improvedCode;
  }

  const validation = validatePerchance(adapted);
  const preview = previewRolls(adapted, 8);

  const { filepath } = await exportGenerator(adapted, {
    filename: `cloned-${scraped.name}.perchance`,
    outputDir: './output/cloned',
  });

  console.log(`[Scrape] Done. Valid: ${validation.valid}, saved to: ${filepath}`);

  return { original: scraped.code, adapted, preview, savedTo: filepath };
}
