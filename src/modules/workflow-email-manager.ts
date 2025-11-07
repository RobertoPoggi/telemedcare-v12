/**
 * TeleMedCare V11.0 - Workflow Email Manager
 * Gestisce il flusso completo delle email secondo il processo corretto:
 * 
 * FLUSSO CORRETTO:
 * 1. Lead compila form → Email notifica a info@telemedcare.it
 * 2a. Se solo brochure/manuale → Email documenti informativi al lead
 * 2b. Se chiede contratto → Genera e invia contratto + documenti
 * 3. Lead firma contratto → Genera e invia proforma
 * 4. Lead paga → Email benvenuto + form configurazione
 * 5. Cliente compila config → Email config a info@
 * 6. Operatore associa dispositivo → Email conferma attivazione
 */

import EmailService from './email-service'
import { loadEmailTemplate, renderTemplate } from './template-loader-helper'
import { D1Database } from '@cloudflare/workers-types'

export interface LeadData {
  id: string
  // DATI RICHIEDENTE (intestatario contratto)
  nomeRichiedente: string
  cognomeRichiedente: string
  emailRichiedente: string
  telefonoRichiedente?: string
  cfRichiedente?: string
  indirizzoRichiedente?: string
  capRichiedente?: string
  cittaRichiedente?: string
  provinciaRichiedente?: string
  luogoNascitaRichiedente?: string
  dataNascitaRichiedente?: string
  // DATI ASSISTITO (chi riceve il servizio)
  nomeAssistito?: string
  cognomeAssistito?: string
  etaAssistito?: number | string
  cfAssistito?: string
  indirizzoAssistito?: string
  capAssistito?: string
  cittaAssistito?: string
  provinciaAssistito?: string
  dataNascitaAssistito?: string
  luogoNascitaAssistito?: string
  telefonoAssistito?: string
  emailAssistito?: string
  // SERVIZIO RICHIESTO
  pacchetto: string // 'BASE' o 'AVANZATO'
  vuoleBrochure: boolean
  vuoleManuale: boolean
  vuoleContratto: boolean
  intestazioneContratto?: string // 'richiedente' o 'assistito' - chi è l'intestatario del contratto
  // ALTRI DATI
  fonte?: string
  condizioniSalute?: string
  preferenzaContatto?: string
  urgenzaRisposta?: string
  giorniRisposta?: number
  note?: string
}

export interface WorkflowEmailResult {
  success: boolean
  step: string
  emailsSent: string[]
  errors: string[]
  messageIds?: string[]
}

/**
 * STEP 1: Invia email notifica nuovo lead a info@telemedcare.it
 */
