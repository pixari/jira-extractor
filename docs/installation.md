# Installation

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn

## Install as Library

```bash
npm install jira-extractor
```

## Install CLI Globally

```bash
npm install -g jira-extractor
```

## From Source

```bash
git clone https://github.com/yourusername/jira-extractor.git
cd jira-extractor
npm install
npm run build
```

## Jira API Token

1. Go to [Atlassian Account Security](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token**
3. Give it a label and copy the token
4. Use your email and this token for authentication

## Environment Variables (Optional)

Create a `.env` file:

```env
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=user@example.com
JIRA_API_TOKEN=your_api_token
JIRA_RATE_LIMIT_RPS=2
JIRA_MAX_CONCURRENT=2
```
