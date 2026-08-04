/**
 * MCP Tool: autonomous_generate
 * Fully autonomous generator creation with intelligent decision-making
 */

import { UniversalAgentInterface, UniversalRequest } from '../../agent/universal-interface.js';

export const autonomousGenerateTool = {
  schema: {
    name: 'autonomous_generate',
    description: 'Fully autonomous generator creation. Intelligently decides format, complexity, and workflow without user intervention. Uses decision engine, self-improvement, and testing automatically.',
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
        complexity: {
          type: 'string',
          enum: ['simple', 'medium', 'complex'],
          description: 'Complexity level (auto-determined if not specified)',
          default: 'medium',
        },
        qualityThreshold: {
          type: 'number',
          description: 'Minimum quality score (0-1). System will auto-improve if below threshold.',
          default: 0.8,
        },
        requireTesting: {
          type: 'boolean',
          description: 'Run comprehensive testing suite',
          default: true,
        },
        requirePlaywright: {
          type: 'boolean',
          description: 'Use Playwright for browser testing (if available)',
          default: false,
        },
      },
      required: ['topic'],
    },
  },

  handler: async (args: Record<string, unknown>) => {
    const universalInterface = new UniversalAgentInterface();

    const request: UniversalRequest = {
      action: 'autonomous',
      topic: args.topic as string,
      category: (args.category as any) || 'custom',
      complexity: (args.complexity as any) || 'medium',
      options: {
        qualityThreshold: (args.qualityThreshold as number) || 0.8,
        requireTesting: (args.requireTesting as boolean) !== false,
        requirePlaywright: (args.requirePlaywright as boolean) || false,
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