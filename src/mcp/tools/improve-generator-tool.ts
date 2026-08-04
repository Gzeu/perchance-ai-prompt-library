/**
 * MCP Tool: improve_generator
 * Self-improvement workflow with iterative refinement based on feedback
 */

import { UniversalAgentInterface, UniversalRequest } from '../../agent/universal-interface.js';
import { validatePerchance } from '../../core/validator.js';

export const improveGeneratorTool = {
  schema: {
    name: 'improve_generator',
    description: 'Automatically improve an existing generator through iterative refinement. Uses self-improvement system with feedback loops to fix errors, resolve warnings, and enhance quality.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The .perchance generator code to improve',
        },
        iterations: {
          type: 'number',
          description: 'Maximum improvement iterations (1-5)',
          default: 3,
          minimum: 1,
          maximum: 5,
        },
        qualityThreshold: {
          type: 'number',
          description: 'Target quality score (0-1)',
          default: 0.8,
        },
        strategy: {
          type: 'string',
          enum: ['auto', 'error-correction', 'warning-resolution', 'structure-fix', 'content-expansion', 'quality-enhancement'],
          description: 'Improvement strategy (auto-detects if not specified)',
          default: 'auto',
        },
      },
      required: ['code'],
    },
  },

  handler: async (args: Record<string, unknown>) => {
    const universalInterface = new UniversalAgentInterface();

    // First validate the input code
    const validation = validatePerchance(args.code as string);
    
    const request: UniversalRequest = {
      action: 'improve',
      topic: 'generator-improvement',
      category: 'custom',
      options: {
        format: args.code as any,
        iterations: (args.iterations as number) || 3,
        qualityThreshold: (args.qualityThreshold as number) || 0.8,
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
            result: {
              ...response.result,
              originalValidation: {
                valid: validation.valid,
                errors: validation.errors,
                warnings: validation.warnings,
                stats: validation.stats,
              },
            },
            metadata: response.metadata,
            error: response.error,
          }, null, 2),
        },
      ],
    };
  },
};