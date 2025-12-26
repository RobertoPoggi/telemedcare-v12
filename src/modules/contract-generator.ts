/**
 * CONTRACT-GENERATOR.TS - Generatore Contratti PDF eCura
 * TeleMedCare V12.0 → eCura Rebranding
 * 
 * Genera contratti PDF da template HTML B2C
 * Compila campi variabili per privati/anziani
 * Salva e invia via email
 */

import { TemplateEngine } from './email-service'
import * as fs from 'fs'
import * as path from 'path'
import { generatePDFFromHTML as convertHTMLToPDF } from './pdf-generator'
import { 
  getServizioConfig, 
  getPianoConfig, 
  getNomeCompletoServizio,
  getDescrizioneServizio,
  getCaratteristicheComplete,
  DATI_AZIENDA,
  type ServizioeCura,
  type PianoeCura
} from './ecura-services'
import { TEMPLATE_DOCX_BASE64 } from './template-docx-base64'

export interface ContractData {
  leadId: string
  nomeRichiedente: string
  cognomeRichiedente: string
  email: string
  telefono: string
  tipoServizio: 'BASE' | 'AVANZATO'
  servizio?: 'FAMILY' | 'PRO' | 'PREMIUM' // NUOVO: tipo di servizio eCura
  
  // Dati assistito (se diversi)
  nomeAssistito?: string
  cognomeAssistito?: string
  etaAssistito?: number
  
  // Dati anagrafici completi assistito
  luogoNascita?: string
  dataNascita?: string // Formato DD/MM/YYYY
  indirizzoAssistito?: string
  capAssistito?: string
  cittaAssistito?: string
  provinciaAssistito?: string
  codiceFiscaleAssistito?: string
  
  // Dati contrattuali
  prezzoMensile: number
  durataContratto: number // mesi
  prezzoTotale: number
  
  // Generated
  codiceContratto?: string
  dataContratto?: string
}

export interface ContractGenerated {
  contractId: string
  pdfUrl?: string
  pdfBase64?: string
  codiceContratto: string
  createdAt: string
}

export class ContractGenerator {
  
