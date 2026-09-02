/**
 * Self-Improvement System for Autonomous Perchance Agent System
 * Implements feedback loops for iterative generator improvement using
 * local validation analysis — no external AI required.
 */

import { validatePerchance } from '../core/validator.js';
import { previewRolls } from '../core/exporter.js';
import { improveGeneratorLocally } from './template-library.js';
import type { ValidationResult } from '../types/perchance.js';

export interface ImprovementContext {
  code: string;
  validation: ValidationResult;
  preview?: string[];
  iteration: number;
  maxIterations: number;
  strategy: 'error-correction' | 'warning-resolution' | 'structure-fix' | 'content-expansion' | 'quality-enhancement';
  qualityGoal: number;
}

export interface ImprovementResult {
  improvedCode: string;
  validation: ValidationResult;
  preview: string[];
  iteration: number;
  qualityScore: number;
  improvements: string[];
  converged: boolean;
}

export class SelfImprovementSystem {
  private improvementHistory: Map<string, ImprovementResult[]> = new Map();

  async improveGenerator(context: ImprovementContext): Promise<ImprovementResult> {
    let currentCode = context.code;
    let improvements: string[] = [];

    for (let i = 0; i < context.maxIterations; i++) {
      const currentValidation = validatePerchance(currentCode);

      // Check convergence
      if (currentValidation.errors.length === 0 && this.calculateQualityScore(currentValidation) >= context.qualityGoal) {
        break;
      }

      const strategy = context.strategy || this.determineStrategy(currentValidation);
      const improvementResult = this.applyImprovement(currentCode, strategy);

      currentCode = improvementResult.code;
      improvements.push(...improvementResult.changes);

      if (improvementResult.changes.length === 0) {
        break;
      }
    }

    const finalValidation = validatePerchance(currentCode);
    const result: ImprovementResult = {
      improvedCode: currentCode,
      validation: finalValidation,
      preview: previewRolls(currentCode, 5),
      iteration: improvements.length > 0 ? context.maxIterations : 0,
      qualityScore: this.calculateQualityScore(finalValidation),
      improvements,
      converged: improvements.length === 0 || finalValidation.errors.length === 0,
    };

    const key = this.generateHash(context.code);
    const history = this.improvementHistory.get(key) || [];
    history.push(result);
    this.improvementHistory.set(key, history);

    return result;
  }

  private determineStrategy(validation: ValidationResult): string {
    if (validation.errors.length > 0) return 'error-correction';
    if (validation.warnings.length > 3) return 'warning-resolution';
    if (!validation.stats.hasOutput) return 'structure-fix';
    if (validation.stats.totalItems < 10) return 'content-expansion';
    return 'quality-enhancement';
  }

  private applyImprovement(
    code: string,
    strategy: string,
  ): { code: string; changes: string[] } {
    let strategies: Parameters<typeof improveGeneratorLocally>[1] = [];

    switch (strategy) {
      case 'error-correction':
      case 'structure-fix':
        strategies = ['structure-fix'];
        break;
      case 'warning-resolution':
        strategies = ['variety-boost'];
        break;
      case 'content-expansion':
        strategies = ['content-expansion', 'variety-boost'];
        break;
      case 'quality-enhancement':
        strategies = ['content-expansion', 'weight-addition', 'variety-boost'];
        break;
      default:
        strategies = ['content-expansion'];
    }

    const result = improveGeneratorLocally(code, strategies);
    return { code: result.improvedCode, changes: result.changes };
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

  private generateHash(code: string): string {
    const lines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
    return lines.length.toString() + '-' + (lines[0]?.substring(0, 20) || 'unknown');
  }

  getImprovementHistory(code: string): ImprovementResult[] {
    const key = this.generateHash(code);
    return this.improvementHistory.get(key) || [];
  }
}
