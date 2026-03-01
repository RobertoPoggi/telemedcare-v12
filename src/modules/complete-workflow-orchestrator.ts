/**
 * TeleMedCare V12.0 - Complete Workflow Orchestrator
 * Orchestrazione completa del flusso corretto:
 * 
 * 1. Lead compila form → Notifica a info@ + (brochure O contratto)
 * 2. Firma contratto → Invia proforma
 * 3. Pagamento → Email benvenuto + form config
 * 4. Config compilata → Notifica a info@
 * 5. Dispositivo associato → Email conferma attivazione
 */

import WorkflowEmailManager, { LeadData } from './workflow-email-manager'
import SignatureManager from './signature-manager'
import PaymentManager from './payment-manager'
import ClientConfigurationManager from './client-configuration-manager'
import DocumentRepository from './document-repository'
import { generateAndSendContract } from './contract-workflow-manager'

export interface WorkflowContext {
  db: D1Database
  env: any
  leadData: LeadData
}

export interface WorkflowStepResult {
  success: boolean
  step: string
  message: string
  data?: any
  errors?: string[]
}

export interface DashboardSettings {
  email_notifica_info: boolean
  email_completamento_dati: boolean
  email_reminder_firma: boolean
  email_promemoria_pagamento: boolean
}

/**
 * Legge le impostazioni workflow dalla dashboard
 */
async function getWorkflowSettings(db: D1Database): Promise<DashboardSettings> {
  try {
    const result = await db.prepare(`
      SELECT * FROM settings WHERE key = 'workflow_emails'
    `).first<{ value: string }>()
    
    if (result?.value) {
      return JSON.parse(result.value) as DashboardSettings
    }
  } catch (error) {
    console.error('⚠️ [ORCHESTRATOR] Errore lettura settings:', error)
  }
  
  // Default: tutti attivi (per retro-compatibilità)
  return {
    email_notifica_info: true,
    email_completamento_dati: true,
    email_reminder_firma: true,
    email_promemoria_pagamento: true
  }
}

/**
 * STEP 1: Processa nuovo lead dal form
 * - Salva lead nel DB
 * - Invia notifica a info@telemedcare.it
 * - Se solo brochure/manuale → invia documenti e FINE
 * - Se contratto → genera e invia contratto + documenti
 */
