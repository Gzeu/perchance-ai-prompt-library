/**
 * MCP Tool: multi_format_generate
 * Intelligent multi-format generation with automatic format selection
 */

import { UniversalAgentInterface, UniversalRequest } from '../../agent/universal-interface.js';

export const multiFormatTool = {
  schema: {
    name: 'multi_format_generate',
    description: 'Generate in optimal format (.perchance or HTML) based on topic analysis. Automatically decides when to use interactive HTML format vs simple .perchance list format.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'What the generator should produce (e.g. "fantasy tavern name", "interactive character creator")',
        },
        category: {
          type: 'string',
          enum: ['names', 'characters', 'scenes', 'items', 'dialogue', 'images', 'loot', 'quests', 'custom'],
          description: 'Category of generator',
        },
        complexity: {
          type: 'string',
          enum: ['simple', 'medium', 'complex'],
          description: 'Complexity level',
          default: 'medium',
        },
        forceFormat: {
          type: 'string',
          enum: ['perchance', 'html', 'auto'],
          description: 'Force specific format or let system decide (default: auto)',
          default: 'auto',
        },
        interactiveFeatures: {
          type: 'array',
          items: { type: 'string' },
          description: 'Interactive features (for HTML format)',
        },
        visualElements: {
          type: 'array',
          items: { type: 'string' },
          description: 'Visual elements (for HTML format)',
        },
        generateBoth: {
          type: 'boolean',
          description: 'Generate both formats for comparison',
          default: false,
        },
      },
      required: ['topic'],
    },
  },

  handler: async (args: Record<string, unknown>) => {
    const universalInterface = new UniversalAgentInterface();

    if (args.generateBoth) {
      const request: UniversalRequest = {
        action: 'multi-format',
        topic: args.topic as string,
        category: (args.category as any) || 'custom',
        complexity: (args.complexity as any) || 'medium',
        options: {
          interactiveFeatures: args.interactiveFeatures as string[],
          visualElements: args.visualElements as string[],
        },
      };

      const response = await universalInterface.execute(request);
      
      // For both formats, we need to call the multi-format generator directly
      const { MultiFormatGenerator } = await import('../../agent/multi-format-generator.js');
      const multiFormatGen = new MultiFormatGenerator();
      
      const multiFormatRequest = {
        topic: args.topic as string,
        category: (args.category as any) || 'custom',
        complexity: (args.complexity as any) || 'medium',
        interactiveFeatures: args.interactiveFeatures as string[],
        visualElements: args.visualElements as string[],
      };

      const bothResult = await multiFormatGen.generateBothFormats(multiFormatRequest);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              platform: response.platform,
              action: 'multi-format-both',
              result: bothResult,
              metadata: response.metadata,
            }, null, 2),
          },
        ],
      };
    }

    const request: UniversalRequest = {
      action: 'multi-format',
      topic: args.topic as string,
      category: (args.category as any) || 'custom',
      complexity: (args.complexity as any) || 'medium',
      options: {
        forceFormat: (args.forceFormat as any) || 'auto',
        interactiveFeatures: args.interactiveFeatures as string[],
        visualElements: args.visualElements as string[],
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