  /**
   * Genera contratto completo
   */
  static async generateContract(
    data: ContractData,
    db: any,
    browser?: any // Cloudflare Browser Rendering binding
  ): Promise<{ success: boolean; contract?: ContractGenerated; error?: string }> {
    
    try {
      console.log('📄 [CONTRACT] Generazione contratto DOCX/PDF per:', data.leadId)
      
      // 1. Genera codice contratto unico
      const codiceContratto = this.generateContractCode()
      const contractId = `CONTR_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      
      // 2. Prepara dati completi per template
      const contractData: ContractData = {
        ...data,
        codiceContratto,
        dataContratto: new Date().toLocaleDateString('it-IT')
      }
      
      // 3. Genera HTML contratto da template professionale
      console.log('📄 [CONTRACT] Generazione HTML da template professionale...')
      const contractHtml = this.generateContractHTMLFromTemplate(contractData)
      
      // 4. Genera PDF da HTML
      let pdfBuffer: Uint8Array
      
      if (browser) {
        // Usa Cloudflare Browser Rendering per PDF reale
        console.log('🎨 [CONTRACT] Generazione PDF con Browser Rendering...')
        pdfBuffer = await convertHTMLToPDF(contractHtml, browser, {
          format: 'A4',
          printBackground: true
        })
      } else {
        // Fallback: genera PDF da HTML
        console.log('📄 [CONTRACT] Generazione PDF da HTML (fallback)...')
        pdfBuffer = this.generatePDFFromHTMLFallback(contractHtml, contractData)
      }
      
      const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')
      
      // 5. Salva in database
      await db.prepare(`
        INSERT INTO contracts (
          id, lead_id, contract_code, tipo_servizio,
          prezzo_base, prezzo_iva_inclusa, status,
          pdf_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', ?, datetime('now'), datetime('now'))
      `).bind(
        contractId,
        data.leadId,
        codiceContratto,
        data.tipoServizio,
        data.prezzoMensile * data.durataContratto,
        data.prezzoTotale,
        null  // pdf_url (placeholder)
      ).run()
      
      console.log('✅ [CONTRACT] Contratto generato:', contractId)
      
      return {
        success: true,
        contract: {
          contractId,
          codiceContratto,
          pdfBase64,
          createdAt: new Date().toISOString()
        }
      }
      
    } catch (error) {
      console.error('❌ [CONTRACT] Errore generazione contratto:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      }
    }
  }
  
  /**
   * Genera HTML del contratto con mapping variabili eCura B2C
   * Usa struttura unificata da ecura-services.ts
   */
  private static generateContractHTMLFromTemplate(data: ContractData): string {
    // Usa sempre template unificato
    const template = this.getContractTemplateUnificato()
    
    // Ottieni configurazioni servizio e piano
    const servizioType = (data.servizio || 'PRO') as ServizioeCura
    const pianoType = data.tipoServizio as PianoeCura
    
    const servizioConfig = getServizioConfig(servizioType)
    const pianoConfig = getPianoConfig(pianoType)
    const caratteristiche = getCaratteristicheComplete(servizioType, pianoType)
    
    // Genera lista HTML caratteristiche
    const caratteristicheHTML = caratteristiche.map(c => `<li>${c}</li>`).join('\n      ')
    
    // Calcola prezzi annuali
    const prezzoAnnoPrimo = data.prezzoTotale
    const prezzoAnniSuccessivi = data.prezzoMensile * 12
    
    // Calcola date
    const oggi = new Date()
    const dataInizio = new Date(oggi)
    const dataScadenza = new Date(oggi)
    dataScadenza.setMonth(dataScadenza.getMonth() + (data.durataContratto || 12))
    
    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }
    
    // 19 PLACEHOLDER CONFORMI AL TEMPLATE DOCX
    const variables = {
      // Assistito (11 placeholder)
      NOME_ASSISTITO: data.nomeAssistito || data.nomeRichiedente,
      COGNOME_ASSISTITO: data.cognomeAssistito || data.cognomeRichiedente,
      LUOGO_NASCITA: data.luogoNascita || 'DA COMPLETARE',
      DATA_NASCITA: data.dataNascita || 'DA COMPLETARE',
      INDIRIZZO_ASSISTITO: data.indirizzoAssistito || 'DA COMPLETARE',
      CAP_ASSISTITO: data.capAssistito || 'DA COMPLETARE',
      CITTA_ASSISTITO: data.cittaAssistito || 'DA COMPLETARE',
      PROVINCIA_ASSISTITO: data.provinciaAssistito || 'DA COMPLETARE',
      CODICE_FISCALE_ASSISTITO: data.codiceFiscaleAssistito || 'DA COMPLETARE',
      TELEFONO_ASSISTITO: data.telefono || 'DA COMPLETARE',
      EMAIL_ASSISTITO: data.email,
      
      // Servizio (3 placeholder)
      Servizio: servizioConfig.nomeCompleto,
      Dispositivo: servizioConfig.dispositivo,
      Piano: pianoConfig.nomeCompleto,
      
      // Tipo Piano per causale (BASE o AVANZATO)
      TipoPiano: data.tipoServizio, // 'BASE' o 'AVANZATO'
      
      // Date (3 placeholder)
      DATA_INIZIO_SERVIZIO: formatDate(dataInizio),
      DATA_SCADENZA: formatDate(dataScadenza),
      DATA_CONTRATTO: formatDate(oggi),
      
      // Prezzi (2 placeholder)
      IMPORTO_PRIMO_ANNO: prezzoAnnoPrimo.toFixed(2),
      IMPORTO_ANNI_SUCCESSIVI: prezzoAnniSuccessivi.toFixed(2)
    }
    
    return TemplateEngine.render(template, variables)
  }
  
  /**
   * Template HTML contratto UNIFICATO - Per tutti i servizi eCura
   * Convertito dal template DOCX professionale fornito dall'utente
   * Con 19 placeholder conformi al DOCX originale
   */
  private static getContractTemplateUnificato(): string {
    return `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contratto TeleMedCare</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            max-width: 21cm;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            margin: 20px 0;
            text-transform: uppercase;
        }
        h2 {
            font-size: 12pt;
            font-weight: bold;
            margin: 15px 0 10px 0;
            text-decoration: underline;
        }
        p {
            margin: 8px 0;
            text-align: justify;
        }
        .bold {
            font-weight: bold;
        }
        .italic {
            font-style: italic;
        }
        .center {
            text-align: center;
        }
        .indent {
            margin-left: 30px;
        }
        .company-header {
            margin: 20px 0;
            line-height: 1.6;
        }
        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 45%;
        }
        .footer {
            margin-top: 30px;
            font-size: 9pt;
            text-align: center;
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }
        ul {
            margin: 10px 0;
            padding-left: 30px;
        }
        li {
            margin: 5px 0;
        }
    </style>
</head>
<body>

<h1>SCRITTURA PRIVATA</h1>
<p>&nbsp;</p>
<p>Con la presente scrittura privata da valere a tutti gli effetti e conseguenze di legge tra:</p>
<p>&nbsp;</p>
<p>Medica GB S.r.l., con sede in Corso Giuseppe Garibaldi, 34 – 20121 Milano e con Partita IVA e registro imprese 12435130963, in persona dell'Amministratore Stefania Rocca</p>
<p>&nbsp;</p>
<p class="italic center">(breviter Medica GB)</p>
<p>&nbsp;</p>
<p class="center">e</p>
<p>&nbsp;</p>
<p>Sig./Sig.ra {{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}} nato/a a {{LUOGO_NASCITA}} il {{DATA_NASCITA}}, residente e domiciliato/a in {{INDIRIZZO_ASSISTITO}} - {{CAP_ASSISTITO}} {{CITTA_ASSISTITO}} ({{PROVINCIA_ASSISTITO}}) e con codice fiscale {{CODICE_FISCALE_ASSISTITO}}.</p>
<p>&nbsp;</p>
<p>Riferimenti:</p>
<p>telefono {{TELEFONO_ASSISTITO}} – e-mail {{EMAIL_ASSISTITO}}</p>
<p>&nbsp;</p>
<p class="italic center">(breviter Il Cliente)</p>
<p>&nbsp;</p>
<p class="center">premesso che</p>
<p>&nbsp;</p>
<ul>
<li>Medica GB eroga servizi di assistenza domiciliare con tecnologie innovative, servizi di diagnostica a domicilio, esami strumentali, telemedicina, teleassistenza, telemonitoraggio e riabilitazione a domicilio.</li>
<li>Medica GB si avvale della consulenza di Medici, Terapisti, Infermieri e Operatori Socio Sanitari per erogare i servizi sopra descritti;</li>
<li>Tanto premesso,</li>
</ul>
<p>&nbsp;</p>
<p class="center">si conviene e stabilisce quanto segue</p>
<p>&nbsp;</p>
<h2>Premessa</h2>
<p>&nbsp;</p>
<p>La premessa che precede costituisce parte integrante del presente Contratto.</p>
<p>&nbsp;</p>
<h2>Oggetto del Contratto</h2>
<p>L'oggetto del presente Contratto è l'erogazione del Servizio {{Servizio}} mediante l'utilizzo del Dispositivo {{Dispositivo}} e con il supporto del Piano {{Piano}}.</p>
<p>&nbsp;</p>
<p>Le funzioni del dispositivo {{Dispositivo}} sono le seguenti:</p>
<p>&nbsp;</p>
<p>Comunicazione vocale bidirezionale: è possibile configurare sulla Piattaforma i contatti dei familiari oltre a quelli della Centrale Operativa ove prevista; dopo l'invio dell'allarme i familiari e/o la Centrale Operativa (piano avanzato) ricevono una chiamata dal dispositivo e possono parlare con l'assistito; in qualsiasi momento i familiari e/o la Centrale Operativa (piano avanzato) possono contattare l'assistito tramite il dispositivo.</p>
<p>&nbsp;</p>
<p>Rilevatore automatico di caduta: effettua una chiamata vocale di allarme, in caso di caduta, ai Care Givers e Famigliari (Piano Base) e alla Centrale Operativa (Piano Avanzato) e invia una notifica tramite sms ai familiari e, nel piano avanzato anche alla Centrale Operativa. Nell'sms arriverà sia il link da cliccare per individuare la posizione dell'assistito (geolocalizzazione) che i valori dei parametri fisiologici che è stato possibile rilevare.</p>
<p>&nbsp;</p>
<p>Posizione GPS e GPS-assistito: consente di localizzare l'assistito quando viene inviato l'allarme. È inoltre possibile impostare una cosiddetta area sicura per l'assistito (geo-fencing).</p>
<p>&nbsp;</p>
<p>Misurazioni della frequenza cardiaca e della saturazione di ossigeno: è possibile impostare una notifica che arrivi ai familiari e/o Centrale Operativa (ove prevista) tramite APP quando i valori rilevati vanno oltre le soglie programmate (comunicate dal proprio Medico di Base).</p>
<p>&nbsp;</p>
<p>Pulsante SOS: premendo il pulsante SOS per circa 3 secondi è possibile effettuare una chiamata vocale ai care giver / famigliari (piano base) o alla Centrale Operativa (piano avanzato) e inviare una notifica di emergenza (geolocalizzata) ai familiari o alla Centrale Operativa stessa.</p>
<p>&nbsp;</p>
<p>Assistenza vocale: informa l'assistito in relazione ai seguenti eventi: pressione pulsante SOS, attivazione dispositivo, messa in carica del dispositivo, segnalazione di batteria scarica, ecc.</p>
<p>&nbsp;</p>
<p>Promemoria per l'assunzione dei farmaci: un messaggio ricorda l'orario in cui assumere i farmaci (aderenza terapeutica).</p>
<p>&nbsp;</p>
<h2>Durata del Servizio</h2>
<p>Il Servizio di TeleAssistenza {{Servizio}} ha una durata di 12 mesi a partire da {{DATA_INIZIO_SERVIZIO}} fino al {{DATA_SCADENZA}}.</p>
<p>&nbsp;</p>
<p>Il Contratto sarà prorogabile su richiesta scritta del Cliente e su accettazione di Medica GB.</p>
<p>&nbsp;</p>
<h2>Tariffa del Servizio</h2>
<p>La tariffa annuale per il primo anno di attivazione del Servizio {{Servizio}} è pari a Euro {{IMPORTO_PRIMO_ANNO}} + IVA 22% e include:</p>
<p>&nbsp;</p>
<ul>
<li>Dispositivo {{Dispositivo}}</li>
<li>Configurazione del Dispositivo e del Processo di Comunicazione con la Centrale Operativa (ove previsto) e/o uno o più familiari e Piattaforma Web e APP di TeleAssistenza per la durata di 12 mesi</li>
<li>SIM per trasmissione dati e comunicazione vocale per la durata di 12 mesi</li>
<li>Piano {{Piano}}</li>
</ul>
<p>&nbsp;</p>
<p>Per i successivi anni (rinnovabili di anno in anno) la tariffa annuale per il Servizio {{Servizio}} sarà pari a Euro {{IMPORTO_ANNI_SUCCESSIVI}} + IVA 22% con inclusi:</p>
<p>&nbsp;</p>
<ul>
<li>Piattaforma Web e APP di TeleAssistenza per la durata di 12 mesi</li>
<li>SIM per trasmissione dati e comunicazione vocale per la durata di 12 mesi</li>
<li>Piano {{Piano}}</li>
</ul>
<p>&nbsp;</p>
<h2>Metodo di pagamento</h2>
<p>Medica GB emetterà fattura anticipata di 12 mesi all'attivazione del Servizio e il Cliente procederà al pagamento a ricevimento della fattura stessa tramite bonifico bancario</p>
<p>&nbsp;</p>
<p>Intestato a: Medica GB S.r.l.</p>
<p>&nbsp;</p>
<p>Causale: Servizio {{Servizio}} {{TipoPiano}} con Dispositivo {{Dispositivo}}</p>
<p>&nbsp;</p>
<p>Banca Popolare di Milano - Iban: IT97L0503401727000000003519</p>
<p>&nbsp;</p>
<h2>Riservatezza ed esclusiva</h2>
<p>Il Cliente e Medica GB si impegnano reciprocamente a non divulgare o, comunque, non utilizzare, se non per motivi attinenti all'esercizio del presente contratto, tutte le informazioni di cui venissero a conoscenza nello svolgimento del Servizio.</p>
<p>Il Cliente si impegna a contattare Medica GB per tutte le modifiche e proroghe del presente contratto.</p>
<p>&nbsp;</p>
<h2>Foro competente</h2>
<p>Ogni eventuale contestazione o controversia che dovesse insorgere tra le parti in relazione all'interpretazione, alla validità ed esecuzione del presente contratto, sarà definita alla cognizione esclusiva del Foro di Milano.</p>
<p>&nbsp;</p>
<p>Milano, lì {{DATA_CONTRATTO}}</p>
<p>&nbsp;</p>
<p>Medica GB S.r.l.                                             Il Cliente</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>Medica GB S.r.l.</p>
<p>Corso Giuseppe Garibaldi, 34 – 20121 Milano</p>
<p>PEC: medicagbsrl@pecimprese.it</p>
<p>E.mail: info@medicagb.it</p>
<p>Codice Fiscale e P.IVA: 12435130963 - REA: MI-2661409</p>
<p>www.medicagb.it www.ecura.it</p>

</body>
</html>`
  }
  
  /**
   * Template HTML contratto BASE - NUOVO: carica da file B2C
   */
  private static getContractTemplateBase(): string {
    try {
      // Prova a caricare template B2C da file
      const templatePath = path.join(process.cwd(), 'templates', 'contracts', 'contratto_ecura_base_b2c.html')
      if (fs.existsSync(templatePath)) {
        return fs.readFileSync(templatePath, 'utf-8')
      }
      console.warn('⚠️ Template BASE B2C non trovato, uso fallback inline')
    } catch (error) {
      console.error('❌ Errore caricamento template BASE:', error)
    }
    
    // Fallback: template inline (per retrocompatibilità)
    return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Contratto TeleMedCare Base - {{CODICE_CONTRATTO}}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #0b63a5;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #0b63a5;
      margin: 0;
      font-size: 24px;
    }
    .contract-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .section {
      margin: 25px 0;
    }
    .section h2 {
      color: #0b63a5;
      font-size: 18px;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 10px;
    }
    .price-box {
      background: #e7f3ff;
      border: 2px solid #0b63a5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    .price-box h3 {
      margin: 0 0 10px 0;
      color: #0b63a5;
    }
    .price-box .amount {
      font-size: 32px;
      font-weight: bold;
      color: #0b63a5;
    }
    .signature-section {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #dee2e6;
    }
    .signature-box {
      display: inline-block;
      width: 45%;
      text-align: center;
      padding: 20px;
      margin: 10px 2%;
    }
    .signature-line {
      border-top: 2px solid #000;
      margin-top: 60px;
      padding-top: 10px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #dee2e6;
      font-size: 12px;
      color: #6c757d;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 CONTRATTO DI SERVIZIO TELEMEDCARE BASE</h1>
    <p><strong>Codice Contratto:</strong> {{CODICE_CONTRATTO}}</p>
    <p><strong>Data:</strong> {{DATA_CONTRATTO}}</p>
  </div>

  <div class="contract-info">
    <h3>PARTI CONTRAENTI</h3>
    <p><strong>IL FORNITORE:</strong> {{AZIENDA_RAGIONE_SOCIALE}} - {{AZIENDA_INDIRIZZO}} - P.IVA {{AZIENDA_PARTITA_IVA}}</p>
    <p><strong>IL CLIENTE:</strong> {{NOME_RICHIEDENTE}} {{COGNOME_RICHIEDENTE}}</p>
    <p><strong>Email:</strong> {{EMAIL}} | <strong>Telefono:</strong> {{TELEFONO}}</p>
    <p><strong>Assistito:</strong> {{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}} ({{ETA_ASSISTITO}} anni)</p>
  </div>

  <div class="section">
    <h2>ART. 1 - OGGETTO DEL CONTRATTO</h2>
    <p>Il presente contratto ha per oggetto la fornitura del servizio <strong>{{TIPO_SERVIZIO}}</strong>, 
    che include:</p>
    <ul>
      <li>Dispositivo medico SiDLY Care Pro V12.0 in comodato d'uso</li>
      <li>Servizio di telemonitoraggio parametri vitali</li>
      <li>Supporto tecnico telefonico (ore ufficio)</li>
      <li>Manutenzione ordinaria e straordinaria del dispositivo</li>
      <li>Aggiornamenti software inclusi</li>
    </ul>
  </div>

  <div class="section">
    <h2>ART. 2 - DURATA E CORRISPETTIVO</h2>
    <div class="price-box">
      <h3>Piano Tariffario</h3>
      <p>Canone Mensile: <span style="font-size: 20px; font-weight: bold;">{{PREZZO_MENSILE}}</span></p>
      <p>Durata Contratto: <strong>{{DURATA_MESI}} mesi</strong></p>
      <hr style="margin: 15px 0; border: 1px solid #0b63a5;">
      <p>Importo Totale:</p>
      <div class="amount">{{PREZZO_TOTALE}}</div>
      <p style="font-size: 12px; margin-top: 10px;">IVA inclusa se dovuta</p>
    </div>
    <p>Il pagamento dovrà essere effettuato anticipatamente tramite bonifico bancario o carta di credito.</p>
  </div>

  <div class="section">
    <h2>ART. 3 - OBBLIGHI DEL FORNITORE</h2>
    <p>{{AZIENDA_RAGIONE_SOCIALE}} si impegna a:</p>
    <ul>
      <li>Fornire il dispositivo medico entro 10 giorni lavorativi dalla conferma del pagamento</li>
      <li>Garantire il corretto funzionamento del servizio di telemonitoraggio</li>
      <li>Fornire supporto tecnico durante l'orario lavorativo (9:00-18:00, Lun-Ven)</li>
      <li>Sostituire il dispositivo in caso di malfunzionamento senza costi aggiuntivi</li>
    </ul>
  </div>

  <div class="section">
    <h2>ART. 4 - OBBLIGHI DEL CLIENTE</h2>
    <p>Il Cliente si impegna a:</p>
    <ul>
      <li>Utilizzare il dispositivo secondo le istruzioni fornite</li>
      <li>Custodire con diligenza il dispositivo ricevuto in comodato d'uso</li>
      <li>Comunicare tempestivamente eventuali malfunzionamenti</li>
      <li>Restituire il dispositivo al termine del contratto o in caso di risoluzione anticipata</li>
      <li>Effettuare i pagamenti alle scadenze concordate</li>
    </ul>
  </div>

  <div class="section">
    <h2>ART. 5 - RECESSO</h2>
    <p>Il Cliente ha diritto di recedere dal contratto entro 14 giorni dalla ricezione del dispositivo, 
    senza dover fornire motivazioni. Il recesso deve essere comunicato via email certificata.</p>
    <p>In caso di recesso anticipato dopo i 14 giorni, il Cliente è tenuto a corrispondere 
    i canoni maturati fino alla data di restituzione del dispositivo.</p>
  </div>

  <div class="section">
    <h2>ART. 6 - PRIVACY E TRATTAMENTO DATI</h2>
    <p>Il trattamento dei dati personali e sanitari avviene in conformità al GDPR (Regolamento UE 2016/679). 
    I dati raccolti saranno utilizzati esclusivamente per l'erogazione del servizio e non saranno 
    ceduti a terzi senza consenso esplicito.</p>
  </div>

  <div class="signature-section">
    <h2 style="text-align: center;">SOTTOSCRIZIONE DEL CONTRATTO</h2>
    <p style="text-align: center;">Le parti, letto e compreso il presente contratto, 
    lo sottoscrivono per accettazione.</p>
    
    <div class="signature-box">
      <p><strong>IL FORNITORE</strong></p>
      <p>{{AZIENDA_RAGIONE_SOCIALE}}</p>
      <div class="signature-line">
        Firma Legale Rappresentante
      </div>
    </div>
    
    <div class="signature-box">
      <p><strong>IL CLIENTE</strong></p>
      <p>{{NOME_RICHIEDENTE}} {{COGNOME_RICHIEDENTE}}</p>
      <div class="signature-line">
        Firma per Accettazione
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Contratto TeleMedCare Base - Codice: {{CODICE_CONTRATTO}}</p>
    <p>Medica GB S.r.l. - P.IVA 12345678901 - www.telemedcare.it - info@telemedcare.it</p>
    <p>Documento generato elettronicamente - {{ANNO}}</p>
  </div>
</body>
</html>`
  }
  
