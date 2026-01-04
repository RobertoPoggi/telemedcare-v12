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

/**
 * Genera HTML completo del contratto con tutti i dati del cliente
 */
async function generateContractHtml(leadData: any, contractData: any): Promise<string> {
  const servizioNome = contractData.servizio || 'eCura PRO'
  const pianoNome = contractData.tipoServizio || 'BASE'
  const dispositivo = servizioNome.includes('PREMIUM') ? 'SiDLY Vital Care' : 'SiDLY Care PRO'
  
  const importoPrimoAnno = `€${contractData.prezzoBase.toFixed(2)}`
  const importoAnniSuccessivi = `€${(contractData.prezzoBase * 0.5).toFixed(2)}`
  
  const dataContratto = new Date().toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  })
  
  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Contratto ${servizioNome} - ${contractData.contractCode}</title>
    <style>
        @page { size: A4; margin: 2cm; }
        body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { text-align: center; color: #667eea; font-size: 20pt; margin-bottom: 30px; }
        h2 { color: #667eea; font-size: 14pt; margin-top: 25px; margin-bottom: 15px; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px; }
        p { margin: 10px 0; text-align: justify; }
        ul { margin: 10px 0; padding-left: 30px; }
        .highlight { background-color: #fff9e6; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0; }
        .table-info { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table-info td { padding: 8px; border: 1px solid #ddd; }
        .table-info td:first-child { font-weight: bold; background: #f8f9fa; width: 40%; }
        .firma-section { margin-top: 50px; display: flex; justify-content: space-between; }
        .firma-box { width: 45%; }
        .firma-box p { margin: 5px 0; }
        .firma-line { border-top: 1px solid #333; margin-top: 30px; padding-top: 5px; text-align: center; font-size: 9pt; }
    </style>
</head>
<body>
    <h1>CONTRATTO DI SERVIZIO<br>${servizioNome} - Piano ${pianoNome}</h1>
    
    <h2>📋 Dati Cliente</h2>
    <table class="table-info">
        <tr>
            <td>Nome e Cognome</td>
            <td>${leadData.nomeAssistito || leadData.nomeRichiedente} ${leadData.cognomeAssistito || leadData.cognomeRichiedente}</td>
        </tr>
        <tr>
            <td>Email</td>
            <td>${leadData.emailRichiedente}</td>
        </tr>
        <tr>
            <td>Telefono</td>
            <td>${leadData.telefonoRichiedente || 'N/A'}</td>
        </tr>
        <tr>
            <td>Codice Contratto</td>
            <td><strong>${contractData.contractCode}</strong></td>
        </tr>
        <tr>
            <td>Data Contratto</td>
            <td>${dataContratto}</td>
        </tr>
    </table>
    
    <h2>📦 Servizio Acquistato</h2>
    <div class="highlight">
        <p><strong>Servizio:</strong> ${servizioNome}</p>
        <p><strong>Piano:</strong> ${pianoNome}</p>
        <p><strong>Dispositivo Incluso:</strong> ${dispositivo}</p>
        <p><strong>Prezzo Primo Anno:</strong> ${importoPrimoAnno} + IVA 22%</p>
        <p><strong>Prezzo Anni Successivi:</strong> ${importoAnniSuccessivi} + IVA 22%</p>
    </div>
    
    <h2>📄 Condizioni del Servizio</h2>
    
    <p><strong>1. OGGETTO DEL CONTRATTO</strong></p>
    <p>Il presente contratto ha per oggetto la fornitura del servizio di TeleAssistenza Domiciliare "${servizioNome}" con piano "${pianoNome}", che include:</p>
    <ul>
        <li>Dispositivo ${dispositivo} in comodato d'uso</li>
        <li>Configurazione del Dispositivo e del Processo di Comunicazione</li>
        <li>Piattaforma Web e APP di TeleAssistenza per 12 mesi</li>
        <li>SIM per trasmissione dati e comunicazione vocale per 12 mesi</li>
        <li>Assistenza tecnica e supporto</li>
    </ul>
    
    <p><strong>2. DURATA</strong></p>
    <p>Il contratto ha durata annuale con rinnovo tacito. Il Cliente può recedere con preavviso di 60 giorni prima della scadenza annuale.</p>
    
    <p><strong>3. TARIFFE</strong></p>
    <p>La tariffa annuale del primo anno per il Servizio ${servizioNome} è <strong>${importoPrimoAnno} + IVA 22%</strong>, e include:</p>
    <ul>
        <li>Dispositivo ${dispositivo}</li>
        <li>Configurazione del Dispositivo</li>
        <li>Piattaforma Web e APP di TeleAssistenza per 12 mesi</li>
        <li>SIM dati e voce per 12 mesi</li>
        <li>Piano ${pianoNome}</li>
    </ul>
    
    <p>Per i successivi anni, la tariffa annuale sarà <strong>${importoAnniSuccessivi} + IVA 22%</strong>.</p>
    
    <p><strong>4. PAGAMENTO</strong></p>
    <p>Il pagamento avviene tramite <strong>fattura anticipata di 12 mesi</strong> all'attivazione del servizio.</p>
    <p><strong>Modalità:</strong> Bonifico bancario intestato a Medica GB S.r.l.</p>
    <p><strong>IBAN:</strong> IT97L0503401727000000003519</p>
    <p><strong>Causale:</strong> Servizio ${servizioNome} ${pianoNome} con Dispositivo ${dispositivo}</p>
    
    <p><strong>5. PRIVACY E TRATTAMENTO DATI</strong></p>
    <p>Il Cliente acconsente al trattamento dei propri dati personali secondo il GDPR (Regolamento UE 2016/679). I dati saranno utilizzati esclusivamente per l'erogazione del servizio.</p>
    
    <p><strong>6. RECESSO</strong></p>
    <p>Il Cliente può recedere dal contratto con preavviso scritto di 60 giorni prima della scadenza annuale, inviando comunicazione a info@telemedcare.it.</p>
    
    <p><strong>7. FORO COMPETENTE</strong></p>
    <p>Per qualsiasi controversia è competente il Foro di Milano.</p>
    
    <div class="firma-section">
        <div class="firma-box">
            <p><strong>Medica GB S.r.l.</strong></p>
            <p>Corso Giuseppe Garibaldi, 34</p>
            <p>20121 Milano</p>
            <p>P.IVA: 12435130963</p>
            <div class="firma-line">Firma Legale Rappresentante</div>
        </div>
        <div class="firma-box">
            <p><strong>Il Cliente</strong></p>
            <p>${leadData.nomeAssistito || leadData.nomeRichiedente} ${leadData.cognomeAssistito || leadData.cognomeRichiedente}</p>
            <p>${leadData.emailRichiedente}</p>
            <p>&nbsp;</p>
            <div class="firma-line">Firma Digitale</div>
        </div>
    </div>
    
    <p style="margin-top: 50px; text-align: center; font-size: 10pt; color: #666;">
        <strong>Medica GB S.r.l.</strong> - Startup Innovativa a Vocazione Sociale<br>
        Milano: Corso Garibaldi 34, 20121 | Genova: Via delle Eriche 53, 16148<br>
        P.IVA: 12435130963 | REA: MI-2661409<br>
        www.medicagb.it | www.ecura.it | www.telemedcare.it | info@medicagb.it
    </p>
</body>
</html>
  `.trim()
}


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

    // ============================================
    // STEP 1: Crea record contratto nel DB
    // ============================================
    console.log(`📊 [CONTRATTO] DB disponibile: ${!!db}`)
    console.log(`📊 [CONTRATTO] Contract ID: ${contractData.contractId}`)
    console.log(`📊 [CONTRATTO] Lead ID: ${leadData.id}`)
    
    if (db) {
      try {
        console.log(`📋 [CONTRATTO] Generazione HTML contratto...`)
        // Genera HTML contratto completo
        const contractHtml = await generateContractHtml(leadData, contractData)
        console.log(`📋 [CONTRATTO] HTML generato (${contractHtml.length} chars)`)
        
        console.log(`💾 [CONTRATTO] Salvataggio nel DB...`)
        // Salva contratto nel DB (usa schema esistente con camelCase)
        await db.prepare(`
          INSERT INTO contracts (
            id, leadId, codice_contratto, tipo_contratto, 
            contenuto_html, status, created_at, 
            servizio, piano, 
            prezzo_totale, email_template_used
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          contractData.contractId,
          leadData.id,
          contractData.contractCode,
          contractData.tipoServizio,
          contractHtml,
          'PENDING',
          new Date().toISOString(),
          contractData.servizio,
          contractData.tipoServizio,
          contractData.prezzoIvaInclusa,
          'email_invio_contratto'
        ).run()
        
        console.log(`✅ [CONTRATTO] Salvato nel DB: ${contractData.contractId}`)
      } catch (dbError) {
        console.error('❌ [CONTRATTO] Errore salvataggio DB:', dbError)
        console.error('❌ [CONTRATTO] Stack:', (dbError as Error)?.stack)
        // Continua comunque con l'invio email
      }
    } else {
      console.warn(`⚠️  [CONTRATTO] DB non disponibile - contratto NON salvato!`)
    }
    
    // ============================================
    // STEP 2: Prepara e invia email con link firma
    // ============================================
    const emailService = new EmailService(env)
    
    // Carica template email_invio_contratto (UNICO per BASE e AVANZATO)
    const template = await loadEmailTemplate('email_invio_contratto', db)
    
    // Prepara i dati per il template
    const servizioNome = contractData.servizio || leadData.servizio || 'eCura PRO' // eCura PRO, eCura FAMILY, eCura PREMIUM
    const pianoNome = contractData.tipoServizio || 'BASE' // BASE o AVANZATO
    const dispositivo = (servizioNome.includes('PREMIUM') || servizioNome.includes('premium')) ? 'SiDLY Vital Care' : 'SiDLY Care PRO'
    
    // Determina URL brochure per il link diretto
    const baseUrl = env?.PUBLIC_URL || 'https://telemedcare-v12.pages.dev'
    const servizioNormalized = servizioNome.replace(/^eCura\s+/i, '').trim().toUpperCase()
    let brochureFilename = 'Medica-GB-SiDLY_Care_PRO_ITA_compresso.pdf'
    if (servizioNormalized === 'PREMIUM') {
      brochureFilename = 'Medica-GB-SiDLY_Vital_Care_ITA-compresso.pdf'
    }
    const linkBrochure = `${baseUrl}/brochures/${brochureFilename}`
    
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
      LINK_BROCHURE: linkBrochure,
      DATA_INVIO: new Date().toLocaleDateString('it-IT')
    }

    // Renderizza template
    const emailHtml = renderTemplate(template, templateData)

    // Prepara allegati: Brochure PDF usando ASSETS binding
    const attachments = []
    
    // NOTA: Il PDF del contratto non è disponibile senza Puppeteer
    // Il cliente riceverà il link per firmare il contratto online nel template email
    
    // Brochure (se richiesta) - CARICA usando ASSETS binding
    if (leadData.vuoleBrochure && env?.ASSETS) {
      try {
        console.log(`📎 [CONTRATTO] Caricamento brochure via ASSETS: ${linkBrochure}`)
        
        // Usa ASSETS binding per leggere il PDF
        const brochureUrl = new URL(linkBrochure)
        const assetResponse = await env.ASSETS.fetch(brochureUrl)
        
        if (assetResponse.ok) {
          // Leggi il PDF come ArrayBuffer
          const arrayBuffer = await assetResponse.arrayBuffer()
          const sizeKB = (arrayBuffer.byteLength / 1024).toFixed(2)
          console.log(`📥 [CONTRATTO] PDF caricato: ${sizeKB} KB`)
          
          // Converti in base64 (chunked per evitare stack overflow)
          const uint8Array = new Uint8Array(arrayBuffer)
          const chunkSize = 32768 // 32KB chunks
          let binary = ''
          
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.slice(i, i + chunkSize)
            binary += String.fromCharCode.apply(null, Array.from(chunk))
          }
          
          const base64 = btoa(binary)
          
          // Aggiungi agli allegati
          const filename = linkBrochure.split('/').pop() || 'Brochure_TeleMedCare.pdf'
          attachments.push({
            filename: filename,
            content: base64,
            contentType: 'application/pdf'
          })
          
          console.log(`✅ [CONTRATTO] Brochure allegata: ${filename} (${sizeKB} KB, ${base64.length} chars base64)`)
        } else {
          console.warn(`⚠️ [CONTRATTO] ASSETS non trova brochure: ${linkBrochure} (status: ${assetResponse.status})`)
        }
      } catch (error) {
        console.error(`❌ [CONTRATTO] Errore caricamento brochure:`, error)
        // Non bloccare l'invio email se fallisce l'allegato - il link è comunque nel template
      }
    } else if (leadData.vuoleBrochure && !env?.ASSETS) {
      console.warn(`⚠️ [CONTRATTO] ASSETS binding non disponibile, brochure disponibile solo via link`)
    }
    
    // Link brochure sempre incluso nel template come fallback
    console.log(`📎 [CONTRATTO] Link brochure nel template: ${linkBrochure}`)
    
    // Manuale (se richiesto) - Anche questo come link per ora
    if (leadData.vuoleManuale && documentUrls.manuale) {
      console.log(`📎 [CONTRATTO] Link manuale disponibile: ${documentUrls.manuale}`)
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
