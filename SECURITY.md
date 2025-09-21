# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.3.x   | :white_check_mark: |
| 2.2.x   | :white_check_mark: |
| 2.1.x   | :x:                |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take the security of Perchance AI Prompt Library seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **pricopgeorge@gmail.com**

Please include the following information in your report:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### Response Timeline

- **Initial Response**: Within 48 hours
- **Confirmation**: Within 7 days
- **Fix Timeline**: Critical issues within 30 days, others within 90 days
- **Public Disclosure**: After fix is released and users have time to update

## Security Measures

### Code Security
- Regular dependency audits using `npm audit`
- Automated security scanning with GitHub's Dependabot
- Code review requirements for all changes
- Principle of least privilege in all components

### Dependencies
- We regularly update dependencies to patch known vulnerabilities
- We use `npm audit` to identify and fix security issues
- Dependabot automatically creates PRs for security updates

### CLI Security
- Input validation and sanitization
- No execution of arbitrary code from user input
- Safe file operations with proper path validation
- Limited file system access scope

### Web Interface Security
- CORS configuration
- Input validation
- Rate limiting
- No sensitive data storage in browser

### API Security
- Rate limiting to prevent abuse
- Input validation and sanitization
- No sensitive operations without authentication
- Proper error handling without information disclosure

## Security Best Practices for Users

### Installation
- Always install from official npm registry
- Verify package integrity when possible
- Use specific version numbers in production

### Configuration
- Keep your `.env` file secure and never commit it
- Use strong API tokens when required
- Regularly update to the latest version

### Usage
- Don't share sensitive configuration files
- Be cautious with custom scripts and plugins
- Report suspicious behavior immediately

## Known Security Considerations

### File Operations
- The CLI creates files in user-specified locations
- Configuration files are stored in user's home directory
- Web interface serves static files

### Network Communications
- API calls to Pollinations.ai (when using image generation)
- Web interface runs local server
- No telemetry or tracking by default

### Data Handling
- User prompts are processed locally
- No data is sent to external services without explicit user action
- Configuration and history stored locally

## Security Updates

Security updates will be:
- Released as patch versions
- Documented in CHANGELOG.md
- Announced in GitHub releases
- Communicated via security advisories when necessary

## Contact

For security-related questions or concerns:
- **Email**: pricopgeorge@gmail.com
- **Subject**: [SECURITY] Perchance AI Security Issue

For general questions:
- **GitHub Issues**: https://github.com/Gzeu/perchance-ai-prompt-library/issues
- **GitHub Discussions**: https://github.com/Gzeu/perchance-ai-prompt-library/discussions

---

**Thank you for helping keep Perchance AI Prompt Library and our users safe!**