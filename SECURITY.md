# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please do the following:

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: raffaele.pizzari@gmail.com

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information (as much as you can provide) to help us better understand the nature and scope of the possible issue:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Preferred Languages

We prefer all communications to be in English.

## Disclosure Policy

We follow the principle of [Coordinated Vulnerability Disclosure](https://vuls.cert.org/confluence/display/CVD).

- We will respond to your report within 48 hours with our evaluation and expected resolution date.
- Once we have confirmed the vulnerability, we will release a patch as soon as possible depending on complexity.
- We will publicly disclose the vulnerability once a patch has been released and users have had reasonable time to update.

## Security Best Practices for Users

When using this library:

1. **Never commit credentials**: Store API tokens in environment variables or secure secret management systems
2. **Use `.env` files properly**: Never commit `.env` files to version control
3. **Rotate credentials regularly**: Change your Jira API tokens periodically
4. **Limit token permissions**: Use Jira tokens with the minimum required permissions
5. **Keep dependencies updated**: Regularly run `npm audit` and update dependencies
6. **Monitor rate limits**: Configure appropriate rate limiting to avoid service disruption

## Security Features

This library implements several security best practices:

- No credential storage - uses environment variables
- Rate limiting to prevent abuse
- Input validation with Zod schemas
- TypeScript for type safety
- Automated security scanning in CI/CD
- Regular dependency updates via Dependabot
