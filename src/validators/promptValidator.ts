// ============================================================
// PROMPT VALIDATOR — Input sanitization & content filtering
// v4.0.0
// ============================================================

export interface ValidationResult {
  valid: boolean;
  sanitized: string;
  warnings: string[];
  errors: string[];
}

const HARMFUL_PATTERNS: RegExp[] = [
  /\b(nude|naked|nsfw|explicit|gore|violence|blood|weapon)\b/gi,
  /\b(child|minor|underage|loli|shota)\b/gi,
  /<script[\s\S]*?>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
];

const INJECTION_PATTERNS: RegExp[] = [
  /[;|&`$]/g,
  /\.\.[/\\]/g,
  /__proto__/gi,
  /constructor\.prototype/gi,
];

const MAX_PROMPT_LENGTH = 2000;
const MAX_STYLE_LENGTH = 100;
const MAX_SUBJECT_LENGTH = 500;

export class PromptValidator {
  /**
   * Validates and sanitizes a style string.
   */
  validateStyle(style: string): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    let sanitized = style.trim();

    if (!sanitized) {
      errors.push('Style cannot be empty');
      return { valid: false, sanitized: '', warnings, errors };
    }
    if (sanitized.length > MAX_STYLE_LENGTH) {
      warnings.push(`Style truncated to ${MAX_STYLE_LENGTH} chars`);
      sanitized = sanitized.substring(0, MAX_STYLE_LENGTH);
    }
    sanitized = this.removeInjections(sanitized);
    return { valid: errors.length === 0, sanitized, warnings, errors };
  }

  /**
   * Validates and sanitizes a subject string.
   */
  validateSubject(subject: string): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    let sanitized = subject.trim();

    if (!sanitized) {
      errors.push('Subject cannot be empty');
      return { valid: false, sanitized: '', warnings, errors };
    }
    if (sanitized.length > MAX_SUBJECT_LENGTH) {
      warnings.push(`Subject truncated to ${MAX_SUBJECT_LENGTH} chars`);
      sanitized = sanitized.substring(0, MAX_SUBJECT_LENGTH);
    }

    const harmfulMatch = this.checkHarmfulContent(sanitized);
    if (harmfulMatch) {
      errors.push(`Potentially harmful content detected: "${harmfulMatch}"`);
      return { valid: false, sanitized: '', warnings, errors };
    }

    sanitized = this.removeInjections(sanitized);
    return { valid: errors.length === 0, sanitized, warnings, errors };
  }

  /**
   * Validates a full prompt string.
   */
  validatePrompt(prompt: string): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    let sanitized = prompt.trim();

    if (sanitized.length > MAX_PROMPT_LENGTH) {
      warnings.push(`Prompt truncated to ${MAX_PROMPT_LENGTH} chars`);
      sanitized = sanitized.substring(0, MAX_PROMPT_LENGTH);
    }

    const harmfulMatch = this.checkHarmfulContent(sanitized);
    if (harmfulMatch) {
      errors.push(`Content policy violation: "${harmfulMatch}"`);
    }

    sanitized = this.removeInjections(sanitized);
    return { valid: errors.length === 0, sanitized, warnings, errors };
  }

  /**
   * Validates quality level, clamped to 5-10.
   */
  validateQuality(quality: unknown): number {
    const q = parseInt(String(quality));
    if (isNaN(q)) return 8;
    return Math.max(5, Math.min(10, q));
  }

  /**
   * Validates seed value. Returns undefined for invalid seeds.
   */
  validateSeed(seed: unknown): number | undefined {
    if (seed === undefined || seed === null || seed === '') return undefined;
    const s = parseInt(String(seed));
    return isNaN(s) ? undefined : Math.abs(s);
  }

  private checkHarmfulContent(text: string): string | null {
    for (const pattern of HARMFUL_PATTERNS) {
      const match = text.match(pattern);
      if (match) return match[0] ?? null;
    }
    return null;
  }

  private removeInjections(text: string): string {
    let sanitized = text;
    for (const pattern of INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }
    return sanitized.replace(/\s+/g, ' ').trim();
  }
}

/** Singleton validator instance */
export const validator = new PromptValidator();
