const express = require('express');
const { PerchancePromptLibrary } = require('../../index');

const router = express.Router();
const library = new PerchancePromptLibrary();

/**
 * @swagger
 * /api/styles:
 *   get:
 *     summary: Get all available art styles
 *     description: Returns a list of all available art styles with their basic information
 *     tags: [Styles]
 *     responses:
 *       200:
 *         description: Successfully retrieved styles
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
 *                     $ref: '#/components/schemas/Style'
 */
router.get('/', (req, res) => {
  try {
    const styles = library.listStyles();
    res.json({
      success: true,
      data: styles,
      meta: {
        count: styles.length,
        timestamp: new Date().toISOString()
      }
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
 * /api/styles/{styleKey}:
 *   get:
 *     summary: Get detailed information about a specific style
 *     description: Returns detailed information about a specific art style including its variables and examples
 *     tags: [Styles]
 *     parameters:
 *       - in: path
 *         name: styleKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The key of the style to retrieve
 *     responses:
 *       200:
 *         description: Detailed style information
 *       404:
 *         description: Style not found
 */
router.get('/:styleName', (req, res) => {
  try {
    const styleName = req.params.styleName;
    const styleInfo = library.getStyleInfo(styleName);
    
    if (!styleInfo) {
      return res.status(404).json({
        success: false,
        error: `Style "${styleName}" not found`,
        code: 'STYLE_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      data: {
        name: styleName,
        ...styleInfo
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/styles/stats:
 *   get:
 *     summary: Get library statistics
 *     tags: [Styles]
 */
router.get('/stats', (req, res) => {
  try {
    const stats = library.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
