const rateLimit = require('express-rate-limit');
const logger = require('../../utils/logger');
const config = require('../../config/pollinations');

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map();

/**
 * Create a rate limiter with the specified options
 * @param {Object} options - Rate limiting options
 * @returns {Function} Rate limiter middleware
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // Limit each IP to 100 requests per windowMs
    message = 'Too many requests, please try again later.',
    keyGenerator = (req) => req.ip, // Default key generator uses IP
    skip = () => false, // Function to skip rate limiting
    ...rest
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: { success: false, error: 'Rate limit exceeded', message },
    keyGenerator,
    skip,
    store: {
      // Custom store implementation
      increment: (key, cb) => {
        const now = Date.now();
        const entry = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
        
        // Reset counter if window has passed
        if (now > entry.resetTime) {
          entry.count = 0;
          entry.resetTime = now + windowMs;
        }
        
        // Increment counter
        entry.count += 1;
        
        // Update store
        rateLimitStore.set(key, entry);
        
        // Return current count and reset time
        cb(null, entry.count, entry.resetTime);
      },
      // Required by express-rate-limit but not used with custom store
      decrement: () => {},
      resetKey: () => {},
    },
    handler: (req, res) => {
      const key = keyGenerator(req);
      const entry = rateLimitStore.get(key) || { resetTime: Date.now() + windowMs };
      const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000);
      
      res.set({
        'Retry-After': retryAfter,
        'X-RateLimit-Limit': max,
        'X-RateLimit-Remaining': Math.max(0, max - (entry.count || 0)),
        'X-RateLimit-Reset': entry.resetTime
      });
      
      logger.warn(`Rate limit exceeded for ${key}: ${entry.count || 0}/${max} requests`);
      
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        message,
        retryAfter: `${retryAfter} seconds`
      });
    },
    ...rest
  });
};

// Default rate limiter for API endpoints
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Stricter rate limiter for image generation
const imageGenerationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 image generations per hour
  message: 'Too many image generations from this IP, please try again later',
  // Skip rate limiting for admin API keys
  skip: (req) => {
    const apiKey = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || 
                  req.headers['x-api-key'] || 
                  req.query.api_key;
    return process.env.ADMIN_API_KEYS?.split(',').includes(apiKey);
  }
});

// Rate limiter for authentication endpoints
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
  keyGenerator: (req) => `${req.ip}-${req.body.email || req.body.username || 'unknown'}`
});

module.exports = {
  createRateLimiter,
  apiLimiter,
  imageGenerationLimiter,
  authLimiter
};
