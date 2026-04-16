// src/api/middleware/auth.ts — v5.0.0
import type { Request, Response, NextFunction } from 'express';
import type { APIResponse } from '../../types/index.js';

const VALID_API_KEYS = new Set(
  (process.env['API_KEYS'] ?? '').split(',').filter(Boolean)
);

const PUBLIC_PATHS = new Set([
  '/health',
  '/api/v1/health',
  '/api/v1/styles',
  '/api-docs',
]);

export function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Skip auth if no API keys configured (dev mode)
  if (VALID_API_KEYS.size === 0) {
    next();
    return;
  }

  // Skip auth for public paths
  if (PUBLIC_PATHS.has(req.path)) {
    next();
    return;
  }

  const key =
    (req.headers['x-api-key'] as string) ??
    (req.query['api_key'] as string) ??
    '';

  if (!key || !VALID_API_KEYS.has(key)) {
    const body: APIResponse<null> = {
      success: false,
      error: 'Invalid or missing API key',
      timestamp: new Date().toISOString(),
      version: '5.0.0',
    };
    res.status(401).json(body);
    return;
  }

  next();
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // Attach key to request for downstream use but never block
  const key =
    (req.headers['x-api-key'] as string) ??
    (req.query['api_key'] as string) ??
    null;

  (req as Request & { apiKey?: string | null }).apiKey = key;
  next();
}
