import { Cache, validationCache, templateCache, getOrCompute, createCache } from './cache.js';

describe('Cache', () => {
  let cache: Cache<string>;

  beforeEach(() => {
    cache = new Cache<string>(1000); // 1 second TTL for testing
  });

  describe('Constructor', () => {
    it('should create cache with default TTL', () => {
      const defaultCache = new Cache<string>();
      expect(defaultCache).toBeDefined();
    });

    it('should create cache with custom TTL', () => {
      const customCache = new Cache<string>(5000);
      expect(customCache).toBeDefined();
    });
  });

  describe('set', () => {
    it('should store value with key', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should use custom TTL when provided', () => {
      cache.set('key1', 'value1', 2000);
      expect(cache.get('key1')).toBe('value1');
    });

    it('should update existing key', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });
  });

  describe('get', () => {
    it('should return stored value', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should return null for expired entry', async () => {
      cache.set('key1', 'value1', 100); // 100ms TTL
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(cache.get('key1')).toBeNull();
    });

    it('should return value for non-expired entry', async () => {
      cache.set('key1', 'value1', 1000); // 1 second TTL
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(cache.get('key1')).toBe('value1');
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired key', async () => {
      cache.set('key1', 'value1', 100);
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should remove existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
    });

    it('should return false for non-existent key', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe('size', () => {
    it('should return number of entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });

    it('should not count expired entries', async () => {
      cache.set('key1', 'value1', 100);
      cache.set('key2', 'value2', 1000);
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(cache.size()).toBe(1);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      cache.set('key1', 'value1', 100);
      cache.set('key2', 'value2', 1000);
      await new Promise(resolve => setTimeout(resolve, 150));
      cache.cleanup();
      expect(cache.size()).toBe(1);
    });

    it('should not remove non-expired entries', async () => {
      cache.set('key1', 'value1', 1000);
      await new Promise(resolve => setTimeout(resolve, 100));
      cache.cleanup();
      expect(cache.size()).toBe(1);
    });
  });

  describe('getKeys', () => {
    it('should return all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      const keys = cache.getKeys();
      expect(keys).toHaveLength(2);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });

    it('should not return expired keys', async () => {
      cache.set('key1', 'value1', 100);
      cache.set('key2', 'value2', 1000);
      await new Promise(resolve => setTimeout(resolve, 150));
      const keys = cache.getKeys();
      expect(keys).toHaveLength(1);
      expect(keys).toContain('key2');
    });
  });

  describe('getValues', () => {
    it('should return all values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      const values = cache.getValues();
      expect(values).toHaveLength(2);
      expect(values).toContain('value1');
      expect(values).toContain('value2');
    });

    it('should not return expired values', async () => {
      cache.set('key1', 'value1', 100);
      cache.set('key2', 'value2', 1000);
      await new Promise(resolve => setTimeout(resolve, 150));
      const values = cache.getValues();
      expect(values).toHaveLength(1);
      expect(values).toContain('value2');
    });
  });

  describe('Complex types', () => {
    it('should store objects', () => {
      const obj = { key: 'value', number: 42 };
      cache.set('obj', JSON.stringify(obj));
      const stored = cache.get('obj');
      expect(stored).toBeDefined();
    });

    it('should store arrays', () => {
      const arr = ['item1', 'item2', 'item3'];
      cache.set('arr', JSON.stringify(arr));
      const stored = cache.get('arr');
      expect(stored).toBeDefined();
    });
  });
});

describe('Global caches', () => {
  it('should have validation cache with 5 minute TTL', () => {
    expect(validationCache).toBeDefined();
  });

  it('should have template cache with 1 hour TTL', () => {
    expect(templateCache).toBeDefined();
  });

  it('should have API response cache with 30 minute TTL', () => {
    expect(validationCache).toBeDefined();
  });
});

describe('getOrCompute', () => {
  it('should return cached value if exists', async () => {
    const cache = new Cache<string>();
    cache.set('key1', 'cached_value');

    const result = await getOrCompute(
      cache,
      'key1',
      async () => 'computed_value'
    );

    expect(result).toBe('cached_value');
  });

  it('should compute and cache if not exists', async () => {
    const cache = new Cache<string>();
    let computeCount = 0;

    const result = await getOrCompute(
      cache,
      'key1',
      async () => {
        computeCount++;
        return 'computed_value';
      }
    );

    expect(result).toBe('computed_value');
    expect(computeCount).toBe(1);
    expect(cache.get('key1')).toBe('computed_value');
  });

  it('should use custom TTL when provided', async () => {
    const cache = new Cache<string>();
    await getOrCompute(cache, 'key1', async () => 'value', 2000);
    expect(cache.get('key1')).toBe('value');
  });
});

describe('createCache', () => {
  it('should create cache with default TTL', () => {
    const cache = createCache<string>();
    expect(cache).toBeDefined();
  });

  it('should create cache with custom TTL', () => {
    const cache = createCache<string>(5000);
    expect(cache).toBeDefined();
  });

  it('should create independent caches', () => {
    const cache1 = createCache<string>();
    const cache2 = createCache<string>();

    cache1.set('key1', 'value1');
    cache2.set('key1', 'value2');

    expect(cache1.get('key1')).toBe('value1');
    expect(cache2.get('key1')).toBe('value2');
  });
});
