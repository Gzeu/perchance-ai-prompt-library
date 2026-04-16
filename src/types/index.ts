// ============================================================
// PERCHANCE AI PROMPT LIBRARY — Core Type Definitions
// v4.0.0 — TypeScript strict mode
// ============================================================

/** Un stil artistic din styles.json */
export interface ArtStyle {
  name: string;
  description: string;
  category: string;
  variables: string[];
  variableCount?: number;
  popularity: number;
  examples?: string[];
  tags?: string[];
  year?: number;
}

/** Un artist din artists.json */
export interface Artist {
  name: string;
  period: string;
  country: string;
  style: string;
  keywords: string[];
  popularity: number;
  born?: number;
  died?: number | null;
  movement?: string;
}

/** O categorie de subiecte din subjects.json */
export interface SubjectCategory {
  category: string;
  subjects: SubjectItem[];
}

export interface SubjectItem {
  name: string;
  description?: string;
  tags?: string[];
}

/** O temă din themes.json */
export interface Theme {
  name: string;
  description: string;
  category: string;
  ageGroup: string;
  keywords?: string[];
  mood?: string;
}

/** Negative prompts din negatives.json */
export interface NegativePrompts {
  universal: string[];
  photography?: string[];
  digital_art?: string[];
  anime?: string[];
  painting?: string[];
  [key: string]: string[] | undefined;
}

/** Recipe din recipes.json */
export interface Recipe {
  id: string;
  name: string;
  description: string;
  style: string;
  subject: string;
  quality: number;
  mood?: string;
  tags: string[];
  prompt?: string;
}

// ============================================================
// PROMPT GENERATION TYPES
// ============================================================

export type MoodType =
  | 'dramatic'
  | 'epic'
  | 'peaceful'
  | 'vibrant'
  | 'mysterious'
  | 'romantic'
  | 'dark'
  | 'whimsical';

export type QualityLevel = 5 | 6 | 7 | 8 | 9 | 10;

export type OutputFormat = 'standard' | 'compact' | 'detailed' | 'json';

export interface PromptConfig {
  style: string;
  subject: string;
  quality: QualityLevel;
  mood?: MoodType;
  enhancer?: boolean;
  variation?: number;
  artist?: string;
  theme?: string;
  negatives?: boolean;
  seed?: number;
}

export interface PromptMetadata {
  wordCount: number;
  characterCount: number;
  style: string;
  subject: string;
  quality: QualityLevel;
  mood?: MoodType;
  artist?: string;
  options: Partial<PromptConfig>;
  timestamp: string;
  enhancementLevel: 'basic' | 'advanced' | 'premium';
  seed?: number;
}

export interface GenerationResult {
  text: string;
  negative?: string;
  metadata: PromptMetadata;
}

// ============================================================
// BATCH PROCESSING
// ============================================================

export interface BatchOptions {
  count: number;
  parallel: number;
  quality: QualityLevel;
  mood?: MoodType;
  export?: 'json' | 'txt' | 'csv';
  outputFile?: string;
}

export interface BatchResult {
  results: GenerationResult[];
  stats: {
    total: number;
    duration: number;
    avgQuality: number;
    avgWordCount: number;
  };
}

// ============================================================
// NEW v4.0.0 TYPES
// ============================================================

/** LoRA preset pentru Stable Diffusion */
export interface LoraPreset {
  id: string;
  name: string;
  description: string;
  trigger_words: string[];
  weight_range: [number, number];
  compatible_models: string[];
  category: string;
  source?: string;
  tags: string[];
}

/** ComfyUI Workflow Template */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  category: string;
  required_models: string[];
  tags: string[];
}

export interface WorkflowNode {
  id: string;
  type: string;
  params: Record<string, unknown>;
  connections: { from: string; to: string }[];
}

/** Enhancer term pentru calitate */
export interface EnhancerTerm {
  term: string;
  category: EnhancerCategory;
  weight?: number;
  compatible_styles?: string[];
}

export type EnhancerCategory =
  | 'quality'
  | 'lighting'
  | 'composition'
  | 'texture'
  | 'color'
  | 'mood'
  | 'technical';

/** Config persistată local */
export interface CLIConfig {
  defaultStyle: string;
  qualityLevel: QualityLevel;
  outputFormat: OutputFormat;
  theme: string;
  autoSave: boolean;
  apiKeys?: {
    openai?: string;
    pollinationsApiKey?: string;
  };
  comfyuiUrl?: string;
  automatic1111Url?: string;
}

/** Entry în history */
export interface HistoryEntry {
  command: string;
  result: string;
  timestamp: number;
  style?: string;
  subject?: string;
}

/** Cache entry */
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl?: number;
}

/** Trending style entry */
export interface TrendingStyle {
  name: string;
  rank: number;
  delta: number;
  source: string;
  fetchedAt: string;
}

/** Rezultat remix */
export interface RemixResult {
  original: string;
  variations: GenerationResult[];
  strategy: string;
}

/** Rezultat compare */
export interface CompareResult {
  style1: ArtStyle;
  style2: ArtStyle;
  similarities: string[];
  differences: Record<string, { style1: unknown; style2: unknown }>;
  recommendation: string;
}
