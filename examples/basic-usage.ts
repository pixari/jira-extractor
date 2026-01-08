/**
 * Basic usage example for Jira Extractor
 */

import { JiraClient } from '../src';
import { writeFile } from 'fs/promises';

async function main() {
  // Create a Jira client with Basic Auth
  const client = new JiraClient({
    baseUrl: 'https://your-domain.atlassian.net',
    auth: {
      type: 'basic',
      email: 'your-email@example.com',
      apiToken: 'your-api-token',
    },
    rateLimiting: {
      requestsPerSecond: 2,
      maxConcurrent: 2,
      minDelay: 200,
      retryAttempts: 3,
      retryDelay: 1000,
    },
  });

  // Test connection
  console.log('Testing connection...');
  const isConnected = await client.testConnection();
  console.log('Connection successful:', isConnected);

  // Define JQL query
  const jql = 'project = MYPROJECT AND status = "In Progress"';
  console.log('Executing JQL:', jql);

  // Option 1: Extract all issues into memory (for smaller datasets)
  console.log('\n=== Option 1: Load all issues ===');
  const allIssues = await client.searchIssuesAll(jql, {
    onProgress: (progress) => {
      console.log(`Progress: ${progress.percentage}% (${progress.current}/${progress.total})`);
    },
  });

  console.log(`Total issues found: ${allIssues.length}`);
  console.log('\nFirst 3 issues:');
  allIssues.slice(0, 3).forEach((issue) => {
    console.log(`- ${issue.key}: ${issue.fields.summary}`);
  });

  // Save to file
  await writeFile('issues.json', JSON.stringify(allIssues, null, 2), 'utf-8');
  console.log('\nSaved to issues.json');

  // Option 2: Stream issues one by one (for larger datasets)
  console.log('\n=== Option 2: Stream issues ===');
  let count = 0;
  for await (const issue of client.searchIssues(jql)) {
    count++;
    console.log(`${count}. ${issue.key}: ${issue.fields.summary}`);

    // Process each issue as it comes
    // This is memory-efficient for large datasets
  }

  console.log(`\nTotal issues processed: ${count}`);

  // Get rate limiter metrics
  const metrics = client.getRateLimiterMetrics();
  console.log('\n=== Rate Limiter Metrics ===');
  console.log('Requests made:', metrics.requestsMade);
  console.log('Requests failed:', metrics.requestsFailed);
  console.log('Average wait time:', metrics.averageWaitTime.toFixed(0), 'ms');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
