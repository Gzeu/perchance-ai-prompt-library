// src/services/exportService.ts — v4.0.0
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import type { GeneratedPrompt, ExportFormat } from '../types/index.js';

function ensureDir(filePath: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
}

export function exportToJson(prompts: GeneratedPrompt[], outputPath: string): void {
  ensureDir(outputPath);
  const data = JSON.stringify({ version: '4.0.0', exported: new Date().toISOString(), count: prompts.length, prompts }, null, 2);
  writeFileSync(outputPath, data, 'utf-8');
  console.log(`✅ Exportat ${prompts.length} prompturi → ${outputPath}`);
}

export function exportToCsv(prompts: GeneratedPrompt[], outputPath: string): void {
  ensureDir(outputPath);
  const headers = ['prompt', 'negativePrompt', 'category', 'style', 'quality', 'tags', 'source', 'createdAt'];
  const rows = prompts.map((p) => [
    `"${p.prompt.replace(/"/g, '""')}"`,
    `"${(p.negativePrompt ?? '').replace(/"/g, '""')}"`,
    p.category,
    p.style,
    p.quality,
    `"${p.tags.join('; ')}"`,
    p.metadata.source,
    p.metadata.createdAt.toISOString(),
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  writeFileSync(outputPath, csv, 'utf-8');
  console.log(`✅ Exportat ${prompts.length} prompturi CSV → ${outputPath}`);
}

export function exportToTxt(prompts: GeneratedPrompt[], outputPath: string): void {
  ensureDir(outputPath);
  const lines = prompts.map((p, i) => `--- Prompt ${i + 1} [${p.category}/${p.style}] ---\n${p.prompt}${p.negativePrompt ? `\nNegative: ${p.negativePrompt}` : ''}\n`);
  writeFileSync(outputPath, lines.join('\n'), 'utf-8');
  console.log(`✅ Exportat ${prompts.length} prompturi TXT → ${outputPath}`);
}

export function exportToMarkdown(prompts: GeneratedPrompt[], outputPath: string): void {
  ensureDir(outputPath);
  const sections = prompts.map((p, i) => [
    `## Prompt ${i + 1} — ${p.category} / ${p.style}`,
    '',
    '```',
    p.prompt,
    '```',
    '',
    p.negativePrompt ? `**Negative:** \`${p.negativePrompt}\`` : '',
    `**Quality:** ${p.quality}/100 | **Tags:** ${p.tags.join(', ')}`,
    '',
  ].filter(Boolean).join('\n'));
  const md = [`# Perchance AI Prompt Export`, `*Generated: ${new Date().toISOString()}*`, '', ...sections].join('\n');
  writeFileSync(outputPath, md, 'utf-8');
  console.log(`✅ Exportat ${prompts.length} prompturi MD → ${outputPath}`);
}

export function exportPrompts(prompts: GeneratedPrompt[], format: ExportFormat, outputDir = './exports'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const ext = format === 'md' ? 'md' : format;
  const outputPath = join(outputDir, `prompts-${timestamp}.${ext}`);

  switch (format) {
    case 'json': exportToJson(prompts, outputPath); break;
    case 'csv':  exportToCsv(prompts, outputPath);  break;
    case 'txt':  exportToTxt(prompts, outputPath);  break;
    case 'md':   exportToMarkdown(prompts, outputPath); break;
  }

  return outputPath;
}
