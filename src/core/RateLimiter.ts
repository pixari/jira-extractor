import PQueue from 'p-queue';
import { RateLimitConfig } from '../types/config';

export interface RateLimiterMetrics {
  requestsMade: number;
  requestsQueued: number;
  requestsFailed: number;
  averageWaitTime: number;
}

/**
 * Rate limiter using token bucket algorithm.
 *
 * Prevents server overload by controlling request rate and concurrency.
 */
export class RateLimiter {
  private queue: PQueue;
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;
  private lastRefill: number;
  private readonly minDelay: number;
  private lastRequestTime: number = 0;

  private metrics: RateLimiterMetrics = {
    requestsMade: 0,
    requestsQueued: 0,
    requestsFailed: 0,
    averageWaitTime: 0,
  };
  private waitTimes: number[] = [];

  constructor(private readonly config: RateLimitConfig) {
    this.maxTokens = config.requestsPerSecond;
    this.refillRate = config.requestsPerSecond;
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    this.minDelay = config.minDelay;

    this.queue = new PQueue({
      concurrency: config.maxConcurrent,
      interval: 1000,
      intervalCap: config.requestsPerSecond,
    });
  }

  /**
   * Acquire permission to make a request.
   *
   * Waits if rate limit is exceeded.
   */
  async acquire(): Promise<void> {
    const startWait = Date.now();
    this.metrics.requestsQueued++;

    return this.queue.add(async () => {
      await this.waitForToken();
      await this.enforceMinDelay();

      this.lastRequestTime = Date.now();
      this.tokens--;
      this.metrics.requestsMade++;
      this.metrics.requestsQueued--;

      const waitTime = Date.now() - startWait;
      this.waitTimes.push(waitTime);
      if (this.waitTimes.length > 100) {
        this.waitTimes.shift();
      }
      this.updateAverageWaitTime();
    });
  }

  private async waitForToken(): Promise<void> {
    while (this.tokens < 1) {
      this.refill();
      if (this.tokens < 1) {
        const waitTime = this.calculateWaitTime();
        await this.delay(waitTime);
      }
    }
  }

  private async enforceMinDelay(): Promise<void> {
    if (this.minDelay > 0 && this.lastRequestTime > 0) {
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.minDelay) {
        await this.delay(this.minDelay - timeSinceLastRequest);
      }
    }
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = (elapsed / 1000) * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  private calculateWaitTime(): number {
    const tokensNeeded = 1 - this.tokens;
    const timeNeeded = (tokensNeeded / this.refillRate) * 1000;
    return Math.max(100, timeNeeded);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private updateAverageWaitTime(): void {
    if (this.waitTimes.length > 0) {
      const sum = this.waitTimes.reduce((acc, time) => acc + time, 0);
      this.metrics.averageWaitTime = sum / this.waitTimes.length;
    }
  }

  recordFailure(): void {
    this.metrics.requestsFailed++;
  }

  /**
   * Get current rate limiter metrics.
   *
   * @returns Metrics including request count and average wait time
   */
  getMetrics(): Readonly<RateLimiterMetrics> {
    return { ...this.metrics };
  }

  /**
   * Get number of queued requests.
   */
  getQueueSize(): number {
    return this.queue.size;
  }

  /**
   * Get number of currently processing requests.
   */
  getPendingCount(): number {
    return this.queue.pending;
  }

  /**
   * Check if rate limiter is actively limiting requests.
   */
  isLimiting(): boolean {
    return this.queue.size > 0 || this.tokens < 1;
  }

  getConfig(): Readonly<RateLimitConfig> {
    return { ...this.config };
  }

  resetMetrics(): void {
    this.metrics = {
      requestsMade: 0,
      requestsQueued: 0,
      requestsFailed: 0,
      averageWaitTime: 0,
    };
    this.waitTimes = [];
  }

  /**
   * Clear the queue and reset internal state.
   */
  clear(): void {
    this.queue.clear();
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    this.lastRequestTime = 0;
    this.resetMetrics();
  }
}
