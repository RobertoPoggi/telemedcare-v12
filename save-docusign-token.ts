/**
 * SAVE-DOCUSIGN-TOKEN.TS
 * Script per salvare manualmente il token DocuSign nel database
 * Usa questo dopo aver completato l'autorizzazione OAuth
 */

import { DocuSignOAuth } from './src/modules/docusign-auth'
import { createDocuSignTokenManager } from './src/modules/docusign-token-manager'

// IMPORTANTE: Inserisci qui il token ottenuto dall'OAuth test
const ACCESS_TOKEN = 'eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAYABwAAe7qfKITeSAgAAOjsWCyE3kgCAD4b3rZoQltErphtbhXE2gwVAAEAAAAYAAEAAAAFAAAADQAkAAAAYmFmN2RmZjMtOGJmOC00NTg3LTgzN2QtNDA2YWRiOGJlMzA5IgAkAAAAYmFmN2RmZjMtOGJmOC00NTg3LTgzN2QtNDA2YWRiOGJlMzA5EgABAAAABgAAAGp3dF9icjcAb9sTxuTtDyAUIMt3YRuXEQ.R3SG8kP-9rEH0B4T7d_o2vNBJw7gZT8DPn4bIBzjAumLOUb01nWrK1o1rQRGSHqtHMJxQv0vU3w6dE9M4gARH8wTwg3HwvN7YZ9Gq-Kbx-9w_AkOWP2pO_rR0u5stCGSHV_b3d59ywfKKa6NQY9vljOdXBo2FcpmGfRaXeN1y0ATApRQQjc71oELPJH-0A_Cr7NlO8xzCqPd2pLjALBnUfJajxqT7KA0XQmMBnXC6t8QfqpnMX8PrBqvODqlOw-HrMTxCvX7qrCfU8yd6SHjFCrWs0wZ8gvFZKMQ9b9VaTrJZLzM_9rBwxK7jlN3F5wqK7aX4z2VdU1g7fQnzA' // SOSTITUISCI CON IL TUO TOKEN
const EXPIRES_IN = 28800  // 8 ore in secondi

async function saveToken() {
  console.log('\n🔐 ===== SALVATAGGIO TOKEN DOCUSIGN =====\n')

  if (ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_HERE') {
    console.error('❌ Errore: Devi inserire il token reale nello script!')
    console.log('\n📋 Per ottenere il token:')
    console.log('   1. Esegui: npx tsx oauth-callback-server.ts')
    console.log('   2. Completa l\'autorizzazione')
    console.log('   3. Copia l\'access token dal terminale')
    console.log('   4. Incollalo in questo script (linea 11)')
    console.log('   5. Esegui: npx tsx save-docusign-token.ts\n')
    process.exit(1)
  }

  try {
    // Importa modulo database (simulato per test locale)
    const { createDocuSignTokenManager } = await import('./src/modules/docusign-token-manager')
    
    // NOTA: In ambiente reale, questo userebbe il vero database D1
    // Per ora simula il salvataggio mostrando i dati
    
    const expiresAt = new Date(Date.now() + EXPIRES_IN * 1000).toISOString()

    console.log('📊 Dati token:')
    console.log('  - Type: Bearer')
    console.log('  - Expires in:', EXPIRES_IN, 'seconds (8 hours)')
    console.log('  - Expires at:', expiresAt)
    console.log('  - Token length:', ACCESS_TOKEN.length, 'characters')
    console.log('  - Token preview:', ACCESS_TOKEN.substring(0, 50) + '...')

    console.log('\n✅ Token pronto per essere salvato!')
    console.log('\n📝 SQL da eseguire nel database:')
    console.log(`
INSERT INTO docusign_tokens (access_token, token_type, expires_at, scope)
VALUES (
  '${ACCESS_TOKEN}',
  'Bearer',
  '${expiresAt}',
  'signature impersonation'
);
`)

    console.log('\n💡 In produzione, il token viene salvato automaticamente dopo OAuth.\n')

  } catch (error) {
    console.error('\n❌ Errore:', error)
    process.exit(1)
  }
}

// Esegui
saveToken()
