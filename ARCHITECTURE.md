# Architecture

## Overview

Perchance AI Toolkit v8.0.0 is a focused CLI and MCP toolkit for building Perchance.ai generators. The architecture follows a modular design with clear separation of concerns.

## Core Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Entry Points                             │
├─────────────────────────────────────────────────────────────────┤
│  CLI (perchance-gen)           MCP Server (perchance-mcp)        │
│  src/cli/index.ts              src/mcp/server.ts                 │
└────────────┬──────────────────┬──────────────────┬───────────────┘
             │                  │                  │
             ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Agent Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  Universal Interface      Decision Engine    Autonomous         │
│  (Platform-agnostic)      (Tool selection)   Workflows          │
│  src/agent/               src/agent/         src/agent/          │
│  universal-interface.ts   decision-engine.ts workflows/         │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Core Modules                                │
├─────────────────────────────────────────────────────────────────┤
│  Syntax Builder    Validator    Exporter    Weighted Lists      │
│  src/core/         src/core/    src/core/    src/core/          │
│  syntax-builder.ts validator.ts  exporter.ts  weighted-list.ts  │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
├─────────────────────────────────────────────────────────────────┤
│  Groq AI (LLaMA 3.3)    Playwright (Browser)    Templates       │
│  groq-sdk                playwright              templates/       │
└─────────────────────────────────────────────────────────────────┘
```

## Module Breakdown

### 1. CLI Layer (`src/cli/`)

**Purpose**: Command-line interface for direct user interaction

**Components**:
- `index.ts` - Main CLI entry point using Commander.js
- Commands: `create`, `preview`, `validate`, `run`, `scrape`

**Flow**:
1. Parse command-line arguments
2. Route to appropriate agent workflow
3. Execute and format output
4. Display results to user

### 2. MCP Server (`src/mcp/`)

**Purpose**: Model Context Protocol server for AI agent integration

**Components**:
- `server.ts` - MCP server implementation
- `tools/` - 11 tool implementations
  - `generate-tool.ts` - Basic AI generation
  - `template-tool.ts` - Template browsing
  - `validate-tool.ts` - Syntax validation
  - `playwright-tool.ts` - Live execution
  - `preview-tool.ts` - Local preview
  - `autonomous-generate-tool.ts` - Autonomous creation
  - `batch-generate-tool.ts` - Batch processing
  - `improve-generator-tool.ts` - AI improvement
  - `autonomous-test-tool.ts` - Automated testing
  - `multi-format-tool.ts` - Format selection

**Flow**:
1. Receive tool call from MCP client
2. Parse arguments
3. Route to appropriate handler
4. Execute and return formatted response

### 3. Agent Layer (`src/agent/`)

**Purpose**: Intelligent decision-making and autonomous workflows

**Components**:

#### Universal Interface (`universal-interface.ts`)
- Platform-agnostic API layer
- Detects platform capabilities (Claude Desktop, Devin, OpenClaw, etc.)
- Routes requests to appropriate handlers
- Manages decision paths and metadata

#### Decision Engine (`decision-engine.ts`)
- Analyzes request context
- Selects optimal tools for given task
- Considers platform constraints
- Provides decision rationale

#### Self-Improvement System (`self-improvement.ts`)
- Iterative code refinement
- Quality scoring and convergence detection
- Multi-round improvement cycles
- Validation after each iteration

#### Batch Coordinator (`batch-coordinator.ts`)
- Parallel generation management
- Rate limiting and concurrency control
- Batch result aggregation
- Error handling and retries

#### Autonomous Testing Suite (`autonomous-testing.ts`)
- Automated test scenario execution
- Quality metrics calculation
- Edge case detection
- Regression testing

#### Multi-Format Generator (`multi-format-generator.ts`)
- Format selection (Perchance vs HTML)
- Interactive feature detection
- Visual element generation
- Cross-format compatibility

#### Workflows (`workflows/`)
- `create-generator.ts` - Generator creation workflow
- `improve-generator.ts` - Improvement workflow
- `scrape-and-clone.ts` - Scraping workflow

### 4. Core Modules (`src/core/`)

**Purpose**: Core Perchance syntax manipulation

**Components**:

#### Syntax Builder (`syntax-builder.ts`)
- Constructs `.perchance` syntax
- Handles list creation and formatting
- Manages weighted items
- Supports nested references

#### Validator (`validator.ts`)
- Syntax error detection
- Warning generation
- Statistics calculation
- Import validation

#### Exporter (`exporter.ts`)
- File export functionality
- Clipboard integration
- Preview generation
- Format conversion

#### Weighted List (`weighted-list.ts`)
- Weighted random selection
- Probability distribution
- List manipulation utilities

### 5. Playwright Layer (`src/playwright/`)

**Purpose**: Browser automation for live execution

**Components**:
- `perchance-browser.ts` - Browser controller
- `loader.ts` - Code loading into perchance.org
- `roller.ts` - Result rolling and extraction
- `scraper.ts` - Public generator scraping

**Flow**:
1. Launch Chromium browser
2. Navigate to perchance.org
3. Load code into editor
4. Execute rolls
5. Extract results
6. Clean up and close

### 6. Types (`src/types/`)

**Purpose**: TypeScript type definitions

**Components**:
- `perchance.d.ts` - Perchance syntax types
- Agent interface types
- MCP tool types
- Configuration types

## Data Flow

### CLI Generation Flow
```
User Command → CLI Parser → Agent Workflow → Decision Engine
→ Groq AI → Syntax Builder → Validator → Exporter → User Output
```

### MCP Tool Flow
```
MCP Client → MCP Server → Tool Handler → Agent Layer
→ Core Modules → External Services → Response → MCP Client
```

### Autonomous Workflow Flow
```
Request → Universal Interface → Decision Engine → Generate
→ Validate → Test → (if quality low) → Improve → Validate
→ Final Output
```

## Technology Stack

### Core
- **Node.js** >= 20 - Runtime environment
- **TypeScript** 5.4+ - Type safety
- **ESM** - Module system

### CLI
- **Commander.js** 12.0+ - CLI framework

### MCP
- **@modelcontextprotocol/sdk** 1.0+ - MCP protocol

### AI
- **Groq SDK** 0.7+ - AI generation (LLaMA 3.3)

### Browser Automation
- **Playwright** 1.45+ - Browser control (optional)

### Testing
- **Jest** 29.0+ - Testing framework
- **ts-jest** - TypeScript support

### Code Quality
- **ESLint** 8.0+ - Linting
- **TypeScript ESLint** - TypeScript linting

## Design Patterns

### 1. Strategy Pattern
- Decision engine selects optimal strategy based on context
- Multiple improvement strategies in self-improvement system

### 2. Factory Pattern
- Tool creation in MCP server
- Generator creation in workflows

### 3. Observer Pattern
- Event handling in Playwright automation
- Progress reporting in batch operations

### 4. Builder Pattern
- Syntax builder for constructing Perchance code
- Request builders in agent layer

### 5. Adapter Pattern
- Universal interface adapts to different platforms
- MCP tools adapt core functionality for AI agents

## Error Handling

### Levels
1. **User Errors** - Invalid input, missing parameters
2. **Validation Errors** - Syntax errors, rule violations
3. **Service Errors** - API failures, network issues
4. **System Errors** - Unexpected failures

### Strategy
- Graceful degradation where possible
- Clear error messages
- Retry logic for transient failures
- Logging for debugging

## Performance Considerations

### Optimization
- Lazy loading of Playwright (optional dependency)
- Parallel processing in batch operations
- Caching of validation results
- Rate limiting for API calls

### Scalability
- Stateless MCP server design
- Concurrent request handling
- Resource pooling for browser instances

## Security

### Measures
- Environment variable for API keys
- No hardcoded secrets
- Input validation and sanitization
- Safe browser automation practices

### Best Practices
- Never commit `.env` files
- Use read-only operations where possible
- Sanitize user-generated content
- Validate all external inputs

## Extension Points

### Adding New MCP Tools
1. Create tool file in `src/mcp/tools/`
2. Implement schema and handler
3. Register in `src/mcp/server.ts`
4. Update documentation

### Adding New CLI Commands
1. Add command in `src/cli/index.ts`
2. Create workflow in `src/agent/workflows/`
3. Update CLI reference in README

### Adding New Agent Workflows
1. Create workflow file in `src/agent/workflows/`
2. Integrate with universal interface
3. Add decision engine rules if needed

## Testing Strategy

### Unit Tests
- Core modules (validator, exporter, syntax-builder)
- Tool handlers
- Agent components

### Integration Tests
- MCP server with tool execution
- CLI commands with workflows
- Agent workflow integration

### E2E Tests
- Full CLI workflows
- MCP tool calls end-to-end
- Playwright automation (mocked)

## Deployment

### NPM Package
- Built TypeScript to `dist/`
- Dual binary entry points
- Optional dependencies for Playwright

### MCP Server
- Available via `npx perchance-mcp`
- Requires `GROQ_API_KEY` environment variable
- Stdio transport for communication

### CLI Installation
- Global install via npm
- Single command entry point
- Auto-detects optional dependencies

## Monitoring and Logging

### Current State
- Console output for CLI
- Error logging for MCP server
- Basic progress indicators

### Future Improvements
- Structured logging
- Performance metrics
- Error tracking
- Usage analytics

## Documentation

### Code Documentation
- JSDoc comments for public APIs
- TypeScript types for interfaces
- Inline comments for complex logic

### User Documentation
- README.md - Quick start and reference
- DEVELOPMENT.md - Development setup
- MIGRATION.md - Upgrade guide
- ARCHITECTURE.md - This document

## Contributing

See `DEVELOPMENT.md` for:
- Development setup
- Code style guidelines
- Testing practices
- Pull request process
