'use strict';

/**
 * Authentication middleware
 * Supports API key auth via header or query param
 */

const VALID_API_KEYS = new Set(
  (process.env.API_KEYS || 'dev-key-12345')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean)
);

/**
 * Extract API key from request
 * Checks: Authorization header (Bearer), x-api-key header, ?api_key query param
 */
function extractApiKey(req) {
  // Bearer token
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  // x-api-key header
  if (req.headers['x-api-key']) {
    return req.headers['x-api-key'].trim();
  }
  // query param
  if (req.query && req.query.api_key) {
    return req.query.api_key.trim();
  }
  return null;
}

/**
 * requireAuth middleware — returns 401 if no valid API key
 */
function requireAuth(req, res, next) {
  // Skip auth in development if SKIP_AUTH is set
  if (process.env.SKIP_AUTH === 'true' || process.env.NODE_ENV === 'development') {
    req.authenticated = true;
    req.apiKey = 'dev';
    return next();
  }

  const key = extractApiKey(req);

  if (!key) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Provide API key via Authorization header or x-api-key.',
    });
  }

  if (!VALID_API_KEYS.has(key)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key.',
    });
  }

  req.authenticated = true;
  req.apiKey = key;
  next();
}

/**
 * optionalAuth middleware — attaches auth info but does not block
 */
function optionalAuth(req, res, next) {
  const key = extractApiKey(req);
  if (key && VALID_API_KEYS.has(key)) {
    req.authenticated = true;
    req.apiKey = key;
  } else {
    req.authenticated = false;
    req.apiKey = null;
  }
  next();
}

module.exports = { requireAuth, optionalAuth, extractApiKey };
