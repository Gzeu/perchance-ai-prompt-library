'use strict';

const promptsRouter = require('./prompts');
const imagesRouter = require('./images');
const stylesRouter = require('./styles');
const templatesRouter = require('./templates');
const healthRouter = require('./health');

/**
 * Register all API routes on an Express app
 * @param {import('express').Application} app
 */
function registerRoutes(app) {
  app.use('/api/health', healthRouter);
  app.use('/api/prompts', promptsRouter);
  app.use('/api/images', imagesRouter);
  app.use('/api/styles', stylesRouter);
  app.use('/api/templates', templatesRouter);
}

module.exports = { registerRoutes };
