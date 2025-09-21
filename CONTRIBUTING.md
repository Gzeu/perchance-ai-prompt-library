# Contributing to Perchance AI Prompt Library

🎉 Thank you for considering contributing to our project! We welcome contributions from the community.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork locally
3. **Install** dependencies: `npm install`
4. **Set up** web dependencies: `cd web && npm install`
5. **Create** a feature branch: `git checkout -b feature/amazing-feature`
6. **Make** your changes
7. **Test** your changes: `npm test`
8. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
9. **Push** to your branch: `git push origin feature/amazing-feature`
10. **Open** a Pull Request

## 🏗️ Development Setup

### Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0

### Installation
```bash
# Clone the repository
git clone https://github.com/Gzeu/perchance-ai-prompt-library.git
cd perchance-ai-prompt-library

# Install dependencies
npm install

# Install web dependencies
cd web && npm install && cd ..

# Link for global testing
npm link
```

### Running Tests
```bash
# Run all tests
npm test

# Run CLI tests
npm run test:cli

# Run specific test
npm test -- --testNamePattern="specific test"
```

### Development Scripts
```bash
# Start development server
npm run dev

# Start web interface
cd web && npm run dev

# Run linting
npm run lint

# Test CLI functionality
npm run test:generate
npm run test:batch
```

## 📋 Contribution Guidelines

### 🎨 Adding New Art Styles
1. Edit `src/data/styles.json`
2. Follow the existing structure:
```json
{
  "key": "style_name",
  "name": "Display Name",
  "description": "Detailed description",
  "category": "Category",
  "tags": ["tag1", "tag2"],
  "variables": ["variable1", "variable2"],
  "artists": ["Artist Name"],
  "examples": ["example1", "example2"],
  "popularity": 85,
  "recommended": true
}
```
3. Add appropriate test cases
4. Update documentation

### 👨‍🎨 Adding Artists
1. Edit `src/data/artists.json`
2. Include: name, period, country, popularity, keywords
3. Ensure historical accuracy

### 🎯 Adding Subjects or Themes
1. Edit respective JSON files in `src/data/`
2. Maintain consistent structure
3. Add relevant categories and descriptions

### 🐛 Bug Fixes
1. **Identify** the issue clearly
2. **Write** a failing test if possible
3. **Fix** the issue
4. **Ensure** tests pass
5. **Update** documentation if needed

### ✨ New Features
1. **Discuss** major features in an issue first
2. **Follow** existing code patterns
3. **Add** comprehensive tests
4. **Update** documentation
5. **Consider** backward compatibility

## 🧪 Testing Guidelines

### Test Categories
- **Unit Tests**: Individual functions and components
- **Integration Tests**: CLI commands and workflows
- **E2E Tests**: Complete user scenarios

### Writing Tests
```javascript
// Example test structure
describe('PromptGenerator', () => {
  it('should generate valid prompts', () => {
    const generator = new PromptGenerator();
    const result = generator.generate('anime', 'warrior');
    
    expect(result).toBeDefined();
    expect(result.text).toContain('warrior');
    expect(result.metadata.style).toBe('anime');
  });
});
```

## 📝 Code Style

### JavaScript Style Guide
- Use **ES6+** features
- **Semicolons** required
- **2 spaces** for indentation
- **camelCase** for variables and functions
- **PascalCase** for classes
- **Descriptive** variable names

### Commit Message Format
We follow [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
- `feat(cli): add fuzzy search for styles`
- `fix(generator): resolve quality calculation bug`
- `docs(readme): update installation instructions`

## 🎯 Areas Needing Contribution

### High Priority
- 🎨 **More art styles** (especially regional/cultural styles)
- 🧪 **Test coverage** improvement
- 📖 **Documentation** expansion
- 🌐 **Internationalization** (i18n)
- 🔧 **Performance** optimizations

### Medium Priority
- 🤖 **Discord bot** enhancements
- 📊 **Analytics** features
- 🎵 **Audio prompt** generation
- 📱 **Mobile web** interface
- 🔌 **Plugin system**

### Beginner Friendly
- 📝 **Documentation** improvements
- 🎨 **CSS/UI** enhancements
- 🧹 **Code cleanup**
- 📋 **Example** additions
- 🏷️ **Issue labeling**

## 🤝 Community Guidelines

### Code of Conduct
- Be **respectful** and **inclusive**
- **Help** newcomers
- **Constructive** feedback only
- **Focus** on the project goals
- **Follow** GitHub's Terms of Service

### Getting Help
- 💬 **GitHub Discussions** for questions
- 🐛 **GitHub Issues** for bugs
- 📧 **Email** for private matters
- 📖 **Documentation** for guides

### Recognition
Contributors will be:
- ⭐ **Listed** in CONTRIBUTORS.md
- 🏆 **Mentioned** in release notes
- 💝 **Appreciated** in community updates

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making Perchance AI Prompt Library better! 🎨✨**