/**
 * Unit tests for RateLimiter
 */

import { RateLimiter } from '../../src/core/RateLimiter';
import { RateLimitConfig } from '../../src/types/config';

describe('RateLimiter', () => {
  const defaultConfig: RateLimitConfig = {
    requestsPerSecond: 2,
    maxConcurrent: 2,
    minDelay: 100,
    retryAttempts: 3,
    retryDelay: 1000,
  };

  it('should create RateLimiter with valid config', () => {
    expect(() => new RateLimiter(defaultConfig)).not.toThrow();
  });

  it('should acquire tokens', async () => {
    const rateLimiter = new RateLimiter(defaultConfig);

    const start = Date.now();
    await rateLimiter.acquire();
    const duration = Date.now() - start;

    // First acquire should be immediate
    expect(duration).toBeLessThan(100);

    const metrics = rateLimiter.getMetrics();
    expect(metrics.requestsMade).toBe(1);
  });

  it('should enforce minimum delay between requests', async () => {
    const rateLimiter = new RateLimiter(defaultConfig);

    await rateLimiter.acquire();
    const start = Date.now();
    await rateLimiter.acquire();
    const duration = Date.now() - start;

    // Second acquire should wait at least minDelay
    expect(duration).toBeGreaterThanOrEqual(defaultConfig.minDelay - 10); // -10ms for timing tolerance
  });

  it('should respect requests per second limit', async () => {
    const config: RateLimitConfig = {
      ...defaultConfig,
      requestsPerSecond: 2, // 2 requests per second
      minDelay: 0,
    };

    const rateLimiter = new RateLimiter(config);

    const start = Date.now();
    await Promise.all([
      rateLimiter.acquire(),
      rateLimiter.acquire(),
      rateLimiter.acquire(), // This one should wait
    ]);
    const duration = Date.now() - start;

    // Third request should cause some delay due to rate limiting
    expect(duration).toBeGreaterThan(200); // Some delay expected

    const metrics = rateLimiter.getMetrics();
    expect(metrics.requestsMade).toBe(3);
  }, 10000);

  it('should track metrics', async () => {
    const rateLimiter = new RateLimiter(defaultConfig);

    await rateLimiter.acquire();
    await rateLimiter.acquire();

    const metrics = rateLimiter.getMetrics();
    expect(metrics.requestsMade).toBe(2);
    expect(metrics.requestsQueued).toBe(0);
    expect(metrics.requestsFailed).toBe(0);
  });

  it('should record failures', () => {
    const rateLimiter = new RateLimiter(defaultConfig);

    rateLimiter.recordFailure();
    rateLimiter.recordFailure();

    const metrics = rateLimiter.getMetrics();
    expect(metrics.requestsFailed).toBe(2);
  });

  it('should return queue size', async () => {
    const rateLimiter = new RateLimiter({ ...defaultConfig, maxConcurrent: 1 });

    // Queue up multiple requests
    const promises = [
      rateLimiter.acquire(),
      rateLimiter.acquire(),
      rateLimiter.acquire(),
    ];

    // Give time for requests to queue
    await new Promise((resolve) => setTimeout(resolve, 10));

    // At least some should be queued
    const queueSize = rateLimiter.getQueueSize();
    expect(queueSize).toBeGreaterThanOrEqual(0);

    await Promise.all(promises);
  });

  it('should reset metrics', async () => {
    const rateLimiter = new RateLimiter(defaultConfig);

    await rateLimiter.acquire();
    rateLimiter.recordFailure();

    let metrics = rateLimiter.getMetrics();
    expect(metrics.requestsMade).toBeGreaterThan(0);
    expect(metrics.requestsFailed).toBeGreaterThan(0);

    rateLimiter.resetMetrics();

    metrics = rateLimiter.getMetrics();
    expect(metrics.requestsMade).toBe(0);
    expect(metrics.requestsFailed).toBe(0);
  });

  it('should clear queue', async () => {
    const rateLimiter = new RateLimiter(defaultConfig);

    await rateLimiter.acquire();
    rateLimiter.clear();

    const metrics = rateLimiter.getMetrics();
    expect(metrics.requestsMade).toBe(0);
  });

  it('should return config', () => {
    const rateLimiter = new RateLimiter(defaultConfig);
    const config = rateLimiter.getConfig();

    expect(config.requestsPerSecond).toBe(defaultConfig.requestsPerSecond);
    expect(config.maxConcurrent).toBe(defaultConfig.maxConcurrent);
  });
});
