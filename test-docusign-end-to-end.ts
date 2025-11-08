/**
 * TEST-DOCUSIGN-END-TO-END.TS
 * Test end-to-end completo dell'integrazione DocuSign
 */

import { processNewLead, WorkflowContext } from './src/modules/complete-workflow-orchestrator'
import { TokenManager } from './src/modules/docusign-auth'

// Mock environment
const mockEnv = {
  DOCUSIGN_INTEGRATION_KEY: process.env.DOCUSIGN_INTEGRATION_KEY || 'baf7dff3-8bf8-4587-837d-406adb8be309',
  DOCUSIGN_SECRET_KEY: process.env.DOCUSIGN_SECRET_KEY || '1e51f26a-d618-497a-96a7-c2db567dba5f',
  DOCUSIGN_ACCOUNT_ID: process.env.DOCUSIGN_ACCOUNT_ID || '031092ba-f573-40b9-ae21-0a3478de03d3',
  DOCUSIGN_USER_ID: process.env.DOCUSIGN_USER_ID || '0b6a7a10-8b3e-49a2-af3a-87495efe7784',
  DOCUSIGN_BASE_URL: process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi',
  DOCUSIGN_REDIRECT_URI: process.env.DOCUSIGN_REDIRECT_URI || 'http://localhost:3001/api/docusign/callback',
  PUBLIC_URL: 'http://localhost:3001',
  RESEND_API_KEY: process.env.RESEND_API_KEY || 'test',
  EMAIL_FROM: 'noreply@telemedcare.it',
  EMAIL_TO_INFO: 'info@telemedcare.it'
}

// Mock database
const mockDb = {
  prepare: (sql: string) => ({
    bind: (...args: any[]) => ({
      run: async () => ({ success: true, changes: 1 }),
      first: async () => null,
      all: async () => ({ results: [] })
    }),
    run: async () => ({ success: true, changes: 1 }),
    first: async () => null,
    all: async () => ({ results: [] })
  })
} as any

// Test lead data
const testLeadData = {
  id: `LEAD-TEST-${Date.now()}`,
  nome: 'Mario',
  cognome: 'Rossi',
  email: 'mario.rossi@example.com', // ⚠️ MODIFICA CON TUA EMAIL PER RICEVERE IL TEST
  telefono: '+39 123 456 7890',
  pacchetto: 'BASE',
  vuoleContratto: true,
  vuoleBrochure: false,
  vuoleManuale: false,
  
  // Dati richiedente
  nomeRichiedente: 'Mario',
  cognomeRichiedente: 'Rossi',
  cfRichiedente: 'RSSMRA80A01H501Z',
  indirizzoRichiedente: 'Via Roma 123',
  capRichiedente: '00100',
  cittaRichiedente: 'Roma',
  provinciaRichiedente: 'RM',
  luogoNascitaRichiedente: 'Roma',
  dataNascitaRichiedente: '01/01/1980',
  telefonoRichiedente: '+39 123 456 7890',
  emailRichiedente: 'mario.rossi@example.com',
  
  // Dati assistito (stesso del richiedente)
  nomeAssistito: 'Mario',
  cognomeAssistito: 'Rossi',
  cfAssistito: 'RSSMRA80A01H501Z',
  indirizzoAssistito: 'Via Roma 123',
  capAssistito: '00100',
  cittaAssistito: 'Roma',
  provinciaAssistito: 'RM',
  luogoNascitaAssistito: 'Roma',
  dataNascitaAssistito: '01/01/1980',
  telefonoAssistito: '+39 123 456 7890',
  emailAssistito: 'mario.rossi@example.com',
  
  intestazioneContratto: 'richiedente',
  created_at: new Date().toISOString()
}

async function runEndToEndTest() {
  console.log('\n🧪 ===== TEST END-TO-END DOCUSIGN =====\n')
  
  try {
    // 1. Verifica token DocuSign
    console.log('1️⃣  Verifica Token DocuSign...')
    
    const hasToken = TokenManager.isValid()
    if (!hasToken) {
      console.error('❌ Nessun token DocuSign valido trovato!')
      console.log('\n📋 Esegui prima:')
      console.log('   npx tsx oauth-callback-server.ts')
      console.log('   Oppure: npx tsx initialize-docusign-token.ts\n')
      process.exit(1)
    }
    
    console.log('   ✅ Token DocuSign valido trovato!\n')
    
    // 2. Verifica configurazione
    console.log('2️⃣  Verifica Configurazione...')
    console.log(`   Integration Key: ${mockEnv.DOCUSIGN_INTEGRATION_KEY}`)
    console.log(`   Account ID: ${mockEnv.DOCUSIGN_ACCOUNT_ID}`)
    console.log(`   Base URL: ${mockEnv.DOCUSIGN_BASE_URL}`)
    console.log('   ✅ Configurazione OK!\n')
    
    // 3. Crea context
    console.log('3️⃣  Preparazione Context...')
    const ctx: WorkflowContext = {
      db: mockDb,
      env: mockEnv,
      leadData: testLeadData,
      requestUrl: 'http://localhost:3001'
    }
    console.log(`   Lead ID: ${testLeadData.id}`)
    console.log(`   Email: ${testLeadData.email}`)
    console.log(`   Pacchetto: ${testLeadData.pacchetto}`)
    console.log('   ✅ Context pronto!\n')
    
    // 4. Esegui workflow
    console.log('4️⃣  Esecuzione Workflow...')
    console.log('   📄 Generazione contratto...')
    console.log('   📝 Invio via DocuSign...\n')
    
    const result = await processNewLead(ctx)
    
    // 5. Verifica risultato
    console.log('5️⃣  Risultato:\n')
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    if (result.success) {
      console.log('   ✅ SUCCESS!')
      console.log(`   📋 Message: ${result.message}`)
      
      if (result.data) {
        console.log('\n   📊 Dati:')
        console.log(`      Contract ID: ${result.data.contractId || 'N/A'}`)
        console.log(`      Envelope ID: ${result.data.docusignEnvelopeId || 'N/A'}`)
        console.log(`      Method: ${result.data.method || 'N/A'}`)
        console.log(`      Signing URL: ${result.data.signingUrl || 'N/A'}`)
      }
      
      console.log('\n   🎉 INTEGRAZIONE DOCUSIGN FUNZIONANTE!')
      console.log('   📧 Controlla l\'email per la richiesta di firma!')
      
    } else {
      console.log('   ❌ FAILED')
      console.log(`   Message: ${result.message}`)
      
      if (result.errors && result.errors.length > 0) {
        console.log('\n   Errors:')
        result.errors.forEach(err => console.log(`      - ${err}`))
      }
    }
    
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // 6. Prossimi passi
    console.log('📝 Prossimi Passi:\n')
    
    if (result.success && result.data?.docusignEnvelopeId) {
      console.log('   1. Controlla email:', testLeadData.email)
      console.log('   2. Apri DocuSign Admin per vedere l\'envelope')
      console.log('   3. Firma il documento di test')
      console.log('   4. Verifica webhook (quando configurato)\n')
    } else {
      console.log('   1. Verifica logs sopra per dettagli errore')
      console.log('   2. Controlla token DocuSign valido')
      console.log('   3. Verifica credenziali DocuSign')
      console.log('   4. Riprova test\n')
    }
    
  } catch (error) {
    console.error('\n❌ ERRORE TEST:', error)
    console.error('\nStack:', error instanceof Error ? error.stack : 'N/A')
    process.exit(1)
  }
}

// Run test
console.log('🚀 Avvio test end-to-end DocuSign integration...\n')
runEndToEndTest()
