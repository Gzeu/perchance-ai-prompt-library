// src/services/pollinationsService.ts — v4.0.0
import axios from 'axios';
import type { APIResponse } from '../types/index.js';

const BASE_URL = 'https://image.pollinations.ai';
const TEXT_URL = 'https://text.pollinations.ai';

export interface PollinationsImageOptions {
  width?: number;
  height?: number;
  seed?: number;
  model?: 'flux' | 'flux-realism' | 'flux-cablyai' | 'turbo';
  nologo?: boolean;
  enhance?: boolean;
}

export interface PollinationsTextOptions {
  model?: 'openai' | 'mistral' | 'claude' | 'llama';
  seed?: number;
  system?: string;
}

export class PollinationsService {
  /**
   * Generate image URL (no API key required)
   */
  getImageUrl(prompt: string, options: PollinationsImageOptions = {}): string {
    const encoded = encodeURIComponent(prompt);
    const params = new URLSearchParams();
    if (options.width)   params.set('width', String(options.width));
    if (options.height)  params.set('height', String(options.height));
    if (options.seed !== undefined) params.set('seed', String(options.seed));
    if (options.model)   params.set('model', options.model);
    if (options.nologo)  params.set('nologo', 'true');
    if (options.enhance) params.set('enhance', 'true');
    const qs = params.toString();
    return `${BASE_URL}/prompt/${encoded}${qs ? `?${qs}` : ''}`;
  }

  /**
   * Generate text completion
   */
  async generateText(
    prompt: string,
    options: PollinationsTextOptions = {}
  ): Promise<APIResponse<string>> {
    try {
      const url = `${TEXT_URL}/${encodeURIComponent(prompt)}`;
      const params = new URLSearchParams();
      if (options.model)  params.set('model', options.model);
      if (options.seed !== undefined) params.set('seed', String(options.seed));
      if (options.system) params.set('system', options.system);

      const res = await axios.get<string>(`${url}?${params.toString()}`, {
        timeout: 30_000,
        responseType: 'text',
      });

      return {
        success: true,
        data: res.data,
        timestamp: new Date().toISOString(),
        version: '4.0.0',
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        version: '4.0.0',
      };
    }
  }

  /**
   * Enhance a prompt using AI text generation
   */
  async enhancePrompt(basePrompt: string): Promise<string> {
    const systemPrompt = 'You are an expert at writing Stable Diffusion / Flux image generation prompts. Enhance the given prompt by adding artistic details, lighting, atmosphere, and quality tags. Return ONLY the enhanced prompt, nothing else.';
    const result = await this.generateText(basePrompt, {
      model: 'openai',
      system: systemPrompt,
    });
    return result.success && result.data ? result.data : basePrompt;
  }
}

export const pollinationsService = new PollinationsService();
