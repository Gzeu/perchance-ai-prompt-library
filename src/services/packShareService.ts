/**
 * packShareService.ts — Pack Sharing & LRU Store
 *
 * Provides:
 *   sharePack(pack, options)  → { id, url, expiresAt }
 *   getSharedPack(id)         → SharedPackEntry | undefined
 *   resolveDependencies(pack, selectedSlugs) → DependencyReport
 *
 * Storage: LRU Map with 500 entries max, TTL 24h
 * No DB required — self-contained in process memory.
 * For truly persistent sharing, encode pack as base64 in URL (see encodePackToUrl).
 */

import { BuiltPack, GeneratorNode } from './packService.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SharedPackEntry {
  id: string;
  pack: BuiltPack;
  createdAt: string;
  expiresAt: string;
  forkCount: number;
  isPublic: boolean;
  remixChain: string[]; // ordered list of pack IDs: [original, remix1, remix2, ...]
  title: string;
  description: string;
}

export interface ShareResult {
  id: string;
  url: string;
  expiresAt: string;
}

export interface DependencyWarning {
  /** The selected generator that has an unresolved dependency */
  dependent: string;
  /** The missing generator slug it imports from */
  missing: string;
  /** The list name it tries to import: [^missing.listName] */
  listName: string;
}

export interface DependencyReport {
  /** Slugs explicitly selected by user */
  selected: string[];
  /** Slugs auto-resolved as required dependencies */
  resolved: string[];
  /** Warnings: selected gen → missing gen + list */
  warnings: DependencyWarning[];
  /** Final set of slugs to export (selected + resolved) */
  exportSlugs: string[];
}

// ─── LRU Store ────────────────────────────────────────────────────────────────

const MAX_ENTRIES = 500;
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

/** Insertion-order Map used as a simple LRU (evict oldest on overflow) */
const shareStore = new Map<string, SharedPackEntry>();

function evictIfFull(): void {
  if (shareStore.size >= MAX_ENTRIES) {
    // Delete the oldest key (first inserted)
    const oldestKey = shareStore.keys().next().value;
    if (oldestKey) shareStore.delete(oldestKey);
  }
}

function generateShareId(): string {
  // 8-char alphanumeric, URL-safe
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

// ─── sharePack ────────────────────────────────────────────────────────────────

export function sharePack(
  pack: BuiltPack,
  options: {
    isPublic?: boolean;
    remixChain?: string[];
    baseUrl?: string;
  } = {}
): ShareResult {
  evictIfFull();

  const id = generateShareId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TTL_MS).toISOString();
  const baseUrl = options.baseUrl || 'http://localhost:5173';

  const entry: SharedPackEntry = {
    id,
    pack,
    createdAt: now.toISOString(),
    expiresAt,
    forkCount: 0,
    isPublic: options.isPublic ?? true,
    remixChain: options.remixChain ?? [pack.id],
    title: pack.theme,
    description: pack.description
  };

  shareStore.set(id, entry);

  // Auto-expire
  setTimeout(() => shareStore.delete(id), TTL_MS);

  return {
    id,
    url: `${baseUrl}/pack/${id}`,
    expiresAt
  };
}

// ─── getSharedPack ────────────────────────────────────────────────────────────

export function getSharedPack(id: string): SharedPackEntry | undefined {
  return shareStore.get(id);
}

// ─── incrementForkCount ───────────────────────────────────────────────────────

export function incrementForkCount(id: string): void {
  const entry = shareStore.get(id);
  if (entry) entry.forkCount++;
}

// ─── resolveDependencies ──────────────────────────────────────────────────────

/**
 * Given a BuiltPack and a subset of selected generator slugs,
 * analyzes the [^slug.list] import graph and returns:
 *   - which dependencies are missing
 *   - which slugs to auto-include
 *   - warnings per dependent generator
 *
 * Algorithm: BFS from selected nodes, follow imports transitively.
 */
export function resolveDependencies(
  pack: BuiltPack,
  selectedSlugs: string[]
): DependencyReport {
  const allBySlug = new Map<string, GeneratorNode>(
    pack.generators.map(g => [g.slug, g])
  );

  const selected = new Set(selectedSlugs);
  const resolved = new Set<string>(); // auto-added deps
  const warnings: DependencyWarning[] = [];

  // BFS queue starts with explicitly selected slugs
  const queue = [...selectedSlugs];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const slug = queue.shift()!;
    if (visited.has(slug)) continue;
    visited.add(slug);

    const gen = allBySlug.get(slug);
    if (!gen) continue;

    for (const imp of gen.imports) {
      if (selected.has(imp.fromSlug) || resolved.has(imp.fromSlug)) {
        // Already included — no warning
        queue.push(imp.fromSlug);
      } else if (allBySlug.has(imp.fromSlug)) {
        // Exists in pack but not selected — auto-resolve and warn
        resolved.add(imp.fromSlug);
        queue.push(imp.fromSlug);
        warnings.push({
          dependent: slug,
          missing: imp.fromSlug,
          listName: imp.listName
        });
      } else {
        // Import references a generator not in the pack at all
        warnings.push({
          dependent: slug,
          missing: imp.fromSlug,
          listName: imp.listName
        });
      }
    }
  }

  const exportSlugs = [...new Set([...selected, ...resolved])];

  return {
    selected: [...selected],
    resolved: [...resolved],
    warnings,
    exportSlugs
  };
}

// ─── encodePackToUrl ──────────────────────────────────────────────────────────

/**
 * Encode a subset of generators into a self-contained base64 URL param.
 * Useful for zero-backend sharing: the link itself contains the data.
 * Caller is responsible for URL length checks (~8KB practical limit).
 */
export function encodePackToUrl(pack: BuiltPack, slugs?: string[]): string {
  const gens = slugs
    ? pack.generators.filter(g => slugs.includes(g.slug))
    : pack.generators;

  const payload = JSON.stringify({
    theme: pack.theme,
    description: pack.description,
    masterSlug: pack.masterSlug,
    generators: gens.map(g => ({
      slug: g.slug,
      title: g.title,
      role: g.role,
      imports: g.imports,
      code: g.code
    }))
  });

  // btoa only works in browser; use Buffer in Node
  return Buffer.from(payload, 'utf-8').toString('base64url');
}

export function decodePackFromUrl(encoded: string): Partial<BuiltPack> | null {
  try {
    const json = Buffer.from(encoded, 'base64url').toString('utf-8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}
