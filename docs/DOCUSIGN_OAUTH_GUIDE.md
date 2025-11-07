# 🔐 DocuSign OAuth 2.0 Integration Guide

## Overview

This guide explains how to authenticate with DocuSign using **OAuth 2.0 Authorization Code Grant** flow. This is the recommended authentication method for server-side integrations.

## Why OAuth instead of JWT?

- ✅ **Easier Setup**: No RSA key pair generation required
- ✅ **Secure**: Uses Authorization Code Grant flow
- ✅ **Standard**: Industry-standard OAuth 2.0 protocol
- ✅ **Compatible**: Works with DocuSign's standard app configuration

## How It Works

```
┌─────────┐                                      ┌──────────────┐
│  User   │                                      │   DocuSign   │
│ Browser │                                      │    Server    │
└────┬────┘                                      └──────┬───────┘
     │                                                  │
     │  1. Redirect to Authorization URL                │
     ├─────────────────────────────────────────────────>│
     │                                                  │
     │  2. User logs in and grants permission           │
     │                                                  │
     │  3. Redirect back with authorization code        │
     │<─────────────────────────────────────────────────┤
     │                                                  │
┌────┴────────────────────────────────────────────┐    │
│  TeleMedCare Server                             │    │
│  4. Exchange code for access token              ├───>│
│                                                 │    │
│  5. Use access token for API calls              │<───┤
│                                                 │    │
└─────────────────────────────────────────────────┘    │
```

## Quick Start

### Method 1: Automatic Test (Recommended)

Run the OAuth callback server that handles everything automatically:

```bash
cd /home/user/webapp
npx tsx oauth-callback-server.ts
```

This will:
1. Start a local server on port 3001
2. Display the authorization URL
3. Wait for you to authorize the app in your browser
4. Automatically capture the callback
5. Exchange the code for an access token
6. Create a test envelope
7. Display the results

### Method 2: Manual Test

```bash
# Step 1: Generate authorization URL
npx tsx test-docusign-oauth.ts

# Step 2: Open the URL in browser, authorize, and copy the code
# Step 3: Exchange code for token
npx tsx test-docusign-oauth.ts code=YOUR_CODE_HERE
```

## Configuration

All configuration is in `.dev.vars`:

```env
DOCUSIGN_INTEGRATION_KEY="baf7dff3-8bf8-4587-837d-406adb8be309"
DOCUSIGN_SECRET_KEY="1e51f26a-d618-497a-96a7-c2db567dba5f"
DOCUSIGN_ACCOUNT_ID="031092ba-f573-40b9-ae21-0a3478de03d3"
DOCUSIGN_USER_ID="0b6a7a10-8b3e-49a2-af3a-87495efe7784"
DOCUSIGN_BASE_URL="https://demo.docusign.net/restapi"
DOCUSIGN_REDIRECT_URI="http://localhost:3001/api/docusign/callback"
```

## Implementation Details

### 1. DocuSignOAuth Class

Located in `src/modules/docusign-auth.ts`:

```typescript
const oauth = new DocuSignOAuth({
  integrationKey: 'YOUR_INTEGRATION_KEY',
  secretKey: 'YOUR_SECRET_KEY',
  redirectUri: 'YOUR_REDIRECT_URI',
  baseUrl: 'https://demo.docusign.net/restapi'
})

// Generate authorization URL
const authUrl = oauth.getAuthorizationUrl('optional-state')

// Exchange code for token
const tokenResponse = await oauth.getAccessTokenFromCode(code)

// Get user info
const userInfo = await oauth.getUserInfo(tokenResponse.access_token)
```

### 2. Using with DocuSignClient

```typescript
import { createDocuSignClient } from './src/modules/docusign-integration'

// Create client in OAuth mode
const client = createDocuSignClient(env, true) // true = use OAuth

// Set access token (from OAuth flow)
client.setAccessToken(accessToken, expiresIn)

// Now you can use all DocuSign methods
const envelope = await client.createEnvelope({
  documentName: 'Contract.pdf',
  documentPdfBase64: pdfBase64,
  recipientEmail: 'user@example.com',
  recipientName: 'John Doe',
  subject: 'Please sign this contract',
  emailBody: 'Click to review and sign'
})
```

### 3. Token Management

The `TokenManager` class provides simple token storage:

```typescript
import { TokenManager } from './src/modules/docusign-auth'

// Store token
TokenManager.setToken(accessToken, expiresIn)

// Retrieve token
const token = TokenManager.getToken()

// Check if valid
if (TokenManager.isValid()) {
  // Use token
}

// Clear token
TokenManager.clearToken()
```

**Note**: In production, store tokens in a database or KV storage instead of memory.

## OAuth Flow Steps

### Step 1: Authorization URL

Generate the URL to redirect users for authorization:

```typescript
const authUrl = oauth.getAuthorizationUrl('unique-state-value')
// Opens: https://account-d.docusign.com/oauth/auth?response_type=code&...
```

### Step 2: User Authorization

User opens the URL, logs into DocuSign, and grants permission. DocuSign redirects back to:

```
http://localhost:3001/api/docusign/callback?code=XXXXX&state=unique-state-value
```

### Step 3: Token Exchange

Exchange the authorization code for an access token:

