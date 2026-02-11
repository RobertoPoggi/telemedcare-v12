/**
 * CONTRACT PDF GENERATOR - TeleMedCare V12.0
 * Genera contratti PDF da template HTML usando Puppeteer (Cloudflare Workers compatible)
 * 
 * TECNOLOGIA:
 * - Template HTML con placeholder {{VARIABLE}}
 * - Puppeteer per HTML → PDF (@cloudflare/puppeteer)
 * - Base64 encoding per allegati email
 */

import puppeteer from '@cloudflare/puppeteer'
import { getPricing, type ServizioeCura, type PianoeCura } from './ecura-pricing'

export interface ContractPDFData {
  // Dati anagrafici assistito
  nomeAssistito: string
  cognomeAssistito: string
  luogoNascita: string
  dataNascita: string  // formato: DD/MM/YYYY
  indirizzoAssistito: string
  capAssistito: string
  cittaAssistito: string
  provinciaAssistito: string
  cfAssistito: string
  telefonoAssistito: string
  emailAssistito: string
  
  // Servizio e Piano
  servizio: ServizioeCura  // 'PRO' | 'FAMILY' | 'PREMIUM'
  piano: PianoeCura  // 'BASE' | 'AVANZATO'
  
  // Date
  dataInizioServizio: string  // formato: DD/MM/YYYY
  dataScadenza: string  // formato: DD/MM/YYYY
  dataContratto: string  // formato: DD/MM/YYYY
  
  // Prezzi (calcolati automaticamente da getPricing)
  importoPrimoAnno: number
  importoAnniSuccessivi: number
  
  // Codice contratto
  codiceContratto: string
}

/**
 * Template HTML contratto con placeholder
 */
