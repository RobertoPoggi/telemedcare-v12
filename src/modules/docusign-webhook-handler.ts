/**
 * DOCUSIGN-WEBHOOK-HANDLER.TS - DocuSign Webhook Handler
 * eCura V12.0 - Digital Signature Events
 * 
 * Gestisce gli eventi webhook da DocuSign:
 * - Firma completata → genera e invia proforma
 * - Firma declinata → notifica team
 * - Envelope voidato → gestione cancellazione
 * 
 * WORKFLOW:
 * 1. Riceve webhook DocuSign
 * 2. Valida signature HMAC
 * 3. Processa evento (completed, declined, voided)
 * 4. Aggiorna database contratti
 * 5. Trigger azioni post-firma (proforma, email, etc.)
 */

export interface DocuSignWebhookEvent {
  event: string
  apiVersion: string
  uri: string
  retryCount: number
  configurationId: number
  generatedDateTime: string
  data: {
    accountId: string
    userId: string
    envelopeId: string
    envelopeSummary: {
      status: string
      statusDateTime: string
      envelopeId: string
      emailSubject: string
      recipients: {
        signers: Array<{
          name: string
          email: string
          status: string
          signedDateTime?: string
        }>
      }
    }
  }
}

export interface DocuSignWebhookResult {
  success: boolean
  message: string
  envelopeId: string
  status: string
  actions?: string[]
  errors?: string[]
}

/**
 * DocuSign Webhook Handler
 */
export class DocuSignWebhookHandler {
  
  /**
   * Processa webhook DocuSign
   */
  static async handleWebhook(
    event: DocuSignWebhookEvent,
    db: any,
    env: any
  ): Promise<DocuSignWebhookResult> {
    
    const result: DocuSignWebhookResult = {
      success: false,
      message: '',
      envelopeId: event.data.envelopeId,
      status: event.data.envelopeSummary.status,
      actions: [],
      errors: []
    }
    
    try {
      console.log(`📬 [DOCUSIGN_WEBHOOK] Evento ricevuto: ${event.event}`)
      console.log(`📋 [DOCUSIGN_WEBHOOK] Envelope: ${event.data.envelopeId}`)
      console.log(`📊 [DOCUSIGN_WEBHOOK] Status: ${event.data.envelopeSummary.status}`)
      
      const envelopeId = event.data.envelopeId
      const status = event.data.envelopeSummary.status
      
      // 1. Trova contratto associato all'envelope
      const contract = await db.prepare(`
        SELECT * FROM contracts 
        WHERE docusign_envelope_id = ?
      `).bind(envelopeId).first()
      
      if (!contract) {
        result.errors?.push(`Contratto non trovato per envelope ${envelopeId}`)
        console.error(`❌ [DOCUSIGN_WEBHOOK] Contratto non trovato`)
        return result
      }
      
      console.log(`✅ [DOCUSIGN_WEBHOOK] Contratto trovato: ${contract.contract_code}`)
      
      // 2. Processa evento in base allo status
      switch (status.toLowerCase()) {
        case 'completed':
          await this.handleCompleted(contract, event, db, env, result)
          break
          
        case 'declined':
          await this.handleDeclined(contract, event, db, env, result)
          break
          
        case 'voided':
          await this.handleVoided(contract, event, db, env, result)
          break
          
        default:
          console.log(`ℹ️ [DOCUSIGN_WEBHOOK] Status ignorato: ${status}`)
          result.message = `Status ${status} ricevuto ma non processato`
      }
      
      result.success = true
      return result
      
    } catch (error) {
      console.error('❌ [DOCUSIGN_WEBHOOK] Errore processing webhook:', error)
      result.errors?.push(String(error))
      return result
    }
  }
  
