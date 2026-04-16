# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2026-04-16

### 🚀 Major Release — TypeScript Migration & Enterprise Features

#### Added
- **TypeScript strict mode** — full migration with `tsconfig.json` ES2022 target
- **`src/types/index.ts`** — centralized type definitions: `PromptCategory`, `ArtStyle`, `GeneratedPrompt`, `ValidationResult`, `APIResponse`, `PaginatedResponse`, `UsageStats`, `ComfyGenerationConfig`, `DiscordBotConfig`
- **`src/services/comfyui.ts`** — ComfyUI offline integration service with polling, workflow builder, and `isAvailable()` health check
- **`discord-bot/src/index.ts`** — full TypeScript rewrite of Discord bot with:
  - Slash commands: `/generate`, `/batch`, `/help`
  - Built-in `RateLimiter` class (10 req/min per user)
  - Rich `EmbedBuilder` responses with quality scores and tags
  - Ephemeral error handling
- **`discord-bot/tsconfig.json`** — dedicated TypeScript config for the bot
- **`tests/unit/promptValidator.test.ts`** — Jest unit tests for prompt validation and cache service
- **`tests/unit/rateLimit.test.ts`** — Jest unit tests for the rate limiter
- **`web/src/components/PromptCard.tsx`** — React component with copy-to-clipboard, favorites, regenerate, category color coding, quality indicator
- **`discord.js`** added to dependencies (v14)
- **`ts-node`, `ts-jest`** added to devDependencies

#### Changed
- `package.json` version bumped to `4.0.0`
- `build` script now runs `tsc` instead of echo placeholders
- `test` script now runs `jest --coverage` instead of echo placeholder
- `type-check` script now runs `tsc --noEmit`
- Description updated to 2026 Edition
- Keywords updated: added `comfyui`, `2026`; removed `2025`

#### Fixed
- All script placeholders replaced with real commands
- `term-size`, `wrap-ansi`, `@playwright/test`, `jsdoc`, `standard-version`, `supertest`, `gradient-string` cleaned from dependencies where unused

---

## [3.0.0] - 2025-12-01

### Added
- Advanced CLI with 600+ lines, batch processing, analytics
- Discord bot integration
- React web interface
- Pollinations.ai integration
- Docker support
- Swagger API documentation
- GitHub Actions CI/CD

## [2.0.0] - 2025-06-01

### Added
- Batch generation
- Export formats (JSON, CSV, TXT)
- Analytics dashboard
- Rate limiting

## [1.0.0] - 2025-01-01

### Added
- Initial release
- Basic prompt generation
- CLI interface
- Category system
