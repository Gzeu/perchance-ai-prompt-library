const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const logger = require('./logger');

/**
 * Generate a cache key from the given parameters
 * @param {string} prefix - Cache key prefix
 * @param {...any} args - Parameters to include in the key
 * @returns {string} Generated cache key
 */
function generateCacheKey(prefix, ...args) {
  const key = args
    .map(arg => 
      typeof arg === 'object' 
        ? JSON.stringify(arg, Object.keys(arg || {}).sort())
        : String(arg)
    )
    .join('::');
  
  // Create a hash of the key to ensure it's a valid filename
  const hash = crypto.createHash('md5').update(key).digest('hex');
  return `${prefix}:${hash}`;
}

/**
 * File-based cache implementation
 */
class FileCache {
  /**
   * Create a new FileCache instance
   * @param {Object} options - Cache options
   * @param {string} options.directory - Cache directory path
   * @param {number} options.ttl - Time to live in milliseconds
   * @param {number} options.maxSize - Maximum cache size in bytes
   */
  constructor({ directory, ttl = 3600000, maxSize = 1073741824 }) {
    this.directory = directory;
    this.ttl = ttl;
    this.maxSize = maxSize;
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      count: 0,
      lastCleanup: 0
    };
    
    // Ensure cache directory exists
    fs.ensureDirSync(this.directory);
    
