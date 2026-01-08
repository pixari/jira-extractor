/**
 * CLI prompts using @clack/prompts
 * Provides beautiful interactive user experience
 */

import * as p from '@clack/prompts';
import { JiraConfig, AuthConfig, RateLimitConfig } from '../types/config';
import { extractErrorMessage } from '../utils/error-handler';

/**
 * Prompt for Jira configuration interactively
 * @returns Complete Jira configuration
 */
export async function promptForConfig(): Promise<JiraConfig> {
  p.intro('Jira Data Extractor');

  const baseUrl = await p.text({
    message: 'What is your Jira instance URL?',
    placeholder: 'https://your-domain.atlassian.net',
    validate: (value) => {
      if (!value) return 'URL is required';
      if (!value.startsWith('https://')) return 'URL must start with https://';
      try {
        new URL(value);
        return undefined;
      } catch {
        return 'Invalid URL format';
      }
    },
  });

  if (p.isCancel(baseUrl)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  // Prompt for authentication
  const auth = await promptForAuth();

  // Ask if user wants to configure rate limiting
  const configureRateLimit = await p.confirm({
    message: 'Configure rate limiting?',
    initialValue: false,
  });

  if (p.isCancel(configureRateLimit)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  let rateLimiting: RateLimitConfig | undefined;
  if (configureRateLimit) {
    rateLimiting = await promptForRateLimiting();
  }

  return {
    baseUrl: baseUrl,
    auth,
    rateLimiting,
    timeout: 30000,
  };
}

/**
 * Prompt for authentication credentials
 * @returns Authentication configuration
 */
async function promptForAuth(): Promise<AuthConfig> {
  const authType = await p.select({
    message: 'Select authentication method:',
    options: [
      { value: 'basic', label: 'Basic Auth (Email + API Token)', hint: 'Recommended' },
      { value: 'bearer', label: 'Bearer Token' },
    ],
  });

  if (p.isCancel(authType)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  if (authType === 'basic') {
    const email = await p.text({
      message: 'Email address:',
      placeholder: 'user@example.com',
      validate: (value) => {
        if (!value) return 'Email is required';
        if (!value.includes('@')) return 'Invalid email format';
        return undefined;
      },
    });

    if (p.isCancel(email)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }

    const apiToken = await p.password({
      message: 'API Token:',
      validate: (value) => {
        if (!value) return 'API token is required';
        return undefined;
      },
    });

    if (p.isCancel(apiToken)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }

    return {
      type: 'basic',
      email: email,
      apiToken: apiToken,
    };
  } else {
    const token = await p.password({
      message: 'Bearer Token:',
      validate: (value) => {
        if (!value) return 'Token is required';
        return undefined;
      },
    });

    if (p.isCancel(token)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }

    return {
      type: 'bearer',
      token: token,
    };
  }
}

/**
 * Prompt for rate limiting configuration
 * @returns Rate limiting configuration
 */
async function promptForRateLimiting(): Promise<RateLimitConfig> {
  const rps = await p.text({
    message: 'Requests per second:',
    placeholder: '2',
    defaultValue: '2',
    validate: (value) => {
      const num = parseFloat(value);
      if (isNaN(num)) return 'Must be a number';
      if (num < 0.1 || num > 100) return 'Must be between 0.1 and 100';
      return undefined;
    },
  });

  if (p.isCancel(rps)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  const concurrent = await p.text({
    message: 'Max concurrent requests:',
    placeholder: '2',
    defaultValue: '2',
    validate: (value) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) return 'Must be a number';
      if (num < 1 || num > 10) return 'Must be between 1 and 10';
      return undefined;
    },
  });

  if (p.isCancel(concurrent)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  return {
    requestsPerSecond: parseFloat(rps),
    maxConcurrent: parseInt(concurrent, 10),
    minDelay: 200,
    retryAttempts: 3,
    retryDelay: 1000,
  };
}

/**
 * Prompt for JQL query
 * @returns JQL query string
 */
export async function promptForJQL(): Promise<string> {
  const jql = await p.text({
    message: 'Enter your JQL query:',
    placeholder: 'project = MYPROJECT AND status = "In Progress"',
    validate: (value) => {
      if (!value || value.trim().length === 0) return 'JQL query is required';
      return undefined;
    },
  });

  if (p.isCancel(jql)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  return jql;
}

/**
 * Prompt for output file path
 * @returns Output file path
 */
export async function promptForOutputPath(): Promise<string> {
  const output = await p.text({
    message: 'Output file path:',
    placeholder: './jira-export.json',
    defaultValue: './jira-export.json',
    validate: (value) => {
      if (!value) return 'Output path is required';
      if (!value.endsWith('.json')) return 'Output file must be a .json file';
      return undefined;
    },
  });

  if (p.isCancel(output)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  return output;
}

/**
 * Show spinner during operation
 * @returns Spinner object
 */
export function startSpinner() {
  return p.spinner();
}

/**
 * Show success message
 * @param message Success message
 */
export function showSuccess(message: string): void {
  p.outro(message);
}

/**
 * Show error message
 * @param error Error to display
 */
export function showError(error: unknown): void {
  const message = extractErrorMessage(error);
  p.cancel(message);
}

/**
 * Show info message with note styling
 * @param message Info message
 */
export function showInfo(message: string): void {
  p.note(message);
}
