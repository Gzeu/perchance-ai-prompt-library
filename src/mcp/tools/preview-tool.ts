/**
 * MCP Tool: preview_rolls
 * Local preview of .perchance generator results without a browser
 */

import { previewRolls } from '../../core/exporter.js';

export const previewTool = {
  schema: {
    name: 'preview_rolls',
    description:
      'Preview .perchance generator results locally without a browser. Fast but limited — does not support all Perchance.ai features. Use run_on_perchance for full accuracy.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The .perchance generator code to preview',
        },
        count: {
          type: 'number',
          description: 'Number of results to generate (default: 10)',
          default: 10,
        },
      },
      required: ['code'],
    },
  },

  handler: async (args: Record<string, unknown>) => {
    const code = args.code as string;
    const count = (args.count as number) || 10;
    const results = previewRolls(code, count);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          results,
          count: results.length,
          note: 'Local preview only — for full accuracy use run_on_perchance tool',
        }, null, 2),
      }],
    };
  },
};
