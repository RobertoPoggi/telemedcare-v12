import http from 'http';
import { URLSearchParams } from 'url';

const INTEGRATION_KEY = "baf7dff3-8bf8-4587-837d-406adb8be309";
const SECRET_KEY = "1e51f26a-d618-497a-96a7-c2db567dba5f";
const REDIRECT_URI = "http://localhost:3001/api/docusign/callback";
const PORT = 3001;

console.log("🔐 DocuSign OAuth Helper Server");
console.log("================================\n");

// Create HTTP server to handle callback
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url!, `http://localhost:${PORT}`);
  
  if (url.pathname === '/api/docusign/callback') {
    const code = url.searchParams.get('code');
    
    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h1>Error: No authorization code received</h1>');
      return;
    }
    
    console.log("\n✅ Authorization code received:", code.substring(0, 50) + "...");
    console.log("\n🔄 Exchanging code for access token...\n");
    
    // Exchange code for token
    const credentials = Buffer.from(`${INTEGRATION_KEY}:${SECRET_KEY}`).toString('base64');
    const tokenUrl = 'https://account-d.docusign.com/oauth/token';
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code
    });
    
    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("❌ Error from DocuSign:", data);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>Error</h1><pre>${JSON.stringify(data, null, 2)}</pre>`);
        return;
      }
      
      console.log("✅ Access token received!");
      console.log("📊 Token details:", JSON.stringify(data, null, 2));
      
      // Save to database
      const expiresIn = data.expires_in || 28800; // 8 hours
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
      
      console.log("\n💾 Saving token to database...");
      
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
          data.scope || 'signature impersonation',
          data.refresh_token || null
        );
        
        console.log("✅ Token saved to database with ID:", result.lastInsertRowid);
        console.log("📅 Expires at:", expiresAt);
        console.log(`⏱️  Valid for: ${Math.floor(expiresIn / 60)} minutes\n`);
        
        db.close();
        
        // Success response
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>DocuSign Authorization Success</title></head>
            <body style="font-family: Arial; padding: 50px; text-align: center;">
              <h1 style="color: green;">✅ Success!</h1>
              <p>DocuSign token has been saved successfully.</p>
              <p>Token expires at: <strong>${expiresAt}</strong></p>
              <p>Valid for: <strong>${Math.floor(expiresIn / 60)} minutes</strong></p>
              <hr>
              <p>You can close this window and return to the terminal.</p>
            </body>
          </html>
        `);
        
        console.log("🎉 SUCCESS! Token saved. You can close the browser and stop this server (Ctrl+C)\n");
        
      } catch (error) {
        console.error("❌ Error saving token:", error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>Error saving token</h1><pre>${error}</pre>`);
      }
      
    } catch (error: any) {
      console.error("❌ Network error:", error.message);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<h1>Network Error</h1><pre>${error.message}</pre>`);
    }
    
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}\n`);
  console.log("📋 STEP 1: Open this URL in your browser:\n");
  
  const authUrl = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=${INTEGRATION_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  
  console.log(authUrl);
  console.log("\n📋 STEP 2: Login with your DocuSign Developer account");
  console.log("📋 STEP 3: Click 'Allow' to authorize");
  console.log("📋 STEP 4: You'll be redirected back here automatically\n");
  console.log("⏳ Waiting for authorization...\n");
});
