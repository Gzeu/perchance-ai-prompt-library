/**
 * Decision Engine for Autonomous Perchance Agent System
 * Intelligently selects tools and workflows based on context, quality metrics, and goals
 */

import type { ValidationResult } from '../types/perchance.js';

export interface DecisionContext {
  topic: string;
  category: string;
  complexity: 'simple' | 'medium' | 'complex';
  goal: 'create' | 'improve' | 'test' | 'batch';
  previousAttempts?: number;
  qualityThreshold?: number;
  constraints?: {
    maxTime?: number;
    preferSpeed?: boolean;
    requireTesting?: boolean;
    requirePlaywright?: boolean;
  };
}

export interface ToolDecision {
  tool: string;
  reason: string;
  priority: number;
  params: Record<string, unknown>;
  nextActions?: string[];
}

export interface FormatDecision {
  format: 'perchance' | 'html';
  reason: string;
  confidence: number;
}

export class DecisionEngine {
  private performanceMetrics: Map<string, { avgTime: number; successRate: number }> = new Map();

  /**
   * Decide which tool(s) to use based on context
   */
  decideTool(context: DecisionContext): ToolDecision[] {
    const decisions: ToolDecision[] = [];

    switch (context.goal) {
      case 'create':
        decisions.push(...this.decideCreationWorkflow(context));
        break;
      case 'improve':
        decisions.push(...this.decideImprovementWorkflow(context));
        break;
      case 'test':
        decisions.push(...this.decideTestingWorkflow(context));
        break;
      case 'batch':
        decisions.push(...this.decideBatchWorkflow(context));
        break;
    }

    return this.prioritizeDecisions(decisions, context);
  }

  /**
   * Decide whether to use .perchance or HTML format
   */
  decideFormat(context: DecisionContext): FormatDecision {
    const complexityScore = this.calculateComplexityScore(context);
    const interactiveNeeds = this.detectInteractiveNeeds(context.topic);
    
    // HTML format is better for interactive/complex generators
    if (complexityScore > 0.7 || interactiveNeeds) {
      return {
        format: 'html',
        reason: 'High complexity or interactive requirements detected - HTML format provides better UX',
        confidence: 0.85
      };
    }

    // .perchance format is better for simple text generation
    return {
      format: 'perchance',
      reason: 'Simple text generation - .perchance format is more maintainable',
      confidence: 0.9
    };
  }

  /**
   * Decide if generator needs improvement based on validation results
   */
  needsImprovement(validation: ValidationResult, context: DecisionContext): boolean {
    const qualityScore = this.calculateQualityScore(validation);
    const threshold = context.qualityThreshold || 0.7;

    // Always improve if there are errors
    if (validation.errors.length > 0) return true;

    // Improve if quality is below threshold
    if (qualityScore < threshold) return true;

    // Improve if this is a retry attempt
    if (context.previousAttempts && context.previousAttempts > 0) return true;

    return false;
  }

  /**
   * Decide which improvement strategy to use
   */
  decideImprovementStrategy(validation: ValidationResult): string {
    if (validation.errors.length > 0) {
      return 'error-correction';
    }

    if (validation.warnings.length > 3) {
      return 'warning-resolution';
    }

    if (!validation.stats.hasOutput) {
      return 'structure-fix';
    }

    if (validation.stats.totalItems < 10) {
      return 'content-expansion';
    }

    return 'quality-enhancement';
  }

  private decideCreationWorkflow(context: DecisionContext): ToolDecision[] {
    const decisions: ToolDecision[] = [];

    // Always start with generation
    decisions.push({
      tool: 'generate_perchance',
      reason: 'Initial generator creation from topic',
      priority: 1,
      params: {
        topic: context.topic,
        category: context.category,
        style: this.mapComplexityToStyle(context.complexity),
        itemCount: this.calculateItemCount(context.complexity)
      },
      nextActions: ['validate_syntax']
    });

    // Always validate after generation
    decisions.push({
      tool: 'validate_syntax',
      reason: 'Ensure generated code is valid before proceeding',
      priority: 2,
      params: {},
      nextActions: context.constraints?.requireTesting ? ['run_on_perchance'] : ['preview_rolls']
    });

    // Preview or run based on constraints
    if (context.constraints?.requireTesting && context.constraints?.requirePlaywright) {
      decisions.push({
        tool: 'run_on_perchance',
        reason: 'Full browser testing required by constraints',
        priority: 3,
        params: { rolls: 10 },
        nextActions: []
      });
    } else {
      decisions.push({
        tool: 'preview_rolls',
        reason: 'Quick local preview without browser overhead',
        priority: 3,
        params: { count: 5 },
        nextActions: []
      });
    }

    return decisions;
  }