    // Initial cleanup
    this.cleanup().catch(err => {
      logger.warn({ error: err }, 'Initial cache cleanup failed');
    });
  }
  
  /**
   * Get the full path for a cache key
   * @param {string} key - Cache key
   * @returns {string} Full file path
   * @private
   */
  _getPath(key) {
    const safeKey = key.replace(/[^a-z0-9:._-]/gi, '_');
    return path.join(this.directory, `${safeKey}.json`);
  }
  
  /**
   * Check if the cache contains a key
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} True if the key exists and is not expired
   */
  async has(key) {
    try {
      const filePath = this._getPath(key);
      const stats = await fs.stat(filePath);
      
      // Check if the file is expired
      const isExpired = this.ttl > 0 && (Date.now() - stats.mtimeMs) > this.ttl;
      if (isExpired) {
        await this.delete(key);
        return false;
      }
      
      return true;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        logger.warn({ error: err, key }, 'Cache has() error');
      }
      return false;
    }
  }
  
  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {Promise<{value: any, metadata: Object}|null>} Cached value and metadata, or null if not found
   */
  async get(key) {
    try {
      const exists = await this.has(key);
      if (!exists) {
        this.stats.misses++;
        return null;
      }
      
      const filePath = this._getPath(key);
      const data = await fs.readJson(filePath);
      
      // Update last accessed time
      await fs.utimes(filePath, new Date(), new Date());
      
      this.stats.hits++;
      return data;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        logger.warn({ error: err, key }, 'Cache get() error');
      }
      this.stats.misses++;
      return null;
    }
  }
  
  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {Object} [metadata] - Additional metadata to store with the value
   * @returns {Promise<boolean>} True if successful
   */
  async set(key, value, metadata = {}) {
    try {
      const filePath = this._getPath(key);
      const data = {
        value,
        metadata: {
          ...metadata,
          cachedAt: new Date().toISOString(),
          expiresAt: this.ttl > 0 
            ? new Date(Date.now() + this.ttl).toISOString()
            : null,
        }
      };
      
      await fs.writeJson(filePath, data);
      
      // Update stats
      const stats = await fs.stat(filePath);
      this.stats.size += stats.size;
      this.stats.count++;
      
      // Check if we need to clean up
      if (this.maxSize > 0 && this.stats.size > this.maxSize) {
        await this.cleanup();
      }
      
      return true;
    } catch (err) {
      logger.error({ error: err, key }, 'Cache set() error');
      return false;
    }
  }
  
  /**
   * Delete a value from the cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} True if the key was deleted or didn't exist
   */
  async delete(key) {
    try {
      const filePath = this._getPath(key);
      
      // Get file size before deletion for stats
      try {
        const stats = await fs.stat(filePath);
        this.stats.size = Math.max(0, this.stats.size - stats.size);
        this.stats.count = Math.max(0, this.stats.count - 1);
      } catch (err) {
        // File doesn't exist, no action needed
      }
      
      await fs.remove(filePath);
      return true;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        logger.warn({ error: err, key }, 'Cache delete() error');
        return false;
      }
      return true;
    }
  }
  
  /**
   * Clear the entire cache
   * @returns {Promise<boolean>} True if successful
   */
  async clear() {
    try {
      await fs.emptyDir(this.directory);
      this.stats = {
        hits: 0,
        misses: 0,
        size: 0,
        count: 0,
        lastCleanup: Date.now()
      };
      return true;
    } catch (err) {
      logger.error({ error: err }, 'Cache clear() error');
      return false;
    }
  }
  
  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      size: this._formatBytes(this.stats.size),
      hitRate: this.stats.hits + this.stats.misses > 0
        ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) + '%'
        : '0%',
      maxSize: this._formatBytes(this.maxSize)
    };
  }
  
  /**
   * Clean up expired and least recently used cache entries
   * @param {Object} [options] - Cleanup options
   * @param {number} [options.targetSize] - Target cache size in bytes (default: 80% of maxSize)
   * @returns {Promise<Object>} Cleanup statistics
   */
  async cleanup({ targetSize } = {}) {
    const startTime = Date.now();
    const target = targetSize || (this.maxSize * 0.8);
    const stats = {
      examined: 0,
      deleted: 0,
      freed: 0,
      duration: 0
    };
    
    try {
      // Get all cache files with their stats
      const files = await fs.readdir(this.directory);
      const entries = [];
      
      for (const file of files) {
        try {
          if (!file.endsWith('.json')) continue;
          
          const filePath = path.join(this.directory, file);
          const fileStats = await fs.stat(filePath);
          
          entries.push({
            path: filePath,
            key: path.basename(file, '.json'),
            size: fileStats.size,
            atimeMs: fileStats.atimeMs,
            mtimeMs: fileStats.mtimeMs
          });
          
          stats.examined++;
        } catch (err) {
          logger.warn({ error: err, file }, 'Error reading cache file during cleanup');
        }
      }
      
      // Sort by last accessed time (oldest first)
      entries.sort((a, b) => a.atimeMs - b.atimeMs);
      
      // Delete expired entries and oldest entries until we're under the target size
      const now = Date.now();
      let currentSize = this.stats.size;
      
      for (const entry of entries) {
        // Check if we're under the target size
        if (currentSize <= target) {
          break;
        }
        
        // Check if the entry is expired
        const isExpired = this.ttl > 0 && (now - entry.mtimeMs) > this.ttl;
        
        if (isExpired || currentSize > target) {
          try {
            await fs.remove(entry.path);
            stats.deleted++;
            stats.freed += entry.size;
            currentSize = Math.max(0, currentSize - entry.size);
          } catch (err) {
            logger.warn({ error: err, path: entry.path }, 'Error deleting cache file during cleanup');
          }
        }
      }
      
      // Update stats
      this.stats.size = currentSize;
      this.stats.count = entries.length - stats.deleted;
      this.stats.lastCleanup = now;
      
      stats.duration = Date.now() - startTime;
      return stats;
      
    } catch (err) {
      logger.error({ error: err }, 'Cache cleanup error');
      throw err;
    }
  }
  
  /**
   * Format bytes as a human-readable string
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   * @private
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * In-memory cache implementation
 */
class MemoryCache {
  /**
   * Create a new MemoryCache instance
   * @param {Object} options - Cache options
   * @param {number} options.ttl - Time to live in milliseconds
   * @param {number} options.maxSize - Maximum number of items
   */
  constructor({ ttl = 3600000, maxSize = 1000 } = {}) {
    this.ttl = ttl;
    this.maxSize = maxSize;
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      count: 0,
      size: 0,
      lastCleanup: 0
    };
    
    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(
      () => this.cleanup(),
      Math.min(ttl / 2 || 300000, 300000) // Clean up at least every 5 minutes
    );
    
