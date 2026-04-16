// src/services/comfyui.ts — v4.0.0
import axios, { AxiosInstance } from 'axios';

// ─── Tipuri ──────────────────────────────────────────────────
export interface ComfyUIConfig {
  baseUrl: string;
  timeout?: number;
  clientId?: string;
}

export interface GenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  sampler?: string;
  seed?: number;
}

export interface GenerationResult {
  images: string[];
  promptId: string;
  timeTaken: number;
}

export interface QueueStatus {
  queueRemaining: number;
  execInfo: { queueRemaining: number };
}

// ─── Service ─────────────────────────────────────────────────
export class ComfyUIService {
  private client: AxiosInstance;
  private readonly clientId: string;

  constructor(private config: ComfyUIConfig) {
    this.clientId = config.clientId ?? `perchance-${Date.now()}`;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout ?? 30_000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.get('/system_stats');
      return true;
    } catch {
      return false;
    }
  }

  async getQueueStatus(): Promise<QueueStatus> {
    const res = await this.client.get<QueueStatus>('/prompt');
    return res.data;
  }

  private buildWorkflow(req: GenerationRequest): Record<string, unknown> {
    return {
      '3': {
        class_type: 'KSampler',
        inputs: {
          seed: req.seed ?? Math.floor(Math.random() * 1_000_000),
          steps: req.steps ?? 20,
          cfg: req.cfgScale ?? 7,
          sampler_name: req.sampler ?? 'euler',
          scheduler: 'normal',
          denoise: 1,
          model: ['4', 0],
          positive: ['6', 0],
          negative: ['7', 0],
          latent_image: ['5', 0],
        },
      },
      '4': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: 'v1-5-pruned-emaonly.ckpt' } },
      '5': {
        class_type: 'EmptyLatentImage',
        inputs: { batch_size: 1, height: req.height ?? 512, width: req.width ?? 512 },
      },
      '6': { class_type: 'CLIPTextEncode', inputs: { text: req.prompt, clip: ['4', 1] } },
      '7': {
        class_type: 'CLIPTextEncode',
        inputs: { text: req.negativePrompt ?? 'ugly, blurry, low quality', clip: ['4', 1] },
      },
      '8': { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: ['4', 2] } },
      '9': {
        class_type: 'SaveImage',
        inputs: { filename_prefix: 'perchance_v4', images: ['8', 0] },
      },
    };
  }

  async generate(req: GenerationRequest): Promise<GenerationResult> {
    const start = Date.now();
    const workflow = this.buildWorkflow(req);

    const queueRes = await this.client.post<{ prompt_id: string }>('/prompt', {
      prompt: workflow,
      client_id: this.clientId,
    });

    const promptId = queueRes.data.prompt_id;

    // Poll pentru rezultat
    let attempts = 0;
    while (attempts < 60) {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        const histRes = await this.client.get<Record<string, { outputs: Record<string, { images: Array<{ filename: string }> }> }>>(`/history/${promptId}`);
        const history = histRes.data[promptId];
        if (history) {
          const images = Object.values(history.outputs)
            .flatMap((o) => o.images ?? [])
            .map((img) => `${this.config.baseUrl}/view?filename=${img.filename}`);
          return { images, promptId, timeTaken: Date.now() - start };
        }
      } catch { /* continuă polling */ }
      attempts++;
    }

    throw new Error(`ComfyUI timeout după ${attempts}s pentru promptId: ${promptId}`);
  }
}

export function createComfyUIService(baseUrl = 'http://127.0.0.1:8188'): ComfyUIService {
  return new ComfyUIService({ baseUrl });
}
