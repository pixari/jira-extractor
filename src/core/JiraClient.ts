import axios, { AxiosInstance, AxiosError } from 'axios';
import pRetry from 'p-retry';
import { JiraConfig, RateLimitConfig } from '../types/config';
import { JiraIssue, JiraJQLSearchResponse, SearchOptions, JiraErrorResponse } from '../types/jira';
import { AuthManager } from './AuthManager';
import { RateLimiter } from './RateLimiter';
import {
  JiraApiError,
  NetworkError,
  getErrorMessageForStatus,
  isRetryableError,
} from '../utils/error-handler';

const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  requestsPerSecond: 2,
  maxConcurrent: 2,
  minDelay: 200,
  retryAttempts: 3,
  retryDelay: 1000,
};

/**
 * Client for interacting with the Jira API.
 *
 * @example
 * ```typescript
 * const client = new JiraClient({
 *   baseUrl: 'https://company.atlassian.net',
 *   auth: {
 *     type: 'basic',
 *     email: 'user@example.com',
 *     apiToken: 'your_token',
 *   },
 * });
 *
 * // Extract all issues
 * const issues = await client.searchIssuesAll('project = PROJ');
 *
 * // Stream issues for memory efficiency
 * for await (const issue of client.searchIssues('project = PROJ')) {
 *   console.log(issue.key);
 * }
 * ```
 */
export class JiraClient {
  private readonly axios: AxiosInstance;
  private readonly authManager: AuthManager;
  private readonly rateLimiter: RateLimiter;
  private readonly config: JiraConfig;