export async function inviaEmailNotificaInfo(
  leadData: LeadData,
  env: any,
  db: D1Database
): Promise<WorkflowEmailResult> {
  const result: WorkflowEmailResult = {
    success: false,
    step: 'notifica_info',
    emailsSent: [],
    errors: []
  }

  try {
    console.log(`📧 [WORKFLOW] STEP 1: Invio notifica nuovo lead a info@telemedcare.it`)
    console.log(`Lead: ${leadData.nomeRichiedente} ${leadData.cognomeRichiedente} - ${leadData.emailRichiedente}`)

    const emailService = new EmailService(env)
    
    // Carica template email_notifica_info
    const template = await loadEmailTemplate('email_notifica_info', db)
    
    // Prepara i dati per il template - TUTTI I CAMPI RICHIESTI
    const now = new Date()
    const templateData = {
      // DATI RICHIEDENTE
      NOME_RICHIEDENTE: leadData.nomeRichiedente,
      COGNOME_RICHIEDENTE: leadData.cognomeRichiedente,
      EMAIL_RICHIEDENTE: leadData.emailRichiedente,
      TELEFONO_RICHIEDENTE: leadData.telefonoRichiedente || 'Non fornito',
      CF_RICHIEDENTE: leadData.cfRichiedente || 'Non fornito',
      INDIRIZZO_RICHIEDENTE: leadData.indirizzoRichiedente || 'Non fornito',
      CAP_RICHIEDENTE: leadData.capRichiedente || 'Non fornito',
      CITTA_RICHIEDENTE: leadData.cittaRichiedente || 'Non fornita',
      PROVINCIA_RICHIEDENTE: leadData.provinciaRichiedente || 'Non fornita',
      LUOGO_NASCITA_RICHIEDENTE: leadData.luogoNascitaRichiedente || 'Non fornito',
      DATA_NASCITA_RICHIEDENTE: leadData.dataNascitaRichiedente || 'Non fornita',
      // DATI ASSISTITO
      NOME_ASSISTITO: leadData.nomeAssistito || leadData.nomeRichiedente,
      COGNOME_ASSISTITO: leadData.cognomeAssistito || leadData.cognomeRichiedente,
      ETA_ASSISTITO: leadData.etaAssistito?.toString() || 'Non fornita',
      DATA_NASCITA_ASSISTITO: leadData.dataNascitaAssistito || 'Non fornita',
      LUOGO_NASCITA_ASSISTITO: leadData.luogoNascitaAssistito || 'Non fornito',
      CF_ASSISTITO: leadData.cfAssistito || 'Non fornito',
      INDIRIZZO_ASSISTITO: leadData.indirizzoAssistito || 'Non fornito',
      CAP_ASSISTITO: leadData.capAssistito || 'Non fornito',
      CITTA_ASSISTITO: leadData.cittaAssistito || 'Non fornita',
      PROVINCIA_ASSISTITO: leadData.provinciaAssistito || 'Non fornita',
      TELEFONO_ASSISTITO: leadData.telefonoAssistito || 'Non fornito',
      EMAIL_ASSISTITO: leadData.emailAssistito || 'Non fornita',
      // SERVIZIO E RICHIESTE
      PIANO_SERVIZIO: leadData.pacchetto === 'BASE' ? 'TeleMedCare Base' : 'TeleMedCare Avanzato',
      TIPO_SERVIZIO: leadData.pacchetto,
      PREZZO_PIANO: leadData.pacchetto === 'BASE' ? '€585,60' : '€1.024,80',
      VUOLE_CONTRATTO: leadData.vuoleContratto ? 'SÌ' : 'NO',
      INTESTAZIONE_CONTRATTO: leadData.intestazioneContratto || 'Non specificata',
      VUOLE_BROCHURE: leadData.vuoleBrochure ? 'SÌ' : 'NO',
      VUOLE_MANUALE: leadData.vuoleManuale ? 'SÌ' : 'NO',
      // CONDIZIONI E NOTE (CRITICI!)
      CONDIZIONI_SALUTE: leadData.condizioniSalute || 'Non specificate',
      NOTE_AGGIUNTIVE: leadData.note || 'Nessuna',
      PREFERENZA_CONTATTO: leadData.preferenzaContatto || 'Non specificata',
      URGENZA_RISPOSTA: leadData.urgenzaRisposta || 'Non specificata',
      GIORNI_RISPOSTA: leadData.giorniRisposta?.toString() || 'Non specificati',
      // DATI SISTEMA
      FONTE: leadData.fonte || 'LANDING_PAGE',
      DATA_RICHIESTA: now.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' }),
      ORA_RICHIESTA: now.toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome' }),
      TIMESTAMP_COMPLETO: now.toLocaleString('it-IT', { timeZone: 'Europe/Rome' }),
      VERSIONE_SISTEMA: 'TeleMedCare V11.0'
    }

    // Renderizza template con i dati
    const emailHtml = renderTemplate(template, templateData)

    // Invia email a info@telemedcare.it
    const sendResult = await emailService.sendEmail({
      to: env.EMAIL_TO_INFO || 'info@telemedcare.it',
      from: env.EMAIL_FROM || 'noreply@telemedcare.it',
      subject: `🆕 Nuovo Lead: ${leadData.nomeRichiedente} ${leadData.cognomeRichiedente} - ${leadData.pacchetto}`,
      html: emailHtml,
      text: `Nuovo lead ricevuto: ${leadData.nomeRichiedente} ${leadData.cognomeRichiedente}\nServizio: ${leadData.pacchetto}\nEmail: ${leadData.emailRichiedente}`
    })

    if (sendResult.success) {
      result.success = true
      result.emailsSent.push('email_notifica_info -> info@telemedcare.it')
      result.messageIds = [sendResult.messageId]
      console.log(`✅ [WORKFLOW] Email notifica inviata con successo: ${sendResult.messageId}`)
    } else {
      result.errors.push(`Errore invio email notifica: ${sendResult.error}`)
      console.error(`❌ [WORKFLOW] Errore invio email notifica:`, sendResult.error)
    }

  } catch (error) {
    result.errors.push(`Eccezione invio email notifica: ${error.message}`)
    console.error(`❌ [WORKFLOW] Eccezione STEP 1:`, error)
  }

  return result
}

