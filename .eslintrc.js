module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Code Style
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // Best Practices
    'no-console': 'warn',
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    
    // Potential Errors
    'no-cond-assign': 'error',
    'no-constant-condition': 'error',
    'no-dupe-args': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-empty': 'error',
    'no-extra-boolean-cast': 'error',
    'no-extra-parens': ['error', 'functions'],
    'no-extra-semi': 'error',
    'no-func-assign': 'error',
    'no-inner-declarations': 'error',
    'no-invalid-regexp': 'error',
    'no-irregular-whitespace': 'error',
    'no-negated-in-lhs': 'error',
    'no-obj-calls': 'error',
    'no-regex-spaces': 'error',
    'no-sparse-arrays': 'error',
    'no-unreachable': 'error',
    'use-isnan': 'error',
    'valid-typeof': 'error',
    
    // Node.js specific
    'no-process-exit': 'error',
    'no-path-concat': 'error'
  },
  overrides: [
    {
      files: ['tests/**/*.js', '**/*.test.js'],
      rules: {
        'no-console': 'off'
      }
    },
    {
      files: ['bin/cli.js'],
      rules: {
        'no-console': 'off'
      }
    }
  ]
};