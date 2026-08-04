// src/index.ts — Perchance AI Toolkit public API
// The autonomous agent uses these to build, validate and preview .perchance generators.

export { validatePerchance } from './core/validator.js';
export { previewRolls, exportGenerator } from './core/exporter.js';
export * from './types/perchance.js';

export const VERSION = '8.0.0';
