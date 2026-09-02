/**
 * Batch Processing Coordinator for Autonomous Perchance Agent System
 * Coordinates parallel generation and processing of multiple related generators
 * Uses perchance-native templates — no external AI required.
 */

import { validatePerchance } from '../core/validator.js';
import { previewRolls } from '../core/exporter.js';
import { TemplateLibrary } from './template-library.js';
import type { ValidationResult } from '../types/perchance.js';

export interface BatchRequest {
  baseTopic: string;
  category: string;
  variations: number;
  style?: 'simple' | 'weighted' | 'nested' | 'complex';
  itemCount?: number;
  parallel?: boolean;
  constraints?: {
    maxConcurrent?: number;
    qualityThreshold?: number;
    requireValidation?: boolean;
    requirePreview?: boolean;
  };
}

export interface BatchItem {
  id: string;
  topic: string;
  code?: string;
  validation?: ValidationResult;
  preview?: string[];
  status: 'pending' | 'generating' | 'validating' | 'previewing' | 'completed' | 'failed';
  error?: string;
  qualityScore?: number;
  startTime?: number;
  endTime?: number;
}

export interface BatchResult {
  items: BatchItem[];
  summary: {
    total: number;
    completed: number;
    failed: number;
    avgQuality: number;
    totalTime: number;
  };
  successfulItems: BatchItem[];
  failedItems: BatchItem[];
}

export class BatchCoordinator {
  private maxConcurrent: number = 3;
  private library: TemplateLibrary;

  constructor() {
    this.library = new TemplateLibrary();
  }

  async executeBatch(request: BatchRequest): Promise<BatchResult> {
    const startTime = Date.now();
    const items = this.createBatchItems(request);
    const constraints = request.constraints || {};

    if (request.parallel) {
      await this.processParallel(items, constraints);
    } else {
      await this.processSequential(items, constraints);
    }

    const endTime = Date.now();
    return this.createBatchResult(items, startTime, endTime);
  }

  private createBatchItems(request: BatchRequest): BatchItem[] {
    const items: BatchItem[] = [];
    const variations = this.generateTopicVariations(request.baseTopic, request.variations);

    for (let i = 0; i < request.variations; i++) {
      items.push({
        id: `batch-${i + 1}`,
        topic: variations[i] || request.baseTopic,
        status: 'pending',
      });
    }

    return items;
  }

  private generateTopicVariations(baseTopic: string, count: number): string[] {
    const variations: string[] = [];
    const modifiers = [
      'îmbunătățit', 'avansat', 'premium', 'deluxe', 'ultimate',
      'de bază', 'standard', 'pro', 'elit', 'maestru'
    ];
    const aspects = [
      'cu detalii', 'cu variații', 'extins', 'comprehensiv',
      'concentrat', 'specializat', 'optimizat', 'rerefinit'
    ];

    for (let i = 0; i < count; i++) {
      if (i === 0) {
        variations.push(baseTopic);
      } else {
        const modifier = modifiers[i % modifiers.length];
        const aspect = aspects[i % aspects.length];
        variations.push(`${modifier} ${baseTopic} ${aspect}`);
      }
    }

    return variations;
  }

  private async processParallel(items: BatchItem[], constraints: any): Promise<void> {
    const maxConcurrent = constraints.maxConcurrent || this.maxConcurrent;
    const semaphore = new Semaphore(maxConcurrent);

    const promises = items.map(item =>
      semaphore.run(() => this.processItem(item, constraints))
    );

    await Promise.all(promises);
  }

  private async processSequential(items: BatchItem[], constraints: any): Promise<void> {
    for (const item of items) {
      await this.processItem(item, constraints);
    }
  }

  private async processItem(item: BatchItem, constraints: any): Promise<void> {
    item.startTime = Date.now();
    item.status = 'generating';

    try {
      const code = await this.generateCode(item.topic, constraints);
      item.code = code;

      if (constraints.requireValidation !== false) {
        item.status = 'validating';
        const validation = validatePerchance(code);
        item.validation = validation;
        item.qualityScore = this.calculateQualityScore(validation);
      }

      if (constraints.requirePreview !== false) {
        item.status = 'previewing';
        const preview = previewRolls(code, 5);
        item.preview = preview;
      }

      item.status = 'completed';
    } catch (error: any) {
      item.status = 'failed';
      item.error = error.message;
    } finally {
      item.endTime = Date.now();
    }
  }

  private async generateCode(topic: string, constraints: any): Promise<string> {
    const category = (constraints.category || 'custom') as any;
    const style = (constraints.style || 'nested') as any;
    const itemCount = constraints.itemCount || 15;

    return this.library.generate({
      topic,
      category,
      style,
      itemCount,
    });
  }

  private calculateQualityScore(validation: ValidationResult): number {
    let score = 1.0;
    score -= validation.errors.length * 0.3;
    score -= validation.warnings.length * 0.1;
    if (validation.stats.hasOutput) score += 0.1;
    if (validation.stats.listCount >= 3) score += 0.1;
    if (validation.stats.totalItems >= 15) score += 0.1;
    if (validation.stats.hasNested) score += 0.1;
    if (validation.stats.hasWeighted) score += 0.05;
    return Math.min(1, Math.max(0, score));
  }

  private createBatchResult(items: BatchItem[], startTime: number, endTime: number): BatchResult {
    const completed = items.filter(i => i.status === 'completed');
    const failed = items.filter(i => i.status === 'failed');
    const avgQuality = completed.length > 0
      ? completed.reduce((sum, i) => sum + (i.qualityScore || 0), 0) / completed.length
      : 0;

    return {
      items,
      summary: {
        total: items.length,
        completed: completed.length,
        failed: failed.length,
        avgQuality,
        totalTime: endTime - startTime
      },
      successfulItems: completed,
      failedItems: failed,
    };
  }

  getProgress(items: BatchItem[]): { completed: number; total: number; percentage: number } {
    const completed = items.filter(i => i.status === 'completed' || i.status === 'failed').length;
    return {
      completed,
      total: items.length,
      percentage: (completed / items.length) * 100
    };
  }

  async retryFailed(items: BatchItem[], constraints: any): Promise<BatchItem[]> {
    const failedItems = items.filter(i => i.status === 'failed');

    for (const item of failedItems) {
      item.status = 'pending';
      item.error = undefined;
      await this.processItem(item, constraints);
    }

    return failedItems;
  }

  filterByQuality(items: BatchItem[], threshold: number): BatchItem[] {
    return items.filter(i =>
      i.status === 'completed' && (i.qualityScore || 0) >= threshold
    );
  }

  getBestItem(items: BatchItem[]): BatchItem | undefined {
    const completed = items.filter(i => i.status === 'completed');
    return completed.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0))[0];
  }
}

class Semaphore {
  private permits: number;
  private queue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  private async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }

  private release(): void {
    this.permits++;
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      this.permits--;
      resolve?.();
    }
  }
}
