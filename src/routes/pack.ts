/**
 * pack.ts — Pack Builder, Remix & Sharing API Routes
 *
 * POST /api/pack/plan              — AI plans generator topology for a theme
 * POST /api/pack/build             — builds all generators from a plan
 * POST /api/pack/remix             — remixes existing pack with an instruction
 * POST /api/pack/diff              — diffs two packs
 * POST /api/pack/share             — creates a shareable link (LRU, 24h TTL)
 * POST /api/pack/share/:id/fork    — fork a shared pack (increments forkCount)
 * POST /api/pack/dependencies      — resolve dependency graph for selective export
 * GET  /api/pack/shared/:id        — fetch a shared pack entry
 * GET  /api/pack/:id               — fetch a built pack by build ID
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  planPack,
  buildPack,
  remixPack,
  diffPacks,
  getPackById
} from '../services/packService.js';
import {
  sharePack,
  getSharedPack,
  incrementForkCount,
  resolveDependencies
} from '../services/packShareService.js';

const router = Router();

// ─── Schemas ─────────────────────────────────────────────────────────────────

const PlanSchema = z.object({
  theme: z.string().min(2).max(200)
});

const BuildSchema = z.object({
  plan: z.object({
    theme: z.string(),
    description: z.string(),
    masterSlug: z.string(),
    generators: z.array(z.object({
      slug: z.string(),
      title: z.string(),
      role: z.string(),
      imports: z.array(z.object({ fromSlug: z.string(), listName: z.string() }))
    }))
  })
});

const RemixSchema = z.object({
  packId: z.string().min(1),
  instruction: z.string().min(3).max(500)
});

const DiffSchema = z.object({
  packAId: z.string(),
  packBId: z.string()
});

const ShareSchema = z.object({
  packId: z.string().min(1),
  isPublic: z.boolean().optional().default(true),
  /** Pass the remix chain to preserve fork history */
  remixChain: z.array(z.string()).optional(),
  /** Frontend origin for link construction, e.g. https://myapp.vercel.app */
  baseUrl: z.string().url().optional()
});

const DepsSchema = z.object({
  packId: z.string().min(1),
  selectedSlugs: z.array(z.string()).min(1)
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groqAvailable(): boolean {
  return !!process.env.GROQ_API_KEY;
}

function requireGroq(res: Response): boolean {
  if (!groqAvailable()) {
    res.status(503).json({ success: false, error: 'AI unavailable: GROQ_API_KEY not configured' });
    return false;
  }
  return true;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/** POST /api/pack/plan */
router.post('/plan', async (req: Request, res: Response) => {
  if (!requireGroq(res)) return;
  const parsed = PlanSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ success: false, error: parsed.error.flatten() }); return; }
  try {
    const plan = await planPack(parsed.data.theme);
    res.json({ success: true, data: plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Planning failed' });
  }
});

/** POST /api/pack/build */
router.post('/build', async (req: Request, res: Response) => {
  if (!requireGroq(res)) return;
  const parsed = BuildSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ success: false, error: parsed.error.flatten() }); return; }
  try {
    const pack = await buildPack(parsed.data.plan);
    res.json({ success: true, data: pack });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Build failed' });
  }
});

/** POST /api/pack/remix */
router.post('/remix', async (req: Request, res: Response) => {
  if (!requireGroq(res)) return;
  const parsed = RemixSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ success: false, error: parsed.error.flatten() }); return; }

  const { packId, instruction } = parsed.data;
  const sourcePack = getPackById(packId);
  if (!sourcePack) {
    res.status(404).json({ success: false, error: `Pack "${packId}" not found. Packs expire after 2 hours — rebuild first.` });
    return;
  }
  try {
    const result = await remixPack(sourcePack, instruction);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Remix failed' });
  }
});

/** POST /api/pack/diff */
router.post('/diff', (req: Request, res: Response) => {
  const parsed = DiffSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ success: false, error: parsed.error.flatten() }); return; }
  const packA = getPackById(parsed.data.packAId);
  const packB = getPackById(parsed.data.packBId);
  if (!packA) { res.status(404).json({ success: false, error: `Pack A "${parsed.data.packAId}" not found` }); return; }
  if (!packB) { res.status(404).json({ success: false, error: `Pack B "${parsed.data.packBId}" not found` }); return; }
  res.json({ success: true, data: diffPacks(packA, packB) });
});

/**
 * POST /api/pack/share
 * Body: { packId, isPublic?, remixChain?, baseUrl? }
 * Returns: { id, url, expiresAt }
 */
router.post('/share', (req: Request, res: Response) => {
  const parsed = ShareSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ success: false, error: parsed.error.flatten() }); return; }

  const { packId, isPublic, remixChain, baseUrl } = parsed.data;
  const pack = getPackById(packId);
  if (!pack) {
    res.status(404).json({
      success: false,
      error: `Pack "${packId}" not found or expired. Rebuild the pack first, then share.`
    });
    return;
  }

  const result = sharePack(pack, {
    isPublic,
    remixChain,
    baseUrl: baseUrl || `${req.protocol}://${req.get('host')}`
  });

  res.json({ success: true, data: result });
});

/**
 * POST /api/pack/share/:id/fork
 * Increments forkCount on a shared pack.
 * Returns the shared pack entry so the client can clone it into Studio.
 */
router.post('/share/:id/fork', (req: Request, res: Response) => {
  const entry = getSharedPack(req.params.id);
  if (!entry) {
    res.status(404).json({ success: false, error: 'Shared pack not found or expired' });
    return;
  }
  incrementForkCount(req.params.id);
  res.json({ success: true, data: entry });
});

/**
 * POST /api/pack/dependencies
 * Body: { packId, selectedSlugs: string[] }
 * Returns: DependencyReport — which extra slugs must be included + warnings
 */
router.post('/dependencies', (req: Request, res: Response) => {
  const parsed = DepsSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ success: false, error: parsed.error.flatten() }); return; }

  const { packId, selectedSlugs } = parsed.data;
  const pack = getPackById(packId);
  if (!pack) {
    res.status(404).json({ success: false, error: `Pack "${packId}" not found or expired` });
    return;
  }

  const report = resolveDependencies(pack, selectedSlugs);
  res.json({ success: true, data: report });
});

/**
 * GET /api/pack/shared/:id
 * Returns a shared pack entry (view-only).
 * Also serves as the data source for /pack/:id public page.
 */
router.get('/shared/:id', (req: Request, res: Response) => {
  const entry = getSharedPack(req.params.id);
  if (!entry) {
    res.status(404).json({ success: false, error: 'Shared pack not found or expired' });
    return;
  }
  res.json({ success: true, data: entry });
});

/**
 * GET /api/pack/:id
 * Returns a built pack by its build ID (2h TTL).
 */
router.get('/:id', (req: Request, res: Response) => {
  const pack = getPackById(req.params.id);
  if (!pack) {
    res.status(404).json({ success: false, error: 'Pack not found or expired' });
    return;
  }
  res.json({ success: true, data: pack });
});

export default router;
