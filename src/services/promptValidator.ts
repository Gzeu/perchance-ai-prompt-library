// src/services/promptValidator.ts — v4.0.0
import type { ValidationResult, ValidationRule } from '../types/index.js';

const FORBIDDEN_WORDS = ['nsfw', 'explicit', 'nude', 'porn', 'hentai', 'gore'] as const;
const MAX_LENGTH = 2000;
const MIN_LENGTH = 3;

const rules: ValidationRule[] = [
  {
    name: 'not-empty',
    validate: (s) => s.trim().length > 0,
    message: 'Promptul nu poate fi gol',
    severity: 'error',
  },
  {
    name: 'min-length',
    validate: (s) => s.trim().length >= MIN_LENGTH,
    message: `Promptul este prea scurt (min ${MIN_LENGTH} caractere)`,
    severity: 'error',
  },
  {
    name: 'max-length',
    validate: (s) => s.length <= MAX_LENGTH,
    message: `Promptul depășește ${MAX_LENGTH} caractere`,
    severity: 'error',
  },
  {
    name: 'no-forbidden',
    validate: (s) => !FORBIDDEN_WORDS.some((w) => s.toLowerCase().includes(w)),
    message: 'Conținut interzis detectat',
    severity: 'error',
  },
  {
    name: 'has-detail',
    validate: (s) => s.length >= 20,
    message: 'Prompt scurt — rezultate mai bune cu mai multe detalii',
    severity: 'warning',
  },
  {
    name: 'has-commas',
    validate: (s) => s.includes(','),
    message: 'Fără virgule — consideră separarea conceptelor cu virgulă',
    severity: 'warning',
  },
];

export function validatePrompt(input: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Run error rules only if input is non-empty (avoid duplicate 'empty' errors)
  for (const rule of rules) {
    if (rule.name === 'min-length' && input.trim().length === 0) continue;
    if (rule.name === 'has-detail' && input.trim().length === 0) continue;
    if (rule.name === 'has-commas' && input.trim().length === 0) continue;

    if (!rule.validate(input)) {
      if (rule.severity === 'error') errors.push(rule.message);
      else warnings.push(rule.message);
    }
  }

  // Check individual forbidden words
  for (const word of FORBIDDEN_WORDS) {
    if (input.toLowerCase().includes(word)) {
      errors.push(`Conținut interzis: "${word}"`);
    }
  }
  // Remove duplicate generic forbidden message
  const filteredErrors = errors.filter((e) => e !== 'Conținut interzis detectat');

  const sanitized = input.trim().replace(/\s+/g, ' ').slice(0, MAX_LENGTH);
  return { isValid: filteredErrors.length === 0, errors: filteredErrors, warnings, sanitized };
}

export function sanitizePrompt(input: string): string {
  return input.trim().replace(/\s+/g, ' ').slice(0, MAX_LENGTH);
}

export { rules };
