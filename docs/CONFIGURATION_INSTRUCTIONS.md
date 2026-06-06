# Cloudflare Pages Secret Configuration

## ✅ Fixed wrangler.jsonc Configuration

Changed unsupported environment names:
- ~~"test"~~ → **"preview"** ✅
- ~~"staging"~~ → **removed** ✅
- **"production"** → kept ✅

Both "preview" and "production" now use the same D1 database:
- **Database Name:** telemedcare-leads
- **Database ID:** e49ad96c-a4c7-4d3e-b2b9-4f3e8a1c5d7f

---

## 🔐 API Keys to Configure as Cloudflare Secrets

### Required Secrets:

1. **SENDGRID_API_KEY**
   ```
   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
   ```

2. **RESEND_API_KEY**
   ```
   re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2
   ```

3. **EMAIL_FROM** (environment variable)
   ```
   noreply@ecura.it
   ```

4. **EMAIL_TO_INFO** (environment variable)
   ```
   info@ecura.it
   ```

---

## 📋 Configuration Methods

### Method 1: Cloudflare Dashboard (RECOMMENDED - No API token needed)

1. Go to **Cloudflare Dashboard** → **Pages**
2. Select project: **telemedcare-v11**
3. Go to **Settings** → **Environment Variables**
4. Add each secret for **Production** environment:
   - Name: `SENDGRID_API_KEY`
   - Value: `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`
   - Type: **Encrypted** (secret)
   
   - Name: `RESEND_API_KEY`
   - Value: `re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2`
   - Type: **Encrypted** (secret)
   
   - Name: `EMAIL_FROM`
   - Value: `noreply@ecura.it`
   - Type: **Plain text**
   
   - Name: `EMAIL_TO_INFO`
   - Value: `info@ecura.it`
   - Type: **Plain text**

5. **Repeat for Preview environment** (optional, for testing)

6. **Redeploy** the project for secrets to take effect

---

### Method 2: Wrangler CLI (Requires Cloudflare API Token)

If you have a Cloudflare API token, you can use:

```bash
# Set the token as environment variable
export CLOUDFLARE_API_TOKEN="your-api-token-here"

# Configure secrets
cd /home/user/webapp
echo "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" | npx wrangler pages secret put SENDGRID_API_KEY --project-name=telemedcare-v11

echo "re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2" | npx wrangler pages secret put RESEND_API_KEY --project-name=telemedcare-v11
```

**To create API token:**
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use template: **Edit Cloudflare Workers**
4. Add permissions for Pages projects
5. Copy the token and set as `CLOUDFLARE_API_TOKEN` environment variable

---

## ⚠️ Why This Is Critical

Currently, the email service is running in **DEMO MODE** because API keys are not configured in the production environment.

**Symptom:**
- API returns `success: true` ✅
- But emails are **NOT actually sent** ❌
- User rpoggi55@gmail.com receives **NO emails**
- info@ecura.it receives email but with **OLD template data** (missing CF, indirizzo, condizioni salute)

**Root Cause:**
```typescript
// src/modules/email-service.ts - Lines 452-458
// Fallback when ALL providers fail (no API keys configured)
console.log('📧 Tutti i provider falliti, modalità demo')
return {
  success: true,  // ❌ Returns success but email NOT sent!
  messageId: `DEMO_${Date.now()}_${Math.random().toString(36).substring(2)}`,
  timestamp: new Date().toISOString()
}
```

**After configuring secrets:**
- SendGrid will actually send emails ✅
- Resend will be available as backup ✅
- All workflow emails will arrive correctly ✅

---

## 🔄 Next Steps After Configuration

1. **Redeploy the application** (secrets only apply to new deployments)
   ```bash
   cd /home/user/webapp
   git add -A
   git commit -m "fix: wrangler.jsonc environment configuration for Pages"
   git push origin main
   ```

2. **Verify deployment** uses the new secrets

3. **Test complete workflow** with rpoggi55@gmail.com:
   - ✅ Round 1: Lead submission → email_notifica_info
   - ✅ Round 2: Send contract → email_invio_contratto
   - ✅ Round 3: After signature → email_invio_proforma
   - ✅ Round 4: After payment → email_benvenuto
   - ✅ Round 5: After config → automatic notification
   - ✅ Round 6: After device → email_conferma

4. **Verify all fields present** in emails:
   - ✅ CF richiedente
   - ✅ Indirizzo richiedente
   - ✅ Condizioni salute (note)

---

## 📝 Local Development (Already Configured)

For local development, API keys are already in `.dev.vars`:

```bash
SENDGRID_API_KEY=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
RESEND_API_KEY=re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2
EMAIL_FROM=noreply@ecura.it
EMAIL_TO_INFO=info@ecura.it
```

Local testing works with: `npm run dev`

---

## 🎯 Summary

**What was fixed:**
- ✅ wrangler.jsonc environment names (removed "test"/"staging", kept "preview"/"production")
- ✅ Landing page encoding errors ("dove c'è necessità")
- ✅ Timezone handling (Europe/Rome)
- ✅ Enhanced workflow email data (all fields included)
- ✅ Database migration prepared (0016_add_extended_lead_fields.sql)

**What needs to be done (requires Cloudflare dashboard access):**
- ⏳ Configure SENDGRID_API_KEY as encrypted secret
- ⏳ Configure RESEND_API_KEY as encrypted secret
- ⏳ Configure EMAIL_FROM as plain text variable
- ⏳ Configure EMAIL_TO_INFO as plain text variable
- ⏳ Redeploy application
- ⏳ Apply database migration 0016 to remote D1:
  ```bash
  npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0016_add_extended_lead_fields.sql
  ```

**Once secrets are configured:**
- All emails will send correctly via SendGrid/Resend
- Complete 6-round workflow testing can proceed
- Dashboard implementation can begin (original request)