const CONTRACT_HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contratto eCura - {{CODICE_CONTRATTO}}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #333;
      margin: 0;
      padding: 0;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #1e40af;
      padding-bottom: 15px;
    }
    
    .header h1 {
      color: #1e40af;
      font-size: 18pt;
      margin: 0 0 10px 0;
    }
    
    .header .company {
      font-size: 11pt;
      font-weight: bold;
      margin: 5px 0;
    }
    
    .header .subtitle {
      font-size: 9pt;
      color: #666;
    }
    
    .contract-info {
      background: #f0f9ff;
      border: 1px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    
    .contract-info h3 {
      color: #1e40af;
      margin: 0 0 10px 0;
      font-size: 12pt;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 9pt;
    }
    
    .info-item {
      padding: 5px 0;
    }
    
    .info-item strong {
      color: #1e40af;
    }
    
    .section {
      margin: 20px 0;
    }
    
    .section h2 {
      color: #1e40af;
      font-size: 13pt;
      margin: 15px 0 10px 0;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 5px;
    }
    
    .section p {
      text-align: justify;
      margin: 10px 0;
    }
    
    .highlight {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 10px 15px;
      margin: 15px 0;
    }
    
    .price-box {
      background: #ecfdf5;
      border: 2px solid #22c55e;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
      text-align: center;
    }
    
    .price-box h3 {
      color: #16a34a;
      margin: 0 0 10px 0;
    }
    
    .price-box .amount {
      font-size: 18pt;
      font-weight: bold;
      color: #16a34a;
    }
    
    .signatures {
      margin-top: 50px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    
    .signature-box {
      text-align: center;
    }
    
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 60px;
      padding-top: 10px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      font-size: 8pt;
      text-align: center;
      color: #666;
    }
    
    ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    
    li {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  
  <!-- HEADER -->
  <div class="header">
    <h1>CONTRATTO DI SERVIZIO eCura</h1>
    <div class="company">Medica GB S.r.l.</div>
    <div class="subtitle">Startup Innovativa a Vocazione Sociale</div>
    <div class="subtitle">"La tecnologia che Le salva salute e vita"</div>
  </div>
  
  <!-- CONTRACT INFO BOX -->
  <div class="contract-info">
    <h3>📋 Informazioni Contratto</h3>
    <div class="info-grid">
      <div class="info-item"><strong>Codice Contratto:</strong> {{CODICE_CONTRATTO}}</div>
      <div class="info-item"><strong>Data:</strong> {{DATA_CONTRATTO}}</div>
      <div class="info-item"><strong>Servizio:</strong> {{SERVIZIO}}</div>
      <div class="info-item"><strong>Piano:</strong> {{PIANO}}</div>
      <div class="info-item"><strong>Inizio Servizio:</strong> {{DATA_INIZIO_SERVIZIO}}</div>
      <div class="info-item"><strong>Scadenza:</strong> {{DATA_SCADENZA}}</div>
    </div>
  </div>
  
  <!-- DATI ASSISTITO -->
  <div class="section">
    <h2>1. DATI ASSISTITO</h2>
    <div class="info-grid">
      <div class="info-item"><strong>Nome e Cognome:</strong> {{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}}</div>
      <div class="info-item"><strong>Data di Nascita:</strong> {{DATA_NASCITA}}</div>
      <div class="info-item"><strong>Luogo di Nascita:</strong> {{LUOGO_NASCITA}}</div>
      <div class="info-item"><strong>Codice Fiscale:</strong> {{CODICE_FISCALE_ASSISTITO}}</div>
      <div class="info-item"><strong>Indirizzo:</strong> {{INDIRIZZO_ASSISTITO}}</div>
      <div class="info-item"><strong>CAP e Città:</strong> {{CAP_ASSISTITO}} {{CITTA_ASSISTITO}} ({{PROVINCIA_ASSISTITO}})</div>
      <div class="info-item"><strong>Telefono:</strong> {{TELEFONO_ASSISTITO}}</div>
      <div class="info-item"><strong>Email:</strong> {{EMAIL_ASSISTITO}}</div>
    </div>
  </div>
  
  <!-- OGGETTO DEL CONTRATTO -->
  <div class="section">
    <h2>2. OGGETTO DEL CONTRATTO</h2>
    <p>
      Il presente contratto regolamenta l'erogazione del servizio di <strong>telemedicina e teleassistenza domiciliare {{SERVIZIO}}</strong> 
      con piano <strong>{{PIANO}}</strong>, comprensivo di:
    </p>
    <ul>
      <li>Dispositivo medicale certificato (Classe IIa)</li>
      <li>Monitoraggio parametri vitali h24</li>
      <li>Assistenza remota da centrale operativa</li>
      <li>Servizi di emergenza e supporto</li>
      <li>Accesso a dashboard famiglia per monitoraggio</li>
    </ul>
  </div>
  
  <!-- CONDIZIONI ECONOMICHE -->
  <div class="section">
    <h2>3. CONDIZIONI ECONOMICHE</h2>
    <div class="price-box">
      <h3>💰 Investimento Primo Anno</h3>
      <div class="amount">€ {{IMPORTO_PRIMO_ANNO}}</div>
      <p style="margin: 5px 0 0 0; font-size: 9pt;">Include dispositivo, installazione e servizio annuale</p>
    </div>
    
    <div class="price-box" style="background: #f8fafc; border-color: #64748b;">
      <h3 style="color: #475569;">🔄 Rinnovo Anni Successivi</h3>
      <div class="amount" style="color: #475569;">€ {{IMPORTO_ANNI_SUCCESSIVI}}</div>
      <p style="margin: 5px 0 0 0; font-size: 9pt;">Solo servizio di telemedicina annuale</p>
    </div>
    
    <div class="highlight">
      <strong>✅ Vantaggi Fiscali:</strong>
      <ul style="margin: 5px 0;">
        <li><strong>Detrazione 19%</strong> come spesa sanitaria nel modello 730</li>
        <li><strong>Possibili rimborsi INPS</strong> per ISEE sotto €6.000 con Legge 104</li>
      </ul>
    </div>
  </div>
  
  <!-- DURATA E RINNOVO -->
  <div class="section">
    <h2>4. DURATA E RINNOVO</h2>
    <p>
      Il contratto ha durata di <strong>12 mesi</strong> con decorrenza dalla data di attivazione del servizio.
      Il servizio si rinnova automaticamente salvo disdetta scritta da inviare almeno 30 giorni prima della scadenza.
    </p>
  </div>
  
  <!-- MODALITÀ DI PAGAMENTO -->
  <div class="section">
    <h2>5. MODALITÀ DI PAGAMENTO</h2>
    <p>
      Il pagamento può essere effettuato tramite:
    </p>
    <ul>
      <li>Bonifico bancario</li>
      <li>Carta di credito/debito</li>
      <li>PayPal</li>
    </ul>
    <p>
      Le coordinate bancarie e le istruzioni di pagamento verranno fornite separatamente via email.
    </p>
  </div>
  
  <!-- RECESSO -->
  <div class="section">
    <h2>6. DIRITTO DI RECESSO</h2>
    <p>
      Il Cliente ha diritto di recedere dal contratto entro <strong>14 giorni</strong> dalla sottoscrizione, 
      senza dover fornire alcuna motivazione e senza penalità, mediante comunicazione scritta a 
      <strong>info@medicagb.it</strong>.
    </p>
  </div>
  
  <!-- FIRME -->
  <div class="signatures">
    <div class="signature-box">
      <div><strong>Per l'Assistito</strong></div>
      <div class="signature-line">
        {{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}}
      </div>
    </div>
    <div class="signature-box">
      <div><strong>Per Medica GB S.r.l.</strong></div>
      <div class="signature-line">
        Il Legale Rappresentante
      </div>
    </div>
  </div>
  
  <!-- FOOTER -->
  <div class="footer">
    <p><strong>Medica GB S.r.l.</strong> - Startup Innovativa a Vocazione Sociale</p>
    <p>Milano: Corso Garibaldi 34, 20121 | Genova: Via delle Eriche 53, 16148</p>
    <p>P.IVA: 12435130963 | info@medicagb.it | www.medicagb.it</p>
  </div>
  
</body>
</html>
`

/**
 * Sostituisce i placeholder nel template HTML
 */
function replaceTemplateVariables(html: string, data: ContractPDFData): string {
  const variables: Record<string, string> = {
    CODICE_CONTRATTO: data.codiceContratto,
    DATA_CONTRATTO: data.dataContratto,
    SERVIZIO: data.servizio === 'PRO' ? 'eCura PRO' : 
              data.servizio === 'PREMIUM' ? 'eCura PREMIUM' : 
              'eCura Family',
    PIANO: data.piano === 'AVANZATO' ? 'Avanzato' : 'Base',
    DATA_INIZIO_SERVIZIO: data.dataInizioServizio,
    DATA_SCADENZA: data.dataScadenza,
    
    // Dati assistito
    NOME_ASSISTITO: data.nomeAssistito,
    COGNOME_ASSISTITO: data.cognomeAssistito,
    DATA_NASCITA: data.dataNascita,
    LUOGO_NASCITA: data.luogoNascita,
    CODICE_FISCALE_ASSISTITO: data.cfAssistito,
    INDIRIZZO_ASSISTITO: data.indirizzoAssistito,
    CAP_ASSISTITO: data.capAssistito,
    CITTA_ASSISTITO: data.cittaAssistito,
    PROVINCIA_ASSISTITO: data.provinciaAssistito,
    TELEFONO_ASSISTITO: data.telefonoAssistito,
    EMAIL_ASSISTITO: data.emailAssistito,
    
    // Prezzi
    IMPORTO_PRIMO_ANNO: data.importoPrimoAnno.toFixed(2),
    IMPORTO_ANNI_SUCCESSIVI: data.importoAnniSuccessivi.toFixed(2)
  }
  
  let result = html
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(placeholder, value)
  }
  
  return result
}

/**
 * Genera PDF del contratto e restituisce Base64
 */
export async function generateContractPDF(
  data: ContractPDFData,
  browser: any  // Cloudflare Puppeteer browser instance
): Promise<{ success: boolean; pdfBase64?: string; error?: string }> {
  
  try {
    console.log('📄 [CONTRACT_PDF] Generazione contratto:', data.codiceContratto)
    
    // 1. Sostituisci placeholder nel template
    const html = replaceTemplateVariables(CONTRACT_HTML_TEMPLATE, data)
    
    // 2. Genera PDF con Puppeteer
    console.log('🌐 [CONTRACT_PDF] Apertura browser Puppeteer...')
    const page = await browser.newPage()
    
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    console.log('📄 [CONTRACT_PDF] Generazione PDF...')
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    })
    
    await page.close()
    
    // 3. Converti in Base64
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')
    
    console.log(`✅ [CONTRACT_PDF] PDF generato: ${(pdfBase64.length / 1024).toFixed(2)} KB`)
    
    return {
      success: true,
      pdfBase64
    }
    
  } catch (error) {
    console.error('❌ [CONTRACT_PDF] Errore generazione PDF:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }
  }
}

/**
 * Prepara dati contratto da lead
 */
export function prepareContractData(
  lead: any,
  codiceContratto: string
): ContractPDFData | null {
  
  try {
    // Valida campi obbligatori
    if (!lead.nomeAssistito || !lead.cognomeAssistito) {
      console.error('❌ [CONTRACT_PDF] Dati assistito mancanti')
      return null
    }
    
    const servizio = (lead.servizio || 'PRO').replace('eCura ', '').toUpperCase() as ServizioeCura
    const piano = (lead.piano || 'BASE').toUpperCase() as PianoeCura
    
    // Ottieni prezzi
    const pricing = getPricing(servizio, piano)
    if (!pricing) {
      console.error(`❌ [CONTRACT_PDF] Pricing non trovato per ${servizio} ${piano}`)
      return null
    }
    
    // Date
    const today = new Date()
    const dataContratto = today.toLocaleDateString('it-IT')
    const dataInizio = today.toLocaleDateString('it-IT')
    const scadenza = new Date(today)
    scadenza.setFullYear(scadenza.getFullYear() + 1)
    const dataScadenza = scadenza.toLocaleDateString('it-IT')
    
    return {
      nomeAssistito: lead.nomeAssistito,
      cognomeAssistito: lead.cognomeAssistito,
      luogoNascita: lead.luogoNascita || 'Non specificato',
      dataNascita: lead.dataNascita || 'Non specificata',
      indirizzoAssistito: lead.indirizzoAssistito || 'Non specificato',
      capAssistito: lead.capAssistito || '00000',
      cittaAssistito: lead.cittaAssistito || 'Non specificata',
      provinciaAssistito: lead.provinciaAssistito || 'XX',
      cfAssistito: lead.cfAssistito || 'Non specificato',
      telefonoAssistito: lead.telefono || lead.telefono || 'Non specificato',
      emailAssistito: lead.email || lead.email || 'non-specificata@example.com',
      
      servizio,
      piano,
      
      dataContratto,
      dataInizioServizio: dataInizio,
      dataScadenza,
      
      importoPrimoAnno: pricing.setupTotale,
      importoAnniSuccessivi: pricing.rinnovo,
      
      codiceContratto
    }
    
  } catch (error) {
    console.error('❌ [CONTRACT_PDF] Errore preparazione dati:', error)
    return null
  }
}

export default {
  generateContractPDF,
  prepareContractData
}
