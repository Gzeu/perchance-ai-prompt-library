// src/index.ts — Perchance AI Toolkit public API
// The autonomous agent uses these to build, validate and preview .perchance generators.

export { validatePerchance } from './core/validator.js';
export { previewRolls, exportGenerator } from './core/exporter.js';
export type * from './types/perchance.js';

// Scraping API — lightweight jsdom-based generator scraping
export {
  scrapeGenerator,
  scrapeGeneratorWithJsdom,
  scrapeGeneratorWithPlaywright,
  scrapeMultiple,
  type ScrapedGenerator,
} from './playwright/scraper.js';
export {
  fetchHtml,
  parseHtml,
  fetchAndParseHtml,
  fetchPerchanceGeneratorHtml,
  fetchAndParsePerchanceGenerator,
  extractGeneratorNameFromUrl,
  extractGeneratorFromDocument,
  extractDescriptionFromDocument,
} from './utils/html-scraper.js';

// Perchance-native generation (no external AI)
export { TemplateLibrary, improveGeneratorLocally } from './agent/template-library.js';

export const VERSION = '8.0.0';
