import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { createHash } from 'crypto';

export interface CacheOptions {
  ttl?: number;     // TTL in ms (default: 1h)
  namespace?: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

export class FileCache {
  protected readonly cacheDir: string;

  constructor(namespace = 'default') {
    this.cacheDir = path.join(os.homedir(), '.perchance', 'cache', namespace);
    this.ensureDir();
  }

  private ensureDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private keyToFile(key: string): string {
    const hash = createHash('sha256').update(key).digest('hex').substring(0, 16);
    return path.join(this.cacheDir, `${hash}.json`);
  }

  get<T>(key: string): T | null {
    try {
      const filePath = this.keyToFile(key);
      if (!fs.existsSync(filePath)) return null;
      const entry = JSON.parse(fs.readFileSync(filePath, 'utf8')) as CacheEntry<T>;
      if (Date.now() - entry.timestamp > entry.ttl) {
        fs.unlinkSync(filePath);
        return null;
      }
      return entry.data;
    } catch {
      return null;
    }
  }

  set<T>(key: string, data: T, ttl = 3_600_000): void {
    try {
      const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl, key };
      fs.writeFileSync(this.keyToFile(key), JSON.stringify(entry, null, 2));
    } catch { /* silent */ }
  }

  delete(key: string): void {
    try {
      const filePath = this.keyToFile(key);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch { /* silent */ }
  }

  clear(): void {
    try {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        fs.unlinkSync(path.join(this.cacheDir, file));
      }
    } catch { /* silent */ }
  }

  /** Returns count of cache files */
  size(): number {
    try {
      return fs.readdirSync(this.cacheDir).filter((f) => f.endsWith('.json')).length;
    } catch {
      return 0;
    }
  }

  /** Remove all expired entries, returns count pruned */
  prune(): number {
    let pruned = 0;
    try {
      const files = fs.readdirSync(this.cacheDir).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        try {
          const entry = JSON.parse(fs.readFileSync(filePath, 'utf8')) as CacheEntry<unknown>;
          if (Date.now() - entry.timestamp > entry.ttl) {
            fs.unlinkSync(filePath);
            pruned++;
          }
        } catch {
          fs.unlinkSync(filePath);
          pruned++;
        }
      }
    } catch { /* silent */ }
    return pruned;
  }
}

// Singleton instances per namespace
const cacheInstances = new Map<string, FileCache>();

/**
 * Returns a singleton FileCache instance for the given namespace.
 * @param namespace - Cache namespace (default: 'default')
 */
export function getCache(namespace = 'default'): FileCache {
  if (!cacheInstances.has(namespace)) {
    cacheInstances.set(namespace, new FileCache(namespace));
  }
  return cacheInstances.get(namespace)!;
}
