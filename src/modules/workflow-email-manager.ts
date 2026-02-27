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
 */

// ========================================
// IMPORTS
// ========================================
import { MEDICAGB_LOGO_BASE64 } from './medicagb-logo'

/**
 * CONTINUATION
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
  
  // ✅ CORRETTO: Intestatario contratto è SEMPRE l'assistito (il servizio è per lui/lei)
  // Il richiedente/caregiver va nei "Riferimenti"
  const nomeIntestatario = leadData.nomeAssistito || leadData.nomeRichiedente || 'N/A'
  const cognomeIntestatario = leadData.cognomeAssistito || leadData.cognomeRichiedente || 'N/A'
  const luogoNascitaIntestatario = leadData.luogoNascitaAssistito || 'N/A'
  const dataNascitaIntestatario = leadData.dataNascitaAssistito || 'N/A'
  const indirizzoIntestatario = leadData.indirizzoAssistito || 'N/A'
  const capIntestatario = leadData.capAssistito || 'N/A'
  const cittaIntestatario = leadData.cittaAssistito || 'N/A'
  const provinciaIntestatario = leadData.provinciaAssistito || ''
  const cfIntestatario = leadData.cfAssistito || 'N/A'
  
  // Care giver (richiedente) per i riferimenti
  const nomeCareGiver = leadData.nomeRichiedente || nomeIntestatario
  const cognomeCareGiver = leadData.cognomeRichiedente || cognomeIntestatario
  const telefonoCareGiver = leadData.telefono || 'N/A'
  const emailCareGiver = leadData.email || 'N/A'
  
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
        
        .letterhead {
            border-top: 3px solid #0066cc;
            border-bottom: 3px solid #0066cc;
            padding: 20px;
            margin-bottom: 30px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
        }
        
        .letterhead-logo {
            flex-shrink: 0;
            margin-right: 30px;
        }
        
        .letterhead-logo img {
            max-width: 180px;
            height: auto;
        }
        
        .letterhead-info {
            flex-grow: 1;
            text-align: right;
        }
        
        .letterhead-info h3 {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #0066cc;
        }
        
        .letterhead-info p {
            font-size: 11px;
            margin: 3px 0;
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
    <!-- Carta intestata ufficiale Medica GB -->
    <div class="letterhead">
        <div class="letterhead-logo">
            <img src="${MEDICAGB_LOGO_BASE64}" alt="Medica GB Logo">
        </div>
        <div class="letterhead-info">
            <h3>Medica GB S.r.l.</h3>
            <p>Corso Garibaldi 34 – 20121 Milano</p>
            <p>PEC: medicagbsrl@pecimprese.it</p>
            <p>E.mail: info@medicagb.it</p>
            <p>Codice Fiscale e P.IVA: 12435130963 - REA: MI-2661409</p>
            <p>www.medicagb.it</p>
        </div>
    </div>
    
    <h1>SCRITTURA PRIVATA</h1>
    
    <p>Con la presente scrittura privata da valere a tutti gli effetti e conseguenze di legge tra:</p>
    
    <div class="party">
        <p><strong>Medica GB S.r.l.</strong>, con sede in Corso Garibaldi 34 a Milano 20121 e con Partita IVA e registro imprese 12435130963, in persona dell'Amministratore Stefania Rocca</p>
        <p class="breviter">(breviter Medica GB)</p>
    </div>
    
    <p style="text-align: center; font-weight: bold;">e</p>
    
    <div class="party">
        <p>Sig. <span class="highlight">${nomeIntestatario} ${cognomeIntestatario}</span> nato/a a <span class="highlight">${luogoNascitaIntestatario}</span> il <span class="highlight">${dataNascitaIntestatario}</span>, residente e domiciliato/a in <span class="highlight">${indirizzoIntestatario}</span> - <span class="highlight">${capIntestatario}</span> <span class="highlight">${cittaIntestatario}</span> (<span class="highlight">${provinciaIntestatario}</span>) e con codice fiscale <span class="highlight">${cfIntestatario}</span>.</p>
        
        <p><strong>Indirizzo di spedizione:</strong> <span class="highlight">${indirizzoIntestatario} - ${capIntestatario} ${cittaIntestatario} (${provinciaIntestatario})</span></p>
        
        <p><strong>Riferimenti:</strong><br>
        Signor <span class="highlight">${nomeCareGiver} ${cognomeCareGiver}</span> – telefono <span class="highlight">${telefonoCareGiver}</span> – e-mail <span class="highlight">${emailCareGiver}</span></p>
        
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
    <p>L'oggetto del presente Contratto è l'erogazione del "Servizio di TeleAssistenza ${pianoNome === 'BASE' ? 'base' : 'avanzato'}" mediante l'utilizzo del Dispositivo ${dispositivo}. Le funzioni del Dispositivo ${dispositivo} sono le seguenti:</p>
    
    <div class="feature-list">
        <p><strong>Rilevatore automatico di caduta:</strong> effettua una chiamata vocale di allarme, in caso di caduta, e invia una notifica tramite sms ai familiari. Nell'sms arriverà sia il link da cliccare per individuare la posizione dell'assistito (geolocalizzazione) che i valori dei parametri fisiologici che è stato possibile rilevare.</p>
        
        <p><strong>Pulsante SOS:</strong> premendo il pulsante SOS è possibile effettuare una chiamata vocale al primo contatto di emergenza (in caso di mancata risposta, in cascata, ai successivi contatti di emergenza configurati) ed inviare una notifica di emergenza (SMS geolocalizzato) ai familiari configurati in Piattaforma).</p>
        
        <p><strong>Comunicazione vocale bidirezionale:</strong> è possibile configurare sulla Piattaforma ${dispositivo} i contatti dei familiari; dopo l'invio dell'allarme i familiari (configurati in Piattaforma) ricevono una chiamata dal bracciale e possono parlare con l'assistito; inoltre, in qualsiasi momento, i familiari (configurati in Piattaforma) possono contattare l'assistito tramite il bracciale.</p>
        
        <p><strong>Posizione gps e gps-assistito:</strong> consente di geolocalizzare l'assistito quando viene inviato l'allarme oppure, in ogni momento, tramite l'APP. È inoltre possibile impostare una cosiddetta area sicura per l'assistito (geo-fencing) con invio automatico dell'allarme in caso di uscita dalla zona sicura.</p>
        
        <p><strong>Misurazioni della frequenza cardiaca e della saturazione di ossigeno:</strong> è possibile impostare una notifica che arrivi ai familiari tramite APP quando i valori rilevati vanno oltre le soglie impostate in piattaforma (comunicate dal proprio Medico di Base).</p>
        
        <p><strong>Assistenza vocale:</strong> informa l'assistito in relazione ai seguenti eventi: pressione pulsante SOS, attivazione bracciale, messa in carica del bracciale, segnalazione di batteria scarica, ecc.</p>
        
        <p><strong>Promemoria per l'assunzione dei farmaci:</strong> un messaggio ricorda l'orario in cui assumere i farmaci (aderenza terapeutica).</p>
        
        <p><strong>Registrazione dei passi:</strong> aiuta a valutare quanto sei attivo durante la giornata. Inoltre, monitorando le calorie bruciate, aiuta a mantenere una dieta sana.</p>
    </div>
    
    <p>L'integrazione di queste funzioni consente l'elaborazione di consigli sanitari personalizzati per le esigenze dell'Assistito da parte del Medico di Medicina Generale.</p>
    
    <h2>Durata del Servizio</h2>
    <p>Il Servizio di TeleAssistenza ${pianoNome === 'BASE' ? 'base' : 'avanzato'} ha una durata di 12 mesi a partire da <span class="highlight">${dataInizioServizio}</span> fino al <span class="highlight">${dataScadenza}</span>. Il Contratto sarà prorogabile su richiesta scritta del Cliente e su accettazione di Medica GB.</p>
    
    <h2>Tariffa del Servizio</h2>
    <p>La tariffa annuale per il primo anno di attivazione del "Servizio di TeleAssistenza ${pianoNome === 'BASE' ? 'Base' : 'avanzato'}" è pari a <span class="highlight">${importoPrimoAnno} €</span> ${pianoNome === 'BASE' ? '(47€/mese)' : '(70€/mese)'} + IVA 22% (totale <span class="highlight">${contractData.prezzoIvaInclusa || Math.round(importoPrimoAnno * 1.22)} € inclusa iva</span>) e include:</p>
    
    <ul>
        <li>Dispositivo ${dispositivo} (hardware)</li>
        <li>Configurazione del Dispositivo e del Processo di Comunicazione con uno o più familiari e Piattaforma Web e APP di TeleAssistenza per la durata di 12 mesi</li>
        <li>SIM per trasmissione dati e comunicazione vocale per la durata di 12 mesi</li>
    </ul>
    
    <p>Per i successivi anni (rinnovabili di anno in anno) la tariffa annuale per il "Servizio di Continuità di TeleAssistenza ${pianoNome === 'BASE' ? 'base' : 'avanzato'}" sarà pari a <span class="highlight">${importoAnniSuccessivi} €</span> ${pianoNome === 'BASE' ? '(25€/mese)' : '(50€/mese)'} + IVA 22% con inclusi:</p>
    
    <ul>
        <li>Piattaforma Web e APP di TeleAssistenza per la durata di 12mesi</li>
        <li>SIM per trasmissione dati e comunicazione vocale per la durata di 12 mesi</li>
    </ul>
    
    <h2>Metodo di pagamento</h2>
    <p>Medica GB emetterà fattura anticipata di 12 mesi all'attivazione del Servizio e il Cliente procederà al pagamento a ricevimento della fattura stessa tramite bonifico bancario</p>
    
    <div class="payment-details">
        <p><strong>Intestato a:</strong> Medica GB Srl</p>
        <p><strong>Causale:</strong> ${cognomeIntestatario} ${nomeIntestatario} - SERVIZI PER ${dispositivo.toUpperCase()}</p>
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
        <p>Corso Garibaldi 34 – 20121 Milano</p>
        <p>PEC: medicagbsrl@pecimprese.it</p>
        <p>E.mail: info@medicagb.it</p>
        <p>Codice Fiscale e P.IVA: 12435130963 - REA: MI-2661409</p>
        <p>www.medicagb.it</p>
    </div>
</body>
</html>
  `.trim()
}


export interface LeadData {
  id: string
  nomeRichiedente: string
  cognomeRichiedente: string
  email: string
  telefono?: string
  cittaIntestatario?: string
  nomeAssistito?: string
  cognomeAssistito?: string
  etaAssistito?: number
  pacchetto: string // 'BASE' o 'AVANZATO'
  servizio?: string // 'FAMILY' | 'PRO' | 'PREMIUM' (nuovo campo eCura)
  vuoleBrochure: boolean
  vuoleManuale: boolean
  vuoleContratto: boolean
  fonte?: string
  cfIntestatario?: string
  indirizzoIntestatario?: string
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
    console.log(`Lead: ${leadData.nomeRichiedente} ${leadData.cognomeRichiedente} - ${leadData.email}`)

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
      EMAIL_RICHIEDENTE: leadData.email,
      TELEFONO_RICHIEDENTE: leadData.telefono || 'Non fornito',
      CF_RICHIEDENTE: leadData.cfIntestatario || 'Non fornito',
      INDIRIZZO_RICHIEDENTE: leadData.indirizzoIntestatario || 'Non fornito',
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
      text: `Nuovo lead ricevuto: ${leadData.nomeRichiedente} ${leadData.cognomeRichiedente}\nServizio: ${leadData.pacchetto}\nEmail: ${leadData.email}`
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

    console.log(`📧 [WORKFLOW] STEP 2A: Invio documenti informativi a ${leadData.email}`)
    console.log(`Richiesti: Brochure=${leadData.vuoleBrochure}, Manuale=${leadData.vuoleManuale}`)

    const emailService = new EmailService(env)
    
    // Carica template email_documenti_informativi
    const template = await loadEmailTemplate('email_documenti_informativi', db, env)
    
    // Prepara i dati per il template
    const servizioNome = leadData.servizio || 'eCura'
    const pianoNome = (leadData.pacchetto === 'BASE' || leadData.pacchetto === 'base') ? 'BASE' : 'AVANZATO'
    const dispositivo = (servizioNome === 'PREMIUM' || servizioNome === 'premium') ? 'SiDLY Vital Care' : 'SiDLY Care PRO'
    
    // Determina l'URL della brochure in base al servizio
    const baseUrl = env.PUBLIC_URL || env.PAGES_URL || 'https://telemedcare-v12.pages.dev'
    
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
      const baseUrl = env.PUBLIC_URL || env.PAGES_URL || 'https://telemedcare-v12.pages.dev'
      
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
      to: leadData.email,
      from: 'info@telemedcare.it',
      subject: '📚 TeleMedCare - Documenti Informativi Richiesti',
      html: emailHtml
    })

    if (sendResult.success) {
      result.success = true
      result.emailsSent.push(`email_documenti_informativi -> ${leadData.email}`)
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
    console.log(`🔍 [WORKFLOW] Email automatiche lead: ${emailLeadsEnabled ? 'ABILITATE ✅' : 'DISABILITATE ❌'}`)
    
    if (!emailLeadsEnabled) {
      console.log(`⏭️ [WORKFLOW] Email automatiche ai lead disabilitate - skip invio contratto`)
      result.errors.push('⚠️ Email automatiche ai lead DISABILITATE nelle impostazioni sistema. Vai su Impostazioni > Email Lead per abilitarle.')
      return result
    }

    console.log(`📧 [WORKFLOW] STEP 2B: Invio contratto ${contractData.tipoServizio} a ${leadData.email}`)

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
        
        // ✅ VERIFICA se esiste già un contratto per questo lead
        const existingContract = await db.prepare(
          'SELECT id FROM contracts WHERE leadId = ? ORDER BY created_at DESC LIMIT 1'
        ).bind(leadData.id).first() as any
        
        if (existingContract) {
          console.log(`⚠️  [CONTRATTO] Contratto esistente trovato per lead ${leadData.id}: ${existingContract.id}`)
          console.log(`⚠️  [CONTRATTO] Riutilizzo contratto esistente invece di crearne uno nuovo`)
          // Usa l'ID del contratto esistente
          contractData.contractId = existingContract.id
        }
        
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
          prezzo_totale: contractData.prezzoBase,
          isUpdate: !!existingContract
        })
        
        if (existingContract) {
          // ✅ UPDATE contratto esistente (NON aggiornare codice_contratto che è UNIQUE!)
          await db.prepare(`
            UPDATE contracts SET
              tipo_contratto = ?,
              contenuto_html = ?,
              email_sent = 1,
              email_template_used = 'email_invio_contratto',
              servizio = ?,
              piano = ?,
              prezzo_mensile = ?,
              durata_mesi = ?,
              prezzo_totale = ?,
              data_invio = ?,
              updated_at = ?
            WHERE id = ?
          `).bind(
            contractData.tipoServizio,
            contractHtml,
            contractData.servizio,
            contractData.tipoServizio,
            prezzoMensile,
            durataMesi,
            contractData.prezzoBase,
            new Date().toISOString(),
            new Date().toISOString(),
            contractData.contractId
          ).run()
          
          console.log(`✅ [CONTRATTO] UPDATE eseguito su contratto esistente: ${contractData.contractId}`)
        } else {
          // ✅ INSERT nuovo contratto
          await db.prepare(`
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
            'template_contratto_firma_digitale',
            contractHtml,
            0,
            '',
            1,
            'email_invio_contratto',
            'PENDING',
            contractData.servizio,
            contractData.tipoServizio,
            prezzoMensile,
            durataMesi,
            contractData.prezzoBase,
            new Date().toISOString(),
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            new Date().toISOString(),
            new Date().toISOString()
          ).run()
          
          console.log(`✅ [CONTRATTO] INSERT nuovo contratto: ${contractData.contractId}`)
        }
        
        // ✅ VERIFICA che il contratto sia stato effettivamente salvato
        const verifyContract = await db.prepare('SELECT id FROM contracts WHERE id = ?')
          .bind(contractData.contractId).first()
        
        if (!verifyContract) {
          throw new Error(`CONTRATTO NON TROVATO DOPO INSERT! ID: ${contractData.contractId}`)
        }
        
        console.log(`✅ [CONTRATTO] Verifica DB: contratto ${contractData.contractId} trovato!`)
      } catch (dbError) {
        console.error('❌ [CONTRATTO] Errore salvataggio DB:', dbError)
        console.error('❌ [CONTRATTO] Stack:', (dbError as Error)?.stack)
        // ❌ BLOCCA l'operazione se il contratto non viene salvato!
        result.errors.push(`Errore critico: contratto non salvato nel database - ${(dbError as Error)?.message}`)
        result.success = false
        return result
      }
    } else {
      console.warn(`⚠️  [CONTRATTO] DB non disponibile - contratto NON salvato!`)
    }
    
    // ============================================
    // STEP 2: Prepara e invia email con link firma
    // ============================================
    const emailService = new EmailService(env)
    
    // Carica template email_invio_contratto (UNICO per BASE e AVANZATO)
    console.log(`📧 [CONTRATTO] Caricamento template email_invio_contratto...`)
    const template = await loadEmailTemplate('email_invio_contratto', db, env)
    console.log(`📧 [CONTRATTO] Template caricato (${template.length} chars)`)
    
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
      PREZZO_PIANO: `€${contractData.prezzoBase.toFixed(2)}`,
      PREZZO_SERVIZIO_PIANO: `€${contractData.prezzoBase.toFixed(2)}/anno`,
      CODICE_CLIENTE: leadData.id,
      CODICE_CONTRATTO: contractData.contractCode,
      LINK_FIRMA: `${baseUrl}/firma-contratto.html?v=${Date.now()}&contractId=${contractData.contractId}`,
      LINK_BROCHURE: linkBrochure,
      DATA_INVIO: new Date().toLocaleDateString('it-IT')
    }

    console.log(`📧 [CONTRATTO] Template data:`, JSON.stringify(templateData, null, 2))

    // Renderizza template
    const emailHtml = renderTemplate(template, templateData)
    console.log(`📧 [CONTRATTO] Template renderizzato (${emailHtml.length} chars)`)

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
    console.log(`📧 [CONTRATTO] Invio email a: ${leadData.email}`)
    console.log(`📧 [CONTRATTO] Subject: 📄 TeleMedCare - Il Tuo Contratto ${contractData.tipoServizio}`)
    console.log(`📧 [CONTRATTO] Allegati: ${attachments.length}`)
    console.log(`📧 [CONTRATTO] HTML length: ${emailHtml.length}`)
    
    const sendResult = await emailService.sendEmail({
      to: leadData.email,
      from: 'info@telemedcare.it',
      subject: `📄 TeleMedCare - Il Tuo Contratto ${contractData.tipoServizio}`,
      html: emailHtml,
      attachments: attachments
    })
    
    console.log(`📧 [CONTRATTO] Send result:`, JSON.stringify(sendResult, null, 2))

    if (sendResult.success) {
      result.success = true
      result.emailsSent.push(`email_invio_contratto -> ${leadData.email}`)
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
    servizio?: string  // 🔥 AGGIUNTO: campo opzionale per servizio completo
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
    console.log(`📧 [WORKFLOW] STEP 3: Invio proforma ${proformaData.numeroProforma} a ${leadData.email}`)

    const emailService = new EmailService(env)
    
    // Carica template email_invio_proforma (con fallback)
    let template = await loadEmailTemplate('email_invio_proforma', db, env)
    
    // Prepara i dati per il template
    // 🔥 FIX: Normalizza il servizio (rimuovi "eCura " se presente)
    const servizioNormalizzato = (proformaData.servizio || 'PRO')
      .replace(/^eCura\s+/i, '')  // Rimuovi "eCura " all'inizio (case-insensitive)
      .trim()
      .toUpperCase() as 'FAMILY' | 'PRO' | 'PREMIUM'
    
    const templateData = {
      NOME_CLIENTE: leadData.nomeRichiedente,
      COGNOME_CLIENTE: leadData.cognomeRichiedente,
      PIANO_SERVIZIO: formatServiceName(servizioNormalizzato, proformaData.tipoServizio as 'BASE' | 'AVANZATO'),
      NUMERO_PROFORMA: proformaData.numeroProforma,
      IMPORTO_TOTALE: `€${proformaData.prezzoIvaInclusa.toFixed(2)}`,
      SCADENZA_PAGAMENTO: new Date(proformaData.dataScadenza).toLocaleDateString('it-IT'),
      IBAN: 'IT97L0503401727000000003519',
      CAUSALE: `Proforma ${proformaData.numeroProforma} - ${leadData.nomeRichiedente} ${leadData.cognomeRichiedente}`,
      LINK_PAGAMENTO: `${env.PUBLIC_URL || env.PAGES_URL || 'https://telemedcare-v12.pages.dev'}/pagamento.html?proformaId=${proformaData.proformaId}`,
      DATA_INVIO: new Date().toLocaleDateString('it-IT')
    }

    // Fallback: se template manca, usa HTML inline
    if (!template) {
      console.warn(`⚠️ [WORKFLOW] Template email_invio_proforma non trovato, uso HTML inline`)
      template = `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;text-align:center}.content{padding:30px;max-width:800px;margin:0 auto}.proforma{background:#f8f9fa;border:2px solid #667eea;border-radius:10px;padding:25px;margin:25px 0}.proforma h2{color:#667eea;margin-top:0;border-bottom:2px solid #667eea;padding-bottom:10px}.proforma-table{width:100%;border-collapse:collapse;margin:20px 0}.proforma-table th,.proforma-table td{padding:12px;text-align:left;border-bottom:1px solid #ddd}.proforma-table th{background:#667eea;color:white}.proforma-table tr:last-child td{border-bottom:2px solid #667eea;font-weight:bold;font-size:18px}.payment-options{display:flex;gap:20px;margin:30px 0;flex-wrap:wrap}.payment-box{flex:1;min-width:280px;background:white;border:2px solid #e0e0e0;border-radius:10px;padding:20px}.payment-box h3{color:#667eea;margin-top:0}.btn{display:inline-block;background:#667eea;color:white!important;padding:15px 30px;text-decoration:none;border-radius:8px;margin:15px 0;font-weight:bold;text-align:center;transition:background 0.3s}.btn:hover{background:#5568d3}.footer{background:#f8f9fa;padding:20px;text-align:center;font-size:12px;color:#666;border-top:2px solid #e0e0e0}</style></head>
<body>
<div class="header">
<h1>💰 Fattura Proforma</h1>
<p>TeleMedCare - Servizio eCura</p>
</div>
<div class="content">
<p>Gentile <strong>{{NOME_CLIENTE}} {{COGNOME_CLIENTE}}</strong>,</p>
<p>Grazie per aver firmato il contratto! Di seguito troverai la <strong>Fattura Proforma</strong> con le modalità di pagamento.</p>

<div class="proforma">
<h2>📋 PROFORMA N. {{NUMERO_PROFORMA}}</h2>
<table class="proforma-table">
<tr><th>Descrizione</th><th style="text-align:right">Importo</th></tr>
<tr><td><strong>{{PIANO_SERVIZIO}}</strong><br><small>Servizio di telemedicina eCura</small></td><td style="text-align:right">{{IMPORTO_TOTALE}}</td></tr>
<tr><td><strong>TOTALE DA PAGARE</strong></td><td style="text-align:right;color:#667eea"><strong>{{IMPORTO_TOTALE}}</strong></td></tr>
</table>
<p style="margin:15px 0"><strong>📅 Data Emissione:</strong> {{DATA_INVIO}}<br><strong>⏰ Scadenza Pagamento:</strong> {{SCADENZA_PAGAMENTO}}</p>
</div>

<h3 style="color:#667eea;margin-top:40px">💳 Scegli la Modalità di Pagamento</h3>

<div class="payment-options">
<div class="payment-box" style="border-color:#667eea">
<h3>Opzione 1 - Pagamento Online</h3>
<p>💳 <strong>Carta di Credito/Debito</strong> o <strong>PayPal</strong></p>
<p style="color:#666;font-size:14px">Pagamento sicuro tramite Stripe. Riceverai conferma immediata.</p>
<a href="{{LINK_PAGAMENTO}}" class="btn" style="display:block">💳 Paga Ora con Stripe</a>
</div>

<div class="payment-box">
<h3>Opzione 2 - Bonifico Bancario</h3>
<p><strong>IBAN:</strong><br><code style="background:#f0f0f0;padding:5px 10px;border-radius:5px;display:inline-block;margin:5px 0">{{IBAN}}</code></p>
<p><strong>Intestatario:</strong> Medica GB S.r.l.</p>
<p><strong>Importo:</strong> {{IMPORTO_TOTALE}}</p>
<p><strong>Causale:</strong><br><code style="background:#fff3cd;padding:5px 10px;border-radius:5px;display:inline-block;margin:5px 0;font-size:12px">{{CAUSALE}}</code></p>
<p style="font-size:13px;color:#666;margin-top:15px">💡 Ricorda di inserire la causale esatta per identificare il pagamento</p>
</div>
</div>

<div style="background:#e7f3ff;border-left:4px solid #667eea;padding:15px;margin:30px 0;border-radius:5px">
<p style="margin:0"><strong>📬 Cosa Succede Dopo il Pagamento?</strong></p>
<ol style="margin:10px 0 0 0;padding-left:20px">
<li>Riceverai una <strong>conferma di pagamento</strong> via email</li>
<li>Ti invieremo le <strong>istruzioni per configurare</strong> il dispositivo SiDLY</li>
</ol>
</div>

<p style="margin-top:30px">Per qualsiasi domanda o assistenza:<br>📧 <a href="mailto:info@telemedcare.it" style="color:#667eea;font-weight:bold">info@telemedcare.it</a><br>📞 +39 02 1234567</p>

<p style="margin-top:30px">Cordiali saluti,<br><strong>Il Team TeleMedCare</strong></p>
</div>
<div class="footer">
<p><strong>Medica GB S.r.l.</strong><br>Corso Giuseppe Garibaldi, 34 – 20121 Milano<br>P.IVA: 12435130963 | Email: info@telemedcare.it</p>
</div>
</body>
</html>`
    }

    // Renderizza template
    const emailHtml = renderTemplate(template, templateData)

    // Prepara allegati: Proforma PDF (solo se presente)
    const attachments = proformaData.proformaPdfUrl 
      ? [{
          filename: `Proforma_${proformaData.numeroProforma}.pdf`,
          path: proformaData.proformaPdfUrl
        }]
      : [] // Nessun allegato se PDF non disponibile

    // Invia email (con o senza allegato)
    const sendResult = await emailService.sendEmail({
      to: leadData.email,
      from: 'info@telemedcare.it',
      subject: `💰 TeleMedCare - Fattura Proforma ${proformaData.numeroProforma}`,
      html: emailHtml,
      ...(attachments.length > 0 && { attachments }) // Include attachments solo se presenti
    })

    if (sendResult.success) {
      result.success = true
      result.emailsSent.push(`email_invio_proforma -> ${leadData.email}`)
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
    console.log(`📧 [WORKFLOW] STEP 4: Invio email benvenuto a ${clientData.email}`)

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
      LINK_CONFIGURAZIONE: `${env.PUBLIC_URL || env.PAGES_URL || 'https://telemedcare-v12.pages.dev'}/completa-dati?leadId=${clientData.id}`,
      COSTO_SERVIZIO: clientData.pacchetto === 'AVANZATO' ? '€1.024,80/anno (IVA inclusa)' : '€585,60/anno (IVA inclusa)',
      SERVIZI_INCLUSI: clientData.pacchetto === 'AVANZATO' 
        ? '<ul style="margin:4px 0; padding-left:20px;"><li>Dispositivo SiDLY Care PRO</li><li>Chiamate bidirezionali</li><li>Centrale Operativa H24</li><li>Telemedicina integrata</li></ul>'
        : '<ul style="margin:4px 0; padding-left:20px;"><li>Dispositivo SiDLY Care</li><li>Chiamate di emergenza</li><li>Monitoraggio base</li></ul>',
      PREZZO_PIANO: clientData.pacchetto === 'AVANZATO' ? '€840/anno' : '€480/anno'
    }

    // Renderizza template
    const emailHtml = renderTemplate(template, templateData)

    // Invia email
    const sendResult = await emailService.sendEmail({
      to: clientData.email,
      from: 'info@telemedcare.it',
      subject: `🎉 Benvenuto/a in TeleMedCare, ${clientData.nomeRichiedente}!`,
      html: emailHtml
    })

    if (sendResult.success) {
      result.success = true
      result.emailsSent.push(`email_benvenuto -> ${clientData.email}`)
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
 * STEP 4B: Invia email form configurazione DOPO pagamento
 * Template: email_configurazione.html (con link al form di configurazione)
 */
