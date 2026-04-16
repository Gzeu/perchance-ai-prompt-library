'use strict';

/**
 * In-memory rate limiter middleware
 * Uses a sliding window counter per IP
 */

const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 100;

// Map<ip, { count, resetAt }>
const store = new Map();

/**
 * Cleanup expired entries every minute
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 60 * 1000).unref();

/**
 * Create a rate limiter middleware
 * @param {object} options
 * @param {number} options.windowMs  - Window in ms (default: 60000)
 * @param {number} options.max       - Max requests per window (default: 100)
 * @param {string} options.message   - Error message
 * @param {function} options.keyFn   - Function to derive key from req (default: IP)
 */
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
  const max = options.max || DEFAULT_MAX_REQUESTS;
  const message = options.message || 'Too many requests, please try again later.';
  const keyFn = options.keyFn || ((req) => req.ip || req.connection.remoteAddress || 'unknown');

  return function rateLimitMiddleware(req, res, next) {
    const key = keyFn(req);
    const now = Date.now();

    let entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count += 1;

    const remaining = Math.max(0, max - entry.count);
    const resetSec = Math.ceil((entry.resetAt - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSec);

    if (entry.count > max) {
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: resetSec,
      });
    }

    next();
  };
}

// Default instance — 100 req/min
const defaultLimiter = createRateLimiter();

// Strict instance — 20 req/min for generate endpoints
const strictLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Rate limit exceeded for generation endpoints (20 req/min).',
});

module.exports = { createRateLimiter, defaultLimiter, strictLimiter };
