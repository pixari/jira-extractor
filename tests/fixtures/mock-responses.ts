/**
 * Mock Jira API responses for testing
 */

import { JiraIssue, JiraSearchResponse, JiraUser, JiraStatus } from '../../src/types/jira';

export const mockUser: JiraUser = {
  accountId: 'user-123',
  accountType: 'atlassian',
  displayName: 'John Doe',
  emailAddress: 'john.doe@example.com',
  active: true,
  timeZone: 'America/New_York',
  avatarUrls: {
    '48x48': 'https://example.com/avatar.png',
  },
};

export const mockStatus: JiraStatus = {
  id: '1',
  name: 'To Do',
  description: 'The issue is open and ready for the assignee to start work on it.',
  statusCategory: {
    id: 2,
    key: 'new',
    name: 'To Do',
    colorName: 'blue-gray',
  },
};

export const mockIssue: JiraIssue = {
  id: '10001',
  key: 'PROJ-1',
  self: 'https://example.atlassian.net/rest/api/3/issue/10001',
  fields: {
    summary: 'Test issue',
    description: 'This is a test issue',
    status: mockStatus,
    priority: {
      id: '3',
      name: 'Medium',
      iconUrl: 'https://example.com/priority.png',
    },
    issuetype: {
      id: '10001',
      name: 'Story',
      description: 'A user story',
      iconUrl: 'https://example.com/story.png',
      subtask: false,
    },
    project: {
      id: '10000',
      key: 'PROJ',
      name: 'Test Project',
      projectTypeKey: 'software',
    },
    assignee: mockUser,
    reporter: mockUser,
    creator: mockUser,
    created: '2024-01-01T10:00:00.000Z',
    updated: '2024-01-02T10:00:00.000Z',
    resolutiondate: null,
    duedate: null,
    labels: ['backend', 'api'],
    components: [],
    fixVersions: [],
  },
};

export const mockSearchResponse: JiraSearchResponse = {
  expand: 'schema,names',
  startAt: 0,
  maxResults: 50,
  total: 1,
  issues: [mockIssue],
};

export const mockSearchResponseMultiplePage: JiraSearchResponse = {
  expand: 'schema,names',
  startAt: 0,
  maxResults: 2,
  total: 5,
  issues: [
    { ...mockIssue, id: '1', key: 'PROJ-1' },
    { ...mockIssue, id: '2', key: 'PROJ-2' },
  ],
};

export const mockSearchResponsePage2: JiraSearchResponse = {
  expand: 'schema,names',
  startAt: 2,
  maxResults: 2,
  total: 5,
  issues: [
    { ...mockIssue, id: '3', key: 'PROJ-3' },
    { ...mockIssue, id: '4', key: 'PROJ-4' },
  ],
};

export const mockSearchResponsePage3: JiraSearchResponse = {
  expand: 'schema,names',
  startAt: 4,
  maxResults: 2,
  total: 5,
  issues: [{ ...mockIssue, id: '5', key: 'PROJ-5' }],
};

export const mockSearchResponseEmpty: JiraSearchResponse = {
  expand: 'schema,names',
  startAt: 0,
  maxResults: 50,
  total: 0,
  issues: [],
};

export const mockErrorResponse = {
  errorMessages: ['The value \'INVALID\' does not exist for the field \'project\'.'],
  errors: {},
};

export const mockAuthErrorResponse = {
  errorMessages: ['Client must be authenticated to access this resource.'],
  errors: {},
};
