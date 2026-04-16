import type { WorkflowTemplate, ComfyUIQueueResponse, ComfyUIPromptData } from '../types/index.js';

const COMFYUI_BASE = 'http://127.0.0.1:8188';

export class ComfyUIService {
  private readonly baseUrl: string;

  constructor(baseUrl = COMFYUI_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check whether a local ComfyUI instance is reachable.
   */
  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/system_stats`, {
        signal: AbortSignal.timeout(2000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Deep-clone the workflow template and inject the prompt data into
   * the appropriate node inputs, then POST to /prompt.
   */
  async queuePrompt(
    workflow: WorkflowTemplate,
    promptData: ComfyUIPromptData,
  ): Promise<ComfyUIQueueResponse> {
    // Deep-clone nodes to avoid mutating the original template
    const nodes = JSON.parse(JSON.stringify(workflow.nodes)) as WorkflowTemplate['nodes'];

    // Inject positive prompt
    const posNode = nodes[workflow.positivePromptNodeId];
    if (posNode?.inputs && 'text' in posNode.inputs) {
      posNode.inputs['text'] = promptData.positive;
    }

    // Inject negative prompt
    const negNode = nodes[workflow.negativePromptNodeId];
    if (negNode?.inputs && 'text' in negNode.inputs) {
      negNode.inputs['text'] = promptData.negative;
    }

    // Inject seed
    const seedNode = nodes[workflow.seedNodeId];
    if (seedNode?.inputs && promptData.seed !== undefined) {
      if ('seed' in seedNode.inputs) {
        seedNode.inputs['seed'] = promptData.seed;
      } else if ('noise_seed' in seedNode.inputs) {
        seedNode.inputs['noise_seed'] = promptData.seed;
      }
    }

    // Optional overrides
    const kSampler = Object.values(nodes).find(
      n => n.class_type === 'KSampler' || n.class_type === 'KSamplerAdvanced',
    );
    if (kSampler?.inputs) {
      if (promptData.steps !== undefined)  kSampler.inputs['steps']  = promptData.steps;
      if (promptData.cfg   !== undefined)  kSampler.inputs['cfg']    = promptData.cfg;
    }

    const emptyLatent = Object.values(nodes).find(n => n.class_type === 'EmptyLatentImage');
    if (emptyLatent?.inputs) {
      if (promptData.width  !== undefined) emptyLatent.inputs['width']  = promptData.width;
      if (promptData.height !== undefined) emptyLatent.inputs['height'] = promptData.height;
    }

    const body = { prompt: nodes };

    const res = await fetch(`${this.baseUrl}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ComfyUI returned ${res.status}: ${text}`);
    }

    return (await res.json()) as ComfyUIQueueResponse;
  }

  /** Cancel all pending items in the ComfyUI queue. */
  async clearQueue(): Promise<void> {
    await fetch(`${this.baseUrl}/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clear: true }),
    });
  }
}

export const comfyUI = new ComfyUIService();
