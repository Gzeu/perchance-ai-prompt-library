'use strict';
const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const {
  SYSTEM_PROMPT,
  REVERSE_PROMPT,
  callGroq,
  cleanCode,
  mapGroqError,
  isGroqConfigured
} = require('../../services/groqService');
const { validateCode } = require('../../utils/perchanceValidate');
const {
  runAgenticBrainstorm,
  getAgenticStatus,
  previewAgenticSelection
} = require('../../agents/agenticRunner');

const router = Router();

const groqLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many AI requests. Please wait a moment.' }
});

function handleGroqError(e, res) {
  const mapped = mapGroqError(e);
  return res.status(mapped.status).json({ success: false, error: mapped.message });
}

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

// GET /api/perchance/agentic/preview?description=&category=
router.get('/agentic/preview', (req, res) => {
  const description = typeof req.query.description === 'string' ? req.query.description.trim() : '';
  const category = typeof req.query.category === 'string' ? req.query.category : 'writing';

  if (!description) {
    return res.status(400).json({ success: false, error: 'description query param is required' });
  }

  try {
    const agents = previewAgenticSelection(description, category);
    res.json({
      success: true,
      data: {
        agents,
        count: agents.length,
        totalAvailable: getAgenticStatus().totalAgents
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/perchance/agentic/status
router.get('/agentic/status', (_req, res) => {
  try {
    const status = getAgenticStatus();
    res.json({ success: true, data: status });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/perchance/agentic
router.post('/agentic', groqLimiter, async (req, res) => {
  const { description, category = 'writing', iterations = 2, complexity = 'medium', theme } = req.body;

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ success: false, error: 'description is required' });
  }

  if (!isGroqConfigured()) {
    return res.status(503).json({
      success: false,
      error: 'GROQ_API_KEY not configured. Add it to your .env file to use Ultra Agentic mode.'
    });
  }

  const t0 = Date.now();
  try {
    const session = await runAgenticBrainstorm(description, {
      category,
      iterations: Math.min(Math.max(Number(iterations) || 2, 1), 3),
      complexity,
      theme
    });

    res.json({
      success: true,
      data: {
        code: session.code,
        bestVariant: session.bestVariant,
        allVariants: session.allVariants,
        agentsUsed: session.agentsUsed,
        selectedAgents: session.selectedAgents,
        memoryUsed: session.memoryUsed,
        debateRounds: session.debateRounds,
        validation: session.validation,
        finalScore: session.finalScore,
        generationTime: session.generationTime || Date.now() - t0
      }
    });
  } catch (e) {
    return handleGroqError(e, res);
  }
});

// GET /api/perchance/templates
router.get('/templates', (_req, res) => {
  const tpl = getTemplates();
  res.json({ success: true, data: tpl, total: tpl.length });
});

// GET /api/perchance/templates/:id
router.get('/templates/:id', (req, res) => {
  const tpl = getTemplates().find((t) => t.id === req.params.id);
  if (!tpl) return res.status(404).json({ success: false, error: 'Template not found' });
  res.json({ success: true, data: tpl });
});

// GET /api/perchance/categories
router.get('/categories', (_req, res) => {
  const tpl = getTemplates();
  const cats = [...new Set(tpl.map((t) => t.category))];
  res.json({
    success: true,
    data: cats.map((cat) => ({
      name: cat,
      count: tpl.filter((t) => t.category === cat).length,
      templates: tpl
        .filter((t) => t.category === cat)
        .map((t) => ({ id: t.id, name: t.name, complexity: t.complexity }))
    }))
  });
});

// POST /api/perchance/generate
router.post('/generate', groqLimiter, async (req, res) => {
  const { category, description, complexity = 'medium', theme } = req.body;
  if (!category || !description) {
    return res.status(400).json({ success: false, error: 'category and description are required' });
  }

  const complexityMap = {
    simple: 'Create a simple generator with 3-5 lists, 8-12 items each.',
    medium: 'Create a medium generator with 5-8 lists, 10-15 items each. Use nested references.',
    master:
      'Create a MASTER generator combining multiple sub-generators via [^import]. 8-12 lists, 15-20 items each. Production-ready.'
  };

  const userMsg = `Category: ${category}\nDescription: ${description}${theme ? `\nTheme: ${theme}` : ''}\nComplexity: ${complexity}\n\n${complexityMap[complexity] || complexityMap.medium}\n\nGenerate the Perchance code:`;

  const t0 = Date.now();
  try {
    const raw = await callGroq(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMsg }
      ],
      complexity === 'master' ? 4096 : 2048
    );
    const code = cleanCode(raw);
    res.json({
      success: true,
      data: {
        code,
        model: 'llama-3.3-70b-versatile',
        generationTime: Date.now() - t0,
        validation: validateCode(code)
      }
    });
  } catch (e) {
    return handleGroqError(e, res);
  }
});

// POST /api/perchance/from-examples
router.post('/from-examples', groqLimiter, async (req, res) => {
  const { examples, hints } = req.body;

  if (!examples || !Array.isArray(examples) || examples.length < 2) {
    return res.status(400).json({ success: false, error: 'Provide at least 2 example outputs as an array' });
  }
  if (examples.length > 30) {
    return res.status(400).json({ success: false, error: 'Maximum 30 examples allowed' });
  }

  const examplesBlock = examples.map((ex, i) => `${i + 1}. ${String(ex).trim()}`).join('\n');
  const hintsLine = hints && hints.trim() ? `\n\nAdditional hints from the user: ${hints.trim()}` : '';

  const userMsg = `Here are ${examples.length} example outputs I want to generate randomly:\n\n${examplesBlock}${hintsLine}\n\nAnalyze the patterns and reverse-engineer a complete Perchance generator that can reproduce outputs in this style. Expand the lists with many more items in the same style. Output only the Perchance code:`;

  const t0 = Date.now();
  try {
    const raw = await callGroq(
      [
        { role: 'system', content: REVERSE_PROMPT },
        { role: 'user', content: userMsg }
      ],
      3000
    );
    const code = cleanCode(raw);
    const validation = validateCode(code);

    const listCount = code.split('\n').filter((line) => {
      if (!line.trim() || line.trim().startsWith('//')) return false;
      return (
        !line.startsWith(' ') &&
        !line.startsWith('\t') &&
        /^[a-zA-Z][a-zA-Z0-9_-]*\s*$/.test(line.trim())
      );
    }).length;

    res.json({
      success: true,
      data: {
        code,
        model: 'llama-3.3-70b-versatile',
        generationTime: Date.now() - t0,
        validation,
        meta: { examplesAnalyzed: examples.length, listsGenerated: listCount }
      }
    });
  } catch (e) {
    return handleGroqError(e, res);
  }
});

// POST /api/perchance/refine
router.post('/refine', groqLimiter, async (req, res) => {
  const { code, request } = req.body;
  if (!code || !request) return res.status(400).json({ success: false, error: 'code and request are required' });

  const t0 = Date.now();
  try {
    const raw = await callGroq([
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Existing generator:\n\n${code}\n\nModify it: ${request}\n\nOutput only the updated Perchance code:`
      }
    ]);
    const refined = cleanCode(raw);
    res.json({
      success: true,
      data: {
        code: refined,
        model: 'llama-3.3-70b-versatile',
        generationTime: Date.now() - t0,
        validation: validateCode(refined)
      }
    });
  } catch (e) {
    return handleGroqError(e, res);
  }
});

// POST /api/perchance/ideas
router.post('/ideas', groqLimiter, async (req, res) => {
  const { category, count = 5 } = req.body;
  if (!category) return res.status(400).json({ success: false, error: 'category is required' });

  try {
    const raw = await callGroq(
      [
        {
          role: 'system',
          content:
            'You generate creative ideas for Perchance.org generators. Output ONLY a JSON array of strings, no explanation.'
        },
        {
          role: 'user',
          content: `Generate ${count} creative Perchance generator ideas for category: "${category}". JSON array of short titles.`
        }
      ],
      500,
      'llama-3.1-8b-instant'
    );
    const match = raw.match(/\[.*\]/s);
    const ideas = match ? JSON.parse(match[0]) : [];
    res.json({ success: true, data: ideas });
  } catch (e) {
    return handleGroqError(e, res);
  }
});

// POST /api/perchance/validate
router.post('/validate', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, error: 'code is required' });
  res.json({ success: true, data: validateCode(code) });
});

module.exports = router;