export async function processNewLead(
  ctx: WorkflowContext
): Promise<WorkflowStepResult> {
  const result: WorkflowStepResult = {
    success: false,
    step: 'process_new_lead',
    message: '',
    errors: []
  }

  try {
    console.log(`🚀 [ORCHESTRATOR] STEP 1: Processamento nuovo lead ${ctx.leadData.id}`)

    // Leggi impostazioni workflow
    const settings = await getWorkflowSettings(ctx.db)
    console.log(`⚙️ [ORCHESTRATOR] Settings workflow:`, settings)

    // 1.1: Invia email notifica a info@ (se abilitata)
    // PRIORITÀ: Dashboard switch (admin_email_notifications_enabled)
    const adminEmailSetting = await ctx.db.prepare(
      "SELECT value FROM settings WHERE key = 'admin_email_notifications_enabled' LIMIT 1"
    ).first()
    const adminEmailEnabled = adminEmailSetting?.value === 'true'
    
    console.log(`🔍 [ORCHESTRATOR] Admin switch check: workflow=${settings.email_notifica_info}, dashboard=${adminEmailEnabled}`)
    
    // Usa SOLO il dashboard switch
    if (adminEmailEnabled) {
      console.log(`📧 [ORCHESTRATOR] Invio notifica a info@telemedcare.it`)
      const notificaResult = await WorkflowEmailManager.inviaEmailNotificaInfo(
        ctx.leadData,
        ctx.env,
        ctx.db
      )

      if (!notificaResult.success) {
        result.errors.push(...notificaResult.errors)
      }
    } else {
      console.log(`⏭️ [ORCHESTRATOR] Email notifica info@ disabilitata (dashboard switch OFF)`)
    }

    // 1.2: Invia email completamento dati al lead (se abilitata)
    // PRIORITÀ: Dashboard switch (lead_email_notifications_enabled)
    // Se dashboard switch è OFF, NON inviare email (indipendentemente da workflow switch)
    const leadEmailSetting = await ctx.db.prepare(
      "SELECT value FROM settings WHERE key = 'lead_email_notifications_enabled' LIMIT 1"
    ).first()
    const leadEmailEnabled = leadEmailSetting?.value === 'true'
    
    console.log(`🔍 [ORCHESTRATOR] Lead email check:`, {
      leadEmailEnabled,
      email: ctx.leadData.email,
      hasEmail: !!ctx.leadData.email,
      leadId: ctx.leadData.id
    })
    
    console.log(`🔍 [ORCHESTRATOR] Switch check: workflow=${settings.email_completamento_dati}, dashboard=${leadEmailEnabled}`)
    
    // Usa SOLO il dashboard switch (ignora workflow switch per evitare conflitti)
    if (leadEmailEnabled) {
      // Determina email destinatario (usa email o fallback su email)
      const recipientEmail = ctx.leadData.email || ctx.leadData.email
      
      console.log(`📧 [ORCHESTRATOR] Invio email completamento dati a ${recipientEmail}`)
      console.log(`   email: ${ctx.leadData.email}`)
      console.log(`   email: ${ctx.leadData.email}`)
      
      if (!recipientEmail) {
        console.error(`❌ [ORCHESTRATOR] Nessuna email trovata per lead ${ctx.leadData.id}`)
        result.errors.push('Email destinatario mancante')
      } else {
        console.log(`🚀 [ORCHESTRATOR] INIZIO INVIO EMAIL - recipientEmail: ${recipientEmail}`)
        try {
          console.log(`📦 [ORCHESTRATOR] Import moduli...`)
          // Importa modulo lead-completion per inviare email
          const { createCompletionToken, getMissingFields, getSystemConfig } = await import('./lead-completion')
          const EmailService = (await import('./email-service')).default
          
          console.log(`⚙️ [ORCHESTRATOR] Carico configurazione...`)
          // Ottieni configurazione
          const config = await getSystemConfig(ctx.db)
          
          console.log(`🎟️ [ORCHESTRATOR] Creo token completamento...`)
          // Crea token completamento
          const token = await createCompletionToken(
            ctx.db,
            ctx.leadData.id,
            config.auto_completion_token_days
          )
          console.log(`✅ [ORCHESTRATOR] Token creato: ${token.token}`)
          
          // Genera URL completamento
          const baseUrl = ctx.env?.PUBLIC_URL || ctx.env?.PAGES_URL || 'https://telemedcare-v12.pages.dev'
          const completionUrl = `${baseUrl}/completa-dati?token=${token.token}`
          
          console.log(`📋 [ORCHESTRATOR] Preparo dati email...`)
          // Prepara dati per email
          const { missing, available } = getMissingFields(ctx.leadData)
        
        // Template HTML inline (ufficiale TeleMedCare)
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Completa i tuoi dati - eCura</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">📝 Completa i tuoi dati</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Siamo quasi pronti per attivare il tuo servizio eCura</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Gentile <strong>${ctx.leadData.nomeRichiedente || 'Cliente'} ${ctx.leadData.cognomeRichiedente || ''}</strong>,
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Grazie per il tuo interesse verso <strong>${ctx.leadData.pacchetto || ctx.leadData.servizio || 'eCura'}</strong>. 
                Abbiamo ricevuto la tua richiesta e per inviarti una proposta per soddisfare le tue esigenze 
                abbiamo bisogno di alcune <strong>informazioni aggiuntive</strong>.
              </p>
              
              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; border-left: 4px solid #667eea; margin: 30px 0; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                      <strong>📋 Dati richiesta:</strong>
                    </p>
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">
                      Lead ID: <strong>${ctx.leadData.id}</strong><br>
                      Servizio: <strong>${ctx.leadData.pacchetto || ctx.leadData.servizio || 'eCura'}</strong><br>
                      Campi mancanti: <strong>${missing.length}</strong>
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Clicca sul pulsante qui sotto per completare i tuoi dati. 
                Il link sarà valido per <strong>${config.auto_completion_token_days} giorni</strong>.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${completionUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      Completa i tuoi dati
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                Se il pulsante non funziona, copia e incolla questo link nel tuo browser:<br>
                <a href="${completionUrl}" style="color: #667eea; word-break: break-all;">${completionUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                <strong>TeleMedCare</strong> - Sistema di Gestione Lead
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                Per assistenza: <a href="mailto:info@telemedcare.it" style="color: #667eea; text-decoration: none;">info@telemedcare.it</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
        
        console.log(`📧 [ORCHESTRATOR] Creo EmailService e invio...`)
        // Invia email
        const emailService = new EmailService(ctx.env)
        const emailResult = await emailService.sendEmail({
          to: recipientEmail,
          subject: '📝 Completa la tua richiesta eCura - Ultimi dettagli necessari',
          html: emailHtml
        })
        
        console.log(`📬 [ORCHESTRATOR] Risultato invio:`, emailResult)
        
        if (emailResult.success) {
          console.log(`✅ [ORCHESTRATOR] Email completamento dati inviata a ${recipientEmail}`)
          console.log(`   Link form: ${completionUrl}`)
          if (emailResult.warning) {
            console.warn(`⚠️ [ORCHESTRATOR] WARNING:`, emailResult.warning)
          }
        } else {
          console.error(`❌ [ORCHESTRATOR] Errore invio email completamento:`, emailResult.error)
          result.errors.push(`Errore email completamento: ${emailResult.error}`)
        }
      } catch (error) {
        console.error(`❌ [ORCHESTRATOR] EXCEPTION durante invio email:`, error)
        console.error(`   Error message:`, error.message)
        console.error(`   Error stack:`, error.stack)
        result.errors.push(`Errore email completamento: ${error.message}`)
      }
    } // ← Chiude else del blocco recipientEmail
    } else {
      console.log(`⏭️ [ORCHESTRATOR] Email completamento dati disabilitata (switch OFF)`)
    }

    // 1.3: Determina il percorso
    if (!ctx.leadData.vuoleContratto && (ctx.leadData.vuoleBrochure || ctx.leadData.vuoleManuale)) {
      // Percorso A: Solo brochure/manuale
      console.log(`📚 [ORCHESTRATOR] Lead richiede solo documenti informativi`)

      // Ottieni URLs documenti
      const documentUrls = await getDocumentUrls(ctx.leadData)

      // Invia email con documenti
      const documentiResult = await WorkflowEmailManager.inviaEmailDocumentiInformativi(
        ctx.leadData,
        ctx.env,
        documentUrls,
        ctx.db
      )

      if (documentiResult.success) {
        result.success = true
        result.message = 'Lead processato: documenti informativi inviati'
        result.data = { emailsSent: documentiResult.emailsSent }
      } else {
        result.errors.push(...documentiResult.errors)
        result.message = 'Errore invio documenti'
      }

    } else if (ctx.leadData.vuoleContratto) {
      // Percorso B: Contratto richiesto
      console.log(`📄 [ORCHESTRATOR] Lead richiede contratto ${ctx.leadData.pacchetto}`)

      // Genera contratto e invia email con brochure specifica
      const contrattoResult = await generateAndSendContract(
        ctx.leadData,
        ctx.env,
        ctx.db
      )

      if (contrattoResult.success) {
        result.success = true
        result.message = 'Lead processato: contratto generato e inviato'
        result.data = {
          emailsSent: contrattoResult.emailsSent,
          messageIds: contrattoResult.messageIds
        }
      } else {
        result.errors.push(...contrattoResult.errors)
        result.message = 'Errore generazione/invio contratto'
      }
    } else {
      result.message = 'Nessuna richiesta specifica (né documenti né contratto)'
      result.success = true
    }

    // Aggiorna status lead
    await updateLeadStatus(ctx.db, ctx.leadData.id, 
      ctx.leadData.vuoleContratto ? 'CONTRACT_SENT' : 'DOCUMENTS_SENT'
    )

    console.log(`✅ [ORCHESTRATOR] STEP 1 completato: ${result.message}`)

  } catch (error) {
    console.error(`❌ [ORCHESTRATOR] Errore STEP 1:`, error)
    result.message = `Errore processamento lead: ${error.message}`
    result.errors.push(error.message)
  }

  return result
}

/**
 * STEP 2: Processa firma contratto
 * - Salva firma nel DB
 * - Genera proforma
 * - Invia email con proforma
 */
export async function processContractSignature(
  ctx: WorkflowContext & { contractId: string; signatureData: string }
): Promise<WorkflowStepResult> {
  const result: WorkflowStepResult = {
    success: false,
    step: 'process_signature',
    message: '',
    errors: []
  }

  try {
    console.log(`✍️ [ORCHESTRATOR] STEP 2: Processamento firma contratto ${ctx.contractId}`)

    // 2.1: Salva firma
    const signatureResult = await SignatureManager.saveSignature(ctx.db, {
      contractId: ctx.contractId,
      signatureData: ctx.signatureData,
      signatureType: 'ELECTRONIC',
      timestamp: new Date().toISOString()
    })

    if (!signatureResult.success) {
      result.errors.push(signatureResult.error)
      result.message = 'Errore salvataggio firma'
      return result
    }

    // 2.2: Genera proforma
    const proformaResult = await generateProformaForContract(ctx)

    if (!proformaResult.success) {
      result.errors.push(proformaResult.message)
      result.message = 'Errore generazione proforma'
      return result
    }

    // 2.3: Invia email proforma
    const emailResult = await WorkflowEmailManager.inviaEmailProforma(
      ctx.leadData,
      proformaResult.data,
      ctx.env,
      ctx.db
    )

    if (emailResult.success) {
      result.success = true
      result.message = 'Firma registrata e proforma inviata'
      result.data = {
        signatureId: signatureResult.signatureId,
        proformaId: proformaResult.data.proformaId,
        emailsSent: emailResult.emailsSent
      }
    } else {
      result.errors.push(...emailResult.errors)
      result.message = 'Errore invio proforma'
    }

    // Aggiorna status lead
    await updateLeadStatus(ctx.db, ctx.leadData.id, 'CONTRACT_SIGNED')

    console.log(`✅ [ORCHESTRATOR] STEP 2 completato: ${result.message}`)

  } catch (error) {
    console.error(`❌ [ORCHESTRATOR] Errore STEP 2:`, error)
    result.message = `Errore processamento firma: ${error.message}`
    result.errors.push(error.message)
  }

  return result
}

/**
 * STEP 3: Processa pagamento
 * - Registra/conferma pagamento
 * - Invia email benvenuto con link form configurazione
 */
export async function processPayment(
  ctx: WorkflowContext & { 
    proformaId: string
    contractId: string
    paymentData: any
  }
): Promise<WorkflowStepResult> {
  const result: WorkflowStepResult = {
    success: false,
    step: 'process_payment',
    message: '',
    errors: []
  }

  try {
    console.log(`💳 [ORCHESTRATOR] STEP 3: Processamento pagamento per proforma ${ctx.proformaId}`)
    console.log(`💳 [ORCHESTRATOR DEBUG] ctx.paymentData:`, JSON.stringify(ctx.paymentData))

    // 3.1: Registra pagamento
    // Build payment params ensuring all required fields are defined
    const importoValue = ctx.paymentData.amount || ctx.paymentData.importo
    const metodoPagamentoValue = ctx.paymentData.paymentMethod || ctx.paymentData.metodo || 'BONIFICO'
    
    if (!importoValue) {
      result.errors.push('Importo pagamento non specificato')
      result.message = 'Dati pagamento incompleti'
      return result
    }
    
    if (!ctx.contractId) {
      result.errors.push('Contract ID mancante')
      result.message = 'Dati contratto incompleti'
      return result
    }
    
    const paymentParams: PaymentManager.PaymentData = {
      proformaId: ctx.proformaId,
      contractId: ctx.contractId,
      leadId: ctx.leadData.id,
      importo: importoValue,
      metodoPagamento: metodoPagamentoValue as 'BONIFICO' | 'STRIPE_CARD' | 'STRIPE_SEPA',
      transactionId: ctx.paymentData.transactionId,
      riferimentoBonifico: ctx.paymentData.riferimento,
      ibanMittente: ctx.paymentData.iban,
      stripePaymentIntentId: ctx.paymentData.stripePaymentIntentId
    }
    
    console.log(`💳 [ORCHESTRATOR] Registering payment with params:`, JSON.stringify({
      proformaId: paymentParams.proformaId,
      contractId: paymentParams.contractId,
      leadId: paymentParams.leadId,
      importo: paymentParams.importo,
      metodoPagamento: paymentParams.metodoPagamento
    }))
    
    const paymentResult = await PaymentManager.registerPayment(ctx.db, paymentParams)

    if (!paymentResult.success) {
      result.errors.push(paymentResult.error)
      result.message = 'Errore registrazione pagamento'
      // Pass through debug info if available
      if ((paymentResult as any).debug) {
        (result as any).debug = (paymentResult as any).debug
      }
      return result
    }

    // 3.2: Conferma pagamento (se automatico, altrimenti manuale dopo)
    if (ctx.paymentData.autoConfirm) {
      const confirmResult = await PaymentManager.confirmPayment(ctx.db, paymentResult.paymentId)
      
      if (!confirmResult.success) {
        result.errors.push(confirmResult.error)
        result.message = 'Errore conferma pagamento'
        return result
      }
    }

    // 3.3: Genera codice cliente
    const codiceCliente = await generateCodiceCliente(ctx.db, ctx.leadData.id)

    // 3.4: Invia email benvenuto con form configurazione
    const emailResult = await WorkflowEmailManager.inviaEmailBenvenuto(
      { ...ctx.leadData, codiceCliente },
      ctx.env,
      ctx.db
    )

    if (emailResult.success) {
      result.success = true
      result.message = 'Pagamento registrato e email benvenuto inviata'
      result.data = {
        paymentId: paymentResult.paymentId,
        codiceCliente,
        emailsSent: emailResult.emailsSent
      }
    } else {
      result.errors.push(...emailResult.errors)
      result.message = 'Errore invio email benvenuto'
    }

    // Aggiorna status lead
    await updateLeadStatus(ctx.db, ctx.leadData.id, 'PAYMENT_RECEIVED')

    console.log(`✅ [ORCHESTRATOR] STEP 3 completato: ${result.message}`)

  } catch (error) {
    console.error(`❌ [ORCHESTRATOR] Errore STEP 3:`, error)
    result.message = `Errore processamento pagamento: ${error.message}`
    result.errors.push(error.message)
  }

  return result
}

/**
 * STEP 4: Processa configurazione cliente
 * - Salva configurazione nel DB
 * - Invia email configurazione a info@
 */
export async function processConfiguration(
  ctx: WorkflowContext & { configData: any }
): Promise<WorkflowStepResult> {
  const result: WorkflowStepResult = {
    success: false,
    step: 'process_configuration',
    message: '',
    errors: []
  }

  try {
    console.log(`📋 [ORCHESTRATOR] STEP 4: Processamento configurazione cliente ${ctx.leadData.id}`)

    // 4.1: Salva configurazione
    const configResult = await ClientConfigurationManager.saveConfiguration(
      ctx.db,
      ctx.configData
    )

    if (!configResult.success) {
      result.errors.push(configResult.error)
      result.message = 'Errore salvataggio configurazione'
      return result
    }

    // 4.2: Invia email configurazione a info@
    const emailResult = await WorkflowEmailManager.inviaEmailConfigurazione(
      ctx.leadData,
      ctx.configData,
      ctx.env,
      ctx.db
    )

    if (!emailResult.success) {
      result.errors.push(...emailResult.errors)
      // Non blocchiamo il workflow per questo errore
      console.warn('⚠️ [ORCHESTRATOR] Errore invio email info@ (non bloccante)')
    }

    // 4.3: Invia email di benvenuto al cliente
    const clientData = {
      ...ctx.leadData,
      codiceCliente: ctx.configData.codiceCliente || `CLI-${Date.now()}`,
      servizio: ctx.leadData.pacchetto || 'BASE',
      pacchetto: ctx.leadData.pacchetto || 'BASE'
    }
    
    const benvenutoResult = await WorkflowEmailManager.inviaEmailBenvenuto(
      clientData,
      ctx.env,
      ctx.db
    )

    if (benvenutoResult.success) {
      result.success = true
      result.message = 'Configurazione salvata. Email info@ e benvenuto inviate.'
      result.data = {
        configurationId: configResult.configurationId,
        emailsSent: [...(emailResult.emailsSent || []), ...(benvenutoResult.emailsSent || [])]
      }
      console.log(`✅ [ORCHESTRATOR] Email benvenuto inviata con successo`)
    } else {
      result.success = true // Non blocchiamo per errore email
      result.message = 'Configurazione salvata. Email info@ inviata, errore email benvenuto.'
      result.data = {
        configurationId: configResult.configurationId,
        emailsSent: emailResult.emailsSent || []
      }
      result.errors.push(...benvenutoResult.errors)
      console.warn('⚠️ [ORCHESTRATOR] Errore invio email benvenuto (non bloccante)')
    }

    // Aggiorna status lead
    await updateLeadStatus(ctx.db, ctx.leadData.id, 'CONFIGURED')

    console.log(`✅ [ORCHESTRATOR] STEP 4 completato: ${result.message}`)

  } catch (error) {
    console.error(`❌ [ORCHESTRATOR] Errore STEP 4:`, error)
    result.message = `Errore processamento configurazione: ${error.message}`
    result.errors.push(error.message)
  }

  return result
}

/**
 * STEP 5: Processa associazione dispositivo
 * - Associa dispositivo a cliente nel DB
 * - Invia email conferma attivazione
 */
export async function processDeviceAssociation(
  ctx: WorkflowContext & { deviceData: any }
): Promise<WorkflowStepResult> {
  const result: WorkflowStepResult = {
    success: false,
    step: 'process_device_association',
    message: '',
    errors: []
  }

  try {
    console.log(`🔧 [ORCHESTRATOR] STEP 5: Associazione dispositivo per cliente ${ctx.leadData.id}`)

    // 5.1: Associa dispositivo (usando modulo esistente)
    const deviceResult = await associateDevice(ctx.db, {
      leadId: ctx.leadData.id,
      imei: ctx.deviceData.imei,
      modello: ctx.deviceData.modello
    })

    if (!deviceResult.success) {
      result.errors.push(deviceResult.error)
      result.message = 'Errore associazione dispositivo'
      return result
    }

    // 5.2: Invia email conferma attivazione
    const emailResult = await WorkflowEmailManager.inviaEmailConfermaAttivazione(
      ctx.leadData,
      {
        imei: ctx.deviceData.imei,
        modello: ctx.deviceData.modello,
        dataAssociazione: new Date().toISOString()
      },
      ctx.env,
      ctx.db
    )

    if (emailResult.success) {
      result.success = true
      result.message = 'Dispositivo associato e email conferma inviata'
      result.data = {
        deviceId: deviceResult.deviceId,
        emailsSent: emailResult.emailsSent
      }
    } else {
      result.errors.push(...emailResult.errors)
      result.message = 'Errore invio email conferma'
    }

    // Aggiorna status lead a CONVERTED (completamente attivato)
    await updateLeadStatus(ctx.db, ctx.leadData.id, 'CONVERTED')

    console.log(`✅ [ORCHESTRATOR] STEP 5 completato: ${result.message}`)
    console.log(`🎉 [ORCHESTRATOR] Workflow completo per lead ${ctx.leadData.id}!`)

  } catch (error) {
    console.error(`❌ [ORCHESTRATOR] Errore STEP 5:`, error)
    result.message = `Errore associazione dispositivo: ${error.message}`
    result.errors.push(error.message)
  }

  return result
}

// ==================== HELPER FUNCTIONS ====================

async function getDocumentUrls(leadData: LeadData): Promise<{ brochure?: string; manuale?: string }> {
  const urls: { brochure?: string; manuale?: string } = {}
  
  if (leadData.vuoleBrochure) {
    urls.brochure = '/public/brochures/Brochure_eCura.pdf'
  }
  
  if (leadData.vuoleManuale) {
    urls.manuale = '/public/documents/Manuale_SiDLY.pdf'
  }
  
  return urls
}

async function generateContractForLead(ctx: WorkflowContext): Promise<WorkflowStepResult> {
  // Placeholder: chiamata al sistema di generazione contratti esistente
  // In produzione, questo chiamerà document-manager.ts
  console.log(`📄 [HELPER] Generazione contratto ${ctx.leadData.pacchetto} per lead ${ctx.leadData.id}`)
  
  const tipoServizio = ctx.leadData.pacchetto.toUpperCase().includes('AVANZAT') ? 'AVANZATO' : 'BASE'
  const prezzoBase = tipoServizio === 'AVANZATO' ? 840 : 480
  const prezzoIvaInclusa = prezzoBase * 1.22
  
  const contractId = `CTR${Date.now()}`
  const contractCode = `CTR-${ctx.leadData.id}-${Date.now()}`
  
  // 🔥 CRITICAL FIX: Save contract to database with status=SENT
  // NOTE: Database persistence is attempted but not fatal if it fails
  try {
    const templateName = tipoServizio === 'AVANZATO' 
      ? 'Template_Contratto_Avanzato_TeleMedCare' 
      : 'Template_Contratto_Base_TeleMedCare'
    
    await ctx.db.prepare(`
      INSERT INTO contracts (
        id, leadId, codice_contratto, tipo_contratto, template_utilizzato,
        contenuto_html, prezzo_mensile, durata_mesi, prezzo_totale, status,
        email_template_used, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      contractId,
      ctx.leadData.id,
      contractCode,
      tipoServizio,
      templateName,
      '<p>Contratto placeholder - sarà generato dal document manager</p>',
      prezzoBase,
      12,
      prezzoIvaInclusa,
      'SENT',
      'email_invio_contratto',
      new Date().toISOString(),
      new Date().toISOString()
    ).run()
    
    console.log(`✅ [HELPER] Contratto ${contractId} salvato nel database con status=SENT`)
  } catch (dbError) {
    console.error(`❌ [HELPER] Errore salvataggio contratto nel database:`, dbError)
    console.warn(`⚠️ [HELPER] Contratto non salvato nel DB, ma workflow continua`)
    // Continue anyway - the contract data is still valid for email sending
  }
  
  return {
    success: true,
    step: 'generate_contract',
    message: 'Contratto generato',
    data: {
      contractId,
      contractCode,
      contractPdfUrl: `/documents/contratti/${contractCode}.pdf`,
      tipoServizio,
      prezzoBase,
      prezzoIvaInclusa
    }
  }
}

async function generateProformaForContract(ctx: WorkflowContext & { contractId: string }): Promise<WorkflowStepResult> {
  // Placeholder: chiamata al sistema di generazione proforma
  console.log(`💰 [HELPER] Generazione proforma per contratto ${ctx.contractId}`)
  
  const tipoServizio = ctx.leadData.pacchetto.toUpperCase().includes('AVANZAT') ? 'AVANZATO' : 'BASE'
  const prezzoBase = tipoServizio === 'AVANZATO' ? 840 : 480
  const prezzoIvaInclusa = prezzoBase * 1.22
  
  const proformaId = `PRF${Date.now()}`
  const numeroProforma = `PRF-${ctx.leadData.id}-${Date.now()}`
  
  // Scadenza proforma: 30 giorni
  const dataEmissione = new Date()
  const dataScadenza = new Date()
  dataScadenza.setDate(dataScadenza.getDate() + 30)
  
  // 🔥 CRITICAL FIX: Save proforma to database with correct schema
  try {
    await ctx.db.prepare(`
      INSERT INTO proforma (
        id, contract_id, leadId, numero_proforma, data_emissione, data_scadenza,
        cliente_nome, cliente_cognome, cliente_email, cliente_telefono,
        cliente_indirizzo, cliente_citta, cliente_cap, cliente_provincia, cliente_codice_fiscale,
        tipo_servizio, prezzo_mensile, durata_mesi, prezzo_totale,
        status, email_template_used, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      proformaId,
      ctx.contractId,
      ctx.leadData.id,
      numeroProforma,
      dataEmissione.toISOString().split('T')[0], // Data formato YYYY-MM-DD
      dataScadenza.toISOString().split('T')[0],
      ctx.leadData.nomeRichiedente || 'Cliente',
      ctx.leadData.cognomeRichiedente || '',
      ctx.leadData.email || 'email@example.com',
      ctx.leadData.telefono || '',
      ctx.leadData.indirizzoIntestatario || ctx.leadData.indirizzoAssistito || '',
      ctx.leadData.cittaIntestatario || ctx.leadData.cittaAssistito || '',
      ctx.leadData.capIntestatario || ctx.leadData.capAssistito || '',
      ctx.leadData.provinciaIntestatario || ctx.leadData.provinciaAssistito || '',
      ctx.leadData.cfIntestatario || ctx.leadData.cfAssistito || ctx.leadData.codiceFiscaleIntestatario || '',
      tipoServizio,
      prezzoBase,
      12,
      prezzoIvaInclusa,
      'SENT',
      'email_invio_proforma',
      new Date().toISOString(),
      new Date().toISOString()
    ).run()
    
    console.log(`✅ [HELPER] Proforma ${proformaId} salvata nel database`)
  } catch (dbError) {
    console.error(`❌ [HELPER] Errore salvataggio proforma nel database:`, dbError)
    // Log the error but don't fail - proforma data is still returned for email
    console.warn(`⚠️ [HELPER] Proforma non salvata nel DB, ma workflow continua`)
  }
  
  return {
    success: true,
    step: 'generate_proforma',
    message: 'Proforma generata',
    data: {
      proformaId,
      numeroProforma,
      proformaPdfUrl: `/documents/proforma/${numeroProforma}.pdf`,
      tipoServizio,
      prezzoBase,
      prezzoIvaInclusa,
      dataScadenza: dataScadenza.toISOString()
    }
  }
}

async function generateCodiceCliente(db: D1Database, leadId: string): Promise<string> {
  // Genera codice cliente univoco
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `CLI-${timestamp}-${random}`
}

async function updateLeadStatus(db: D1Database, leadId: string, status: string): Promise<void> {
  try {
    await db.prepare(`
      UPDATE leads 
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, leadId).run()
    
    console.log(`✅ [HELPER] Lead ${leadId} status aggiornato a ${status}`)
  } catch (error) {
    console.error(`❌ [HELPER] Errore aggiornamento status lead:`, error)
  }
}

async function associateDevice(db: D1Database, data: any): Promise<any> {
  // Placeholder: chiamata al sistema gestione dispositivi
  console.log(`🔧 [HELPER] Associazione dispositivo ${data.imei} a lead ${data.leadId}`)
  
  return {
    success: true,
    deviceId: `DEV${Date.now()}`
  }
}

export default {
  processNewLead,
  processContractSignature,
  processPayment,
  processConfiguration,
  processDeviceAssociation
}
