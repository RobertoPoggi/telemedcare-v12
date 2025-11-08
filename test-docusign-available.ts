/**
 * TEST-DOCUSIGN-AVAILABLE.TS
 * Testa la funzione isDocuSignAvailable() per capire perché non ha usato DocuSign
 */

import { isDocuSignAvailable } from './src/modules/docusign-orchestrator-integration'

// Environment
const env = {
  DOCUSIGN_INTEGRATION_KEY: 'baf7dff3-8bf8-4587-837d-406adb8be309',
  DOCUSIGN_SECRET_KEY: '1e51f26a-d618-497a-96a7-c2db567dba5f',
  DOCUSIGN_ACCOUNT_ID: '031092ba-f573-40b9-ae21-0a3478de03d3',
  DOCUSIGN_USER_ID: '0b6a7a10-8b3e-49a2-af3a-87495efe7784',
  DOCUSIGN_BASE_URL: 'https://demo.docusign.net/restapi',
}

// Mock D1 Database
import { exec } from 'child_process'
import { promisify } from 'util'
const execAsync = promisify(exec)

const mockDb = {
  prepare: (query: string) => ({
    bind: (...params: any[]) => ({
      first: async () => {
        try {
          // Esegui query reale con wrangler
          const { stdout } = await execAsync(
            `wrangler d1 execute telemedcare-leads --local --command="${query.replace(/'/g, "''")}"`,
            { cwd: '/home/user/webapp' }
          )
          
          const match = stdout.match(/\[\s*\{[\s\S]*\}\s*\]/)?.[0]
          if (match) {
            const response = JSON.parse(match)
            return response[0]?.results?.[0] || null
          }
          return null
        } catch (error) {
          console.error('Query error:', error)
          return null
        }
      }
    })
  })
} as any

async function testAvailability() {
  console.log('\n🔍 ===== TEST DOCUSIGN AVAILABILITY =====\n')
  
  console.log('📋 Verifico credenziali environment...')
  console.log('  - DOCUSIGN_INTEGRATION_KEY:', env.DOCUSIGN_INTEGRATION_KEY ? '✅' : '❌')
  console.log('  - DOCUSIGN_SECRET_KEY:', env.DOCUSIGN_SECRET_KEY ? '✅' : '❌')
  console.log('  - DOCUSIGN_ACCOUNT_ID:', env.DOCUSIGN_ACCOUNT_ID ? '✅' : '❌')
  console.log()
  
  console.log('📋 Chiamo isDocuSignAvailable()...\n')
  
  try {
    const available = await isDocuSignAvailable(env, mockDb)
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 RISULTATO:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    if (available) {
      console.log('✅ DocuSign DISPONIBILE')
      console.log('\n🎯 Sistema dovrebbe usare DocuSign!')
      console.log('\nSe ha usato email classica, il problema è nel workflow.')
    } else {
      console.log('❌ DocuSign NON DISPONIBILE')
      console.log('\n⚠️  Questo spiega perché ha usato email classica!')
      console.log('\nPossibili cause:')
      console.log('  - Token non trovato nel database')
      console.log('  - Token scaduto')
      console.log('  - Credenziali mancanti')
    }
    
    console.log()
    
  } catch (error) {
    console.error('\n❌ Errore durante test:', error)
  }
}

testAvailability()