    // Ensure cleanup runs on process exit
    if (typeof process !== 'undefined') {
      process.on('exit', () => {
        clearInterval(this.cleanupInterval);
        this.clear();
      });
    }
  }
  
  /**
   * Check if the cache contains a key
   * @param {string} key - Cache key
   * @returns {boolean} True if the key exists and is not expired
   */
  has(key) {
    if (!this.cache.has(key)) {
      return false;
    }
    
    const entry = this.cache.get(key);
    const isExpired = this.ttl > 0 && (Date.now() - entry.timestamp) > this.ttl;
    
    if (isExpired) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or undefined if not found
   */
  get(key) {
    if (!this.has(key)) {
      this.stats.misses++;
      return undefined;
    }
    
    const entry = this.cache.get(key);
    entry.timestamp = Date.now(); // Update last accessed time
    this.stats.hits++;
    
    return entry.value;
  }
  
  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {Object} [metadata] - Additional metadata to store with the value
   * @returns {boolean} True if successful
   */
  set(key, value, metadata = {}) {
    // Remove oldest entries if we're at max size
    if (this.cache.size >= this.maxSize) {
      const keys = Array.from(this.cache.keys()).slice(0, Math.floor(this.maxSize * 0.1)); // Remove 10% of entries
      for (const k of keys) {
        this.delete(k);
      }
    }
    
    const entry = {
      value,
      metadata: {
        ...metadata,
        cachedAt: new Date().toISOString(),
        expiresAt: this.ttl > 0 
          ? new Date(Date.now() + this.ttl).toISOString()
          : null,
      },
      timestamp: Date.now()
    };
    
    this.cache.set(key, entry);
    this.stats.count = this.cache.size;
    
    return true;
  }
  
  /**
   * Delete a value from the cache
   * @param {string} key - Cache key
   * @returns {boolean} True if the key was deleted or didn't exist
   */
  delete(key) {
    const existed = this.cache.delete(key);
    if (existed) {
      this.stats.count = this.cache.size;
    }
    return existed;
  }
  
  /**
   * Clear the entire cache
   * @returns {boolean} True if successful
   */
  clear() {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      count: 0,
      size: 0,
      lastCleanup: Date.now()
    };
    return true;
  }
  
  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.hits + this.stats.misses > 0
        ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) + '%'
        : '0%',
      maxSize: this.maxSize
    };
  }
  
  /**
   * Clean up expired entries
   * @returns {Object} Cleanup statistics
   */
  cleanup() {
    const now = Date.now();
    let deleted = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      const isExpired = this.ttl > 0 && (now - entry.timestamp) > this.ttl;
      
      if (isExpired) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    this.stats.count = this.cache.size;
    this.stats.lastCleanup = now;
    
    return {
      examined: this.cache.size + deleted,
      deleted,
      duration: 0
    };
  }
}

/**
 * Create a cache instance based on the environment
 * @param {Object} options - Cache options
 * @param {string} [options.type='memory'] - Cache type ('memory' or 'file')
 * @param {string} [options.directory] - Cache directory (required for 'file' type)
 * @param {number} [options.ttl] - Time to live in milliseconds
 * @param {number} [options.maxSize] - Maximum size (bytes for file, items for memory)
 * @returns {FileCache|MemoryCache} Cache instance
 */
function createCache(options = {}) {
  const {
    type = 'memory',
    directory = path.join(require('os').tmpdir(), 'perchance-cache'),
    ttl = 3600000, // 1 hour
    maxSize = type === 'file' ? 1073741824 : 1000, // 1GB or 1000 items
    ...rest
  } = options;
  
  const commonOpts = { ttl, maxSize, ...rest };
  
  switch (type) {
    case 'file':
      return new FileCache({ ...commonOpts, directory });
    case 'memory':
    default:
      return new MemoryCache(commonOpts);
  }
}

module.exports = {
  FileCache,
  MemoryCache,
  createCache,
  generateCacheKey
};
