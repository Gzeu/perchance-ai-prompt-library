// src/services/analyticsService.ts — v4.0.0
import type { UsageStats, GeneratedPrompt, PromptCategory, ArtStyle } from '../types/index.js';

export class AnalyticsService {
  private prompts: GeneratedPrompt[] = [];

  record(prompt: GeneratedPrompt): void {
    this.prompts.push(prompt);
  }

  recordBatch(prompts: GeneratedPrompt[]): void {
    this.prompts.push(...prompts);
  }

  getStats(): UsageStats {
    const total = this.prompts.length;

    const categoryCounts = {} as Record<PromptCategory, number>;
    const styleCounts = {} as Record<ArtStyle, number>;
    const tagCounter = new Map<string, number>();
    const dailyCounter = new Map<string, number>();

    let qualitySum = 0;

    for (const p of this.prompts) {
      // Category counts
      categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;

      // Style counts
      styleCounts[p.style] = (styleCounts[p.style] ?? 0) + 1;

      // Quality sum
      qualitySum += p.quality;

      // Tag counts
      for (const tag of p.tags) {
        tagCounter.set(tag, (tagCounter.get(tag) ?? 0) + 1);
      }

      // Daily activity
      const day = p.metadata.createdAt.toISOString().slice(0, 10);
      dailyCounter.set(day, (dailyCounter.get(day) ?? 0) + 1);
    }

    const topTags = [...tagCounter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    const dailyActivity = [...dailyCounter.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    return {
      totalGenerated: total,
      categoryCounts,
      styleCounts,
      averageQuality: total > 0 ? Math.round(qualitySum / total) : 0,
      topTags,
      dailyActivity,
    };
  }

  clear(): void {
    this.prompts = [];
  }

  get count(): number {
    return this.prompts.length;
  }
}

export const analytics = new AnalyticsService();
