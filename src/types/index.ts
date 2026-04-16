// src/types/index.ts — v5.0.0

// ─── Prompt Core ─────────────────────────────────────────────
export type PromptCategory =
  | 'anime'
  | 'realistic'
  | 'fantasy'
  | 'scifi'
  | 'portrait'
  | 'landscape'
  | 'abstract'
  | 'architecture'
  | 'food'
  | 'nature'
  | 'fashion'
  | 'surreal';

export type ArtStyle =
  | 'cinematic'
  | 'painterly'
  | 'minimalist'
  | 'cyberpunk'
  | 'watercolor'
  | 'sketch'
  | 'oil-painting'
  | 'digital-art'
  | 'photorealistic'
  | 'anime-style'
  | 'concept-art'
  | 'illustration';

export type ExportFormat = 'json' | 'csv' | 'txt' | 'md';
export type QualityLevel = 'draft' | 'standard' | 'high' | 'ultra';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';
export type SortOrder = 'asc' | 'desc';
export type SortBy = 'quality' | 'createdAt' | 'category' | 'style';

export interface PromptMetadata {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  source: 'cli' | 'web' | 'discord' | 'api';
  seed?: number;
  model?: string;
  enhancedBy?: string;
}

export interface GeneratedPrompt {
  prompt: string;
  negativePrompt?: string;
  category: PromptCategory;
  style: ArtStyle;
  quality: number;
  tags: string[];
  metadata: PromptMetadata;
  variations?: string[];
  width?: number;
  height?: number;
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
  enhance?: boolean;
  negative?: boolean;
  width?: number;
  height?: number;
}

export interface BatchOptions extends CLIOptions {
  count: number;
  parallel?: boolean;
  delay?: number;
  maxConcurrent?: number;
}

// ─── Cache ───────────────────────────────────────────────────
export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  hits: number;
  key?: string;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  onEvict?: (key: string, value: unknown) => void;
}

// ─── Validation ──────────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitized: string;
  score?: number;
}

export interface ValidationRule {
  name: string;
  validate: (input: string) => boolean;
  message: string;
  severity: 'error' | 'warning';
  weight?: number;
}

// ─── API ─────────────────────────────────────────────────────
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  version: string;
  requestId?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
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
  checkpointModel?: string;
  loraModels?: string[];
}

export interface ComfyWorkflow {
  id: string;
  nodes: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// ─── Discord ─────────────────────────────────────────────────
export interface DiscordBotConfig {
  token: string;
  clientId: string;
  guildId?: string;
  rateLimitPerUser?: number;
  rateLimitWindowMs?: number;
  adminRoleId?: string;
  logChannelId?: string;
}

export interface DiscordCommandResult {
  success: boolean;
  content: string;
  ephemeral?: boolean;
  embeds?: unknown[];
}

// ─── Analytics ───────────────────────────────────────────────
export interface UsageStats {
  totalGenerated: number;
  categoryCounts: Record<PromptCategory, number>;
  styleCounts: Record<ArtStyle, number>;
  averageQuality: number;
  topTags: Array<{ tag: string; count: number }>;
  dailyActivity: Array<{ date: string; count: number }>;
  topCategories?: Array<{ category: PromptCategory; count: number }>;
  qualityDistribution?: Array<{ range: string; count: number }>;
}

export interface AnalyticsEvent {
  type: 'generate' | 'export' | 'validate' | 'enhance';
  timestamp: Date;
  metadata?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

// ─── Configuration ───────────────────────────────────────────
export interface AppConfig {
  port: number;
  host: string;
  env: 'development' | 'production' | 'test';
  logLevel: LogLevel;
  cors: {
    origins: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  cache: {
    defaultTtl: number;
    maxSize: number;
  };
  pollinations: {
    imageBaseUrl: string;
    textBaseUrl: string;
    defaultModel: string;
    timeout: number;
  };
}

// ─── Filter & Search ─────────────────────────────────────────
export interface PromptFilter {
  category?: PromptCategory;
  style?: ArtStyle;
  minQuality?: number;
  maxQuality?: number;
  tags?: string[];
  source?: PromptMetadata['source'];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PromptSearchOptions extends PromptFilter {
  query?: string;
  page?: number;
  perPage?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}
