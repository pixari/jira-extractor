#!/usr/bin/env node

/**
 * CLI entry point for Jira Extractor
 * Supports both interactive and command-line modes
 */

import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import { JiraClient } from '../core/JiraClient';
import { JiraConfig, AuthConfig, RateLimitConfig } from '../types/config';
import { JiraIssue } from '../types/jira';
import {
  promptForConfig,
  promptForJQL,
  promptForOutputPath,
  startSpinner,
  showSuccess,
  showError,
  showInfo,
} from './prompts';

// Load environment variables
dotenv.config();

/**
 * Parse command line arguments
 */
function parseArgs(): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  const rawArgs = process.argv.slice(2);

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = rawArgs[i + 1];

      if (nextArg && !nextArg.startsWith('--')) {
        args[key] = nextArg;
        i++;
      } else {
        args[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      const nextArg = rawArgs[i + 1];

      if (nextArg && !nextArg.startsWith('-')) {
        args[key] = nextArg;
        i++;
      } else {
        args[key] = true;
      }
    }
  }

  return args;
}

/**
 * Get configuration from environment variables and CLI args
 */
function getConfigFromEnv(args: Record<string, string | boolean>): Partial<JiraConfig> | null {
  const baseUrl = (args.url as string) || process.env.JIRA_BASE_URL;
  const email = (args.email as string) || process.env.JIRA_EMAIL;
  const apiToken = (args.token as string) || process.env.JIRA_API_TOKEN;
  const bearerToken = (args.bearer as string) || process.env.JIRA_BEARER_TOKEN;

  // Check if we have enough info for non-interactive mode
  if (!baseUrl) {
    return null;
  }

  let auth: AuthConfig | undefined;

  if (bearerToken) {
    auth = {
      type: 'bearer',
      token: bearerToken,
    };
  } else if (email && apiToken) {
    auth = {
      type: 'basic',
      email,
      apiToken,
    };
  }

  if (!auth) {
    return null;
  }

  // Build rate limiting config
  const rateLimiting: RateLimitConfig = {
    requestsPerSecond: parseFloat((args.rps as string) || process.env.JIRA_RATE_LIMIT_RPS || '2'),
    maxConcurrent: parseInt(
      (args.concurrent as string) || process.env.JIRA_MAX_CONCURRENT || '2',
      10
    ),
    minDelay: 200,
    retryAttempts: 3,
    retryDelay: 1000,
  };

  return {
    baseUrl,
    auth,
    rateLimiting,
    timeout: 30000,
  };
}

/**
 * Extract issues and save to file
 */
async function extractIssues(
  client: JiraClient,
  jql: string,
  outputPath: string,
  fields?: string[],
  expand?: string[],
  verbose = false
): Promise<{ issueCount: number; duration: number }> {
  const startTime = Date.now();
  const issues: JiraIssue[] = [];

  // Create progress callback
  const spinner = startSpinner();
  spinner.start('Extracting Jira issues...');

  let lastUpdate = Date.now();
  const updateInterval = 500; // Update spinner every 500ms
  let lastTotal = 0;

  try {
    for await (const issue of client.searchIssues(jql, {
      fields,
      expand,
      onProgress: (progress) => {
        const now = Date.now();
        if (now - lastUpdate > updateInterval) {
          spinner.message(
            `Extracting issues... ${progress.current}/${progress.total} (${progress.percentage}%)`
          );
          lastUpdate = now;
          lastTotal = progress.total;
        }
        if (verbose) {
          // eslint-disable-next-line no-console
          console.log(`Page ${progress.page}: ${progress.current}/${progress.total}`);
        }
      },
    })) {
      issues.push(issue);
      if (verbose && issues.length % 50 === 0) {
        // eslint-disable-next-line no-console
        console.log(`Collected ${issues.length} issues so far...`);
      }
    }

    if (verbose) {
      // eslint-disable-next-line no-console
      console.log(`\nTotal issues collected: ${issues.length}`);
      // eslint-disable-next-line no-console
      console.log(`Expected total: ${lastTotal}`);
    }

    // Save to file
    const outputFilePath = resolve(outputPath);
    await writeFile(outputFilePath, JSON.stringify(issues, null, 2), 'utf-8');

    const duration = Date.now() - startTime;
    spinner.stop(
      `Successfully extracted ${issues.length} issues in ${(duration / 1000).toFixed(1)}s`
    );

    return {
      issueCount: issues.length,
      duration,
    };
  } catch (error) {
    spinner.stop('Failed to extract issues');
    throw error;
  }
}

/**
 * Show help message
 */
