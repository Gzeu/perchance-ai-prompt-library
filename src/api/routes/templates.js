'use strict';

const express = require('express');
const { PerchancePromptLibrary } = require('../../index');

const router = express.Router();
const library = new PerchancePromptLibrary();

// In-memory template store (persisted to library if supported)
const templateStore = new Map();

function getTemplateById(id) {
  return templateStore.get(id) || null;
}

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: List all saved templates
 *     tags: [Templates]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 */
router.get('/', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const all = Array.from(templateStore.values());
    const start = (page - 1) * limit;
    const data = all.slice(start, start + limit);
    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: all.length,
        pages: Math.ceil(all.length / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/templates/{id}:
 *   get:
 *     summary: Get a template by ID
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.get('/:id', (req, res) => {
  try {
    const template = getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/templates:
 *   post:
 *     summary: Save a new template
 *     tags: [Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, config]
 *             properties:
 *               name: { type: string }
 *               config: { type: object }
 *               description: { type: string }
 */
router.post('/', (req, res) => {
  try {
    const { name, config, description } = req.body;
    if (!name || !config) {
      return res.status(400).json({ success: false, error: 'name and config are required' });
    }
    const id = `tmpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const template = {
      id,
      name: name.trim(),
      description: description || '',
      config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    templateStore.set(id, template);
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/templates/{id}:
 *   put:
 *     summary: Update an existing template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               config: { type: object }
 *               description: { type: string }
 */
router.put('/:id', (req, res) => {
  try {
    const template = getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    const { name, config, description } = req.body;
    if (name !== undefined) template.name = name.trim();
    if (config !== undefined) template.config = config;
    if (description !== undefined) template.description = description;
    template.updatedAt = new Date().toISOString();
    templateStore.set(template.id, template);
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/templates/{id}:
 *   delete:
 *     summary: Delete a template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.delete('/:id', (req, res) => {
  try {
    if (!templateStore.has(req.params.id)) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    templateStore.delete(req.params.id);
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
