'use strict';
const { Router } = require('express');
const router = Router();

// ─── Groq helper ──────────────────────────────────────────────────────────────
function getGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  try {
    const Groq = require('groq-sdk');
    return new Groq({ apiKey });
  } catch { return null; }
}

async function callGroq(messages, maxTokens = 2048, model = 'llama-3.3-70b-versatile') {
  const groq = getGroq();
  if (!groq) throw new Error('GROQ_API_KEY not configured');
  const res = await groq.chat.completions.create({
    model, messages, temperature: 0.75, max_tokens: maxTokens, top_p: 0.9
  });
  return res.choices[0]?.message?.content?.trim() || '';
}

function handleGroqError(e, res) {
  const status = e?.status || e?.error?.status || 500;
  if (status === 429) return res.status(429).json({ success: false, error: 'Rate limit — please wait a moment.' });
  return res.status(500).json({ success: false, error: e.message || 'Unexpected error' });
}

function cleanCode(raw) {
  return raw.replace(/^```[a-z]*\n?/gm, '').replace(/^```$/gm, '').trim();
}

// ─── In-memory pack store (process lifetime) ──────────────────────────────────
const packStore = new Map();
function genId() { return Math.random().toString(36).slice(2, 10); }

// ─── PLAN PROMPT ──────────────────────────────────────────────────────────────
const PLAN_SYSTEM = `You are an expert designer of Perchance.org generator packs.
Your job is to PLAN a coherent set of interlinked generators for a given theme.

Rules:
- Produce 4 to 8 generators. Each one has a PURPOSE and a SLUG (lowercase-hyphen, no spaces).
- Generators reference each other via Perchance import syntax: [^slug.listName]
- Design the dependency graph: which generator imports from which.
- Be specific — each generator should fill a clear narrative niche.
- Output ONLY a valid JSON object, no markdown fences, no prose.

Output schema:
{
  "theme": "string",
  "packName": "string (short, evocative)",
  "packSlug": "string (lowercase-hyphen)",
  "description": "string (1 sentence)",
  "generators": [
    {
      "slug": "string",
      "name": "string",
      "purpose": "string (1 sentence)",
      "category": "string",
      "importsFrom": ["slug", ...],
      "exportsLists": ["listName", ...]
    }
  ]
}`;

// ─── BUILD PROMPT ─────────────────────────────────────────────────────────────
function buildGenPrompt(gen, allGenerators) {
  const importDocs = gen.importsFrom
    .map(slug => {
      const dep = allGenerators.find(g => g.slug === slug);
      if (!dep) return '';
      return `  - [^${slug}.${dep.exportsLists[0]}] → imports ${dep.exportsLists[0]} list from "${dep.name}" generator`;
    })
    .filter(Boolean)
    .join('\n');

  return `Generate a complete Perchance.org generator.

Generator name: ${gen.name}
Slug: ${gen.slug}
Purpose: ${gen.purpose}
Category: ${gen.category}

${gen.importsFrom.length > 0 ? `This generator MUST import from these other generators in the pack:\n${importDocs}\nUse [^slug.listName] syntax in entries where it makes sense.` : 'This generator is standalone — no imports needed.'}

Perchance syntax rules:
- List name on its own line (no indent). Entries indented 2 spaces.
- First list must always be "output".
- [listName] references a local list. [^gen-slug.listName] imports from another generator.
- {a|b|c} inline choice. {1-10} random number.
- Weights: "entry  5" (double space then number).
- Comments: // text
- Use \\s for leading/trailing space in generated text.
- Every list: minimum 12 items.
- Total lists: minimum 5.

Output ONLY raw Perchance code. No markdown, no explanation.`;
}

// ─── POST /api/pack/plan ──────────────────────────────────────────────────────
router.post('/plan', async (req, res) => {
  const { theme } = req.body;
  if (!theme || !theme.trim()) {
    return res.status(400).json({ success: false, error: '"theme" is required' });
  }

  const t0 = Date.now();
  try {
    const raw = await callGroq(
      [
        { role: 'system', content: PLAN_SYSTEM },
        { role: 'user', content: `Design a generator pack for this theme: "${theme.trim()}". Think carefully about which generators are most useful and how they interconnect.` }
      ],
      1200
    );

    let plan;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      plan = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      return res.status(500).json({ success: false, error: 'AI returned invalid plan JSON. Try again.' });
    }

    // Validate minimal shape
    if (!plan.generators || !Array.isArray(plan.generators) || plan.generators.length < 2) {
      return res.status(500).json({ success: false, error: 'Plan has too few generators. Try again.' });
    }

    res.json({
      success: true,
      data: { ...plan, planTime: Date.now() - t0 }
    });
  } catch (e) {
    return handleGroqError(e, res);
  }
});

// ─── POST /api/pack/build ─────────────────────────────────────────────────────
// Accepts the plan from /plan and generates ALL generators in parallel
router.post('/build', async (req, res) => {
  const { plan } = req.body;

  if (!plan || !plan.generators || !Array.isArray(plan.generators)) {
    return res.status(400).json({ success: false, error: '"plan" object with generators array is required' });
  }

  const t0 = Date.now();

  // Sort by dependency order: standalone generators first
  const sorted = [...plan.generators].sort((a, b) => {
    const aImports = (a.importsFrom || []).length;
    const bImports = (b.importsFrom || []).length;
    return aImports - bImports;
  });

  try {
    // Build all generators in parallel
    const results = await Promise.allSettled(
      sorted.map(gen =>
        callGroq(
          [
            { role: 'system', content: `You are an expert Perchance.org generator author. Output ONLY raw Perchance code. No markdown fences, no explanation. Always start with the output list.` },
            { role: 'user', content: buildGenPrompt(gen, plan.generators) }
          ],
          2000
        ).then(raw => ({ slug: gen.slug, name: gen.name, code: cleanCode(raw), status: 'ok' }))
        .catch(err => ({ slug: gen.slug, name: gen.name, code: null, status: 'error', error: err.message }))
      )
    );

    const generators = results.map(r => r.status === 'fulfilled' ? r.value : r.reason);
    const successful = generators.filter(g => g.status === 'ok').length;

    // Store pack
    const packId = genId();
    const pack = {
      id: packId,
      theme: plan.theme,
      packName: plan.packName,
      packSlug: plan.packSlug,
      description: plan.description,
      generators,
      createdAt: Date.now(),
      buildTime: Date.now() - t0
    };
    packStore.set(packId, pack);

    res.json({
      success: true,
      data: {
        packId,
        packName: plan.packName,
        packSlug: plan.packSlug,
        description: plan.description,
        generators,
        stats: {
          total: generators.length,
          successful,
          failed: generators.length - successful,
          buildTime: pack.buildTime
        }
      }
    });
  } catch (e) {
    return handleGroqError(e, res);
  }
});

// ─── GET /api/pack/:id ────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const pack = packStore.get(req.params.id);
  if (!pack) return res.status(404).json({ success: false, error: 'Pack not found (may have expired — packs live in memory only)' });
  res.json({ success: true, data: pack });
});

module.exports = router;
