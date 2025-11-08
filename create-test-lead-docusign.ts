/**
 * CREATE-TEST-LEAD-DOCUSIGN.TS
 * Crea un lead di test e simula il workflow completo con DocuSign
 */

import { processNewLead, WorkflowContext } from './src/modules/complete-workflow-orchestrator'

// Lead di test con dati reali per DocuSign
const testLeadData = {
  id: `LEAD-TEST-${Date.now()}`,
  nome: 'Roberto',
  cognome: 'Poggi',
  email: 'roberto.poggi@telemedcare.it', // TUA EMAIL per ricevere DocuSign
  telefono: '+39 333 1234567',
  pacchetto: 'TELEMEDCARE ADVANCED',
  
  // Dati richiedente (intestatario contratto)
  nomeRichiedente: 'Roberto',
  cognomeRichiedente: 'Poggi',
  cfRichiedente: 'PGGRBR80A01H501Z', // CF di esempio
  indirizzoRichiedente: 'Via Roma 123',
  capRichiedente: '00100',
  cittaRichiedente: 'Roma',
  provinciaRichiedente: 'RM',
  luogoNascitaRichiedente: 'Roma',
  dataNascitaRichiedente: '1980-01-01',
  telefonoRichiedente: '+39 333 1234567',
  emailRichiedente: 'roberto.poggi@telemedcare.it',
  
  // Dati assistito (uguale a richiedente per test)
  nomeAssistito: 'Roberto',
  cognomeAssistito: 'Poggi',
  cfAssistito: 'PGGRBR80A01H501Z',
  indirizzoAssistito: 'Via Roma 123',
  capAssistito: '00100',
  cittaAssistito: 'Roma',
  provinciaAssistito: 'RM',
  luogoNascitaAssistito: 'Roma',
  dataNascitaAssistito: '1980-01-01',
  telefonoAssistito: '+39 333 1234567',
  emailAssistito: 'roberto.poggi@telemedcare.it',
  
  // Opzioni richieste
  vuoleContratto: true,  // ⚠️ IMPORTANTE: true per attivare DocuSign
  vuoleBrochure: false,
  vuoleManuale: false,
  
  // Intestazione contratto
  intestazioneContratto: 'richiedente',
  
  // Privacy
  consensoPrivacy: true,
  consensoMarketing: true,
  
  // Metadata
  canale: 'DIRECT',
  origine: 'test-manuale-docusign',
  ip_address: '127.0.0.1',
  user_agent: 'Test Script',
  created_at: new Date().toISOString()
}

