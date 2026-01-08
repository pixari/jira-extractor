/**
 * Mock p-queue for Jest tests
 */

export default class PQueue {
  private running = 0;
  private readonly concurrency: number;
  size = 0;
  pending = 0;

  constructor(options?: { concurrency?: number; interval?: number; intervalCap?: number }) {
    this.concurrency = options?.concurrency || 1;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    this.size++;

    while (this.running >= this.concurrency) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    this.running++;
    this.pending++;
    this.size--;

    try {
      const result = await fn();
      return result;
    } finally {
      this.running--;
      this.pending--;
    }
  }

  clear() {
    this.size = 0;
  }
}
