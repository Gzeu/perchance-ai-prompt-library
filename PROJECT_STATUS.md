# Project Status

**Project:** Perchance AI Prompt Library  
**Version:** 7.0.0  
**Last Updated:** May 23, 2026  
**Status:** Active development — Ultra Agentic v7 release

---

## v7.0 highlights

- **Ultra Agentic pipeline** — 7 specialists, smart selection (max 3), parallel Groq generation, debate, weighted voting, SyntaxMaster refine, session memory
- **API** — `POST /api/perchance/agentic`, `GET /api/perchance/agentic/preview`, `GET /api/perchance/agentic/status`
- **CLI** — `pai agentic "<description>"`
- **Web** — `/agentic` Ultra Agentic Studio page
- **Groq service** — shared module with retry/backoff on 429 and 5xx
- **Version alignment** — package, API, CLI, README at v7.0.0

---

## Requirements

- Node.js >= 20
- `GROQ_API_KEY` for AI and agentic features
- API: `npm start` (port 3000)
- Web: `npm run dev` (port 5173, proxies `/api`)

---

## Deployment notes

- **Vercel** hosts the static web build only (`vercel.json`)
- Full-stack demo: set `VITE_API_URL` to a separately hosted API (Railway, Render, IBM Cloud, etc.)

---

## Links

| Resource | URL |
|----------|-----|
| Repository | https://github.com/Gzeu/perchance-ai-prompt-library |
| Live web (static) | https://perchance-ai-prompt-library.vercel.app |
| NPM | https://www.npmjs.com/package/perchance-ai-prompt-library |

---

*Maintained by [George Pricop (@Gzeu)](https://github.com/Gzeu)*
