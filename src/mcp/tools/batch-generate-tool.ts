/**
 * MCP Tool: batch_generate
 * Coordinated batch generation of multiple related generators
 */

import { UniversalAgentInterface, UniversalRequest } from '../../agent/universal-interface.js';

export const batchGenerateTool = {
  schema: {
    name: 'batch_generate',
    description: 'Generate multiple related generators in parallel with intelligent coordination. Auto-creates variations, validates all results, and returns the best performers.',
    inputSchema: {
      type: 'object',
      properties: {
        baseTopic: {
          type: 'string',
          description: 'Base topic for batch generation (e.g. "fantasy weapon")',
        },
        category: {
          type: 'string',
          enum: ['names', 'characters', 'scenes', 'items', 'dialogue', 'images', 'loot', 'quests', 'custom'],
          description: 'Category of generators',
        },
        variations: {
          type: 'number',
          description: 'Number of variations to generate (1-10)',
          default: 5,
          minimum: 1,
          maximum: 10,
        },
        parallel: {
          type: 'boolean',
          description: 'Process in parallel when possible',
          default: true,
        },
        qualityThreshold: {
          type: 'number',
          description: 'Minimum quality score for inclusion (0-1)',
          default: 0.7,
        },
      },
      required: ['baseTopic'],
    },
  },

  handler: async (args: Record<string, unknown>) => {
    const universalInterface = new UniversalAgentInterface();

    const request: UniversalRequest = {
      action: 'batch',
      topic: args.baseTopic as string,
      category: (args.category as any) || 'custom',
      options: {
        variations: (args.variations as number) || 5,
        parallel: (args.parallel as boolean) !== false,
        qualityThreshold: (args.qualityThreshold as number) || 0.7,
      },
    };

    const response = await universalInterface.execute(request);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: response.success,
            platform: response.platform,
            action: response.action,
            result: response.result,
            metadata: response.metadata,
            error: response.error,
          }, null, 2),
        },
      ],
    };
  },
};