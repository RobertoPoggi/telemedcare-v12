/**
 * CONTRACT-GENERATOR.TS - Generatore Contratti PDF
 * TeleMedCare V11.0
 * 
 * Genera contratti PDF da template HTML
 * Compila campi variabili
 * Salva e invia via email
 */

import { TemplateEngine } from './email-service'

export interface ContractData {
  leadId: string
  nomeRichiedente: string
  cognomeRichiedente: string
  email: string
  telefono: string
  tipoServizio: 'BASE' | 'AVANZATO'
  
  // Dati assistito (se diversi)
  nomeAssistito?: string
  cognomeAssistito?: string
  etaAssistito?: number
  
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
    db: any
  ): Promise<{ success: boolean; contract?: ContractGenerated; error?: string }> {
    
    try {
      console.log('📄 [CONTRACT] Generazione contratto per:', data.leadId)
      
      // 1. Genera codice contratto unico
      const codiceContratto = this.generateContractCode()
      const contractId = `CONTR_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      
      // 2. Prepara dati completi
      const contractData: ContractData = {
        ...data,
        codiceContratto,
        dataContratto: new Date().toLocaleDateString('it-IT')
      }
      
      // 3. Genera HTML contratto
      const contractHtml = this.generateContractHTML(contractData)
      
      // 4. Per ora salviamo HTML (poi convertiremo in PDF)
      // In produzione: usare Puppeteer/Chromium per HTML→PDF
      const pdfBase64 = Buffer.from(contractHtml).toString('base64')
      
      // 5. Salva in database
      await db.prepare(`
        INSERT INTO contracts (
          id, leadId, codice_contratto, tipo_contratto,
          template_utilizzato, contenuto_html,
          prezzo_mensile, durata_mesi, prezzo_totale,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', datetime('now'), datetime('now'))
      `).bind(
        contractId,
        data.leadId,
        codiceContratto,
        data.tipoServizio,
        `Template_Contratto_${data.tipoServizio}_TeleMedCare`,
        contractHtml,
        data.prezzoMensile,
        data.durataContratto,
        data.prezzoTotale
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
   * Genera HTML del contratto
   */
  private static generateContractHTML(data: ContractData): string {
    const template = data.tipoServizio === 'AVANZATO' 
      ? this.getContractTemplateAvanzato()
      : this.getContractTemplateBase()
    
    const variables = {
      CODICE_CONTRATTO: data.codiceContratto || '',
      DATA_CONTRATTO: data.dataContratto || new Date().toLocaleDateString('it-IT'),
      NOME_RICHIEDENTE: data.nomeRichiedente,
      COGNOME_RICHIEDENTE: data.cognomeRichiedente,
      EMAIL: data.email,
      TELEFONO: data.telefono,
      NOME_ASSISTITO: data.nomeAssistito || data.nomeRichiedente,
      COGNOME_ASSISTITO: data.cognomeAssistito || data.cognomeRichiedente,
      ETA_ASSISTITO: data.etaAssistito?.toString() || 'Non specificata',
      TIPO_SERVIZIO: data.tipoServizio === 'AVANZATO' ? 'TeleMedCare Avanzato' : 'TeleMedCare Base',
      PREZZO_MENSILE: `€${data.prezzoMensile.toFixed(2)}`,
      DURATA_MESI: data.durataContratto.toString(),
      PREZZO_TOTALE: `€${data.prezzoTotale.toFixed(2)}`,
      ANNO: new Date().getFullYear().toString()
    }
    
    return TemplateEngine.render(template, variables)
  }
  
  /**
   * Template HTML contratto BASE
   */
  private static getContractTemplateBase(): string {
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
    <p><strong>IL FORNITORE:</strong> Medica GB S.r.l. - Via Example 123, 00100 Roma - P.IVA 12345678901</p>
    <p><strong>IL CLIENTE:</strong> {{NOME_RICHIEDENTE}} {{COGNOME_RICHIEDENTE}}</p>
    <p><strong>Email:</strong> {{EMAIL}} | <strong>Telefono:</strong> {{TELEFONO}}</p>
    <p><strong>Assistito:</strong> {{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}} ({{ETA_ASSISTITO}} anni)</p>
  </div>

  <div class="section">
    <h2>ART. 1 - OGGETTO DEL CONTRATTO</h2>
    <p>Il presente contratto ha per oggetto la fornitura del servizio <strong>{{TIPO_SERVIZIO}}</strong>, 
    che include:</p>
    <ul>
      <li>Dispositivo medico SiDLY Care Pro V11.0 in comodato d'uso</li>
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
    <p>Medica GB S.r.l. si impegna a:</p>
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
      <p>Medica GB S.r.l.</p>
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
   * Template HTML contratto AVANZATO
   */
  private static getContractTemplateAvanzato(): string {
    // Simile al Base ma con servizi aggiuntivi
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
}

export default ContractGenerator
