# User Taste
- Prefers extracting complete, runnable source code over static output (images/rendered results), so content can be executed locally and is portable independent of the original platform. Confidence: 0.8
- Delegates execution to the assistant ("leave it to you to run it") and is comfortable with iterative debugging: creating scratchpad test scripts, fixing paths, installing missing dependencies, and retrying until the task works end-to-end. Confidence: 0.85
- Cleans up all temporary debug/scratchpad files after a task is complete, keeping the repository tidy. Confidence: 0.75
- Prefers using official API endpoints over direct web scraping when anti-bot protections (e.g., Cloudflare) block standard approaches — pivots to the API rather than fighting bot detection. Confidence: 0.8
- Security-conscious about jsdom configuration: shares and values documentation about `runScripts: "dangerously"` risks with untrusted content, and prefers data formats that allow parsing without script execution (e.g., JSON in `type="notjs"` script tags). Confidence: 0.7
- Wants clear, step-by-step usage instructions for each available interface (CLI commands, MCP tool schema/examples, programmatic imports) — asks "how do I use this?" repeatedly. Confidence: 0.75
- Prefers programmatic API/function-based interfaces over CLI-only exposure — wants core functionality exported as importable functions (not just runnable via CLI), so it can be called programmatically. Confidence: 0.9
- Expects git commit + push to GitHub as part of the completion workflow — wants changes committed and pushed to GitHub automatically rather than left as local uncommitted work. Confidence: 0.9
- Wants task tracking: expects the assistant to use todo/task lists and mark items as completed when finished, rather than just reporting completion in prose. Confidence: 0.85
- Wants end-to-end workflow automation — prefers that the assistant handles the entire pipeline (coding, testing, committing, pushing, cleanup) automatically as a single flow rather than requesting each step individually. Confidence: 0.8
- Wants visual/web UI interfaces in addition to CLI/MCP/API — proactively asks about UI/UX ("ai creat interfata ui ux ?") and tells the assistant to build it ("executa") when none exists yet, indicating preference for a browser-based visual interface alongside programmatic interfaces. Confidence: 0.85
- Prefers running TypeScript files with `npx tsx` directly, without a separate compilation step — used consistently for scratchpad test scripts and CLi execution. Confidence: 0.8
- Keeps dependencies clean — avoids importing or depending on external AI provider packages (Groq, Polination, OpenAI, Anthropic, etc.) in non-AI-specific projects; explicitly greps source and package.json to verify. Confidence: 0.65
- Prefers flexible input formats — CLI and scraper functions accept both bare identifiers (e.g., generator name "fdqirttayk") and full URLs (e.g., "https://perchance.org/fdqirttayk"), normalizing internally rather than requiring a specific format. Confidence: 0.7
5
