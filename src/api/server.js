'use strict';

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { PerchancePromptLibrary } = require('../index');
const { applyGlobal } = require('./middleware/index');

// Route files
const healthRoutes = require('./routes/health');
const promptsRoutes = require('./routes/prompts');
const stylesRoutes = require('./routes/styles');
const imagesRoutes = require('./routes/images');
const perchanceRoutes = require('./routes/perchance');
const perchancePackRoutes = require('./routes/perchance-pack');

const app = express();
const PORT = process.env.PORT || 3000;
const library = new PerchancePromptLibrary();

// ── Global middleware (helmet, cors, morgan, body parsers, rate limit) ──────
applyGlobal(app);

// ── Static files ─────────────────────────────────────────────────────────────
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/health',        healthRoutes);
app.use('/api/prompts',       promptsRoutes);
app.use('/api/styles',        stylesRoutes);
app.use('/api/images',        imagesRoutes);
app.use('/api/perchance',     perchanceRoutes);
app.use('/api/perchance/pack', perchancePackRoutes);

// ── Swagger docs ──────────────────────────────────────────────────────────────
app.use('/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Perchance AI Prompt Library API',
    customfavIcon: '/favicon.ico',
  })
);

// ── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ── API index ─────────────────────────────────────────────────────────────────
app.get('/api', (_req, res) => {
  res.json({
    name: 'Perchance AI Prompt Library API',
    version: '7.0.0',
    docs: '/api-docs',
    endpoints: {
      health:    'GET  /api/health',
      generate:  'POST /api/prompts/generate',
      batch:     'POST /api/prompts/batch',
      mix:       'POST /api/prompts/mix',
      styles:    'GET  /api/styles',
      perchance: {
        templates:      'GET  /api/perchance/templates',
        categories:     'GET  /api/perchance/categories',
        generate:       'POST /api/perchance/generate',
        agentic:        'POST /api/perchance/agentic',
        agenticPreview: 'GET  /api/perchance/agentic/preview',
        agenticStatus:  'GET  /api/perchance/agentic/status',
        refine:         'POST /api/perchance/refine',
        ideas:          'POST /api/perchance/ideas',
        validate:       'POST /api/perchance/validate',
        packPlan:       'POST /api/perchance/pack/plan',
        packBuild:      'POST /api/perchance/pack/build',
      },
    },
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n🚀 Perchance AI Prompt Library v7.0');
  console.log(`📡 API:      http://localhost:${PORT}/api`);
  console.log(`❤️  Health:   http://localhost:${PORT}/api/health`);
  console.log(`📚 Swagger:  http://localhost:${PORT}/api-docs`);
  console.log(`🧠 Agentic:  http://localhost:${PORT}/api/perchance/agentic`);
  console.log(`🎲 Pack:     http://localhost:${PORT}/api/perchance/pack/plan`);
  const hasGroq = !!process.env.GROQ_API_KEY;
  console.log(`🤖 Groq AI:  ${hasGroq ? '✓ Ready' : '✗ Set GROQ_API_KEY to enable'}`);
});

module.exports = app;
