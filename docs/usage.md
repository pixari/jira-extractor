# Usage Guide

## Quick Start

### CLI - Interactive Mode

```bash
jira-extract
```

The CLI will prompt you for:

- Jira instance URL
- Authentication method
- JQL query
- Output file path

### CLI - Command Line Mode

```bash
jira-extract --url https://your-domain.atlassian.net \
  --email user@example.com \
  --token YOUR_API_TOKEN \
  --jql "project = PROJ AND status = Open" \
  --output issues.json
```

### Programmatic Usage

```typescript
import { JiraClient } from 'jira-extractor';

const client = new JiraClient({
  baseUrl: 'https://your-domain.atlassian.net',
  auth: {
    type: 'basic',
    email: 'user@example.com',
    apiToken: 'your_api_token',
  },
});

// Extract all issues
const issues = await client.searchIssuesAll('project = PROJ');

// Or use async generator for memory efficiency
for await (const issue of client.searchIssues('project = PROJ')) {
  console.log(issue.key, issue.fields.summary);
}
```

## Common Use Cases

### Extract Specific Fields

```bash
jira-extract --jql "project = PROJ" \
  --fields "summary,status,assignee,created,updated"
```

```typescript
const issues = await client.searchIssuesAll('project = PROJ', {
  fields: ['summary', 'status', 'assignee', 'created'],
});
```

### Include Status History

```bash
jira-extract --jql "project = PROJ" \
  --expand "changelog" \
  --output issues-with-history.json
```

```typescript
const issues = await client.searchIssuesAll('project = PROJ', {
  expand: ['changelog'],
});

// Access changelog
issues.forEach((issue) => {
  if (issue.changelog) {
    issue.changelog.histories.forEach((history) => {
      console.log(`${history.created}: ${history.items[0].toString}`);
    });
  }
});
```

### Progress Tracking

```typescript
for await (const issue of client.searchIssues('project = PROJ', {
  onProgress: (progress) => {
    console.log(`${progress.percentage}% (${progress.current}/${progress.total})`);
  },
})) {
  // Process issue
}
```

### Custom Rate Limiting

```typescript
const client = new JiraClient({
  baseUrl: 'https://your-domain.atlassian.net',
  auth: { type: 'basic', email: '...', apiToken: '...' },
  rateLimiting: {
    requestsPerSecond: 5,
    maxConcurrent: 3,
    minDelay: 100,
    retryAttempts: 5,
    retryDelay: 2000,
  },
});
```

## JQL Query Examples

### Recent Issues

```jql
updated >= -7d ORDER BY updated DESC
```

### Open Issues Assigned to You

```jql
assignee = currentUser() AND status != Done
```

### High Priority Bugs

```jql
project = PROJ AND type = Bug AND priority = High
```

### Issues by Sprint

```jql
project = PROJ AND sprint = "Sprint 1"
```

### Complex Query

```jql
project IN (PROJ1, PROJ2) AND
status IN ("In Progress", "To Do") AND
assignee IN (user1, user2) AND
created >= -30d
ORDER BY priority DESC, created DESC
```

Learn more: [JQL Documentation](https://support.atlassian.com/jira-software-cloud/docs/use-advanced-search-with-jira-query-language-jql/)
