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
import { getMissingFields, isLeadComplete } from './lead-completion'
import { getSetting } from './settings-api'

/**
 * Genera HTML completo del contratto con tutti i dati del cliente
 */
async function generateContractHtml(leadData: any, contractData: any): Promise<string> {
  const servizioNome = contractData.servizio || 'eCura PRO'
  const pianoNome = contractData.tipoServizio || 'BASE'
  const dispositivo = servizioNome.includes('PREMIUM') ? 'SiDLY Vital Care' : 'SiDLY Care PRO'
  
  // Prezzi corretti secondo www.eCura.it
  const importoPrimoAnno = contractData.prezzoBase // 480 BASE o 840 AVANZATO
  const importoAnniSuccessivi = pianoNome === 'AVANZATO' ? 600 : 200 // Rinnovo: 600€ AVANZATO, 200€ BASE
  
  const dataContratto = new Date().toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  })
  
  const dataInizioServizio = new Date().toLocaleDateString('it-IT')
  const dataScadenza = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT')
  
  // Determina intestatario contratto (richiedente o assistito)
  const useRichiedente = !leadData.intestatarioContratto || leadData.intestatarioContratto === 'richiedente'
  const nomeIntestatario = useRichiedente ? leadData.nomeRichiedente : (leadData.nomeAssistito || leadData.nomeRichiedente)
  const cognomeIntestatario = useRichiedente ? leadData.cognomeRichiedente : (leadData.cognomeAssistito || leadData.cognomeRichiedente)
  const luogoNascitaIntestatario = leadData.luogoNascitaAssistito || 'N/A'
  const dataNascitaIntestatario = leadData.dataNascitaAssistito || 'N/A'
  const indirizzoIntestatario = leadData.indirizzoAssistito || 'N/A'
  const capIntestatario = leadData.capAssistito || 'N/A'
  const cittaIntestatario = leadData.cittaAssistito || 'N/A'
  const provinciaIntestatario = leadData.provinciaAssistito || 'N/A'
  const cfIntestatario = leadData.cfAssistito || 'N/A'
  
  // Template HTML completo ufficiale da Template_Contratto_eCura.html
  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contratto eCura - ${contractData.contractCode}</title>
    <style>
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
            background-color: #fff;
        }
        
        h1 {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 30px;
            text-transform: uppercase;
        }
        
        h2 {
            font-size: 16px;
            font-weight: bold;
            margin-top: 25px;
            margin-bottom: 15px;
        }
        
        p {
            margin-bottom: 12px;
            text-align: justify;
        }
        
        .party {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #0066cc;
        }
        
        .breviter {
            font-style: italic;
            margin-top: 10px;
        }
        
        .premises {
            margin: 20px 0;
        }
        
        .premises ul {
            list-style-type: none;
            padding-left: 0;
        }
        
        .premises li {
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
        }
        
        .premises li:before {
            content: "-";
            position: absolute;
            left: 0;
        }
        
        .feature-list {
            margin: 15px 0;
            padding-left: 20px;
        }
        
        .highlight {
            background-color: transparent;
            padding: 0;
            font-weight: bold;
        }
        
        .payment-details {
            background-color: #f5f5f5;
            padding: 15px;
            margin: 15px 0;
            border: 1px solid #ddd;
        }
        
        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        
        .signature-block {
            width: 45%;
            border-top: 1px solid #333;
            padding-top: 10px;
            text-align: center;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #0066cc;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        
        .footer p {
            margin: 5px 0;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            .signature-section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <h1>SCRITTURA PRIVATA</h1>
    
    <p>Con la presente scrittura privata da valere a tutti gli effetti e conseguenze di legge tra:</p>
    
    <div class="party">
        <p><strong>Medica GB S.r.l.</strong>, con sede in Corso Giuseppe Garibaldi, 34 – 20121 Milano e con Partita IVA e registro imprese 12435130963, in persona dell'Amministratore Stefania Rocca</p>
        <p class="breviter">(breviter Medica GB)</p>
    </div>
    
    <p style="text-align: center; font-weight: bold;">e</p>
    
    <div class="party">
        <p>Sig./Sig.ra <span class="highlight">${nomeIntestatario}</span> <span class="highlight">${cognomeIntestatario}</span> nato/a a <span class="highlight">${luogoNascitaIntestatario}</span> il <span class="highlight">${dataNascitaIntestatario}</span>, residente e domiciliato/a in <span class="highlight">${indirizzoIntestatario}</span> - <span class="highlight">${capIntestatario}</span> <span class="highlight">${cittaIntestatario}</span> (<span class="highlight">${provinciaIntestatario}</span>) e con codice fiscale <span class="highlight">${cfIntestatario}</span>.</p>
        
        <p><strong>Riferimenti:</strong><br>
        telefono <span class="highlight">${leadData.telefonoRichiedente || 'N/A'}</span> – e-mail <span class="highlight">${leadData.emailRichiedente}</span></p>
        
        <p class="breviter">(breviter Il Cliente)</p>
    </div>
    
    <div class="premises">
        <p><strong>premesso che</strong></p>
        <ul>
            <li>Medica GB eroga servizi di assistenza domiciliare con tecnologie innovative, servizi di diagnostica a domicilio, esami strumentali, telemedicina, teleassistenza, telemonitoraggio e riabilitazione a domicilio.</li>
            <li>Medica GB si avvale della consulenza di Medici, Terapisti, Infermieri e Operatori Socio Sanitari per erogare i servizi sopra descritti;</li>
        </ul>
        <p><strong>Tanto premesso,</strong></p>
        <p style="text-align: center; font-weight: bold;">si conviene e stabilisce quanto segue</p>
    </div>
    
    <h2>Premessa</h2>
    <p>La premessa che precede costituisce parte integrante del presente Contratto.</p>
    
    <h2>Oggetto del Contratto</h2>
    <p>L'oggetto del presente Contratto è l'erogazione del Servizio <span class="highlight">${servizioNome}</span> mediante l'utilizzo del Dispositivo <span class="highlight">${dispositivo}</span> e con il supporto del Piano <span class="highlight">${pianoNome}</span>.</p>
    
    <p>Le funzioni del dispositivo <span class="highlight">${dispositivo}</span> sono le seguenti:</p>
    
    <div class="feature-list">
        <p><strong>Comunicazione vocale bidirezionale:</strong> è possibile configurare sulla Piattaforma i contatti dei familiari oltre a quelli della Centrale Operativa ove prevista; dopo l'invio dell'allarme i familiari e/o la Centrale Operativa (piano avanzato) ricevono una chiamata dal dispositivo e possono parlare con l'assistito; in qualsiasi momento i familiari e/o la Centrale Operativa (piano avanzato) possono contattare l'assistito tramite il dispositivo.</p>
        
        <p><strong>Rilevatore automatico di caduta:</strong> effettua una chiamata vocale di allarme, in caso di caduta, ai Care Givers e Famigliari (Piano Base) e alla Centrale Operativa (Piano Avanzato) e invia una notifica tramite sms ai familiari e, nel piano avanzato anche alla Centrale Operativa. Nell'sms arriverà sia il link da cliccare per individuare la posizione dell'assistito (geolocalizzazione) che i valori dei parametri fisiologici che è stato possibile rilevare.</p>
        
        <p><strong>Posizione GPS e GPS-assistito:</strong> consente di localizzare l'assistito quando viene inviato l'allarme. È inoltre possibile impostare una cosiddetta area sicura per l'assistito (geo-fencing).</p>
        
        <p><strong>Misurazioni della frequenza cardiaca e della saturazione di ossigeno:</strong> è possibile impostare una notifica che arrivi ai familiari e/o Centrale Operativa (ove prevista) tramite APP quando i valori rilevati vanno oltre le soglie programmate (comunicate dal proprio Medico di Base).</p>
        
        <p><strong>Pulsante SOS:</strong> premendo il pulsante SOS per circa 3 secondi è possibile effettuare una chiamata vocale ai care giver / famigliari (piano base) o alla Centrale Operativa (piano avanzato) e inviare una notifica di emergenza (geolocalizzata) ai familiari o alla Centrale Operativa stessa.</p>
        
        <p><strong>Assistenza vocale:</strong> informa l'assistito in relazione ai seguenti eventi: pressione pulsante SOS, attivazione dispositivo, messa in carica del dispositivo, segnalazione di batteria scarica, ecc.</p>
        
        <p><strong>Promemoria per l'assunzione dei farmaci:</strong> un messaggio ricorda l'orario in cui assumere i farmaci (aderenza terapeutica).</p>
    </div>
    
    <h2>Durata del Servizio</h2>
    <p>Il Servizio di TeleAssistenza <span class="highlight">${servizioNome}</span> ha una durata di 12 mesi a partire da <span class="highlight">${dataInizioServizio}</span> fino al <span class="highlight">${dataScadenza}</span>.</p>
    <p>Il Contratto sarà prorogabile su richiesta scritta del Cliente e su accettazione di Medica GB.</p>
    
    <h2>Tariffa del Servizio</h2>
    <p>La tariffa annuale per il primo anno di attivazione del Servizio <span class="highlight">${servizioNome}</span> è pari a Euro <span class="highlight">${importoPrimoAnno},00</span> + IVA 22% e include:</p>
    
    <ul>
        <li>Dispositivo <span class="highlight">${dispositivo}</span></li>
        <li>Configurazione del Dispositivo e del Processo di Comunicazione con la Centrale Operativa (ove previsto) e/o uno o più familiari e Piattaforma Web e APP di TeleAssistenza per la durata di 12 mesi</li>
        <li>SIM per trasmissione dati e comunicazione vocale per la durata di 12 mesi</li>
        <li>Piano <span class="highlight">${pianoNome}</span></li>
    </ul>
    
    <p>Per i successivi anni (rinnovabili di anno in anno) la tariffa annuale per il Servizio <span class="highlight">${servizioNome}</span> sarà pari a Euro <span class="highlight">${importoAnniSuccessivi},00</span> + IVA 22% con inclusi:</p>
    
    <ul>
        <li>Piattaforma Web e APP di TeleAssistenza per la durata di 12 mesi</li>
        <li>SIM per trasmissione dati e comunicazione vocale per la durata di 12 mesi</li>
        <li>Piano <span class="highlight">${pianoNome}</span></li>
    </ul>
    
    <h2>Metodo di pagamento</h2>
    <p>Medica GB emetterà fattura anticipata di 12 mesi all'attivazione del Servizio e il Cliente procederà al pagamento a ricevimento della fattura stessa tramite bonifico bancario</p>
    
    <div class="payment-details">
        <p><strong>Intestato a:</strong> Medica GB S.r.l.</p>
        <p><strong>Causale:</strong> Servizio ${servizioNome} ${pianoNome} con Dispositivo ${dispositivo}</p>
        <p><strong>Banca Popolare di Milano - Iban:</strong> IT97L0503401727000000003519</p>
    </div>
    
    <h2>Riservatezza ed esclusiva</h2>
    <p>Il Cliente e Medica GB si impegnano reciprocamente a non divulgare o, comunque, non utilizzare, se non per motivi attinenti all'esercizio del presente contratto, tutte le informazioni di cui venissero a conoscenza nello svolgimento del Servizio.</p>
    <p>Il Cliente si impegna a contattare Medica GB per tutte le modifiche e proroghe del presente contratto.</p>
    
    <h2>Foro competente</h2>
    <p>Ogni eventuale contestazione o controversia che dovesse insorgere tra le parti in relazione all'interpretazione, alla validità ed esecuzione del presente contratto, sarà definita alla cognizione esclusiva del Foro di Milano.</p>
    
    <div class="signature-section">
        <div>
            <p>Milano, lì <span class="highlight">${dataContratto}</span></p>
        </div>
    </div>
    
    <div class="signature-section">
        <div class="signature-block">
            <p><strong>Medica GB S.r.l.</strong></p>
        </div>
        <div class="signature-block">
            <p><strong>Il Cliente</strong></p>
        </div>
    </div>
    
    <div class="footer">
        <p><strong>Medica GB S.r.l.</strong></p>
        <p>Corso Giuseppe Garibaldi, 34 – 20121 Milano</p>
        <p>PEC: [email protected]</p>
        <p>E-mail: [email protected]</p>
        <p>Codice Fiscale e P.IVA: 12435130963 - REA: MI-2661409</p>
        <p>www.medicagb.it www.ecura.it</p>
    </div>
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
  cittaRichiedente?: string
  nomeAssistito?: string
  cognomeAssistito?: string
  etaAssistito?: number
  pacchetto: string // 'BASE' o 'AVANZATO'
  servizio?: string // 'FAMILY' | 'PRO' | 'PREMIUM' (nuovo campo eCura)
  vuoleBrochure: boolean
  vuoleManuale: boolean
  vuoleContratto: boolean
  fonte?: string
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
    const template = await loadEmailTemplate('email_notifica_info', db, env)
    
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
    // 🔴 CONTROLLO SWITCH: Verifica se email automatiche ai lead sono abilitate
    const emailLeadsEnabled = await getSetting(db, 'lead_email_notifications_enabled')
    if (!emailLeadsEnabled) {
      console.log(`⏭️ [WORKFLOW] Email automatiche ai lead disabilitate - skip invio documenti informativi`)
      result.errors.push('Email automatiche ai lead disabilitate nelle impostazioni sistema')
      return result
    }

    console.log(`📧 [WORKFLOW] STEP 2A: Invio documenti informativi a ${leadData.emailRichiedente}`)
    console.log(`Richiesti: Brochure=${leadData.vuoleBrochure}, Manuale=${leadData.vuoleManuale}`)

    const emailService = new EmailService(env)
    
    // Carica template email_documenti_informativi
    const template = await loadEmailTemplate('email_documenti_informativi', db, env)
    
    // Prepara i dati per il template
    const servizioNome = leadData.servizio || 'eCura'
    const pianoNome = (leadData.pacchetto === 'BASE' || leadData.pacchetto === 'base') ? 'BASE' : 'AVANZATO'
    const dispositivo = (servizioNome === 'PREMIUM' || servizioNome === 'premium') ? 'SiDLY Vital Care' : 'SiDLY Care PRO'
    
    // Determina l'URL della brochure in base al servizio
    const baseUrl = env.PUBLIC_URL || env.PAGES_URL || 'https://genspark-ai-developer.telemedcare-v12.pages.dev'
    
    console.log(`🌐 [WORKFLOW] Using baseUrl: ${baseUrl}`)
    
    const brochureFilename = (servizioNome === 'PREMIUM' || servizioNome === 'premium') 
      ? 'Medica-GB-SiDLY_Vital_Care_ITA-compresso.pdf'
      : 'Medica-GB-SiDLY_Care_PRO_ITA_compresso.pdf'
    
    const brochureUrl = `${baseUrl}/brochures/${brochureFilename}`
    
    // ============================================
    // VERIFICA COMPLETAMENTO LEAD
    // ============================================
    const { missing, available } = getMissingFields(leadData)
    const completionRequired = missing.length > 0
    
    // Se lead incompleto, genera token e link completamento
    let completionSection = ''
    
    if (completionRequired) {
      // TODO: Implementare generazione token automatica
      // Per ora generiamo un link placeholder
      const completionLink = `${baseUrl}/completa-dati?leadId=${leadData.id}`
      const tokenDays = 30
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + tokenDays)
      const tokenExpiry = expiryDate.toLocaleDateString('it-IT')
      
      // Costruisci lista campi mancanti
      const missingFieldsHtml = missing.map(field => 
        `<li style="color: #856404; font-weight: 500;">${field}</li>`
      ).join('\n        ')
      
      completionSection = `
<!-- SEZIONE COMPLETAMENTO DATI (lead incompleto) -->
<div class="warning-box">
    <h4>⚠️ Ultimi Dettagli Necessari</h4>
    <p>Per procedere con l'attivazione del servizio, abbiamo bisogno di alcuni dati aggiuntivi:</p>
    <ul style="margin: 15px 0; padding-left: 25px; line-height: 2;">
        ${missingFieldsHtml}
    </ul>
    <p style="margin: 20px 0 10px 0; font-weight: 500;">Clicchi sul pulsante qui sotto per completare i dati in soli 2 minuti:</p>
    <div style="text-align: center; margin: 25px 0;">
        <a href="${completionLink}" 
           style="display: inline-block; 
                  background: linear-gradient(135deg, #0066CC 0%, #0099CC 100%); 
                  color: white; 
                  padding: 15px 40px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  font-size: 18px; 
                  font-weight: 600;
                  box-shadow: 0 4px 8px rgba(0,102,204,0.3);">
            📝 Completa i Dati Ora
        </a>
    </div>
    <p style="font-size: 13px; color: #856404; margin: 15px 0;">
        ⏰ Il link è valido per ${tokenDays} giorni (scadenza: ${tokenExpiry})
    </p>
</div>
`
    }
    
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
      BROCHURE_URL: brochureUrl,
      DATA_RICHIESTA: new Date().toLocaleDateString('it-IT'),
      PACCHETTO: leadData.pacchetto || 'BASE',
      PREZZO_PIANO: leadData.pacchetto === 'BASE' ? '€480/anno' : '€840/anno',
      PREZZO_SERVIZIO_PIANO: leadData.pacchetto === 'BASE' ? '€480/anno' : '€840/anno',
      
      // Sezione completamento (HTML renderizzato)
      COMPLETION_SECTION: completionSection
    }

    // Renderizza template
    const emailHtml = renderTemplate(template, templateData)

    // Prepara allegati PDF
    const attachments: Array<{ filename: string; content: string; contentType: string }> = []
    
    try {
      // In Cloudflare Workers, usiamo fetch per leggere file statici da public/
      // Determina baseUrl da env
      const baseUrl = env.PUBLIC_URL || env.PAGES_URL || 'https://genspark-ai-developer.telemedcare-v12.pages.dev'
      
      console.log(`🌐 [WORKFLOW] Using baseUrl: ${baseUrl}`)
      
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
            console.log(`📄 [WORKFLOW] Caricamento brochure generica eCura`)
            const brochureUrl = `${baseUrl}/brochures/Brochure_eCura.pdf`
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
                filename: 'Brochure_eCura.pdf',
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
    console.log(`📄 [WORKFLOW] Brochure URL: ${brochureUrl}`)
    console.log(`📄 [WORKFLOW] Link download inclusi nel template email`)

    // Invia email da info@telemedcare.it (richiesta documentazione informativa)
    // NOTA: Ora usiamo link download invece di allegati PDF
    const sendResult = await emailService.sendEmail({
      to: leadData.emailRichiedente,
      from: 'info@telemedcare.it',
      subject: '📚 TeleMedCare - Documenti Informativi Richiesti',
      html: emailHtml
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
    // 🔴 CONTROLLO SWITCH: Verifica se email automatiche ai lead sono abilitate
    const emailLeadsEnabled = await getSetting(db, 'lead_email_notifications_enabled')
    if (!emailLeadsEnabled) {
      console.log(`⏭️ [WORKFLOW] Email automatiche ai lead disabilitate - skip invio contratto`)
      result.errors.push('Email automatiche ai lead disabilitate nelle impostazioni sistema')
      return result
    }

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
        console.log(`💾 [CONTRATTO] DB type:`, typeof db, db ? 'Available' : 'NULL')
        
        // Salva contratto nel DB (usa schema esistente con TUTTI i campi NOT NULL)
        const prezzoMensile = contractData.tipoServizio === 'AVANZATO' ? 70 : 40
        const durataMesi = 12
        
        console.log(`💾 [CONTRATTO] Dati da salvare:`, {
          id: contractData.contractId,
          leadId: leadData.id,
          codice_contratto: contractData.contractCode,
          tipo_contratto: contractData.tipoServizio,
          servizio: contractData.servizio,
          piano: contractData.tipoServizio,
          prezzo_totale: contractData.prezzoBase
        })
        
        const insertResult = await db.prepare(`
          INSERT INTO contracts (
            id, leadId, codice_contratto, tipo_contratto, 
            template_utilizzato, contenuto_html, 
            pdf_generated, pdf_url, email_sent, email_template_used,
            status, servizio, piano, 
            prezzo_mensile, durata_mesi, prezzo_totale, 
            data_invio, data_scadenza,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          contractData.contractId,
          leadData.id,
          contractData.contractCode,
          contractData.tipoServizio,
          'template_contratto_firma_digitale', // template_utilizzato (NOT NULL)
          contractHtml,
          0, // pdf_generated
          '', // pdf_url (vuoto per ora, PDF richiede Puppeteer)
          1, // email_sent
          'email_invio_contratto', // email_template_used
          'PENDING',
          contractData.servizio,
          contractData.tipoServizio,
          prezzoMensile, // prezzo_mensile (NOT NULL)
          durataMesi, // durata_mesi (NOT NULL)
          contractData.prezzoBase, // prezzo_totale = prezzoBase (480 o 840), NON IVA inclusa
          new Date().toISOString(), // data_invio
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // data_scadenza (+30 giorni)
          new Date().toISOString(), // created_at
          new Date().toISOString()  // updated_at
        ).run()
        
        console.log(`✅ [CONTRATTO] Insert result:`, insertResult)
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
    const template = await loadEmailTemplate('email_invio_contratto', db, env)
    
    // Prepara i dati per il template
    const servizioNome = contractData.servizio || leadData.servizio || 'eCura PRO' // eCura PRO, eCura FAMILY, eCura PREMIUM
    const pianoNome = contractData.tipoServizio || 'BASE' // BASE o AVANZATO
    const dispositivo = (servizioNome.includes('PREMIUM') || servizioNome.includes('premium')) ? 'SiDLY Vital Care' : 'SiDLY Care PRO'
    
    // Determina URL brochure per il link diretto
    const baseUrl = env?.PUBLIC_URL || 'https://genspark-ai-developer.telemedcare-v12.pages.dev'
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
      PREZZO_PIANO: `€${contractData.prezzoBase.toFixed(2)}`,
      PREZZO_SERVIZIO_PIANO: `€${contractData.prezzoBase.toFixed(2)}/anno`,
      CODICE_CLIENTE: leadData.id,
      CODICE_CONTRATTO: contractData.contractCode,
      LINK_FIRMA: `${baseUrl}/contract-signature.html?contractId=${contractData.contractId}`,
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
          const filename = linkBrochure.split('/').pop() || 'Brochure_eCura.pdf'
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
    const template = await loadEmailTemplate('email_invio_proforma', db, env)
    
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
    const template = await loadEmailTemplate('email_benvenuto', db, env)
    
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
    const template = await loadEmailTemplate('email_configurazione', db, env)
    
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
    const template = await loadEmailTemplate('email_conferma_attivazione', db, env)
    
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