export async function inviaEmailFormConfigurazione(
  clientData: LeadData & { codiceCliente: string },
  env: any,
  db: D1Database
): Promise<WorkflowEmailResult> {
  const result: WorkflowEmailResult = {
    success: false,
    step: 'email_form_configurazione',
    emailsSent: [],
    errors: []
  }

  try {
    console.log(`📧 [WORKFLOW] STEP 4B: Invio email form configurazione a ${clientData.email}`)

    const emailService = new EmailService(env)
    
    // Carica template email_configurazione
    const template = await loadEmailTemplate('email_configurazione', db, env)
    
    // Prepara i dati per il template
    const templateData = {
      DISPOSITIVO: 'SiDLY Care PRO',
      SERVIZIO: formatServiceName(clientData.servizio || 'PRO', clientData.pacchetto),
      LINK_CONFIGURAZIONE: `${env.PUBLIC_URL || env.PAGES_URL || 'https://telemedcare-v12.pages.dev'}/configurazione.html?leadId=${clientData.id}`
    }

    // Renderizza template
    const emailHtml = renderTemplate(template, templateData)

    // Invia email
    const sendResult = await emailService.sendEmail({
      to: clientData.email,
      from: 'info@telemedcare.it',
      subject: `⚙️ Completa la Configurazione del tuo ${templateData.DISPOSITIVO}`,
      html: emailHtml
    })

    if (sendResult.success) {
      result.success = true
      result.emailsSent.push(`email_configurazione -> ${clientData.email}`)
      result.messageIds = [sendResult.messageId]
      console.log(`✅ [WORKFLOW] Email form configurazione inviata: ${sendResult.messageId}`)
    } else {
      result.errors.push(`Errore invio email form configurazione: ${sendResult.error}`)
      console.error(`❌ [WORKFLOW] Errore invio email form configurazione:`, sendResult.error)
    }

  } catch (error) {
    result.errors.push(`Eccezione invio email form configurazione: ${error.message}`)
    console.error(`❌ [WORKFLOW] Eccezione STEP 4B:`, error)
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
      EMAIL_CLIENTE: clientData.email,
      TELEFONO_CLIENTE: clientData.telefono || 'Non fornito',
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
    console.log(`📧 [WORKFLOW] STEP 6: Invio email conferma attivazione a ${clientData.email}`)

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
      to: clientData.email,
      from: 'info@telemedcare.it',
      subject: `✅ TeleMedCare - Servizio Attivato!`,
      html: emailHtml
    })

    if (sendResult.success) {
      result.success = true
      result.emailsSent.push(`email_conferma -> ${clientData.email}`)
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
