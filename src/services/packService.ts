/**
 * packService.ts — Pack Builder & Remix Engine
 *
 * A "pack" is a collection of interconnected Perchance generators
 * that share a common theme and reference each other via [^gen-slug.list] imports.
 *
 * Flow:
 *   planPack(theme)         → AI returns topology (list of generators + cross-import map)
 *   buildPack(plan)         → generates all generators in parallel via Groq
 *   remixPack(pack, instr)  → rewrites content, preserves topology & cross-imports
 *   diffPacks(a, b)         → per-generator diff with change classification
 */

import Groq from 'groq-sdk';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeneratorNode {
  /** Unique slug used in [^slug.list] imports, e.g. "rpg-characters" */
  slug: string;
  /** Human-readable title */
  title: string;
  /** What this generator produces */
  role: string;
  /** List names in other generators this one imports via [^slug.list] */
  imports: Array<{ fromSlug: string; listName: string }>;
  /** The generated Perchance code (populated after buildPack) */
  code?: string;
  /** Groq generation metadata */
  meta?: { model: string; tokens: number; ms: number };
}

export interface PackPlan {
  theme: string;
  description: string;
  generators: GeneratorNode[];
  /** Slug of the "master" generator that ties everything together */
  masterSlug: string;
}

export interface BuiltPack extends PackPlan {
  id: string;
  builtAt: string;
  generators: Required<GeneratorNode>[];
  totalTokens: number;
  totalMs: number;
}

export interface RemixResult {
  id: string;
  sourcePackId: string;
  instruction: string;
  pack: BuiltPack;
  diffSummary: string;
}

export interface GeneratorDiff {
  slug: string;
  title: string;
  status: 'unchanged' | 'modified' | 'added' | 'removed';
  /** Line-level diff entries */
  lines: Array<{ type: 'same' | 'added' | 'removed'; text: string }>;
}

export interface PackDiff {
  packAId: string;
  packBId: string;
  instruction: string;
  generators: GeneratorDiff[];
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  unchangedCount: number;
}

// ─── In-memory store (replace with DB/Redis in production) ───────────────────

const packStore = new Map<string, BuiltPack>();

export function getPackById(id: string): BuiltPack | undefined {
  return packStore.get(id);
}

function storePack(pack: BuiltPack): void {
  packStore.set(pack.id, pack);
  // Auto-evict after 2 hours to keep memory bounded
  setTimeout(() => packStore.delete(pack.id), 2 * 60 * 60 * 1000);
}

function generateId(): string {
  return `pack-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Groq client (lazy singleton) ────────────────────────────────────────────

let _groq: Groq | null = null;

function getGroq(): Groq {
  if (!_groq) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('GROQ_API_KEY not set');
    _groq = new Groq({ apiKey: key });
  }
  return _groq;
}

const FAST_MODEL = 'llama-3.1-8b-instant';
const MAIN_MODEL = 'llama-3.3-70b-versatile';

// ─── Perchance syntax rules (shared across prompts) ──────────────────────────

const SYNTAX_RULES = `
PERCHANCE SYNTAX RULES (strict):
- Lists: name on its own line, entries indented with exactly 2 spaces
- First list must always be named "output"
- Reference local lists: [listName]
- Reference another generator: [^other-slug.listName]
- Inline choices: {a|b|c}
- Random number: {1-10}
- Weights: "entry  5" (double-space then weight)
- Newlines in output: \\n
- Comments: // text
- No markdown, no code fences — raw Perchance syntax only
`.trim();

// ─── planPack ─────────────────────────────────────────────────────────────────

/**
 * Ask the AI to design the topology of a generator pack:
 * which generators are needed, what each produces, and how they import each other.
 */
export async function planPack(theme: string): Promise<PackPlan> {
  const groq = getGroq();

  const systemPrompt = `You are an expert designer of Perchance.org generator ecosystems.
Your job is to plan a cohesive pack of 5–9 interconnected generators for a given theme.

Rules for a good plan:
1. Each generator has a clear, focused role (characters, locations, quests, items…)
2. Generators reference each other via [^slug.listName] to create emergent variety
3. One generator is the "master" — its output list imports from all others
4. Slugs are lowercase-hyphenated, globally unique, e.g. "rpg-characters"
5. Keep imports realistic: only import list names that the target generator would actually have

Output ONLY valid JSON matching this TypeScript interface (no explanation):
{
  theme: string,
  description: string,
  masterSlug: string,
  generators: Array<{
    slug: string,
    title: string,
    role: string,
    imports: Array<{ fromSlug: string, listName: string }>
  }>
}`;

  const completion = await groq.chat.completions.create({
    model: FAST_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Design a generator pack for the theme: "${theme}"` }
    ],
    temperature: 0.9,
    max_tokens: 1500
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Planner returned invalid JSON');

  const plan: PackPlan = JSON.parse(jsonMatch[0]);

  // Validate minimal shape
  if (!plan.generators?.length) throw new Error('Plan has no generators');
  if (!plan.masterSlug) plan.masterSlug = plan.generators[0].slug;

  return plan;
}

