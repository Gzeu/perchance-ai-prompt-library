/**
 * Agent Workflow: Improve Generator
 * Takes existing .perchance code and improves it using local
 * validation analysis — no external AI required.
 */

import { validatePerchance } from '../../core/validator.js';
import { previewRolls } from '../../core/exporter.js';
import { improveGeneratorLocally } from '../../agent/template-library.js';

export async function improveGeneratorWorkflow(
  existingCode: string,
  _instructions: string
): Promise<{ originalCode: string; improvedCode: string; changes: string[]; preview: string[] }> {
  const validation = validatePerchance(existingCode);
  console.log(`[Improve] Original: ${validation.stats.listCount} lists, ${validation.stats.totalItems} items`);

  // Determine which strategies to apply based on validation results and instructions
  const strategies: Parameters<typeof improveGeneratorLocally>[1] = [];

  if (validation.errors.length > 0) {
    strategies.push('structure-fix');
  }
  if (!validation.stats.hasOutput) {
    strategies.push('structure-fix');
  }
  if (validation.stats.totalItems < 10) {
    strategies.push('content-expansion');
  }
  if (!validation.stats.hasWeighted) {
    strategies.push('weight-addition');
  }

  // Always try to improve variety
  strategies.push('variety-boost');

  // If no strategies were selected, do a general improvement
  if (strategies.length === 0) {
    strategies.push('content-expansion');
  }

  const { improvedCode, changes } = improveGeneratorLocally(existingCode, [...new Set(strategies)]);
  const improvedValidation = validatePerchance(improvedCode);
  const preview = previewRolls(improvedCode, 8);

  const additionalChanges: string[] = [];
  if (improvedValidation.stats.totalItems > validation.stats.totalItems) {
    additionalChanges.push(`Added ${improvedValidation.stats.totalItems - validation.stats.totalItems} new items`);
  }
  if (!validation.stats.hasWeighted && improvedValidation.stats.hasWeighted) {
    additionalChanges.push('Added weighted probabilities');
  }
  if (!validation.stats.hasNested && improvedValidation.stats.hasNested) {
    additionalChanges.push('Added nested list references');
  }

  return {
    originalCode: existingCode,
    improvedCode,
    changes: [...changes, ...additionalChanges],
    preview,
  };
}
