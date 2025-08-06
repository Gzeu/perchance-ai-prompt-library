# Pollinations.ai Integration

This document provides a comprehensive guide to the Pollinations.ai integration in the Perchance AI Prompt Library, including setup instructions, usage examples, and API documentation.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Setup](#setup)
- [Web Interface](#web-interface)
- [CLI Usage](#cli-usage)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

The Pollinations.ai integration brings powerful AI image generation capabilities to the Perchance AI Prompt Library. It allows users to generate high-quality images from text prompts using various artistic styles and advanced parameters.

## Features

- 🎨 Generate images from text prompts
- 🖌️ Multiple artistic styles (photorealistic, digital art, anime, etc.)
- ⚙️ Advanced generation parameters (steps, guidance scale, seed, etc.)
- 🌐 Web interface with real-time preview
- 💻 Command-line interface for automation
- 🔄 Caching for improved performance
- 🔒 API key authentication
- 📊 Rate limiting and usage tracking

## Setup

### Prerequisites

- Node.js 16.x or later
- npm 8.x or later
- Pollinations.ai API key (get one at [Pollinations.ai](https://pollinations.ai))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/perchance-ai-prompt-library.git
   cd perchance-ai-prompt-library
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the project root with the following content:
   ```env
   # Required
   POLLINATIONS_API_KEY=your_api_key_here
   
   # Optional
   PORT=3000
   NODE_ENV=development
   CACHE_ENABLED=true
   CACHE_TTL=3600000
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Web Interface

The web interface provides an intuitive way to generate and manage AI images.

### Accessing the Web Interface

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Using the Image Generator

1. **Enter a prompt** describing the image you want to generate
2. **Select a style** from the dropdown menu
3. (Optional) Adjust advanced parameters:
   - Image dimensions
   - Number of diffusion steps
   - Guidance scale
   - Random seed
4. Click **Generate Image**
5. Once generated, you can:
   - Download the image
   - Copy the prompt
   - Generate a new variation
   - View generation details

## CLI Usage

The command-line interface allows for batch processing and automation.

### Basic Usage

```bash
# Generate an image
npx perchance generate-image -p "A beautiful sunset over mountains"

# Specify style and output directory
npx perchance generate-image -p "A cyberpunk city" -s cyberpunk -o ./output

# Advanced parameters
npx perchance generate-image -p "A portrait of a cat" --width 768 --height 1024 --steps 75 --guidance-scale 8.5

# List available styles
npx perchance generate-image --list-styles
```

### CLI Options

```
Options:
  -p, --prompt <prompt>          The prompt for image generation
  -n, --negative-prompt <text>   Negative prompt (things to avoid)
  -s, --style <style>            Style preset (default: "photorealistic")
  -w, --width <pixels>           Image width (default: 512)
  -h, --height <pixels>          Image height (default: 512)
      --steps <number>           Number of diffusion steps (default: 50)
      --guidance-scale <number>  Guidance scale (1-20) (default: 7.5)
      --seed <number>            Random seed (-1 for random) (default: -1)
  -o, --output <path>            Output directory (default: "./output")
      --filename <name>          Output filename (without extension)
      --show-progress            Show progress bar
      --api-key <key>            Pollinations.ai API key
      --save-settings            Save generation settings to a JSON file
      --list-styles              List available style presets and exit
  -v, --version                  Output the version number
  -h, --help                     Display help for command
```

## API Endpoints

### Generate Image

```
POST /api/images/generate
```

**Request Body:**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "negative_prompt": "blurry, low quality",
  "width": 512,
  "height": 512,
  "steps": 50,
  "guidance_scale": 7.5,
  "seed": 42
}
```

**Response:**
- Success (200): Image binary data with `Content-Type: image/png`
- Error (4xx/5xx): JSON error object

### Get Rate Limit Status

```
GET /api/rate-limit
```

**Response:**
```json
{
  "limit": 100,
  "remaining": 87,
  "reset": 1680000000,
  "used": 13
}
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port to run the server on |
| `NODE_ENV` | `development` | Runtime environment |
| `POLLINATIONS_API_KEY` | - | Pollinations.ai API key (required) |
| `CACHE_ENABLED` | `true` | Enable response caching |
| `CACHE_TTL` | `3600000` | Cache TTL in milliseconds |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 minutes) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

### Cache Configuration

Caching can be configured in `src/config/cache.js`:

```javascript
module.exports = {
  // Enable/disable caching
  enabled: process.env.CACHE_ENABLED !== 'false',
  
  // Cache TTL in milliseconds
  ttl: parseInt(process.env.CACHE_TTL) || 3600000, // 1 hour
  
  // Maximum number of items to store in memory cache
  maxItems: 1000,
  
  // Maximum size of file cache in bytes (1GB)
  maxSize: 1024 * 1024 * 1024,
  
  // Cache directory (for file-based cache)
  directory: path.join(require('os').tmpdir(), 'perchance-cache')
};
```

## Troubleshooting

### Common Issues

#### API Key Not Set
**Error:** `Pollinations API key is required`
**Solution:** Set the `POLLINATIONS_API_KEY` environment variable

#### Rate Limit Exceeded
**Error:** `Rate limit exceeded`
**Solution:** Wait for the rate limit window to reset or contact support for higher limits

#### Image Generation Failed
**Error:** `Failed to generate image`
**Solution:**
1. Check your internet connection
2. Verify your API key is valid
3. Try a different prompt or parameters
4. Check the server logs for more details

#### Cache Issues
**Issue:** Stale or incorrect cached responses
**Solution:**
- Clear the cache: `rm -rf /tmp/perchance-cache`
- Disable caching by setting `CACHE_ENABLED=false`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
