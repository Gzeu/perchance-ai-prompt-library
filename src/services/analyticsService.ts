import * as fs from 'fs/promises';
import * as path from 'path';

export interface GeneratedPrompt {
  id: string;
  prompt: string;
  category: string;
  style?: string;
  mood?: string;
  quality?: number;
  tags: string[];
  createdAt: Date;
  imageUrl?: string;
}

export interface DailyActivity {
  date: string;
  count: number;
  categories: Record<string, number>;
}

export interface UsageStats {
  totalGenerated: number;
  totalExported: number;
  totalImages: number;
  byCategory: Record<string, number>;
  byStyle: Record<string, number>;
  byMood: Record<string, number>;
  byQuality: Record<number, number>;
  popularTags: Array<{ tag: string; count: number }>;
  dailyActivity: DailyActivity[];
  sessionStart: Date;
  lastActivity: Date;
  averageQuality: number;
}

export interface AnalyticsEvent {
  type: 'generate' | 'export' | 'image' | 'search' | 'batch';
  category?: string;
  style?: string;
  mood?: string;
  quality?: number;
  tags?: string[];
  count?: number;
  timestamp: Date;
}

class AnalyticsService {
  private stats: UsageStats;
  private events: AnalyticsEvent[] = [];
  private persistPath?: string;

  constructor(persistPath?: string) {
    this.persistPath = persistPath;
    this.stats = this.createEmptyStats();
  }

  private createEmptyStats(): UsageStats {
    return {
      totalGenerated: 0,
      totalExported: 0,
      totalImages: 0,
      byCategory: {},
      byStyle: {},
      byMood: {},
      byQuality: {},
      popularTags: [],
      dailyActivity: [],
      sessionStart: new Date(),
      lastActivity: new Date(),
      averageQuality: 0,
    };
  }

  async load(): Promise<void> {
    if (!this.persistPath) return;
    try {
      const raw = await fs.readFile(this.persistPath, 'utf-8');
      const parsed = JSON.parse(raw);
      this.stats = {
        ...this.createEmptyStats(),
        ...parsed,
        sessionStart: new Date(),
        lastActivity: parsed.lastActivity ? new Date(parsed.lastActivity) : new Date(),
      };
    } catch {
      // Start fresh if file doesn't exist
    }
  }

  async save(): Promise<void> {
    if (!this.persistPath) return;
    try {
      await fs.mkdir(path.dirname(this.persistPath), { recursive: true });
      await fs.writeFile(this.persistPath, JSON.stringify(this.stats, null, 2));
    } catch (err) {
      console.error('[Analytics] Failed to save stats:', err);
    }
  }

  track(event: Omit<AnalyticsEvent, 'timestamp'>): void {
    const fullEvent: AnalyticsEvent = { ...event, timestamp: new Date() };
    this.events.push(fullEvent);
    this.stats.lastActivity = fullEvent.timestamp;
    this.applyEvent(fullEvent);
  }

  private applyEvent(event: AnalyticsEvent): void {
    const todayKey = new Date().toISOString().split('T')[0];

    if (event.type === 'generate') {
      const count = event.count ?? 1;
      this.stats.totalGenerated += count;

      if (event.category) {
        this.stats.byCategory[event.category] = (this.stats.byCategory[event.category] ?? 0) + count;
      }
      if (event.style) {
        this.stats.byStyle[event.style] = (this.stats.byStyle[event.style] ?? 0) + count;
      }
      if (event.mood) {
        this.stats.byMood[event.mood] = (this.stats.byMood[event.mood] ?? 0) + count;
      }
      if (event.quality !== undefined) {
        this.stats.byQuality[event.quality] = (this.stats.byQuality[event.quality] ?? 0) + count;
        this.updateAverageQuality();
      }
      if (event.tags) {
        this.updatePopularTags(event.tags);
      }
      this.updateDailyActivity(todayKey, event.category ?? 'unknown', count);
    }

    if (event.type === 'export') {
      this.stats.totalExported += event.count ?? 1;
    }

    if (event.type === 'image') {
      this.stats.totalImages += event.count ?? 1;
    }
  }

  private updateAverageQuality(): void {
    const entries = Object.entries(this.stats.byQuality);
    if (entries.length === 0) return;
    const total = entries.reduce((sum, [q, c]) => sum + Number(q) * c, 0);
    const count = entries.reduce((sum, [, c]) => sum + c, 0);
    this.stats.averageQuality = count > 0 ? Math.round((total / count) * 10) / 10 : 0;
  }

  private updatePopularTags(tags: string[]): void {
    const tagMap = new Map(this.stats.popularTags.map((t) => [t.tag, t.count]));
    for (const tag of tags) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }
    this.stats.popularTags = Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);
  }

  private updateDailyActivity(dateKey: string, category: string, count: number): void {
    const existing = this.stats.dailyActivity.find((d) => d.date === dateKey);
    if (existing) {
      existing.count += count;
      existing.categories[category] = (existing.categories[category] ?? 0) + count;
    } else {
      this.stats.dailyActivity.push({
        date: dateKey,
        count,
        categories: { [category]: count },
      });
      // Keep last 90 days
      if (this.stats.dailyActivity.length > 90) {
        this.stats.dailyActivity.shift();
      }
    }
  }

  getStats(): UsageStats {
    return { ...this.stats };
  }

  getTopCategories(limit = 10): Array<{ category: string; count: number }> {
    return Object.entries(this.stats.byCategory)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getTopStyles(limit = 10): Array<{ style: string; count: number }> {
    return Object.entries(this.stats.byStyle)
      .map(([style, count]) => ({ style, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getDailyActivity(days = 30): DailyActivity[] {
    return this.stats.dailyActivity.slice(-days);
  }

  reset(): void {
    this.stats = this.createEmptyStats();
    this.events = [];
  }

  getSummary(): string {
    const s = this.stats;
    return [
      `📊 Analytics Summary`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `Total generated : ${s.totalGenerated}`,
      `Total exported  : ${s.totalExported}`,
      `Total images    : ${s.totalImages}`,
      `Avg quality     : ${s.averageQuality}/10`,
      `Top category    : ${this.getTopCategories(1)[0]?.category ?? 'none'}`,
      `Top style       : ${this.getTopStyles(1)[0]?.style ?? 'none'}`,
      `Session start   : ${s.sessionStart.toLocaleTimeString()}`,
    ].join('\n');
  }
}

export const analyticsService = new AnalyticsService();
export default AnalyticsService;
