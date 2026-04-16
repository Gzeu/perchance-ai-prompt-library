/**
 * Perchance AI Prompt Library — Strict TypeScript Interfaces
 * v4.0.0
 */

// ─── Core Data Entities ───────────────────────────────────────────────────────

export interface ArtStyle {
  key: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  variables: string[];
  artists: string[];
  examples: string[];
  popularity: number;
  recommended: boolean;
  negativePrompts: string[];
  variableCount: number;
  formula: string;
  quality_modifiers: string[];
}

export interface Artist {
  name: string;
  period: string;
  years: string;
  country: string;
  keywords: string[];
  styles: string[];
  famousWorks: string[];
  techniques: string[];
  popularity: number;
}

export interface SubjectItem {
  name: string;
  description?: string;
  keywords?: string[];
}

export interface SubjectCategory {
  category: string;
  subjects: SubjectItem[];
}

export interface Theme {
  name: string;
  description: string;
  category: string;
  ageGroup: string;
  keywords?: string[];
  examples?: string[];
}

export interface NegativePrompts {
  [key: string]: string[];
}

export interface Recipe {
  name: string;
  description: string;
  components: RecipeComponent[];
  tags?: string[];
}

export interface RecipeComponent {
  type: string;
  value: string;
  weight?: number;
}

// ─── LoRA & Workflow ──────────────────────────────────────────────────────────

export interface LoraPreset {
  key: string;
  name: string;
  description: string;
  model: 'SDXL' | 'FLUX' | 'SD1.5' | 'SDXL+FLUX';
  triggerWords: string[];
  strength: number;
  category: string;
  tags: string[];
  compatibility: string[];
  notes?: string;
}

export interface WorkflowNode {
  class_type: string;
  inputs: Record<string, unknown>;
}

export interface WorkflowTemplate {
  key: string;
  name: string;
  description: string;
  model: string;
  nodes: Record<string, WorkflowNode>;
  positivePromptNodeId: string;
  negativePromptNodeId: string;
  seedNodeId: string;
  outputNodeId: string;
}

// ─── Enhancers ────────────────────────────────────────────────────────────────

export interface EnhancerCategory {
  category: 'quality' | 'lighting' | 'composition' | 'texture' | 'color' | 'mood';
  keywords: string[];
}

// ─── Prompt Generation ───────────────────────────────────────────────────────

export type MoodType = 'dramatic' | 'epic' | 'peaceful' | 'vibrant' | 'mysterious';
export type OutputFormat = 'standard' | 'compact' | 'detailed';
export type ExportFormat = 'json' | 'csv' | 'txt';
export type SupportedLanguage = 'en' | 'ro' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

export interface PromptConfig {
  style: string;
  subject: string;
  quality?: number;           // 1–10
  mood?: MoodType;
  enhancer?: boolean;
  variation?: number;
  seed?: number;
  negative?: boolean;
  verbose?: boolean;
  format?: OutputFormat;
  save?: boolean;
  comfyui?: boolean;
}

export interface PromptMetadata {
  wordCount: number;
  characterCount: number;
  style: string;
  subject: string;
  quality: number;
  options: Partial<PromptConfig>;
  timestamp: string;
  enhancementLevel: string;
  seed?: number;
}

export interface GenerationResult {
  text: string;
  metadata: PromptMetadata;
}

export interface BatchOptions {
  count: number;
  parallel: number;
  quality?: number;
  export?: ExportFormat;
  progress?: boolean;
}

export interface RemixVariation {
  strategy: string;
  prompt: string;
  description: string;
}

export interface CompareResult {
  style1: ArtStyle;
  style2: ArtStyle;
  differences: Record<string, [unknown, unknown]>;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  namespace: string;
}

export interface CacheOptions {
  ttl?: number;         // milliseconds
  namespace?: string;
}

// ─── ComfyUI ─────────────────────────────────────────────────────────────────

export interface ComfyUIQueueResponse {
  prompt_id: string;
  number: number;
  node_errors: Record<string, unknown>;
}

export interface ComfyUIPromptData {
  positive: string;
  negative: string;
  seed?: number;
  steps?: number;
  cfg?: number;
  width?: number;
  height?: number;
}

// ─── CLI Config ───────────────────────────────────────────────────────────────

export interface CLIConfig {
  defaultStyle: string;
  qualityLevel: number;
  outputFormat: OutputFormat;
  theme: string;
  autoSave: boolean;
}

export interface MetricEntry {
  timestamp: string;
  action: string;
  style?: string;
  subject?: string;
  count?: number;
  quality?: number;
  mood?: string;
  [key: string]: unknown;
}

export interface HistoryEntry {
  command: string;
  result: string;
  timestamp: number;
}

export interface UsageStats {
  totalGenerations: number;
  totalCommands: number;
  popularStyles: Array<{ item: string; count: number }>;
  recentActivity: MetricEntry[];
  dailyUsage: Record<string, number>;
}