```typescript
const tokenResponse = await oauth.getAccessTokenFromCode(code)
// Returns: { access_token, token_type, expires_in, refresh_token }
```

### Step 4: API Calls

Use the access token for all DocuSign API calls:

```typescript
const response = await fetch(docusignApiUrl, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  // ...
})
```

## Production Implementation

### 1. Create OAuth Callback Endpoint

In your Cloudflare Worker or API:

```typescript
// src/api/docusign-callback.ts
export async function handleDocuSignCallback(request: Request, env: any) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  
  if (!code) {
    return new Response('Missing code', { status: 400 })
  }
  
  const oauth = new DocuSignOAuth({
    integrationKey: env.DOCUSIGN_INTEGRATION_KEY,
    secretKey: env.DOCUSIGN_SECRET_KEY,
    redirectUri: env.DOCUSIGN_REDIRECT_URI,
    baseUrl: env.DOCUSIGN_BASE_URL
  })
  
  // Exchange code for token
  const tokenResponse = await oauth.getAccessTokenFromCode(code)
  
  // Store token in database or KV
  await env.KV.put('docusign_token', tokenResponse.access_token, {
    expirationTtl: tokenResponse.expires_in
  })
  
  // Redirect to success page
  return Response.redirect('/dashboard?docusign=authorized', 302)
}
```

### 2. Use Stored Token

```typescript
// Retrieve token when needed
const accessToken = await env.KV.get('docusign_token')

if (!accessToken) {
  // Redirect to authorization
  return Response.redirect(oauth.getAuthorizationUrl(), 302)
}

// Use token
const client = createDocuSignClient(env, true)
client.setAccessToken(accessToken, 3600)
```

### 3. Token Refresh

OAuth tokens expire after 8 hours. Implement token refresh:

```typescript
// Check token expiration
if (tokenExpired) {
  // Re-authorize
  return Response.redirect(oauth.getAuthorizationUrl(), 302)
}
```

**Note**: DocuSign demo accounts have limited refresh token support. In production with a paid account, implement proper refresh token flow.

## Security Best Practices

### 1. State Parameter

Always use a unique state parameter to prevent CSRF attacks:

```typescript
const state = crypto.randomUUID()
// Store state in session
const authUrl = oauth.getAuthorizationUrl(state)

// Verify state on callback
if (receivedState !== storedState) {
  throw new Error('Invalid state parameter')
}
```

### 2. Secure Token Storage

Never store tokens in:
- ❌ Client-side JavaScript
- ❌ URLs or query parameters
- ❌ Browser localStorage
- ❌ Git repositories

Always store tokens in:
- ✅ Server-side database
- ✅ Cloudflare KV with expiration
- ✅ Encrypted at rest
- ✅ With proper access controls

### 3. HTTPS Only

Always use HTTPS for:
- Redirect URIs
- API endpoints
- Token exchange

### 4. Token Expiration

Implement proper token expiration handling:

```typescript
const expiresAt = Date.now() + (tokenResponse.expires_in * 1000)

// Before using token
if (Date.now() >= expiresAt) {
  // Request new authorization
}
```

## Troubleshooting

### "invalid_grant" Error

**Cause**: Authorization code already used or expired

**Solution**: 
- Codes can only be used once
- Codes expire after a few minutes
- Request a new authorization

### "invalid_client" Error

**Cause**: Integration Key or Secret Key incorrect

**Solution**: 
- Verify credentials in `.dev.vars`
- Check DocuSign Admin settings
- Ensure Secret Key matches Integration Key

### "redirect_uri_mismatch" Error

**Cause**: Redirect URI doesn't match DocuSign configuration

**Solution**:
- Verify exact match (including http:// vs https://)
- Update redirect URI in DocuSign Admin
- Update `DOCUSIGN_REDIRECT_URI` in `.dev.vars`

### "user_not_found" Error (JWT only)

**Cause**: Attempting JWT without proper RSA key

**Solution**: Use OAuth flow instead (recommended)

## Testing Checklist

- [ ] OAuth callback server starts successfully
- [ ] Authorization URL opens in browser
- [ ] User can login to DocuSign
- [ ] Authorization consent screen appears
- [ ] Callback receives authorization code
- [ ] Token exchange succeeds
- [ ] User info retrieved successfully
- [ ] Test envelope created
- [ ] Email received with signature request

## Next Steps

After successful OAuth test:

1. ✅ Integrate OAuth into main application flow
2. ✅ Create `/api/docusign/callback` endpoint
3. ✅ Implement token storage in database/KV
4. ✅ Add token refresh logic
5. ✅ Test end-to-end signature workflow
6. ✅ Implement webhook handling
7. ✅ Add signed document download

## Resources

- [DocuSign OAuth Documentation](https://developers.docusign.com/platform/auth/authcode/)
- [DocuSign REST API Reference](https://developers.docusign.com/docs/esign-rest-api/)
- [OAuth 2.0 Specification](https://oauth.net/2/)

## Support

For issues with OAuth implementation:

1. Check console output for detailed error messages
2. Verify all credentials in `.dev.vars`
3. Ensure redirect URI matches exactly in DocuSign Admin
4. Check DocuSign Developer account status
5. Review DocuSign API logs in Admin portal
