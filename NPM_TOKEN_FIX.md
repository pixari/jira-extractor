# NPM Publish 2FA Error - Fix Required

## Problem

The GitHub Actions workflow is failing with:

```
npm error code EOTP
npm error This operation requires a one-time password from your authenticator.
```

This happens because your npm account has 2FA enabled, and npm now requires 2FA for all granular tokens.

⚠️ **Important**: npm has deprecated classic tokens. Granular tokens are now limited to 90 days and require 2FA by default.

## Solution 1: Use npm Provenance (Recommended - Modern Approach)

✅ **Already implemented!** The workflow has been updated to use npm provenance.

npm provenance provides cryptographic proof that packages are built in GitHub Actions. While you still need an npm token, provenance adds extra security and transparency.

### What was updated:

1. Added `id-token: write` permission for OIDC tokens
2. Added `--provenance` flag to `npm publish`
3. Added `--access public` to ensure package is public

### You still need to:

Create a granular token (it will work with provenance):

1. Go to: https://www.npmjs.com/settings/[your-username]/tokens/granular-access-token/new
2. Configure:
   - **Expiration**: 90 days (you'll need to rotate it)
   - **Packages and scopes**:
     - Permissions: "Read and write"
     - Packages: "Only select packages and scopes"
     - Select: "jira-extractor"
3. Copy the token
4. Add to GitHub: https://github.com/pixari/jira-extractor/settings/secrets/actions
   - Name: `NPM_TOKEN`
   - Value: paste your token

**Note**: With provenance, the token still needs to authenticate, but npm can verify the package authenticity through GitHub's OIDC.

## Solution 2: Granular Token with Temporary 2FA Bypass

While granular tokens require 2FA, you can create one for CI/CD:

### Steps:

1. **Create Granular Access Token**: https://www.npmjs.com/settings/[your-username]/tokens/granular-access-token/new

2. **Configure**:
   - **Expiration**: 90 days maximum (you'll need to rotate it)
   - **Packages and scopes**:
     - Permissions: "Read and write"
     - Packages: Select "Only select packages and scopes"
     - Select: "jira-extractor"

3. **Important Notes**:
   - Granular tokens expire after 90 days max
   - You'll need to rotate the token every 90 days
   - 2FA is required by default, but the token can be used in automation if configured correctly

4. **Update GitHub Secret**:
   - Go to: https://github.com/pixari/jira-extractor/settings/secrets/actions
   - Find the existing `NPM_TOKEN` secret
   - Click edit and replace with your new token
   - Click "Update secret"

## Verify Token Works Locally

Before updating GitHub, test the token locally:

```bash
# Set the token temporarily
export NPM_TOKEN="your-new-token-here"

# Try publishing (dry run)
npm publish --dry-run

# If it asks for OTP, the token isn't configured correctly
```

## Expected Success Output

After fixing, you should see:

```
npm notice Publishing to https://registry.npmjs.org/ with tag latest and default access
+ jira-extractor@1.1.0
```

## Resources

- npm Automation Tokens: https://docs.npmjs.com/creating-and-viewing-access-tokens
- GitHub Actions npm Publishing: https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages
