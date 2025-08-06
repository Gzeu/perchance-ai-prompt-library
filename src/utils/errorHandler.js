const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, statusCode, code, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode || 500;
    this.code = code || 'INTERNAL_ERROR';
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.errorId = uuidv4();
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Convert error to a plain object
   * @returns {Object} Plain object representation of the error
   */
  toJSON() {
    return {
      error: {
        id: this.errorId,
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(process.env.NODE_ENV === 'development' && {
          stack: this.stack,
          details: this.details
        })
      }
    };
  }
}

/**
 * Error types with default messages and status codes
 */
const ERROR_TYPES = {
  // 4xx Errors
  BAD_REQUEST: {
    statusCode: 400,
    code: 'BAD_REQUEST',
    message: 'The request could not be understood or was missing required parameters.'
  },
  UNAUTHORIZED: {
    statusCode: 401,
    code: 'UNAUTHORIZED',
    message: 'Authentication failed or user does not have permissions for the requested operation.'
  },
  FORBIDDEN: {
    statusCode: 403,
    code: 'FORBIDDEN',
    message: 'Access to the requested resource is forbidden.'
  },
  NOT_FOUND: {
    statusCode: 404,
    code: 'NOT_FOUND',
    message: 'The requested resource could not be found.'
  },
  VALIDATION_ERROR: {
    statusCode: 422,
    code: 'VALIDATION_ERROR',
    message: 'The request data is invalid.'
  },
  RATE_LIMIT_EXCEEDED: {
    statusCode: 429,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later.'
  },
  
  // 5xx Errors
  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred on the server.'
  },
  SERVICE_UNAVAILABLE: {
    statusCode: 503,
    code: 'SERVICE_UNAVAILABLE',
    message: 'Service is temporarily unavailable, please try again later.'
  },
  
  // Custom errors
  POLLINATIONS_API_ERROR: {
    statusCode: 502,
    code: 'POLLINATIONS_API_ERROR',
    message: 'An error occurred while communicating with the Pollinations.ai API.'
  },
  IMAGE_GENERATION_FAILED: {
    statusCode: 500,
    code: 'IMAGE_GENERATION_FAILED',
    message: 'Failed to generate the requested image.'
  },
  INVALID_IMAGE_FORMAT: {
    statusCode: 400,
    code: 'INVALID_IMAGE_FORMAT',
    message: 'The provided image format is not supported.'
  }
};

/**
 * Create a new API error
 * @param {string} type - Error type (key from ERROR_TYPES)
 * @param {string} [message] - Custom error message (overrides default)
 * @param {Object} [details] - Additional error details
 * @returns {ApiError} The created error
 */
function createError(type, message, details = {}) {
  const errorType = ERROR_TYPES[type] || ERROR_TYPES.INTERNAL_SERVER_ERROR;
  const errorMessage = message || errorType.message;
  
  return new ApiError(
    errorMessage,
    errorType.statusCode,
    errorType.code,
    details
  );
}

/**
 * Error handling middleware for Express
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function errorHandler(err, req, res, next) {
  // Log the error
  const errorId = err.errorId || uuidv4();
  const statusCode = err.statusCode || 500;
  
  // Log the error with request details
  logger.error({
    errorId,
    message: err.message,
    name: err.name,
    code: err.code,
    statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    request: {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      // Don't log sensitive data like passwords
      body: req.body && Object.fromEntries(
        Object.entries(req.body)
          .filter(([key]) => !['password', 'token', 'apiKey'].includes(key.toLowerCase()))
      ),
      user: req.user ? { id: req.user.id, email: req.user.email } : undefined,
      ip: req.ip
    },
    details: err.details
  }, 'API Error');
  
  // Prepare error response
  const response = {
    error: {
      id: errorId,
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err.details
      })
    }
  };
  
  // Send the error response
  res.status(statusCode).json(response);
}

/**
 * Async error handler wrapper for Express routes
 * @param {Function} fn - The async route handler function
 * @returns {Function} Wrapped route handler with error handling
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Handle uncaught exceptions
 */
function handleUncaughtExceptions() {
  process.on('uncaughtException', (error) => {
    const errorId = uuidv4();
    logger.fatal({
      errorId,
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, 'Uncaught Exception');
    
    // Give time to flush logs before exiting
    setTimeout(() => process.exit(1), 1000);
  });
}

/**
 * Handle unhandled promise rejections
 */
function handleUnhandledRejections() {
  process.on('unhandledRejection', (reason, promise) => {
    const errorId = uuidv4();
    logger.error({
      errorId,
      reason: reason instanceof Error ? {
        name: reason.name,
        message: reason.message,
        stack: reason.stack
      } : reason,
      timestamp: new Date().toISOString()
    }, 'Unhandled Promise Rejection');
  });
}

/**
 * Handle process termination signals
 */
function handleProcessSignals() {
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  
  signals.forEach(signal => {
    process.on(signal, () => {
      logger.info(`Received ${signal}. Gracefully shutting down...`);
      // Perform cleanup if needed
      process.exit(0);
    });
  });
}

module.exports = {
  ApiError,
  ERROR_TYPES,
  createError,
  errorHandler,
  asyncHandler,
  handleUncaughtExceptions,
  handleUnhandledRejections,
  handleProcessSignals
};
