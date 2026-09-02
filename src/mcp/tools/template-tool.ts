/**
 * MCP Tool: list_templates + get_template
 * Browse and retrieve built-in Perchance template categories from the
 * TemplateLibrary word banks. No external AI — everything perchance-native.
 */

import { TemplateLibrary } from '../../agent/template-library.js';
import type { PerchanceCategory, GeneratorStyle } from '../../types/perchance.js';

const lib = new TemplateLibrary();

export const templateTool = {
  schema: [
    {
      name: 'list_templates',
      description:
        'List all available Perchance template categories (names, characters, scenes, items, dialogue, images, loot, quests).',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_template',
      description:
        'Get the word bank and a sample generated template for a specific category.',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Category name from list_templates (e.g. "characters", "items", "loot")',
          },
          topic: {
            type: 'string',
            description: 'Topic for the template (default: "generic")',
          },
          style: {
            type: 'string',
            description: 'Style: simple | weighted | complex (default: simple)',
          },
          itemCount: {
            type: 'number',
            description: 'Number of items per list (default: 10)',
          },
        },
        required: ['category'],
      },
    },
  ],

  handler: async (toolName: string, args: Record<string, unknown>) => {
    if (toolName === 'list_templates') {
      const templates = lib.listTemplates();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            total: templates.length,
            categories: templates.map(t => ({
              category: t.category,
              lists: t.lists,
            })),
            tip: 'Use get_template with a category name to see a sample .perchance generator.',
          }, null, 2),
        }],
      };
    }

    if (toolName === 'get_template') {
      const category = args.category as PerchanceCategory;
      const topic = (args.topic as string) || 'generic';
      const style = (args.style as GeneratorStyle) || 'simple';
      const itemCount = (args.itemCount as number) || 10;

      const bank = lib.getTemplate(category);
      if (Object.keys(bank).length === 0) {
        return {
          content: [{
            type: 'text',
            text: `Category "${category}" not found. Use list_templates to see available categories.`,
          }],
          isError: true,
        };
      }

      const code = lib.generate({ topic, category, style, itemCount });
      const preview = await previewRolls(code, 3);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            category,
            topic,
            style,
            wordBank: bank,
            code,
            sampleRolls: preview,
          }, null, 2),
        }],
      };
    }

    return { content: [{ type: 'text', text: 'Unknown template operation' }], isError: true };
  },
};

// Lazy import to avoid circular dependency
async function previewRolls(code: string, count: number): Promise<string[]> {
  const { previewRolls: _preview } = await import('../../core/exporter.js');
  return _preview(code, count);
}
