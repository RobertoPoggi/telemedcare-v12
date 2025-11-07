/**
 * DOCUSIGN_WORKFLOW.TS - Workflow Firma Contratto con DocuSign
 * TeleMedCare V11.0
 * 
 * Integra DocuSign nel workflow esistente di invio contratto
 */

import { createDocuSignClient, DocuSignEnvelopeRequest } from './docusign-integration'

export interface ContractSignatureRequest {
  leadId: string
  contractId: string
  contractCode: string
  contractPdfBuffer: Buffer  // PDF del contratto
  customerName: string
  customerEmail: string
  customerPhone?: string
  serviceType: string
  price: number
}

export interface ContractSignatureResult {
  success: boolean
  envelopeId?: string
  signingUrl?: string
  error?: string
  message: string
}

/**
 * Invia contratto per firma tramite DocuSign
 */
export async function sendContractForSignature(
  request: ContractSignatureRequest,
  env: any,
  db: D1Database
): Promise<ContractSignatureResult> {
  try {
    console.log('📝 [DocuSign Workflow] Invio contratto per firma:', {
      lead: request.leadId,
      contract: request.contractCode,
      customer: request.customerEmail
    })

    // 1. Converti PDF Buffer in Base64
    const pdfBase64 = request.contractPdfBuffer.toString('base64')

    // 2. Crea client DocuSign
    const docusignClient = createDocuSignClient(env)

    // 3. Prepara richiesta envelope
    const envelopeRequest: DocuSignEnvelopeRequest = {
      documentName: `Contratto_TeleMedCare_${request.contractCode}.pdf`,
      documentPdfBase64: pdfBase64,
      recipientEmail: request.customerEmail,
      recipientName: request.customerName,
      subject: `TeleMedCare - Contratto ${request.serviceType} da Firmare`,
      emailBody: `Gentile ${request.customerName},\n\n` +
        `In allegato trova il contratto per il servizio ${request.serviceType}.\n\n` +
        `Per procedere con l'attivazione, la preghiamo di firmare elettronicamente il documento cliccando sul pulsante "Rivedi Documento".\n\n` +
        `Il Team TeleMedCare`,
      callbackUrl: `${env.PUBLIC_URL || 'https://telemedcare.it'}/api/docusign/webhook`
    }

    // 4. Crea envelope DocuSign
    const envelope = await docusignClient.createEnvelope(envelopeRequest)

    console.log('✅ [DocuSign Workflow] Envelope creato:', envelope.envelopeId)

    // 5. Salva riferimento DocuSign nel database
    await saveDocuSignReference(db, {
      envelopeId: envelope.envelopeId,
      leadId: request.leadId,
      contractId: request.contractId,
      status: 'sent',
      recipientEmail: request.customerEmail,
      signingUrl: envelope.recipientUri
    })

    // 6. Aggiorna stato contratto
    await db.prepare(`
      UPDATE contracts 
      SET 
        status = 'SENT_FOR_SIGNATURE',
        docusign_envelope_id = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(envelope.envelopeId, request.contractId).run()

    return {
      success: true,
      envelopeId: envelope.envelopeId,
      signingUrl: envelope.recipientUri,
      message: 'Contratto inviato per firma DocuSign'
    }

  } catch (error) {
    console.error('❌ [DocuSign Workflow] Errore:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore invio contratto',
      message: 'Impossibile inviare contratto per firma'
    }
  }
}

/**
 * Gestisce webhook DocuSign per aggiornamenti stato firma
 */
export async function handleDocuSignWebhook(
  payload: any,
  env: any,
  db: D1Database
): Promise<void> {
  try {
    console.log('🔔 [DocuSign Webhook] Evento ricevuto:', payload.event)

    const envelopeId = payload.data?.envelopeId || payload.envelopeId
    if (!envelopeId) {
      console.warn('⚠️ [DocuSign Webhook] Envelope ID mancante')
      return
    }

    // Recupera riferimento DocuSign dal DB
    const reference = await db.prepare(`
      SELECT * FROM docusign_envelopes 
      WHERE envelope_id = ?
    `).bind(envelopeId).first()

    if (!reference) {
      console.warn('⚠️ [DocuSign Webhook] Envelope non trovato nel DB:', envelopeId)
      return
    }

    // Gestisci evento
    switch (payload.event) {
      case 'envelope-sent':
      case 'envelope-delivered':
        await updateEnvelopeStatus(db, envelopeId, 'delivered')
        console.log('📬 [DocuSign] Envelope consegnato:', envelopeId)
        break

      case 'envelope-completed':
        await onEnvelopeCompleted(db, env, envelopeId, reference)
        break

      case 'envelope-declined':
        await updateEnvelopeStatus(db, envelopeId, 'declined')
        console.log('❌ [DocuSign] Envelope rifiutato:', envelopeId)
        // TODO: Invia email notifica rifiuto
        break

      case 'envelope-voided':
        await updateEnvelopeStatus(db, envelopeId, 'voided')
        console.log('🚫 [DocuSign] Envelope annullato:', envelopeId)
        break

      default:
        console.log('ℹ️ [DocuSign] Evento non gestito:', payload.event)
    }

  } catch (error) {
    console.error('❌ [DocuSign Webhook] Errore:', error)
  }
}

/**
 * Gestisce completamento firma
 */
async function onEnvelopeCompleted(
  db: D1Database,
  env: any,
  envelopeId: string,
  reference: any
): Promise<void> {
  try {
    console.log('✅ [DocuSign] Envelope completato - download documento firmato:', envelopeId)

    // 1. Scarica documento firmato
    const docusignClient = createDocuSignClient(env)
    const signedPdf = await docusignClient.downloadSignedDocument(envelopeId)

    // 2. Salva documento firmato (R2, S3, o filesystem)
    // TODO: Implementare storage documento firmato
    const signedDocumentUrl = await saveSignedDocument(signedPdf, reference.contract_id)

    // 3. Aggiorna database
    await db.prepare(`
      UPDATE contracts 
      SET 
        status = 'SIGNED',
        signed_document_url = ?,
        signature_date = datetime('now'),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(signedDocumentUrl, reference.contract_id).run()

    await updateEnvelopeStatus(db, envelopeId, 'completed')

    // 4. Attiva servizio (invia dispositivo, attiva abbonamento, ecc.)
    console.log('🎯 [DocuSign] Contratto firmato - attivazione servizio:', reference.lead_id)
    // TODO: Trigger workflow attivazione servizio

    // 5. Invia email conferma
    console.log('📧 [DocuSign] Invio email conferma firma')
    // TODO: Invia email conferma

  } catch (error) {
    console.error('❌ [DocuSign] Errore gestione completamento:', error)
  }
}

/**
 * Salva riferimento DocuSign nel database
 */
async function saveDocuSignReference(
  db: D1Database,
  data: {
    envelopeId: string
    leadId: string
    contractId: string
    status: string
    recipientEmail: string
    signingUrl?: string
  }
): Promise<void> {
  await db.prepare(`
    INSERT OR REPLACE INTO docusign_envelopes 
    (envelope_id, lead_id, contract_id, status, recipient_email, signing_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).bind(
    data.envelopeId,
    data.leadId,
    data.contractId,
    data.status,
    data.recipientEmail,
    data.signingUrl || null
  ).run()
}

/**
 * Aggiorna stato envelope
 */
async function updateEnvelopeStatus(
  db: D1Database,
  envelopeId: string,
  status: string
): Promise<void> {
  await db.prepare(`
    UPDATE docusign_envelopes 
    SET status = ?, updated_at = datetime('now')
    WHERE envelope_id = ?
  `).bind(status, envelopeId).run()
}

/**
 * Salva documento firmato (placeholder)
 */
async function saveSignedDocument(
  pdfBuffer: ArrayBuffer,
  contractId: string
): Promise<string> {
  // TODO: Implementare storage
  // Opzioni:
  // - Cloudflare R2
  // - AWS S3
  // - Local filesystem (per dev)
  
  const mockUrl = `https://storage.telemedcare.it/contracts/${contractId}/signed.pdf`
  console.log('💾 [Storage] Documento firmato salvato:', mockUrl)
  return mockUrl
}

export default {
  sendContractForSignature,
  handleDocuSignWebhook
}
