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

    // 1.1: Invia email notifica a info@
    const notificaResult = await WorkflowEmailManager.inviaEmailNotificaInfo(
      ctx.leadData,
      ctx.env,
      ctx.db
    )

    if (!notificaResult.success) {
      result.errors.push(...notificaResult.errors)
    }

    // 1.2: Determina il percorso
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

    if (emailResult.success) {
      result.success = true
      result.message = 'Configurazione salvata e inviata a info@'
      result.data = {
        configurationId: configResult.configurationId,
        emailsSent: emailResult.emailsSent
      }
    } else {
      result.errors.push(...emailResult.errors)
      result.message = 'Errore invio email configurazione'
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
    urls.brochure = '/public/documents/Brochure_TeleMedCare.pdf'
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
        cliente_nome, cliente_cognome, cliente_email,
        tipo_servizio, prezzo_mensile, durata_mesi, prezzo_totale,
        status, email_template_used, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      proformaId,
      ctx.contractId,
      ctx.leadData.id,
      numeroProforma,
      dataEmissione.toISOString().split('T')[0], // Data formato YYYY-MM-DD
      dataScadenza.toISOString().split('T')[0],
      ctx.leadData.nomeRichiedente || 'Cliente',
      ctx.leadData.cognomeRichiedente || '',
      ctx.leadData.emailRichiedente || 'email@example.com',
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
