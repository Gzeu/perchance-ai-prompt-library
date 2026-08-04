/**
 * Autonomous Testing Suite for Autonomous Perchance Agent System
 * Automatically generates and executes comprehensive test scenarios
 */

import { validatePerchance } from '../core/validator.js';
import { previewRolls } from '../core/exporter.js';
import type { ValidationResult } from '../types/perchance.js';

export interface TestScenario {
  name: string;
  description: string;
  testFn: (code: string) => TestResult;
  category: 'edge-cases' | 'stress-test' | 'regression' | 'quality' | 'functional';
}

export interface TestResult {
  scenario: string;
  passed: boolean;
  score: number;
  details: string;
  executionTime: number;
  issues: string[];
}

export interface TestSuite {
  scenarios: TestScenario[];
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    avgScore: number;
    totalTime: number;
  };
}

export interface TestConfig {
  scenarios?: ('edge-cases' | 'stress-test' | 'regression' | 'quality' | 'functional')[];
  qualityThreshold?: number;
  maxIterations?: number;
  includeStressTest?: boolean;
}

export class AutonomousTestingSuite {
  private builtInScenarios: TestScenario[] = [
    // Edge case scenarios
    {
      name: 'empty-lists',
      description: 'Test handling of empty lists',
      category: 'edge-cases',
      testFn: (code: string) => this.testEmptyLists(code)
    },
    {
      name: 'deep-nesting',
      description: 'Test handling of deeply nested references',
      category: 'edge-cases',
      testFn: (code: string) => this.testDeepNesting(code)
    },
    {
      name: 'special-characters',
      description: 'Test handling of special characters',
      category: 'edge-cases',
      testFn: (code: string) => this.testSpecialCharacters(code)
    },
    {
      name: 'missing-references',
      description: 'Test handling of missing list references',
      category: 'edge-cases',
      testFn: (code: string) => this.testMissingReferences(code)
    },

    // Stress test scenarios
    {
      name: 'large-generation',
      description: 'Test performance with large number of rolls',
      category: 'stress-test',
      testFn: (code: string) => this.testLargeGeneration(code)
    },
    {
      name: 'complex-references',
      description: 'Test performance with complex reference chains',
      category: 'stress-test',
      testFn: (code: string) => this.testComplexReferences(code)
    },

    // Quality scenarios
    {
      name: 'variety-check',
      description: 'Check for sufficient variety in outputs',
      category: 'quality',
      testFn: (code: string) => this.testVariety(code)
    },
    {
      name: 'coherence-check',
      description: 'Check for logical coherence in outputs',
      category: 'quality',
      testFn: (code: string) => this.testCoherence(code)
    },
    {
      name: 'weight-distribution',
      description: 'Check weight distribution in weighted lists',
      category: 'quality',
      testFn: (code: string) => this.testWeightDistribution(code)
    },

    // Functional scenarios
    {
      name: 'output-list-exists',
      description: 'Verify output list exists',
      category: 'functional',
      testFn: (code: string) => this.testOutputListExists(code)
    },
    {
      name: 'valid-syntax',
      description: 'Verify syntax is valid',
      category: 'functional',
      testFn: (code: string) => this.testValidSyntax(code)
    },
    {
      name: 'no-infinite-loops',
      description: 'Check for potential infinite loops',
      category: 'functional',
      testFn: (code: string) => this.testNoInfiniteLoops(code)
    }
  ];

  /**
   * Run comprehensive test suite on generator code
   */
  async runTestSuite(code: string, config: TestConfig = {}): Promise<TestSuite> {
    const startTime = Date.now();
    const scenarios = this.selectScenarios(config);
    const results: TestResult[] = [];

    for (const scenario of scenarios) {
      const result = await this.executeScenario(scenario, code);
      results.push(result);
    }

    const endTime = Date.now();
    const summary = this.calculateSummary(results, startTime, endTime);

    return {
      scenarios,
      results,
      summary
    };
  }

  /**
   * Select scenarios based on configuration
   */
  private selectScenarios(config: TestConfig): TestScenario[] {
    if (config.scenarios && config.scenarios.length > 0) {
      return this.builtInScenarios.filter(s => 
        config.scenarios!.includes(s.category)
      );
    }

    // Default: run all scenarios except stress tests unless explicitly requested
    if (config.includeStressTest) {
      return this.builtInScenarios;
    }

    return this.builtInScenarios.filter(s => s.category !== 'stress-test');
  }

