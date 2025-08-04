const express = require('express');
const { PerchancePromptLibrary } = require('../../index');

const router = express.Router();
const library = new PerchancePromptLibrary();

/**
 * @swagger
 * /api/styles:
 *   get:
 *     summary: Get all available art styles
 *     tags: [Styles]
 *     responses:
 *       200:
 *         description: List of all styles
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
 * /api/styles/{styleName}:
 *   get:
 *     summary: Get detailed information about a specific style
 *     tags: [Styles]
 *     parameters:
 *       - in: path
 *         name: styleName
 *         required: true
 *         schema:
 *           type: string
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
