/**
 * Custom error classes for Jira extractor
 */

import { JiraErrorResponse } from '../types/jira';

/**
 * Base error class for all Jira extractor errors
 */
export class JiraExtractorError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when Jira API returns an error
 */
export class JiraApiError extends JiraExtractorError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response?: JiraErrorResponse
  ) {
    super(message, 'JIRA_API_ERROR');
  }

  /**
   * Get formatted error message including API errors
   */
  getDetailedMessage(): string {
    const parts: string[] = [this.message];

    if (this.response?.errorMessages && this.response.errorMessages.length > 0) {
      parts.push('Error messages:');
      this.response.errorMessages.forEach((msg) => {
        parts.push(`  - ${msg}`);
      });
    }

    if (this.response?.errors) {
      parts.push('Field errors:');
      Object.entries(this.response.errors).forEach(([field, error]) => {
        parts.push(`  - ${field}: ${error}`);
      });
    }

    return parts.join('\n');
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends JiraExtractorError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR');
  }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends JiraExtractorError {
  constructor(
    message: string,
    public readonly retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT_ERROR');
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigurationError extends JiraExtractorError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
  }
}

/**
 * Error thrown when network request fails
 */
export class NetworkError extends JiraExtractorError {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message, 'NETWORK_ERROR');
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends JiraExtractorError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

/**
 * Maps HTTP status codes to user-friendly error messages
 */
export function getErrorMessageForStatus(statusCode: number): string {
  const errorMessages: Record<number, string> = {
    400: 'Bad Request: The request was invalid. Please check your JQL query.',
    401: 'Unauthorized: Invalid credentials. Please check your email and API token.',
    403: 'Forbidden: You do not have permission to access this resource.',
    404: 'Not Found: The requested resource was not found.',
    429: 'Too Many Requests: Rate limit exceeded. Please try again later.',
    500: 'Internal Server Error: Jira server encountered an error.',
    502: 'Bad Gateway: Jira server is temporarily unavailable.',
    503: 'Service Unavailable: Jira service is temporarily unavailable.',
    504: 'Gateway Timeout: Request to Jira server timed out.',
  };

  return errorMessages[statusCode] || `HTTP Error ${statusCode}: Request failed.`;
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError) {
    return true;
  }

  if (error instanceof JiraApiError) {
    // Retry on server errors and rate limit
    return error.statusCode >= 500 || error.statusCode === 429;
  }

  return false;
}

/**
 * Extracts error message from various error types
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof JiraApiError) {
    return error.getDetailedMessage();
  }

  if (error instanceof JiraExtractorError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unknown error occurred';
}
