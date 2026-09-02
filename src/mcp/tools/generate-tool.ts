/**
 * MCP Tool: generate_perchance
 * Generates a complete .perchance generator from a topic using
 * the TemplateLibrary (perchance-native, no external AI needed).
 */

import { validatePerchance } from '../../core/validator.js';
import { previewRolls } from '../../core/exporter.js';
import { TemplateLibrary } from '../../agent/template-library.js';
import type { GenerateRequest } from '../../types/perchance.js';

export const generateTool = {
  schema: {
    name: 'generate_perchance',
    description:
      'Generate a complete .perchance generator from a topic using perchance-native templates. Returns valid Perchance.ai syntax ready to paste.',
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
    };

    const library = new TemplateLibrary();
    const code = library.generate({
      topic: req.topic,
      category: req.category as any,
      style: req.style,
      itemCount: req.itemCount || 15,
    });

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
            pasteUrl: 'https://perchance.org/minimal#edit',
          }, null, 2),
        },
      ],
    };
  },
};
