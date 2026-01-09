# Setting Up npm Trusted Publishing (Recommended)

## What is Trusted Publishing?

Trusted Publishing uses OpenID Connect (OIDC) to verify your identity through GitHub Actions. **No tokens needed!**

Benefits:

- ✅ No token management or rotation
- ✅ More secure (no long-lived credentials)
- ✅ No 2FA issues
- ✅ Automatic provenance

## Setup Steps

### 1. Configure npm for Trusted Publishing

1. **Go to your package settings on npm**:
   - If package exists: https://www.npmjs.com/package/jira-extractor/access
   - If package doesn't exist yet: https://www.npmjs.com/settings/[your-username]/packages

2. **Add GitHub Actions as a trusted publisher**:
   - Look for "Publishing access" or "Trusted Publishers" section
   - Click "Add provider" or "Configure"
   - Select: **GitHub Actions**

3. **Configure the GitHub Actions publisher**:
   - **GitHub repository owner**: `pixari`
   - **GitHub repository name**: `jira-extractor`
   - **Workflow name**: `release-please.yml`
   - **Environment** (optional): Leave blank for now

4. **Save** the configuration

### 2. Update the Workflow (Remove NPM_TOKEN)

The workflow needs to be updated to use Trusted Publishing instead of tokens.

### 3. Delete the NPM_TOKEN Secret (Optional)

Once Trusted Publishing is working, you can safely delete the NPM_TOKEN secret:

- Go to: https://github.com/pixari/jira-extractor/settings/secrets/actions
- Delete `NPM_TOKEN` (it won't be needed anymore)

## How It Works

1. GitHub Actions generates an OIDC token (enabled by `id-token: write` permission)
2. npm receives the OIDC token with the publish request
3. npm verifies the token came from your configured GitHub repository
4. If valid, npm allows the publish without needing a traditional token

## First-Time Publishing Note

⚠️ **Important**: If the package doesn't exist on npm yet, you may need to do the first publish manually:

```bash
# First time only, from your local machine
npm login
npm publish --access public
```

Then configure Trusted Publishing on npm for future automated releases.

## Verification

After setup, when a release is published, you should see:

- No "EOTP" errors
- A "Provenance" badge on your npm package page
- Package published successfully from GitHub Actions

## Resources

- npm Trusted Publishing Docs: https://docs.npmjs.com/generating-provenance-statements
- GitHub OIDC Docs: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect
