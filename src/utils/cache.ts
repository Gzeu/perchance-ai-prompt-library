/**
 * Simple in-memory cache with TTL support
 * Used for caching API responses and validation results
 */

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export class Cache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 3600000) { // 1 hour default
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    this.cache.set(key, entry);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    // Clean up expired entries first
    this.cleanup();
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getKeys(): string[] {
    this.cleanup();
    return Array.from(this.cache.keys());
  }

  getValues(): T[] {
    this.cleanup();
    return Array.from(this.cache.values()).map(entry => entry.value);
  }
}

// Global cache instances
export const validationCache = new Cache<any>(300000); // 5 minutes
export const templateCache = new Cache<string>(3600000); // 1 hour
export const apiResponseCache = new Cache<any>(1800000); // 30 minutes

// Cache utility functions
export async function getOrCompute<T>(
  cache: Cache<T>,
  key: string,
  compute: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }

  const value = await compute();
  cache.set(key, value, ttl);
  return value;
}

export function createCache<T>(defaultTTL?: number): Cache<T> {
  return new Cache<T>(defaultTTL);
}
