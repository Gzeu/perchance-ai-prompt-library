const express = require('express');
const router = express.Router();
const PollinationsService = require('../../services/PollinationsService');
const { body, query, validationResult } = require('express-validator');
const logger = require('../../utils/logger');

/**
 * @swagger
 * /api/images/generate:
 *   post:
 *     summary: Generate an image from a prompt
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt to generate an image from
 *               width:
 *                 type: integer
 *                 description: Width of the generated image
 *                 default: 512
 *                 minimum: 256
 *                 maximum: 1024
 *               height:
 *                 type: integer
 *                 description: Height of the generated image
 *                 default: 512
 *                 minimum: 256
 *                 maximum: 1024
 *               steps:
 *                 type: integer
 *                 description: Number of diffusion steps
 *                 default: 50
 *                 minimum: 10
 *                 maximum: 150
 *               guidance_scale:
 *                 type: number
 *                 description: Guidance scale for generation
 *                 default: 7.5
 *                 minimum: 1
 *                 maximum: 20
 *               seed:
 *                 type: integer
 *                 description: Random seed for reproducibility
 *     responses:
 *       200:
 *         description: The generated image
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.post(
  '/generate',
  [
    body('prompt').isString().trim().notEmpty().withMessage('Prompt is required'),
    body('width').optional().isInt({ min: 256, max: 1024 }),
    body('height').optional().isInt({ min: 256, max: 1024 }),
    body('steps').optional().isInt({ min: 10, max: 150 }),
    body('guidance_scale').optional().isFloat({ min: 1, max: 20 }),
    body('seed').optional().isInt()
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { prompt, ...options } = req.body;
    
    try {
      logger.info(`Generating image for prompt: ${prompt.substring(0, 50)}...`);
      
      // Generate the image
      const imageBuffer = await PollinationsService.generateImage(prompt, options);
      
      // Set appropriate headers
      res.set({
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length,
        'Cache-Control': 'public, max-age=31536000', // 1 year cache
        'X-RateLimit-Remaining': PollinationsService.getRateLimitStatus().remaining,
        'X-RateLimit-Reset': PollinationsService.getRateLimitStatus().resetTime
      });
      
      // Send the image
      res.send(imageBuffer);
      
    } catch (error) {
      logger.error('Error generating image:', error);
      
      if (error.message.includes('Rate limit')) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          message: error.message
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to generate image',
        message: error.message 
      });
    }
  }
);

/**
 * @swagger
 * /api/images/batch:
 *   post:
 *     summary: Generate multiple images in batch
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompts
 *             properties:
 *               prompts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of prompts
 *               options:
 *                 type: object
 *                 description: Generation options (same as /generate)
 *     responses:
 *       200:
 *         description: Array of generated images with status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   prompt:
 *                     type: string
 *                   success:
 *                     type: boolean
 *                   imageUrl:
 *                     type: string
 *                     description: URL to the generated image (if success is true)
 *                   error:
 *                     type: string
 *                     description: Error message (if success is false)
 *       400:
 *         description: Invalid request parameters
 */
router.post(
  '/batch',
  [
    body('prompts').isArray({ min: 1 }).withMessage('At least one prompt is required'),
    body('prompts.*').isString().trim().notEmpty(),
    body('options').optional().isObject()
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { prompts, options = {} } = req.body;
    
    try {
      logger.info(`Starting batch generation of ${prompts.length} images`);
      
      // Process prompts in parallel with concurrency control
      const concurrency = 3; // Number of concurrent generations
      const results = [];
      
      for (let i = 0; i < prompts.length; i += concurrency) {
        const batch = prompts.slice(i, i + concurrency);
        const batchResults = await Promise.all(
          batch.map(async (prompt) => {
            try {
              const imageBuffer = await PollinationsService.generateImage(prompt, options);
              // In a real app, you'd upload to a CDN and return the URL
              const imageUrl = `/api/images/generated/${Date.now()}-${i}.png`;
              return { prompt, success: true, imageUrl };
            } catch (error) {
              return { prompt, success: false, error: error.message };
            }
          })
        );
        
        results.push(...batchResults);
      }
      
      res.json(results);
      
    } catch (error) {
      logger.error('Error in batch generation:', error);
      res.status(500).json({ 
        error: 'Batch generation failed',
        message: error.message 
      });
    }
  }
);

/**
 * @swagger
 * /api/images/rate-limit:
 *   get:
 *     summary: Get current rate limit status
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current rate limit status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 remaining:
 *                   type: integer
 *                   description: Number of remaining requests
 *                 resetTime:
 *                   type: string
 *                   format: date-time
 *                   description: When the rate limit resets
 *                 resetIn:
 *                   type: integer
 *                   description: Milliseconds until rate limit resets
 */
router.get('/rate-limit', (req, res) => {
  res.json(PollinationsService.getRateLimitStatus());
});

module.exports = router;
