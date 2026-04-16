// src/types/index.ts — v4.0.0

// ─── Prompt Core ─────────────────────────────────────────────
export type PromptCategory = 'anime' | 'realistic' | 'fantasy' | 'scifi' | 'portrait' | 'landscape' | 'abstract';
export type ArtStyle = 'cinematic' | 'painterly' | 'minimalist' | 'cyberpunk' | 'watercolor' | 'sketch';
export type ExportFormat = 'json' | 'csv' | 'txt' | 'md';
export type QualityLevel = 'draft' | 'standard' | 'high' | 'ultra';

export interface PromptMetadata {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  source: 'cli' | 'web' | 'discord' | 'api';
}

export interface GeneratedPrompt {
  prompt: string;
  negativePrompt?: string;
  category: PromptCategory;
  style: ArtStyle;
  quality: number;
  tags: string[];
  metadata: PromptMetadata;
}

// ─── CLI ─────────────────────────────────────────────────────
export interface CLIOptions {
  category?: PromptCategory;
  style?: ArtStyle;
  count?: number;
  export?: ExportFormat;
  quality?: QualityLevel;
  seed?: number;
  verbose?: boolean;
  output?: string;
}

export interface BatchOptions extends CLIOptions {
  count: number;
  parallel?: boolean;
  delay?: number;
}

// ─── Cache ───────────────────────────────────────────────────
export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  hits: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

// ─── Validation ──────────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitized: string;
}

export interface ValidationRule {
  name: string;
  validate: (input: string) => boolean;
  message: string;
  severity: 'error' | 'warning';
}

// ─── API ─────────────────────────────────────────────────────
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  version: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// ─── ComfyUI ─────────────────────────────────────────────────
export interface ComfyGenerationConfig {
  baseUrl: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  sampler?: string;
  seed?: number;
  timeout?: number;
}

// ─── Discord ─────────────────────────────────────────────────
export interface DiscordBotConfig {
  token: string;
  clientId: string;
  guildId?: string;
  rateLimitPerUser?: number;
  rateLimitWindowMs?: number;
}

// ─── Analytics ───────────────────────────────────────────────
export interface UsageStats {
  totalGenerated: number;
  categoryCounts: Record<PromptCategory, number>;
  styleCounts: Record<ArtStyle, number>;
  averageQuality: number;
  topTags: Array<{ tag: string; count: number }>;
  dailyActivity: Array<{ date: string; count: number }>;
}
