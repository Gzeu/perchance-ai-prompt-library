/**
 * Universal Agent Interface for Autonomous Perchance Agent System
 * Platform-agnostic API layer for consistent behavior across all MCP-compatible platforms
 */

import { DecisionEngine, DecisionContext } from './decision-engine.js';
import { SelfImprovementSystem, ImprovementContext } from './self-improvement.js';
import { BatchCoordinator, BatchRequest } from './batch-coordinator.js';
import { AutonomousTestingSuite, TestConfig } from './autonomous-testing.js';
import { MultiFormatGenerator, MultiFormatRequest } from './multi-format-generator.js';
import { validatePerchance } from '../core/validator.js';

export interface PlatformCapabilities {
  platform: 'claude-desktop' | 'devin' | 'openclaw' | 'opencode' | 'unknown';
  supportsPlaywright: boolean;
  maxResponseSize: number;
  prefersMarkdown: boolean;
  supportsAsync: boolean;
  executionTimeout: number;
}

export interface UniversalRequest {
  action: 'create' | 'improve' | 'test' | 'batch' | 'multi-format' | 'autonomous';
  topic: string;
  category?: string;
  complexity?: 'simple' | 'medium' | 'complex';
  options?: {
    format?: 'perchance' | 'html' | 'auto';
    iterations?: number;
    qualityThreshold?: number;
    requireTesting?: boolean;
    requirePlaywright?: boolean;
    parallel?: boolean;
    variations?: number;
    forceFormat?: 'perchance' | 'html';
    interactiveFeatures?: string[];
    visualElements?: string[];
  };
}

export interface UniversalResponse {
  success: boolean;
  platform: string;
  action: string;
  result: any;
  metadata: {
    executionTime: number;
    platformCapabilities: PlatformCapabilities;
    decisionPath: string[];
    qualityScore?: number;
    warnings?: string[];
  };
  error?: string;
}

export class UniversalAgentInterface {
  private decisionEngine: DecisionEngine;
  private improvementSystem: SelfImprovementSystem;
  private batchCoordinator: BatchCoordinator;
  private testingSuite: AutonomousTestingSuite;
  private multiFormatGenerator: MultiFormatGenerator;
  private currentPlatform: PlatformCapabilities;

  constructor() {
    this.decisionEngine = new DecisionEngine();
    this.improvementSystem = new SelfImprovementSystem();
    this.batchCoordinator = new BatchCoordinator();
    this.testingSuite = new AutonomousTestingSuite();
    this.multiFormatGenerator = new MultiFormatGenerator();
    this.currentPlatform = this.detectPlatform();
  }

  /**
   * Main entry point for universal agent interaction
   */
  async execute(request: UniversalRequest): Promise<UniversalResponse> {
    const startTime = Date.now();
    const decisionPath: string[] = [];

    try {
      // Log platform info
      decisionPath.push(`Platform: ${this.currentPlatform.platform}`);
      decisionPath.push(`Action: ${request.action}`);

      // Route to appropriate handler
      let result: any;
      switch (request.action) {
        case 'create':
          result = await this.handleCreate(request, decisionPath);
          break;
        case 'improve':
          result = await this.handleImprove(request, decisionPath);
          break;
        case 'test':
          result = await this.handleTest(request, decisionPath);
          break;
        case 'batch':
          result = await this.handleBatch(request, decisionPath);
          break;
        case 'multi-format':
          result = await this.handleMultiFormat(request, decisionPath);
          break;
        case 'autonomous':
          result = await this.handleAutonomous(request, decisionPath);
          break;
        default:
          throw new Error(`Unknown action: ${request.action}`);
      }

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        platform: this.currentPlatform.platform,
        action: request.action,
        result,
        metadata: {
          executionTime,
          platformCapabilities: this.currentPlatform,
          decisionPath,
          qualityScore: result.qualityScore
        }
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      return {
        success: false,
        platform: this.currentPlatform.platform,
        action: request.action,
        result: null,
        metadata: {
          executionTime,
          platformCapabilities: this.currentPlatform,
          decisionPath,
          warnings: [error.message]
        },
        error: error.message
      };
    }
  }

  /**
   * Handle create action
   */
  private async handleCreate(request: UniversalRequest, decisionPath: string[]): Promise<any> {
    const context: DecisionContext = {
      topic: request.topic,
      category: request.category || 'custom',
      complexity: request.complexity || 'medium',
      goal: 'create',
      constraints: {
        requireTesting: request.options?.requireTesting,
        requirePlaywright: request.options?.requirePlaywright && this.currentPlatform.supportsPlaywright
      }
    };

    decisionPath.push('Decision: Create workflow');

    // Use decision engine to determine tools
    const decisions = this.decisionEngine.decideTool(context);
    decisionPath.push(`Tools: ${decisions.map(d => d.tool).join(' -> ')}`);

    // Execute tools based on platform capabilities
    const format = request.options?.format || 'auto';
    if (format === 'html' || (format === 'auto' && this.shouldUseHTML(request.topic))) {
      decisionPath.push('Format: HTML');
      return await this.createHTMLGenerator(request);
    } else {
      decisionPath.push('Format: Perchance');
      return await this.createPerchanceGenerator(request);
    }
  }

