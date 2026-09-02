import { RateLimiter, createRateLimiter } from './rate-limiter.js';

describe('RateLimiter', () => {
  describe('Constructor', () => {
    it('should create rate limiter with config', () => {
      const config = { maxRequests: 10, windowMs: 1000 };
      const limiter = new RateLimiter(config);

      expect(limiter).toBeDefined();
    });

    it('should use provided maxRequests', () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });
      expect(limiter.getRemainingRequests()).toBe(5);
    });
  });

  describe('acquire', () => {
    it('should allow first request immediately', async () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });
      const startTime = Date.now();

      await limiter.acquire();
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(100); // Should be nearly instant
    });

    it('should allow requests within limit', async () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });

      await limiter.acquire();
      await limiter.acquire();
      await limiter.acquire();

      expect(limiter.getRemainingRequests()).toBe(0);
    });

    it('should wait when limit is exceeded', async () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 500 });

      await limiter.acquire();
      await limiter.acquire();

      const startTime = Date.now();
      await limiter.acquire(); // Should wait
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(400); // Should wait for window to reset
    });

    it('should reset after window expires', async () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 100 });

      await limiter.acquire();
      await limiter.acquire();

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be able to acquire again
      const startTime = Date.now();
      await limiter.acquire();
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(100); // Should be immediate
    });
  });

  describe('getRemainingRequests', () => {
    it('should return correct remaining requests', () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

      expect(limiter.getRemainingRequests()).toBe(5);

      limiter['requests'].push(Date.now());
      expect(limiter.getRemainingRequests()).toBe(4);

      limiter['requests'].push(Date.now());
      expect(limiter.getRemainingRequests()).toBe(3);
    });

    it('should not go below zero', () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter['requests'].push(Date.now());
      limiter['requests'].push(Date.now());
      limiter['requests'].push(Date.now()); // Exceed limit

      expect(limiter.getRemainingRequests()).toBe(0);
    });

    it('should clean up old requests', async () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 100 });

      limiter['requests'].push(Date.now() - 200); // Old request
      limiter['requests'].push(Date.now()); // Recent request

      const remaining = limiter.getRemainingRequests();
      expect(remaining).toBe(4); // Only recent request counts
    });
  });

  describe('getResetTime', () => {
    it('should return 0 when no requests', () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });
      expect(limiter.getResetTime()).toBe(0);
    });

    it('should return correct reset time', () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });
      const now = Date.now();

      limiter['requests'].push(now);

      const resetTime = limiter.getResetTime();
      expect(resetTime).toBeGreaterThan(now);
      expect(resetTime).toBeLessThanOrEqual(now + 1000);
    });
  });

  describe('Concurrent requests', () => {
    it('should handle concurrent acquire calls', async () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });

      const promises = [
        limiter.acquire(),
        limiter.acquire(),
        limiter.acquire(),
      ];

      await Promise.all(promises);

      expect(limiter.getRemainingRequests()).toBe(0);
    });

    it('should queue concurrent requests beyond limit', async () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 100 });

      const promises = [
        limiter.acquire(),
        limiter.acquire(),
        limiter.acquire(), // Should wait
      ];

      const startTime = Date.now();
      await Promise.all(promises);
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(90); // Third request should wait
    });
  });
});

describe('createRateLimiter', () => {
  it('should create rate limiter with custom config', () => {
    const limiter = createRateLimiter(10, 5000);
    expect(limiter.getRemainingRequests()).toBe(10);
  });

  it('should create independent rate limiters', () => {
    const limiter1 = createRateLimiter(5, 1000);
    const limiter2 = createRateLimiter(10, 1000);

    expect(limiter1.getRemainingRequests()).toBe(5);
    expect(limiter2.getRemainingRequests()).toBe(10);
  });
});
