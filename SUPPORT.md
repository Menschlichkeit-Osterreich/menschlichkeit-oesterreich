# Support

> **Need help with Menschlichkeit Österreich Development?**

This document provides guidance on how to get support for this project.

---

## 📋 Table of Contents

- [Getting Help](#getting-help)
- [Reporting Issues](#reporting-issues)
- [Security Issues](#security-issues)
- [Documentation](#documentation)
- [Community](#community)
- [FAQ](#faq)
- [Contact](#contact)

---

## Getting Help

### Before Asking for Help

1. **Search existing resources:**
   - Check the [Documentation](docs/)
   - Search [existing Issues](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues)
   - Review [Discussions](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/discussions)

2. **Try debugging:**
   - Enable debug mode: `DEBUG=* npm run dev`
   - Check logs: `logs/` directory
   - Run diagnostics: `npm run quality:gates`

3. **Verify your setup:**
   ```bash
   # Check Node.js version
   node --version  # Should be >= 22.0.0
   
   # Check npm version
   npm --version   # Should be >= 10.0.0
   
   # Verify installation
   npm run verify
   ```

### Where to Get Help

#### 💬 GitHub Discussions (Recommended)

For questions, ideas, and general discussion:

- **[Q&A](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/discussions/categories/q-a)** - Ask questions
- **[Ideas](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/discussions/categories/ideas)** - Suggest improvements
- **[Show and Tell](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/discussions/categories/show-and-tell)** - Share what you've built

#### 🐛 GitHub Issues

For bug reports and feature requests:

- Use the appropriate [Issue Template](.github/ISSUE_TEMPLATE/)
- Provide detailed information
- Include reproduction steps

#### 📧 Email Support

For private inquiries:

- **General:** support@menschlichkeit-oesterreich.at
- **Development:** dev@menschlichkeit-oesterreich.at
- **Security:** security@menschlichkeit-oesterreich.at (for security issues only)

---

## Reporting Issues

### Bug Reports

When reporting a bug, please include:

1. **Description:** Clear description of the problem
2. **Steps to reproduce:** Step-by-step instructions
3. **Expected behavior:** What should happen
4. **Actual behavior:** What actually happens
5. **Environment:**
   - OS: (e.g., macOS 14.1, Windows 11, Ubuntu 22.04)
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - Browser: (if applicable)
6. **Logs:** Relevant error messages or logs
7. **Screenshots:** (if applicable)

**Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Environment:**
 - OS: [e.g., macOS 14.1]
 - Node: [e.g., 22.0.0]
 - Browser: [e.g., Chrome 120]

**Additional context**
Add any other context about the problem here.
```

### Feature Requests

When requesting a feature, please include:

1. **Problem:** What problem does this solve?
2. **Solution:** Describe your proposed solution
3. **Alternatives:** Describe alternatives you've considered
4. **Context:** Add any other context

---

## Security Issues

**⚠️ DO NOT report security vulnerabilities through public GitHub issues.**

Please see our [Security Policy](SECURITY.md) for instructions on reporting security vulnerabilities.

**Quick contact:** security@menschlichkeit-oesterreich.at

---

## Documentation

### Official Documentation

- **[README](README.md)** - Project overview and quick start
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Architecture Docs](docs/architecture/)** - System architecture
- **[API Documentation](api.menschlichkeit-oesterreich.at/docs)** - API reference
- **[Deployment Guide](deployment-scripts/README.md)** - Deployment instructions

### Tutorials & Guides

- **[Getting Started](docs/getting-started.md)** - First steps
- **[Development Setup](docs/development-setup.md)** - Local development
- **[Testing Guide](docs/testing-guide.md)** - Writing tests
- **[Deployment Guide](docs/deployment-guide.md)** - Deploying to production

### Code Examples

- **[Examples Directory](examples/)** - Code examples
- **[Tests](tests/)** - Test examples
- **[Scripts](scripts/)** - Utility scripts

---

## Community

### Code of Conduct

We have a [Code of Conduct](CODE_OF_CONDUCT.md) that we expect all community members to follow.

### Communication Channels

- **GitHub Discussions:** For questions and discussions
- **GitHub Issues:** For bugs and feature requests
- **Email:** For private inquiries

### Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md).

---

## FAQ

### General Questions

**Q: What is Menschlichkeit Österreich?**  
A: A comprehensive digital platform for democratic participation, education, and community engagement in Austria.

**Q: What technologies does this project use?**  
A: 
- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend:** FastAPI (Python), Node.js
- **CRM:** Drupal 10 + CiviCRM
- **Database:** PostgreSQL 16, MariaDB
- **Automation:** n8n, Docker

**Q: Is this project open source?**  
A: Please check the [LICENSE](LICENSE) file for licensing information.

### Development Questions

**Q: Which Node.js version should I use?**  
A: Use Node.js 22.x LTS or higher. We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.

**Q: How do I run the project locally?**  
A:
```bash
npm install
npm run dev:all
```

**Q: How do I run tests?**  
A:
```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# All tests
npm run test
```

**Q: How do I check code quality?**  
A:
```bash
npm run quality:gates
```

### Deployment Questions

**Q: How do I deploy to staging?**  
A:
```bash
./build-pipeline.sh staging
```

**Q: How do I deploy to production?**  
A: See the [Deployment Guide](deployment-scripts/README.md) for detailed instructions.

**Q: How do I rollback a deployment?**  
A:
```bash
npm run deploy:rollback
```

### DSGVO/Privacy Questions

**Q: Is this project GDPR compliant?**  
A: Yes, this project follows GDPR/DSGVO requirements. See [Compliance Documentation](docs/compliance/).

**Q: How is personal data handled?**  
A: See our [Privacy Documentation](docs/compliance/PRIVACY.md) for details.

**Q: How do I request data deletion?**  
A: See [Right to Erasure Procedures](docs/compliance/RIGHT-TO-ERASURE-PROCEDURES.md).

### Troubleshooting

**Q: I'm getting "Cannot find module" errors**  
A: Try:
```bash
rm -rf node_modules package-lock.json
npm install
```

**Q: The development server won't start**  
A: Check:
1. Is port 3000 already in use?
2. Are all dependencies installed?
3. Is your `.env` file configured correctly?

**Q: Tests are failing**  
A: Try:
```bash
npm run test:clean
npm run test
```

**Q: Build is failing**  
A: Try:
```bash
npm run clean
npm run build
```

---

## Contact

### Email

- **General Support:** support@menschlichkeit-oesterreich.at
- **Development:** dev@menschlichkeit-oesterreich.at
- **Security:** security@menschlichkeit-oesterreich.at
- **Conduct:** conduct@menschlichkeit-oesterreich.at

### GitHub

- **Issues:** [github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues)
- **Discussions:** [github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/discussions](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/discussions)
- **Pull Requests:** [github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/pulls](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/pulls)

### Response Times

- **Security Issues:** Within 24 hours
- **Bug Reports:** Within 48 hours
- **Feature Requests:** Within 1 week
- **General Questions:** Within 1 week

### Office Hours

For complex issues, we offer virtual office hours:

- **When:** Every Friday, 14:00-16:00 CET/CEST
- **Where:** [GitHub Discussions - Office Hours](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/discussions/categories/office-hours)
- **How:** Post your question beforehand, join the discussion on Friday

---

## Additional Resources

### External Documentation

- **[React Documentation](https://react.dev/)**
- **[TypeScript Documentation](https://www.typescriptlang.org/docs/)**
- **[FastAPI Documentation](https://fastapi.tiangolo.com/)**
- **[Drupal Documentation](https://www.drupal.org/docs)**
- **[PostgreSQL Documentation](https://www.postgresql.org/docs/)**

### Related Projects

- **[CiviCRM](https://civicrm.org/)**
- **[n8n](https://n8n.io/)**
- **[Tailwind CSS](https://tailwindcss.com/)**

---

**Last Updated:** 2025-10-13  
**Version:** 1.0.0  
**Maintainer:** Development Team

---

<div align="center">
  <strong>We're here to help!</strong><br>
  <sub>Don't hesitate to reach out if you need assistance.</sub>
</div>
