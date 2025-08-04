function randomChoice(array) {
  if (!Array.isArray(array) || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}

function replacePlaceholders(template, variables) {
  let result = template;
  Object.keys(variables).forEach(key => {
    const placeholder = `[${key}]`;
    if (result.includes(placeholder)) {
      const value = variables[key] || '';
      result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
    }
  });
  result = result.replace(/\[[\w_]+\]/g, '');
  result = result.replace(/,\s*,/g, ',').replace(/,\s*$/, '').replace(/^\s*,/, '');
  return result.replace(/\s+/g, ' ').trim();
}

function validateConfig(config) {
  const errors = [];
  if (!config) {
    errors.push('Configuration is required');
    return { valid: false, errors };
  }
  if (!config.style) errors.push('Style is required');
  if (!config.subject) errors.push('Subject is required');
  return { valid: errors.length === 0, errors };
}

function generatePromptId() {
  return 'prompt_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

module.exports = {
  randomChoice,
  replacePlaceholders,
  validateConfig,
  generatePromptId
};
