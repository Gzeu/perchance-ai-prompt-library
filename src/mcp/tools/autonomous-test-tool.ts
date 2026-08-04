/**
 * MCP Tool: autonomous_test
 * Comprehensive automated testing suite for generators
 */

import { UniversalAgentInterface, UniversalRequest } from '../../agent/universal-interface.js';

export const autonomousTestTool = {
  schema: {
    name: 'autonomous_test',
    description: 'Run comprehensive automated testing suite on a generator. Includes edge case testing, stress testing, regression testing, quality checks, and functional validation.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The .perchance generator code to test',
        },
        testScenarios: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['edge-cases', 'stress-test', 'regression', 'quality', 'functional'],
          },
          description: 'Specific test scenarios to run (runs all if not specified)',
        },
        qualityThreshold: {
          type: 'number',
          description: 'Minimum quality score to pass (0-1)',
          default: 0.8,
        },
        includeStressTest: {
          type: 'boolean',
          description: 'Include resource-intensive stress tests',
          default: false,
        },
      },
      required: ['code'],
    },
  },

  handler: async (args: Record<string, unknown>) => {
    const universalInterface = new UniversalAgentInterface();

    const request: UniversalRequest = {
      action: 'test',
      topic: 'generator-testing',
      category: 'custom',
      options: {
        format: args.code as any,
        qualityThreshold: (args.qualityThreshold as number) || 0.8,
        requirePlaywright: (args.includeStressTest as boolean) || false,
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