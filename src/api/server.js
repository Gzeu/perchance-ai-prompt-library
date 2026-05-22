// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const swaggerSpec = require('./config/swagger');
const { PerchancePromptLibrary } = require('../index');

// Import route files
const healthRoutes = require('./routes/health');
const promptsRoutes = require('./routes/prompts');
const stylesRoutes = require('./routes/styles');
const imagesRoutes = require('./routes/images');
const perchanceRoutes = require('./routes/perchance');
const perchancePackRoutes = require('./routes/perchance-pack');

const app = express();
const PORT = process.env.PORT || 3000;
const library = new PerchancePromptLibrary();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/prompts', promptsRoutes);
app.use('/api/styles', stylesRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/perchance', perchanceRoutes);
app.use('/api/perchance/pack', perchancePackRoutes);

// Serve API documentation
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Perchance AI Prompt Library API',
    customfavIcon: '/favicon.ico'
  })
);

// Root route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '8.0.0',
    timestamp: new Date().toISOString(),
    features: ['api', 'batch', 'styles', 'perchance-generators', 'ai-groq', 'pack-builder']
  });
});

// Generate prompt
app.post('/api/prompts/generate', (req, res) => {
  try {
    const { style, subject, ...config } = req.body;
    const result = library.generate({ style, subject, ...config });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Batch generation
app.post('/api/prompts/batch', (req, res) => {
  try {
    const { style, subject, count = 3, ...config } = req.body;
    const results = library.generateVariations(style, { subject, ...config }, count);
    res.json({ success: true, data: results, count: results.length });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// List styles
app.get('/api/styles', (req, res) => {
  try {
    const styles = library.listStyles();
    res.json({ success: true, data: styles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Style mixing
app.post('/api/prompts/mix', (req, res) => {
  try {
    const { styles, subject } = req.body;
    if (!Array.isArray(styles) || styles.length < 2) {
      return res.status(400).json({ success: false, error: 'At least 2 styles required for mixing' });
    }
    const result = library.generate({ style: styles[0], subject, randomizeVariables: true });
    result.mixedStyles = styles;
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Root endpoint info
app.get('/api', (req, res) => {
  res.json({
    name: 'Perchance AI Prompt Library API',
    version: '8.0.0',
    endpoints: {
      health: 'GET /api/health',
      generate: 'POST /api/prompts/generate',
      batch: 'POST /api/prompts/batch',
      mix: 'POST /api/prompts/mix',
      styles: 'GET /api/styles',
      perchance: {
        templates: 'GET /api/perchance/templates',
        categories: 'GET /api/perchance/categories',
        generate: 'POST /api/perchance/generate',
        refine: 'POST /api/perchance/refine',
        ideas: 'POST /api/perchance/ideas',
        validate: 'POST /api/perchance/validate',
        packPlan: 'POST /api/perchance/pack/plan',
        packBuild: 'POST /api/perchance/pack/build'
      }
    }
  });
});

app.listen(PORT, () => {
  console.log('\n🚀 Perchance AI Prompt Library v8.0');
  console.log(`📡 API Server: http://localhost:${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Perchance AI: http://localhost:${PORT}/api/perchance/generate`);
  console.log(`🎲 Pack Builder: http://localhost:${PORT}/api/perchance/pack/plan`);
  console.log(`📚 Templates: http://localhost:${PORT}/api/perchance/templates`);
  const hasGroq = !!process.env.GROQ_API_KEY;
  console.log(`🤖 Groq AI: ${hasGroq ? '✓ Ready' : '✗ Set GROQ_API_KEY to enable'}`);
});

module.exports = app;
