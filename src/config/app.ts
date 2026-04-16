// src/config/app.ts — v5.0.0
import type { AppConfig } from '../types/index.js';

function getEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const appConfig: AppConfig = {
  port: parseInt(getEnv('PORT', '3000'), 10),
  host: getEnv('HOST', '0.0.0.0'),
  env: (getEnv('NODE_ENV', 'development') as AppConfig['env']),
  logLevel: (getEnv('LOG_LEVEL', 'info') as AppConfig['logLevel']),
  cors: {
    origins: getEnv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(','),
    credentials: getEnv('CORS_CREDENTIALS', 'true') === 'true',
  },
  rateLimit: {
    windowMs: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    max: parseInt(getEnv('RATE_LIMIT_MAX', '100'), 10),
  },
  cache: {
    defaultTtl: parseInt(getEnv('CACHE_TTL_MS', '300000'), 10),
    maxSize: parseInt(getEnv('CACHE_MAX_SIZE', '1000'), 10),
  },
  pollinations: {
    imageBaseUrl: getEnv('POLLINATIONS_IMAGE_URL', 'https://image.pollinations.ai'),
    textBaseUrl: getEnv('POLLINATIONS_TEXT_URL', 'https://text.pollinations.ai'),
    defaultModel: getEnv('POLLINATIONS_MODEL', 'flux'),
    timeout: parseInt(getEnv('POLLINATIONS_TIMEOUT', '30000'), 10),
  },
};

export default appConfig;