/**
 * STEP 2A: Invia documenti informativi (brochure/manuale) se richiesti e NON vuole contratto
 */
export async function inviaEmailDocumentiInformativi(
  leadData: LeadData,
  env: any,
  documentUrls: { brochure?: string; manuale?: string },
  db: D1Database
): Promise<WorkflowEmailResult> {
  const result: WorkflowEmailResult = {
    success: false,
    step: 'documenti_informativi',
    emailsSent: [],
    errors: []
  }

  try {
    console.log(`📧 [WORKFLOW] STEP 2A: Invio documenti informativi a ${leadData.emailRichiedente}`)
    console.log(`Richiesti: Brochure=${leadData.vuoleBrochure}, Manuale=${leadData.vuoleManuale}`)

    const emailService = new EmailService(env)
    
    // Carica template email_documenti_informativi
    const template = await loadEmailTemplate('email_documenti_informativi', db)
    
    // Prepara i dati per il template
    const templateData = {
      NOME_CLIENTE: leadData.nomeRichiedente,
      COGNOME_CLIENTE: leadData.cognomeRichiedente,
      TIPO_SERVIZIO: leadData.pacchetto === 'BASE' ? 'Base' : 'Avanzato',
      DATA_RICHIESTA: new Date().toLocaleDateString('it-IT')
    }

    // Renderizza template
    const emailHtml = renderTemplate(template, templateData)

    // Prepara allegati
    const attachments = []
    if (leadData.vuoleBrochure && documentUrls.brochure) {
      attachments.push({
        filename: 'Brochure_TeleMedCare.pdf',
        path: documentUrls.brochure
      })
    }
    if (leadData.vuoleManuale && documentUrls.manuale) {
      attachments.push({
        filename: 'Manuale_Utente_SiDLY.pdf',
        path: documentUrls.manuale
      })
    }

    // Invia email con allegati
    const sendResult = await emailService.sendEmail({
      to: leadData.emailRichiedente,
      from: env.EMAIL_FROM || 'noreply@telemedcare.it',
      subject: '📚 TeleMedCare - Documenti Informativi Richiesti',
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined
    })

    if (sendResult.success) {
      result.success = true
      result.emailsSent.push(`email_documenti_informativi -> ${leadData.emailRichiedente}`)
      result.messageIds = [sendResult.messageId]
      console.log(`✅ [WORKFLOW] Email documenti inviata con successo: ${sendResult.messageId}`)
    } else {
      result.errors.push(`Errore invio email documenti: ${sendResult.error}`)
      console.error(`❌ [WORKFLOW] Errore invio email documenti:`, sendResult.error)
    }

  } catch (error) {
    result.errors.push(`Eccezione invio email documenti: ${error.message}`)
    console.error(`❌ [WORKFLOW] Eccezione STEP 2A:`, error)
  }

  return result
}

/**
 * STEP 2B: Invia contratto pre-compilato con brochure/manuale
 */
