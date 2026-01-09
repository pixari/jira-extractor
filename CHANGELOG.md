# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0](https://github.com/pixari/jira-extractor/compare/v1.2.3...v1.3.0) (2026-01-09)


### Features

* add npm provenance support to release workflow ([aa393c4](https://github.com/pixari/jira-extractor/commit/aa393c415f8ea18f25d1c4be8ba609ffea06414d))
* add release-please for automated releases and npm publishing ([1bd2576](https://github.com/pixari/jira-extractor/commit/1bd257603f445fdc341ba2d0db314c9a294bd761))
* initial release of jira-extractor library ([18f50ed](https://github.com/pixari/jira-extractor/commit/18f50ed13f8681e01b4c25fc999ba36e5cf7a7c7))
* migrate to npm Trusted Publishing (no tokens needed) ([e9b1652](https://github.com/pixari/jira-extractor/commit/e9b165297af59525bd8de6cf2b0d8d3703526ef6))
* upgrade to codecov v5 and add coverage badge ([1a7d9fe](https://github.com/pixari/jira-extractor/commit/1a7d9feb1a4e89efb725fa472466b85533c134a8))


### Bug Fixes

* add NPM_TOKEN back for authentication with provenance ([f3ca91d](https://github.com/pixari/jira-extractor/commit/f3ca91d110eb135576ee42dfe4ec087d4ab2e612))
* add release-please manifest file ([7e17754](https://github.com/pixari/jira-extractor/commit/7e177549ace321fa7c81861bbe8142f9743b91b3))
* correct package.json bin path and repository URL format ([8214e55](https://github.com/pixari/jira-extractor/commit/8214e5524d2cd7620c2fbe34c4916812a9baa0fb))
* explicitly specify config and manifest file paths in release-please ([10b8382](https://github.com/pixari/jira-extractor/commit/10b83828b2e009e2c37c08f15b78b04b266bef78))
* move SECURITY.md and CONTRIBUTING.md to root for GitHub standards ([928c2c0](https://github.com/pixari/jira-extractor/commit/928c2c01f4e2c51dc98feada63d34700e2d4bf73))
* remove deprecated package-name parameter from release-please workflow ([48c13cf](https://github.com/pixari/jira-extractor/commit/48c13cf1732666b46b6c2fda49ce1e751ed27911))
* remove NODE_AUTH_TOKEN to use pure OIDC trusted publishing ([f8ee3ce](https://github.com/pixari/jira-extractor/commit/f8ee3ce78a40869c15d830af8fbb2296c511e12d))
* remove registry-url to enable pure OIDC authentication ([1060db6](https://github.com/pixari/jira-extractor/commit/1060db604c61f122f31de6d3a2588084fd6b4a88))
* restore NODE_AUTH_TOKEN with registry-url for authentication ([f18a745](https://github.com/pixari/jira-extractor/commit/f18a745ef2ec2d6f411f46c6151d0ea8c45b41b1))
* simplify release-please config to minimal format ([1eabf78](https://github.com/pixari/jira-extractor/commit/1eabf781578c6c8cce444748b128e132e11aa524))
* update npm badge to use shields.io and remove codecov badge ([1f901a2](https://github.com/pixari/jira-extractor/commit/1f901a2096c771a650d09810c7f69bc440242c12))
* update repository links in README.md to reflect new ownership ([89eaaf1](https://github.com/pixari/jira-extractor/commit/89eaaf17ccaf1bf66860532cf8ee8c07a1ca50b6))

## [1.2.3](https://github.com/pixari/jira-extractor/compare/v1.2.2...v1.2.3) (2026-01-09)


### Bug Fixes

* remove registry-url to enable pure OIDC authentication ([df587d1](https://github.com/pixari/jira-extractor/commit/df587d1ccd2aa0145cacc6a5dd50194947771bd5))

## [1.2.2](https://github.com/pixari/jira-extractor/compare/v1.2.1...v1.2.2) (2026-01-09)


### Bug Fixes

* remove NODE_AUTH_TOKEN to use pure OIDC trusted publishing ([6e2ec49](https://github.com/pixari/jira-extractor/commit/6e2ec4908b6a96c3187752d89a29d13c2ff3785d))

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
