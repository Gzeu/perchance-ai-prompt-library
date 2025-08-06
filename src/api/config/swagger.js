const swaggerJsdoc = require('swagger-jsdoc');
const packageJson = require('../../../package.json');
const path = require('path');

// Import image schemas
let imageSchemas = { components: { schemas: {} } };
try {
  imageSchemas = require('../schemas/image.schemas');
} catch (err) {
  console.warn('Warning: Could not load image schemas. API documentation will be limited.');
}

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Perchance AI Prompt Library API',
      version: packageJson.version,
      description: 'API documentation for the Perchance AI Prompt Library',
      contact: {
        name: 'API Support',
        url: 'https://github.com/yourusername/perchance-ai-prompt-library',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    components: {
      // Security schemes
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Use the API token for authentication. Example: `Bearer your_pollinations_token_here`',
        },
      },
      
      // Common schemas
      schemas: {
        // Import image-related schemas if available
        ...(imageSchemas?.components?.schemas || {}),
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message' },
          },
        },
        Style: {
          type: 'object',
          properties: {
            key: { type: 'string', example: 'anime' },
            name: { type: 'string', example: 'Anime/Manga Style' },
            description: { type: 'string', example: 'Japanese animation style with clean lines and vibrant colors' },
            variableCount: { type: 'number', example: 4 },
            hasExamples: { type: 'boolean', example: true },
          },
        },
        PromptRequest: {
          type: 'object',
          required: ['style', 'subject'],
          properties: {
            style: { type: 'string', example: 'anime', description: 'Style key for the prompt' },
            subject: { type: 'string', example: 'magical girl', description: 'Main subject of the prompt' },
            age: { type: 'string', example: 'young', description: 'Age of the subject' },
            gender: { type: 'string', example: 'female', description: 'Gender of the subject' },
            clothing: { type: 'string', example: 'school uniform', description: 'Clothing description' },
            setting: { type: 'string', example: 'magical forest', description: 'Setting or background' },
          },
        },
        PromptResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                text: { type: 'string', example: 'A magical girl with long flowing hair, wearing a school uniform, standing in a magical forest, anime style' },
                style: { type: 'string', example: 'anime' },
                variables: { type: 'object' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/api/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs;
