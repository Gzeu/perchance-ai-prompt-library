/**
 * TypeScript types for Perchance.ai syntax and toolkit
 */

export type PerchanceCategory =
  | 'names'
  | 'characters'
  | 'scenes'
  | 'items'
  | 'dialogue'
  | 'images'
  | 'loot'
  | 'quests'
  | 'custom';

export type GeneratorStyle = 'simple' | 'weighted' | 'nested' | 'complex';

export interface PerchanceTemplate {
  name: string;
  category: PerchanceCategory;
  description: string;
  code: string;
  tags: string[];
  author?: string;
  version?: string;
}

export interface GenerateRequest {
  topic: string;
  category: PerchanceCategory;
  style: GeneratorStyle;
  itemCount?: number;
  useAI?: boolean;
  model?: string;
}

export interface GenerateResult {
  code: string;
  filename: string;
  category: PerchanceCategory;
  stats: {
    listCount: number;
    totalItems: number;
  };
  previewRolls?: string[];
}

export interface PlaywrightRunOptions {
  code: string;
  rolls?: number;
  headless?: boolean;
  screenshot?: boolean;
  timeout?: number;
}

export interface PlaywrightRunResult {
  results: string[];
  screenshot?: string;   // base64 PNG
  url?: string;
  error?: string;
}

export interface MCPToolInput {
  topic?: string;
  category?: PerchanceCategory;
  style?: GeneratorStyle;
  code?: string;
  name?: string;
  count?: number;
  rolls?: number;
}

export interface OpenClawSkillManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  capabilities: string[];
  mcp_server: string;
  tools: string[];
}
