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

⚠️ **MUST DO THIS FIRST** - The GitHub Actions workflow is already working but npm needs to be configured!

1. **Go to your package settings on npm**:
   - Package exists, go here: https://www.npmjs.com/package/jira-extractor/access
   - OR general settings: https://www.npmjs.com/settings/pixari/packages

2. **Look for "Publishing access" or "Automation tokens" or "Trusted publishers" section**

3. **Add GitHub Actions as a trusted publisher**:
   - Click "Add" or "Configure" or "Add trusted publisher"
   - Provider: **GitHub Actions**

4. **Configure the GitHub Actions publisher** with these exact values:
   - **GitHub repository owner**: `pixari`
   - **GitHub repository name**: `jira-extractor`
   - **Workflow filename**: `release-please.yml`
   - **Environment** (optional): Leave blank

5. **Save** the configuration

### Current Error Without This Setup:

```
npm error 404 Not Found - PUT https://registry.npmjs.org/jira-extractor
npm error code E404
Access token expired or revoked
```

This happens because npm sees the OIDC token but hasn't been told to trust it yet!

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
