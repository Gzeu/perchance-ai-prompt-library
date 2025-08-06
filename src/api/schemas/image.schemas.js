/**
 * @swagger
 * components:
 *   schemas:
 *     ImageGenerationRequest:
 *       type: object
 *       required:
 *         - prompt
 *       properties:
 *         prompt:
 *           type: string
 *           description: Text prompt for image generation
 *           example: "A majestic lion in the savanna at sunset"
 *         width:
 *           type: integer
 *           description: Width of the generated image (256-1024)
 *           minimum: 256
 *           maximum: 1024
 *           default: 512
 *         height:
 *           type: integer
 *           description: Height of the generated image (256-1024)
 *           minimum: 256
 *           maximum: 1024
 *           default: 512
 *         steps:
 *           type: integer
 *           description: Number of diffusion steps (10-150)
 *           minimum: 10
 *           maximum: 150
 *           default: 50
 *         guidance_scale:
 *           type: number
 *           description: Guidance scale (1-20)
 *           minimum: 1
 *           maximum: 20
 *           default: 7.5
 *         seed:
 *           type: integer
 *           description: Random seed for reproducibility
 *           example: 42
 *         negative_prompt:
 *           type: string
 *           description: Things you don't want in the image
 *           example: "blurry, low quality, distorted"
 *         style_preset:
 *           type: string
 *           description: Style preset to guide the image generation
 *           enum: [photorealistic, digital-art, fantasy, anime, watercolor, oil-painting, pixel-art, cyberpunk, steampunk, surreal]
 *           default: "photorealistic"
 * 
 *     ImageGenerationResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique ID of the generated image
 *           example: "img_1234567890"
 *         url:
 *           type: string
 *           description: URL to access the generated image
 *           example: "https://example.com/generated/img_1234567890.png"
 *         prompt:
 *           type: string
 *           description: The prompt used for generation
 *         width:
 *           type: integer
 *           description: Width of the generated image
 *         height:
 *           type: integer
 *           description: Height of the generated image
 *         seed:
 *           type: integer
 *           description: Random seed used for generation
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the image was generated
 * 
 *     BatchImageGenerationRequest:
 *       type: object
 *       required:
 *         - prompts
 *       properties:
 *         prompts:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of prompts to generate images for
 *           minItems: 1
 *           maxItems: 10
 *           example: ["A serene mountain lake", "A futuristic city at night"]
 *         options:
 *           $ref: '#/components/schemas/ImageGenerationRequest'
 * 
 *     BatchImageGenerationResponse:
 *       type: array
 *       items:
 *         type: object
 *         properties:
 *           prompt:
 *             type: string
 *             description: The prompt used for this image
 *           success:
 *             type: boolean
 *             description: Whether generation was successful
 *           imageUrl:
 *             type: string
 *             description: URL to the generated image (if success is true)
 *           error:
 *             type: string
 *             description: Error message (if success is false)
 * 
 *     RateLimitInfo:
 *       type: object
 *       properties:
 *         remaining:
 *           type: integer
 *           description: Number of remaining requests in the current window
 *           example: 45
 *         resetTime:
 *           type: string
 *           format: date-time
 *           description: When the rate limit will reset
 *         resetIn:
 *           type: integer
 *           description: Milliseconds until rate limit resets
 *           example: 12500
 * 
 *   parameters:
 *     imageIdPath:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Unique ID of the image
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: >-
 *         Use the API token for authentication.
 *         Example: `Bearer 6D0dhLAm9hV_5-6b`
 */

// This file provides the OpenAPI/Swagger schemas for the image generation API.
// These schemas are referenced in the route definitions for documentation.

module.exports = {};
