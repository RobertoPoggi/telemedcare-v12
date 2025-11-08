import fs from 'fs';
import jwt from 'jsonwebtoken';

// Load environment variables
const INTEGRATION_KEY = "baf7dff3-8bf8-4587-837d-406adb8be309";
const USER_ID = "0b6a7a10-8b3e-49a2-af3a-87495efe7784";
const PRIVATE_KEY_PATH = "./docusign-private.key";
const OAUTH_BASE_URL = "https://account-d.docusign.com";

console.log("🔐 DocuSign JWT Token Generator");
console.log("================================\n");

// Read private key
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
console.log("✅ Private key loaded");

// Create JWT assertion
const now = Math.floor(Date.now() / 1000);
const jwtPayload = {
  iss: INTEGRATION_KEY,  // Integration Key (Client ID)
  sub: USER_ID,          // User ID
  aud: OAUTH_BASE_URL,   // OAuth base URL
  iat: now,              // Issued at
  exp: now + 3600,       // Expires in 1 hour
  scope: "signature impersonation"
};

console.log("📋 JWT Payload:", jwtPayload);

// Sign JWT
const assertion = jwt.sign(jwtPayload, privateKey, {
  algorithm: 'RS256'
});

console.log("\n✅ JWT Assertion created");
console.log("📝 Assertion (first 100 chars):", assertion.substring(0, 100) + "...\n");

// Request access token
console.log("🔄 Requesting access token from DocuSign...\n");

const tokenUrl = `${OAUTH_BASE_URL}/oauth/token`;
const body = new URLSearchParams({
  grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
  assertion: assertion
});

fetch(tokenUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: body.toString()
})
  .then(async (response) => {
    const data = await response.json();
    
    if (!response.ok) {
      console.error("❌ Error response from DocuSign:");
      console.error(JSON.stringify(data, null, 2));
      
      if (data.error === 'consent_required') {
        console.log("\n⚠️  CONSENT REQUIRED!");
        console.log("\n📋 You need to grant consent first. Use this URL:\n");
        const consentUrl = `${OAUTH_BASE_URL}/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=${INTEGRATION_KEY}&redirect_uri=https://www.docusign.com`;
        console.log(consentUrl);
        console.log("\n💡 Steps:");
        console.log("   1. Open the URL above in your browser");
        console.log("   2. Login with your DocuSign account");
        console.log("   3. Click 'Allow' or 'Authorize'");
        console.log("   4. After consent, run this script again\n");
      }
      
      process.exit(1);
    }
    
    console.log("✅ Access token received!\n");
    console.log("📊 Token details:");
    console.log(JSON.stringify(data, null, 2));
    
    // Save token to database
    const expiresIn = data.expires_in || 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    
    console.log("\n💾 Saving token to database...");
    
    // Import database
    const Database = require('better-sqlite3');
    const db = new Database('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/local-telemedcare-leads.sqlite');
    
    try {
      // Delete old tokens
      db.prepare('DELETE FROM docusign_tokens').run();
      
      // Insert new token
      const result = db.prepare(`
        INSERT INTO docusign_tokens (access_token, token_type, expires_at, scope, refresh_token)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        data.access_token,
        data.token_type || 'Bearer',
        expiresAt,
        'signature impersonation',
        null  // JWT doesn't provide refresh token
      );
      
      console.log("✅ Token saved to database with ID:", result.lastInsertRowid);
      console.log("📅 Expires at:", expiresAt);
      console.log(`⏱️  Valid for: ${Math.floor(expiresIn / 60)} minutes\n`);
      
      console.log("🎉 SUCCESS! DocuSign is now ready to use!");
      console.log("🧪 You can test it by submitting a form on your website.\n");
      
      db.close();
    } catch (error) {
      console.error("❌ Error saving token to database:", error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ Network error:", error.message);
    process.exit(1);
  });
