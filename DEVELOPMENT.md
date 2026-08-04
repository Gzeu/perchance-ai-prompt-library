# Development Guide

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **npm** or **yarn**
- **Git**
- **TypeScript** (included in devDependencies)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
   cd perchance-ai-prompt-library
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your GROQ_API_KEY
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

### Running in Development Mode

**CLI Development:**
```bash
npm run dev
# This runs the CLI in watch mode with tsx
```

**MCP Server Development:**
```bash
npm run mcp
# This runs the MCP server in development mode
```

**Build and Run:**
```bash
npm run build
npm run mcp:build
# Build and run the compiled MCP server
```

### Testing

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm test -- --watch
```

**Run tests with coverage:**
```bash
npm test -- --coverage
```

**Run specific test file:**
```bash
npm test -- perchanceCore.test.ts
```

### Linting

**Run linter:**
```bash
npm run lint
```

**Auto-fix linting issues:**
```bash
npm run lint -- --fix
```

### Building

**Development build:**
```bash
npm run build
# Outputs to dist/ directory
```

**Production build:**
```bash
npm run build
# Same as development, TypeScript compilation
```

## Project Structure

```
perchance-ai-prompt-library/
├── src/
│   ├── agent/              # Agent layer
│   │   ├── workflows/      # Agent workflows
│   │   ├── universal-interface.ts
│   │   ├── decision-engine.ts
│   │   ├── self-improvement.ts
│   │   ├── batch-coordinator.ts
│   │   ├── autonomous-testing.ts
│   │   └── multi-format-generator.ts
│   ├── cli/                # CLI interface
│   │   └── index.ts
│   ├── core/               # Core functionality
│   │   ├── syntax-builder.ts
│   │   ├── validator.ts
│   │   ├── exporter.ts
│   │   └── weighted-list.ts
│   ├── mcp/                # MCP server
│   │   ├── server.ts
│   │   └── tools/          # MCP tool implementations
│   ├── playwright/         # Browser automation
│   │   ├── perchance-browser.ts
│   │   ├── loader.ts
│   │   ├── roller.ts
│   │   └── scraper.ts
│   ├── types/              # TypeScript definitions
│   │   └── perchance.d.ts
│   └── index.ts            # Main entry point
├── templates/              # Perchance templates
├── tests/                  # Test files
│   └── unit/
├── skills/                 # OpenClaw skill
├── mcp-config/             # MCP configurations
├── dist/                   # Compiled output (generated)
├── package.json
├── tsconfig.json
├── jest.config.ts
└── .env.example
```

## Coding Standards

### TypeScript

- Use **strict mode** TypeScript
- Provide types for all functions
- Use interfaces for object shapes
- Avoid `any` type
- Use JSDoc for public APIs

### Code Style

- Use **ESLint** configuration in `.eslintrc.cjs`
- Follow Airbnb JavaScript style guide (with TypeScript adaptations)
- Use meaningful variable names
- Keep functions small and focused
- Add comments for complex logic

### File Naming

- TypeScript files: `.ts`
- Test files: `.test.ts`
- Use kebab-case for file names
- Match file name to main export

## Adding New Features

### Adding a New CLI Command

1. **Add command in `src/cli/index.ts`**
   ```typescript
   program
     .command('mycommand <arg>')
     .description('Description of command')
     .option('--option', 'Option description')
     .action(async (arg, opts) => {
       // Your implementation
     });
   ```

2. **Create workflow in `src/agent/workflows/`**
   ```typescript
   export async function myWorkflow(input: string): Promise<Result> {
     // Implementation
   }
   ```

3. **Add tests**
   ```typescript
   // tests/unit/myWorkflow.test.ts
   describe('myWorkflow', () => {
     it('should do something', async () => {
       const result = await myWorkflow('test');
       expect(result).toBeDefined();
     });
   });
   ```

4. **Update documentation**
   - Add to CLI reference in README.md
   - Update DEVELOPMENT.md if needed

### Adding a New MCP Tool

1. **Create tool file in `src/mcp/tools/`**
   ```typescript
   export const myTool = {
     schema: {
       name: 'my_tool',
       description: 'Tool description',
       inputSchema: {
         type: 'object',
         properties: {
           param: { type: 'string', description: 'Parameter' }
         },
         required: ['param']
       }
     },
     handler: async (args: any) => {
       // Implementation
       return {
         content: [{ type: 'text', text: 'Result' }]
       };
     }
   };
   ```

2. **Register in `src/mcp/server.ts`**
   ```typescript
   import { myTool } from './tools/my-tool.js';

   const TOOLS = [
     // ... existing tools
     myTool.schema,
   ];

   // Add handler in switch statement
   case 'my_tool':
     return myTool.handler(args ?? {});
   ```

3. **Add tests**
   ```typescript
   // tests/unit/mcp/myTool.test.ts
   describe('myTool', () => {
     it('should handle valid input', async () => {
       const result = await myTool.handler({ param: 'test' });
       expect(result.content).toBeDefined();
     });
   });
   ```

4. **Update documentation**
   - Add to MCP Tools Reference in README.md
   - Update ARCHITECTURE.md if needed

### Adding Agent Workflow

1. **Create workflow in `src/agent/workflows/`**
   ```typescript
   export async function myAgentWorkflow(
     input: WorkflowInput
   ): Promise<WorkflowResult> {
     // Use decision engine, tools, etc.
     const decision = decisionEngine.decideTool(context);
     // Execute workflow
     return result;
   }
   ```

2. **Integrate with universal interface**
   ```typescript
   // In src/agent/universal-interface.ts
   case 'my-action':
     result = await this.handleMyAction(request, decisionPath);
     break;
   ```

3. **Add tests**
   ```typescript
   // Tests for workflow integration
   ```

## Debugging

### CLI Debugging

**Add console logs:**
```typescript
console.log('Debug info:', data);
```

**Use Node.js debugger:**
```bash
node --inspect dist/cli/index.js mycommand
# Then connect with Chrome DevTools or VS Code
```

**VS Code Launch Configuration:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug CLI",
      "program": "${workspaceFolder}/dist/cli/index.js",
      "args": ["create", "test"],
      "preLaunchTask": "npm: build"
    }
  ]
}
```

