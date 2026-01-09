# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1](https://github.com/pixari/jira-extractor/compare/v1.2.0...v1.2.1) (2026-01-09)


### Bug Fixes

* add NPM_TOKEN back for authentication with provenance ([d9d019b](https://github.com/pixari/jira-extractor/commit/d9d019bf2712551e1f1e2335ddd142071e5ffd09))

## [1.2.0](https://github.com/pixari/jira-extractor/compare/v1.1.0...v1.2.0) (2026-01-09)


### Features

* add npm provenance support to release workflow ([9fff114](https://github.com/pixari/jira-extractor/commit/9fff114af49b4355e16da1da8bff836ad1049f87))
* migrate to npm Trusted Publishing (no tokens needed) ([be4b9c4](https://github.com/pixari/jira-extractor/commit/be4b9c48fe428008ba80559ccfc41eda210d9c07))


### Bug Fixes

* correct package.json bin path and repository URL format ([8214e55](https://github.com/pixari/jira-extractor/commit/8214e5524d2cd7620c2fbe34c4916812a9baa0fb))

## [1.1.0](https://github.com/pixari/jira-extractor/compare/v1.0.0...v1.1.0) (2026-01-08)


### Features

* add release-please for automated releases and npm publishing ([1bd2576](https://github.com/pixari/jira-extractor/commit/1bd257603f445fdc341ba2d0db314c9a294bd761))
* initial release of jira-extractor library ([18f50ed](https://github.com/pixari/jira-extractor/commit/18f50ed13f8681e01b4c25fc999ba36e5cf7a7c7))


### Bug Fixes

* add release-please manifest file ([7e17754](https://github.com/pixari/jira-extractor/commit/7e177549ace321fa7c81861bbe8142f9743b91b3))
* explicitly specify config and manifest file paths in release-please ([10b8382](https://github.com/pixari/jira-extractor/commit/10b83828b2e009e2c37c08f15b78b04b266bef78))
* remove deprecated package-name parameter from release-please workflow ([48c13cf](https://github.com/pixari/jira-extractor/commit/48c13cf1732666b46b6c2fda49ce1e751ed27911))
* simplify release-please config to minimal format ([1eabf78](https://github.com/pixari/jira-extractor/commit/1eabf781578c6c8cce444748b128e132e11aa524))
* update repository links in README.md to reflect new ownership ([89eaaf1](https://github.com/pixari/jira-extractor/commit/89eaaf17ccaf1bf66860532cf8ee8c07a1ca50b6))

## [1.0.0] - 2026-01-08

### Features

- Initial release of jira-extractor library
- JQL query support with cursor-based pagination
- Beautiful interactive CLI with progress tracking
- Configurable rate limiting and retry logic
- Memory-efficient streaming for large result sets
- Type-safe TypeScript implementation
- Comprehensive JSDoc documentation

### Quality & Security

- Full test coverage with Jest
- ESLint + Prettier for code quality
- Husky + lint-staged for pre-commit checks
- Conventional commits with commitlint
- GitHub Actions CI/CD (test on Node 18, 20, 22)
- CodeQL security analysis
- Gitleaks secret scanning
- Dependabot for automated updates
- TypeDoc API documentation

### Package Features

- npm package with CLI binary
- ISC license
- TypeScript declarations included
- Supports Node.js >= 18.0.0

[1.0.0]: https://github.com/pixari/jira-extractor/releases/tag/v1.0.0
