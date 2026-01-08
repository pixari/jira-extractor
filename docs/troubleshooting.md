# Troubleshooting

## Authentication Issues

### 401 Unauthorized

**Cause:** Invalid credentials

**Solution:**

- Verify email and API token are correct
- Use API token, not password
- Check [API tokens page](https://id.atlassian.com/manage-profile/security/api-tokens)

### 403 Forbidden

**Cause:** Insufficient permissions

**Solution:**

- Verify you have access to the Jira project
- Check project permissions in Jira settings

## Rate Limiting

### 429 Too Many Requests

**Cause:** Exceeding Jira rate limits

**Solution:**

```bash
# Reduce rate limiting
jira-extract --rps 1 --concurrent 1
```

Or in code:

```typescript
const client = new JiraClient({
  // ...
  rateLimiting: {
    requestsPerSecond: 1,
    maxConcurrent: 1,
  },
});
```

## Connection Issues

### ETIMEDOUT / Request Timeout

**Solutions:**

- Check network connection
- Increase timeout in config
- Verify Jira URL is correct

```typescript
const client = new JiraClient({
  // ...
  timeout: 60000, // 60 seconds
});
```

## JQL Errors

### 400 Bad Request - JQL Syntax Error

**Solution:**

- Test JQL in Jira's issue search first
- Check field names are correct
- Use proper JQL syntax

**Common mistakes:**

```jql
# Wrong
project = "PROJ"

# Correct
project = PROJ
```

## Pagination Issues

### Incomplete Results

**Solution:**

- Enable verbose logging: `--verbose`
- Check JQL query returns expected count in Jira
- Verify no network interruptions

## Installation Issues

### Module Not Found

**Solution:**

```bash
npm install --force
rm -rf node_modules package-lock.json
npm install
```

### Husky Hooks Not Working

**Solution:**

```bash
npm run prepare
chmod +x .husky/pre-commit .husky/commit-msg
```

## Performance

### Slow Extraction

**Solutions:**

- Use `--fields` to extract only needed fields
- Increase rate limits (if permitted)
- Use async generator instead of loading all at once

```typescript
// Good - memory efficient
for await (const issue of client.searchIssues(jql)) {
  process(issue);
}

// Avoid - loads all in memory
const issues = await client.searchIssuesAll(jql);
```

## Debug Mode

Enable debug logging:

```bash
# CLI
jira-extract --verbose --jql "project = PROJ"

# Environment variable
DEBUG_PAGINATION=true jira-extract --jql "project = PROJ"
```

## Get Help

- [GitHub Issues](https://github.com/yourusername/jira-extractor/issues)
- Check existing issues for solutions
- Provide debug output when reporting