  /**
   * Template HTML contratto AVANZATO - NUOVO: carica da file B2C
   */
  private static getContractTemplateAvanzato(): string {
    try {
      // Prova a caricare template AVANZATO B2C da file
      const templatePath = path.join(process.cwd(), 'templates', 'contracts', 'contratto_ecura_avanzato_b2c.html')
      if (fs.existsSync(templatePath)) {
        return fs.readFileSync(templatePath, 'utf-8')
      }
      console.warn('⚠️ Template AVANZATO B2C non trovato, uso fallback inline')
    } catch (error) {
      console.error('❌ Errore caricamento template AVANZATO:', error)
    }
    
    // Fallback: simile al Base ma con servizi aggiuntivi
    const baseTemplate = this.getContractTemplateBase()
    return baseTemplate
      .replace('TELEMEDCARE BASE', 'TELEMEDCARE AVANZATO')
      .replace(
        '<li>Supporto tecnico telefonico (ore ufficio)</li>',
        `<li>Supporto tecnico H24/7 con priorità alta</li>
         <li>Consulenza specialistica mensile inclusa</li>
         <li>Centrale operativa di monitoraggio attiva H24</li>
         <li>Report mensili personalizzati</li>`
      )
  }
  
  /**
   * Genera codice contratto univoco
   */
  private static generateContractCode(): string {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `TMC-${year}${month}-${random}`
  }
  
