import type { PromptConfig } from '../types/index.js';

const HARMFUL_PATTERNS: RegExp[] = [
  /\b(nude|naked|nsfw|explicit|pornograph|gore|violence|kill|murder|torture|harm\s+child|child\s+abuse|cp\b)\b/i,
  /<script[^>]*>/i,
  /javascript:/i,
  /on\w+\s*=/i,
];

const MAX_LENGTHS: Record<string, number> = {
  prompt: 2000,
  style: 100,
  subject: 500,
  mood: 50,
};

export interface ValidationResult {
  valid: boolean;
  sanitized?: string;
  errors: string[];
}

export class PromptValidator {
  /**
   * Sanitize a raw text string: strip HTML tags, normalise whitespace,
   * and truncate to the supplied max length.
   */
  sanitize(input: string, maxLength = MAX_LENGTHS.prompt): string {
    let out = input
      .replace(/<[^>]+>/g, '')         // strip HTML
      .replace(/[\u0000-\u001F\u007F]/g, ' ')  // strip control chars
      .replace(/\s+/g, ' ')
      .trim();

    if (out.length > maxLength) {
      out = out.slice(0, maxLength);
    }
    return out;
  }

  /** Return true when the text contains a harmful pattern. */
  isHarmful(text: string): boolean {
    return HARMFUL_PATTERNS.some(rx => rx.test(text));
  }

  /** Validate a full PromptConfig object and return per-field errors. */
  validateConfig(config: Partial<PromptConfig>): ValidationResult {
    const errors: string[] = [];

    if (!config.style || config.style.trim().length === 0) {
      errors.push('style is required');
    } else if (config.style.length > MAX_LENGTHS.style) {
      errors.push(`style must be <= ${MAX_LENGTHS.style} characters`);
    }

    if (!config.subject || config.subject.trim().length === 0) {
      errors.push('subject is required');
    } else if (config.subject.length > MAX_LENGTHS.subject) {
      errors.push(`subject must be <= ${MAX_LENGTHS.subject} characters`);
    }

    if (config.quality !== undefined) {
      if (!Number.isInteger(config.quality) || config.quality < 1 || config.quality > 10) {
        errors.push('quality must be an integer between 1 and 10');
      }
    }

    if (config.seed !== undefined) {
      if (!Number.isInteger(config.seed) || config.seed < 0 || config.seed > 4294967295) {
        errors.push('seed must be an unsigned 32-bit integer (0 – 4294967295)');
      }
    }

    const textToCheck = `${config.style ?? ''} ${config.subject ?? ''}`;
    if (this.isHarmful(textToCheck)) {
      errors.push('input contains disallowed content');
    }

    return { valid: errors.length === 0, errors };
  }

  /** Sanitize style + subject fields inside a config. */
  sanitizeConfig(config: Partial<PromptConfig>): Partial<PromptConfig> {
    return {
      ...config,
      style:   config.style   ? this.sanitize(config.style,   MAX_LENGTHS.style)   : config.style,
      subject: config.subject ? this.sanitize(config.subject, MAX_LENGTHS.subject) : config.subject,
    };
  }

  /** Convenience: validate a raw prompt string. */
  validatePrompt(prompt: string): ValidationResult {
    const errors: string[] = [];
    if (!prompt || prompt.trim().length === 0) {
      errors.push('prompt is empty');
    }
    if (prompt.length > MAX_LENGTHS.prompt) {
      errors.push(`prompt exceeds ${MAX_LENGTHS.prompt} characters`);
    }
    if (this.isHarmful(prompt)) {
      errors.push('prompt contains disallowed content');
    }
    return {
      valid: errors.length === 0,
      sanitized: this.sanitize(prompt),
      errors,
    };
  }
}
