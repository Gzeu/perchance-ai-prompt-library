/**
 * Persistent Memory System for Autonomous Perchance Agent System
 * Stores learning data, quality metrics, and decision history for optimization
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEMORY_DIR = path.resolve(__dirname, '../../../.perchance-agentic-memory');

export interface MemoryEntry {
  id: string;
  timestamp: number;
  action: string;
  topic: string;
  category: string;
  result: any;
  qualityScore: number;
  executionTime: number;
  platform: string;
  decisions: string[];
  improvements?: string[];
  successful: boolean;
}

export interface QualityMetrics {
  avgQuality: number;
  totalGenerations: number;
  successfulGenerations: number;
  categoryBreakdown: Record<string, { count: number; avgQuality: number }>;
  formatBreakdown: Record<string, { count: number; avgQuality: number }>;
  timeTrends: Array<{ timestamp: number; avgQuality: number }>;
}

export interface DecisionPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  avgQuality: number;
  lastUsed: number;
}

export class MemorySystem {
  private memoryPath: string;
  private entries: MemoryEntry[] = [];
  private loaded: boolean = false;

  constructor(memoryDir: string = MEMORY_DIR) {
    this.memoryPath = path.join(memoryDir, 'memory.json');
    this.ensureMemoryDir();
  }

  /**
   * Store a memory entry
   */
  async store(entry: MemoryEntry): Promise<void> {
    this.ensureLoaded();
    
    entry.id = this.generateId();
    entry.timestamp = Date.now();
    
    this.entries.push(entry);
    await this.persist();
  }

  /**
   * Retrieve memory entries by criteria
   */
  retrieve(criteria: {
    action?: string;
    topic?: string;
    category?: string;
    platform?: string;
    successful?: boolean;
    limit?: number;
    since?: number;
  }): MemoryEntry[] {
    this.ensureLoaded();

    let filtered = [...this.entries];

    if (criteria.action) {
      filtered = filtered.filter(e => e.action === criteria.action);
    }

    if (criteria.topic) {
      filtered = filtered.filter(e => e.topic.includes(criteria.topic!));
    }

    if (criteria.category) {
      filtered = filtered.filter(e => e.category === criteria.category);
    }

    if (criteria.platform) {
      filtered = filtered.filter(e => e.platform === criteria.platform);
    }

    if (criteria.successful !== undefined) {
      filtered = filtered.filter(e => e.successful === criteria.successful);
    }

    if (criteria.since) {
      filtered = filtered.filter(e => e.timestamp >= criteria.since!);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    if (criteria.limit) {
      filtered = filtered.slice(0, criteria.limit);
    }

    return filtered;
  }

  /**
   * Get quality metrics over time
   */
  getQualityMetrics(timeRange: number = 7 * 24 * 60 * 60 * 1000): QualityMetrics {
    this.ensureLoaded();

    const since = Date.now() - timeRange;
    const recentEntries = this.entries.filter(e => e.timestamp >= since);

    if (recentEntries.length === 0) {
      return this.getDefaultMetrics();
    }

    const totalGenerations = recentEntries.length;
    const successfulGenerations = recentEntries.filter(e => e.successful).length;
    const avgQuality = recentEntries.reduce((sum, e) => sum + e.qualityScore, 0) / totalGenerations;

    // Category breakdown
    const categoryBreakdown: Record<string, { count: number; avgQuality: number }> = {};
    for (const entry of recentEntries) {
      if (!categoryBreakdown[entry.category]) {
        categoryBreakdown[entry.category] = { count: 0, avgQuality: 0 };
      }
      categoryBreakdown[entry.category].count++;
      categoryBreakdown[entry.category].avgQuality += entry.qualityScore;
    }

    for (const cat in categoryBreakdown) {
      categoryBreakdown[cat].avgQuality /= categoryBreakdown[cat].count;
    }

    // Format breakdown
    const formatBreakdown: Record<string, { count: number; avgQuality: number }> = {};
    for (const entry of recentEntries) {
      const format = entry.result?.format || 'perchance';
      if (!formatBreakdown[format]) {
        formatBreakdown[format] = { count: 0, avgQuality: 0 };
      }
      formatBreakdown[format].count++;
      formatBreakdown[format].avgQuality += entry.qualityScore;
    }

    for (const fmt in formatBreakdown) {
      formatBreakdown[fmt].avgQuality /= formatBreakdown[fmt].count;
    }

    // Time trends (group by day)
    const timeTrends: Array<{ timestamp: number; avgQuality: number }> = [];
    const dayGroups = new Map<number, number[]>();

    for (const entry of recentEntries) {
      const day = Math.floor(entry.timestamp / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
      if (!dayGroups.has(day)) {
        dayGroups.set(day, []);
      }
      dayGroups.get(day)!.push(entry.qualityScore);
    }

    for (const [day, qualities] of dayGroups) {
      timeTrends.push({
        timestamp: day,
        avgQuality: qualities.reduce((sum, q) => sum + q, 0) / qualities.length
      });
    }

    timeTrends.sort((a, b) => a.timestamp - b.timestamp);

    return {
      avgQuality,
      totalGenerations,
      successfulGenerations,
      categoryBreakdown,
      formatBreakdown,
      timeTrends
    };
  }

  /**
   * Analyze decision patterns
   */
  analyzeDecisionPatterns(): DecisionPattern[] {
    this.ensureLoaded();

    const patternMap = new Map<string, { count: number; successes: number; totalQuality: number; lastUsed: number }>();

    for (const entry of this.entries) {
      for (const decision of entry.decisions) {
        if (!patternMap.has(decision)) {
          patternMap.set(decision, { count: 0, successes: 0, totalQuality: 0, lastUsed: 0 });
        }

        const pattern = patternMap.get(decision)!;
        pattern.count++;
        pattern.lastUsed = Math.max(pattern.lastUsed, entry.timestamp);
        
        if (entry.successful) {
          pattern.successes++;
        }
        pattern.totalQuality += entry.qualityScore;
      }
    }

    const patterns: DecisionPattern[] = [];

    for (const [pattern, data] of patternMap) {
      patterns.push({
        pattern,
        frequency: data.count,
        successRate: data.successes / data.count,
        avgQuality: data.totalQuality / data.count,
        lastUsed: data.lastUsed
      });
    }

    // Sort by frequency and success rate
    patterns.sort((a, b) => {
      if (b.frequency !== a.frequency) {
        return b.frequency - a.frequency;
      }
      return b.successRate - a.successRate;
    });

    return patterns.slice(0, 20); // Return top 20 patterns
  }

  /**
   * Get similar past entries for a given topic
   */
  getSimilarEntries(topic: string, category: string, limit: number = 5): MemoryEntry[] {
    this.ensureLoaded();

    const topicLower = topic.toLowerCase();
    const topicWords = topicLower.split(/\s+/);

    const scored = this.entries
      .filter(e => e.category === category)
      .map(entry => {
        const entryLower = entry.topic.toLowerCase();
        let score = 0;

        // Exact match
        if (entryLower === topicLower) {
          score += 10;
        }

        // Contains match
        if (entryLower.includes(topicLower) || topicLower.includes(entryLower)) {
          score += 5;
        }

        // Word overlap
        const entryWords = entryLower.split(/\s+/);
        const commonWords = topicWords.filter(w => entryWords.includes(w));
        score += commonWords.length * 2;

        return { entry, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.entry);

    return scored;
  }

  /**
   * Get improvement suggestions based on memory
   */
  getImprovementSuggestions(topic: string, category: string): string[] {
    const similarEntries = this.getSimilarEntries(topic, category, 10);
    const suggestions: string[] = [];

    // Analyze what worked well for similar topics
    const successful = similarEntries.filter(e => e.successful && e.qualityScore > 0.8);
    
    if (successful.length > 0) {
      // Extract common patterns from successful entries
      const commonDecisions = new Map<string, number>();
      for (const entry of successful) {
        for (const decision of entry.decisions) {
          commonDecisions.set(decision, (commonDecisions.get(decision) || 0) + 1);
        }
      }

      for (const [decision, count] of commonDecisions) {
        if (count >= successful.length * 0.5) {
          suggestions.push(`Consider using: ${decision}`);
        }
      }

      // Extract common improvements
      const commonImprovements = new Map<string, number>();
      for (const entry of successful) {
        for (const improvement of entry.improvements || []) {
          commonImprovements.set(improvement, (commonImprovements.get(improvement) || 0) + 1);
        }
      }

      for (const [improvement, count] of commonImprovements) {
        if (count >= successful.length * 0.3) {
          suggestions.push(`Effective improvement: ${improvement}`);
        }
      }
    }

    // Analyze what didn't work well
    const failed = similarEntries.filter(e => !e.successful || e.qualityScore < 0.5);
    
    if (failed.length > 0) {
      const commonFailures = new Map<string, number>();
      for (const entry of failed) {
        for (const decision of entry.decisions) {
          commonFailures.set(decision, (commonFailures.get(decision) || 0) + 1);
        }
      }

      for (const [decision, count] of commonFailures) {
        if (count >= failed.length * 0.5) {
          suggestions.push(`Avoid: ${decision}`);
        }
      }
    }

    return suggestions.slice(0, 10); // Return top 10 suggestions
  }

  /**
   * Clean up old memory entries
   */
  async cleanup(maxAge: number = 30 * 24 * 60 * 60 * 1000, maxEntries: number = 10000): Promise<void> {
    this.ensureLoaded();

    const cutoff = Date.now() - maxAge;
    const before = this.entries.length;

    // Remove old entries
    this.entries = this.entries.filter(e => e.timestamp >= cutoff);

    // If still too many, remove oldest
    if (this.entries.length > maxEntries) {
      this.entries = this.entries
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, maxEntries);
    }

    const after = this.entries.length;

    if (before !== after) {
      await this.persist();
    }
  }

  /**
   * Export memory data
   */
  export(): string {
    this.ensureLoaded();
    return JSON.stringify({
      entries: this.entries,
      metrics: this.getQualityMetrics(),
      patterns: this.analyzeDecisionPatterns(),
      exportedAt: Date.now()
    }, null, 2);
  }

  /**
   * Import memory data
   */
  async import(data: string): Promise<void> {
    const imported = JSON.parse(data);
    
    if (imported.entries && Array.isArray(imported.entries)) {
      this.entries = imported.entries;
      await this.persist();
    }
  }

  /**
   * Get memory statistics
   */
  getStats(): {
    totalEntries: number;
    memorySize: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    this.ensureLoaded();

    if (this.entries.length === 0) {
      return {
        totalEntries: 0,
        memorySize: 0,
        oldestEntry: 0,
        newestEntry: 0
      };
    }

    const timestamps = this.entries.map(e => e.timestamp);

    return {
      totalEntries: this.entries.length,
      memorySize: JSON.stringify(this.entries).length,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps)
    };
  }

  // Private methods

  private ensureMemoryDir(): void {
    if (!fs.existsSync(MEMORY_DIR)) {
      fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }
  }

  private ensureLoaded(): void {
    if (!this.loaded) {
      this.load();
    }
  }

  private load(): void {
    try {
      if (fs.existsSync(this.memoryPath)) {
        const data = fs.readFileSync(this.memoryPath, 'utf-8');
        this.entries = JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load memory, starting fresh:', error);
      this.entries = [];
    }
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    try {
      const data = JSON.stringify(this.entries, null, 2);
      fs.writeFileSync(this.memoryPath, data, 'utf-8');
    } catch (error) {
      console.error('Failed to persist memory:', error);
    }
  }

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private getDefaultMetrics(): QualityMetrics {
    return {
      avgQuality: 0,
      totalGenerations: 0,
      successfulGenerations: 0,
      categoryBreakdown: {},
      formatBreakdown: {},
      timeTrends: []
    };
  }
}