  /**
   * Genera DOCX usando script Python (solo in sviluppo locale)
   * In produzione, questo metodo genererà un PDF semplice come fallback
   */
  private static async generatePDFFromDOCX(data: ContractData): Promise<Uint8Array> {
    // Ottieni configurazioni servizio e piano
    const servizioConfig = getServizioConfig(data.servizio || 'PRO')
    const pianoConfig = getPianoConfig(data.tipoServizio)
    
    // Calcola date
    const oggi = new Date()
    const dataInizio = new Date(oggi)
    const dataScadenza = new Date(oggi)
    dataScadenza.setMonth(dataScadenza.getMonth() + (data.durataContratto || 12))
    
    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }
    
    // Prepara dati per template DOCX
    const placeholders = {
      NOME_ASSISTITO: data.nomeAssistito || data.nomeRichiedente,
      COGNOME_ASSISTITO: data.cognomeAssistito || data.cognomeRichiedente,
      LUOGO_NASCITA: data.luogoNascita || 'DA COMPLETARE',
      DATA_NASCITA: data.dataNascita || 'DA COMPLETARE',
      INDIRIZZO_ASSISTITO: data.indirizzoAssistito || 'DA COMPLETARE',
      CAP_ASSISTITO: data.capAssistito || 'DA COMPLETARE',
      CITTA_ASSISTITO: data.cittaAssistito || 'DA COMPLETARE',
      PROVINCIA_ASSISTITO: data.provinciaAssistito || 'DA COMPLETARE',
      CODICE_FISCALE_ASSISTITO: data.codiceFiscaleAssistito || 'DA COMPLETARE',
      TELEFONO_ASSISTITO: data.telefono || 'DA COMPLETARE',
      EMAIL_ASSISTITO: data.email,
      Servizio: servizioConfig.nomeCompleto,
      Dispositivo: servizioConfig.dispositivo,
      Piano: pianoConfig.nomeCompleto,
      DATA_INIZIO_SERVIZIO: formatDate(dataInizio),
      DATA_SCADENZA: formatDate(dataScadenza),
      DATA_CONTRATTO: formatDate(oggi),
      IMPORTO_PRIMO_ANNO: data.prezzoTotale.toFixed(2),
      IMPORTO_ANNI_SUCCESSIVI: (data.prezzoMensile * 12).toFixed(2)
    }
    
