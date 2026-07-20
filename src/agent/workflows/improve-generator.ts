/**
 * Agent Workflow: Improve Generator
 * Takes existing .perchance code and improves it with AI
 */

import { validatePerchance } from '../../core/validator.js';
import { previewRolls } from '../../core/exporter.js';
import Groq from 'groq-sdk';

export async function improveGeneratorWorkflow(
  existingCode: string,
  instructions: string
): Promise<{ originalCode: string; improvedCode: string; changes: string[]; preview: string[] }> {
  const validation = validatePerchance(existingCode);
  console.log(`[Improve] Original: ${validation.stats.listCount} lists, ${validation.stats.totalItems} items`);

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content:
          'You are a Perchance.ai expert. Improve the provided generator code according to instructions. Return ONLY the improved .perchance code.',
      },
      {
        role: 'user',
        content: `Improve this Perchance generator:\n\n${existingCode}\n\nInstructions: ${instructions}\n\nReturn only the improved .perchance code.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });

  const improvedCode = completion.choices[0]?.message?.content?.trim() || existingCode;
  const improvedValidation = validatePerchance(improvedCode);
  const preview = previewRolls(improvedCode, 8);

  const changes: string[] = [];
  if (improvedValidation.stats.totalItems > validation.stats.totalItems)
    changes.push(`Added ${improvedValidation.stats.totalItems - validation.stats.totalItems} new items`);
  if (!validation.stats.hasWeighted && improvedValidation.stats.hasWeighted)
    changes.push('Added weighted probabilities');
  if (!validation.stats.hasNested && improvedValidation.stats.hasNested)
    changes.push('Added nested list references');

  return { originalCode: existingCode, improvedCode, changes, preview };
}