export async function inviaEmailContratto(
  leadData: LeadData,
  contractData: {
    contractId: string
    contractCode: string
    contractPdfUrl: string
    contractPdfBuffer?: Buffer  // 📎 PDF buffer for attachment
    tipoServizio: string
    prezzoBase: number
    prezzoIvaInclusa: number
  },
  env: any,
  documentUrls: { brochure?: string; manuale?: string },
  db: D1Database
): Promise<WorkflowEmailResult> {
  const result: WorkflowEmailResult = {
    success: false,
    step: 'invio_contratto',
    emailsSent: [],
    errors: []
  }

  try {
    console.log(`📧 [WORKFLOW] STEP 2B: Invio contratto ${contractData.tipoServizio} a ${leadData.emailRichiedente}`)

    const emailService = new EmailService(env)
    
    // Carica template email_invio_contratto (UNICO per BASE e AVANZATO)
    const template = await loadEmailTemplate('email_invio_contratto', db)
    
    // Prepara i dati per il template
    const templateData = {
      NOME_CLIENTE: leadData.nomeRichiedente,
      COGNOME_CLIENTE: leadData.cognomeRichiedente,
      TIPO_SERVIZIO: contractData.tipoServizio, // BASE o ADVANCED (come nel template)
      PIANO_SERVIZIO: contractData.tipoServizio === 'BASE' ? 'TeleMedCare Base' : 'TeleMedCare Avanzato',
      PREZZO_PIANO: `€${contractData.prezzoIvaInclusa.toFixed(2)}`,
      CODICE_CLIENTE: leadData.id,
      CODICE_CONTRATTO: contractData.contractCode,
      LINK_FIRMA: `${env.PUBLIC_URL || 'https://telemedcare.it'}/firma-contratto?contractId=${contractData.contractId}`,
      DATA_INVIO: new Date().toLocaleDateString('it-IT')
    }

    // Renderizza template
    const emailHtml = renderTemplate(template, templateData)

    // Prepara allegati: Contratto + Brochure + Manuale
    const attachments = []
    
    // Contratto (OBBLIGATORIO) - usa buffer PDF se disponibile, altrimenti path
    if (contractData.contractPdfBuffer) {
      console.log(`📎 [WORKFLOW] Allegando contratto da buffer PDF (${contractData.contractPdfBuffer.length} bytes)`)
      attachments.push({
        filename: `Contratto_TeleMedCare_${contractData.contractCode}.pdf`,
        content: contractData.contractPdfBuffer.toString('base64'),
        contentType: 'application/pdf'
      })
    } else {
      console.warn(`⚠️ [WORKFLOW] Buffer PDF non disponibile, uso path: ${contractData.contractPdfUrl}`)
      attachments.push({
        filename: `Contratto_TeleMedCare_${contractData.contractCode}.pdf`,
        path: contractData.contractPdfUrl
      })
    }
    
    // Brochure (se richiesta)
    if (leadData.vuoleBrochure && documentUrls.brochure) {
      attachments.push({
        filename: 'Brochure_TeleMedCare.pdf',
        path: documentUrls.brochure
      })
    }
    
    // Manuale (se richiesto)
    if (leadData.vuoleManuale && documentUrls.manuale) {
      attachments.push({
        filename: 'Manuale_Utente_SiDLY.pdf',
        path: documentUrls.manuale
      })
    }

    // Invia email con allegati
    const sendResult = await emailService.sendEmail({
      to: leadData.emailRichiedente,
      from: env.EMAIL_FROM || 'noreply@telemedcare.it',
      subject: `📄 TeleMedCare - Il Tuo Contratto ${contractData.tipoServizio}`,
      html: emailHtml,
      attachments: attachments
    })

    if (sendResult.success) {
      result.success = true
      result.emailsSent.push(`email_invio_contratto -> ${leadData.emailRichiedente}`)
      result.messageIds = [sendResult.messageId]
      console.log(`✅ [WORKFLOW] Email contratto inviata con successo: ${sendResult.messageId}`)
    } else {
      result.errors.push(`Errore invio email contratto: ${sendResult.error}`)
      console.error(`❌ [WORKFLOW] Errore invio email contratto:`, sendResult.error)
    }

  } catch (error) {
    result.errors.push(`Eccezione invio email contratto: ${error.message}`)
    console.error(`❌ [WORKFLOW] Eccezione STEP 2B:`, error)
  }

  return result
}

