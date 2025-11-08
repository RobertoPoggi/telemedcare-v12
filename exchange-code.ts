const INTEGRATION_KEY = "baf7dff3-8bf8-4587-837d-406adb8be309";
const SECRET_KEY = "1e51f26a-d618-497a-96a7-c2db567dba5f";
const CODE = "eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAYABwAACaOGsx7eSAgAAJUpzrMe3kgCABB6ags-i6JJrzqHSV7-d4QVAAEAAAAYAAIAAAAFAAAAHQAAAA0AJAAAAGJhZjdkZmYzLThiZjgtNDU4Ny04MzdkLTQwNmFkYjhiZTMwOSIAJAAAAGJhZjdkZmYzLThiZjgtNDU4Ny04MzdkLTQwNmFkYjhiZTMwOTcAqp1I0VK030KGJ9CN9SzktTAAgK0ILLEe3kg.dh-v7r-JDzOo_roAKoR-uH1XTCf4nge4kiP8k7a6RwG9NRNwk5HKW2TdMYTjfzeEpUDPwooXEwMMp2NcugVddPc0JfR6lpMF9o2K5qQdHfjfKkRAUznYXxUVTcDwfjmco_gTYQ5dHy0UAb04eiu8J1xZKN78h94_WnhFwmKoikHYCxicIADZ6W-6AkDAeTGXR4Nia670Tdltnk-_laAYHfMmEhVlR2URoBWCj4zhQXs5BtIPVkUM-r2JVWEweZA0LHe_26Q-Fz4B2dbIfQaEYEa-jfVqe3-qPrvZmKBaeyPb-uUMWior8VKcY1EbFjm2fLwIUEK_xaCgNBJ9VrYUbg";

console.log("🔄 Scambio codice per access token...\n");

const credentials = Buffer.from(`${INTEGRATION_KEY}:${SECRET_KEY}`).toString('base64');
const tokenUrl = 'https://account-d.docusign.com/oauth/token';
const body = new URLSearchParams({
  grant_type: 'authorization_code',
  code: CODE
});

(async () => {
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });
  
  {
    const data = await response.json();
    
    if (!response.ok) {
      console.error("❌ Errore da DocuSign:");
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }
    
    console.log("✅ Token ricevuto!\n");
    console.log(JSON.stringify(data, null, 2));
    
    // Save to database
    const expiresIn = data.expires_in || 28800;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    
    console.log("\n💾 Salvataggio nel database...");
    
    const Database = (await import('better-sqlite3')).default;
    const db = new Database('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/local-telemedcare-leads.sqlite');
    
    try {
      db.prepare('DELETE FROM docusign_tokens').run();
      
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
      
      console.log("✅ Token salvato con ID:", result.lastInsertRowid);
      console.log("📅 Scadenza:", expiresAt);
      console.log(`⏱️  Valido per: ${Math.floor(expiresIn / 60)} minuti\n`);
      console.log("🎉 DocuSign è pronto! Puoi testarlo inviando un form!\n");
      
      db.close();
    } catch (error) {
      console.error("❌ Errore salvataggio:", error);
      process.exit(1);
    }
  }
})().catch((error) => {
  console.error("❌ Errore di rete:", error.message);
  process.exit(1);
});
