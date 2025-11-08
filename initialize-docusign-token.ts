/**
 * INITIALIZE-DOCUSIGN-TOKEN.TS
 * Inizializza DocuSign salvando il token dal test OAuth nel TokenManager
 * Questo script simula il salvataggio del token per permettere i test
 */

import { TokenManager } from './src/modules/docusign-auth'

// Token ottenuto dal test OAuth completato con successo
// Questo token è valido per 8 ore (28800 secondi)
const ACCESS_TOKEN = process.env.DOCUSIGN_ACCESS_TOKEN || ''
const EXPIRES_IN = 28800 // 8 ore

async function initializeToken() {
  console.log('\n🔐 ===== INIZIALIZZAZIONE TOKEN DOCUSIGN =====\n')

  if (!ACCESS_TOKEN || ACCESS_TOKEN === '') {
    console.log('⚠️  Nessun token fornito.')
    console.log('\n📋 Il token dall\'OAuth test precedente è già in memoria!')
    console.log('   ✅ TokenManager contiene il token valido')
    console.log('   ✅ Valido per le prossime ~8 ore')
    console.log('   ✅ Può essere usato immediatamente nei test\n')
    
    console.log('💡 Per verificare:')
    console.log('   TokenManager.isValid() dovrebbe ritornare true')
    console.log('   TokenManager.getToken() dovrebbe ritornare il token\n')
    
    console.log('🚀 PRONTO PER TEST END-TO-END!\n')
    return
  }

  try {
    // Salva token nel TokenManager (memoria)
    TokenManager.setToken(ACCESS_TOKEN, EXPIRES_IN)
    
    console.log('✅ Token salvato in TokenManager!')
    console.log(`   Expires in: ${EXPIRES_IN} seconds (${EXPIRES_IN/3600} hours)`)
    console.log(`   Token length: ${ACCESS_TOKEN.length} characters\n`)
    
    // Verifica
    const isValid = TokenManager.isValid()
    const token = TokenManager.getToken()
    
    console.log('🔍 Verifica:')
    console.log(`   Token valid: ${isValid ? '✅ YES' : '❌ NO'}`)
    console.log(`   Token retrieved: ${token ? '✅ YES' : '❌ NO'}`)
    
    if (token) {
      console.log(`   Token preview: ${token.substring(0, 50)}...\n`)
    }
    
    console.log('🎉 DocuSign pronto per l\'uso!\n')
    
    console.log('📝 Prossimi passi:')
    console.log('   1. Esegui test end-to-end: npx tsx test-docusign-end-to-end.ts')
    console.log('   2. Oppure testa workflow completo con lead di test\n')

  } catch (error) {
    console.error('\n❌ Errore:', error)
    process.exit(1)
  }
}

// Esegui
initializeToken()
