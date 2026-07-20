/**
 * Perchance syntax validator
 * Checks for common errors in .perchance generator code
 */

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: GeneratorStats;
}

export interface ValidationError {
  line: number;
  message: string;
  code: string;
}

export interface ValidationWarning {
  line: number;
  message: string;
}

export interface GeneratorStats {
  listCount: number;
  totalItems: number;
  hasOutput: boolean;
  hasWeighted: boolean;
  hasNested: boolean;
  hasImports: boolean;
}

export function validatePerchance(code: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const lines = code.split('\n');

  let currentList: string | null = null;
  let listCount = 0;
  let totalItems = 0;
  let hasOutput = false;
  let hasWeighted = false;
  let hasNested = false;
  let hasImports = false;
  let emptyListStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('//')) continue;

    if (trimmed.startsWith('import ')) {
      hasImports = true;
      continue;
    }

    // List header (no indent)
    if (!line.startsWith(' ') && !line.startsWith('\t') && trimmed.endsWith('')) {
      if (trimmed === 'output' || trimmed === 'generate') hasOutput = true;
      if (currentList && emptyListStart === i - 1) {
        warnings.push({ line: lineNum, message: `List "${currentList}" appears to be empty` });
      }
      currentList = trimmed;
      listCount++;
      emptyListStart = i;
      continue;
    }

    // List item (indented)
    if ((line.startsWith('  ') || line.startsWith('\t')) && currentList) {
      totalItems++;
      emptyListStart = -1;

      // Check weighted syntax
      if (/\^\d/.test(trimmed)) hasWeighted = true;

      // Check nested reference [listName]
      if (/\[\w+\]/.test(trimmed)) hasNested = true;

      // Invalid weight
      const weightMatch = trimmed.match(/\^([^\s]+)/);
      if (weightMatch && isNaN(parseFloat(weightMatch[1]))) {
        errors.push({
          line: lineNum,
          message: `Invalid weight value: "${weightMatch[1]}" — must be a number`,
          code: 'INVALID_WEIGHT'
        });
      }
    }
  }

  if (listCount === 0) {
    errors.push({ line: 1, message: 'No lists defined', code: 'NO_LISTS' });
  }

  if (!hasOutput) {
    warnings.push({ line: 1, message: 'No "output" list found — generator may not display results on perchance.ai' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: { listCount, totalItems, hasOutput, hasWeighted, hasNested, hasImports }
  };
}
