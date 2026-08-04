/**
 * Perchance AI MCP Server
 * Exposes 11 tools callable by Claude, OpenClaw, or any MCP-compatible agent
 * Including autonomous tools for fully automated generator creation and improvement
 *
 * Usage in claude_desktop_config.json:
 * {
 *   "mcpServers": {
 *     "perchance": {
 *       "command": "npx",
 *       "args": ["perchance-mcp"]
 *     }
 *   }
 * }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { generateTool } from './tools/generate-tool.js';
import { templateTool } from './tools/template-tool.js';
import { validateTool } from './tools/validate-tool.js';
import { playwrightTool } from './tools/playwright-tool.js';
import { previewTool } from './tools/preview-tool.js';
import { autonomousGenerateTool } from './tools/autonomous-generate-tool.js';
import { batchGenerateTool } from './tools/batch-generate-tool.js';
import { improveGeneratorTool } from './tools/improve-generator-tool.js';
import { autonomousTestTool } from './tools/autonomous-test-tool.js';
import { multiFormatTool } from './tools/multi-format-tool.js';

const server = new Server(
  { name: 'perchance-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

const TOOLS = [
  generateTool.schema,
  ...templateTool.schema,
  validateTool.schema,
  playwrightTool.schema,
  previewTool.schema,
  autonomousGenerateTool.schema,
  batchGenerateTool.schema,
  improveGeneratorTool.schema,
  autonomousTestTool.schema,
  multiFormatTool.schema,
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
  case 'generate_perchance':
    return generateTool.handler(args ?? {});
  case 'list_templates':
  case 'get_template':
    return templateTool.handler(name, args ?? {});
  case 'validate_syntax':
    return validateTool.handler(args ?? {});
  case 'run_on_perchance':
    return playwrightTool.handler(args ?? {});
  case 'preview_rolls':
    return previewTool.handler(args ?? {});
  case 'autonomous_generate':
    return autonomousGenerateTool.handler(args ?? {});
  case 'batch_generate':
    return batchGenerateTool.handler(args ?? {});
  case 'improve_generator':
    return improveGeneratorTool.handler(args ?? {});
  case 'autonomous_test':
    return autonomousTestTool.handler(args ?? {});
  case 'multi_format_generate':
    return multiFormatTool.handler(args ?? {});
  default:
    throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Perchance MCP Server running...');
}

main().catch(console.error);
