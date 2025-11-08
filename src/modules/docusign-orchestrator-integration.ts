/**
 * DOCUSIGN-ORCHESTRATOR-INTEGRATION.TS
 * Integrazione DocuSign nel Complete Workflow Orchestrator
 * TeleMedCare V11.0
 */

import { sendContractForSignature, ContractSignatureRequest, ContractSignatureResult } from './docusign-workflow'
import { LeadData } from './workflow-email-manager'

export interface DocuSignContractOptions {
  useDocuSign: boolean  // Se true, usa DocuSign; se false, usa email classica
  leadData: LeadData
  contractPdfBuffer: Buffer
  contractId: string
  contractCode: string
}

/**
 * Invia contratto tramite DocuSign o email classica
 */
export async function sendContractWithDocuSign(
  options: DocuSignContractOptions,
  env: any,
  db: D1Database
): Promise<ContractSignatureResult> {
  
  if (!options.useDocuSign) {
    // Fallback: usa email classica (workflow esistente)
    console.log('📧 [DocuSign Integration] Utilizzo email classica (DocuSign disabilitato)')
    return {
      success: true,
      message: 'Contratto inviato via email classica',
    }
  }

  console.log('📝 [DocuSign Integration] Invio contratto tramite DocuSign')

  // Prepara richiesta DocuSign
  const signatureRequest: ContractSignatureRequest = {
    leadId: options.leadData.id,
    contractId: options.contractId,
    contractCode: options.contractCode,
    contractPdfBuffer: options.contractPdfBuffer,
    customerName: `${options.leadData.nomeRichiedente || options.leadData.nome} ${options.leadData.cognomeRichiedente || options.leadData.cognome}`,
    customerEmail: options.leadData.emailRichiedente || options.leadData.email,
    customerPhone: options.leadData.telefonoRichiedente || options.leadData.telefono,
    serviceType: options.leadData.pacchetto || 'Standard',
    price: 0  // TODO: Calcolare dal pricing config
  }

  // Invia tramite DocuSign
  const result = await sendContractForSignature(signatureRequest, env, db)

  if (result.success) {
    console.log('✅ [DocuSign Integration] Contratto inviato con successo:', result.envelopeId)
  } else {
    console.error('❌ [DocuSign Integration] Errore invio contratto:', result.error)
  }

  return result
}

/**
 * Verifica se DocuSign è configurato e disponibile
 */
export async function isDocuSignAvailable(env: any, db: D1Database): Promise<boolean> {
  try {
    // Verifica credenziali DocuSign
    if (!env.DOCUSIGN_INTEGRATION_KEY || !env.DOCUSIGN_SECRET_KEY || !env.DOCUSIGN_ACCOUNT_ID) {
      console.log('⚠️  [DocuSign] Credenziali mancanti')
      return false
    }

    // Verifica token valido
    const { createDocuSignTokenManager } = await import('./docusign-token-manager')
    const tokenManager = createDocuSignTokenManager(db)
    const hasToken = await tokenManager.hasValidToken()

    if (!hasToken) {
      console.log('⚠️  [DocuSign] Nessun token valido disponibile')
      return false
    }

    console.log('✅ [DocuSign] Servizio disponibile e configurato')
    return true

  } catch (error) {
    console.error('❌ [DocuSign] Errore verifica disponibilità:', error)
    return false
  }
}

/**
 * Ottiene URL di autorizzazione DocuSign per primo setup
 */
export function getDocuSignAuthorizationUrl(env: any): string {
  const { DocuSignOAuth } = require('./docusign-auth')
  
  const oauth = new DocuSignOAuth({
    integrationKey: env.DOCUSIGN_INTEGRATION_KEY,
    secretKey: env.DOCUSIGN_SECRET_KEY,
    redirectUri: env.DOCUSIGN_REDIRECT_URI || 'http://localhost:3001/api/docusign/callback',
    baseUrl: env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi'
  })

  return oauth.getAuthorizationUrl()
}

export default {
  sendContractWithDocuSign,
  isDocuSignAvailable,
  getDocuSignAuthorizationUrl
}
