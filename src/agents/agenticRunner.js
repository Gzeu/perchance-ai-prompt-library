'use strict';

/**
 * Load TypeScript orchestrator at runtime (dist after build, or ts-node in dev).
 */
function loadOrchestrator() {
  require('ts-node/register');
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

module.exports = { runAgenticBrainstorm, getAgenticStatus, loadOrchestrator };
