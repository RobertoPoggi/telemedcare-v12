/**
 * TeleMedCare V11.0 - Complete Workflow Orchestrator
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
import { generateContractPDF, ContractData } from './contract-generator'
import { generateProformaPDF, ProformaData } from './proforma-generator'
import { SERVICE_PRICES, IVA_RATES, calculatePriceWithVAT, SalesChannel, getFinalPrice } from '../config/pricing-config'

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

      // Genera contratto (usando il sistema esistente)
      const contractResult = await generateContractForLead(ctx)

      if (contractResult.success) {
        // Ottieni URLs documenti
        const documentUrls = await getDocumentUrls(ctx.leadData)

        // Invia email con contratto + documenti
        const contrattoResult = await WorkflowEmailManager.inviaEmailContratto(
          ctx.leadData,
          contractResult.data,
          ctx.env,
          documentUrls,
          ctx.db
        )

        if (contrattoResult.success) {
          result.success = true
          result.message = 'Lead processato: contratto generato e inviato'
          result.data = {
            contractId: contractResult.data.contractId,
            emailsSent: contrattoResult.emailsSent
          }
        } else {
          result.errors.push(...contrattoResult.errors)
          result.message = 'Errore invio contratto'
        }
      } else {
        result.errors.push(contractResult.message)
        result.message = 'Errore generazione contratto'
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
    urls.brochure = '/documents/brochures/brochure_telemedcare.pdf'
  }
  
  if (leadData.vuoleManuale) {
    urls.manuale = '/documents/manuals/manuale_sidly.pdf'
  }
  
  return urls
}

async function generateContractForLead(ctx: WorkflowContext): Promise<WorkflowStepResult> {
  console.log(`📄 [HELPER] Generazione contratto ${ctx.leadData.pacchetto} per lead ${ctx.leadData.id}`)
  
  const tipoServizio = ctx.leadData.pacchetto.toUpperCase().includes('AVANZAT') || ctx.leadData.pacchetto.toUpperCase().includes('ADVANCED') ? 'ADVANCED' : 'BASE'
  
  // 💰 Calcola prezzi usando configurazione centralizzata
  const channel = (ctx.leadData as any).canale || SalesChannel.DIRECT
  const pricing = getFinalPrice(tipoServizio, false, channel)
  const prezzoBase = pricing.priceBeforeVAT
  const prezzoIvaInclusa = pricing.finalPrice
  
  const contractId = `CTR${Date.now()}`
  const contractCode = `CTR-${ctx.leadData.id}-${Date.now()}`
  
  // 📄 GENERA IL PDF DEL CONTRATTO
  let pdfBuffer: Buffer | null = null
  let filePath: string | null = null
  
  try {
    // CRITICO: Determina chi è l'intestatario del contratto in base alla scelta del lead
    const intestazioneContratto = ctx.leadData.intestazioneContratto || 'richiedente'
    const usaAssistitoComeIntestatario = intestazioneContratto === 'assistito'
    
    console.log(`📋 [GENERATOR] Intestazione contratto: ${intestazioneContratto}`)
    console.log(`📋 [GENERATOR] ${usaAssistitoComeIntestatario ? 'Contratto intestato all\'ASSISTITO' : 'Contratto intestato al RICHIEDENTE'}`)
    
    const contractData: ContractData = {
      codiceContratto: contractCode,
      tipoContratto: tipoServizio,
      // DATI INTESTATARIO (chi paga e firma il contratto) - BASATO SU SCELTA LEAD
      nomeIntestatario: usaAssistitoComeIntestatario ? (ctx.leadData.nomeAssistito || ctx.leadData.nomeRichiedente) : ctx.leadData.nomeRichiedente,
      cognomeIntestatario: usaAssistitoComeIntestatario ? (ctx.leadData.cognomeAssistito || ctx.leadData.cognomeRichiedente) : ctx.leadData.cognomeRichiedente,
      cfIntestatario: usaAssistitoComeIntestatario ? (ctx.leadData.cfAssistito || 'DA FORNIRE') : (ctx.leadData.cfRichiedente || 'DA FORNIRE'),
      indirizzoIntestatario: usaAssistitoComeIntestatario ? (ctx.leadData.indirizzoAssistito || 'DA FORNIRE') : (ctx.leadData.indirizzoRichiedente || 'DA FORNIRE'),
      capIntestatario: usaAssistitoComeIntestatario ? ctx.leadData.capAssistito : ctx.leadData.capRichiedente,
      cittaIntestatario: usaAssistitoComeIntestatario ? ctx.leadData.cittaAssistito : ctx.leadData.cittaRichiedente,
      provinciaIntestatario: usaAssistitoComeIntestatario ? ctx.leadData.provinciaAssistito : ctx.leadData.provinciaRichiedente,
      luogoNascitaIntestatario: usaAssistitoComeIntestatario ? ctx.leadData.luogoNascitaAssistito : ctx.leadData.luogoNascitaRichiedente,
      dataNascitaIntestatario: usaAssistitoComeIntestatario ? ctx.leadData.dataNascitaAssistito : ctx.leadData.dataNascitaRichiedente,
      telefonoIntestatario: usaAssistitoComeIntestatario ? (ctx.leadData.telefonoAssistito || ctx.leadData.telefonoRichiedente) : ctx.leadData.telefonoRichiedente,
      emailIntestatario: usaAssistitoComeIntestatario ? (ctx.leadData.emailAssistito || ctx.leadData.emailRichiedente) : ctx.leadData.emailRichiedente,
      // DATI ASSISTITO (chi riceve il servizio - sempre presenti)
      nomeAssistito: ctx.leadData.nomeAssistito || ctx.leadData.nomeRichiedente,
      cognomeAssistito: ctx.leadData.cognomeAssistito || ctx.leadData.cognomeRichiedente,
      luogoNascitaAssistito: ctx.leadData.luogoNascitaAssistito,
      dataNascitaAssistito: ctx.leadData.dataNascitaAssistito,
      cfAssistito: ctx.leadData.cfAssistito,
      indirizzoAssistito: ctx.leadData.indirizzoAssistito,
      capAssistito: ctx.leadData.capAssistito,
      cittaAssistito: ctx.leadData.cittaAssistito,
      provinciaAssistito: ctx.leadData.provinciaAssistito,
      telefonoAssistito: ctx.leadData.telefonoAssistito,
      emailAssistito: ctx.leadData.emailAssistito,
      // DATI CONTRATTO
      dataContratto: new Date().toLocaleDateString('it-IT'),
      prezzo: prezzoBase
    }
    
    console.log(`📄 [GENERATOR] Generazione PDF contratto ${tipoServizio}...`)
    pdfBuffer = await generateContractPDF(contractData)
    
    // In Cloudflare Workers non possiamo scrivere su filesystem
    // Salviamo il PDF come base64 nel database o in R2/KV
    filePath = `/documents/contratti/${contractCode}.pdf`
    console.log(`✅ [GENERATOR] PDF contratto generato: ${pdfBuffer.length} bytes`)
    
  } catch (pdfError) {
    console.error(`❌ [GENERATOR] Errore generazione PDF contratto:`, pdfError)
    console.warn(`⚠️ [GENERATOR] Contratto PDF non generato, ma workflow continua`)
  }
  
  // 💾 Salva contratto nel database
  try {
    await ctx.db.prepare(`
      INSERT INTO contracts (
        id, lead_id, codice_contratto, contract_type, piano_servizio,
        prezzo, intestatario, cf_intestatario, indirizzo_intestatario,
        file_path, content, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      contractId,
      ctx.leadData.id,
      contractCode,
      tipoServizio,
      `TeleMedCare ${tipoServizio}`,
      prezzoBase,
      `${ctx.leadData.nomeRichiedente} ${ctx.leadData.cognomeRichiedente}`,
      ctx.leadData.cfRichiedente || '',
      ctx.leadData.indirizzoRichiedente || '',
      filePath,
      pdfBuffer ? pdfBuffer.toString('base64') : null,
      'SENT',
      new Date().toISOString(),
      new Date().toISOString()
    ).run()
    
    console.log(`✅ [HELPER] Contratto ${contractId} salvato nel database con PDF`)
  } catch (dbError) {
    console.error(`❌ [HELPER] Errore salvataggio contratto nel database:`, dbError)
    console.warn(`⚠️ [HELPER] Contratto non salvato nel DB, ma workflow continua`)
  }
  
  return {
    success: true,
    step: 'generate_contract',
    message: 'Contratto generato',
    data: {
      contractId,
      contractCode,
      contractPdfUrl: `/documents/contratti/${contractCode}.pdf`,
      contractPdfBuffer: pdfBuffer,  // 📎 PDF buffer for email attachment
      tipoServizio,
      prezzoBase,
      prezzoIvaInclusa
    }
  }
}

async function generateProformaForContract(ctx: WorkflowContext & { contractId: string }): Promise<WorkflowStepResult> {
  console.log(`💰 [HELPER] Generazione proforma per contratto ${ctx.contractId}`)
  
  // 💰 Calcola prezzi usando configurazione centralizzata
  const tipoServizio = ctx.leadData.pacchetto.toUpperCase().includes('AVANZAT') || ctx.leadData.pacchetto.toUpperCase().includes('ADVANCED') ? 'ADVANCED' : 'BASE'
  const channel = (ctx.leadData as any).canale || SalesChannel.DIRECT
  const pricing = getFinalPrice(tipoServizio, false, channel)
  const prezzoBase = pricing.priceBeforeVAT
  const prezzoIvaInclusa = pricing.finalPrice
  
  const proformaId = `PRF${Date.now()}`
  const numeroProforma = `PRF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
  
  // Scadenza proforma: 30 giorni
  const dataEmissione = new Date()
  const dataScadenza = new Date()
  dataScadenza.setDate(dataScadenza.getDate() + 30)
  
  // 📄 Genera PDF proforma usando il nuovo generatore (da template DOCX)
  let pdfBuffer: Buffer | null = null
  let filePath = ''
  
  try {
    // Recupera contract per ottenere serial number dispositivo (se assegnato)
    const contract = await ctx.db.prepare(`
      SELECT c.*, d.serial_number 
      FROM contracts c
      LEFT JOIN dispositivi d ON c.lead_id = d.lead_id
      WHERE c.id = ?
    `).bind(ctx.contractId).first()
    
    const serialNumber = contract?.serial_number || 'DA_ASSEGNARE'
    
    const proformaData: ProformaData = {
      numeroProforma,
      dataRichiesta: dataEmissione.toLocaleDateString('it-IT'),
      nomeAssistito: ctx.leadData.nomeAssistito || ctx.leadData.nomeRichiedente,
      cognomeAssistito: ctx.leadData.cognomeAssistito || ctx.leadData.cognomeRichiedente,
      codiceFiscale: (ctx.leadData as any).cfAssistito || (ctx.leadData as any).cfRichiedente || '',
      indirizzoCompleto: (ctx.leadData as any).indirizzoAssistito || (ctx.leadData as any).indirizzoRichiedente || '',
      citta: (ctx.leadData as any).cittaAssistito || (ctx.leadData as any).cittaRichiedente || '',
      cap: (ctx.leadData as any).capAssistito || (ctx.leadData as any).capRichiedente,
      provincia: (ctx.leadData as any).provinciaAssistito || (ctx.leadData as any).provinciaRichiedente,
      emailRichiedente: ctx.leadData.emailRichiedente,
      telefonoRichiedente: ctx.leadData.telefonoRichiedente,
      dataAttivazione: dataEmissione.toLocaleDateString('it-IT'),
      tipoPrestazione: tipoServizio as 'BASE' | 'ADVANCED',
      serialNumber,
      telefonoSidly: (ctx.leadData as any).telefonoSidly,
      prezzoPacchetto: prezzoBase,
      comunicazioneTipo: tipoServizio === 'ADVANCED' ? 'familiari/Centrale Operativa' : 'familiari'
    }
    
    console.log(`📄 [GENERATOR] Generazione PDF proforma ${numeroProforma}...`)
    pdfBuffer = await generateProformaPDF(proformaData)
    filePath = `/documents/proforma/${numeroProforma}.pdf`
    console.log(`✅ [GENERATOR] PDF proforma generato: ${pdfBuffer.length} bytes`)
    
  } catch (pdfError) {
    console.error(`❌ [GENERATOR] Errore generazione PDF proforma:`, pdfError)
    console.warn(`⚠️ [GENERATOR] Proforma PDF non generato, ma workflow continua`)
  }
  
  // 💾 Salva proforma nel database
  try {
    await ctx.db.prepare(`
      INSERT INTO proforma (
        id, contract_id, lead_id, numero_proforma, data_emissione, data_scadenza,
        cliente_nome, cliente_cognome, cliente_email,
        tipo_servizio, prezzo_mensile, durata_mesi, prezzo_totale,
        file_path, content,
        status, email_template_used, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      proformaId || `PRF${Date.now()}`,
      ctx.contractId || '',
      ctx.leadData.id || '',
      numeroProforma || `PRF-${Date.now()}`,
      dataEmissione.toISOString().split('T')[0], // Data formato YYYY-MM-DD
      dataScadenza.toISOString().split('T')[0],
      ctx.leadData.nomeRichiedente || 'Cliente',
      ctx.leadData.cognomeRichiedente || '',
      ctx.leadData.emailRichiedente || 'email@example.com',
      tipoServizio || 'BASE',
      prezzoBase || 0,
      12,
      prezzoIvaInclusa || 0,
      filePath || `/documents/proforma/${numeroProforma}.pdf`,
      pdfBuffer ? pdfBuffer.toString('base64') : null,
      'SENT',
      'email_invio_proforma',
      new Date().toISOString(),
      new Date().toISOString()
    ).run()
    
    console.log(`✅ [HELPER] Proforma ${proformaId} salvata nel database con PDF`)
  } catch (dbError) {
    console.error(`❌ [HELPER] Errore salvataggio proforma nel database:`, dbError)
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
      proformaPdfBuffer: pdfBuffer,  // 📎 PDF buffer for email attachment
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
