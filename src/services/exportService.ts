import * as fs from 'fs/promises';
import * as path from 'path';
import type { GeneratedPrompt } from './analyticsService.js';

export type ExportFormat = 'json' | 'csv' | 'txt' | 'md' | 'markdown';

export interface ExportOptions {
  format: ExportFormat;
  outputPath?: string;
  filename?: string;
  includeMetadata?: boolean;
  includeNegatives?: boolean;
  separator?: string;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  content: string;
  format: ExportFormat;
  count: number;
  sizeBytes: number;
  error?: string;
}

class ExportService {
  private defaultOutputDir = './exports';

  async ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  async export(prompts: GeneratedPrompt[], options: ExportOptions): Promise<ExportResult> {
    const format = options.format === 'markdown' ? 'md' : options.format;
    let content: string;

    switch (format) {
      case 'json':
        content = this.toJSON(prompts, options);
        break;
      case 'csv':
        content = this.toCSV(prompts, options);
        break;
      case 'txt':
        content = this.toTXT(prompts, options);
        break;
      case 'md':
        content = this.toMarkdown(prompts, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    const result: ExportResult = {
      success: true,
      content,
      format,
      count: prompts.length,
      sizeBytes: Buffer.byteLength(content, 'utf-8'),
    };

    if (options.outputPath || options.filename) {
      const dir = options.outputPath ?? this.defaultOutputDir;
      const filename = options.filename ?? this.generateFilename(format);
      const fullPath = path.join(dir, filename);

      try {
        await this.ensureDir(dir);
        await fs.writeFile(fullPath, content, 'utf-8');
        result.filePath = fullPath;
      } catch (err) {
        result.success = false;
        result.error = `Failed to write file: ${String(err)}`;
      }
    }

    return result;
  }

  private generateFilename(format: ExportFormat): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const ext = format === 'md' ? 'md' : format;
    return `prompts-${timestamp}.${ext}`;
  }

  private toJSON(prompts: GeneratedPrompt[], options: ExportOptions): string {
    const data = options.includeMetadata
      ? prompts
      : prompts.map(({ prompt, category, style, mood, quality, tags }) => ({
          prompt,
          category,
          style,
          mood,
          quality,
          tags,
        }));
    return JSON.stringify(data, null, 2);
  }

  private toCSV(prompts: GeneratedPrompt[], options: ExportOptions): string {
    const sep = options.separator ?? ',';
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;

    const headers = ['prompt', 'category', 'style', 'mood', 'quality', 'tags'];
    if (options.includeMetadata) headers.push('id', 'createdAt', 'imageUrl');

    const rows = prompts.map((p) => {
      const base = [
        escape(p.prompt),
        escape(p.category),
        escape(p.style ?? ''),
        escape(p.mood ?? ''),
        String(p.quality ?? ''),
        escape(p.tags.join('; ')),
      ];
      if (options.includeMetadata) {
        base.push(escape(p.id), escape(new Date(p.createdAt).toISOString()), escape(p.imageUrl ?? ''));
      }
      return base.join(sep);
    });

    return [headers.map(escape).join(sep), ...rows].join('\n');
  }

  private toTXT(prompts: GeneratedPrompt[], options: ExportOptions): string {
    return prompts
      .map((p, i) => {
        const lines = [`${i + 1}. ${p.prompt}`];
        if (options.includeMetadata) {
          if (p.category) lines.push(`   Category: ${p.category}`);
          if (p.style) lines.push(`   Style: ${p.style}`);
          if (p.mood) lines.push(`   Mood: ${p.mood}`);
          if (p.quality) lines.push(`   Quality: ${p.quality}/10`);
          if (p.tags.length) lines.push(`   Tags: ${p.tags.join(', ')}`);
        }
        return lines.join('\n');
      })
      .join('\n\n');
  }

  private toMarkdown(prompts: GeneratedPrompt[], options: ExportOptions): string {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const lines = [
      `# AI Prompt Library Export`,
      ``,
      `**Generated:** ${date}  `,
      `**Total prompts:** ${prompts.length}`,
      ``,
      `---`,
      ``,
    ];

    for (const p of prompts) {
      lines.push(`## Prompt`);
      lines.push(``);
      lines.push(`> ${p.prompt}`);
      lines.push(``);
      if (options.includeMetadata) {
        const meta: string[] = [];
        if (p.category) meta.push(`**Category:** ${p.category}`);
        if (p.style) meta.push(`**Style:** ${p.style}`);
        if (p.mood) meta.push(`**Mood:** ${p.mood}`);
        if (p.quality) meta.push(`**Quality:** ${p.quality}/10`);
        if (p.tags.length) meta.push(`**Tags:** ${p.tags.map((t) => `\`${t}\``).join(', ')}`);
        if (meta.length) {
          lines.push(meta.join('  \n'));
          lines.push(``);
        }
      }
      lines.push(`---`);
      lines.push(``);
    }

    return lines.join('\n');
  }

  async exportFromStrings(
    promptStrings: string[],
    options: ExportOptions,
    defaults: Partial<Omit<GeneratedPrompt, 'id' | 'prompt' | 'createdAt'>> = {}
  ): Promise<ExportResult> {
    const prompts: GeneratedPrompt[] = promptStrings.map((prompt, i) => ({
      id: `prompt-${i + 1}`,
      prompt,
      category: defaults.category ?? 'general',
      style: defaults.style,
      mood: defaults.mood,
      quality: defaults.quality,
      tags: defaults.tags ?? [],
      imageUrl: defaults.imageUrl,
      createdAt: new Date(),
    }));
    return this.export(prompts, options);
  }
}

export const exportService = new ExportService();
export default ExportService;
