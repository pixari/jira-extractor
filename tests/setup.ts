// Jest setup file
// This file runs before all tests

import nock from 'nock';

// Set test environment variables
process.env.NODE_ENV = 'test';

// Configure nock for better axios compatibility
if (!nock.isActive()) {
  nock.activate();
}

// Extend Jest matchers if needed
// expect.extend({...});
