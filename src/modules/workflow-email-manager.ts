/**
 * eCura V12.0 - Workflow Email Manager
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
import { loadEmailTemplate, renderTemplate } from './template-loader-clean'
import { D1Database } from '@cloudflare/workers-types'
import { loadBrochurePDF, getBrochureForService } from './brochure-manager'
import { formatServiceName } from './ecura-pricing'

export interface LeadData {
  id: string
  nomeRichiedente: string
  cognomeRichiedente: string
  emailRichiedente: string
  telefonoRichiedente?: string
  nomeAssistito?: string
  cognomeAssistito?: string
  etaAssistito?: number
  pacchetto: string // 'BASE' o 'AVANZATO'
  servizio?: string // 'FAMILY' | 'PRO' | 'PREMIUM' (nuovo campo eCura)
  vuoleBrochure: boolean
  vuoleManuale: boolean
  vuoleContratto: boolean
  cfRichiedente?: string
  indirizzoRichiedente?: string
  cfAssistito?: string
  indirizzoAssistito?: string
  dataNascitaAssistito?: string
  luogoNascitaAssistito?: string
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
    
    // Prepara i dati per il template
    const now = new Date()
    
    // Determina cosa ha richiesto il lead
    const vuoleContratto = leadData.vuoleContratto || false
    const vuoleBrochure = leadData.vuoleBrochure || false
    const vuoleManuale = leadData.vuoleManuale || false
    
    // Genera testo azione suggerita basata sulle richieste
    let azioneSuggerita = ''
    if (vuoleContratto) {
      azioneSuggerita = 'Il cliente ha richiesto il CONTRATTO. Procedere con la preparazione e invio del contratto pre-compilato.'
    } else if (vuoleBrochure || vuoleManuale) {
      azioneSuggerita = 'Il cliente ha richiesto solo DOCUMENTAZIONE INFORMATIVA. È stata inviata automaticamente email con documenti.'
    } else {
      azioneSuggerita = 'Contattare il cliente entro 24 ore per verificare le sue esigenze e procedere con l\'attivazione del servizio TeleMedCare.'
    }
    
    const templateData = {
      NOME_RICHIEDENTE: leadData.nomeRichiedente,
      COGNOME_RICHIEDENTE: leadData.cognomeRichiedente,
      EMAIL_RICHIEDENTE: leadData.emailRichiedente,
      TELEFONO_RICHIEDENTE: leadData.telefonoRichiedente || 'Non fornito',
      CF_RICHIEDENTE: leadData.cfRichiedente || 'Non fornito',
      INDIRIZZO_RICHIEDENTE: leadData.indirizzoRichiedente || 'Non fornito',
      NOME_ASSISTITO: leadData.nomeAssistito || leadData.nomeRichiedente,
      COGNOME_ASSISTITO: leadData.cognomeAssistito || leadData.cognomeRichiedente,
      ETA_ASSISTITO: leadData.etaAssistito?.toString() || 'Non fornita',
      DATA_NASCITA_ASSISTITO: leadData.dataNascitaAssistito || 'Non fornita',
      LUOGO_NASCITA_ASSISTITO: leadData.luogoNascitaAssistito || 'Non fornito',
      CF_ASSISTITO: leadData.cfAssistito || 'Non fornito',
      INDIRIZZO_ASSISTITO: leadData.indirizzoAssistito || 'Non fornito',
      CONDIZIONI_SALUTE: leadData.condizioniSalute || leadData.note || 'Non specificate',
      NOTE_AGGIUNTIVE: leadData.note || 'Nessuna',
      PIANO_SERVIZIO: formatServiceName(leadData.servizio || 'PRO', leadData.pacchetto),
      SERVIZIO: leadData.servizio || 'eCura PRO',
      PIANO: leadData.pacchetto || 'BASE',
      PREZZO_PIANO: leadData.pacchetto === 'BASE' ? '€585,60' : '€1.024,80',
      DATA_RICHIESTA: now.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' }),
      ORA_RICHIESTA: now.toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome' }),
      TIMESTAMP_COMPLETO: now.toLocaleString('it-IT', { timeZone: 'Europe/Rome' }),
      VERSIONE_SISTEMA: 'TeleMedCare V12.0',
      
      // Placeholder per richieste del lead (semplici + formattati)
      VUOLE_CONTRATTO: vuoleContratto ? 'SÌ' : 'NO',
      VUOLE_BROCHURE: vuoleBrochure ? 'SÌ' : 'NO',
      VUOLE_MANUALE: vuoleManuale ? 'SÌ' : 'NO',
      VUOLE_CONTRATTO_TEXT: vuoleContratto ? '✅ SI' : '❌ NO',
      VUOLE_CONTRATTO_COLOR: vuoleContratto ? '#198754' : '#dc3545',
      VUOLE_BROCHURE_TEXT: vuoleBrochure ? '✅ SI' : '❌ NO',
      VUOLE_BROCHURE_COLOR: vuoleBrochure ? '#198754' : '#dc3545',
      VUOLE_MANUALE_TEXT: vuoleManuale ? '✅ SI' : '❌ NO',
      VUOLE_MANUALE_COLOR: vuoleManuale ? '#198754' : '#dc3545',
      URGENZA: leadData.urgenzaRisposta || 'NORMALE',
      AZIONE_SUGGERITA: azioneSuggerita
    }

    // Renderizza template con i dati
    const emailHtml = renderTemplate(template, templateData)

    // Invia email a info@telemedcare.it
    const sendResult = await emailService.sendEmail({
      to: env.EMAIL_TO_INFO || 'info@telemedcare.it',
      from: 'info@telemedcare.it',
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
    const servizioNome = leadData.servizio || 'eCura'
    const pianoNome = (leadData.pacchetto === 'BASE' || leadData.pacchetto === 'base') ? 'BASE' : 'AVANZATO'
    const dispositivo = (servizioNome === 'PREMIUM' || servizioNome === 'premium') ? 'SiDLY Vital Care' : 'SiDLY Care PRO'
    
    const templateData = {
      NOME_CLIENTE: leadData.nomeRichiedente,
      COGNOME_CLIENTE: leadData.cognomeRichiedente,
      NOME_ASSISTITO: leadData.nomeAssistito || leadData.nomeRichiedente,
      COGNOME_ASSISTITO: leadData.cognomeAssistito || leadData.cognomeRichiedente,
      LEAD_ID: leadData.id,
      TIPO_SERVIZIO: leadData.pacchetto === 'BASE' ? 'Base' : 'Avanzato',
      SERVIZIO: servizioNome,
      SERVIZI: servizioNome,
      PIANO: pianoNome,
      DISPOSITIVO: dispositivo,
      DATA_RICHIESTA: new Date().toLocaleDateString('it-IT'),
      PACCHETTO: leadData.pacchetto || 'BASE',
      PREZZO_PIANO: leadData.pacchetto === 'BASE' ? '€585,60/anno' : '€1.024,80/anno',
      PREZZO_SERVIZIO_PIANO: leadData.pacchetto === 'BASE' ? '€585,60/anno' : '€1.024,80/anno'
    }

    // Renderizza template
    const emailHtml = renderTemplate(template, templateData)

    // Prepara allegati PDF
    const attachments: Array<{ filename: string; content: string; contentType: string }> = []
    
    try {
      // In Cloudflare Workers, usiamo fetch per leggere file statici da public/
      // In locale usa localhost, in produzione usa il dominio pubblico
      const baseUrl = env.PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8788')
      
      if (leadData.vuoleBrochure) {
        console.log(`📄 [WORKFLOW] Caricamento brochure per servizio: ${leadData.servizio || 'DEFAULT'}`)
        
        // Normalizza il nome del servizio: "eCura PRO" → "PRO"
        const servizioRaw = leadData.servizio || 'DEFAULT'
        const servizio = servizioRaw.replace(/^eCura\s+/i, '').trim()
        
        console.log(`📄 [WORKFLOW] Servizio normalizzato: "${servizioRaw}" → "${servizio}"`)
        
        try {
          let pdfData = null
          
          if (servizio !== 'DEFAULT' && (servizio === 'FAMILY' || servizio === 'PRO' || servizio === 'PREMIUM')) {
            // Carica brochure specifica dal brochure-manager
            console.log(`📥 [WORKFLOW] Caricamento brochure specifica per ${servizio}`)
            pdfData = await loadBrochurePDF(servizio, baseUrl)
            
            if (pdfData) {
              console.log(`✅ [WORKFLOW] Brochure ${servizio} caricata: ${(pdfData.size / 1024).toFixed(2)} KB`)
            } else {
              console.warn(`⚠️ [WORKFLOW] Brochure ${servizio} non trovata, fallback su brochure generica`)
            }
          }
          
          // Fallback su brochure generica se necessario
          if (!pdfData) {
            console.log(`📄 [WORKFLOW] Caricamento brochure generica TeleMedCare`)
            const brochureUrl = `${baseUrl}/documents/Brochure_TeleMedCare.pdf`
            const response = await fetch(brochureUrl)
            
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer()
              const uint8Array = new Uint8Array(arrayBuffer)
              let binaryString = ''
              const chunkSize = 8192
              for (let i = 0; i < uint8Array.length; i += chunkSize) {
                const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length))
                binaryString += String.fromCharCode.apply(null, Array.from(chunk))
              }
              const base64Content = btoa(binaryString)
              
              pdfData = {
                filename: 'Brochure_TeleMedCare.pdf',
                content: base64Content,
                size: arrayBuffer.byteLength
              }
              console.log(`✅ [WORKFLOW] Brochure generica caricata: ${(pdfData.size / 1024).toFixed(2)} KB`)
            }
          }
          
          // Aggiungi PDF agli allegati se caricato
          if (pdfData) {
            attachments.push({
              filename: pdfData.filename,
              content: pdfData.content,
              contentType: 'application/pdf'
            })
            console.log(`✅ [WORKFLOW] Brochure aggiunta agli allegati`)
          }
          
        } catch (err) {
          console.error(`❌ [WORKFLOW] Errore caricamento brochure:`, err)
          console.error(`❌ [WORKFLOW] Stack trace:`, err.stack)
        }
      }
      
      if (leadData.vuoleManuale) {
        console.log(`📄 [WORKFLOW] Caricamento manuale da public/documents/`)
        try {
          const manualeUrl = `${baseUrl}/documents/Manuale_SiDLY.pdf`
          const response = await fetch(manualeUrl)
          
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer()
            console.log(`📥 [WORKFLOW] Manuale ArrayBuffer ricevuto: ${arrayBuffer.byteLength} bytes`)
            
            // Convert ArrayBuffer to base64 in chunks to avoid stack overflow
            const uint8Array = new Uint8Array(arrayBuffer)
            let binaryString = ''
            const chunkSize = 8192
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length))
              binaryString += String.fromCharCode.apply(null, Array.from(chunk))
            }
            const base64Content = btoa(binaryString)
            
            attachments.push({
              filename: 'Manuale_SiDLY.pdf',
              content: base64Content,
              contentType: 'application/pdf'
            })
            console.log(`✅ [WORKFLOW] Manuale caricato: ${(arrayBuffer.byteLength / 1024).toFixed(2)} KB`)
          } else {
            console.warn(`⚠️ [WORKFLOW] Manuale non trovato: ${response.status}`)
          }
        } catch (err) {
          console.error(`❌ [WORKFLOW] Errore caricamento manuale:`, err)
        }
      }
      
    } catch (error) {
      console.warn(`⚠️ [WORKFLOW] Errore preparazione allegati:`, error)
      // Continua senza allegati
    }
    
    console.log(`📄 [WORKFLOW] Documenti richiesti: Brochure=${leadData.vuoleBrochure}, Manuale=${leadData.vuoleManuale}`)
    console.log(`📄 [WORKFLOW] URLs documenti:`, documentUrls)
    console.log(`📄 [WORKFLOW] Allegati preparati: ${attachments.length}`)

    // Invia email da info@telemedcare.it (richiesta documentazione informativa)
    const sendResult = await emailService.sendEmail({
      to: leadData.emailRichiedente,
      from: 'info@telemedcare.it',
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
    const servizioNome = contractData.servizio || leadData.servizio || 'eCura PRO' // eCura PRO, eCura FAMILY, eCura PREMIUM
    const pianoNome = contractData.tipoServizio || 'BASE' // BASE o AVANZATO
    const dispositivo = (servizioNome.includes('PREMIUM') || servizioNome.includes('premium')) ? 'SiDLY Vital Care' : 'SiDLY Care PRO'
    
    const templateData = {
      NOME_CLIENTE: leadData.nomeRichiedente,
      COGNOME_CLIENTE: leadData.cognomeRichiedente,
      PIANO_SERVIZIO: formatServiceName(servizioNome.replace('eCura ', ''), pianoNome),
      SERVIZIO: servizioNome,
      PIANO: pianoNome,
      DISPOSITIVO: dispositivo,
      PREZZO_PIANO: `€${contractData.prezzoIvaInclusa.toFixed(2)}`,
      PREZZO_SERVIZIO_PIANO: `€${contractData.prezzoIvaInclusa.toFixed(2)}/anno`,
      CODICE_CLIENTE: leadData.id,
      CODICE_CONTRATTO: contractData.contractCode,
      LINK_FIRMA: `${env.PUBLIC_URL || 'https://telemedcare.it'}/firma-contratto?contractId=${contractData.contractId}`,
      DATA_INVIO: new Date().toLocaleDateString('it-IT')
    }

    // Renderizza template
    const emailHtml = renderTemplate(template, templateData)

    // Prepara allegati: Brochure + Manuale (Contratto PDF non disponibile senza Puppeteer)
    const attachments = []
    
    // NOTA: Il PDF del contratto non è disponibile in questa versione
    // Il cliente riceverà il link per firmare il contratto online nel template email
    
    // Contratto PDF (solo se disponibile)
    if (contractData.contractPdfUrl && contractData.contractPdfUrl !== '') {
      attachments.push({
        filename: `Contratto_TeleMedCare_${contractData.contractCode}.pdf`,
        path: contractData.contractPdfUrl
      })
    }
    
    // Brochure (se richiesta) - CARICA E CONVERTI IN BASE64
    if (leadData.vuoleBrochure && documentUrls.brochure) {
      try {
        console.log(`📎 [CONTRATTO] Caricamento brochure: ${documentUrls.brochure}`)
        
        // Determina il baseUrl
        const baseUrl = env?.PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8787')
        
        // Normalizza il nome del servizio: "eCura PRO" → "PRO"
        const servizioRaw = leadData.servizio || 'PRO'
        const servizio = servizioRaw.replace(/^eCura\s+/i, '').trim()
        
        console.log(`📎 [CONTRATTO] Servizio normalizzato: "${servizioRaw}" → "${servizio}"`)
        
        // Carica la brochure con loadBrochurePDF
        const brochurePDF = await loadBrochurePDF(servizio, baseUrl)
        
        if (brochurePDF) {
          attachments.push({
            filename: brochurePDF.filename,
            content: brochurePDF.content,
            contentType: 'application/pdf'
          })
          console.log(`✅ [CONTRATTO] Brochure allegata: ${brochurePDF.filename} (${brochurePDF.size} bytes)`)
        } else {
          console.warn(`⚠️ [CONTRATTO] Brochure non trovata per servizio ${servizio}`)
        }
      } catch (error) {
        console.error(`❌ [CONTRATTO] Errore caricamento brochure:`, error)
      }
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
      from: 'info@telemedcare.it',
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
      PIANO_SERVIZIO: formatServiceName(proformaData.servizio || 'PRO', proformaData.tipoServizio),
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
      from: 'info@telemedcare.it',
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
      PIANO_SERVIZIO: formatServiceName(clientData.servizio || 'PRO', clientData.pacchetto),
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
      from: 'info@telemedcare.it',
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
      from: 'info@telemedcare.it',
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
      PIANO_SERVIZIO: formatServiceName(clientData.servizio || 'PRO', clientData.pacchetto),
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
      from: 'info@telemedcare.it',
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