/**
 * STEP 3: Invia proforma dopo firma contratto
 */
export async function inviaEmailProforma(
  leadData: LeadData,
  proformaData: {
    proformaId: string
    numeroProforma: string
    proformaPdfUrl: string
    tipoServizio: string
    prezzoBase: number
    prezzoIvaInclusa: number
    dataScadenza: string
  },
  env: any,
  db: D1Database
): Promise<WorkflowEmailResult> {
  const result: WorkflowEmailResult = {
    success: false,
    step: 'invio_proforma',
    emailsSent: [],
    errors: []
  }

  try {
    console.log(`📧 [WORKFLOW] STEP 3: Invio proforma ${proformaData.numeroProforma} a ${leadData.emailRichiedente}`)

    const emailService = new EmailService(env)
    
    // Carica template email_invio_proforma
    const template = await loadEmailTemplate('email_invio_proforma', db)
    
    // Prepara i dati per il template
    const templateData = {
      NOME_CLIENTE: leadData.nomeRichiedente,
      COGNOME_CLIENTE: leadData.cognomeRichiedente,
      PIANO_SERVIZIO: proformaData.tipoServizio === 'BASE' ? 'TeleMedCare Base' : 'TeleMedCare Avanzato',
      NUMERO_PROFORMA: proformaData.numeroProforma,
      IMPORTO_TOTALE: `€${proformaData.prezzoIvaInclusa.toFixed(2)}`,
      SCADENZA_PAGAMENTO: new Date(proformaData.dataScadenza).toLocaleDateString('it-IT'),
      IBAN: 'IT02X0306909606100000061231',
      CAUSALE: `Proforma ${proformaData.numeroProforma} - TeleMedCare`,
      LINK_PAGAMENTO: `${env.PUBLIC_URL || 'https://telemedcare.it'}/pagamento?proformaId=${proformaData.proformaId}`,
      DATA_INVIO: new Date().toLocaleDateString('it-IT')
    }

    // Renderizza template
    const emailHtml = renderTemplate(template, templateData)

    // Prepara allegati: Proforma PDF
    const attachments = [{
      filename: `Proforma_${proformaData.numeroProforma}.pdf`,
      path: proformaData.proformaPdfUrl
    }]

    // Invia email con allegato
    const sendResult = await emailService.sendEmail({
      to: leadData.emailRichiedente,
      from: env.EMAIL_FROM || 'noreply@telemedcare.it',
      subject: `💰 TeleMedCare - Fattura Proforma ${proformaData.numeroProforma}`,
      html: emailHtml,
      attachments: attachments
    })

    if (sendResult.success) {
      result.success = true
      result.emailsSent.push(`email_invio_proforma -> ${leadData.emailRichiedente}`)
      result.messageIds = [sendResult.messageId]
      console.log(`✅ [WORKFLOW] Email proforma inviata con successo: ${sendResult.messageId}`)
    } else {
      result.errors.push(`Errore invio email proforma: ${sendResult.error}`)
      console.error(`❌ [WORKFLOW] Errore invio email proforma:`, sendResult.error)
    }

  } catch (error) {
    result.errors.push(`Eccezione invio email proforma: ${error.message}`)
    console.error(`❌ [WORKFLOW] Eccezione STEP 3:`, error)
  }

  return result
}

/**
 * STEP 4: Invia email benvenuto con form configurazione DOPO pagamento
 */
