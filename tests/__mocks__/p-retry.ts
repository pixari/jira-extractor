/**
 * Mock p-retry for Jest tests
 */

export interface Options {
  retries?: number;
  minTimeout?: number;
  maxTimeout?: number;
  factor?: number;
  onFailedAttempt?: (error: Error & { attemptNumber?: number }) => void;
}

export default async function pRetry<T>(
  fn: () => Promise<T>,
  options: Options = {}
): Promise<T> {
  const retries = options.retries || 0;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < retries) {
        if (options.onFailedAttempt) {
          const errorWithAttempt = error as Error & { attemptNumber?: number };
          errorWithAttempt.attemptNumber = attempt + 1;
          options.onFailedAttempt(errorWithAttempt);
        }

        // Wait before retrying
        const delay = options.minTimeout || 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
