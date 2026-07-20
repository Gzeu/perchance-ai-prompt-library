/**
 * Agent Workflow: Create Generator
 * Full pipeline: topic → AI generate → validate → preview → export
 */

import { validatePerchance } from '../../core/validator.js';
import { previewRolls, exportGenerator } from '../../core/exporter.js';
import type { GenerateRequest, GenerateResult } from '../../types/perchance.js';
import Groq from 'groq-sdk';

export async function createGeneratorWorkflow(
  topic: string,
  options: Partial<GenerateRequest> = {}
): Promise<GenerateResult & { validationPassed: boolean; exportedTo?: string }> {
  const req: GenerateRequest = {
    topic,
    category: options.category || 'custom',
    style: options.style || 'nested',
    itemCount: options.itemCount || 15,
    useAI: true,
  };

  console.log(`[Workflow] Generating: "${topic}" (${req.category}, ${req.style})`);

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content:
          'You are a Perchance.ai generator expert. Output ONLY valid .perchance syntax. No explanation, no markdown fences.',
      },
      {
        role: 'user',
        content: `Create a ${req.style} Perchance generator for: "${topic}". Category: ${req.category}. ~${req.itemCount} items per list. Start with an "output" list.`,
      },
    ],
    temperature: 0.9,
    max_tokens: 2048,
  });

  const code = completion.choices[0]?.message?.content?.trim() || '';
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
    stats: { listCount: validation.stats.listCount, totalItems: validation.stats.totalItems },
    previewRolls: preview,
    validationPassed: validation.valid,
    exportedTo: filepath,
  };
}
