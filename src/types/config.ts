/**
 * Configuration types and Zod schemas for validation
 */

import { z } from 'zod';

/**
 * Authentication configuration schemas
 */
export const BasicAuthSchema = z.object({
  type: z.literal('basic'),
  email: z.string().email('Invalid email address'),
  apiToken: z.string().min(1, 'API token is required'),
});

export const BearerAuthSchema = z.object({
  type: z.literal('bearer'),
  token: z.string().min(1, 'Bearer token is required'),
});

export const AuthConfigSchema = z.discriminatedUnion('type', [
  BasicAuthSchema,
  BearerAuthSchema,
]);

export type BasicAuth = z.infer<typeof BasicAuthSchema>;
export type BearerAuth = z.infer<typeof BearerAuthSchema>;
export type AuthConfig = z.infer<typeof AuthConfigSchema>;

/**
 * Rate limiting configuration schema
 */
export const RateLimitConfigSchema = z.object({
  /**
   * Maximum requests per second
   * Default: 2
   */
  requestsPerSecond: z.number().min(0.1).max(100).default(2),

  /**
   * Maximum concurrent requests
   * Default: 2
   */
  maxConcurrent: z.number().min(1).max(10).default(2),

  /**
   * Minimum delay between requests (milliseconds)
   * Default: 200
   */
  minDelay: z.number().min(0).default(200),

  /**
   * Number of retry attempts for failed requests
   * Default: 3
   */
  retryAttempts: z.number().min(0).max(10).default(3),

  /**
   * Initial delay before retry (milliseconds)
   * Default: 1000
   */
  retryDelay: z.number().min(0).default(1000),
});

export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

/**
 * Main Jira client configuration schema
 */
export const JiraConfigSchema = z.object({
  /**
   * Jira instance base URL
   */
  baseUrl: z
    .string()
    .url('Invalid Jira URL')
    .refine((url) => url.startsWith('https://'), {
      message: 'Jira URL must use HTTPS',
    }),

  /**
   * Authentication configuration
   */
  auth: AuthConfigSchema,

  /**
   * Rate limiting configuration (optional)
   */
  rateLimiting: RateLimitConfigSchema.optional(),

  /**
   * Request timeout in milliseconds
   * Default: 30000 (30 seconds)
   */
  timeout: z.number().min(1000).default(30000),
});

export type JiraConfig = z.infer<typeof JiraConfigSchema>;

/**
 * CLI options schema
 */
export const CLIOptionsSchema = z.object({
  /**
   * Jira instance URL
   */
  url: z.string().url().optional(),

  /**
   * Email for Basic Auth
   */
  email: z.string().email().optional(),

  /**
   * API token for Basic Auth
   */
  token: z.string().optional(),

  /**
   * Bearer token for Bearer Auth
   */
  bearer: z.string().optional(),

  /**
   * JQL query
   */
  jql: z.string().min(1).optional(),

  /**
   * Output file path
   */
  output: z.string().optional(),

  /**
   * Requests per second
   */
  rps: z.number().min(0.1).max(100).optional(),

  /**
   * Max concurrent requests
   */
  concurrent: z.number().min(1).max(10).optional(),

  /**
   * Config file path
   */
  config: z.string().optional(),

  /**
   * Verbose logging
   */
  verbose: z.boolean().optional(),
});

export type CLIOptions = z.infer<typeof CLIOptionsSchema>;

/**
 * Export result information
 */
export interface ExportResult {
  /**
   * Number of issues exported
   */
  issueCount: number;

  /**
   * Output file path
   */
  outputPath: string;

  /**
   * Duration in milliseconds
   */
  duration: number;

  /**
   * JQL query used
   */
  jql: string;
}
