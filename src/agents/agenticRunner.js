'use strict';

const path = require('path');

function tryRequire(modulePath) {
  try {
    return require(modulePath);
  } catch {
    return null;
  }
}

function ensureTsNode() {
  require('ts-node/register');
}

/**
 * Load compiled agents from dist when available, otherwise TypeScript sources via ts-node.
 */
function loadAgentsModule() {
  const distRegistry = path.join(__dirname, '..', '..', 'dist', 'agents', 'registry');
  const compiled = tryRequire(distRegistry);
  if (compiled) return compiled;

  ensureTsNode();
  return require('./registry');
}

function loadOrchestrator() {
  const distOrchestrator = path.join(__dirname, '..', '..', 'dist', 'agents', 'orchestrator');
  const compiled = tryRequire(distOrchestrator);
  if (compiled?.orchestrator) return compiled.orchestrator;

  ensureTsNode();
  return require('./orchestrator').orchestrator;
}

async function runAgenticBrainstorm(description, options = {}) {
  const orchestrator = loadOrchestrator();
  return orchestrator.brainstorm(description, options);
}

function getAgenticStatus() {
  const orchestrator = loadOrchestrator();
  return orchestrator.getAgentsStatus();
}

function previewAgenticSelection(description, category = 'writing') {
  const { previewAgentsForRequest } = loadAgentsModule();
  return previewAgentsForRequest(description, category);
}

module.exports = {
  runAgenticBrainstorm,
  getAgenticStatus,
  previewAgenticSelection,
  loadOrchestrator,
  loadAgentsModule
};
