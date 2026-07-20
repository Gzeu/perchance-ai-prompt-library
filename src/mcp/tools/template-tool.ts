/**
 * MCP Tool: list_templates + get_template
 * Browse and retrieve the 150+ built-in Perchance templates
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../../../templates');

function scanTemplates() {
  const results: Array<{ name: string; category: string; path: string }> = [];
  if (!fs.existsSync(TEMPLATES_DIR)) return results;

  const categories = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);

  for (const category of categories) {
    const catDir = path.join(TEMPLATES_DIR, category);
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.perchance') || f.endsWith('.txt'));
    for (const file of files) {
      results.push({ name: file.replace(/\.(perchance|txt)$/, ''), category, path: path.join(catDir, file) });
    }
  }
  return results;
}

export const templateTool = {
  schema: [
    {
      name: 'list_templates',
      description: 'List all available Perchance generator templates, optionally filtered by category.',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Filter by category (e.g. characters, scenes, items, dialogue, images)',
          },
        },
      },
    },
    {
      name: 'get_template',
      description: 'Get the full .perchance code of a specific template by name.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Template name (from list_templates)' },
        },
        required: ['name'],
      },
    },
  ],

  handler: async (toolName: string, args: Record<string, unknown>) => {
    const templates = scanTemplates();

    if (toolName === 'list_templates') {
      const category = args.category as string | undefined;
      const filtered = category ? templates.filter(t => t.category === category) : templates;
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            total: filtered.length,
            categories: [...new Set(filtered.map(t => t.category))],
            templates: filtered.map(t => ({ name: t.name, category: t.category })),
          }, null, 2),
        }],
      };
    }

    if (toolName === 'get_template') {
      const name = args.name as string;
      const template = templates.find(t => t.name === name || t.name.includes(name));
      if (!template) {
        return { content: [{ type: 'text', text: `Template "${name}" not found. Use list_templates to see available templates.` }], isError: true };
      }
      const code = fs.readFileSync(template.path, 'utf-8');
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ name: template.name, category: template.category, code }, null, 2),
        }],
      };
    }

    return { content: [{ type: 'text', text: 'Unknown template operation' }], isError: true };
  },
};
