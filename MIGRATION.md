# Migration Guide: v7.0.0 → v8.0.0

## Overview

Version 8.0.0 represents a complete architectural shift from a full-stack platform with web interface to a focused CLI + MCP toolkit. This guide helps you migrate from v7.0.0 to v8.0.0.

## Breaking Changes

### 1. Web Interface Removed

**v7.0.0**: Full React + Vite web interface with multiple pages
**v8.0.0**: Web interface completely removed

**Impact**:
- No more web UI for generator creation
- No more web-based Perchance Studio
- No more API server endpoints

**Migration**:
- Use CLI commands instead: `perchance-gen create`, `perchance-gen preview`, etc.
- Use MCP server for AI agent integration
- Use Perchance.org directly for manual editing

### 2. API Server Removed

**v7.0.0**: REST API with endpoints like `/api/perchance/generate`
**v8.0.0**: No API server

**Impact**:
- Direct HTTP API calls no longer work
- Web applications using the API will break

**Migration**:
- Use MCP server for AI agent integration
- Use CLI for programmatic access
- Implement your own API wrapper if needed using the CLI

### 3. Discord Bot Removed

**v7.0.0**: Discord bot integration
**v8.0.0**: Discord bot moved to separate repository (if needed)

**Impact**:
- Discord slash commands no longer available
- Bot integration must be rebuilt

**Migration**:
- Use MCP server with Discord-compatible AI agents
- Or rebuild Discord bot using CLI commands

### 4. Ultra Agentic System Changed

**v7.0.0**: Multi-agent brainstorm system with REST API
**v8.0.0**: Autonomous agent workflows via MCP + CLI

**Impact**:
- API endpoints for agentic features removed
- Different workflow structure

**Migration**:
- Use `autonomous_generate` MCP tool
- Use agent workflows in CLI
- See new agent layer documentation

### 5. Environment Variables Simplified

**v7.0.0**: Complex `.env` with many options (POLLINATIONS_TOKEN, DB_PATH, etc.)
**v8.0.0**: Simplified to just `GROQ_API_KEY` and `PLAYWRIGHT_HEADLESS`

**Impact**:
- Some environment variables no longer read
- Configuration options reduced

**Migration**:
- Update your `.env` file to new format
- Remove unused variables
- See `.env.example` for current format

## New Features

### 1. Enhanced MCP Server

**v8.0.0**: 11 MCP tools (vs 5 in v7.0.0)

New tools:
- `autonomous_generate` - Fully autonomous generator creation
- `batch_generate` - Parallel batch generation
- `improve_generator` - AI-powered improvement
- `autonomous_test` - Automated testing suite
- `multi_format_generate` - Optimal format selection

### 2. Agent Layer

**v8.0.0**: New intelligent agent system

Components:
- Universal Interface - Platform-agnostic API
- Decision Engine - Intelligent tool selection
- Self-Improvement System - Iterative refinement
- Batch Coordinator - Parallel processing
- Autonomous Testing Suite - Quality assurance

### 3. Enhanced CLI

**v8.0.0**: Improved CLI with better error handling and features

Improvements:
- Better progress indicators
- Improved error messages
- Enhanced validation
- Better clipboard integration

## Migration Steps

### For CLI Users

1. **Update Installation**
   ```bash
   npm uninstall -g perchance-ai-prompt-library
   npm install -g perchance-ai-prompt-library@latest
   ```

2. **Update Environment**
   ```bash
   # Old .env (v7.0.0)
   POLLINATIONS_TOKEN=xxx
   NODE_ENV=development
   PORT=3000
   DB_PATH=./data/prompts.db
   # ... many more

   # New .env (v8.0.0)
   GROQ_API_KEY=your_groq_key
   PLAYWRIGHT_HEADLESS=true
   ```

3. **Update Commands**
   ```bash
   # Old (v7.0.0 - via API)
   curl -X POST http://localhost:3000/api/perchance/generate \
     -d '{"topic": "fantasy tavern"}'

   # New (v8.0.0 - via CLI)
   perchance-gen create "fantasy tavern"
   ```

### For MCP Users

1. **Update MCP Config**
   ```json
   // claude_desktop_config.json
   {
     "mcpServers": {
       "perchance": {
         "command": "npx",
         "args": ["perchance-mcp"],
         "env": { "GROQ_API_KEY": "your-key" }
       }
     }
   }
   ```

2. **Update Tool Calls**
   ```python
   # Old (v7.0.0)
   await mcp.call_tool("generate_perchance", {
     "topic": "fantasy tavern",
     "category": "names"
   })

   # New (v8.0.0) - with autonomous option
   await mcp.call_tool("autonomous_generate", {
     "topic": "fantasy tavern",
     "category": "names",
     "requireTesting": true
   })
   ```

### For Web Application Developers

1. **Remove API Dependencies**
   - Remove calls to `/api/perchance/*` endpoints
   - Remove web interface dependencies

2. **Implement Alternative Integration**
   ```javascript
   // Option 1: Use CLI via child_process
   const { exec } = require('child_process');
   exec('perchance-gen create "fantasy tavern"', (error, stdout) => {
     if (error) console.error(error);
     console.log(stdout);
   });

   // Option 2: Use MCP server
   // Implement MCP client in your application
   // Or use existing MCP client libraries

   // Option 3: Build your own API wrapper
   // Use the CLI commands and wrap them in your API
   ```

### For Discord Bot Users

1. **Rebuild Bot Integration**
   ```javascript
   // Old (v7.0.0) - Built-in Discord bot
   // Use existing slash commands

   // New (v8.0.0) - Build custom bot
   const { exec } = require('child_process');

   // In your Discord bot command handler
   async function handleGenerateCommand(interaction) {
     const topic = interaction.options.getString('topic');
     exec(`perchance-gen create "${topic}"`, (error, stdout) => {
       if (error) {
         interaction.reply('Error generating generator');
         return;
       }
       interaction.reply(stdout);
     });
   }
   ```

## Compatibility Matrix

| Feature | v7.0.0 | v8.0.0 | Migration Path |
|---------|--------|--------|----------------|
| CLI Commands | ✅ | ✅ | Direct upgrade |
| MCP Server | ✅ (5 tools) | ✅ (11 tools) | Update tool calls |
| Web Interface | ✅ | ❌ | Use CLI or MCP |
| REST API | ✅ | ❌ | Use CLI or MCP |
| Discord Bot | ✅ | ❌ | Rebuild with CLI |
| Environment Variables | Complex | Simple | Update .env |
| Templates | ✅ | ✅ | No change |
| Playwright | ✅ | ✅ | No change |

## Rollback Plan

If you need to rollback to v7.0.0:

```bash
npm uninstall -g perchance-ai-prompt-library
npm install -g perchance-ai-prompt-library@7.0.0

# Restore your old .env file
# Restore web interface if you had custom changes
```

**Note**: v7.0.0 will remain available on NPM but will not receive updates.

## Support

If you encounter issues during migration:

1. Check this guide for common problems
2. Review ARCHITECTURE.md for new system design
3. Check DEVELOPMENT.md for setup instructions
4. Open an issue on GitHub with:
   - Version you're migrating from
   - Specific error or problem
   - Steps to reproduce

## Summary

Key takeaways for migration:

- **Web interface is gone** - Use CLI or MCP instead
- **API server is gone** - Use CLI or MCP instead
- **Environment simplified** - Update your .env
- **MCP enhanced** - More tools and better workflows
- **Agent layer added** - New intelligent automation

The v8.0.0 release focuses on CLI + MCP integration, which is the future direction for AI agent tooling. While this removes some convenience features, it provides a more focused and maintainable toolkit.
