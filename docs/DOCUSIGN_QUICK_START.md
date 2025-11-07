# 🚀 DocuSign Quick Start - 5 Minutes

## Test OAuth Integration NOW

### One Command Test

```bash
cd /home/user/webapp
npx tsx oauth-callback-server.ts
```

**Then:**
1. Copy the URL from the terminal
2. Open it in your browser
3. Login to DocuSign Developer account
4. Click "Allow Access"
5. Done! ✅

The server will automatically:
- Capture the authorization code
- Exchange it for an access token
- Create a test envelope
- Send it to your email

## Expected Output

```
🚀 ===== DOCUSIGN OAUTH TEST SERVER =====

✅ Server listening on http://localhost:3001
📋 Callback URL: http://localhost:3001/api/docusign/callback

📋 STEP 1: AUTHORIZE APPLICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Open this URL in your browser:

https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature+impersonation&client_id=baf7dff3-8bf8-4587-837d-406adb8be309&redirect_uri=...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏳ Waiting for authorization...
```

After authorization:

```
✅ Authorization code ricevuto!
🔄 Scambio code con access token...
✅ Access token ottenuto!
📋 Recupero informazioni utente...
👤 User: Your Name
📧 Email: your.email@example.com

📨 Creazione test envelope...

✅ ===== ENVELOPE CREATO CON SUCCESSO! =====
📋 Envelope ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
📊 Status: sent
📅 Created: 2024-01-15T10:30:00Z

📧 Controlla l'email: your.email@example.com
   Dovresti ricevere l'invito a firmare!

✅ INTEGRAZIONE DOCUSIGN FUNZIONANTE! ✅
```

## What Just Happened?

1. ✅ **OAuth Authorization**: You authorized TeleMedCare to use DocuSign
2. ✅ **Token Obtained**: Access token retrieved and validated
3. ✅ **API Connection**: Successfully connected to DocuSign API
4. ✅ **Envelope Created**: Test document sent for signature
5. ✅ **Email Sent**: DocuSign sent signature request to your email

## Check Your Email

Open your email inbox and look for:
- **From**: DocuSign (dse@docusign.net)
- **Subject**: "🧪 TeleMedCare - Test Firma Elettronica DocuSign"

Click "Review Document" to see the signing interface.

## Files Created

| File | Purpose |
|------|---------|
| `src/modules/docusign-auth.ts` | OAuth 2.0 implementation |
| `src/modules/docusign-integration.ts` | DocuSign API client (updated) |
| `oauth-callback-server.ts` | Test server for OAuth flow |
| `test-docusign-oauth.ts` | Manual OAuth test script |

## Configuration

All in `.dev.vars`:

```env
DOCUSIGN_INTEGRATION_KEY="baf7dff3-8bf8-4587-837d-406adb8be309"
DOCUSIGN_SECRET_KEY="1e51f26a-d618-497a-96a7-c2db567dba5f"
DOCUSIGN_ACCOUNT_ID="031092ba-f573-40b9-ae21-0a3478de03d3"
DOCUSIGN_USER_ID="0b6a7a10-8b3e-49a2-af3a-87495efe7784"
DOCUSIGN_BASE_URL="https://demo.docusign.net/restapi"
DOCUSIGN_REDIRECT_URI="http://localhost:3001/api/docusign/callback"
```

## Next Steps

After successful test:

### 1. Integrate into TeleMedCare Workflow

```typescript
// Example: Send contract for signature
import { createDocuSignClient } from './src/modules/docusign-integration'
import { DocuSignOAuth } from './src/modules/docusign-auth'

// Get OAuth token (one-time authorization)
const oauth = new DocuSignOAuth({ /* config */ })
const token = await oauth.getAccessTokenFromCode(code)

// Create client and use token
const client = createDocuSignClient(env, true)
client.setAccessToken(token.access_token, token.expires_in)

// Send contract
const envelope = await client.createEnvelope({
  documentName: 'Contratto_Telemedicina.pdf',
  documentPdfBase64: contractPdfBase64,
  recipientEmail: lead.email,
  recipientName: lead.name,
  subject: 'Firma Contratto TeleMedCare',
  emailBody: 'Per favore firma il contratto per completare l\'attivazione.'
})
```

### 2. Implement Webhook Handler

```typescript
// Handle signature completion
export async function handleDocuSignWebhook(payload: any) {
  if (payload.event === 'envelope-completed') {
    // Download signed document
    const pdf = await client.downloadSignedDocument(payload.envelopeId)
    
    // Store in database
    await storeSignedContract(pdf)
    
    // Update lead status
    await updateLeadStatus(leadId, 'CONTRACT_SIGNED')
  }
}
```

### 3. Add to Contract Workflow

```typescript
// In complete-workflow-orchestrator.ts
async function sendContractForSignature(lead: Lead) {
  // Generate contract PDF
  const contractPdf = await generateContractPDF(lead)
  
  // Send via DocuSign
  const envelope = await sendToDocuSign(contractPdf, lead)
  
  // Save envelope reference
  await saveEnvelopeReference(lead.id, envelope.envelopeId)
  
  // Update status
  await updateLeadStatus(lead.id, 'SENT_FOR_SIGNATURE')
}
```

## Troubleshooting

### Port 3001 Already in Use

```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9

# Or use a different port
# Edit oauth-callback-server.ts line 8:
const PORT = 3002  // Changed from 3001
```

### Browser Doesn't Redirect

- Check that you're using the exact URL from the terminal
- Ensure you're logged into DocuSign Developer account
- Try in incognito/private browser window

### No Email Received

- Check spam folder
- Verify email address in `oauth-callback-server.ts` line 68
- Check DocuSign admin portal for envelope status
- Email may take 1-2 minutes to arrive

### "Invalid Client" Error

- Verify `DOCUSIGN_INTEGRATION_KEY` matches DocuSign Admin
- Verify `DOCUSIGN_SECRET_KEY` matches DocuSign Admin
- Ensure you're using demo environment credentials

## Documentation

- **Full OAuth Guide**: `docs/DOCUSIGN_OAUTH_GUIDE.md`
- **Setup Instructions**: `docs/DOCUSIGN_SETUP.md`
- **Testing Guide**: `docs/DOCUSIGN_TESTING.md`

## Success Criteria

✅ OAuth server starts without errors
✅ Authorization URL opens in browser
✅ DocuSign login successful
✅ Authorization granted
✅ Access token obtained
✅ Test envelope created
✅ Email received with signature request
✅ Can open and view document in DocuSign

If all checked, your DocuSign integration is working! 🎉

## Support

Having issues? Check:

1. **Console Output**: Look for specific error messages
2. **Credentials**: Verify all values in `.dev.vars`
3. **DocuSign Admin**: Check app configuration
4. **Email**: Ensure valid email address for testing
5. **Network**: Check firewall/proxy settings

## Production Deployment

Before deploying to production:

- [ ] Update redirect URI to production URL
- [ ] Store tokens in database/KV (not memory)
- [ ] Implement token refresh logic
- [ ] Add proper error handling
- [ ] Set up webhook endpoint
- [ ] Test with real documents
- [ ] Configure email templates
- [ ] Set up monitoring/logging

---

**Ready to test?** Run: `npx tsx oauth-callback-server.ts`
