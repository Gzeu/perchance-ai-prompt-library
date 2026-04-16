// src/api/routes/health.ts — v5.0.0
import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();
const START_TIME = Date.now();
const VERSION = '5.0.0';

router.get('/', (_req: Request, res: Response): void => {
  const uptimeMs = Date.now() - START_TIME;
  res.json({
    success: true,
    status: 'ok',
    version: VERSION,
    uptime: uptimeMs,
    uptimeFormatted: formatUptime(uptimeMs),
    timestamp: new Date().toISOString(),
    env: process.env['NODE_ENV'] ?? 'development',
    memory: process.memoryUsage(),
    node: process.version,
  });
});

router.get('/ping', (_req: Request, res: Response): void => {
  res.json({ pong: true, ts: Date.now() });
});

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export default router;
