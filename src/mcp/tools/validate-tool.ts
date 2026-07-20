/**
 * MCP Tool: validate_syntax
 * Validates .perchance generator code and returns errors/warnings
 */

import { validatePerchance } from '../../core/validator.js';

export const validateTool = {
  schema: {
    name: 'validate_syntax',
    description: 'Validate .perchance generator syntax. Returns errors, warnings and generator stats.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The .perchance generator code to validate',
        },
      },
      required: ['code'],
    },
  },

  handler: async (args: Record<string, unknown>) => {
    const code = args.code as string;
    const result = validatePerchance(code);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          valid: result.valid,
          errorCount: result.errors.length,
          warningCount: result.warnings.length,
          errors: result.errors,
          warnings: result.warnings,
          stats: result.stats,
          suggestion: !result.stats.hasOutput
            ? 'Add an "output" list as the first list so results display on perchance.ai'
            : undefined,
        }, null, 2),
      }],
    };
  },
};