// ─── buildPack ────────────────────────────────────────────────────────────────

/**
 * Generate all generators in the plan in parallel.
 * Each generator receives its own role description + import context.
 */
export async function buildPack(plan: PackPlan): Promise<BuiltPack> {
  const groq = getGroq();
  const startAll = Date.now();

  const built = await Promise.all(
    plan.generators.map(async (gen) => buildSingleGenerator(groq, gen, plan, plan.theme))
  );

  const totalTokens = built.reduce((s, g) => s + (g.meta?.tokens ?? 0), 0);
  const totalMs = Date.now() - startAll;

  const pack: BuiltPack = {
    id: generateId(),
    builtAt: new Date().toISOString(),
    theme: plan.theme,
    description: plan.description,
    masterSlug: plan.masterSlug,
    generators: built as Required<GeneratorNode>[],
    totalTokens,
    totalMs
  };

  storePack(pack);
  return pack;
}

async function buildSingleGenerator(
  groq: Groq,
  gen: GeneratorNode,
  plan: PackPlan,
  theme: string,
  remixInstruction?: string
): Promise<Required<GeneratorNode>> {
  const startMs = Date.now();

  // Build import context so the AI knows what slugs + lists exist
  const importContext = gen.imports.length > 0
    ? `\nThis generator must import the following from other generators in the pack:\n` +
      gen.imports.map(i => `  [^${i.fromSlug}.${i.listName}]`).join('\n')
    : '';

  const remixCtx = remixInstruction
    ? `\n\nREMIX INSTRUCTION: ${remixInstruction}\nApply this instruction while keeping the same list structure and import references.`
    : '';

  const userPrompt = `Create a Perchance.org generator for the following role within a "${theme}" pack:

Generator slug: ${gen.slug}
Title: ${gen.title}
Role: ${gen.role}${importContext}${remixCtx}

Requirements:
- Always start with the "output" list
- 8–15 items per list for variety
- Include all import references exactly as specified (do not invent new slugs)
- The generator should feel cohesive with the "${theme}" theme
- Output ONLY raw Perchance code, no markdown or explanation

${SYNTAX_RULES}`;

  const completion = await groq.chat.completions.create({
    model: MAIN_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an expert Perchance.org generator author. Output ONLY raw Perchance syntax, no markdown, no explanations.'
      },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.85,
    max_tokens: 2048
  });

  const rawCode = completion.choices[0]?.message?.content?.trim() || '';
  const code = rawCode.replace(/^```[a-z]*\n?/gm, '').replace(/^```$/gm, '').trim();

  return {
    ...gen,
    code,
    meta: {
      model: MAIN_MODEL,
      tokens: completion.usage?.total_tokens ?? 0,
      ms: Date.now() - startMs
    }
  };
}

// ─── remixPack ────────────────────────────────────────────────────────────────

