/**
 * TEST-DOCUSIGN-OAUTH.TS
 * Test OAuth 2.0 Authorization Code Grant Flow
 * 
 * Questo script guida attraverso il flusso OAuth completo:
 * 1. Genera URL di autorizzazione
 * 2. User visita URL e autorizza
 * 3. DocuSign redirige con code
 * 4. Scambia code con access token
 * 5. Testa creazione envelope
 */

import { DocuSignOAuth, TokenManager } from './src/modules/docusign-auth'
import * as fs from 'fs'

// Configurazione da .dev.vars
const config = {
  integrationKey: 'baf7dff3-8bf8-4587-837d-406adb8be309',
  secretKey: '1e51f26a-d618-497a-96a7-c2db567dba5f',
  accountId: '031092ba-f573-40b9-ae21-0a3478de03d3',
  userId: '0b6a7a10-8b3e-49a2-af3a-87495efe7784',
  redirectUri: 'http://localhost:3001/api/docusign/callback',
  baseUrl: 'https://demo.docusign.net/restapi'
}

/**
 * Step 1: Genera Authorization URL
 */
async function step1_generateAuthUrl() {
  console.log('\n🔐 ===== STEP 1: AUTHORIZATION URL =====\n')
  
  const oauth = new DocuSignOAuth({
    integrationKey: config.integrationKey,
    secretKey: config.secretKey,
    redirectUri: config.redirectUri,
    baseUrl: config.baseUrl
  })

  const authUrl = oauth.getAuthorizationUrl('test-state-123')
  
  console.log('📋 ISTRUZIONI:')
  console.log('1. Apri questo URL nel browser:')
  console.log('\n' + authUrl + '\n')
  console.log('2. Accedi con il tuo account DocuSign Developer')
  console.log('3. Autorizza l\'applicazione')
  console.log('4. Verrai rediretto a: ' + config.redirectUri)
  console.log('5. Copia il "code" dalla URL di redirect')
  console.log('   Esempio: http://localhost:3001/api/docusign/callback?code=XXXXX&state=test-state-123')
  console.log('\n⚠️  Il code scade dopo pochi minuti!\n')
  
  return authUrl
}

/**
 * Step 2: Scambia code con access token
 */
async function step2_exchangeCodeForToken(code: string) {
  console.log('\n🔄 ===== STEP 2: TOKEN EXCHANGE =====\n')
  console.log('📨 Authorization Code ricevuto:', code.substring(0, 20) + '...')
  
  const oauth = new DocuSignOAuth({
    integrationKey: config.integrationKey,
    secretKey: config.secretKey,
    redirectUri: config.redirectUri,
    baseUrl: config.baseUrl
  })

  try {
    console.log('🔐 Scambio code con access token...')
    const tokenResponse = await oauth.getAccessTokenFromCode(code)
    
    console.log('✅ Token ottenuto con successo!')
    console.log('📊 Token Info:')
    console.log('  - Type:', tokenResponse.token_type)
    console.log('  - Expires in:', tokenResponse.expires_in, 'seconds')
    console.log('  - Access Token:', tokenResponse.access_token.substring(0, 30) + '...')
    
    // Salva token per uso successivo
    TokenManager.setToken(tokenResponse.access_token, tokenResponse.expires_in)
    
    console.log('\n✅ Token salvato in TokenManager')
    
    // Ottieni user info
    console.log('\n📋 Ottengo informazioni utente...')
    const userInfo = await oauth.getUserInfo(tokenResponse.access_token)
    console.log('👤 User Info:', JSON.stringify(userInfo, null, 2))
    
    return tokenResponse
    
  } catch (error) {
    console.error('❌ Errore durante token exchange:', error)
    throw error
  }
}

/**
 * Step 3: Testa creazione envelope con token OAuth
 */
async function step3_testEnvelopeCreation(accessToken: string) {
  console.log('\n📋 ===== STEP 3: TEST ENVELOPE CREATION =====\n')
  
  try {
    // Crea un PDF di test minimale
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
<< /Length 44 >>
stream
BT
/F1 24 Tf
50 700 Td
(Test Contract) Tj
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
0000000355 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
444
%%EOF`).toString('base64')

    // Envelope definition
    const envelopeDefinition = {
      emailSubject: '🧪 Test DocuSign - Firma Contratto TeleMedCare',
      emailBlurb: 'Questo è un test dell\'integrazione DocuSign. Per favore firma il documento.',
      status: 'sent',
      documents: [
        {
          documentBase64: testPdfBase64,
          name: 'Test_Contract.pdf',
          fileExtension: 'pdf',
          documentId: '1'
        }
      ],
      recipients: {
        signers: [
          {
            email: 'test@example.com', // ⚠️ MODIFICA CON TUA EMAIL
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
              ]
            }
          }
        ]
      }
    }

    console.log('📨 Creazione envelope...')
    console.log('📧 Email destinatario:', envelopeDefinition.recipients.signers[0].email)
    
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
    
    console.log('✅ Envelope creato con successo!')
    console.log('📋 Envelope ID:', result.envelopeId)
    console.log('📊 Status:', result.status)
    console.log('📅 Created:', result.statusDateTime)
    
    console.log('\n✅ INTEGRAZIONE DOCUSIGN FUNZIONANTE! ✅')
    console.log('\n📧 Controlla l\'email:', envelopeDefinition.recipients.signers[0].email)
    console.log('   Dovresti ricevere l\'invito a firmare il documento.')
    
    return result
    
  } catch (error) {
    console.error('❌ Errore creazione envelope:', error)
    throw error
  }
}

/**
 * Main Flow
 */
async function main() {
  console.log('🚀 ===== DOCUSIGN OAUTH TEST =====')
  console.log('📋 Testing Authorization Code Grant Flow\n')
  
  // Controlla se abbiamo un code come argomento
  const args = process.argv.slice(2)
  const code = args.find(arg => arg.startsWith('code='))?.split('=')[1]
  
  if (!code) {
    // Step 1: Genera URL e attendi user input
    await step1_generateAuthUrl()
    console.log('\n⏸️  Dopo aver autorizzato, esegui:')
    console.log('   tsx test-docusign-oauth.ts code=<IL_TUO_CODE>\n')
    return
  }
  
  // Step 2: Scambia code con token
  const tokenResponse = await step2_exchangeCodeForToken(code)
  
  // Step 3: Testa envelope creation
  await step3_testEnvelopeCreation(tokenResponse.access_token)
  
  console.log('\n✅ ===== TEST COMPLETATO CON SUCCESSO! =====\n')
}

// Run
main().catch(error => {
  console.error('\n❌ Test failed:', error)
  process.exit(1)
})
