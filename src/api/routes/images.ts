import { Router, Request, Response } from 'express';

const router = Router();

const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';
const POLLINATIONS_TEXT_BASE = 'https://text.pollinations.ai';

interface ImageGenerateBody {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  seed?: number;
  nologo?: boolean;
  enhance?: boolean;
}

function buildImageUrl(params: ImageGenerateBody): string {
  const encoded = encodeURIComponent(params.prompt);
  const qs = new URLSearchParams();
  if (params.model) qs.set('model', params.model);
  if (params.width) qs.set('width', String(params.width));
  if (params.height) qs.set('height', String(params.height));
  if (params.seed !== undefined) qs.set('seed', String(params.seed));
  if (params.nologo) qs.set('nologo', 'true');
  if (params.enhance) qs.set('enhance', 'true');
  const query = qs.toString();
  return `${POLLINATIONS_BASE}/${encoded}${query ? '?' + query : ''}`;
}

/**
 * @swagger
 * /api/images/url:
 *   post:
 *     summary: Build a Pollinations image URL without downloading
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [prompt]
 *             properties:
 *               prompt: { type: string }
 *               model: { type: string, default: flux }
 *               width: { type: integer, default: 1024 }
 *               height: { type: integer, default: 1024 }
 *               seed: { type: integer }
 *               nologo: { type: boolean }
 *               enhance: { type: boolean }
 */
router.post('/url', (req: Request, res: Response) => {
  try {
    const body: ImageGenerateBody = req.body;
    if (!body.prompt) {
      return res.status(400).json({ success: false, error: 'prompt is required' });
    }
    const url = buildImageUrl(body);
    res.json({ success: true, data: { url, prompt: body.prompt } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/images/generate:
 *   post:
 *     summary: Generate image and return URL (Pollinations.ai, no API key needed)
 *     tags: [Images]
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const body: ImageGenerateBody = req.body;
    if (!body.prompt) {
      return res.status(400).json({ success: false, error: 'prompt is required' });
    }
    const url = buildImageUrl({
      ...body,
      width: body.width || 1024,
      height: body.height || 1024,
      model: body.model || 'flux',
      nologo: body.nologo !== false,
    });
    res.json({
      success: true,
      data: {
        url,
        prompt: body.prompt,
        model: body.model || 'flux',
        width: body.width || 1024,
        height: body.height || 1024,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/images/batch:
 *   post:
 *     summary: Build multiple image URLs in a single request
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [prompts]
 *             properties:
 *               prompts: { type: array, items: { type: string } }
 *               model: { type: string }
 *               width: { type: integer }
 *               height: { type: integer }
 *               nologo: { type: boolean }
 */
router.post('/batch', (req: Request, res: Response) => {
  try {
    const { prompts, model, width, height, nologo } = req.body;
    if (!Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({ success: false, error: 'prompts array is required' });
    }
    if (prompts.length > 50) {
      return res.status(400).json({ success: false, error: 'Maximum 50 prompts per batch' });
    }
    const results = prompts.map((prompt: string, index: number) => ({
      index,
      prompt,
      url: buildImageUrl({ prompt, model, width, height, nologo }),
    }));
    res.json({ success: true, data: results, count: results.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