    console.log('📄 [CONTRACT] Generazione DOCX da template...')
    console.log('   Servizio:', placeholders.Servizio)
    console.log('   Dispositivo:', placeholders.Dispositivo)
    console.log('   Piano:', placeholders.Piano.substring(0, 50) + '...')
    
    // Per ora, genera un PDF semplice come fallback
    // TODO: Implementare generazione DOCX reale in produzione
    return this.generateSimplePDF(data, placeholders)
  }
  
  /**
   * Genera PDF semplice come fallback
   */
  private static generateSimplePDF(data: ContractData, placeholders: any): Uint8Array {
    console.log('📄 [CONTRACT] Generazione PDF semplice (fallback)...')
    
    const pdfContent = `
CONTRATTO TELEMEDCARE

Codice Contratto: ${data.codiceContratto}
Data: ${data.dataContratto}

CLIENTE:
${placeholders.NOME_ASSISTITO} ${placeholders.COGNOME_ASSISTITO}
Email: ${placeholders.EMAIL_ASSISTITO}
Telefono: ${placeholders.TELEFONO_ASSISTITO}

SERVIZIO:
${placeholders.Servizio}
Dispositivo: ${placeholders.Dispositivo}
Piano: ${placeholders.Piano}

CONDIZIONI ECONOMICHE:
Primo anno: €${placeholders.IMPORTO_PRIMO_ANNO}
Anni successivi: €${placeholders.IMPORTO_ANNI_SUCCESSIVI}
Durata: ${data.durataContratto} mesi
Da: ${placeholders.DATA_INIZIO_SERVIZIO}
A: ${placeholders.DATA_SCADENZA}

Il presente contratto è stato generato automaticamente.

----
Medica GB S.r.l.
www.ecura.it
`
    
    // Crea PDF molto semplice
    const pdfHeader = '%PDF-1.4\n'
    const pdfBody = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length ${pdfContent.length + 50} >>\nstream\nBT\n/F1 10 Tf\n50 750 Td\n`
    const pdfLines = pdfContent.split('\n').map((line, i) => `(${line.replace(/[()\\]/g, '\\$&')}) Tj\n0 -12 Td\n`).join('')
    const pdfFooter = `ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000300 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${(pdfHeader + pdfBody + pdfLines + pdfFooter).length - 50}\n%%EOF\n`
    
    const fullPdf = pdfHeader + pdfBody + pdfLines + 'ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000300 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n500\n%%EOF\n'
    
    return new Uint8Array(Buffer.from(fullPdf, 'utf-8'))
  }
  
  /**
   * Invia contratto via email
   */
  static async sendContractEmail(
    contractId: string,
    db: any,
    env?: any
  ): Promise<{ success: boolean; error?: string }> {
    
    try {
      // Recupera contratto
      const contract = await db.prepare(`
        SELECT c.*, l.email, l.nomeRichiedente, l.tipoServizio
        FROM contracts c
        JOIN leads l ON c.leadId = l.id
        WHERE c.id = ?
      `).bind(contractId).first()
      
      if (!contract) {
        throw new Error('Contratto non trovato')
      }
      
      console.log('📧 [CONTRACT] Invio contratto via email:', contract.email)
      
      // Importa EmailService dinamicamente
      const EmailService = (await import('./email-service')).default
      const emailService = EmailService.getInstance()
      
      // Prepara variabili
      const variables = {
        NOME_CLIENTE: contract.nomeRichiedente || 'Cliente',
        PIANO_SERVIZIO: contract.tipoServizio === 'AVANZATO' ? 'TeleMedCare Avanzato' : 'TeleMedCare Base',
        PREZZO_PIANO: `€${contract.prezzo_totale || 0}`,
        CODICE_CLIENTE: contract.leadId,
        LINK_FIRMA: `https://app.telemedcare.it/firma/${contractId}`
      }
      
      // Invia email (per ora senza allegato PDF)
      const result = await emailService.sendTemplateEmail(
        'INVIO_CONTRATTO',
        contract.email,
        variables,
        undefined,
        env
      )
      
      if (result.success) {
        // Aggiorna status contratto
        await db.prepare(`
          UPDATE contracts 
          SET status = 'SENT', data_invio = datetime('now'), updated_at = datetime('now')
          WHERE id = ?
        `).bind(contractId).run()
        
        // Aggiorna status lead
        await db.prepare(`
          UPDATE leads 
          SET status = 'contract_sent', updated_at = datetime('now')
          WHERE id = ?
        `).bind(contract.leadId).run()
        
        console.log('✅ [CONTRACT] Email contratto inviata')
      }
      
      return result
      
    } catch (error) {
      console.error('❌ [CONTRACT] Errore invio email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore invio'
      }
    }
  }
  
  /**
   * Genera PDF dal template HTML completo
   * Converte HTML in PDF embedando l'HTML in una struttura PDF
   */
  private static generatePDFFromHTML(htmlContent: string, data: ContractData): Uint8Array {
    // IMPORTANTE: Cloudflare Workers non supporta Puppeteer
    // Generiamo un PDF con il contenuto completo del contratto
    // che include tutti i dati essenziali dal template HTML
    
    const textContent = this.generatePDFTextContent(data)
    
    // Genera PDF strutturato
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
/F2 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length ${textContent.length}
>>
stream
${textContent}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000320 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${420 + textContent.length}
%%EOF`
    
    return new TextEncoder().encode(pdfContent)
  }
  
  /**
   * Genera contenuto PDF completo dal template (senza HTML rendering)
   */
  private static generatePDFTextContent(data: ContractData): string {
    const dispositivo = data.servizio === 'FAMILY' 
      ? 'Senium' 
      : data.servizio === 'PREMIUM' 
        ? 'SiDLY Vital Care' 
        : 'SiDLY Care PRO'
    
    // Genera contenuto PDF più ricco usando il template HTML
    return `BT
/F2 20 Tf
50 750 Td
(CONTRATTO DI SERVIZIO eCura) Tj
0 -25 Td
/F2 16 Tf
(${data.servizio || 'PRO'} - Piano ${data.tipoServizio}) Tj
0 -40 Td
/F1 11 Tf
(Codice Contratto: ${data.codiceContratto || 'N/A'}) Tj
0 -18 Td
(Data: ${data.dataContratto || new Date().toLocaleDateString('it-IT')}) Tj
0 -40 Td
/F2 14 Tf
(DATI CLIENTE) Tj
0 -25 Td
/F1 11 Tf
(Nome Completo: ${data.nomeRichiedente} ${data.cognomeRichiedente}) Tj
0 -18 Td
(Email: ${data.email}) Tj
0 -18 Td
(Telefono: ${data.telefono}) Tj
0 -18 Td
(Assistito: ${data.nomeAssistito || data.nomeRichiedente} ${data.cognomeAssistito || data.cognomeRichiedente}) Tj
0 -18 Td
(Eta Assistito: ${data.etaAssistito || 'Non specificata'} anni) Tj
0 -40 Td
/F2 14 Tf
(SERVIZIO E DISPOSITIVO) Tj
0 -25 Td
/F1 11 Tf
(Servizio: eCura ${data.servizio || 'PRO'}) Tj
0 -18 Td
(Piano: ${data.tipoServizio}) Tj
0 -18 Td
(Dispositivo: ${dispositivo}) Tj
0 -18 Td
(Durata Contratto: ${data.durataContratto} mesi) Tj
0 -40 Td
/F2 14 Tf
(CONDIZIONI ECONOMICHE) Tj
0 -25 Td
/F1 11 Tf
(Canone Mensile: EUR ${data.prezzoMensile.toFixed(2)}) Tj
0 -18 Td
(Totale Contratto \\(${data.durataContratto} mesi\\): EUR ${data.prezzoTotale.toFixed(2)}) Tj
0 -18 Td
(IVA Inclusa: 22%) Tj
0 -40 Td
/F2 14 Tf
(TERMINI E CONDIZIONI) Tj
0 -25 Td
/F1 10 Tf
(1. OGGETTO: Fornitura dispositivo ${dispositivo} per il monitoraggio) Tj
0 -15 Td
(   remoto della salute e assistenza 24/7.) Tj
0 -20 Td
(2. CONSEGNA: Dispositivo consegnato entro 7 giorni lavorativi) Tj
0 -15 Td
(   all'indirizzo indicato dal cliente.) Tj
0 -20 Td
(3. ATTIVAZIONE: Servizio attivo entro 24 ore dalla consegna) Tj
0 -15 Td
(   con assistenza tecnica per la configurazione.) Tj
0 -20 Td
(4. ASSISTENZA: Supporto tecnico e sanitario disponibile 24/7) Tj
0 -15 Td
(   tramite numero verde dedicato.) Tj
0 -20 Td
(5. GARANZIA: Dispositivo coperto da garanzia 24 mesi del) Tj
0 -15 Td
(   produttore con sostituzione gratuita in caso di guasto.) Tj
0 -20 Td
(6. RECESSO: Diritto di recesso entro 14 giorni dalla consegna) Tj
0 -15 Td
(   con restituzione dispositivo nelle condizioni originali.) Tj
0 -20 Td
(7. PRIVACY: Trattamento dati secondo GDPR \\(UE 2016/679\\).) Tj
0 -15 Td
(   Informativa completa su www.telemedcare.it/privacy) Tj
0 -40 Td
/F2 12 Tf
(MODALITA DI FIRMA) Tj
0 -25 Td
/F1 10 Tf
(Il presente contratto sara firmato digitalmente tramite DocuSign.) Tj
0 -15 Td
(Ricevera un'email con il link per la firma elettronica.) Tj
0 -30 Td
/F1 9 Tf
(Documento generato automaticamente da eCura - TeleMedCare V12.0) Tj
0 -15 Td
(Per informazioni: info@telemedcare.it | Tel: 800 123 456) Tj
0 -15 Td
(www.telemedcare.it) Tj
ET`
  }
  
  /**
   * Genera PDF semplice ma valido con contenuto contratto
   */
  private static generateSimplePDF(data: ContractData): Uint8Array {
    // Genera contenuto testuale del contratto
    const content = this.generatePDFTextContent(data)
    
    // Crea struttura PDF base valida
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length ${content.length}
>>
stream
${content}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${370 + content.length}
%%EOF`
    
    return new TextEncoder().encode(pdfContent)
  }
}


export default ContractGenerator
