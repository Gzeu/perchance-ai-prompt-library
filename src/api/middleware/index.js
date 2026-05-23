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

  // CORS — allow all origins by default; override via CORS_ORIGIN env var
  const corsOptions = process.env.CORS_ORIGIN
    ? { origin: process.env.CORS_ORIGIN, optionsSuccessStatus: 200 }
    : {};
  app.use(cors(corsOptions));

  // HTTP request logging (skip in test)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  // Body parsers
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '10mb' }));

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
