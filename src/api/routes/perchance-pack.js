'use strict';
const { Router } = require('express');
const router = Router();

function getGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  try {
    const Groq = require('groq-sdk');
    return new Groq({ apiKey });
  } catch {
    return null;
  }
}

async function callGroq(messages, maxTokens = 2048, model = 'llama-3.3-70b-versatile') {
  const groq = getGroq();
  if (!groq) throw new Error('GROQ_API_KEY not configured');
  const completion = await groq.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: maxTokens,
    top_p: 0.9
  });
  return completion.choices[0]?.message?.content?.trim() || '';
}

function handleGroqError(e, res) {
  const status = e?.status || e?.error?.status || 500;
  if (status === 429) {
    return res.status(429).json({ success: false, error: 'Rate limit reached. Please wait a moment and try again.' });
  }
  return res.status(500).json({ success: false, error: e.message || 'Unexpected error' });
}

function cleanCode(raw) {
  return raw.replace(/^```[a-z]*\n?/gm, '').replace(/^```$/gm, '').trim();
}

const PLANNER_SYSTEM = `You are an expert Perchance.org pack architect.
Given a theme, you decide what generators are needed to create a cohesive, interconnected generator pack.

Rules:
- Return ONLY a valid JSON array, no explanation, no markdown.
- Each element: { "id": "slug-name", "name": "Human Name", "description": "one sentence", "role": "standalone|root|dependency", "imports": ["other-id", ...] }
- "root" generators import from "dependency" generators.
- "standalone" generators work on their own but enrich the pack.
- Minimum 4, maximum 8 generators per pack.
- IDs must be lowercase hyphenated slugs (e.g. "rpg-character").
- A generator can only import generators listed earlier in the array.
- The last generator in the array should be the master "root" that ties everything together using [^id.listName] cross-imports.
`;

const GENERATOR_SYSTEM = `You are an expert in Perchance.org generator syntax.

SYNTAX RULES:
1. List name on its own line (no indent). Entries indented 2 spaces.
2. First list must be "output".
3. Reference local lists: [listName]. Inline choices: {a|b|c}. Numbers: {1-10}.
4. Import from another generator by its slug: [^generator-slug.listName]
5. Weights: entry followed by double-space and a number. Example: "common  5"
6. Newlines in output: \\n. HTML allowed.
7. Comments: // text
8. Use \\s for leading/trailing space in generated text.

OUTPUT ONLY raw Perchance code. No markdown fences, no explanation. Always start with the output list.`;

// POST /api/perchance/pack/plan
// Body: { theme: string }
// Returns: { generators: [{id, name, description, role, imports}] }
router.post('/plan', async (req, res) => {
  const { theme } = req.body;
  if (!theme || !theme.trim()) {
    return res.status(400).json({ success: false, error: '"theme" is required' });
  }

  const t0 = Date.now();
  try {
    const raw = await callGroq(
      [
        { role: 'system', content: PLANNER_SYSTEM },
        { role: 'user', content: `Theme: "${theme.trim()}"

Plan the generator pack. Return a JSON array only.` }
      ],
      1024,
      'llama-3.1-8b-instant'
    );

    // Extract JSON array from response
    const match = raw.match(/\[\s*\{[\s\S]*\}\s*\]/m);
    if (!match) {
      return res.status(500).json({ success: false, error: 'Planner did not return valid JSON', raw });
    }

    let generators;
    try {
      generators = JSON.parse(match[0]);
    } catch {
      return res.status(500).json({ success: false, error: 'Failed to parse planner JSON', raw: match[0] });
    }

    // Validate structure
    if (!Array.isArray(generators) || generators.length < 2) {
      return res.status(500).json({ success: false, error: 'Planner returned too few generators', raw });
    }

    res.json({
      success: true,
      data: {
        theme: theme.trim(),
        generators,
        planTime: Date.now() - t0
      }
    });
  } catch (e) {
    return handleGroqError(e, res);
  }
});

// POST /api/perchance/pack/build
// Body: { theme: string, generators: [{id, name, description, role, imports}] }
// Returns: { pack: [{id, name, code, validation}] }
router.post('/build', async (req, res) => {
  const { theme, generators } = req.body;

  if (!theme || !Array.isArray(generators) || generators.length < 2) {
    return res.status(400).json({ success: false, error: '"theme" and "generators" array (min 2) are required' });
  }

  const t0 = Date.now();

  // Build all generators in parallel
  const results = await Promise.allSettled(
    generators.map(async (gen) => {
      const importContext = gen.imports && gen.imports.length > 0
        ? `\n\nThis generator MUST import lists from these generators using [^generator-id.listName] syntax:\n${gen.imports.map(id => `  - [^${id}.listName] (replace listName with an appropriate list from the ${id} generator)`).join('\n')}`
        : '';

      const complexity = gen.role === 'root'
        ? 'Create a MASTER generator (8-10 lists, 15+ items each) that ties the whole pack together using cross-generator imports.'
        : gen.role === 'dependency'
          ? 'Create a focused generator (4-6 lists, 12-15 items each) that other generators will import from. Make list names descriptive and reusable.'
          : 'Create a standalone generator (5-7 lists, 10-15 items each).';

      const userMsg = `Theme: "${theme}"
Generator: "${gen.name}" (id: ${gen.id})
Purpose: ${gen.description}
Role: ${gen.role}${importContext}

${complexity}

Generate the Perchance code:`;

      const raw = await callGroq(
        [
          { role: 'system', content: GENERATOR_SYSTEM },
          { role: 'user', content: userMsg }
        ],
        gen.role === 'root' ? 4096 : 2048
      );

      const code = cleanCode(raw);

      // Basic validation
      const lines = code.split('\n');
      const lists = lines
        .filter(l => l.trim() && !l.trim().startsWith('//') && !l.startsWith(' ') && !l.startsWith('\t'))
        .map(l => l.trim());
      const hasOutput = lists.includes('output');

      return {
        id: gen.id,
        name: gen.name,
        description: gen.description,
        role: gen.role,
        imports: gen.imports || [],
        code,
        validation: {
          valid: hasOutput,
          listsFound: lists.length,
          hasOutput,
          crossImports: (code.match(/\[\^[a-z][a-z0-9-]*\.[a-zA-Z]+\]/g) || []).length
        }
      };
    })
  );

  const pack = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    // If one generator failed, return error info
    return {
      id: generators[i].id,
      name: generators[i].name,
      description: generators[i].description,
      role: generators[i].role,
      imports: generators[i].imports || [],
      code: `// Error generating this generator\n// ${r.reason?.message || 'Unknown error'}\n\noutput\n  [error generating content]`,
      validation: { valid: false, error: r.reason?.message || 'Unknown error' }
    };
  });

  const validCount = pack.filter(g => g.validation.valid).length;
  const totalCrossImports = pack.reduce((sum, g) => sum + (g.validation.crossImports || 0), 0);

  res.json({
    success: true,
    data: {
      theme,
      pack,
      meta: {
        totalGenerators: pack.length,
        validGenerators: validCount,
        totalCrossImports,
        buildTime: Date.now() - t0
      }
    }
  });
});

module.exports = router;