### MCP Server Debugging

**Enable debug logging:**
```typescript
console.error('Debug:', data); // MCP uses stderr for logging
```

**Test MCP server manually:**
```bash
npm run mcp
# In another terminal, use MCP client to test
```

### Playwright Debugging

**Run with visible browser:**
```bash
PLAYWRIGHT_HEADLESS=false perchance-gen run ./test.perchance
```

**Use Playwright Inspector:**
```bash
npx playwright codegen https://perchance.org
```

## Testing Guidelines

### Unit Tests

- Test individual functions in isolation
- Mock external dependencies (Groq API, Playwright)
- Test edge cases and error conditions
- Keep tests fast and focused

### Integration Tests

- Test module interactions
- Use real implementations where possible
- Test with actual file system operations
- Include setup and teardown

### E2E Tests

- Test complete workflows
- Use real CLI commands
- Mock external services (Groq API)
- Test error recovery

## Performance Considerations

### API Rate Limiting

- Respect Groq API rate limits
- Implement caching where appropriate
- Use batch operations for multiple requests
- Add retry logic for transient failures

### Memory Management

- Clean up resources (browser instances, file handles)
- Use streams for large file operations
- Avoid unnecessary data copying
- Monitor memory usage in long-running processes

### Parallel Processing

- Use Promise.all() for independent operations
- Limit concurrency for rate-limited APIs
- Use worker threads for CPU-intensive tasks
- Implement proper error handling in parallel code

## Common Issues

### Build Errors

**TypeScript compilation errors:**
```bash
# Check TypeScript version
npm list typescript

# Clean build
rm -rf dist/
npm run build
```

**Module resolution errors:**
```bash
# Check tsconfig.json paths
# Ensure all imports use .js extensions (ESM)
```

### Runtime Errors

**Groq API errors:**
- Check GROQ_API_KEY is set
- Verify API key is valid
- Check rate limits
- Review error messages for specific issues

**Playwright errors:**
- Ensure Playwright is installed: `npm install playwright`
- Install browser: `npx playwright install chromium`
- Check PLAYWRIGHT_HEADLESS setting
- Verify network connectivity

### Test Failures

**Environment issues:**
- Ensure .env file is configured
- Check required dependencies are installed
- Verify test configuration in jest.config.ts

**Mock issues:**
- Ensure mocks are properly configured
- Check mock implementations match real behavior
- Verify mock cleanup in afterEach hooks

## Contributing

### Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

3. **Make your changes**
   - Follow coding standards
   - Add tests for new features
   - Update documentation

4. **Run tests and linting**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add my feature"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   # Create PR on GitHub
   ```

### Commit Message Convention

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

Example:
```
feat: add autonomous_generate MCP tool

Implements fully autonomous generator creation with
self-improvement and testing capabilities.
```

## Release Process

1. **Update version in package.json**
2. **Update CHANGELOG.md**
3. **Run full test suite**
4. **Build production version**
5. **Create git tag**
6. **Push to GitHub**
7. **Publish to NPM** (automated via GitHub Actions)

## Additional Resources

- **TypeScript Documentation**: https://www.typescriptlang.org/docs/
- **Node.js Documentation**: https://nodejs.org/docs/
- **MCP Specification**: https://modelcontextprotocol.io/
- **Playwright Documentation**: https://playwright.dev/
- **Groq API Documentation**: https://console.groq.com/docs

## Getting Help

- **GitHub Issues**: https://github.com/Gzeu/perchance-ai-prompt-library/issues
- **Documentation**: README.md, ARCHITECTURE.md, MIGRATION.md
- **Examples**: Check templates/ directory for examples

## Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests added for new features
- [ ] Documentation updated
- [ ] No console.log left in production code
- [ ] Error handling implemented
- [ ] No hardcoded secrets
- [ ] TypeScript types properly defined
- [ ] Tests pass locally
- [ ] Build succeeds
- [ ] Linting passes

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.
