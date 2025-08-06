function randomChoice(array) {
  if (!Array.isArray(array) || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}

function replacePlaceholders(template, variables) {
  let result = template;
  
  // Process each variable
  Object.keys(variables).forEach(key => {
    const value = variables[key] || '';
    
    // Replace {{key}} placeholders
    const curlyPlaceholder = `{{${key}}}`;
    if (result.includes(curlyPlaceholder)) {
      result = result.replace(new RegExp(curlyPlaceholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }
    
    // Also replace [key] placeholders for backward compatibility
    const bracketPlaceholder = `[${key}]`;
    if (result.includes(bracketPlaceholder)) {
      result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
    }
  });
  
  // Clean up any remaining placeholders
  result = result.replace(/\{\{[^}]+\}\}/g, '');  // Remove any remaining {{...}}
  result = result.replace(/\[[^\]]+\]/g, '');      // Remove any remaining [...]
  
  // Clean up any double commas or trailing/leading commas
  result = result.replace(/,\s*,/g, ',')
                .replace(/^\s*,\s*|\s*,\s*$/g, '')
                .replace(/\s+/g, ' ')
                .trim();
                
  return result;
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
