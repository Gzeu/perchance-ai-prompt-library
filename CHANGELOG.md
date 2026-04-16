# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [5.0.0] — 2026-04-16

### 🚀 Added — v5
- **Types extinse** (`src/types/index.ts`): noi categorii (`architecture`, `food`, `nature`, `fashion`, `surreal`), stiluri (`oil-painting`, `digital-art`, `photorealistic`, `anime-style`, `concept-art`, `illustration`), tipuri noi `LogLevel`, `SortOrder`, `SortBy`, `APIError`, `RateLimitInfo`, `ComfyWorkflow`, `DiscordCommandResult`, `AnalyticsEvent`, `AppConfig`, `PromptFilter`, `PromptSearchOptions`, `CacheOptions`
- **`src/index.ts`** — entry point TypeScript cu re-exports publice complet
- **`src/config/app.ts`** — configurare centralizată tip-safe `AppConfig` citit din env vars
- **`src/api/middleware/auth.ts`** — `apiKeyAuth` și `optionalAuth` middleware TypeScript
- **`src/api/middleware/rateLimit.ts`** — 3 limiters (general / generate / batch) cu `express-rate-limit`
- **`src/api/middleware/errorHandler.ts`** — `errorHandler`, `notFoundHandler`, `createError`
- **`src/api/routes/prompts.ts`** — rute TypeScript complete: POST `/generate`, POST `/batch`, POST `/validate`, GET `/stats`, GET `/categories` cu cache + analytics integrate
- **`src/api/routes/health.ts`** — `/health` și `/health/ping` cu uptime, memorie, versiune
- **Teste TypeScript noi** (`tests/unit/`):
  - `cacheService.test.ts` — 18 teste pentru `CacheService`
  - `generators.test.ts` — 10 teste pentru `generatePrompt`, `generateBatch`, `getRandomCategory`
  - `analyticsService.test.ts` — 9 teste pentru `AnalyticsService`
  - `formatters.test.ts` — 14 teste pentru toate utilitarele din `formatters.ts`
- **`package.json` v5** — `main` → `dist/index.js`, `types` → `dist/index.d.ts`, `test` script actualizat la `jest.config.ts`, devDeps `@types` noi

### 🔧 Changed — v5
- `package.json`: versiune `4.0.0` → `5.0.0`
- `types/index.ts`: complet rescris cu 12 noi tipuri, câmpuri opționale adăugate la `GeneratedPrompt`, `CLIOptions`, `BatchOptions`, `PromptMetadata`, `APIResponse`, `PaginatedResponse`
- `jest.config.ts` test pattern acum include `tests/unit/**/*.test.ts`
- `prepublishOnly` script include acum și `build` step

---

## [4.0.0] — 2026-04-15

### 🚀 Added — v4
- **TypeScript full migration** — toate serviciile rescrise în `.ts`
- **`src/services/promptValidator.ts`** — validare cu reguli, sanitize, warnings
- **`src/services/cacheService.ts`** — `CacheService<T>` generic cu TTL, stats, purge
- **`src/services/exportService.ts`** — export JSON / CSV / TXT / Markdown
- **`src/services/analyticsService.ts`** — tracking usage complet
- **`src/services/pollinationsService.ts`** — integrare Pollinations.ai (imagine + text + enhance)
- **`src/services/index.ts`** — barrel export
- **`src/validators/promptValidator.ts`** — re-export backward-compat
- **`src/utils/logger.ts`** — logger colorat chalk, silent în test
- **`src/utils/idGenerator.ts`** — `generateId`, `generateShortId`
- **`src/utils/formatters.ts`** — 5 funcții de formatare
- **`src/generators/promptGenerator.ts`** — generator cu 4 calități, 7 categorii, negative prompts
- **`jest.config.ts`** — config TypeScript ts-jest cu coverage 70%
- **`.github/workflows/ci.yml`** — CI pe Node 20 + 22, lint/type-check/test/build/codecov

---

## [3.0.0] — 2026-04-10

### Added
- Discord bot integration
- ComfyUI service
- Web interface (Vite + React)
- Swagger API documentation
- Docker & docker-compose support

---

## [2.0.0] — 2026-03-20

### Added
- Batch generation
- Export functionality (JSON, CSV, TXT)
- Analytics basic tracking
- CLI improvements

---

## [1.0.0] — 2026-02-01

### Added
- Initial release
- Basic prompt generation CLI
- Pollinations.ai integration
- 7 categories, 6 art styles
