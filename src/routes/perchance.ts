import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { GroqService } from '../services/groqService.js';
import { templateLibrary } from '../data/perchance-templates/index.js';

const router = Router();
let groq: GroqService | null = null;

try {
  groq = new GroqService();
} catch {
  console.warn('[Perchance] GROQ_API_KEY not set — AI generation disabled');
}

const GenerateSchema = z.object({
  category: z.string().min(2).max(100),
  description: z.string().min(5).max(500),
  complexity: z.enum(['simple', 'medium', 'master']).default('medium'),
  theme: z.string().max(200).optional(),
  model: z.string().optional()
});

const RefineSchema = z.object({
  code: z.string().min(10).max(50000),
  request: z.string().min(5).max(500)
});

const IdeasSchema = z.object({
  category: z.string().min(2).max(100),
  count: z.number().int().min(1).max(20).default(5)
});

const ValidateSchema = z.object({
  code: z.string().min(1).max(50000)
});

// GET /api/perchance/templates
router.get('/templates', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: templateLibrary,
    total: templateLibrary.length
  });
});

// GET /api/perchance/templates/:id
router.get('/templates/:id', (req: Request, res: Response) => {
  const template = templateLibrary.find(t => t.id === req.params.id);
  if (!template) {
    res.status(404).json({ success: false, error: 'Template not found' });
    return;
  }
  res.json({ success: true, data: template });
});

// GET /api/perchance/templates/category/:cat
router.get('/templates/category/:cat', (req: Request, res: Response) => {
  const templates = templateLibrary.filter(
    t => t.category.toLowerCase() === req.params.cat.toLowerCase()
  );
  res.json({ success: true, data: templates, total: templates.length });
});

// GET /api/perchance/categories
router.get('/categories', (_req: Request, res: Response) => {
  const cats = [...new Set(templateLibrary.map(t => t.category))];
  const result = cats.map(cat => ({
    name: cat,
    count: templateLibrary.filter(t => t.category === cat).length,
    templates: templateLibrary.filter(t => t.category === cat).map(t => ({ id: t.id, name: t.name, complexity: t.complexity }))
  }));
  res.json({ success: true, data: result });
});

// POST /api/perchance/generate
router.post('/generate', async (req: Request, res: Response) => {
  if (!groq) {
    res.status(503).json({ success: false, error: 'AI generation unavailable: GROQ_API_KEY not configured' });
    return;
  }

  const parsed = GenerateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await groq.generatePerchanceCode(parsed.data);
    const validation = groq.validatePerchanceCode(result.code);
    res.json({ success: true, data: { ...result, validation } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Generation failed' });
  }
});

// POST /api/perchance/refine
router.post('/refine', async (req: Request, res: Response) => {
  if (!groq) {
    res.status(503).json({ success: false, error: 'AI generation unavailable: GROQ_API_KEY not configured' });
    return;
  }

  const parsed = RefineSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await groq.refineCode(parsed.data.code, parsed.data.request);
    const validation = groq.validatePerchanceCode(result.code);
    res.json({ success: true, data: { ...result, validation } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Refinement failed' });
  }
});

// POST /api/perchance/ideas
router.post('/ideas', async (req: Request, res: Response) => {
  if (!groq) {
    res.status(503).json({ success: false, error: 'AI generation unavailable: GROQ_API_KEY not configured' });
    return;
  }

  const parsed = IdeasSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten() });
    return;
  }

  try {
    const ideas = await groq.generateIdeas(parsed.data.category, parsed.data.count);
    res.json({ success: true, data: ideas });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Ideas generation failed' });
  }
});

// POST /api/perchance/validate
router.post('/validate', (req: Request, res: Response) => {
  const parsed = ValidateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten() });
    return;
  }

  if (!groq) {
    res.status(503).json({ success: false, error: 'Service unavailable' });
    return;
  }

  const result = groq.validatePerchanceCode(parsed.data.code);
  res.json({ success: true, data: result });
});

export default router;