  /**
   * Execute a single test scenario
   */
  private async executeScenario(scenario: TestScenario, code: string): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const result = scenario.testFn(code);
      const executionTime = Date.now() - startTime;
      
      return {
        scenario: scenario.name,
        passed: result.passed,
        score: result.score,
        details: result.details,
        executionTime,
        issues: result.issues
      };
    } catch (error: any) {
      return {
        scenario: scenario.name,
        passed: false,
        score: 0,
        details: `Test execution failed: ${error.message}`,
        executionTime: Date.now() - startTime,
        issues: [error.message]
      };
    }
  }

  /**
   * Calculate test suite summary
   */
  private calculateSummary(results: TestResult[], startTime: number, endTime: number): TestSuite['summary'] {
    const passed = results.filter(r => r.passed).length;
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    return {
      total: results.length,
      passed,
      failed: results.length - passed,
      avgScore,
      totalTime: endTime - startTime
    };
  }

  // Test scenario implementations

  private testEmptyLists(code: string): TestResult {
    const lines = code.split('\n');
    const listStarts = lines.filter(l => l.trim() && !l.startsWith(' ') && !l.trim().startsWith('//'));
    
    const issues: string[] = [];
    let passed = true;

    for (const line of listStarts) {
      const listName = line.trim();
      const listStartIndex = lines.indexOf(line);
      const nextListIndex = lines.findIndex((l, i) => 
        i > listStartIndex && l.trim() && !l.startsWith(' ') && !l.trim().startsWith('//')
      );
      
      const listItems = lines.slice(listStartIndex + 1, nextListIndex === -1 ? undefined : nextListIndex)
        .filter(l => l.trim().startsWith('  ') && !l.trim().startsWith('//'));

      if (listItems.length === 0) {
        issues.push(`List "${listName}" is empty`);
        passed = false;
      }
    }

    return {
      scenario: 'empty-lists',
      passed,
      score: passed ? 1 : 0,
      details: passed ? 'All lists have items' : `Found ${issues.length} empty lists`,
      executionTime: 0,
      issues
    };
  }

  private testDeepNesting(code: string): TestResult {
    const maxDepth = this.calculateMaxDepth(code);
    const issues: string[] = [];
    
    if (maxDepth > 5) {
      issues.push(`Deep nesting detected (depth: ${maxDepth})`);
    }

    return {
      scenario: 'deep-nesting',
      passed: maxDepth <= 5,
      score: Math.max(0, 1 - (maxDepth - 3) * 0.2),
      details: `Maximum nesting depth: ${maxDepth}`,
      executionTime: 0,
      issues
    };
  }

  private testSpecialCharacters(code: string): TestResult {
    const specialChars = /[<>{}[\]\\]/g;
    const matches = code.match(specialChars);
    const issues: string[] = [];

    if (matches && matches.length > 0) {
      issues.push(`Found ${matches.length} special characters that may need escaping`);
    }

    return {
      scenario: 'special-characters',
      passed: !matches || matches.length === 0,
      score: matches ? Math.max(0, 1 - matches.length * 0.1) : 1,
      details: matches ? `Found ${matches.length} special characters` : 'No problematic special characters',
      executionTime: 0,
      issues
    };
  }

  private testMissingReferences(code: string): TestResult {
    const referencedLists = this.extractReferencedLists(code);
    const definedLists = this.extractDefinedLists(code);
    const issues: string[] = [];

    for (const ref of referencedLists) {
      if (!definedLists.includes(ref)) {
        issues.push(`Referenced list "${ref}" is not defined`);
      }
    }

    return {
      scenario: 'missing-references',
      passed: issues.length === 0,
      score: Math.max(0, 1 - issues.length * 0.3),
      details: issues.length === 0 ? 'All references are valid' : `Found ${issues.length} missing references`,
      executionTime: 0,
      issues
    };
  }

  private testLargeGeneration(code: string): TestResult {
    const startTime = Date.now();
    const issues: string[] = [];

    try {
      const rolls = previewRolls(code, 100);
      const executionTime = Date.now() - startTime;

      if (executionTime > 5000) {
        issues.push(`Slow performance: ${executionTime}ms for 100 rolls`);
      }

      return {
        scenario: 'large-generation',
        passed: executionTime <= 5000,
        score: Math.max(0, 1 - executionTime / 10000),
        details: `Generated 100 rolls in ${executionTime}ms`,
        executionTime,
        issues
      };
    } catch (error: any) {
      return {
        scenario: 'large-generation',
        passed: false,
        score: 0,
        details: `Failed to generate large batch: ${error.message}`,
        executionTime: Date.now() - startTime,
        issues: [error.message]
      };
    }
  }

  private testComplexReferences(code: string): TestResult {
    const startTime = Date.now();
    const issues: string[] = [];

    try {
      const rolls = previewRolls(code, 50);
      const executionTime = Date.now() - startTime;

      // Check if outputs are too similar (might indicate circular references)
      const uniqueOutputs = new Set(rolls);
      if (uniqueOutputs.size < rolls.length * 0.5) {
        issues.push('Low variety in outputs - possible circular references');
      }

      return {
        scenario: 'complex-references',
        passed: uniqueOutputs.size >= rolls.length * 0.5,
        score: uniqueOutputs.size / rolls.length,
        details: `Generated 50 rolls with ${uniqueOutputs.size} unique outputs`,
        executionTime,
        issues
      };
    } catch (error: any) {
      return {
        scenario: 'complex-references',
        passed: false,
        score: 0,
        details: `Failed complex reference test: ${error.message}`,
        executionTime: Date.now() - startTime,
        issues: [error.message]
      };
    }
  }

  private testVariety(code: string): TestResult {
    const rolls = previewRolls(code, 20);
    const uniqueOutputs = new Set(rolls);
    const varietyRatio = uniqueOutputs.size / rolls.length;
    const issues: string[] = [];

    if (varietyRatio < 0.7) {
      issues.push('Low variety in generated outputs');
    }

    return {
      scenario: 'variety-check',
      passed: varietyRatio >= 0.7,
      score: varietyRatio,
      details: `Variety ratio: ${(varietyRatio * 100).toFixed(1)}%`,
      executionTime: 0,
      issues
    };
  }

  private testCoherence(code: string): TestResult {
    const rolls = previewRolls(code, 10);
    const issues: string[] = [];

    // Basic coherence check - outputs should not be empty or just whitespace
    const incoherentOutputs = rolls.filter(r => !r.trim() || r.trim().length < 3);
    
    if (incoherentOutputs.length > 0) {
      issues.push(`Found ${incoherentOutputs.length} incoherent outputs`);
    }

    return {
      scenario: 'coherence-check',
      passed: incoherentOutputs.length === 0,
      score: 1 - (incoherentOutputs.length / rolls.length),
      details: `${rolls.length - incoherentOutputs.length}/${rolls.length} outputs are coherent`,
      executionTime: 0,
      issues
    };
  }

  private testWeightDistribution(code: string): TestResult {
    const lines = code.split('\n');
    const weightedItems = lines.filter(l => l.includes('^'));
    const issues: string[] = [];

    // Check if weights are reasonable
    const extremeWeights = weightedItems.filter(l => {
      const match = l.match(/\^(\d+)/);
      return match && parseInt(match[1]) > 10;
    });

    if (extremeWeights.length > 0) {
      issues.push(`Found ${extremeWeights.length} items with extreme weights (>10)`);
    }

    return {
      scenario: 'weight-distribution',
      passed: extremeWeights.length === 0,
      score: Math.max(0, 1 - extremeWeights.length * 0.2),
      details: `Found ${weightedItems.length} weighted items, ${extremeWeights.length} with extreme weights`,
      executionTime: 0,
      issues
    };
  }

  private testOutputListExists(code: string): TestResult {
    const validation = validatePerchance(code);
    const issues: string[] = [];

    if (!validation.stats.hasOutput) {
      issues.push('Missing output list');
    }

    return {
      scenario: 'output-list-exists',
      passed: validation.stats.hasOutput,
      score: validation.stats.hasOutput ? 1 : 0,
      details: validation.stats.hasOutput ? 'Output list exists' : 'Output list missing',
      executionTime: 0,
      issues
    };
  }

  private testValidSyntax(code: string): TestResult {
    const validation = validatePerchance(code);
    const issues: string[] = validation.errors.map(e => e.message);

    return {
      scenario: 'valid-syntax',
      passed: validation.valid,
      score: validation.valid ? 1 : 0,
      details: validation.valid ? 'Syntax is valid' : `Found ${validation.errors.length} syntax errors`,
      executionTime: 0,
      issues
    };
  }

  private testNoInfiniteLoops(code: string): TestResult {
    const lines = code.split('\n');
    const issues: string[] = [];

    // Check for potential circular references
    const references = this.extractReferenceMap(code);
    const circular = this.detectCircularReferences(references);

    if (circular.length > 0) {
      issues.push(`Potential circular references: ${circular.join(', ')}`);
    }

    return {
      scenario: 'no-infinite-loops',
      passed: circular.length === 0,
      score: circular.length === 0 ? 1 : 0,
      details: circular.length === 0 ? 'No circular references detected' : `Found ${circular.length} potential circular references`,
      executionTime: 0,
      issues
    };
  }

  // Helper methods

  private calculateMaxDepth(code: string): number {
    const references = this.extractReferenceMap(code);
    let maxDepth = 0;

    const calculateDepth = (listName: string, visited: Set<string> = new Set()): number => {
      if (visited.has(listName)) return 0; // Prevent infinite recursion
      visited.add(listName);

      const refs = references.get(listName) || [];
      if (refs.length === 0) return 1;

      const childDepths = refs.map(ref => calculateDepth(ref, new Set(visited)));
      return 1 + Math.max(...childDepths);
    };

    for (const [listName] of references) {
      maxDepth = Math.max(maxDepth, calculateDepth(listName));
    }

    return maxDepth;
  }

  private extractReferencedLists(code: string): string[] {
    const references: string[] = [];
    const refPattern = /\[([a-zA-Z0-9_-]+)\]/g;
    let match;

    while ((match = refPattern.exec(code)) !== null) {
      references.push(match[1]);
    }

    return [...new Set(references)];
  }

  private extractDefinedLists(code: string): string[] {
    const lines = code.split('\n');
    return lines
      .filter(l => l.trim() && !l.startsWith(' ') && !l.trim().startsWith('//'))
      .map(l => l.trim().split(/\s+/)[0]);
  }

  private extractReferenceMap(code: string): Map<string, string[]> {
    const map = new Map<string, string[]>();
    const lines = code.split('\n');
    let currentList = '';

    for (const line of lines) {
      if (line.trim() && !line.startsWith(' ') && !line.trim().startsWith('//')) {
        currentList = line.trim().split(/\s+/)[0];
        map.set(currentList, []);
      } else if (line.startsWith('  ')) {
        const refs = line.match(/\[([a-zA-Z0-9_-]+)\]/g);
        if (refs && currentList) {
          const refNames = refs.map(r => r.slice(1, -1));
          const existing = map.get(currentList) || [];
          map.set(currentList, [...existing, ...refNames]);
        }
      }
    }

    return map;
  }

  private detectCircularReferences(references: Map<string, string[]>): string[] {
    const circular: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const detectCycle = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);

      const neighbors = references.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (detectCycle(neighbor)) {
            circular.push(node);
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          circular.push(node);
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    for (const [node] of references) {
      if (!visited.has(node)) {
        detectCycle(node);
      }
    }

    return [...new Set(circular)];
  }

  /**
   * Run regression test against previous version
   */
  async runRegressionTest(oldCode: string, newCode: string): Promise<{
    improved: boolean;
    qualityChange: number;
    details: string;
  }> {
    const oldValidation = validatePerchance(oldCode);
    const newValidation = validatePerchance(newCode);

    const oldQuality = this.calculateQualityScore(oldValidation);
    const newQuality = this.calculateQualityScore(newValidation);
    const qualityChange = newQuality - oldQuality;

    return {
      improved: qualityChange > 0,
      qualityChange,
      details: qualityChange > 0 
        ? `Quality improved by ${(qualityChange * 100).toFixed(1)}%`
        : qualityChange < 0
        ? `Quality degraded by ${(-qualityChange * 100).toFixed(1)}%`
        : 'Quality unchanged'
    };
  }

  private calculateQualityScore(validation: ValidationResult): number {
    let score = 1.0;
    score -= validation.errors.length * 0.3;
    score -= validation.warnings.length * 0.1;
    if (validation.stats.hasOutput) score += 0.1;
    if (validation.stats.listCount >= 3) score += 0.1;
    if (validation.stats.totalItems >= 15) score += 0.1;
    return Math.min(1, Math.max(0, score));
  }
}