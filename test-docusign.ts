/**
 * TEST DOCUSIGN INTEGRATION
 * Script per testare la connessione DocuSign
 */

import { createDocuSignClient } from './src/modules/docusign-integration'

// Simula environment variables
const env = {
  DOCUSIGN_INTEGRATION_KEY: "baf7dff3-8bf8-4587-837d-406adb8be309",
  DOCUSIGN_SECRET_KEY: "1e51f26a-d618-497a-96a7-c2db567dba5f",
  DOCUSIGN_ACCOUNT_ID: "031092ba-f573-40b9-ae21-0a3478de03d3",
  DOCUSIGN_USER_ID: "0b6a7a10-8b3e-49a2-af3a-87495efe7784",
  DOCUSIGN_BASE_URL: "https://demo.docusign.net/restapi"
}

async function testDocuSign() {
  console.log('🧪 Test DocuSign Integration')
  console.log('================================\n')

  try {
    // 1. Crea client
    console.log('📋 Step 1: Creazione client DocuSign...')
    const client = createDocuSignClient(env)
    console.log('✅ Client creato\n')

    // 2. Test autenticazione (ottieni access token)
    console.log('🔐 Step 2: Test autenticazione...')
    const accessToken = await client.getAccessToken()
    console.log('✅ Access token ottenuto:', accessToken.substring(0, 20) + '...\n')

    // 3. Test creazione envelope (con PDF di prova)
    console.log('📄 Step 3: Test creazione envelope...')
    
    // PDF di prova (documento vuoto minimo)
    const testPdf = btoa('JVBERi0xLjQKJeLjz9MKMSAwIG9iaiA8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iaiAyIDAgb2JqIDw8L1R5cGUvUGFnZXMvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqIDMgMCBvYmogPDwvVHlwZS9QYWdlL01lZGlhQm94WzAgMCA2MTIgNzkyXS9QYXJlbnQgMiAwIFIvUmVzb3VyY2VzPDw+Pj4+ZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDYwIDAwMDAwIG4gCjAwMDAwMDAxMTQgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoxOTYKJSVFT0YK')
    
    const envelopeRequest = {
      documentName: 'Test_Contract.pdf',
      documentPdfBase64: testPdf,
      recipientEmail: 'rpoggi55@gmail.com',
      recipientName: 'Roberto Poggi Test',
      subject: 'Test TeleMedCare - Firma Documento',
      emailBody: 'Questo è un test di integrazione DocuSign.'
    }

    const envelope = await client.createEnvelope(envelopeRequest)
    console.log('✅ Envelope creato con successo!')
    console.log('   Envelope ID:', envelope.envelopeId)
    console.log('   Status:', envelope.status)
    if (envelope.recipientUri) {
      console.log('   🔗 URL firma:', envelope.recipientUri)
    }
    console.log('\n')

    // 4. Verifica stato envelope
    console.log('🔍 Step 4: Verifica stato envelope...')
    const status = await client.getEnvelopeStatus(envelope.envelopeId)
    console.log('✅ Stato envelope:', status.status)
    console.log('   Created:', status.createdDateTime)
    console.log('   Sent:', status.sentDateTime)
    console.log('\n')

    console.log('🎉 TUTTI I TEST COMPLETATI CON SUCCESSO!')
    console.log('\n✉️  Controlla l\'email rpoggi55@gmail.com per il documento da firmare!')

  } catch (error) {
    console.error('\n❌ ERRORE TEST:', error)
    if (error instanceof Error) {
      console.error('   Messaggio:', error.message)
      console.error('   Stack:', error.stack)
    }
  }
}

// Esegui test
testDocuSign()
