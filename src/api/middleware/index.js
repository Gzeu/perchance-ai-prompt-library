'use strict';

const { requireAuth, optionalAuth } = require('./auth');
const { createRateLimiter, defaultLimiter, strictLimiter } = require('./rateLimit');
const { rateLimiter: rateLimiterJs } = require('./rateLimiter');
const { validateRequest } = require('./validation');

module.exports = {
  requireAuth,
  optionalAuth,
  createRateLimiter,
  defaultLimiter,
  strictLimiter,
  validateRequest,
};
