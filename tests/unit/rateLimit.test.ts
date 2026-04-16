// tests/unit/rateLimit.test.ts — v4.0.0
import { describe, it, expect, beforeEach } from '@jest/globals';

interface RateLimitEntry { count: number; resetAt: number; }

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  constructor(private maxRequests = 10, private windowMs = 60_000) {}

  check(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = this.limits.get(userId);
    if (!entry || now > entry.resetAt) {
      this.limits.set(userId, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequests - 1, resetIn: this.windowMs };
    }
    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
    }
    entry.count++;
    return { allowed: true, remaining: this.maxRequests - entry.count, resetIn: entry.resetAt - now };
  }

  reset(userId: string): void { this.limits.delete(userId); }
}

describe('RateLimiter', () => {
  let limiter: RateLimiter;
  beforeEach(() => { limiter = new RateLimiter(3, 60_000); });

  it('permite primul request', () => {
    expect(limiter.check('user1').allowed).toBe(true);
  });

  it('decrementează remaining corect', () => {
    limiter.check('user1');
    const { remaining } = limiter.check('user1');
    expect(remaining).toBe(1);
  });

  it('blochează după maxRequests', () => {
    limiter.check('user2');
    limiter.check('user2');
    limiter.check('user2');
    expect(limiter.check('user2').allowed).toBe(false);
  });

  it('utilizatori diferiți au limite independente', () => {
    limiter.check('userA'); limiter.check('userA'); limiter.check('userA');
    expect(limiter.check('userB').allowed).toBe(true);
  });

  it('resetează limita pentru un user', () => {
    limiter.check('user3'); limiter.check('user3'); limiter.check('user3');
    limiter.reset('user3');
    expect(limiter.check('user3').allowed).toBe(true);
  });
});
