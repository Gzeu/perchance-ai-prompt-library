// src/api/middleware/rateLimit.ts — v5.0.0
import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import type { APIResponse } from '../../types/index.js';

const VERSION = '5.0.0';

function rateLimitHandler(_req: Request, res: Response): void {
  const body: APIResponse<null> = {
    success: false,
    error: 'Prea multe cereri. Încearcă din nou mai târziu.',
    timestamp: new Date().toISOString(),
    version: VERSION,
  };
  res.status(429).json(body);
}

/** General API rate limiter — 100 req / 15 min */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env['RATE_LIMIT_MAX'] ?? '100', 10),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/** Strict limiter for generation endpoints — 20 req / min */
export const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env['RATE_LIMIT_GENERATE'] ?? '20', 10),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) =>
    (req.headers['x-api-key'] as string) ?? req.ip ?? 'unknown',
});

/** Very strict limiter for batch endpoints — 5 req / min */
export const batchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env['RATE_LIMIT_BATCH'] ?? '5', 10),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
});
