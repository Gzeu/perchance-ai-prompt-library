/**
 * Self-Improvement System for Autonomous Perchance Agent System
 * Implements feedback loops for iterative generator improvement
 */

import { validatePerchance } from '../core/validator.js';
import { previewRolls } from '../core/exporter.js';
import Groq from 'groq-sdk';
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
  private groq: Groq;
  private improvementHistory: Map<string, ImprovementResult[]> = new Map();

  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  /**
   * Main improvement loop - iteratively improves generator until quality goal is met
   */
  async improveGenerator(context: ImprovementContext): Promise<ImprovementResult> {
    let currentCode = context.code;
    let currentValidation = context.validation;
    let currentPreview = context.preview || previewRolls(currentCode, 5);
    let improvements: string[] = [];
    let converged = false;

    for (let i = 0; i < context.maxIterations; i++) {
      const iterationContext = {
        ...context,
        code: currentCode,
        validation: currentValidation,
        preview: currentPreview,
        iteration: i + 1
      };

      const qualityScore = this.calculateQualityScore(currentValidation);
      
      // Check if we've reached the quality goal
      if (qualityScore >= context.qualityGoal && currentValidation.errors.length === 0) {
        converged = true;
        break;
      }

      // Determine improvement strategy
      const strategy = context.strategy || this.determineStrategy(currentValidation, i);

      // Apply improvement
      const improvementResult = await this.applyImprovement(iterationContext, strategy);
      
      currentCode = improvementResult.code;
      currentValidation = improvementResult.validation;
      currentPreview = improvementResult.preview;
      improvements.push(...improvementResult.improvements);

      // Check for convergence (no significant improvement)
      if (improvementResult.improvements.length === 0) {
        converged = true;
        break;
      }
    }

    const result: ImprovementResult = {
      improvedCode: currentCode,
      validation: currentValidation,
      preview: currentPreview,
      iteration: improvements.length > 0 ? context.maxIterations : 0,
      qualityScore: this.calculateQualityScore(currentValidation),
      improvements,
      converged
    };

    // Store in history for learning
    const key = this.generateHash(context.code);
    const history = this.improvementHistory.get(key) || [];
    history.push(result);
    this.improvementHistory.set(key, history);

    return result;
  }

  /**
   * Determine the best improvement strategy based on validation results
   */
  private determineStrategy(validation: ValidationResult, iteration: number): string {
    // Priority: fix errors first, then warnings, then enhance quality
    if (validation.errors.length > 0) {
      return 'error-correction';
    }

    if (validation.warnings.length > 0) {
      return 'warning-resolution';
    }

    if (!validation.stats.hasOutput) {
      return 'structure-fix';
    }

    if (validation.stats.totalItems < 10) {
      return 'content-expansion';
    }

    // Later iterations focus on quality enhancement
    if (iteration > 2) {
      return 'quality-enhancement';
    }

    return 'quality-enhancement';
  }

  /**
   * Apply a specific improvement strategy
   */
  private async applyImprovement(
    context: ImprovementContext,
    strategy: string
  ): Promise<{ code: string; validation: ValidationResult; preview: string[]; improvements: string[] }> {
    const improvements: string[] = [];

    switch (strategy) {
      case 'error-correction':
        return await this.fixErrors(context);
      
      case 'warning-resolution':
        return await this.resolveWarnings(context);
      
      case 'structure-fix':
        return await this.fixStructure(context);
      
      case 'content-expansion':
        return await this.expandContent(context);
      
      case 'quality-enhancement':
        return await this.enhanceQuality(context);
      
      default:
        return {
          code: context.code,
          validation: context.validation,
          preview: context.preview || [],
          improvements: []
        };
    }
  }

  /**
   * Fix syntax errors using AI
   */
  private async fixErrors(context: ImprovementContext): Promise<any> {
    const errorDescriptions = context.validation.errors
      .map(e => `Line ${e.line}: ${e.message}`)
      .join('\n');

    const systemPrompt = `You are a Perchance.ai syntax expert. Fix the syntax errors in the given .perchance code.
Return ONLY the corrected code, no explanation.`;

    const userPrompt = `Fix these errors:
${errorDescriptions}

Code:
${context.code}`;

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2048
    });

    const fixedCode = completion.choices[0]?.message?.content?.trim() || context.code;
    const validation = validatePerchance(fixedCode);
    const preview = previewRolls(fixedCode, 5);

    const improvements = [];
    if (validation.errors.length < context.validation.errors.length) {
      improvements.push(`Fixed ${context.validation.errors.length - validation.errors.length} syntax errors`);
    }

    return { code: fixedCode, validation, preview, improvements };
  }

  /**
   * Resolve warnings using AI
   */
  private async resolveWarnings(context: ImprovementContext): Promise<any> {
    const warningDescriptions = context.validation.warnings
      .map(w => `${w.message}`)
      .join('\n');

    const systemPrompt = `You are a Perchance.ai best practices expert. Resolve warnings in the given .perchance code.
Return ONLY the improved code, no explanation.`;

    const userPrompt = `Resolve these warnings:
${warningDescriptions}

Code:
${context.code}`;

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 2048
    });

    const improvedCode = completion.choices[0]?.message?.content?.trim() || context.code;
    const validation = validatePerchance(improvedCode);
    const preview = previewRolls(improvedCode, 5);

    const improvements = [];
    if (validation.warnings.length < context.validation.warnings.length) {
      improvements.push(`Resolved ${context.validation.warnings.length - validation.warnings.length} warnings`);
    }

    return { code: improvedCode, validation, preview, improvements };
  }

  /**
   * Fix structural issues (missing output list, etc.)
   */
  private async fixStructure(context: ImprovementContext): Promise<any> {
    const systemPrompt = `You are a Perchance.ai structure expert. Fix structural issues in the given .perchance code.
Ensure there's an "output" list as the first list. Return ONLY the corrected code.`;

    const userPrompt = `Fix structural issues in this code:
${context.code}`;

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2048
    });

    const fixedCode = completion.choices[0]?.message?.content?.trim() || context.code;
    const validation = validatePerchance(fixedCode);
    const preview = previewRolls(fixedCode, 5);

    const improvements = [];
    if (validation.stats.hasOutput && !context.validation.stats.hasOutput) {
      improvements.push('Added missing output list');
    }

    return { code: fixedCode, validation, preview, improvements };
  }

  /**
   * Expand content by adding more items to lists
   */
  private async expandContent(context: ImprovementContext): Promise<any> {
    const systemPrompt = `You are a Perchance.ai content expert. Expand the content of the given .perchance code by adding more items to each list.
Maintain the existing style and weights. Add 3-5 more items per list. Return ONLY the expanded code.`;

    const userPrompt = `Expand the content of this generator:
${context.code}`;

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2048
    });

    const expandedCode = completion.choices[0]?.message?.content?.trim() || context.code;
    const validation = validatePerchance(expandedCode);
    const preview = previewRolls(expandedCode, 5);

    const improvements = [];
    if (validation.stats.totalItems > context.validation.stats.totalItems) {
      improvements.push(`Added ${validation.stats.totalItems - context.validation.stats.totalItems} items`);
    }

    return { code: expandedCode, validation, preview, improvements };
  }

  /**
   * Enhance overall quality (better variety, more creative content)
   */
  private async enhanceQuality(context: ImprovementContext): Promise<any> {
    const systemPrompt = `You are a Perchance.ai quality expert. Enhance the quality of the given .perchance code.
Improve variety, creativity, and coherence. Add weights for rarity if appropriate. Return ONLY the enhanced code.`;

    const userPrompt = `Enhance the quality of this generator:
${context.code}`;

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.9,
      max_tokens: 2048
    });

    const enhancedCode = completion.choices[0]?.message?.content?.trim() || context.code;
    const validation = validatePerchance(enhancedCode);
    const preview = previewRolls(enhancedCode, 5);

    const improvements = [];
    const qualityImprovement = this.calculateQualityScore(validation) - this.calculateQualityScore(context.validation);
    if (qualityImprovement > 0) {
      improvements.push(`Quality improved by ${(qualityImprovement * 100).toFixed(1)}%`);
    }

    return { code: enhancedCode, validation, preview, improvements };
  }

  /**
   * Calculate quality score from validation results
   */
  private calculateQualityScore(validation: ValidationResult): number {
    let score = 1.0;

    // Penalize errors heavily
    score -= validation.errors.length * 0.3;

    // Penalize warnings moderately
    score -= validation.warnings.length * 0.1;

    // Reward good structure
    if (validation.stats.hasOutput) score += 0.1;
    if (validation.stats.listCount >= 3) score += 0.1;
    if (validation.stats.totalItems >= 15) score += 0.1;
    if (validation.stats.hasNested) score += 0.1;
    if (validation.stats.hasWeighted) score += 0.05;

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Generate a hash key for the improvement history
   */
  private generateHash(code: string): string {
    // Simple hash based on code structure
    const lines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
    return lines.length.toString() + '-' + lines[0]?.substring(0, 20) || 'unknown';
  }

  /**
   * Get improvement history for learning
   */
  getImprovementHistory(code: string): ImprovementResult[] {
    const key = this.generateHash(code);
    return this.improvementHistory.get(key) || [];
  }

  /**
   * Get successful improvement patterns
   */
  getSuccessfulPatterns(): string[] {
    const patterns: string[] = [];
    
    for (const history of this.improvementHistory.values()) {
      const successful = history.filter(r => r.converged && r.qualityScore > 0.8);
      for (const result of successful) {
        patterns.push(...result.improvements);
      }
    }

    // Return most common patterns
    const patternCounts = new Map<string, number>();
    for (const pattern of patterns) {
      patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }

    return Array.from(patternCounts.entries())
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 10)
      .map(([pattern]: [string, number]) => pattern);
  }
}