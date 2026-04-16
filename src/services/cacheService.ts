// src/services/cacheService.ts — v4.0.0
import type { CacheEntry, CacheStats } from '../types/index.js';

export class CacheService<T> {
  private store = new Map<string, CacheEntry<T>>();
  private hits = 0;
  private misses = 0;
  private readonly defaultTtl: number;

  constructor(defaultTtlMs = 300_000) {
    this.defaultTtl = defaultTtlMs;
  }

  set(key: string, value: T, ttlMs?: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtl),
      hits: 0,
    });
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) { this.misses++; return null; }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }
    entry.hits++;
    this.hits++;
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  get size(): number {
    return this.store.size;
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  /** Remove all expired entries */
  purgeExpired(): number {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        removed++;
      }
    }
    return removed;
  }

  /** Return all keys matching a prefix */
  keys(prefix?: string): string[] {
    const all = [...this.store.keys()];
    return prefix ? all.filter((k) => k.startsWith(prefix)) : all;
  }
}

// Singleton instances for common use-cases
export const promptCache = new CacheService<string>(600_000);   // 10 min TTL
export const apiCache    = new CacheService<unknown>(60_000);    // 1 min TTL
