# API Reference

## JiraClient

Main class for interacting with Jira API.

### Constructor

```typescript
new JiraClient(config: JiraConfig)
```

### Methods

#### searchIssues()

Async generator for memory-efficient iteration.

```typescript
async *searchIssues(
  jql: string,
  options?: SearchOptions
): AsyncGenerator<JiraIssue>
```

**Example:**

```typescript
for await (const issue of client.searchIssues('project = PROJ')) {
  console.log(issue.key);
}
```

#### searchIssuesAll()

Loads all results into memory.

```typescript
async searchIssuesAll(
  jql: string,
  options?: SearchOptions
): Promise<JiraIssue[]>
```

#### getIssue()

Get a single issue by key.

```typescript
async getIssue(
  issueKey: string,
  fields?: string[]
): Promise<JiraIssue>
```

#### testConnection()

Test connection to Jira.

```typescript
async testConnection(): Promise<boolean>
```

#### getRateLimiterMetrics()

Get current rate limiter metrics.

```typescript
getRateLimiterMetrics(): RateLimiterMetrics
```

## Types

### JiraConfig

```typescript
interface JiraConfig {
  baseUrl: string;
  auth: AuthConfig;
  rateLimiting?: RateLimitConfig;
  timeout?: number;
}
```

### AuthConfig

```typescript
interface AuthConfig {
  type: 'basic' | 'bearer';
  email?: string; // For basic auth
  apiToken?: string; // For basic auth
  token?: string; // For bearer auth
}
```

### RateLimitConfig

```typescript
interface RateLimitConfig {
  requestsPerSecond: number;
  maxConcurrent: number;
  minDelay: number;
  retryAttempts: number;
  retryDelay: number;
}
```

### SearchOptions

```typescript
interface SearchOptions {
  fields?: string[];
  expand?: string[];
  maxResults?: number;
  onProgress?: (progress: ProgressInfo) => void;
}
```

### ProgressInfo

```typescript
interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
  page: number;
}
```

### JiraIssue

```typescript
interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: JiraIssueFields;
  changelog?: JiraChangelog;
}
```

## Rate Limiting Recommendations

| Jira Type          | Requests/sec  | Concurrent    |
| ------------------ | ------------- | ------------- |
| Shared Cloud       | 2             | 2             |
| Dedicated Instance | 5-10          | 3-5           |
| Enterprise         | Consult admin | Consult admin |