  private decideImprovementWorkflow(context: DecisionContext): ToolDecision[] {
    const decisions: ToolDecision[] = [];

    decisions.push({
      tool: 'improve_generator',
      reason: 'Iterative improvement based on feedback',
      priority: 1,
      params: {
        strategy: 'adaptive',
        maxIterations: Math.min(context.previousAttempts || 1, 3)
      },
      nextActions: ['validate_syntax', 'preview_rolls']
    });

    decisions.push({
      tool: 'validate_syntax',
      reason: 'Validate improvements',
      priority: 2,
      params: {},
      nextActions: []
    });

    return decisions;
  }

  private decideTestingWorkflow(context: DecisionContext): ToolDecision[] {
    const decisions: ToolDecision[] = [];

    if (context.constraints?.requirePlaywright) {
      decisions.push({
        tool: 'run_on_perchance',
        reason: 'Full browser testing for accuracy',
        priority: 1,
        params: { rolls: 20, screenshot: true },
        nextActions: []
      });
    }

    decisions.push({
      tool: 'autonomous_test',
      reason: 'Comprehensive automated testing suite',
      priority: 2,
      params: {
        testScenarios: ['edge-cases', 'stress-test', 'regression'],
        qualityThreshold: context.qualityThreshold || 0.8
      },
      nextActions: []
    });

    return decisions;
  }

  private decideBatchWorkflow(context: DecisionContext): ToolDecision[] {
    const decisions: ToolDecision[] = [];

    decisions.push({
      tool: 'batch_generate',
      reason: 'Coordinated batch generation of related generators',
      priority: 1,
      params: {
        baseTopic: context.topic,
        category: context.category,
        variations: 5,
        parallel: true
      },
      nextActions: ['validate_syntax', 'preview_rolls']
    });

    decisions.push({
      tool: 'validate_syntax',
      reason: 'Batch validation of all generated generators',
      priority: 2,
      params: {},
      nextActions: []
    });

    return decisions;
  }

  private prioritizeDecisions(decisions: ToolDecision[], context: DecisionContext): ToolDecision[] {
    // Sort by priority, but consider constraints
    let sorted = decisions.sort((a, b) => a.priority - b.priority);

    // If speed is preferred, skip optional tools
    if (context.constraints?.preferSpeed) {
      sorted = sorted.filter(d => d.priority <= 2);
    }

    return sorted;
  }

  private calculateComplexityScore(context: DecisionContext): number {
    let score = 0.5;

    // Topic complexity indicators
    const complexKeywords = ['interactive', 'game', 'simulation', 'visual', 'animation', 'canvas'];
    const hasComplexKeyword = complexKeywords.some(kw => 
      context.topic.toLowerCase().includes(kw)
    );
    if (hasComplexKeyword) score += 0.3;

    // Category complexity
    if (context.category === 'custom') score += 0.2;

    // Explicit complexity setting
    if (context.complexity === 'complex') score += 0.3;
    if (context.complexity === 'simple') score -= 0.2;

    return Math.min(1, Math.max(0, score));
  }

  private detectInteractiveNeeds(topic: string): boolean {
    const interactiveKeywords = [
      'game', 'play', 'click', 'button', 'interactive', 'visual',
      'canvas', 'animation', 'simulation', 'explorer', 'map'
    ];
    return interactiveKeywords.some(kw => topic.toLowerCase().includes(kw));
  }

  private mapComplexityToStyle(complexity: string): string {
    switch (complexity) {
      case 'simple': return 'simple';
      case 'complex': return 'complex';
      default: return 'nested';
    }
  }

  private calculateItemCount(complexity: string): number {
    switch (complexity) {
      case 'simple': return 8;
      case 'complex': return 25;
      default: return 15;
    }
  }

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

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Update performance metrics for learning
   */
  updateMetrics(tool: string, duration: number, success: boolean): void {
    const existing = this.performanceMetrics.get(tool) || { avgTime: 0, successRate: 0 };
    
    // Exponential moving average
    const alpha = 0.2;
    existing.avgTime = alpha * duration + (1 - alpha) * existing.avgTime;
    existing.successRate = alpha * (success ? 1 : 0) + (1 - alpha) * existing.successRate;
    
    this.performanceMetrics.set(tool, existing);
  }

  /**
   * Get performance metrics for a tool
   */
  getMetrics(tool: string): { avgTime: number; successRate: number } | undefined {
    return this.performanceMetrics.get(tool);
  }
}