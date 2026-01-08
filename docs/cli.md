# CLI Reference

## Command

```bash
jira-extract [options]
```

## Options

| Option               | Description                  | Default              |
| -------------------- | ---------------------------- | -------------------- |
| `--url <url>`        | Jira instance URL            | -                    |
| `--email <email>`    | Email for Basic Auth         | -                    |
| `--token <token>`    | API token for Basic Auth     | -                    |
| `--bearer <token>`   | Bearer token                 | -                    |
| `--jql <query>`      | JQL query                    | -                    |
| `--output <path>`    | Output file path             | `./jira-export.json` |
| `--fields <fields>`  | Comma-separated fields       | All fields           |
| `--expand <items>`   | Comma-separated expand items | -                    |
| `--rps <number>`     | Requests per second          | `2`                  |
| `--concurrent <num>` | Max concurrent requests      | `2`                  |
| `--verbose`          | Enable debug logging         | `false`              |
| `--help, -h`         | Show help                    | -                    |
| `--version, -v`      | Show version                 | -                    |

## Environment Variables

| Variable              | Description              |
| --------------------- | ------------------------ |
| `JIRA_BASE_URL`       | Jira instance URL        |
| `JIRA_EMAIL`          | Email for Basic Auth     |
| `JIRA_API_TOKEN`      | API token for Basic Auth |
| `JIRA_BEARER_TOKEN`   | Bearer token             |
| `JIRA_RATE_LIMIT_RPS` | Requests per second      |
| `JIRA_MAX_CONCURRENT` | Max concurrent requests  |

## Common Fields

```
summary, description, status, priority, assignee, reporter,
creator, created, updated, resolutiondate, duedate, labels,
components, fixVersions, comment, attachment, worklog,
issuetype, project
```

## Expand Items

| Item             | Description                               |
| ---------------- | ----------------------------------------- |
| `changelog`      | Full issue history and status transitions |
| `renderedFields` | HTML-rendered text fields                 |
| `names`          | Field name translations                   |
| `schema`         | Field schema information                  |
| `transitions`    | Available workflow transitions            |

## Examples

### Basic Usage

```bash
jira-extract --url https://company.atlassian.net \
  --email user@example.com \
  --token TOKEN \
  --jql "project = PROJ"
```

### Specific Fields

```bash
jira-extract --jql "project = PROJ" \
  --fields "summary,status,assignee,created"
```

### With Changelog

```bash
jira-extract --jql "project = PROJ" \
  --expand "changelog" \
  --output issues-with-history.json
```

### Using Environment Variables

```bash
export JIRA_BASE_URL=https://company.atlassian.net
export JIRA_EMAIL=user@example.com
export JIRA_API_TOKEN=your_token
jira-extract --jql "assignee = currentUser()"
```

### Custom Rate Limiting

```bash
jira-extract --jql "project = PROJ" \
  --rps 5 \
  --concurrent 3
```
