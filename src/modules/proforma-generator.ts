/**
 * PROFORMA-GENERATOR.TS - Generatore Proforma/Fattura PDF
 * eCura V11.0 - Invoice Generation
 * 
 * Genera proforma (fattura proforma) dopo firma contratto
 * Include link pagamento Stripe
 * 
 * WORKFLOW:
 * 1. Contratto firmato → genera proforma
 * 2. Proforma con dettagli servizio + prezzo
 * 3. Include link pagamento Stripe
 * 4. Invia via email al cliente
 */

import { TemplateEngine } from './email-service'
import { getPricing, formatServiceName } from './ecura-pricing'

export interface ProformaData {
  // Dati proforma
  numeroProforma: string
  dataEmissione: string
  dataScadenza: string
  
  // Cliente
  nomeCliente: string
  cognomeCliente: string
  emailCliente: string
  telefonoCliente?: string
  indirizzoCliente?: string
  codiceFiscaleCliente?: string
  
  // Servizio eCura
  servizio: 'FAMILY' | 'PRO' | 'PREMIUM'
  piano: 'BASE' | 'AVANZATO'
  descrizioneServizio: string
  dispositivo: string
  
  // Prezzi
  importoBase: number
  iva: number
  totale: number
  
  // Contratto collegato
  codiceContratto: string
  
  // Pagamento
  linkPagamentoStripe?: string
  scadenzaPagamento: string
}

export interface ProformaGenerated {
  proformaId: string
  numeroProforma: string
  pdfUrl?: string
  pdfBase64?: string
  createdAt: string
}

/**
 * Proforma Generator - Genera proforma PDF
 */
export class ProformaGenerator {
  
