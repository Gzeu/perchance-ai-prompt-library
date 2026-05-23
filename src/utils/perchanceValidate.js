'use strict';

/**
 * Validate Perchance generator syntax (lists, output, references).
 * @param {string} code
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
function validateCode(code) {
  const errors = [];
  const warnings = [];
  const lines = code.split('\n');
  const lists = [];
  let hasOutput = false;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('//')) continue;
    if (!line.startsWith(' ') && !line.startsWith('\t')) {
      const name = line.trim();
      lists.push(name);
      if (name === 'output') hasOutput = true;
    }
  }

  if (!hasOutput) errors.push('Missing required "output" list');
  if (lists[0] && lists[0] !== 'output') {
    warnings.push('"output" should be the first list — Perchance shows the first list by default');
  }
  if (lists.length < 2) warnings.push('Generator has very few lists — add more for variety');

  const refs = code.match(/\[([a-zA-Z][a-zA-Z0-9_-]*)\]/g) || [];
  for (const ref of refs) {
    const name = ref.slice(1, -1);
    if (!name.startsWith('^') && !lists.includes(name)) {
      warnings.push(`Reference [${name}] not found locally (may be an import)`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateCode };
