/**
 * Centralized Express middleware configuration.
 * All security, logging, parsing, and rate-limiting middleware
 * is registered here so it can be audited in a single place.
 */

import { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { json, urlencoded } from 'express';

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

export const agenticRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Agentic requests are limited to 10 per minute.' },
});

// ─── CORS Options ─────────────────────────────────────────────────────────────

const corsOptions: cors.CorsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// ─── Register All Middleware ───────────────────────────────────────────────────

export function registerMiddleware(app: Application): void {
  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS
  app.use(cors(corsOptions));

  // Request logging (skip in test env)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // Body parsing
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ extended: true, limit: '2mb' }));

  // Compression
  app.use(compression());

  // Health check (bypass rate limiting)
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      version: process.env.npm_package_version ?? '7.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
    });
  });

  // Apply rate limiting to all API routes
  app.use('/api', apiRateLimiter);
}

// ─── Error Handler ────────────────────────────────────────────────────────────

export function registerErrorHandler(app: Application): void {
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[error]', err.message);
    res.status(500).json({
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
  });
}
