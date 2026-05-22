// ─── Core Prompt Types ─────────────────────────────────────────────────────

export interface Prompt {
  id: string;
  text: string;
  category: string;
  style?: string;
  mood?: string;
  quality?: number;
  tags: string[];
  negativePrompt?: string;
  createdAt: Date;
  updatedAt?: Date;
  imageUrl?: string;
  model?: string;
  seed?: number;
  metadata?: Record<string, unknown>;
}

export interface GeneratedPrompt {
  id: string;
  prompt: string;
  category: string;
  style?: string;
  mood?: string;
  quality?: number;
  tags: string[];
  negativePrompt?: string;
  createdAt: Date;
  imageUrl?: string;
  model?: string;
  seed?: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  template: string;
  variables: Record<string, string[]>;
  category: string;
  qualitySuffix?: string;
  negativePrompt?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

// ─── Generation Options ─────────────────────────────────────────────────────

export type MoodType = 'dramatic' | 'epic' | 'peaceful' | 'vibrant' | 'mysterious' | 'melancholic' | 'joyful' | 'dark' | 'ethereal' | 'raw';

export interface GenerateOptions {
  category?: string;
  style?: string;
  subject?: string;
  mood?: MoodType;
  quality?: number;
  count?: number;
  includeNegative?: boolean;
  seed?: number;
  enhancers?: string[];
  loras?: string[];
  tags?: string[];
}

export interface BatchGenerateOptions extends GenerateOptions {
  parallel?: number;
  onProgress?: (current: number, total: number) => void;
  stopOnError?: boolean;
}

// ─── Analytics Types ────────────────────────────────────────────────────────

export interface DailyActivity {
  date: string;
  count: number;
  categories: Record<string, number>;
}

export interface UsageStats {
  totalGenerated: number;
  totalExported: number;
  totalImages: number;
  byCategory: Record<string, number>;
  byStyle: Record<string, number>;
  byMood: Record<string, number>;
  byQuality: Record<number, number>;
  popularTags: Array<{ tag: string; count: number }>;
  dailyActivity: DailyActivity[];
  sessionStart: Date;
  lastActivity: Date;
  averageQuality: number;
}

export interface AnalyticsEvent {
  type: 'generate' | 'export' | 'image' | 'search' | 'batch';
  category?: string;
  style?: string;
  mood?: string;
  quality?: number;
  tags?: string[];
  count?: number;
  timestamp: Date;
}

// ─── Export Types ───────────────────────────────────────────────────────────

export type ExportFormat = 'json' | 'csv' | 'txt' | 'md' | 'markdown';

export interface ExportOptions {
  format: ExportFormat;
  outputPath?: string;
  filename?: string;
  includeMetadata?: boolean;
  includeNegatives?: boolean;
  separator?: string;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  content: string;
  format: ExportFormat;
  count: number;
  sizeBytes: number;
  error?: string;
}

// ─── API Types ──────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  success: false;
  error: string;
  code: string;
  statusCode: number;
  details?: unknown;
}

// ─── Pollinations Types ──────────────────────────────────────────────────────

export type PollinationsImageModel = 'flux' | 'flux-realism' | 'flux-cablyai' | 'flux-anime' | 'flux-3d' | 'any-dark' | 'turbo' | 'stable-diffusion';
export type PollinationsTextModel = 'mistral' | 'mistral-nemo' | 'llama' | 'gemma' | 'qwen' | 'openai';

export interface PollinationsImageOptions {
  prompt: string;
  model?: PollinationsImageModel;
  width?: number;
  height?: number;
  seed?: number;
  enhance?: boolean;
  nologo?: boolean;
  safe?: boolean;
}

export interface PollinationsTextOptions {
  prompt: string;
  model?: PollinationsTextModel;
  system?: string;
  seed?: number;
  jsonMode?: boolean;
}

// ─── Cache Types ─────────────────────────────────────────────────────────────

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  hits: number;
  createdAt: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: string;
}

// ─── Validation Types ────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  sanitized: string;
  warnings: string[];
  errors: string[];
  score: number;
  wordCount: number;
  estimatedTokens: number;
}

export interface ValidatorOptions {
  maxLength?: number;
  minLength?: number;
  allowNSFW?: boolean;
  strictMode?: boolean;
}

// ─── Style & Data Types ──────────────────────────────────────────────────────

export interface ArtStyle {
  id: string;
  name: string;
  category: string;
  description?: string;
  keywords: string[];
  modifiers?: string[];
  qualitySuffix?: string;
  examplePrompts?: string[];
  tags?: string[];
}

export interface Artist {
  id: string;
  name: string;
  period: string;
  years: string;
  nationality: string;
  keywords: string[];
  styles: string[];
}

export interface LoRA {
  id: string;
  name: string;
  trigger: string;
  strength: number;
  description: string;
  category: string;
  tags: string[];
  compatibleModels: string[];
}

export interface Enhancer {
  id: string;
  name: string;
  terms: string[];
  category: string;
  description?: string;
}

// ─── CLI Types ───────────────────────────────────────────────────────────────

export interface CLIOptions {
  count?: number;
  quality?: number;
  mood?: MoodType;
  verbose?: boolean;
  save?: boolean;
  negative?: boolean;
  parallel?: number;
  export?: ExportFormat;
  progress?: boolean;
}

export interface HistoryEntry {
  id: string;
  command: string;
  args: string[];
  options: CLIOptions;
  result?: string[];
  timestamp: Date;
  duration?: number;
}