export async function inviaEmailBenvenuto(
  clientData: LeadData & { codiceCliente: string },
  env: any,
  db: D1Database
): Promise<WorkflowEmailResult> {
  const result: WorkflowEmailResult = {
    success: false,
    step: 'email_benvenuto',
    emailsSent: [],
    errors: []
  }

  try {
    console.log(`📧 [WORKFLOW] STEP 4: Invio email benvenuto a ${clientData.emailRichiedente}`)

    const emailService = new EmailService(env)
    
    // Carica template email_benvenuto
    const template = await loadEmailTemplate('email_benvenuto', db)
    
    // Prepara i dati per il template
    const templateData = {
      NOME_CLIENTE: clientData.nomeRichiedente,
      COGNOME_CLIENTE: clientData.cognomeRichiedente,
      PIANO_SERVIZIO: clientData.pacchetto === 'BASE' ? 'TeleMedCare Base' : 'TeleMedCare Avanzato',
      CODICE_CLIENTE: clientData.codiceCliente,
      DATA_ATTIVAZIONE: new Date().toLocaleDateString('it-IT'),
      LINK_CONFIGURAZIONE: `${env.PUBLIC_URL || 'https://telemedcare.it'}/configurazione?clientId=${clientData.codiceCliente}`,
      PREZZO_PIANO: clientData.pacchetto === 'BASE' ? '€490/anno' : '€840/anno'
    }

    // Renderizza template
    const emailHtml = renderTemplate(template, templateData)

    // Invia email
    const sendResult = await emailService.sendEmail({
      to: clientData.emailRichiedente,
      from: env.EMAIL_FROM || 'noreply@telemedcare.it',
      subject: `🎉 Benvenuto/a in TeleMedCare, ${clientData.nomeRichiedente}!`,
      html: emailHtml
    })

    if (sendResult.success) {
      result.success = true
      result.emailsSent.push(`email_benvenuto -> ${clientData.emailRichiedente}`)
      result.messageIds = [sendResult.messageId]
      console.log(`✅ [WORKFLOW] Email benvenuto inviata con successo: ${sendResult.messageId}`)
    } else {
      result.errors.push(`Errore invio email benvenuto: ${sendResult.error}`)
      console.error(`❌ [WORKFLOW] Errore invio email benvenuto:`, sendResult.error)
    }

  } catch (error) {
    result.errors.push(`Eccezione invio email benvenuto: ${error.message}`)
    console.error(`❌ [WORKFLOW] Eccezione STEP 4:`, error)
  }

  return result
}

/**
 * STEP 5: Invia configurazione cliente a info@ dopo compilazione form
 */
export async function inviaEmailConfigurazione(
  clientData: any,
  configData: any,
  env: any,
  db: D1Database
): Promise<WorkflowEmailResult> {
  const result: WorkflowEmailResult = {
    success: false,
    step: 'email_configurazione_info',
    emailsSent: [],
    errors: []
  }

  try {
    console.log(`📧 [WORKFLOW] STEP 5: Invio configurazione cliente a info@telemedcare.it`)

    const emailService = new EmailService(env)
    
    // Carica template email_configurazione (per info@)
    const template = await loadEmailTemplate('email_configurazione', db)
    
    // Prepara i dati per il template
    const templateData = {
      NOME_CLIENTE: clientData.nomeRichiedente,
      COGNOME_CLIENTE: clientData.cognomeRichiedente,
      CODICE_CLIENTE: clientData.codiceCliente,
      EMAIL_CLIENTE: clientData.emailRichiedente,
      TELEFONO_CLIENTE: clientData.telefonoRichiedente || 'Non fornito',
      PIANO_SERVIZIO: clientData.pacchetto,
      DATA_COMPILAZIONE: new Date().toLocaleDateString('it-IT'),
      DATI_CONFIGURAZIONE: JSON.stringify(configData, null, 2)
    }

    // Renderizza template
    const emailHtml = renderTemplate(template, templateData)

    // Invia email a info@
    const sendResult = await emailService.sendEmail({
      to: env.EMAIL_TO_INFO || 'info@telemedcare.it',
      from: env.EMAIL_FROM || 'noreply@telemedcare.it',
      subject: `📋 Nuova Configurazione Cliente: ${clientData.nomeRichiedente} ${clientData.cognomeRichiedente}`,
      html: emailHtml
    })

    if (sendResult.success) {
      result.success = true
      result.emailsSent.push('email_configurazione -> info@telemedcare.it')
      result.messageIds = [sendResult.messageId]
      console.log(`✅ [WORKFLOW] Email configurazione inviata con successo: ${sendResult.messageId}`)
    } else {
      result.errors.push(`Errore invio email configurazione: ${sendResult.error}`)
      console.error(`❌ [WORKFLOW] Errore invio email configurazione:`, sendResult.error)
    }

  } catch (error) {
    result.errors.push(`Eccezione invio email configurazione: ${error.message}`)
    console.error(`❌ [WORKFLOW] Eccezione STEP 5:`, error)
  }

  return result
}

