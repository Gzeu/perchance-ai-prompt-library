import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { CacheEntry, CacheOptions } from '../types/index.js';

const DEFAULT_TTL = 3_600_000;         // 1 hour in ms
const DEFAULT_CACHE_DIR = path.join(os.homedir(), '.perchance', 'cache');

export class FileCache {
  private readonly cacheDir: string;
  private readonly defaultTtl: number;

  constructor(options?: { cacheDir?: string; defaultTtl?: number }) {
    this.cacheDir  = options?.cacheDir   ?? DEFAULT_CACHE_DIR;
    this.defaultTtl = options?.defaultTtl ?? DEFAULT_TTL;
  }

  // ─── helpers ────────────────────────────────────────────────────────────────────

  private ensureDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private filePath(namespace: string, key: string): string {
    const safeKey = key.replace(/[^a-z0-9_\-]/gi, '_').slice(0, 120);
    return path.join(this.cacheDir, namespace, `${safeKey}.json`);
  }

  private ensureNamespaceDir(namespace: string): void {
    const dir = path.join(this.cacheDir, namespace);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // ─── public API ───────────────────────────────────────────────────────────────

  get<T>(key: string, options?: Pick<CacheOptions, 'namespace'>): T | null {
    const ns = options?.namespace ?? 'default';
    const fp = this.filePath(ns, key);
    try {
      if (!fs.existsSync(fp)) return null;
      const raw = fs.readFileSync(fp, 'utf8');
      const entry = JSON.parse(raw) as CacheEntry<T>;
      if (Date.now() - entry.timestamp > entry.ttl) {
        fs.unlinkSync(fp);
        return null;
      }
      return entry.data;
    } catch {
      return null;
    }
  }

  set<T>(key: string, data: T, options?: CacheOptions): void {
    const ns  = options?.namespace ?? 'default';
    const ttl = options?.ttl       ?? this.defaultTtl;
    this.ensureDir();
    this.ensureNamespaceDir(ns);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      namespace: ns,
    };
    const fp = this.filePath(ns, key);
    try {
      fs.writeFileSync(fp, JSON.stringify(entry, null, 2));
    } catch {
      // silent fail
    }
  }

  delete(key: string, options?: Pick<CacheOptions, 'namespace'>): void {
    const ns = options?.namespace ?? 'default';
    const fp = this.filePath(ns, key);
    try {
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    } catch {
      // silent
    }
  }

  /** Clear an entire namespace or the whole cache directory. */
  clear(namespace?: string): void {
    const target = namespace
      ? path.join(this.cacheDir, namespace)
      : this.cacheDir;
    try {
      if (fs.existsSync(target)) {
        fs.rmSync(target, { recursive: true, force: true });
      }
    } catch {
      // silent
    }
  }

  /** Return true if the key exists and is not expired. */
  has(key: string, options?: Pick<CacheOptions, 'namespace'>): boolean {
    return this.get(key, options) !== null;
  }
}

// Singleton export for CLI use
export const cache = new FileCache();