async function createAndProcessTestLead() {
  console.log('\n🚀 ===== TEST MANUALE DOCUSIGN =====\n')
  console.log('📋 Creazione lead di test...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  console.log('👤 Lead Info:')
  console.log('  - ID:', testLeadData.id)
  console.log('  - Nome:', testLeadData.nome, testLeadData.cognome)
  console.log('  - Email:', testLeadData.email)
  console.log('  - Pacchetto:', testLeadData.pacchetto)
  console.log('  - Vuole Contratto:', testLeadData.vuoleContratto ? '✅ SI' : '❌ NO')
  console.log()

  // Mock environment (carica da .dev.vars)
  const env = {
    RESEND_API_KEY: process.env.RESEND_API_KEY || 're_Pnq97oxZ_Mc2X78wVvsaxDHZhpvpA8JGt',
    EMAIL_FROM: 'noreply@telemedcare.it',
    EMAIL_TO_INFO: 'info@telemedcare.it',
    
    // DocuSign
    DOCUSIGN_INTEGRATION_KEY: 'baf7dff3-8bf8-4587-837d-406adb8be309',
    DOCUSIGN_SECRET_KEY: '1e51f26a-d618-497a-96a7-c2db567dba5f',
    DOCUSIGN_ACCOUNT_ID: '031092ba-f573-40b9-ae21-0a3478de03d3',
    DOCUSIGN_USER_ID: '0b6a7a10-8b3e-49a2-af3a-87495efe7784',
    DOCUSIGN_BASE_URL: 'https://demo.docusign.net/restapi',
    DOCUSIGN_REDIRECT_URI: 'https://3001-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/api/docusign/callback',
    PUBLIC_URL: 'https://telemedcare.it',
    
    DEBUG_MODE: 'true'
  }

  // Mock D1 Database (usa wrangler per query reali)
  const db = {
    prepare: (query: string) => {
      return {
        bind: (...params: any[]) => ({
          run: async () => {
            console.log('  📝 SQL:', query.substring(0, 80) + '...')
            console.log('  📊 Params:', params.length, 'parameters')
            return { success: true, meta: { changes: 1 } }
          },
          first: async () => null,
          all: async () => ({ results: [] })
        })
      }
    }
  } as any

  try {
    console.log('🔄 Avvio workflow processNewLead()...\n')
    
    // Crea context per workflow
    const ctx: WorkflowContext = {
      db,
      env,
      leadData: testLeadData as any,
      requestUrl: 'http://localhost:3000'
    }

    // 🎯 ESEGUI WORKFLOW
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎯 STEP 1: Processamento Lead con DocuSign')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    const result = await processNewLead(ctx)
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 RISULTATO WORKFLOW')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    console.log('Status:', result.success ? '✅ SUCCESS' : '❌ FAILED')
    console.log('Step:', result.step)
    console.log('Message:', result.message)
    
    if (result.data) {
      console.log('\n📋 Data:')
      console.log('  - Contract ID:', result.data.contractId)
      console.log('  - Method:', result.data.method)
      
      if (result.data.docusignEnvelopeId) {
        console.log('  - 🎉 DocuSign Envelope ID:', result.data.docusignEnvelopeId)
        console.log('  - 🔗 Signing URL:', result.data.signingUrl)
      }
      
      if (result.data.emailsSent) {
        console.log('  - Emails Sent:', result.data.emailsSent)
      }
    }
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  Errors:')
      result.errors.forEach(err => console.log('  -', err))
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    if (result.success) {
      console.log('\n✅ ===== TEST COMPLETATO CON SUCCESSO! =====\n')
      
      if (result.data?.method === 'docusign') {
        console.log('🎯 CONTRATTO INVIATO VIA DOCUSIGN!')
        console.log('\n📧 Prossimi passi:')
        console.log('  1. Controlla email:', testLeadData.email)
        console.log('  2. Cerca email da: dse@docusign.net')
        console.log('  3. Oggetto: "TeleMedCare - Contratto ... da Firmare"')
        console.log('  4. Clicca "Rivedi Documento" per firmare')
        console.log('\n💡 Envelope ID:', result.data.docusignEnvelopeId)
        console.log('   Puoi verificarlo su DocuSign Admin')
        console.log()
      } else if (result.data?.method === 'email') {
        console.log('📧 Contratto inviato via email classica')
        console.log('   (DocuSign non era disponibile)')
        console.log()
      } else if (result.data?.method === 'email_fallback') {
        console.log('⚠️  DocuSign fallito, usato fallback email')
        console.log()
      }
    } else {
      console.log('\n❌ ===== TEST FALLITO =====\n')
      console.log('Errori:')
      result.errors?.forEach(err => console.log('  -', err))
      console.log()
    }
    
  } catch (error) {
    console.error('\n❌ ===== ERRORE DURANTE TEST =====\n')
    console.error(error)
    console.log()
    process.exit(1)
  }
}

// Esegui test
console.log('\n⚠️  NOTA IMPORTANTE:')
console.log('Questo test userà il token DocuSign reale e creerà un envelope vero!')
console.log('Riceverai un\'email reale con richiesta di firma.\n')

console.log('Vuoi continuare? (Ctrl+C per annullare)\n')

// Pausa di 3 secondi per permettere di annullare
setTimeout(() => {
  createAndProcessTestLead().catch(error => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })
}, 3000)
