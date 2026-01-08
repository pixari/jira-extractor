/**
 * Commitlint configuration for conventional commits
 *
 * Format: <type>(<scope>): <subject>
 *
 * Types:
 * - feat: A new feature
 * - fix: A bug fix
 * - docs: Documentation only changes
 * - style: Changes that don't affect code meaning (formatting, etc)
 * - refactor: Code change that neither fixes a bug nor adds a feature
 * - perf: Performance improvements
 * - test: Adding or updating tests
 * - build: Changes to build system or dependencies
 * - ci: Changes to CI configuration
 * - chore: Other changes that don't modify src or test files
 * - revert: Reverts a previous commit
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
};
