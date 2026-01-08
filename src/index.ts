/**
 * Jira Extractor Library
 * Main export file for programmatic usage
 */

// Export core classes
export { JiraClient } from './core/JiraClient';
export { AuthManager } from './core/AuthManager';
export { RateLimiter } from './core/RateLimiter';
export { Paginator } from './core/Paginator';

// Export types
export * from './types';

// Export error classes
export * from './utils/error-handler';