/**
 * Remix an existing pack:
 * - Topology (slugs, titles, import graph) is preserved exactly
 * - Content of every generator is rewritten to match the instruction
 * - Returns a new BuiltPack with a new ID, linked to the source
 */
export async function remixPack(
  sourcePack: BuiltPack,
  instruction: string
): Promise<RemixResult> {
  const groq = getGroq();
  const startAll = Date.now();

  // Preserve topology, rewrite content in parallel
  const remixed = await Promise.all(
    sourcePack.generators.map(async (gen) =>
      buildSingleGenerator(groq, gen, sourcePack, sourcePack.theme, instruction)
    )
  );

  const totalTokens = remixed.reduce((s, g) => s + (g.meta?.tokens ?? 0), 0);

  const newPack: BuiltPack = {
    id: generateId(),
    builtAt: new Date().toISOString(),
    theme: sourcePack.theme,
    description: `${sourcePack.description} [Remixed: ${instruction}]`,
    masterSlug: sourcePack.masterSlug,
    generators: remixed as Required<GeneratorNode>[],
    totalTokens,
    totalMs: Date.now() - startAll
  };

  storePack(newPack);

  const diff = diffPacks(sourcePack, newPack, instruction);
  const modCount = diff.generators.filter(g => g.status === 'modified').length;
  const diffSummary = `${modCount}/${newPack.generators.length} generators modified by "${instruction}"`;

  return {
    id: newPack.id,
    sourcePackId: sourcePack.id,
    instruction,
    pack: newPack,
    diffSummary
  };
}

// ─── diffPacks ────────────────────────────────────────────────────────────────

/**
 * Compare two packs line by line per generator.
 * Works on code content only — topology changes are reflected as added/removed generators.
 */
export function diffPacks(
  packA: BuiltPack,
  packB: BuiltPack,
  instruction = ''
): PackDiff {
  const slugsA = new Set(packA.generators.map(g => g.slug));
  const slugsB = new Set(packB.generators.map(g => g.slug));
  const allSlugs = new Set([...slugsA, ...slugsB]);

  const generators: GeneratorDiff[] = [];
  let addedCount = 0, removedCount = 0, modifiedCount = 0, unchangedCount = 0;

  for (const slug of allSlugs) {
    const genA = packA.generators.find(g => g.slug === slug);
    const genB = packB.generators.find(g => g.slug === slug);

    if (!genA) {
      addedCount++;
      generators.push({
        slug,
        title: genB!.title,
        status: 'added',
        lines: (genB!.code.split('\n')).map(t => ({ type: 'added', text: t }))
      });
      continue;
    }
    if (!genB) {
      removedCount++;
      generators.push({
        slug,
        title: genA.title,
        status: 'removed',
        lines: (genA.code.split('\n')).map(t => ({ type: 'removed', text: t }))
      });
      continue;
    }

    const linesA = genA.code.split('\n');
    const linesB = genB.code.split('\n');

    if (genA.code === genB.code) {
      unchangedCount++;
      generators.push({
        slug,
        title: genB.title,
        status: 'unchanged',
        lines: linesB.map(t => ({ type: 'same', text: t }))
      });
    } else {
      modifiedCount++;
      // Simple line diff: additions/removals (not a true LCS diff — good enough for display)
      const setA = new Set(linesA);
      const setB = new Set(linesB);
      const lines = [
        ...linesA.filter(l => !setB.has(l)).map(t => ({ type: 'removed' as const, text: t })),
        ...linesB.filter(l => !setA.has(l)).map(t => ({ type: 'added' as const, text: t })),
        ...linesB.filter(l => setA.has(l)).map(t => ({ type: 'same' as const, text: t }))
      ];
      generators.push({ slug, title: genB.title, status: 'modified', lines });
    }
  }

  return {
    packAId: packA.id,
    packBId: packB.id,
    instruction,
    generators,
    addedCount,
    removedCount,
    modifiedCount,
    unchangedCount
  };
}