  constructor(config: JiraConfig) {
    this.config = config;
    this.authManager = new AuthManager(config.auth);

    const rateLimitConfig = config.rateLimiting ?? DEFAULT_RATE_LIMIT_CONFIG;
    this.rateLimiter = new RateLimiter(rateLimitConfig);

    this.axios = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...this.authManager.getAuthHeaders(),
      },
    });

    this.axios.interceptors.request.use(
      async (config) => {
        await this.rateLimiter.acquire();
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.rateLimiter.recordFailure();
        return Promise.reject(this.handleAxiosError(error));
      }
    );
  }

  /**
   * Search for issues using JQL with streaming results.
   *
   * Returns an async generator for memory-efficient processing of large result sets.
   *
   * @param jql - JQL query string (e.g., "project = PROJ AND status = Open")
   * @param options - Search options including fields, expand, and progress callback
   * @yields Individual Jira issues
   *
   * @example
   * ```typescript
   * for await (const issue of client.searchIssues('project = PROJ', {
   *   fields: ['summary', 'status'],
   *   onProgress: (p) => console.log(`${p.percentage}%`)
   * })) {
   *   console.log(issue.key, issue.fields.summary);
   * }
   * ```
   */
  async *searchIssues(
    jql: string,
    options: SearchOptions = {}
  ): AsyncGenerator<JiraIssue, void, undefined> {
    const retryConfig = this.config.rateLimiting ?? DEFAULT_RATE_LIMIT_CONFIG;

    let pageToken: string | undefined = undefined;
    let isLast = false;
    let pageNumber = 0;
    let fetchedCount = 0;
    let totalCount: number | undefined = undefined;

    while (!isLast) {
      pageNumber++;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const page = await pRetry<JiraJQLSearchResponse>(
        async () => {
          return this.fetchJQLPage(jql, {
            ...options,
            pageToken,
          });
        },
        {
          retries: retryConfig.retryAttempts,
          minTimeout: retryConfig.retryDelay,
          maxTimeout: retryConfig.retryDelay * 4,
          factor: 2,
          onFailedAttempt: (error) => {
            if (!isRetryableError(error)) {
              throw error;
            }
          },
        }
      );

      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      isLast = page.isLast;
      pageToken = page.nextPageToken;

      if (isLast) {
        totalCount = fetchedCount + page.issues.length;
      } else if (page.issues.length === 100) {
        totalCount = fetchedCount + page.issues.length + 100;
      } else {
        totalCount = fetchedCount + page.issues.length;
      }

      for (const issue of page.issues) {
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        fetchedCount++;

        if (options.onProgress) {
          options.onProgress({
            current: fetchedCount,
            total: totalCount,
            percentage: totalCount > 0 ? Math.round((fetchedCount / totalCount) * 100) : 0,
            page: pageNumber,
          });
        }

        yield issue;
      }
    }

    if (options.onProgress && totalCount) {
      options.onProgress({
        current: fetchedCount,
        total: totalCount,
        percentage: 100,
        page: pageNumber,
      });
    }
  }

  /**
   * Search for all issues and return as an array.
   *
   * Warning: Loads all results into memory. For large result sets, use `searchIssues()` instead.
   *
   * @param jql - JQL query string
   * @param options - Search options
   * @returns Array of all matching issues
   *
   * @example
   * ```typescript
   * const issues = await client.searchIssuesAll('project = PROJ', {
   *   fields: ['summary', 'status']
   * });
   * console.log(`Found ${issues.length} issues`);
   * ```
   */
  async searchIssuesAll(jql: string, options: SearchOptions = {}): Promise<JiraIssue[]> {
    const issues: JiraIssue[] = [];

    for await (const issue of this.searchIssues(jql, options)) {
      issues.push(issue);
    }

    return issues;
  }

  private async fetchJQLPage(
    jql: string,
    options: SearchOptions = {}
  ): Promise<JiraJQLSearchResponse> {
    const params: Record<string, unknown> = {
      jql,
      maxResults: options.maxResults ?? 100,
    };

    if (options.pageToken) {
      params.nextPageToken = options.pageToken;
    }

    if (options.fields && options.fields.length > 0) {
      params.fields = options.fields.join(',');
    }

    if (options.expand && options.expand.length > 0) {
      params.expand = options.expand.join(',');
    }

    const response = await this.axios.get<JiraJQLSearchResponse>('/rest/api/3/search/jql', {
      params,
    });

    // Axios response.data is typed generically but ESLint strict mode flags it
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: JiraJQLSearchResponse = response.data;

    if (process.env.DEBUG_PAGINATION === 'true') {
      /* eslint-disable no-console, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      console.log('[JiraClient Debug] Raw API response keys:', Object.keys(data));
      console.log('[JiraClient Debug] Response:', {
        issueCount: data.issues.length,
        isLast: data.isLast,
        hasNextPageToken: !!data.nextPageToken,
      });
      /* eslint-enable no-console, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data;
  }

  /**
   * Get a single issue by its key.
   *
   * @param issueKey - Issue key (e.g., "PROJ-123")
   * @param fields - Optional array of fields to include
   * @returns The requested issue
   *
   * @example
   * ```typescript
   * const issue = await client.getIssue('PROJ-123', ['summary', 'status']);
   * console.log(issue.fields.summary);
   * ```
   */
  async getIssue(issueKey: string, fields?: string[]): Promise<JiraIssue> {
    await this.rateLimiter.acquire();

    const params: Record<string, unknown> = {};
    if (fields && fields.length > 0) {
      params.fields = fields.join(',');
    }

    const response = await this.axios.get<JiraIssue>(`/rest/api/3/issue/${issueKey}`, {
      params,
    });

    return response.data;
  }

  /**
   * Test the connection to Jira by fetching current user information.
   *
   * @returns True if connection is successful
   * @throws {JiraApiError} If authentication or connection fails
   *
   * @example
   * ```typescript
   * try {
   *   await client.testConnection();
   *   console.log('Connected to Jira successfully');
   * } catch (error) {
   *   console.error('Connection failed:', error.message);
   * }
   * ```
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.rateLimiter.acquire();
      await this.axios.get('/rest/api/3/myself');
      return true;
    } catch (error) {
      if (error instanceof JiraApiError) {
        throw error;
      }
      throw new NetworkError('Failed to connect to Jira', error as Error);
    }
  }

  /**
   * Get current authenticated user information.
   *
   * @returns Current user data from Jira
   */
  async getCurrentUser(): Promise<unknown> {
    await this.rateLimiter.acquire();
    const response = await this.axios.get<unknown>('/rest/api/3/myself');
    return response.data;
  }

  private handleAxiosError(error: AxiosError): Error {
    if (error.response) {
      const statusCode = error.response.status;
      const data = error.response.data as JiraErrorResponse;
      const message = getErrorMessageForStatus(statusCode);
      return new JiraApiError(message, statusCode, data);
    } else if (error.request) {
      return new NetworkError(
        'No response from Jira server. Please check your network connection.',
        error
      );
    } else {
      return new NetworkError(`Failed to make request: ${error.message}`, error);
    }
  }

  /**
   * Get current rate limiter metrics.
   *
   * @returns Metrics including request count and average wait time
   *
   * @example
   * ```typescript
   * const metrics = client.getRateLimiterMetrics();
   * console.log(`Made ${metrics.requestsMade} requests`);
   * ```
   */
  getRateLimiterMetrics() {
    return this.rateLimiter.getMetrics();
  }

  /**
   * Get the client configuration.
   *
   * @returns Read-only copy of the configuration
   */
  getConfig(): Readonly<JiraConfig> {
    return { ...this.config };
  }

  /**
   * Get the Jira instance base URL.
   *
   * @returns Base URL string
   */
  getBaseUrl(): string {
    return this.config.baseUrl;
  }
}