  /**
   * Genera proforma completa (ASYNC per template loading)
   */
  static async generateProforma(
    data: ProformaData,
    db: any
  ): Promise<{ success: boolean; proforma?: ProformaGenerated; error?: string }> {
    
    try {
      console.log('📄 [PROFORMA] Generazione proforma per contratto:', data.codiceContratto)
      console.log('📄 [PROFORMA] Piano:', data.piano, '| Servizio:', data.servizio)
      
      // 1. Genera numero proforma univoco
      const numeroProforma = this.generateProformaNumber()
      const proformaId = `PROF_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      
      // 2. Prepara dati completi
      const proformaData: ProformaData = {
        ...data,
        numeroProforma,
        dataEmissione: data.dataEmissione || new Date().toLocaleDateString('it-IT'),
        dataScadenza: data.dataScadenza || this.calculateScadenza(7) // 7 giorni
      }
      
      // 3. Genera HTML proforma (AWAIT async template loading)
      const proformaHtml = await this.generateProformaHTML(proformaData)
      
      // 4. Converti in PDF (per ora base64 HTML)
      // TODO: Usare Puppeteer/Chromium in produzione
      const pdfBase64 = Buffer.from(proformaHtml).toString('base64')
      
      // 5. Salva in database
      await db.prepare(`
        INSERT INTO proformas (
          id, numero_proforma, contract_code, servizio, piano,
          importo_base, iva, totale, status,
          pdf_url, stripe_payment_link, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(
        proformaId,
        numeroProforma,
        data.codiceContratto,
        data.servizio,
        data.piano,
        data.importoBase,
        data.iva,
        data.totale,
        'pending',
        `/proformas/${numeroProforma}.pdf`,
        data.linkPagamentoStripe || null
      ).run()
      
      console.log(`✅ [PROFORMA] Proforma generata: ${numeroProforma} (${data.piano})`)
      
      return {
        success: true,
        proforma: {
          proformaId,
          numeroProforma,
          pdfBase64,
          pdfUrl: `/proformas/${numeroProforma}.pdf`,
          createdAt: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('❌ [PROFORMA] Errore generazione:', error)
      return {
        success: false,
        error: String(error)
      }
    }
  }
  
  /**
   * Genera numero proforma univoco
   * Formato: PF-YYYYMM-XXXXXX (es. PF-202512-ABC123)
   */
  private static generateProformaNumber(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    return `PF-${year}${month}-${random}`
  }
  
  /**
   * Calcola data scadenza
   */
  private static calculateScadenza(giorni: number): string {
    const scadenza = new Date()
    scadenza.setDate(scadenza.getDate() + giorni)
    return scadenza.toLocaleDateString('it-IT')
  }
  
  /**
   * Genera HTML proforma da template reali (BASE o AVANZATO)
   * Carica da templates/proformas/proforma_base.html o proforma_avanzato.html
   */
  private static async generateProformaHTML(data: ProformaData): Promise<string> {
    // Sceglie template in base al piano
    const templatePath = data.piano === 'AVANZATO' 
      ? 'templates/proformas/proforma_avanzato.html'
      : 'templates/proformas/proforma_base.html'
    
    // TODO: In produzione, caricare template da file con fs.readFileSync
    // Per ora usa template inline (o carica dal DB)
    const template = this.getProformaTemplate(data.piano)
    
    // Mappa variabili per i template reali
    const variables = {
      // Numero e date
      NUMERO_PROFORMA: data.numeroProforma,
      DATA_PROFORMA: data.dataEmissione,
      DATA_GENERAZIONE: new Date().toLocaleDateString('it-IT'),
      DATA_SCADENZA: data.dataScadenza,
      
      // Cliente (formato unificato per template)
      NOME_COGNOME_CLIENTE: `${data.nomeCliente} ${data.cognomeCliente}`,
      CODICE_CLIENTE: data.codiceContratto.substring(0, 12), // Prime 12 caratteri
      INDIRIZZO_CLIENTE: data.indirizzoCliente || 'DA COMPLETARE',
      CITTA_CAP_CLIENTE: '', // TODO: Estrarre da indirizzo o form
      CODICE_FISCALE_CLIENTE: data.codiceFiscaleCliente || 'DA COMPLETARE',
      EMAIL_CLIENTE: data.emailCliente,
      TELEFONO_CLIENTE: data.telefonoCliente || 'Non specificato',
      
      // Servizio
      DESCRIZIONE_SERVIZIO: data.descrizioneServizio,
      DISPOSITIVO: data.dispositivo,
      SERVIZIO_COMPLETO: formatServiceName(data.servizio, data.piano),
      
      // Prezzi (già formattati nei template, quindi no €)
      IMPORTO_BASE: data.importoBase.toFixed(2).replace('.', ','),
      IVA: data.iva.toFixed(2).replace('.', ','),
      TOTALE: data.totale.toFixed(2).replace('.', ','),
      
      // Pagamento
      LINK_PAGAMENTO: data.linkPagamentoStripe || 'mailto:info@medicagb.it',
      IBAN_AZIENDALE: 'IT00 X000 0000 0000 0000 0000 000', // TODO: IBAN reale
      
      // Metadati
      CODICE_CONTRATTO: data.codiceContratto,
      ANNO: new Date().getFullYear().toString()
    }
    
    return TemplateEngine.render(template, variables)
  }
  
  /**
   * Template HTML proforma BASE o AVANZATO
   * Carica template reali da templates/proformas/
   */
  private static getProformaTemplate(piano: 'BASE' | 'AVANZATO'): string {
    // TODO: In produzione, caricare con fs.readFileSync(templatePath, 'utf-8')
    // Per ora restituiamo template inline minimale
    return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proforma {{NUMERO_PROFORMA}} - eCura</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      color: #3b82f6;
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .proforma-title {
      font-size: 24px;
      color: #3b82f6;
      margin: 20px 0;
      text-align: center;
    }
    .info-box {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .table th,
    .table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    .table th {
      background: #f3f4f6;
      font-weight: bold;
    }
    .total-box {
      background: linear-gradient(135deg, #f8faff 0%, #e8f2ff 100%);
      border: 2px solid #3b82f6;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      text-align: right;
    }
    .total-box .amount {
      font-size: 32px;
      font-weight: bold;
      color: #3b82f6;
    }
    .payment-button {
      display: inline-block;
      background: #22c55e;
      color: white;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .payment-button:hover {
      background: #16a34a;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🏥 eCura - Medica GB S.r.l.</div>
    <div style="font-size: 14px; color: #666;">
      Startup Innovativa a Vocazione Sociale<br>
      P.IVA: 12435130963 | Reg. Imprese Milano<br>
      Corso Garibaldi 34, 20121 Milano
    </div>
  </div>

  <h1 class="proforma-title">📄 PROFORMA / FATTURA PROFORMA</h1>
  
  <div class="info-box">
    <table style="width: 100%;">
      <tr>
        <td><strong>Numero Proforma:</strong></td>
        <td>{{NUMERO_PROFORMA}}</td>
      </tr>
      <tr>
        <td><strong>Data Emissione:</strong></td>
        <td>{{DATA_EMISSIONE}}</td>
      </tr>
      <tr>
        <td><strong>Scadenza Pagamento:</strong></td>
        <td>{{DATA_SCADENZA}}</td>
      </tr>
      <tr>
        <td><strong>Contratto Collegato:</strong></td>
        <td>{{CODICE_CONTRATTO}}</td>
      </tr>
    </table>
  </div>

  <div class="info-box">
    <h3 style="margin-top: 0; color: #3b82f6;">👤 CLIENTE</h3>
    <p>
      <strong>Nome e Cognome:</strong> {{NOME_CLIENTE}} {{COGNOME_CLIENTE}}<br>
      <strong>Email:</strong> {{EMAIL_CLIENTE}}<br>
      <strong>Telefono:</strong> {{TELEFONO_CLIENTE}}<br>
      <strong>Indirizzo:</strong> {{INDIRIZZO_CLIENTE}}<br>
      <strong>Codice Fiscale:</strong> {{CODICE_FISCALE}}
    </p>
  </div>

  <h3 style="color: #3b82f6;">📦 SERVIZI</h3>
  <table class="table">
    <thead>
      <tr>
        <th>Descrizione</th>
        <th>Quantità</th>
        <th style="text-align: right;">Importo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>{{SERVIZIO_COMPLETO}}</strong><br>
          <small>{{DESCRIZIONE_SERVIZIO}}</small><br>
          <small>Dispositivo: {{DISPOSITIVO}}</small><br>
          <small>Durata: 12 mesi (primo anno)</small>
        </td>
        <td>1</td>
        <td style="text-align: right;">{{IMPORTO_BASE}}</td>
      </tr>
    </tbody>
  </table>

  <div class="total-box">
    <table style="width: 100%;">
      <tr>
        <td><strong>Imponibile:</strong></td>
        <td style="text-align: right;">{{IMPORTO_BASE}}</td>
      </tr>
      <tr>
        <td><strong>IVA 22%:</strong></td>
        <td style="text-align: right;">{{IVA}}</td>
      </tr>
      <tr style="border-top: 2px solid #3b82f6;">
        <td><strong style="font-size: 18px;">TOTALE DA PAGARE:</strong></td>
        <td style="text-align: right;">
          <div class="amount">{{TOTALE}}</div>
        </td>
      </tr>
    </table>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <h3 style="color: #3b82f6;">💳 PROCEDI AL PAGAMENTO</h3>
    <p>Paga in modo sicuro con carta di credito/debito o bonifico bancario</p>
    <a href="{{LINK_PAGAMENTO}}" class="payment-button">
      💳 PAGA ORA €{{TOTALE}}
    </a>
    <p style="font-size: 14px; color: #666;">
      🔒 Pagamento sicuro tramite Stripe<br>
      ⏰ Scadenza: {{SCADENZA_PAGAMENTO}}
    </p>
  </div>

  <div class="info-box">
    <h4 style="margin-top: 0; color: #3b82f6;">📋 MODALITÀ DI PAGAMENTO</h4>
    <p><strong>1. Pagamento Online (Consigliato):</strong><br>
    Clicca sul pulsante "PAGA ORA" e completa il pagamento con carta di credito/debito in modo sicuro tramite Stripe.</p>
    
    <p><strong>2. Bonifico Bancario:</strong><br>
    IBAN: <strong>IT00 X000 0000 0000 0000 0000 000</strong><br>
    Intestato a: <strong>Medica GB S.r.l.</strong><br>
    Causale: <strong>Proforma {{NUMERO_PROFORMA}}</strong></p>
    
    <p style="font-size: 12px; color: #666;">
    ⚠️ In caso di bonifico, inviare ricevuta a info@telemedcare.it per conferma pagamento
    </p>
  </div>

  <div class="info-box" style="background: #fef3c7; border-left: 4px solid #f59e0b;">
    <h4 style="margin-top: 0; color: #92400e;">💰 DETRAZIONE FISCALE 19%</h4>
    <p>Il servizio eCura è detraibile come spesa sanitaria nella dichiarazione dei redditi (730/Unico).</p>
    <p><strong>Risparmio fiscale stimato:</strong> Fino a {{IVA}} di detrazione annuale</p>
    <p style="font-size: 12px;">Riceverai tutta la documentazione necessaria per il 730</p>
  </div>

  <div class="footer">
    <p><strong style="color: #3b82f6; font-size: 14px;">Contatti Medica GB S.r.l. - eCura</strong></p>
    <p>
      📧 Email: <a href="mailto:info@telemedcare.it">info@telemedcare.it</a> | 
      📞 Telefono: 02 8715 6826 | 
      📱 Assistenza: 335 730 1206
    </p>
    <p>
      🏢 Milano: Corso Garibaldi 34, 20121 | 
      🏢 Genova: Via delle Eriche 53, 16148
    </p>
    <p>
      🌐 Web: <a href="https://www.ecura.it">www.ecura.it</a>
    </p>
    <p style="margin-top: 15px; font-size: 11px; font-style: italic;">
      Medica GB S.r.l. - P.IVA 12435130963 | Reg. Imprese Milano | Cap. Soc. €10.000 i.v.<br>
      Questa è una proforma. Dopo il pagamento riceverai la fattura definitiva.
    </p>
  </div>
</body>
</html>`
  }
}

/**
 * Helper: Crea proforma da contratto e pricing
 */
export async function createProformaFromContract(
  contractCode: string,
  nomeCliente: string,
  cognomeCliente: string,
  emailCliente: string,
  servizio: 'FAMILY' | 'PRO' | 'PREMIUM',
  piano: 'BASE' | 'AVANZATO',
  stripeLinkPayment?: string
): Promise<ProformaData> {
  
  const pricing = getPricing(servizio, piano)
  
  if (!pricing) {
    throw new Error(`Pricing non trovato per ${servizio} ${piano}`)
  }
  
  return {
    numeroProforma: '', // Generato automaticamente
    dataEmissione: new Date().toLocaleDateString('it-IT'),
    dataScadenza: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT'),
    
    nomeCliente,
    cognomeCliente,
    emailCliente,
    
    servizio,
    piano,
    descrizioneServizio: `Servizio eCura ${formatServiceName(servizio, piano)} - Primo Anno`,
    dispositivo: pricing.dispositivo,
    
    importoBase: pricing.setupBase,
    iva: pricing.setupIva,
    totale: pricing.setupTotale,
    
    codiceContratto: contractCode,
    linkPagamentoStripe: stripeLinkPayment,
    scadenzaPagamento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT')
  }
}

export default ProformaGenerator