/**
 * STEP 6: Invia email conferma attivazione dopo associazione dispositivo
 */
export async function inviaEmailConfermaAttivazione(
  clientData: any,
  deviceData: {
    imei: string
    modello: string
    dataAssociazione: string
  },
  env: any,
  db: D1Database
): Promise<WorkflowEmailResult> {
  const result: WorkflowEmailResult = {
    success: false,
    step: 'email_conferma_attivazione',
    emailsSent: [],
    errors: []
  }

  try {
    console.log(`📧 [WORKFLOW] STEP 6: Invio email conferma attivazione a ${clientData.emailRichiedente}`)

    const emailService = new EmailService(env)
    
    // Carica template email_conferma_attivazione
    const template = await loadEmailTemplate('email_conferma_attivazione', db)
    
    // Prepara i dati per il template
    const templateData = {
      NOME_CLIENTE: clientData.nomeRichiedente,
      COGNOME_CLIENTE: clientData.cognomeRichiedente,
      CODICE_CLIENTE: clientData.codiceCliente,
      PIANO_SERVIZIO: clientData.pacchetto === 'BASE' ? 'TeleMedCare Base' : 'TeleMedCare Avanzato',
      MODELLO_DISPOSITIVO: deviceData.modello || 'SiDLY Care Pro V11.0',
      IMEI_DISPOSITIVO: deviceData.imei,
      NUMERO_SIM: deviceData.numeroSim || 'Da configurare',
      DATA_ATTIVAZIONE: new Date(deviceData.dataAssociazione).toLocaleDateString('it-IT'),
      TELEFONO_ASSISTENZA: '+39 02 1234567'
    }

    // Renderizza template
    const emailHtml = renderTemplate(template, templateData)

    // Invia email
    const sendResult = await emailService.sendEmail({
      to: clientData.emailRichiedente,
      from: env.EMAIL_FROM || 'noreply@telemedcare.it',
      subject: `✅ TeleMedCare - Servizio Attivato!`,
      html: emailHtml
    })

    if (sendResult.success) {
      result.success = true
      result.emailsSent.push(`email_conferma -> ${clientData.emailRichiedente}`)
      result.messageIds = [sendResult.messageId]
      console.log(`✅ [WORKFLOW] Email conferma attivazione inviata con successo: ${sendResult.messageId}`)
    } else {
      result.errors.push(`Errore invio email conferma: ${sendResult.error}`)
      console.error(`❌ [WORKFLOW] Errore invio email conferma:`, sendResult.error)
    }

  } catch (error) {
    result.errors.push(`Eccezione invio email conferma: ${error.message}`)
    console.error(`❌ [WORKFLOW] Eccezione STEP 6:`, error)
  }

  return result
}

export default {
  inviaEmailNotificaInfo,
  inviaEmailDocumentiInformativi,
  inviaEmailContratto,
  inviaEmailProforma,
  inviaEmailBenvenuto,
  inviaEmailConfigurazione,
  inviaEmailConfermaAttivazione
}
