/**
 * Agent Workflow: Create Generator
 * Full pipeline: topic → template generation → validate → preview → export
 * Uses perchance-native TemplateLibrary — no external AI required.
 */

import { validatePerchance } from '../../core/validator.js';
import { previewRolls, exportGenerator } from '../../core/exporter.js';
import { TemplateLibrary } from '../../agent/template-library.js';
import type { GenerateRequest, GenerateResult } from '../../types/perchance.js';

export async function createGeneratorWorkflow(
  topic: string,
  options: Partial<GenerateRequest> = {}
): Promise<GenerateResult & { validationPassed: boolean; exportedTo?: string }> {
  const req: GenerateRequest = {
    topic,
    category: options.category || 'custom',
    style: options.style || 'nested',
    itemCount: options.itemCount || 15,
  };

  console.log(`[Workflow] Generating: "${topic}" (${req.category}, ${req.style})`);

  const library = new TemplateLibrary();
  const code = library.generate({
    topic,
    category: req.category as any,
    style: req.style,
    itemCount: req.itemCount || 15,
  });

  const validation = validatePerchance(code);
  const preview = previewRolls(code, 8);
  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filename = `${slug}.perchance`;

  console.log(`[Workflow] Valid: ${validation.valid}, Lists: ${validation.stats.listCount}, Items: ${validation.stats.totalItems}`);
  console.log(`[Workflow] Preview: ${preview.slice(0, 3).join(' | ')}`);

  const { filepath } = await exportGenerator(code, { filename, outputDir: './output/generators' });

  return {
    code,
    filename,
    category: req.category,
    stats: {
      listCount: validation.stats.listCount,
      totalItems: validation.stats.totalItems
    },
    previewRolls: preview,
    validationPassed: validation.valid,
    exportedTo: filepath,
  };
}
