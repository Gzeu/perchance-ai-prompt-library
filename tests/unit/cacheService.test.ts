// tests/unit/cacheService.test.ts — v5.0.0
import { CacheService, promptCache } from '../../src/services/cacheService';

describe('CacheService', () => {
  let cache: CacheService<string>;

  beforeEach(() => {
    cache = new CacheService<string>(1000); // 1s TTL
  });

  afterEach(() => {
    cache.clear();
  });

  describe('set / get', () => {
    it('stores and retrieves a value', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('returns null for missing keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('returns null for expired entries', async () => {
      cache.set('expiring', 'val', 50); // 50ms TTL
      await new Promise(r => setTimeout(r, 100));
      expect(cache.get('expiring')).toBeNull();
    });

    it('increments hit counter on successful get', () => {
      cache.set('k', 'v');
      cache.get('k');
      cache.get('k');
      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
    });
  });

  describe('has()', () => {
    it('returns true for existing non-expired keys', () => {
      cache.set('exists', 'yes');
      expect(cache.has('exists')).toBe(true);
    });

    it('returns false for missing keys', () => {
      expect(cache.has('nope')).toBe(false);
    });
  });

  describe('delete()', () => {
    it('removes a key', () => {
      cache.set('to-delete', 'bye');
      cache.delete('to-delete');
      expect(cache.get('to-delete')).toBeNull();
    });

    it('returns false when key does not exist', () => {
      expect(cache.delete('ghost')).toBe(false);
    });
  });

  describe('getStats()', () => {
    it('returns correct hit rate', () => {
      cache.set('a', '1');
      cache.get('a'); // hit
      cache.get('b'); // miss
      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });

    it('returns 0 hit rate when no access', () => {
      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('purgeExpired()', () => {
    it('removes only expired entries', async () => {
      cache.set('fresh', 'v', 5000);
      cache.set('stale', 'v', 50);
      await new Promise(r => setTimeout(r, 100));
      const removed = cache.purgeExpired();
      expect(removed).toBe(1);
      expect(cache.size).toBe(1);
    });
  });

  describe('keys()', () => {
    it('returns all keys when no prefix', () => {
      cache.set('a:1', 'v');
      cache.set('a:2', 'v');
      cache.set('b:1', 'v');
      expect(cache.keys()).toHaveLength(3);
    });

    it('filters keys by prefix', () => {
      cache.set('a:1', 'v');
      cache.set('a:2', 'v');
      cache.set('b:1', 'v');
      expect(cache.keys('a:')).toHaveLength(2);
    });
  });

  describe('singleton promptCache', () => {
    afterEach(() => promptCache.clear());

    it('is a shared CacheService instance', () => {
      expect(promptCache).toBeInstanceOf(CacheService);
    });

    it('works correctly as a singleton', () => {
      promptCache.set('test', 'shared');
      expect(promptCache.get('test')).toBe('shared');
    });
  });
});
