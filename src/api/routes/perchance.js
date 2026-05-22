'use strict';
const { Router } = require('express');

const router = Router();

// Lazy-load Groq so the server starts even without GROQ_API_KEY
let groqClient = null;
function getGroq() {
  if (groqClient) return groqClient;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  try {
    const Groq = require('groq-sdk');
    groqClient = new Groq({ apiKey });
    return groqClient;
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `You are an expert in Perchance.org generator syntax. Generate valid, working Perchance generators.

PERCHANCE SYNTAX RULES:
1. A generator is made of named lists. Each list name is on its own line, entries are indented 2 spaces.
2. The first list is always "output" — shown when generating.
3. Reference other lists with [listName].
4. Inline choices: {a|b|c}. Random numbers: {1-10}.
5. Import another generator: [^gen-name.listName].
6. Weights: add number after entry space ("rare item  1", "common item  5").
7. Newlines in output: \\n. HTML formatting allowed.
8. Comments start with //

OUTPUT ONLY raw Perchance code. No markdown fences, no explanations. Always start with the output list.`;

const REVERSE_PROMPT = `You are an expert in Perchance.org generator syntax. Your task is to REVERSE-ENGINEER a Perchance generator by analyzing sample outputs provided by the user.

STEPS:
1. Study the sample outputs carefully — identify patterns, recurring structures, vocabulary, and style.
2. Decompose each output into its constituent parts (adjectives, nouns, verbs, qualifiers, formats, etc.).
3. Build named lists that capture the vocabulary and patterns you found.
4. Wire them together with an output list that reproduces the format of the examples.
5. Add MORE items to each list beyond what the examples show — extrapolate creatively in the same style.
6. Ensure every list has at least 10-15 items.

PERCHANCE SYNTAX RULES:
- List name on its own line (no indent), entries indented 2 spaces.
- First list must be "output".
- Reference lists with [listName].
- Inline choices: {a|b|c}. Numbers: {1-10}.
- Comments start with //

OUTPUT ONLY raw Perchance code. No markdown fences, no explanations.`;

// Load static template library
let _templates = null;
function getTemplates() {
  if (_templates) return _templates;
  try {
    _templates = require('../../data/perchance-templates/index.js').templateLibrary;
  } catch {
    _templates = [];
  }
  return _templates;
}

function validateCode(code) {
  const errors = [];
  const warnings = [];
  const lines = code.split('\n');
  const lists = [];
  let hasOutput = false;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('//')) continue;
    if (!line.startsWith(' ') && !line.startsWith('\t')) {
      const name = line.trim();
      lists.push(name);
      if (name === 'output') hasOutput = true;
    }
  }

  if (!hasOutput) errors.push('Missing required "output" list');
  if (lists.length < 2) warnings.push('Generator has very few lists — add more for variety');

  const refs = code.match(/\[([a-zA-Z][a-zA-Z0-9_-]*)\]/g) || [];
  for (const ref of refs) {
    const name = ref.slice(1, -1);
    if (!name.startsWith('^') && !lists.includes(name)) {
      warnings.push(`Reference [${name}] not found locally (may be an import)`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

async function callGroq(messages, maxTokens = 2048, model = 'llama-3.3-70b-versatile') {
  const groq = getGroq();
  if (!groq) throw new Error('GROQ_API_KEY not configured');
  const completion = await groq.chat.completions.create({
    model,
    messages,
    temperature: 0.8,
    max_tokens: maxTokens,
    top_p: 0.9
  });
  return completion.choices[0]?.message?.content?.trim() || '';
}

function cleanCode(raw) {
  return raw.replace(/^```[a-z]*\n?/gm, '').replace(/^```$/gm, '').trim();
}

// GET /api/perchance/templates
router.get('/templates', (_req, res) => {
  const tpl = getTemplates();
  res.json({ success: true, data: tpl, total: tpl.length });
});

// GET /api/perchance/templates/:id
router.get('/templates/:id', (req, res) => {
  const tpl = getTemplates().find(t => t.id === req.params.id);
  if (!tpl) return res.status(404).json({ success: false, error: 'Template not found' });
  res.json({ success: true, data: tpl });
});

// GET /api/perchance/categories
router.get('/categories', (_req, res) => {
  const tpl = getTemplates();
  const cats = [...new Set(tpl.map(t => t.category))];
  res.json({
    success: true,
    data: cats.map(cat => ({
      name: cat,
      count: tpl.filter(t => t.category === cat).length,
      templates: tpl.filter(t => t.category === cat).map(t => ({ id: t.id, name: t.name, complexity: t.complexity }))
    }))
  });
});

// POST /api/perchance/generate
router.post('/generate', async (req, res) => {
  const { category, description, complexity = 'medium', theme } = req.body;
  if (!category || !description) {
    return res.status(400).json({ success: false, error: 'category and description are required' });
  }

  const complexityMap = {
    simple: 'Create a simple generator with 3-5 lists, 8-12 items each.',
    medium: 'Create a medium generator with 5-8 lists, 10-15 items each. Use nested references.',
    master: 'Create a MASTER generator combining multiple sub-generators via [^import]. 8-12 lists, 15-20 items each. Production-ready.'
  };

  const userMsg = `Category: ${category}\nDescription: ${description}${theme ? `\nTheme: ${theme}` : ''}\nComplexity: ${complexity}\n\n${complexityMap[complexity] || complexityMap.medium}\n\nGenerate the Perchance code:`;

  const t0 = Date.now();
  try {
    const raw = await callGroq(
      [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userMsg }],
      complexity === 'master' ? 4096 : 2048
    );
    const code = cleanCode(raw);
    res.json({ success: true, data: { code, model: 'llama-3.3-70b-versatile', generationTime: Date.now() - t0, validation: validateCode(code) } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/perchance/from-examples  ← NEW
router.post('/from-examples', async (req, res) => {
  const { examples, hints } = req.body;

  if (!examples || !Array.isArray(examples) || examples.length < 2) {
    return res.status(400).json({ success: false, error: 'Provide at least 2 example outputs as an array' });
  }
  if (examples.length > 30) {
    return res.status(400).json({ success: false, error: 'Maximum 30 examples allowed' });
  }

  const examplesBlock = examples
    .map((ex, i) => `${i + 1}. ${String(ex).trim()}`)
    .join('\n');

  const hintsLine = hints && hints.trim()
    ? `\n\nAdditional hints from the user: ${hints.trim()}`
    : '';

  const userMsg = `Here are ${examples.length} example outputs I want to generate randomly:\n\n${examplesBlock}${hintsLine}\n\nAnalyze the patterns and reverse-engineer a complete Perchance generator that can reproduce outputs in this style. Expand the lists with many more items in the same style. Output only the Perchance code:`;

  const t0 = Date.now();
  try {
    const raw = await callGroq(
      [{ role: 'system', content: REVERSE_PROMPT }, { role: 'user', content: userMsg }],
      3000
    );
    const code = cleanCode(raw);
    const validation = validateCode(code);

    // Count how many lists were generated
    const listCount = (code.match(/^[a-zA-Z][a-zA-Z0-9_-]*\s*$/gm) || []).length;

    res.json({
      success: true,
      data: {
        code,
        model: 'llama-3.3-70b-versatile',
        generationTime: Date.now() - t0,
        validation,
        meta: {
          examplesAnalyzed: examples.length,
          listsGenerated: listCount
        }
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/perchance/refine
router.post('/refine', async (req, res) => {
  const { code, request } = req.body;
  if (!code || !request) return res.status(400).json({ success: false, error: 'code and request are required' });

  const t0 = Date.now();
  try {
    const raw = await callGroq([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Existing generator:\n\n${code}\n\nModify it: ${request}\n\nOutput only the updated Perchance code:` }
    ]);
    const refined = cleanCode(raw);
    res.json({ success: true, data: { code: refined, model: 'llama-3.3-70b-versatile', generationTime: Date.now() - t0, validation: validateCode(refined) } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/perchance/ideas
router.post('/ideas', async (req, res) => {
  const { category, count = 5 } = req.body;
  if (!category) return res.status(400).json({ success: false, error: 'category is required' });

  try {
    const raw = await callGroq([
      { role: 'system', content: 'You generate creative ideas for Perchance.org generators. Output ONLY a JSON array of strings, no explanation.' },
      { role: 'user', content: `Generate ${count} creative Perchance generator ideas for category: "${category}". JSON array of short titles.` }
    ], 500, 'llama-3.1-8b-instant');
    const match = raw.match(/\[.*\]/s);
    const ideas = match ? JSON.parse(match[0]) : [];
    res.json({ success: true, data: ideas });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/perchance/validate
router.post('/validate', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, error: 'code is required' });
  res.json({ success: true, data: validateCode(code) });
});

module.exports = router;
