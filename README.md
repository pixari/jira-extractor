# Jira Extractor

A TypeScript library and CLI tool for extracting Jira issues using JQL queries with configurable rate limiting.

[![CI](https://github.com/pixari/jira-extractor/actions/workflows/ci.yml/badge.svg)](https://github.com/pixari/jira-extractor/actions/workflows/ci.yml)
[![CodeQL](https://github.com/pixari/jira-extractor/actions/workflows/codeql.yml/badge.svg)](https://github.com/pixari/jira-extractor/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/pixari/jira-extractor/graph/badge.svg)](https://codecov.io/gh/pixari/jira-extractor)
[![npm version](https://img.shields.io/npm/v/jira-extractor.svg)](https://www.npmjs.com/package/jira-extractor)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/node/v/jira-extractor.svg)](https://nodejs.org)

## Features

- 🔍 JQL query support
- 🎨 Beautiful interactive CLI
- ⚡ Configurable rate limiting
- 📦 Memory-efficient streaming
- 🔒 Type-safe TypeScript
- 🔄 Automatic retry logic
- 📊 Real-time progress tracking

## Quick Start

### Installation

```bash
npm install -g jira-extractor
```

### CLI Usage

```bash
# Interactive mode
jira-extract

# Command line mode
jira-extract --url https://company.atlassian.net \
  --email user@example.com \
  --token YOUR_API_TOKEN \
  --jql "project = PROJ AND status = Open" \
  --output issues.json
```

### Programmatic Usage

```typescript
import { JiraClient } from 'jira-extractor';

const client = new JiraClient({
  baseUrl: 'https://company.atlassian.net',
  auth: {
    type: 'basic',
    email: 'user@example.com',
    apiToken: 'your_token',
  },
});

// Extract all issues
const issues = await client.searchIssuesAll('project = PROJ');

// Or stream for memory efficiency
for await (const issue of client.searchIssues('project = PROJ')) {
  console.log(issue.key, issue.fields.summary);
}
```

## Documentation

📚 **[Complete Documentation](docs/)** - Full documentation index

Quick Links:

- **[Installation Guide](docs/installation.md)** - Setup and configuration
- **[Usage Guide](docs/usage.md)** - Examples and common use cases
- **[CLI Reference](docs/cli.md)** - Command-line options
- **[API Reference](docs/api.md)** - Programmatic API
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

**Contributing & Security:**

- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Security Policy](SECURITY.md)** - Report security issues

## Key Capabilities

### Extract Specific Fields

```bash
jira-extract --jql "project = PROJ" \
  --fields "summary,status,assignee,created"
```

### Include Status History

```bash
jira-extract --jql "project = PROJ" \
  --expand "changelog" \
  --output issues-with-history.json
```

### Custom Rate Limiting

```typescript
const client = new JiraClient({
  baseUrl: 'https://company.atlassian.net',
  auth: { type: 'basic', email: '...', apiToken: '...' },
  rateLimiting: {
    requestsPerSecond: 5,
    maxConcurrent: 3,
  },
});
```

## Authentication

Get your API token from [Atlassian Account Security](https://id.atlassian.com/manage-profile/security/api-tokens).

```typescript
// Basic Auth (Recommended)
auth: {
  type: 'basic',
  email: 'user@example.com',
  apiToken: 'your_token'
}

// Bearer Token
auth: {
  type: 'bearer',
  token: 'your_bearer_token'
}
```

## Requirements

- Node.js >= 18.0.0

## Contributing

Contributions welcome! See [Contributing Guide](CONTRIBUTING.md).

This project uses conventional commits enforced by commitlint and husky hooks.

## License

ISC

## Links

- [GitHub Repository](https://github.com/pixari/jira-extractor)
- [Report Issues](https://github.com/pixari/jira-extractor/issues)
- [JQL Documentation](https://support.atlassian.com/jira-software-cloud/docs/use-advanced-search-with-jira-query-language-jql/)
