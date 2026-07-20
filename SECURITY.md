# Security Policy

## Supported Versions

| Version | Supported |
|---------|----------|
| 8.x | ✅ Yes |
| < 8.0 | ❌ No |

## Reporting a Vulnerability

Please do **not** open a public issue for security vulnerabilities.

Report security issues privately via GitHub Security Advisories:
https://github.com/Gzeu/perchance-ai-prompt-library/security/advisories/new

Or email directly: pricopgeorge@gmail.com

## Security Notes

- **API keys**: Never commit real API keys. Use `.env` (already in `.gitignore`). The `mcp-config/` files contain only placeholder values.
- **Playwright**: The browser automation only connects to `perchance.ai`. No other URLs are accessed unless explicitly passed via `scrapeUrl`.
- **MCP server**: Runs locally via stdio — no network exposure unless you explicitly forward it.
- **Generated output**: Files are saved to `./output/` which is in `.gitignore`.
