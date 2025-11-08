/**
 * INSERT-CURRENT-TOKEN.TS
 * Inserisce il token DocuSign corrente nel database
 * 
 * NOTA: Il token dal test OAuth è ancora valido per ~7-8 ore
 */

// Token ottenuto dal test OAuth precedente
const ACCESS_TOKEN = 'eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAYABwAAe7qfKITeSAgAAOjsWCyE3kgCAD4b3rZoQltErphtbhXE2gwVAAEAAAAYAAEAAAAFAAAADQAkAAAAYmFmN2RmZjMtOGJmOC00NTg3LTgzN2QtNDA2YWRiOGJlMzA5IgAkAAAAYmFmN2RmZjMtOGJmOC00NTg3LTgzN2QtNDA2YWRiOGJlMzA5EgABAAAABgAAAGp3dF9icjcAb9sTxuTtDyAUIMt3YRuXEQ.R3SG8kP-9rEH0B4T7d_o2vNBJw7gZT8DPn4bIBzjAumLOUb01nWrK1o1rQRGSHqtHMJxQv0vU3w6dE9M4gARH8wTwg3HwvN7YZ9Gq-Kbx-9w_AkOWP2pO_rR0u5stCGSHV_b3d59ywfKKa6NQY9vljOdXBo2FcpmGfRaXeN1y0ATApRQQjc71oELPJH-0A_Cr7NlO8xzCqPd2pLjALBnUfJajxqT7KA0XQmMBnXC6t8QfqpnMX8PrBqvODqlOw-HrMTxCvX7qrCfU8yd6SHjFCrWs0wZ8gvFZKMQ9b9VaTrJZLzM_9rBwxK7jlN3F5wqK7aX4z2VdU1g7fQnzA'
const EXPIRES_IN = 28800  // 8 ore in secondi (dalla risposta OAuth)
const TOKEN_TYPE = 'Bearer'
const SCOPE = 'signature impersonation'

// Calcola timestamp scadenza (8 ore da ora - assumiamo token appena ottenuto)
const expiresAt = new Date(Date.now() + (EXPIRES_IN * 1000)).toISOString()

console.log('\n🔐 ===== INSERIMENTO TOKEN DOCUSIGN NEL DATABASE =====\n')
console.log('📊 Informazioni Token:')
console.log('  - Type:', TOKEN_TYPE)
console.log('  - Scope:', SCOPE)
console.log('  - Expires in:', EXPIRES_IN, 'seconds (8 hours)')
console.log('  - Expires at:', expiresAt)
console.log('  - Token length:', ACCESS_TOKEN.length, 'characters')
console.log('  - Token preview:', ACCESS_TOKEN.substring(0, 60) + '...\n')

console.log('📝 Eseguo inserimento nel database...\n')

// Usa wrangler per inserire il token
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function insertToken() {
  try {
    const sql = `INSERT INTO docusign_tokens (access_token, token_type, expires_at, scope) VALUES ('${ACCESS_TOKEN}', '${TOKEN_TYPE}', '${expiresAt}', '${SCOPE}');`
    
    const command = `wrangler d1 execute telemedcare-leads --local --command="${sql}"`
    
    console.log('💾 Esecuzione comando wrangler...')
    const { stdout, stderr } = await execAsync(command, { cwd: '/home/user/webapp' })
    
    if (stderr && !stderr.includes('wrangler')) {
      console.error('❌ Errore:', stderr)
      process.exit(1)
    }
    
    console.log(stdout)
    console.log('\n✅ Token salvato con successo nel database!')
    console.log('\n📋 Verifica:')
    console.log('   wrangler d1 execute telemedcare-leads --local --command="SELECT id, token_type, expires_at FROM docusign_tokens;"')
    
  } catch (error) {
    console.error('\n❌ Errore durante inserimento:', error)
    process.exit(1)
  }
}

insertToken()
