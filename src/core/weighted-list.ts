/**
 * Weighted list utilities for Perchance syntax
 * Supports ^weight notation and probability calculation
 */

export interface WeightedEntry {
  value: string;
  weight: number;
  probability?: number;
}

export function buildWeightedList(entries: WeightedEntry[]): string {
  const total = entries.reduce((sum, e) => sum + e.weight, 0);
  return entries
    .map(e => {
      const prob = ((e.weight / total) * 100).toFixed(1);
      return `  ${e.value}^${e.weight} // ${prob}%`;
    })
    .join('\n');
}

export function parseWeightedList(code: string): WeightedEntry[] {
  const lines = code.split('\n').filter(l => l.trim() && !l.startsWith('//'));
  const entries: WeightedEntry[] = [];
  for (const line of lines) {
    const match = line.trim().match(/^(.+?)\^(\d+(?:\.\d+)?)/);
    if (match) {
      entries.push({ value: match[1].trim(), weight: parseFloat(match[2]) });
    } else if (line.trim()) {
      entries.push({ value: line.trim(), weight: 1 });
    }
  }
  const total = entries.reduce((sum, e) => sum + e.weight, 0);
  return entries.map(e => ({ ...e, probability: (e.weight / total) * 100 }));
}

export function rollWeighted(entries: WeightedEntry[]): string {
  const total = entries.reduce((sum, e) => sum + e.weight, 0);
  let rand = Math.random() * total;
  for (const entry of entries) {
    rand -= entry.weight;
    if (rand <= 0) return entry.value;
  }
  return entries[entries.length - 1].value;
}