  /**
   * Handle improve action
   */
  private async handleImprove(request: UniversalRequest, decisionPath: string[]): Promise<any> {
    if (!request.options?.format) {
      throw new Error('Improve action requires existing code - use format option');
    }

    decisionPath.push('Decision: Improvement workflow');

    const code = request.options.format as string;
    const validation = validatePerchance(code);

    const improvementContext: ImprovementContext = {
      code,
      validation,
      iteration: 0,
      maxIterations: request.options?.iterations || 3,
      strategy: 'quality-enhancement',
      qualityGoal: request.options?.qualityThreshold || 0.8
    };

    const result = await this.improvementSystem.improveGenerator(improvementContext);
    decisionPath.push(`Improvements: ${result.improvements.join(', ')}`);

    return {
      originalCode: code,
      improvedCode: result.improvedCode,
      validation: result.validation,
      preview: result.preview,
      iterations: result.iteration,
      improvements: result.improvements,
      converged: result.converged,
      qualityScore: result.qualityScore
    };
  }

  /**
   * Handle test action
   */
  private async handleTest(request: UniversalRequest, decisionPath: string[]): Promise<any> {
    if (!request.options?.format) {
      throw new Error('Test action requires code - use format option');
    }

    decisionPath.push('Decision: Testing workflow');

    const code = request.options.format as string;
    const testConfig: TestConfig = {
      scenarios: request.options?.requirePlaywright && this.currentPlatform.supportsPlaywright
        ? ['edge-cases', 'stress-test', 'regression', 'quality', 'functional']
        : ['edge-cases', 'quality', 'functional'],
      qualityThreshold: request.options?.qualityThreshold || 0.8,
      includeStressTest: request.options?.requirePlaywright && this.currentPlatform.supportsPlaywright
    };

    const testSuite = await this.testingSuite.runTestSuite(code, testConfig);
    decisionPath.push(`Tests: ${testSuite.summary.passed}/${testSuite.summary.total} passed`);

    return testSuite;
  }

  /**
   * Handle batch action
   */
  private async handleBatch(request: UniversalRequest, decisionPath: string[]): Promise<any> {
    decisionPath.push('Decision: Batch workflow');

    const batchRequest: BatchRequest = {
      baseTopic: request.topic,
      category: request.category || 'custom',
      variations: request.options?.variations || 5,
      parallel: request.options?.parallel || true,
      constraints: {
        maxConcurrent: 3, // Respect API limits
        qualityThreshold: request.options?.qualityThreshold || 0.7,
        requireValidation: true,
        requirePreview: true
      }
    };

    const result = await this.batchCoordinator.executeBatch(batchRequest);
    decisionPath.push(`Batch: ${result.summary.completed}/${result.summary.total} completed`);

    return result;
  }

  /**
   * Handle multi-format action
   */
  private async handleMultiFormat(request: UniversalRequest, decisionPath: string[]): Promise<any> {
    decisionPath.push('Decision: Multi-format workflow');

    const multiFormatRequest: MultiFormatRequest = {
      topic: request.topic,
      category: request.category || 'custom',
      complexity: request.complexity || 'medium',
      forceFormat: request.options?.forceFormat,
      interactiveFeatures: request.options?.interactiveFeatures,
      visualElements: request.options?.visualElements
    };

    const result = await this.multiFormatGenerator.generateOptimalFormat(multiFormatRequest);
    decisionPath.push(`Format: ${result.format}`);

    return result;
  }

