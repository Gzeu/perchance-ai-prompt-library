# Perchance AI Prompt Library — API

REST API for the prompt library. Built with Express.js, supports Swagger/OpenAPI docs.

## Quick Start

```bash
# Install dependencies
npm install

# Start API server (development)
npm run api:dev

# Start API server (production)
npm run api:start
```

Server starts on `http://localhost:3000` by default (`PORT` env var to override).

## Swagger UI

Interactive docs available at: `http://localhost:3000/api-docs`

## Authentication

All endpoints accept an API key via:
- `Authorization: Bearer <key>` header
- `x-api-key: <key>` header
- `?api_key=<key>` query param

In development (`NODE_ENV=development` or `SKIP_AUTH=true`), auth is bypassed.

Set valid keys via env: `API_KEYS=key1,key2,key3`

## Rate Limiting

- Default: **100 requests/min** per IP
- Generation endpoints: **20 requests/min** per IP
- Headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Endpoints

### Prompts

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/prompts` | List all prompts (supports `?category=`, `?style=`, `?q=`, `?page=`, `?limit=`) |
| `POST` | `/api/prompts` | Create a new prompt |
| `GET` | `/api/prompts/:id` | Get prompt by ID |
| `PUT` | `/api/prompts/:id` | Update prompt |
| `DELETE` | `/api/prompts/:id` | Delete prompt |
| `POST` | `/api/prompts/generate` | Generate a random prompt |
| `POST` | `/api/prompts/enhance` | Enhance an existing prompt |
| `POST` | `/api/prompts/batch` | Batch generate prompts |

### Images

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/images/generate` | Generate image via Pollinations.ai |
| `GET` | `/api/images/url` | Build image URL without downloading |
| `POST` | `/api/images/batch` | Batch generate image URLs |

### Styles

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/styles` | List all available styles |
| `GET` | `/api/styles/:id` | Get style details |
| `GET` | `/api/styles/categories` | Get style categories |

### Templates

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/templates` | List saved templates |
| `POST` | `/api/templates` | Save a new template |
| `GET` | `/api/templates/:id` | Get template by ID |
| `PUT` | `/api/templates/:id` | Update template |
| `DELETE` | `/api/templates/:id` | Delete template |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check + uptime |
| `GET` | `/api/health/ready` | Readiness probe |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Environment |
| `API_KEYS` | `dev-key-12345` | Comma-separated valid API keys |
| `SKIP_AUTH` | `false` | Set `true` to bypass auth |
| `POLLINATIONS_MODEL` | `flux` | Default image model |
| `POLLINATIONS_TEXT_MODEL` | `mistral` | Default text model |

## Error Responses

All errors follow the format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

HTTP status codes: `400` bad request, `401` unauthorized, `404` not found, `429` rate limited, `500` internal error.
