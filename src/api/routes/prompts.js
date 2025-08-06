const express = require('express');
const { PerchancePromptLibrary } = require('../../index');
const { validatePromptRequest, validateBatchRequest } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const library = new PerchancePromptLibrary();

// Stricter rate limiting for generation endpoints
const generateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: { error: 'Generation rate limit exceeded. Please wait.' }
});

/**
 * @swagger
 * /api/prompts/generate:
 *   post:
 *     summary: Generate a single AI art prompt
 *     tags: [Prompts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - style
 *               - subject
 *             properties:
 *               style:
 *                 type: string
 *                 enum: [anime, cinematic, photorealistic, digital_art, comic, pixel_art]
 *               subject:
 *                 type: string
 *               age:
 *                 type: string
 *               gender:
 *                 type: string
 *               clothing:
 *                 type: string
 *               setting:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully generated prompt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                 style:
 *                   type: string
 *                 variables:
 *                   type: object
 *                 timestamp:
 *                   type: string
 *                 metadata:
 *                   type: object
 *                 negativePrompt:
 *                   type: string
 */
router.post('/generate', generateLimiter, validatePromptRequest, (req, res) => {
  try {
    const { style, subject, ...config } = req.body;
    const startTime = Date.now();
    
    const result = library.generate({ style, subject, ...config });
    
    // Add performance metrics
    result.performance = {
      generationTime: Date.now() - startTime,
      version: '1.2.0'
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'GENERATION_FAILED'
    });
  }
});

/**
 * @swagger
 * /api/prompts/batch:
 *   post:
 *     summary: Generate multiple prompt variations
 *     tags: [Prompts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - style
 *               - subject
 *             properties:
 *               style:
 *                 type: string
 *               subject:
 *                 type: string
 *               count:
 *                 type: integer
 *                 default: 3
 *                 description: Number of variations to generate
 *               age:
 *                 type: string
 *                 example: young
 *               gender:
 *                 type: string
 *                 example: female
 *               clothing:
 *                 type: string
 *                 example: school uniform
 *               setting:
 *                 type: string
 *                 example: magical forest
 *     responses:
 *       200:
 *         description: Successfully generated prompts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PromptResponse'
 *                 count:
 *                   type: integer
 *                   example: 3
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/batch', generateLimiter, validateBatchRequest, (req, res) => {
  try {
    const { style, subject, count = 3, ...config } = req.body;
    const startTime = Date.now();
    
    if (count > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum batch size is 10',
        code: 'BATCH_SIZE_EXCEEDED'
      });
    }
    
    const results = library.generateVariations(style, { subject, ...config }, count);
    
    // Add batch metadata
    const response = {
      success: true,
      data: {
        results: results,
        batch: {
          count: results.length,
          style: style,
          subject: subject,
          generationTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      }
    };
    
    res.json(response);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'BATCH_GENERATION_FAILED'
    });
  }
});

/**
 * @swagger
 * /api/prompts/random:
 *   get:
 *     summary: Generate a random prompt
 *     tags: [Prompts]
 *     parameters:
 *       - in: query
 *         name: style
 *         schema:
 *           type: string
 *         description: Optional style filter
 *     responses:
 *       200:
 *         description: Random prompt generated
 */
router.get('/random', (req, res) => {
  try {
    const availableStyles = library.getStats().availableStyles;
    const style = req.query.style || availableStyles[Math.floor(Math.random() * availableStyles.length)];
    
    const randomSubjects = [
      'mystical warrior', 'space explorer', 'ancient wizard', 'cyberpunk hacker',
      'forest guardian', 'time traveler', 'dragon rider', 'star princess',
      'mechanical inventor', 'shadow assassin', 'elemental mage', 'galactic pilot'
    ];
    
    const subject = randomSubjects[Math.floor(Math.random() * randomSubjects.length)];
    
    const result = library.generate({ 
      style, 
      subject,
      randomizeVariables: true 
    });
    
    res.json({
      success: true,
      data: result,
      meta: {
        type: 'random_generation',
        selectedFrom: {
          styles: availableStyles.length,
          subjects: randomSubjects.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
