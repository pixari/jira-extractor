# Contributing

## Setup

```bash
git clone https://github.com/pixari/jira-extractor.git
cd jira-extractor
npm install
npm run build
npm test
```

## Workflow

1. Create a branch: `git checkout -b feat/my-feature`
2. Make changes
3. Run tests: `npm test && npm run lint`
4. Commit with conventional format
5. Push and create PR

## Commit Format

Format: `<type>(<scope>): <subject>`

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

**Examples:**

```bash
git commit -m "feat: add custom field extraction"
git commit -m "fix(cli): resolve progress display issue"
git commit -m "docs: update API examples"
```

## Git Hooks

- **pre-commit**: Auto-formats and lints staged files
- **commit-msg**: Validates commit message format

## Code Style

- Use TypeScript strict mode
- No `any` types
- Add JSDoc for public APIs
- Write tests for new features
- ESLint + Prettier enforced automatically

## Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Commands

```bash
npm run build         # Build project
npm run lint          # Lint code
npm run lint:fix      # Fix linting issues
npm run format        # Format code
npm run typecheck     # Type checking
```

## Troubleshooting

**Commit rejected?**

- Linting: Run `npm run lint:fix`
- Format: Run `npm run format`
- Message: Use conventional format

**Hooks not working?**

```bash
npm run prepare
ls -la .husky/
```
