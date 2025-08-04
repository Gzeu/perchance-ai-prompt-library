const express = require('express');
const { PerchancePromptLibrary } = require('../../index');

const router = express.Router();
const library = new PerchancePromptLibrary();

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: List all saved templates
 *     tags: [Templates]
 */
router.get('/', (req, res) => {
  try {
    const templates = library.listTemplates();
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/templates:
 *   post:
 *     summary: Save a new template
 *     tags: [Templates]
 */
router.post('/', (req, res) => {
  try {
    const { name, config } = req.body;
    
    if (!name || !config) {
      return res.status(400).json({
        success: false,
        error: 'Name and config are required'
      });
    }
    
    const result = library.saveTemplate(name, config);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