  /**
   * Handle fully autonomous action
   */
  private async handleAutonomous(request: UniversalRequest, decisionPath: string[]): Promise<any> {
    decisionPath.push('Decision: Fully autonomous workflow');

    // Step 1: Generate
    decisionPath.push('Step 1: Generate');
    const createResult = await this.handleCreate(request, decisionPath);

    // Step 2: Validate and test
    decisionPath.push('Step 2: Validate and test');
    const testRequest = { ...request, options: { ...request.options, format: createResult.code } };
    const testResult = await this.handleTest(testRequest, decisionPath);

    // Step 3: Improve if needed
    if (testResult.summary.avgScore < (request.options?.qualityThreshold || 0.8)) {
      decisionPath.push('Step 3: Improve (quality below threshold)');
      const improveRequest = { 
        ...request, 
        options: { 
          ...request.options, 
          format: createResult.code,
          iterations: 2 
        } 
      };
      const improveResult = await this.handleImprove(improveRequest, decisionPath);
      
      return {
        createResult,
        testResult,
        improveResult,
        finalCode: improveResult.improvedCode,
        finalQuality: improveResult.qualityScore,
        autonomousSteps: ['generate', 'test', 'improve']
      };
    }

    return {
      createResult,
      testResult,
      finalCode: createResult.code,
      finalQuality: createResult.qualityScore,
      autonomousSteps: ['generate', 'test']
    };
  }

  /**
   * Create perchance format generator
   */
  private async createPerchanceGenerator(request: UniversalRequest): Promise<any> {
    const { generateTool } = await import('../mcp/tools/generate-tool.js');
    
    const args = {
      topic: request.topic,
      category: request.category || 'custom',
      style: this.mapComplexityToStyle(request.complexity || 'medium'),
      itemCount: 15
    };

    const result = await generateTool.handler(args);
    const content = JSON.parse(result.content[0].text);

    return {
      code: content.code,
      filename: content.filename,
      validation: {
        valid: content.valid,
        warnings: content.warnings,
        stats: content.stats
      },
      preview: content.previewRolls,
      qualityScore: this.calculateQualityScore(content.valid, content.warnings.length),
      pasteUrl: content.pasteUrl
    };
  }

  /**
   * Create HTML format generator
   */
  private async createHTMLGenerator(request: UniversalRequest): Promise<any> {
    const multiFormatRequest: MultiFormatRequest = {
      topic: request.topic,
      category: request.category || 'custom',
      complexity: request.complexity || 'medium',
      forceFormat: 'html',
      interactiveFeatures: request.options?.interactiveFeatures,
      visualElements: request.options?.visualElements
    };

    const result = await this.multiFormatGenerator.generateHTMLFormat(multiFormatRequest);

    return {
      code: result.code,
      files: result.files,
      format: 'html',
      reason: result.reason,
      pasteUrl: 'https://perchance.org/minimal#edit'
    };
  }

  /**
   * Detect current platform
   */
  private detectPlatform(): PlatformCapabilities {
    const env = process.env;
    
    // Check for platform-specific indicators
    if (env.CLAUDE_DESKTOP) {
      return {
        platform: 'claude-desktop',
        supportsPlaywright: true,
        maxResponseSize: 100000,
        prefersMarkdown: true,
        supportsAsync: true,
        executionTimeout: 30000
      };
    }

    if (env.DEVIN || env.CLAUDE_CODE) {
      return {
        platform: 'devin',
        supportsPlaywright: true,
        maxResponseSize: 500000,
        prefersMarkdown: false,
        supportsAsync: true,
        executionTimeout: 60000
      };
    }

    if (env.OPENCLAW) {
      return {
        platform: 'openclaw',
        supportsPlaywright: true,
        maxResponseSize: 100000,
        prefersMarkdown: true,
        supportsAsync: true,
        executionTimeout: 30000
      };
    }

    if (env.OPENCODE) {
      return {
        platform: 'opencode',
        supportsPlaywright: true,
        maxResponseSize: 200000,
        prefersMarkdown: false,
        supportsAsync: true,
        executionTimeout: 45000
      };
    }

    // Default capabilities
    return {
      platform: 'unknown',
      supportsPlaywright: true,
      maxResponseSize: 100000,
      prefersMarkdown: true,
      supportsAsync: true,
      executionTimeout: 30000
    };
  }

  /**
   * Determine if HTML format should be used
   */
  private shouldUseHTML(topic: string): boolean {
    const interactiveKeywords = [
      'game', 'play', 'click', 'button', 'interactive', 'visual',
      'canvas', 'animation', 'simulation', 'explorer', 'map'
    ];
    return interactiveKeywords.some(kw => topic.toLowerCase().includes(kw));
  }

  /**
   * Map complexity to style
   */
  private mapComplexityToStyle(complexity: string): string {
    switch (complexity) {
      case 'simple': return 'simple';
      case 'complex': return 'complex';
      default: return 'nested';
    }
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(valid: boolean, warningCount: number): number {
    let score = 1.0;
    if (!valid) score -= 0.5;
    score -= warningCount * 0.1;
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Get current platform capabilities
   */
  getPlatformCapabilities(): PlatformCapabilities {
    return this.currentPlatform;
  }

  /**
   * Set platform manually (for testing)
   */
  setPlatform(platform: PlatformCapabilities): void {
    this.currentPlatform = platform;
  }
}