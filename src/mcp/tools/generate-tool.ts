/**
 * MCP Tool: generate_perchance
 * Uses Groq AI to generate a complete .perchance generator from a topic
 */

import Groq from 'groq-sdk';
import { validatePerchance } from '../../core/validator.js';
import { previewRolls } from '../../core/exporter.js';
import type { GenerateRequest } from '../../types/perchance.js';

export const generateTool = {
  schema: {
    name: 'generate_perchance',
    description:
      'Generate a complete .perchance generator from a topic using AI. Returns valid Perchance.ai syntax ready to paste.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'What the generator should produce (e.g. "fantasy tavern name", "sci-fi weapon")',
        },
        category: {
          type: 'string',
          enum: ['names', 'characters', 'scenes', 'items', 'dialogue', 'images', 'loot', 'quests', 'custom'],
          description: 'Category of generator',
        },
        style: {
          type: 'string',
          enum: ['simple', 'weighted', 'nested', 'complex'],
          description: 'Complexity style of the generator',
          default: 'nested',
        },
        itemCount: {
          type: 'number',
          description: 'Approximate number of items per list',
          default: 15,
        },
      },
      required: ['topic'],
    },
  },

  handler: async (args: Record<string, unknown>) => {
    const req: GenerateRequest = {
      topic: args.topic as string,
      category: (args.category as any) || 'custom',
      style: (args.style as any) || 'nested',
      itemCount: (args.itemCount as number) || 15,
      useAI: true,
    };

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `You are a Perchance.ai generator expert. Generate ONLY valid .perchance syntax.

Perchance syntax rules:
- List name starts at column 0 (no indent)
- Items are indented with 2 spaces
- Weighted items use ^number (e.g. "common item^3")
- Reference other lists with [listName]
- First list called "output" is shown to users
- Comments start with //

Example:
output
  [adjective] [creature] of the [place]

adjective
  ancient^2
  cursed
  forgotten^3
  radiant

creature
  dragon
  phoenix^2
  wraith

place
  [adjective] ruins
  enchanted forest
  shadow realm^2`;

    const userPrompt = `Create a ${req.style} Perchance.ai generator for: "${req.topic}"
Category: ${req.category}
Aim for ~${req.itemCount} items per list.
Make it creative, varied, and immediately usable on perchance.ai.
Return ONLY the .perchance code, no explanation.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 2048,
    });

    const code = completion.choices[0]?.message?.content?.trim() || '';
    const validation = validatePerchance(code);
    const preview = previewRolls(code, 5);
    const slug = req.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            code,
            filename: `${slug}.perchance`,
            category: req.category,
            valid: validation.valid,
            warnings: validation.warnings.map((w) => w.message),
            stats: validation.stats,
            previewRolls: preview,
            pasteUrl: 'https://perchance.ai/tools/generate',
          }, null, 2),
        },
      ],
    };
  },
};
