import { JiraIssue, ProgressInfo } from '../types/jira';

export interface PaginationOptions {
  pageSize?: number;
  startAt?: number;
  total?: number;
  onProgress?: (progress: ProgressInfo) => void;
}

export type PageFetcher = (
  startAt: number,
  maxResults: number
) => Promise<{
  issues: JiraIssue[];
  total: number;
  startAt: number;
  maxResults: number;
}>;

/**
 * Paginator for offset-based pagination.
 *
 * Note: Most users should use JiraClient.searchIssues() which handles
 * pagination automatically with the newer cursor-based API.
 */
export class Paginator {
  private readonly pageSize: number;
  private readonly onProgress?: (progress: ProgressInfo) => void;
  private currentPage = 0;
  private totalIssues = 0;
  private fetchedIssues = 0;

  constructor(options: PaginationOptions = {}) {
    this.pageSize = Math.min(options.pageSize ?? 100, 100);
    this.onProgress = options.onProgress;
    this.totalIssues = options.total ?? 0;
  }

  /**
   * Paginate through results with an async generator.
   *
   * @param fetcher - Function to fetch a page of results
   * @yields Individual issues
   */
  async *paginate(fetcher: PageFetcher): AsyncGenerator<JiraIssue, void, undefined> {
    let startAt = 0;
    let hasMore = true;
    this.currentPage = 0;
    this.fetchedIssues = 0;

    while (hasMore) {
      this.currentPage++;

      const page = await fetcher(startAt, this.pageSize);

      if (process.env.DEBUG_PAGINATION === 'true') {
        /* eslint-disable no-console */
        console.log(`[Paginator Debug] Page ${this.currentPage}:`);
        console.log(`  - startAt: ${page.startAt}`);
        console.log(`  - maxResults: ${page.maxResults}`);
        console.log(`  - total: ${page.total}`);
        console.log(`  - issues.length: ${page.issues.length}`);
        console.log(`  - next startAt will be: ${startAt + page.issues.length}`);
        console.log(
          `  - hasMore calculation: ${startAt + page.issues.length} < ${page.total} && ${page.issues.length} > 0`
        );
        /* eslint-enable no-console */
      }

      if (this.currentPage === 1) {
        this.totalIssues = page.total;
      }

      for (const issue of page.issues) {
        this.fetchedIssues++;
        this.reportProgress();
        yield issue;
      }

      startAt += page.issues.length;
      hasMore = startAt < page.total && page.issues.length > 0;

      if (process.env.DEBUG_PAGINATION === 'true') {
        // eslint-disable-next-line no-console
        console.log(`  - hasMore: ${hasMore}\n`);
      }
    }

    this.reportProgress();
  }

  /**
   * Fetch all results into an array.
   *
   * Warning: Memory intensive for large result sets.
   */
  async paginateAll(fetcher: PageFetcher): Promise<JiraIssue[]> {
    const allIssues: JiraIssue[] = [];

    for await (const issue of this.paginate(fetcher)) {
      allIssues.push(issue);
    }

    return allIssues;
  }

  private reportProgress(): void {
    if (this.onProgress && this.totalIssues > 0) {
      const progress: ProgressInfo = {
        current: this.fetchedIssues,
        total: this.totalIssues,
        percentage: Math.round((this.fetchedIssues / this.totalIssues) * 100),
        page: this.currentPage,
      };

      this.onProgress(progress);
    }
  }

  getState(): {
    currentPage: number;
    totalIssues: number;
    fetchedIssues: number;
    pageSize: number;
  } {
    return {
      currentPage: this.currentPage,
      totalIssues: this.totalIssues,
      fetchedIssues: this.fetchedIssues,
      pageSize: this.pageSize,
    };
  }

  getTotalPages(): number {
    if (this.totalIssues === 0) {
      return 0;
    }
    return Math.ceil(this.totalIssues / this.pageSize);
  }

  isComplete(): boolean {
    return this.totalIssues > 0 && this.fetchedIssues >= this.totalIssues;
  }

  getProgressPercentage(): number {
    if (this.totalIssues === 0) {
      return 0;
    }
    return Math.round((this.fetchedIssues / this.totalIssues) * 100);
  }

  reset(): void {
    this.currentPage = 0;
    this.fetchedIssues = 0;
    this.totalIssues = 0;
  }
}
