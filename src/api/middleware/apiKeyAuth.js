const logger = require('../../utils/logger');
const config = require('../../config/pollinations');

/**
 * API Key Authentication Middleware
 * 
 * This middleware validates the API key for protected routes.
 * It checks for the API key in the following order:
 * 1. Authorization header (Bearer token)
 * 2. x-api-key header
 * 3. api_key query parameter
 */
const apiKeyAuth = (req, res, next) => {
  // Skip authentication if not required
  if (!config.security.requireApiKey) {
    return next();
  }

  // Get API key from various sources
  const apiKey = (
    (req.headers.authorization && req.headers.authorization.split(' ')[1]) || // Bearer token
    req.headers['x-api-key'] ||
    req.query.api_key
  );

  // Check if API key is provided
  if (!apiKey) {
    logger.warn('API key is required');
    return res.status(401).json({
      success: false,
      error: 'API key is required',
      message: 'Please provide a valid API key using Authorization header, x-api-key header, or api_key query parameter'
    });
  }

  // Validate API key
  if (!config.security.apiKeys.includes(apiKey) && apiKey !== process.env.POLLINATIONS_TOKEN) {
    logger.warn(`Invalid API key attempt from ${req.ip}`);
    return res.status(403).json({
      success: false,
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  // Log successful authentication
  logger.debug(`API key authenticated for ${req.ip}`);
  
  // Attach API key to request for later use
  req.apiKey = apiKey;
  
  next();
};

/**
 * Admin API Key Authentication Middleware
 * 
 * This middleware validates admin API keys for protected admin routes.
 */
const adminApiKeyAuth = (req, res, next) => {
  // Get API key from various sources
  const apiKey = (
    (req.headers.authorization && req.headers.authorization.split(' ')[1]) || // Bearer token
    req.headers['x-api-key'] ||
    req.query.api_key
  );

  // Check if API key is provided and is an admin key
  if (!apiKey || !process.env.ADMIN_API_KEYS?.split(',').includes(apiKey)) {
    logger.warn(`Unauthorized admin access attempt from ${req.ip}`);
    return res.status(403).json({
      success: false,
      error: 'Admin access denied',
      message: 'Valid admin API key is required for this operation'
    });
  }

  // Log successful admin authentication
  logger.info(`Admin access granted to ${req.ip}`);
  
  next();
};

module.exports = {
  apiKeyAuth,
  adminApiKeyAuth
};
