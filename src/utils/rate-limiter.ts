/**
 * Rate limiter for API calls
 * Prevents overwhelming external APIs with too many requests
 */

export interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
}

export class RateLimiter {
  private requests: number[] = [];
  private config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Remove old requests outside the time window
    this.requests = this.requests.filter(timestamp => timestamp > windowStart);

    // Check if we've exceeded the limit
    if (this.requests.length >= this.config.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = oldestRequest + this.config.windowMs - now;

      if (waitTime > 0) {
        await this.sleep(waitTime);
      }
    }

    // Add current request
    this.requests.push(now);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getRemainingRequests(): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    this.requests = this.requests.filter(timestamp => timestamp > windowStart);
    return Math.max(0, this.config.maxRequests - this.requests.length);
  }

  getResetTime(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = this.requests[0];
    return oldestRequest + this.config.windowMs;
  }
}

// General purpose rate limiter (can be configured)
export function createRateLimiter(maxRequests: number, windowMs: number): RateLimiter {
  return new RateLimiter({ maxRequests, windowMs });
}
