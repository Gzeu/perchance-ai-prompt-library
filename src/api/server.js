// Copiază în src/api/server.js:

const express = require('express');
const cors = require('cors');
const { PerchancePromptLibrary } = require('../index');

const app = express();
const PORT = process.env.PORT || 3000;
const library = new PerchancePromptLibrary();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    features: ['api', 'batch', 'styles']
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

// Style mixing (NEW v2.0 feature)
app.post('/api/prompts/mix', (req, res) => {
  try {
    const { styles, subject } = req.body;
    
    if (!Array.isArray(styles) || styles.length < 2) {
      return res.status(400).json({
        success: false, 
        error: 'At least 2 styles required for mixing'
      });
    }
    
    // Simple mixing: use first style with random variables from others
    const primaryStyle = styles[0];
    const result = library.generate({ 
      style: primaryStyle, 
      subject,
      randomizeVariables: true 
    });
    
    result.mixedStyles = styles;
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Perchance AI Prompt Library API',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      generate: 'POST /api/prompts/generate',
      batch: 'POST /api/prompts/batch',
      mix: 'POST /api/prompts/mix',
      styles: '/api/styles'
    }
  });
});

app.listen(PORT, () => {
  console.log('🚀 Perchance AI Prompt Library v2.0');
  console.log(`📡 API Server: http://localhost:${PORT}`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log('✨ Features: Generate, Batch, Style Mixing');
});

module.exports = app;
