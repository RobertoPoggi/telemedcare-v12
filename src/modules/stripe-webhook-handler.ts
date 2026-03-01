/**
 * STRIPE-WEBHOOK-HANDLER.TS
 * eCura V12.0 - Gestione Webhook Stripe per Pagamenti
 * 
 * WORKFLOW PASSO 4:
 * 1. Webhook Stripe: payment_intent.succeeded
 * 2. Aggiorna stato proforma e lead
 * 3. Invia email configurazione per raccolta dati
 * 4. Avvia processo attivazione servizio
 */

import { StripeService } from './stripe-service'
import { EmailService } from './email-service'

export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
}

/**
 * Stripe Webhook Handler - Gestisce eventi pagamento
 */
export class StripeWebhookHandler {
  
  /**
   * Processa webhook Stripe
   */
  static async processWebhook(
    event: StripeWebhookEvent,
    db: any
  ): Promise<{ success: boolean; message: string; error?: string }> {
    
    console.log(`🔔 [STRIPE-WEBHOOK] Ricevuto evento: ${event.type}`)
    
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          return await this.handlePaymentSuccess(event.data.object, db)
        
        case 'payment_intent.payment_failed':
          return await this.handlePaymentFailed(event.data.object, db)
        
        case 'payment_intent.canceled':
          return await this.handlePaymentCanceled(event.data.object, db)
        
        default:
          console.log(`⚠️ [STRIPE-WEBHOOK] Evento non gestito: ${event.type}`)
          return {
            success: true,
            message: `Evento ${event.type} ricevuto ma non gestito`
          }
      }
    } catch (error) {
      console.error('❌ [STRIPE-WEBHOOK] Errore processamento:', error)
      return {
        success: false,
        message: 'Errore processamento webhook',
        error: String(error)
      }
    }
  }
  
  /**
   * Gestisce pagamento completato con successo
   * 
   * WORKFLOW PASSO 4:
   * 1. Aggiorna stato proforma → 'paid'
   * 2. Aggiorna stato lead → 'PAYMENT_COMPLETED'
   * 3. Invia email configurazione per raccolta dati
   * 4. [TODO] Genera DDT
   * 5. [TODO] Avvia attivazione servizio
   */
  private static async handlePaymentSuccess(
    paymentIntent: any,
    db: any
  ): Promise<{ success: boolean; message: string; error?: string }> {
    
    const paymentIntentId = paymentIntent.id
    const amountPaid = paymentIntent.amount / 100 // Converti centesimi → euro
    
    console.log(`✅ [STRIPE-WEBHOOK] Pagamento completato: ${paymentIntentId} - €${amountPaid}`)
    
    try {
      // 1. Recupera metadata proforma
      const metadata = paymentIntent.metadata || {}
      const proformaNumber = metadata.proforma_number
      const contractCode = metadata.contract_code
      
      if (!proformaNumber) {
        throw new Error('Metadata proforma_number mancante nel payment_intent')
      }
      
      console.log(`📄 [STRIPE-WEBHOOK] Proforma: ${proformaNumber} | Contratto: ${contractCode}`)
      
      // 2. Aggiorna stato proforma
      await db.prepare(`
        UPDATE proformas 
        SET status = 'paid', 
            paid_at = datetime('now'),
            payment_intent_id = ?,
            updated_at = datetime('now')
        WHERE numero_proforma = ?
      `).bind(paymentIntentId, proformaNumber).run()
      
      console.log(`✅ [STRIPE-WEBHOOK] Proforma ${proformaNumber} aggiornata: paid`)
      
      // 2.5. Registra il pagamento nella tabella payments
      try {
        const { registerPayment } = await import('./payment-manager')
        
        // Recupera proforma per ottenere contract_id
        const proforma = await db.prepare(`
          SELECT id, contract_id, prezzo_totale FROM proforma 
          WHERE numero_proforma = ?
        `).bind(proformaNumber).first()
        
        if (proforma) {
          await registerPayment(db, {
            proformaId: proforma.id,
            contractId: proforma.contract_id,
            leadId: lead?.id || metadata.lead_id || 'UNKNOWN',
            importo: amountPaid,
            metodoPagamento: 'STRIPE_CARD',
            transactionId: paymentIntentId,
            stripePaymentIntentId: paymentIntentId
          })
          
          console.log(`✅ [STRIPE-WEBHOOK] Pagamento registrato in tabella payments`)
        }
      } catch (paymentError) {
        console.error('⚠️ [STRIPE-WEBHOOK] Errore registrazione payment (non bloccante):', paymentError)
      }
      
      // 3. Recupera dati lead associati al contratto
      const lead = await db.prepare(`
        SELECT l.*, c.codice_contratto
        FROM leads l
        INNER JOIN contracts c ON c.lead_id = l.id
        WHERE c.codice_contratto = ?
      `).bind(contractCode).first()
      
      if (!lead) {
        throw new Error(`Lead non trovato per contratto ${contractCode}`)
      }
      
      // 4. Aggiorna stato lead
      await db.prepare(`
        UPDATE leads 
        SET status = 'PAYMENT_COMPLETED',
            updated_at = datetime('now')
        WHERE id = ?
      `).bind(lead.id).run()
      
      console.log(`✅ [STRIPE-WEBHOOK] Lead ${lead.id} aggiornato: PAYMENT_COMPLETED`)
      
      // 5. Invia email configurazione per raccolta dati
      const emailResult = await this.sendConfigurationEmail(lead, db)
      
      if (!emailResult.success) {
        console.error('❌ [STRIPE-WEBHOOK] Errore invio email configurazione:', emailResult.error)
        // Non blocchiamo il workflow, solo log
      }
      
      // 5.5 Invia proforma al commercialista (se configurato)
      const commercialistaResult = await this.sendProformaToAccountant(proformaNumber, lead, db)
      if (commercialistaResult.sent) {
        console.log(`✅ [STRIPE-WEBHOOK] Proforma inviata al commercialista: ${commercialistaResult.email}`)
      }
      
      // 6. TODO: Genera DDT automatico
      console.log('🚚 [TODO] Generare DDT automatico')
      
      // 7. TODO: Avvia processo attivazione servizio
      console.log('🚀 [TODO] Avviare processo attivazione servizio')
      
      return {
        success: true,
        message: `Pagamento completato per proforma ${proformaNumber}. Email configurazione inviata.`
      }
      
    } catch (error) {
      console.error('❌ [STRIPE-WEBHOOK] Errore handlePaymentSuccess:', error)
      return {
        success: false,
        message: 'Errore gestione pagamento completato',
        error: String(error)
      }
    }
  }
  
  /**
   * Invia email configurazione dopo pagamento
   */
  private static async sendConfigurationEmail(
    lead: any,
    db: any
  ): Promise<{ success: boolean; error?: string }> {
    
    try {
      console.log(`📧 [STRIPE-WEBHOOK] Invio email configurazione a: ${lead.email}`)
      
      // 1. Carica template email_configurazione
      const template = await db.prepare(`
        SELECT html_content 
        FROM document_templates 
        WHERE name = 'email_configurazione' AND active = 1
      `).first()
      
      if (!template) {
        throw new Error('Template email_configurazione non trovato nel database')
      }
      
      // 2. Genera link form configurazione
      // TODO: Link reale form ospitato o integrato nel sistema
      const linkFormConfigura = `https://forms.ecura.it/configurazione/${lead.id}`
      
      // 3. Prepara variabili email
      const variables = {
        NOME_CLIENTE: lead.nome || 'Cliente',
        COGNOME_CLIENTE: lead.cognome || '',
        LINK_FORM_CONFIGURAZIONE: linkFormConfigura,
        CODICE_CLIENTE: lead.id.substring(0, 12),
        SERVIZIO: lead.servizio || 'PRO',
        PIANO: lead.pacchetto || 'BASE',
        DATA_PAGAMENTO: new Date().toLocaleDateString('it-IT')
      }
      
      // 4. Renderizza email
      const emailHtml = EmailService.renderTemplate(template.html_content, variables)
      
      // 5. Invia email
      const emailResult = await EmailService.sendEmail({
        to: lead.email,
        from: 'info@telemedcare.it',
        fromName: 'eCura - Medica GB',
        subject: 'Configura il tuo SiDLY CARE - Benvenuto!',
        html: emailHtml,
        text: `Benvenuto! Completa la configurazione del tuo servizio eCura: ${linkFormConfigura}`
      })
      
      if (emailResult.success) {
        console.log(`✅ [STRIPE-WEBHOOK] Email configurazione inviata a ${lead.email}`)
      } else {
        console.error(`❌ [STRIPE-WEBHOOK] Errore invio email: ${emailResult.error}`)
      }
      
      return emailResult
      
    } catch (error) {
      console.error('❌ [STRIPE-WEBHOOK] Errore sendConfigurationEmail:', error)
      return {
        success: false,
        error: String(error)
      }
    }
  }
  
  /**
   * Gestisce pagamento fallito
   */
  private static async handlePaymentFailed(
    paymentIntent: any,
    db: any
  ): Promise<{ success: boolean; message: string }> {
    
    const paymentIntentId = paymentIntent.id
    const metadata = paymentIntent.metadata || {}
    const proformaNumber = metadata.proforma_number
    
    console.log(`❌ [STRIPE-WEBHOOK] Pagamento fallito: ${paymentIntentId}`)
    
    if (!proformaNumber) {
      return { success: true, message: 'Proforma non specificata' }
    }
    
    // Aggiorna stato proforma
    await db.prepare(`
      UPDATE proformas 
      SET status = 'failed',
          updated_at = datetime('now')
      WHERE numero_proforma = ?
    `).bind(proformaNumber).run()
    
    console.log(`⚠️ [STRIPE-WEBHOOK] Proforma ${proformaNumber} marcata come failed`)
    
    // TODO: Inviare email notifica pagamento fallito
    
    return {
      success: true,
      message: `Pagamento fallito per proforma ${proformaNumber}`
    }
  }
  
  /**
   * Gestisce pagamento cancellato
   */
  private static async handlePaymentCanceled(
    paymentIntent: any,
    db: any
  ): Promise<{ success: boolean; message: string }> {
    
    const paymentIntentId = paymentIntent.id
    const metadata = paymentIntent.metadata || {}
    const proformaNumber = metadata.proforma_number
    
    console.log(`⚠️ [STRIPE-WEBHOOK] Pagamento cancellato: ${paymentIntentId}`)
    
    if (!proformaNumber) {
      return { success: true, message: 'Proforma non specificata' }
    }
    
    // Aggiorna stato proforma
    await db.prepare(`
      UPDATE proformas 
      SET status = 'canceled',
          updated_at = datetime('now')
      WHERE numero_proforma = ?
    `).bind(proformaNumber).run()
    
    console.log(`⚠️ [STRIPE-WEBHOOK] Proforma ${proformaNumber} marcata come canceled`)
    
    return {
      success: true,
      message: `Pagamento cancellato per proforma ${proformaNumber}`
    }
  }
  
  /**
   * Invia copia proforma al commercialista (dopo pagamento completato)
   */
  private static async sendProformaToAccountant(
    proformaNumber: string,
    lead: any,
    db: any
  ): Promise<{ sent: boolean; email?: string; error?: string }> {
    
    try {
      // 1. Recupera email commercialista dalle impostazioni
      const setting = await db.prepare(`
        SELECT value FROM system_settings WHERE key = 'email_commercialista'
      `).first()
      
      const emailCommercialista = setting?.value?.trim()
      
      // Se non configurato, salta l'invio
      if (!emailCommercialista || emailCommercialista === '') {
        console.log('ℹ️  [STRIPE-WEBHOOK] Email commercialista non configurata - invio saltato')
        return { sent: false }
      }
      
      console.log(`📧 [STRIPE-WEBHOOK] Invio proforma al commercialista: ${emailCommercialista}`)
      
      // 2. Recupera dati proforma
      const proforma = await db.prepare(`
        SELECT * FROM proforma WHERE numero_proforma = ?
      `).bind(proformaNumber).first()
      
      if (!proforma) {
        throw new Error(`Proforma ${proformaNumber} non trovata`)
      }
      
      // 3. Prepara email
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <title>Copia Proforma per Fatturazione</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e40af;">Richiesta Emissione Fattura</h2>
            
            <p>Gentile Commercialista,</p>
            
            <p>Si prega di emettere la <strong>fattura definitiva</strong> per il seguente ordine:</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #1e40af; margin: 20px 0;">
              <p><strong>Numero Proforma:</strong> ${proformaNumber}</p>
              <p><strong>Cliente:</strong> ${lead.nomeRichiedente} ${lead.cognomeRichiedente}</p>
              <p><strong>Email Cliente:</strong> ${lead.email}</p>
              <p><strong>Servizio:</strong> ${proforma.tipo_servizio}</p>
              <p><strong>Importo:</strong> €${proforma.prezzo_totale?.toFixed(2).replace('.', ',')}</p>
              <p><strong>Data Pagamento:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
            </div>
            
            <p>Il pagamento è stato completato con successo tramite Stripe.</p>
            
            <p><strong>Link Proforma:</strong><br/>
               <a href="https://telemedcare-v12.pages.dev/proforma-view?id=${proforma.id}" style="color: #1e40af;">
               Visualizza Proforma Completa
               </a>
            </p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              Questo messaggio è stato generato automaticamente dal sistema TeleMedCare.
            </p>
          </div>
        </body>
        </html>
      `
      
      // 4. Invia email (importa EmailService dinamicamente per evitare circular dependency)
      const { EmailService } = await import('./email-service')
      
      await EmailService.sendEmail({
        to: emailCommercialista,
        from: 'info@medicagb.it',
        fromName: 'Medica GB S.r.l.',
        subject: `Richiesta Fattura - Proforma ${proformaNumber}`,
        html: emailHtml,
        text: `Richiesta emissione fattura per proforma ${proformaNumber}. Cliente: ${lead.nomeRichiedente} ${lead.cognomeRichiedente}. Importo: €${proforma.prezzo_totale?.toFixed(2)}`
      })
      
      console.log(`✅ [STRIPE-WEBHOOK] Email inviata al commercialista: ${emailCommercialista}`)
      
      return { sent: true, email: emailCommercialista }
      
    } catch (error) {
      console.error('❌ [STRIPE-WEBHOOK] Errore invio email commercialista:', error)
      return { sent: false, error: String(error) }
    }
  }
}

export default StripeWebhookHandler
