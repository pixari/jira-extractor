/**
 * Integration tests for JiraClient
 */

import nock from 'nock';
import { JiraClient } from '../../src/core/JiraClient';
import { JiraConfig } from '../../src/types/config';
import { JiraApiError } from '../../src/utils/error-handler';
import {
  mockSearchResponse,
  mockSearchResponseMultiplePage,
  mockSearchResponsePage2,
  mockSearchResponsePage3,
  mockSearchResponseEmpty,
  mockIssue,
  mockErrorResponse,
  mockAuthErrorResponse,
} from '../fixtures/mock-responses';

// TODO: Fix Nock + Axios 1.x compatibility issue
// See: https://github.com/nock/nock/issues/2183
describe.skip('JiraClient Integration Tests', () => {
  const baseUrl = 'https://test.atlassian.net';
  const config: JiraConfig = {
    baseUrl,
    auth: {
      type: 'basic',
      email: 'test@example.com',
      apiToken: 'test-token',
    },
    rateLimiting: {
      requestsPerSecond: 10, // High rate for tests
      maxConcurrent: 5,
      minDelay: 0,
      retryAttempts: 2,
      retryDelay: 100,
    },
    timeout: 5000,
  };

  beforeEach(() => {
    // Clean all nock interceptors before each test
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Authentication', () => {
    it('should include Basic Auth headers', async () => {
      const scope = nock(baseUrl)
        .get('/rest/api/3/search/jql')
        .query(true)
        .reply(200, mockSearchResponse);

      const client = new JiraClient(config);
      const issues = await client.searchIssuesAll('project = TEST');

      expect(issues).toHaveLength(1);
      scope.done();
    });

    it('should handle authentication errors', async () => {
      nock(baseUrl).get('/rest/api/3/search/jql').query(true).reply(401, mockAuthErrorResponse);

      const client = new JiraClient(config);

      await expect(client.searchIssuesAll('project = TEST')).rejects.toThrow(JiraApiError);
    });
  });

  describe('Search Issues', () => {
    it('should search issues with JQL', async () => {
      nock(baseUrl).get('/rest/api/3/search/jql').query(true).reply(200, mockSearchResponse);

      const client = new JiraClient(config);
      const issues = await client.searchIssuesAll('project = TEST');

      expect(issues).toHaveLength(1);
      expect(issues[0].key).toBe('PROJ-1');
    });

    it('should handle pagination', async () => {
      nock(baseUrl)
        .get('/rest/api/3/search/jql')
        .query(true)
        .reply(200, mockSearchResponseMultiplePage);

      nock(baseUrl).get('/rest/api/3/search/jql').query(true).reply(200, mockSearchResponsePage2);

      nock(baseUrl).get('/rest/api/3/search/jql').query(true).reply(200, mockSearchResponsePage3);

      const client = new JiraClient(config);
      const issues = await client.searchIssuesAll('project = TEST');

      expect(issues).toHaveLength(5);
      expect(issues[0].key).toBe('PROJ-1');
      expect(issues[4].key).toBe('PROJ-5');
    });

    it('should handle empty results', async () => {
      nock(baseUrl).get('/rest/api/3/search/jql').query(true).reply(200, mockSearchResponseEmpty);

      const client = new JiraClient(config);
      const issues = await client.searchIssuesAll('project = EMPTY');

      expect(issues).toHaveLength(0);
    });

    it('should report progress during iteration', async () => {
      nock(baseUrl)
        .get('/rest/api/3/search/jql')
        .query(true)
        .reply(200, mockSearchResponseMultiplePage);

      nock(baseUrl).get('/rest/api/3/search/jql').query(true).reply(200, mockSearchResponsePage2);

      nock(baseUrl).get('/rest/api/3/search/jql').query(true).reply(200, mockSearchResponsePage3);

      const client = new JiraClient(config);
      const progressUpdates: number[] = [];

      const issues = [];
      for await (const issue of client.searchIssues('project = TEST', {
        onProgress: (progress) => {
          progressUpdates.push(progress.percentage);
        },
      })) {
        issues.push(issue);
      }

      expect(issues).toHaveLength(5);
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[progressUpdates.length - 1]).toBe(100);
    });
  });

  describe('Get Single Issue', () => {
    it('should get issue by key', async () => {
      nock(baseUrl).get('/rest/api/3/issue/PROJ-1').query(true).reply(200, mockIssue);

      const client = new JiraClient(config);
      const issue = await client.getIssue('PROJ-1');

      expect(issue.key).toBe('PROJ-1');
      expect(issue.fields.summary).toBe('Test issue');
    });

    it('should handle not found error', async () => {
      nock(baseUrl)
        .get('/rest/api/3/issue/INVALID-1')
        .query(true)
        .reply(404, {
          errorMessages: ['Issue does not exist or you do not have permission to see it.'],
        });

      const client = new JiraClient(config);

      await expect(client.getIssue('INVALID-1')).rejects.toThrow(JiraApiError);
    });
  });

  describe('Test Connection', () => {
    it('should test connection successfully', async () => {
      nock(baseUrl).get('/rest/api/3/myself').reply(200, {
        accountId: 'test-123',
        displayName: 'Test User',
      });

      const client = new JiraClient(config);
      const result = await client.testConnection();

      expect(result).toBe(true);
    });

    it('should fail connection test on error', async () => {
      nock(baseUrl).get('/rest/api/3/myself').reply(401, mockAuthErrorResponse);

      const client = new JiraClient(config);

      await expect(client.testConnection()).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors with detailed messages', async () => {
      nock(baseUrl).get('/rest/api/3/search/jql').query(true).reply(400, mockErrorResponse);

      const client = new JiraClient(config);

      try {
        await client.searchIssuesAll('INVALID JQL');
      } catch (error) {
        expect(error).toBeInstanceOf(JiraApiError);
        if (error instanceof JiraApiError) {
          expect(error.statusCode).toBe(400);
          expect(error.response?.errorMessages).toContain(
            "The value 'INVALID' does not exist for the field 'project'."
          );
        }
      }
    });

    it('should retry on server errors', async () => {
      // First attempt fails with 500
      nock(baseUrl).get('/rest/api/3/search/jql').query(true).reply(500, 'Internal Server Error');

      // Second attempt succeeds
      nock(baseUrl).get('/rest/api/3/search/jql').query(true).reply(200, mockSearchResponse);

      const client = new JiraClient(config);
      const issues = await client.searchIssuesAll('project = TEST');

      expect(issues).toHaveLength(1);
    });

    it('should handle rate limit errors', async () => {
      nock(baseUrl).get('/rest/api/3/search/jql').query(true).reply(429, 'Too Many Requests', {
        'Retry-After': '60',
      });

      nock(baseUrl).get('/rest/api/3/search/jql').query(true).reply(200, mockSearchResponse);

      const client = new JiraClient(config);

      // Should retry after rate limit
      const issues = await client.searchIssuesAll('project = TEST');
      expect(issues).toHaveLength(1);
    });
  });

  describe('Configuration', () => {
    it('should return config', () => {
      const client = new JiraClient(config);
      const returnedConfig = client.getConfig();

      expect(returnedConfig.baseUrl).toBe(config.baseUrl);
      expect(returnedConfig.timeout).toBe(config.timeout);
    });

    it('should return base URL', () => {
      const client = new JiraClient(config);
      expect(client.getBaseUrl()).toBe(baseUrl);
    });

    it('should return rate limiter metrics', async () => {
      nock(baseUrl).get('/rest/api/3/search/jql').query(true).reply(200, mockSearchResponse);

      const client = new JiraClient(config);
      await client.searchIssuesAll('project = TEST');

      const metrics = client.getRateLimiterMetrics();
      expect(metrics.requestsMade).toBeGreaterThan(0);
    });
  });
});
