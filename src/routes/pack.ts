/**
 * pack.ts — Pack Builder & Remix API Routes
 *
 * POST /api/pack/plan    — AI plans generator topology for a theme
 * POST /api/pack/build   — builds all generators from a plan
 * POST /api/pack/remix   — remixes existing pack with an instruction
 * POST /api/pack/diff    — diffs two packs
 * GET  /api/pack/:id     — fetch a stored pack
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

/**
 * POST /api/pack/plan
 * Body: { theme: string }
 * Returns: PackPlan (topology only, no generated code yet)
 */
router.post('/plan', async (req: Request, res: Response) => {
  if (!requireGroq(res)) return;

  const parsed = PlanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten() });
    return;
  }

  try {
    const plan = await planPack(parsed.data.theme);
    res.json({ success: true, data: plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Planning failed' });
  }
});

/**
 * POST /api/pack/build
 * Body: { plan: PackPlan }
 * Returns: BuiltPack (all generators with code, stored in memory)
 */
router.post('/build', async (req: Request, res: Response) => {
  if (!requireGroq(res)) return;

  const parsed = BuildSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten() });
    return;
  }

  try {
    const pack = await buildPack(parsed.data.plan);
    res.json({ success: true, data: pack });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Build failed' });
  }
});

/**
 * POST /api/pack/remix
 * Body: { packId: string, instruction: string }
 * Returns: RemixResult { id, sourcePackId, instruction, pack, diffSummary }
 *
 * Topology is preserved. All generator content is rewritten per instruction.
 * Example instructions: "convert to sci-fi", "make it darker", "add humor"
 */
router.post('/remix', async (req: Request, res: Response) => {
  if (!requireGroq(res)) return;

  const parsed = RemixSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten() });
    return;
  }

  const { packId, instruction } = parsed.data;
  const sourcePack = getPackById(packId);

  if (!sourcePack) {
    res.status(404).json({
      success: false,
      error: `Pack "${packId}" not found. Packs expire after 2 hours — rebuild first.`
    });
    return;
  }

  try {
    const result = await remixPack(sourcePack, instruction);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Remix failed' });
  }
});

/**
 * POST /api/pack/diff
 * Body: { packAId: string, packBId: string }
 * Returns: PackDiff with per-generator line diffs
 */
router.post('/diff', (req: Request, res: Response) => {
  const parsed = DiffSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten() });
    return;
  }

  const packA = getPackById(parsed.data.packAId);
  const packB = getPackById(parsed.data.packBId);

  if (!packA) {
    res.status(404).json({ success: false, error: `Pack A "${parsed.data.packAId}" not found` });
    return;
  }
  if (!packB) {
    res.status(404).json({ success: false, error: `Pack B "${parsed.data.packBId}" not found` });
    return;
  }

  const diff = diffPacks(packA, packB);
  res.json({ success: true, data: diff });
});

/**
 * GET /api/pack/:id
 * Returns stored pack by ID
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
