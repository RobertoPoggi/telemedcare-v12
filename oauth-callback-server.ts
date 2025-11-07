/**
 * OAUTH-CALLBACK-SERVER.TS
 * Simple local server to handle DocuSign OAuth callback
 * 
 * Avvia il server, poi apri l'authorization URL nel browser.
 * Il server catturerà automaticamente il code e completerà il test.
 */

import * as http from 'http'
import { DocuSignOAuth, TokenManager } from './src/modules/docusign-auth'

const PORT = 3001

// Configurazione
const config = {
  integrationKey: 'baf7dff3-8bf8-4587-837d-406adb8be309',
  secretKey: '1e51f26a-d618-497a-96a7-c2db567dba5f',
  accountId: '031092ba-f573-40b9-ae21-0a3478de03d3',
  userId: '0b6a7a10-8b3e-49a2-af3a-87495efe7784',
  redirectUri: 'http://localhost:3001/api/docusign/callback',
  baseUrl: 'https://demo.docusign.net/restapi'
}

const oauth = new DocuSignOAuth({
  integrationKey: config.integrationKey,
  secretKey: config.secretKey,
  redirectUri: config.redirectUri,
  baseUrl: config.baseUrl
})

// Test envelope creation
async function testEnvelopeCreation(accessToken: string) {
  try {
    // Minimal PDF
    const testPdfBase64 = Buffer.from(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 80 >>
stream
BT
/F1 24 Tf
50 700 Td
(TeleMedCare Test Contract) Tj
50 650 Td
(Please sign below) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000262 00000 n 
0000000391 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
480
%%EOF`).toString('base64')

    const envelopeDefinition = {
      emailSubject: '🧪 TeleMedCare - Test Firma Elettronica DocuSign',
      emailBlurb: 'Test dell\'integrazione DocuSign per TeleMedCare. Per favore firma il documento di test.',
      status: 'sent',
      documents: [
        {
          documentBase64: testPdfBase64,
          name: 'TeleMedCare_Test_Contract.pdf',
          fileExtension: 'pdf',
          documentId: '1'
        }
      ],
      recipients: {
        signers: [
          {
            email: 'your.email@example.com', // ⚠️ Modifica con la tua email
            name: 'Test User',
            recipientId: '1',
            routingOrder: '1',
            tabs: {
              signHereTabs: [
                {
                  documentId: '1',
                  pageNumber: '1',
                  xPosition: '100',
                  yPosition: '400',
                  tabLabel: 'Firma Qui'
                }
              ],
              dateSignedTabs: [
                {
                  documentId: '1',
                  pageNumber: '1',
                  xPosition: '100',
                  yPosition: '350',
                  tabLabel: 'Data'
                }
              ]
            }
          }
        ]
      }
    }

    console.log('\n📨 Creazione test envelope...')
    console.log('📧 Destinatario:', envelopeDefinition.recipients.signers[0].email)
    
    const url = `${config.baseUrl}/v2.1/accounts/${config.accountId}/envelopes`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(envelopeDefinition)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`DocuSign API error: ${response.status} - ${error}`)
    }

    const result = await response.json()
    
    console.log('\n✅ ===== ENVELOPE CREATO CON SUCCESSO! =====')
    console.log('📋 Envelope ID:', result.envelopeId)
    console.log('📊 Status:', result.status)
    console.log('📅 Created:', result.statusDateTime)
    console.log('\n📧 Controlla l\'email:', envelopeDefinition.recipients.signers[0].email)
    console.log('   Dovresti ricevere l\'invito a firmare!')
    console.log('\n✅ INTEGRAZIONE DOCUSIGN FUNZIONANTE! ✅\n')
    
    return result
  } catch (error) {
    console.error('\n❌ Errore creazione envelope:', error)
    throw error
  }
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '', `http://localhost:${PORT}`)
  
  if (url.pathname === '/api/docusign/callback') {
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')
    
    if (error) {
      console.error('\n❌ OAuth Error:', error)
      console.error('Description:', url.searchParams.get('error_description'))
      
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(`
        <html>
          <body style="font-family: Arial; padding: 50px;">
            <h1 style="color: red;">❌ Authorization Failed</h1>
            <p><strong>Error:</strong> ${error}</p>
            <p><strong>Description:</strong> ${url.searchParams.get('error_description')}</p>
            <p>Check the console for details.</p>
            <button onclick="window.close()">Close</button>
          </body>
        </html>
      `)
      
      setTimeout(() => process.exit(1), 2000)
      return
    }
    
    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/plain' })
      res.end('Missing authorization code')
      return
    }
    
    console.log('\n✅ Authorization code ricevuto!')
    console.log('📨 Code:', code.substring(0, 20) + '...')
    console.log('📋 State:', state)
    
    try {
      // Exchange code for token
      console.log('\n🔄 Scambio code con access token...')
      const tokenResponse = await oauth.getAccessTokenFromCode(code)
      
      console.log('✅ Access token ottenuto!')
      console.log('📊 Expires in:', tokenResponse.expires_in, 'seconds')
      
      // Save token
      TokenManager.setToken(tokenResponse.access_token, tokenResponse.expires_in)
      
      // Get user info
      console.log('\n📋 Recupero informazioni utente...')
      const userInfo = await oauth.getUserInfo(tokenResponse.access_token)
      console.log('👤 User:', userInfo.name)
      console.log('📧 Email:', userInfo.email)
      console.log('🏢 Accounts:', userInfo.accounts?.length || 0)
      
      // Test envelope creation
      await testEnvelopeCreation(tokenResponse.access_token)
      
      // Success response
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(`
        <html>
          <body style="font-family: Arial; padding: 50px; text-align: center;">
            <h1 style="color: green;">✅ DocuSign Authorization Successful!</h1>
            <h2>🎉 Envelope Created Successfully!</h2>
            <div style="background: #f0f0f0; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p><strong>Access Token:</strong> Obtained ✓</p>
              <p><strong>User:</strong> ${userInfo.name}</p>
              <p><strong>Email:</strong> ${userInfo.email}</p>
              <p><strong>Test Envelope:</strong> Created ✓</p>
            </div>
            <p>Check the console for details and check your email for the signature invitation!</p>
            <p style="color: #666; margin-top: 30px;">You can close this window now.</p>
            <button onclick="window.close()" style="padding: 10px 30px; font-size: 16px; cursor: pointer;">Close</button>
          </body>
        </html>
      `)
      
      // Shutdown server after success
      setTimeout(() => {
        console.log('\n🎉 Test completato! Chiusura server...\n')
        server.close()
        process.exit(0)
      }, 2000)
      
    } catch (error: any) {
      console.error('\n❌ Errore durante OAuth flow:', error)
      
      res.writeHead(500, { 'Content-Type': 'text/html' })
      res.end(`
        <html>
          <body style="font-family: Arial; padding: 50px;">
            <h1 style="color: red;">❌ Error</h1>
            <p>${error.message}</p>
            <p>Check the console for details.</p>
            <button onclick="window.close()">Close</button>
          </body>
        </html>
      `)
      
      setTimeout(() => process.exit(1), 2000)
    }
    
    return
  }
  
  // Default response
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not Found')
})

// Start server
server.listen(PORT, () => {
  console.log('\n🚀 ===== DOCUSIGN OAUTH TEST SERVER =====\n')
  console.log(`✅ Server listening on http://localhost:${PORT}`)
  console.log('📋 Callback URL: http://localhost:3001/api/docusign/callback\n')
  
  // Generate and display authorization URL
  const authUrl = oauth.getAuthorizationUrl('test-state-' + Date.now())
  
  console.log('📋 STEP 1: AUTHORIZE APPLICATION')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n🔗 Open this URL in your browser:\n')
  console.log(authUrl)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n📝 Instructions:')
  console.log('  1. Copy the URL above')
  console.log('  2. Open it in your browser')
  console.log('  3. Login with your DocuSign Developer account')
  console.log('  4. Click "Allow Access" to authorize')
  console.log('  5. The server will automatically capture the code')
  console.log('  6. The test will complete automatically\n')
  console.log('⏳ Waiting for authorization...\n')
})
