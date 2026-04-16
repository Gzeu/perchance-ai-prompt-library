// src/utils/formatters.ts — v4.0.0

export function formatQuality(score: number): string {
  if (score >= 90) return `⭐ Excelent (${score}/100)`;
  if (score >= 75) return `✅ Bun (${score}/100)`;
  if (score >= 60) return `⚠️ Mediu (${score}/100)`;
  return `❌ Slab (${score}/100)`;
}

export function formatTags(tags: string[]): string {
  return tags.map((t) => `#${t}`).join(' ');
}

export function truncate(str: string, maxLen = 80): string {
  return str.length > maxLen ? `${str.slice(0, maxLen - 3)}...` : str;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