function showHelp(): void {
  // eslint-disable-next-line no-console
  console.log(`
Jira Data Extractor - Extract Jira issues using JQL queries

Usage:
  jira-extract [options]

Options:
  --url <url>          Jira instance URL (e.g., https://company.atlassian.net)
  --email <email>      Email for Basic Auth
  --token <token>      API token for Basic Auth
  --bearer <token>     Bearer token for authentication
  --jql <query>        JQL query to search for issues
  --output <path>      Output file path (default: ./jira-export.json)
  --fields <fields>    Comma-separated list of fields to extract (default: all fields)
  --expand <items>     Comma-separated list of items to expand (e.g., changelog,renderedFields)
  --rps <number>       Requests per second (default: 2)
  --concurrent <num>   Max concurrent requests (default: 2)
  --verbose            Enable verbose logging for debugging
  --help, -h           Show this help message
  --version, -v        Show version

Environment Variables:
  JIRA_BASE_URL        Jira instance URL
  JIRA_EMAIL           Email for Basic Auth
  JIRA_API_TOKEN       API token for Basic Auth
  JIRA_BEARER_TOKEN    Bearer token for authentication
  JIRA_RATE_LIMIT_RPS  Requests per second
  JIRA_MAX_CONCURRENT  Max concurrent requests

Examples:
  # Interactive mode
  jira-extract

  # With command-line arguments
  jira-extract --url https://company.atlassian.net \\
    --email user@example.com \\
    --token YOUR_API_TOKEN \\
    --jql "project = PROJ AND status = Open" \\
    --output issues.json

  # Extract specific fields only
  jira-extract --jql "project = PROJ" \\
    --fields "summary,status,assignee,created,updated,description"

  # Include status history (changelog)
  jira-extract --jql "project = PROJ" \\
    --expand "changelog"

  # Combine fields and changelog
  jira-extract --jql "project = PROJ" \\
    --fields "summary,status,assignee,created" \\
    --expand "changelog"

  # Using environment variables
  export JIRA_BASE_URL=https://company.atlassian.net
  export JIRA_EMAIL=user@example.com
  export JIRA_API_TOKEN=your_token
  jira-extract --jql "assignee = currentUser()"

Common Fields:
  summary, description, status, priority, assignee, reporter, creator,
  created, updated, resolutiondate, duedate, labels, components, fixVersions,
  comment, attachment, worklog, issuetype, project

Common Expand Items:
  changelog        - Full issue history including status transitions
  renderedFields   - HTML-rendered versions of text fields
  names            - Field name translations
  schema           - Field schema information
  transitions      - Available workflow transitions
`);
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  const args = parseArgs();

  // Show help
  if (args.help || args.h) {
    showHelp();
    process.exit(0);
  }

  // Show version
  if (args.version || args.v) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    const pkg = require('../../package.json');
    // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
    console.log(`v${pkg.version}`);
    process.exit(0);
  }

  try {
    // Try to get config from env/args
    const envConfig = getConfigFromEnv(args);
    const jqlFromArgs = args.jql as string | undefined;
    const outputFromArgs = (args.output as string) || './jira-export.json';
    const fieldsFromArgs = args.fields as string | undefined;
    const expandFromArgs = args.expand as string | undefined;
    const verbose = args.verbose === true;

    // Parse fields if provided
    const fields = fieldsFromArgs ? fieldsFromArgs.split(',').map((f) => f.trim()) : undefined;

    // Parse expand if provided
    const expand = expandFromArgs ? expandFromArgs.split(',').map((e) => e.trim()) : undefined;

    let config: JiraConfig;
    let jql: string;
    let outputPath: string;

    // Determine if we can run in non-interactive mode
    if (envConfig && jqlFromArgs) {
      // Non-interactive mode
      config = envConfig as JiraConfig;
      jql = jqlFromArgs;
      outputPath = outputFromArgs;

      showInfo(`Jira URL: ${config.baseUrl}`);
      showInfo(`JQL: ${jql}`);
      showInfo(`Output: ${outputPath}`);
      if (fields) {
        showInfo(`Fields: ${fields.join(', ')}`);
      }
      if (expand) {
        showInfo(`Expand: ${expand.join(', ')}`);
      }
    } else {
      // Interactive mode
      config = await promptForConfig();

      // Test connection
      const testSpinner = startSpinner();
      testSpinner.start('Testing connection to Jira...');

      const client = new JiraClient(config);
      try {
        await client.testConnection();
        testSpinner.stop('Connection successful');
      } catch (error) {
        testSpinner.stop('Connection failed');
        showError(error);
        process.exit(1);
      }

      jql = await promptForJQL();
      outputPath = await promptForOutputPath();
    }

    // Create client and extract issues
    const client = new JiraClient(config);
    const result = await extractIssues(client, jql, outputPath, fields, expand, verbose);

    // Show summary
    const metrics = client.getRateLimiterMetrics();
    showSuccess(
      `Extracted ${result.issueCount} issues to ${outputPath}\n` +
        `Duration: ${(result.duration / 1000).toFixed(1)}s\n` +
        `Requests made: ${metrics.requestsMade}\n` +
        `Average wait time: ${metrics.averageWaitTime.toFixed(0)}ms`
    );
  } catch (error) {
    showError(error);
    process.exit(1);
  }
}

// Run CLI
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
