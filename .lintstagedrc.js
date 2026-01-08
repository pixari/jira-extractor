/**
 * Lint-staged configuration
 * Runs linting and formatting on staged files before commit
 */
module.exports = {
  // TypeScript files
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],

  // JavaScript files
  '*.{js,jsx}': ['eslint --fix', 'prettier --write'],

  // JSON, Markdown, and other files
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
