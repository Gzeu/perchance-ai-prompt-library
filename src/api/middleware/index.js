'use strict';

const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { createRateLimiter, defaultLimiter, strictLimiter } = require('./rateLimit');
const { requireAuth, optionalAuth } = require('./auth');
const { validateRequest } = require('./validation');

/**
 * Apply all global security & logging middleware to an Express app.
 * Call applyGlobal(app) at the top of server.js before mounting routes.
 */
function applyGlobal(app) {
  // Security headers
  app.use(helmet({ contentSecurityPolicy: false }));

  // CORS — use explicit origin list; never allow wildcard in production
  const allowedOrigin =
    process.env.CORS_ORIGIN ||
    (process.env.NODE_ENV === 'production'
      ? 'https://perchance-ai-prompt-library.vercel.app'
      : 'http://localhost:5173');
  app.use(cors({ origin: allowedOrigin, optionsSuccessStatus: 200 }));

  // HTTP request logging (skip in test)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  // Body parsers — keep limits small to prevent DoS via body flooding
  // Routes that need larger payloads (e.g. /api/images for base64) override locally
  app.use(require('express').json({ limit: '256kb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '256kb' }));

  // Global rate limiting — 100 req/min per IP
  app.use(defaultLimiter);
}

module.exports = {
  applyGlobal,
  requireAuth,
  optionalAuth,
  createRateLimiter,
  defaultLimiter,
  strictLimiter,
  validateRequest,
};