  /**
   * Gestisce firma completata - IMPLEMENTAZIONE COMPLETA
   */
  private static async handleCompleted(
    contract: any,
    event: DocuSignWebhookEvent,
    db: any,
    env: any,
    result: DocuSignWebhookResult
  ): Promise<void> {
    
    console.log(`✅ [DOCUSIGN_WEBHOOK] Firma completata per contratto: ${contract.contract_code}`)
    
    const signedDateTime = event.data.envelopeSummary.statusDateTime
    const signerInfo = event.data.envelopeSummary.recipients?.signers?.[0]
    
    // 1. Aggiorna status contratto
    await db.prepare(`
      UPDATE contracts 
      SET status = 'signed',
          signed_at = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(signedDateTime, contract.id).run()
    
    result.actions?.push(`Contratto ${contract.contract_code} marcato come SIGNED`)
    console.log(`✅ [DOCUSIGN_WEBHOOK] Status contratto aggiornato: SIGNED`)
    
    // 2. Aggiorna lead associato
    let lead = null
    if (contract.lead_id) {
      await db.prepare(`
        UPDATE leads 
        SET status = 'CONTRACT_SIGNED'
        WHERE id = ?
      `).bind(contract.lead_id).run()
      
      // Recupera dati lead per proforma
      lead = await db.prepare(`
        SELECT * FROM leads WHERE id = ?
      `).bind(contract.lead_id).first()
      
      result.actions?.push(`Lead ${contract.lead_id} aggiornato: CONTRACT_SIGNED`)
    }
    
    // 3. NUOVO: Genera e invia Proforma automaticamente
    try {
      if (lead) {
        console.log(`💰 [DOCUSIGN_WEBHOOK] Generazione proforma automatica...`)
        
        // Import moduli necessari
        const { createProformaFromContract } = await import('./proforma-generator')
        const ProformaGenerator = (await import('./proforma-generator')).default
        const { createStripeService, createProformaPaymentLink } = await import('./stripe-service')
        const EmailService = (await import('./email-service')).default
        const { loadEmailTemplate, renderTemplate } = await import('./template-loader-clean')
        
        // Crea Stripe service
        const stripeService = createStripeService(env)
        
        // Prepara dati proforma
        const proformaData = await createProformaFromContract(
          contract.contract_code,
          lead.nome_richiedente || lead.nomeRichiedente || 'Cliente',
          lead.cognome_richiedente || lead.cognomeRichiedente || '',
          lead.email_richiedente || lead.emailRichiedente || '',
          contract.servizio || lead.servizio || 'PRO',
          contract.tipo_servizio || lead.pacchetto || 'BASE'
        )
        
        // Genera Payment Link Stripe
        const paymentLink = await createProformaPaymentLink(
          stripeService,
          '', // Verrà generato automaticamente
          contract.contract_code,
          proformaData.servizio,
          proformaData.piano,
          proformaData.totale,
          proformaData.nomeCliente,
          proformaData.emailCliente
        )
        
        proformaData.linkPagamentoStripe = paymentLink.url
        
        // Genera proforma
        const proformaResult = await ProformaGenerator.generateProforma(proformaData, db)
        
        if (proformaResult.success && proformaResult.proforma) {
          const proforma = proformaResult.proforma
          
          // Aggiorna con Stripe link
          await db.prepare(`
            UPDATE proformas 
            SET stripe_payment_link = ?
            WHERE id = ?
          `).bind(paymentLink.url, proforma.proformaId).run()
          
          console.log(`✅ [DOCUSIGN_WEBHOOK] Proforma generata: ${proforma.numeroProforma}`)
          result.actions?.push(`Proforma ${proforma.numeroProforma} generata`)
          
          // 4. NUOVO: Invia email proforma
          try {
            console.log(`📧 [DOCUSIGN_WEBHOOK] Invio email proforma...`)
            
            // Carica template
            const template = await loadEmailTemplate('email_invio_proforma', db)
            if (!template) {
              console.warn(`⚠️ [DOCUSIGN_WEBHOOK] Template email_invio_proforma non trovato in DB, uso inline`)
            }
            
            // Prepara variabili email
            const { getPricing, formatServiceName } = await import('./ecura-pricing')
            const pricing = getPricing(proformaData.servizio as any, proformaData.piano as any)
            
            const emailVariables = {
              NUMERO_PROFORMA: proforma.numeroProforma,
              NOME_CLIENTE: proformaData.nomeCliente,
              COGNOME_CLIENTE: proformaData.cognomeCliente,
              TOTALE: proformaData.totale.toFixed(2),
              LINK_PAGAMENTO: paymentLink.url,
              SERVIZIO_COMPLETO: formatServiceName(proformaData.servizio as any, proformaData.piano as any),
              DISPOSITIVO: proformaData.dispositivo,
              SCADENZA_PAGAMENTO: proformaData.scadenzaPagamento,
              DATA_EMISSIONE: proformaData.dataEmissione,
              CODICE_CONTRATTO: contract.contract_code,
              DETRAZIONE_FISCALE: pricing ? (pricing.detrazioneFiscale19 / 12).toFixed(2) : '0.00'
            }
            
            const emailService = new EmailService(env)
            const emailResult = await emailService.sendEmail({
              to: proformaData.emailCliente,
              from: env.EMAIL_FROM || 'info@telemedcare.it',
              subject: `💰 Proforma eCura ${proforma.numeroProforma} - Completa il Pagamento`,
              templateName: 'email_invio_proforma',
              variables: emailVariables,
              attachments: proforma.pdfBase64 ? [{
                filename: `Proforma_${proforma.numeroProforma}.pdf`,
                content: proforma.pdfBase64,
                contentType: 'application/pdf'
              }] : undefined
            })
            
            if (emailResult.success) {
              console.log(`✅ [DOCUSIGN_WEBHOOK] Email proforma inviata a ${proformaData.emailCliente}`)
              result.actions?.push(`Email proforma inviata a ${proformaData.emailCliente}`)
            } else {
              console.error(`❌ [DOCUSIGN_WEBHOOK] Errore invio email proforma:`, emailResult.error)
              result.actions?.push(`Errore invio email: ${emailResult.error}`)
            }
            
          } catch (emailError) {
            console.error(`❌ [DOCUSIGN_WEBHOOK] Errore invio email proforma:`, emailError)
            result.actions?.push(`Errore invio email proforma: ${emailError}`)
          }
          
        } else {
          console.error(`❌ [DOCUSIGN_WEBHOOK] Errore generazione proforma:`, proformaResult.error)
          result.actions?.push(`Errore generazione proforma: ${proformaResult.error}`)
        }
        
      } else {
        console.warn(`⚠️ [DOCUSIGN_WEBHOOK] Lead non trovato, skip proforma`)
        result.actions?.push('Lead non trovato, proforma skippata')
      }
      
    } catch (proformaError) {
      console.error(`❌ [DOCUSIGN_WEBHOOK] Errore workflow proforma:`, proformaError)
      result.actions?.push(`Errore workflow proforma: ${proformaError}`)
    }
    
    result.message = `Firma completata con successo per ${contract.contract_code}`
  }
  
  /**
   * Gestisce firma declinata
   */
  private static async handleDeclined(
    contract: any,
    event: DocuSignWebhookEvent,
    db: any,
    env: any,
    result: DocuSignWebhookResult
  ): Promise<void> {
    
    console.log(`❌ [DOCUSIGN_WEBHOOK] Firma declinata per contratto: ${contract.contract_code}`)
    
    // 1. Aggiorna status contratto
    await db.prepare(`
      UPDATE contracts 
      SET status = 'declined',
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(contract.id).run()
    
    result.actions?.push(`Contratto ${contract.contract_code} marcato come DECLINED`)
    
    // 2. Aggiorna lead
    if (contract.lead_id) {
      await db.prepare(`
        UPDATE leads 
        SET status = 'CONTRACT_DECLINED'
        WHERE id = ?
      `).bind(contract.lead_id).run()
      
      result.actions?.push(`Lead ${contract.lead_id} aggiornato: CONTRACT_DECLINED`)
    }
    
    // 3. Notifica team interno
    result.actions?.push('TODO: Notifica team - firma declinata')
    console.log(`📧 [DOCUSIGN_WEBHOOK] TODO: Notifica team firma declinata`)
    
    result.message = `Firma declinata per ${contract.contract_code}`
  }
  
  /**
   * Gestisce envelope annullato
   */
  private static async handleVoided(
    contract: any,
    event: DocuSignWebhookEvent,
    db: any,
    env: any,
    result: DocuSignWebhookResult
  ): Promise<void> {
    
    console.log(`🚫 [DOCUSIGN_WEBHOOK] Envelope annullato per contratto: ${contract.contract_code}`)
    
    // 1. Aggiorna status contratto
    await db.prepare(`
      UPDATE contracts 
      SET status = 'voided',
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(contract.id).run()
    
    result.actions?.push(`Contratto ${contract.contract_code} marcato come VOIDED`)
    
    // 2. Aggiorna lead
    if (contract.lead_id) {
      await db.prepare(`
        UPDATE leads 
        SET status = 'CONTRACT_VOIDED'
        WHERE id = ?
      `).bind(contract.lead_id).run()
    }
    
    result.message = `Envelope annullato per ${contract.contract_code}`
  }
  
  /**
   * Valida HMAC signature DocuSign
   */
  static validateSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // TODO: Implementare validazione HMAC
    // const crypto = require('crypto')
    // const hmac = crypto.createHmac('sha256', secret)
    // const computedSignature = hmac.update(payload).digest('base64')
    // return computedSignature === signature
    
    console.log('⚠️ [DOCUSIGN_WEBHOOK] Validazione HMAC signature TODO')
    return true // Per sviluppo, accetta tutto
  }
}

export default DocuSignWebhookHandler
