/**
 * Jira API type definitions
 * Based on Jira Cloud REST API v3
 */

export interface JiraUser {
  accountId: string;
  accountType: string;
  displayName: string;
  emailAddress?: string;
  avatarUrls?: {
    '16x16'?: string;
    '24x24'?: string;
    '32x32'?: string;
    '48x48'?: string;
  };
  active: boolean;
  timeZone?: string;
}

export interface JiraStatus {
  id: string;
  name: string;
  description?: string;
  statusCategory: {
    id: number;
    key: string;
    name: string;
    colorName: string;
  };
}

export interface JiraPriority {
  id: string;
  name: string;
  iconUrl?: string;
}

export interface JiraIssueType {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  subtask: boolean;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  avatarUrls?: {
    '16x16'?: string;
    '24x24'?: string;
    '32x32'?: string;
    '48x48'?: string;
  };
}

export interface JiraComment {
  id: string;
  author: JiraUser;
  body: string;
  created: string;
  updated: string;
}

export interface JiraAttachment {
  id: string;
  filename: string;
  author: JiraUser;
  created: string;
  size: number;
  mimeType: string;
  content: string;
  thumbnail?: string;
}

export interface JiraWorklog {
  id: string;
  author: JiraUser;
  comment?: string;
  created: string;
  updated: string;
  started: string;
  timeSpent: string;
  timeSpentSeconds: number;
}

export interface JiraIssueFields {
  summary: string;
  description?: string | null;
  status: JiraStatus;
  priority?: JiraPriority;
  issuetype: JiraIssueType;
  project: JiraProject;
  assignee?: JiraUser | null;
  reporter?: JiraUser;
  creator?: JiraUser;
  created: string;
  updated: string;
  resolutiondate?: string | null;
  duedate?: string | null;
  labels?: string[];
  components?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  fixVersions?: Array<{
    id: string;
    name: string;
    description?: string;
    released: boolean;
    releaseDate?: string;
  }>;
  comment?: {
    comments: JiraComment[];
    total: number;
  };
  attachment?: JiraAttachment[];
  worklog?: {
    worklogs: JiraWorklog[];
    total: number;
  };
  // Custom fields - can be extended
  [key: string]: unknown;
}

export interface JiraChangelogItem {
  field: string;
  fieldtype: string;
  fieldId?: string;
  from?: string;
  fromString?: string;
  to?: string;
  toString?: string;
}

export interface JiraChangelogHistory {
  id: string;
  author: JiraUser;
  created: string;
  items: JiraChangelogItem[];
}

export interface JiraChangelog {
  startAt: number;
  maxResults: number;
  total: number;
  histories: JiraChangelogHistory[];
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: JiraIssueFields;
  expand?: string;
  changelog?: JiraChangelog;
}

export interface JiraSearchResponse {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
}

/**
 * New JQL search response format (cursor-based pagination)
 * Used by /rest/api/3/search/jql endpoint
 */
export interface JiraJQLSearchResponse {
  issues: JiraIssue[];
  nextPageToken?: string;
  isLast: boolean;
}

export interface JiraErrorResponse {
  errorMessages?: string[];
  errors?: Record<string, string>;
}

/**
 * Options for searching issues
 */
export interface SearchOptions {
  /**
   * Fields to include in the response
   * Default: all fields
   */
  fields?: string[];

  /**
   * Expand additional data (e.g., 'renderedFields', 'names', 'schema', 'changelog')
   */
  expand?: string[];

  /**
   * Maximum number of results per page
   * Default: 100 (Jira max)
   */
  maxResults?: number;

  /**
   * Starting index for pagination (deprecated - use pageToken for new API)
   * Default: 0
   */
  startAt?: number;

  /**
   * Page token for cursor-based pagination (new JQL API)
   */
  pageToken?: string;

  /**
   * Progress callback for tracking extraction
   */
  onProgress?: (progress: ProgressInfo) => void;
}

/**
 * Progress information during extraction
 */
export interface ProgressInfo {
  /**
   * Number of issues retrieved so far
   */
  current: number;

  /**
   * Total number of issues to retrieve
   */
  total: number;

  /**
   * Percentage complete (0-100)
   */
  percentage: number;

  /**
   * Current page number
   */
  page: number;
}
