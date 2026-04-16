// src/api/routes/prompts.ts — v5.0.0
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { generatePrompt, generateBatch, getRandomCategory } from '../../generators/promptGenerator.js';
import { validatePrompt } from '../../services/promptValidator.js';
import { promptCache } from '../../services/cacheService.js';
import { analytics } from '../../services/analyticsService.js';
import { generateLimiter, batchLimiter } from '../middleware/rateLimit.js';
import type {
  PromptCategory,
  ArtStyle,
  QualityLevel,
  APIResponse,
  PaginatedResponse,
  GeneratedPrompt,
} from '../../types/index.js';

const router = Router();
const VERSION = '5.0.0';

const VALID_CATEGORIES: PromptCategory[] = [
  'anime','realistic','fantasy','scifi','portrait','landscape','abstract',
  'architecture','food','nature','fashion','surreal',
];
const VALID_STYLES: ArtStyle[] = [
  'cinematic','painterly','minimalist','cyberpunk','watercolor','sketch',
  'oil-painting','digital-art','photorealistic','anime-style','concept-art','illustration',
];
const VALID_QUALITIES: QualityLevel[] = ['draft','standard','high','ultra'];

/**
 * POST /api/v1/prompts/generate
 * Generate a single prompt
 */
router.post('/generate', generateLimiter, (req: Request, res: Response, next: NextFunction): void => {
  try {
    const {
      category,
      style = 'cinematic',
      keywords = [],
      quality = 'high',
      seed,
    } = req.body as {
      category?: PromptCategory;
      style?: ArtStyle;
      keywords?: string[];
      quality?: QualityLevel;
      seed?: number;
    };

    // Validate
    if (category && !VALID_CATEGORIES.includes(category)) {
      res.status(400).json({ success: false, error: `Categorie invalidă: ${category}`, timestamp: new Date().toISOString(), version: VERSION });
      return;
    }
    if (!VALID_STYLES.includes(style)) {
      res.status(400).json({ success: false, error: `Stil invalid: ${style}`, timestamp: new Date().toISOString(), version: VERSION });
      return;
    }
    if (!VALID_QUALITIES.includes(quality)) {
      res.status(400).json({ success: false, error: `Calitate invalidă: ${quality}`, timestamp: new Date().toISOString(), version: VERSION });
      return;
    }

    const resolvedCategory = category ?? getRandomCategory();
    const cacheKey = `prompt:${resolvedCategory}:${style}:${quality}:${keywords.join(',')}:${seed ?? ''}`;
    const cached = promptCache.get(cacheKey);

    if (cached) {
      const body: APIResponse<GeneratedPrompt> = { success: true, data: JSON.parse(cached), timestamp: new Date().toISOString(), version: VERSION };
      res.json(body);
      return;
    }

    const prompt = generatePrompt(resolvedCategory, style, keywords, quality);
    if (seed !== undefined) prompt.metadata.seed = seed;

    promptCache.set(cacheKey, JSON.stringify(prompt), 120_000);
    analytics.record(prompt);

    const body: APIResponse<GeneratedPrompt> = { success: true, data: prompt, timestamp: new Date().toISOString(), version: VERSION };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/prompts/batch
 * Generate multiple prompts
 */
router.post('/batch', batchLimiter, (req: Request, res: Response, next: NextFunction): void => {
  try {
    const {
      category,
      style = 'cinematic',
      count = 5,
      quality = 'high',
      keywords = [],
    } = req.body as {
      category?: PromptCategory;
      style?: ArtStyle;
      count?: number;
      quality?: QualityLevel;
      keywords?: string[];
    };

    const clampedCount = Math.min(Math.max(1, count), 50);
    const resolvedCategory = category ?? getRandomCategory();
    const keywordSets = Array.from({ length: clampedCount }, () => keywords);
    const prompts = generateBatch(resolvedCategory, style, keywordSets, quality);

    analytics.recordBatch(prompts);

    const body: PaginatedResponse<GeneratedPrompt> = {
      success: true,
      data: prompts,
      page: 1,
      perPage: clampedCount,
      total: clampedCount,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      timestamp: new Date().toISOString(),
      version: VERSION,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/prompts/validate
 * Validate a prompt string
 */
router.post('/validate', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { prompt } = req.body as { prompt?: string };
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ success: false, error: 'Câmpul "prompt" este obligatoriu', timestamp: new Date().toISOString(), version: VERSION });
      return;
    }
    const result = validatePrompt(prompt);
    const body: APIResponse<typeof result> = { success: true, data: result, timestamp: new Date().toISOString(), version: VERSION };
    res.json(body);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/prompts/stats
 * Get analytics stats
 */
router.get('/stats', (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const stats = analytics.getStats();
    const body: APIResponse<typeof stats> = { success: true, data: stats, timestamp: new Date().toISOString(), version: VERSION };
    res.json(body);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/prompts/categories
 * List all categories and styles
 */
router.get('/categories', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: { categories: VALID_CATEGORIES, styles: VALID_STYLES, qualities: VALID_QUALITIES },
    timestamp: new Date().toISOString(),
    version: VERSION,
  });
});

export default router;
