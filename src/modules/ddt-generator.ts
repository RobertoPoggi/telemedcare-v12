/**
 * DDT-GENERATOR.TS - Generatore DDT (Documento di Trasporto)
 * eCura V12.0 - Document Delivery Note Generator
 * 
 * Genera DDT dopo pagamento completato per spedizione dispositivo SiDLY
 * 
 * WORKFLOW:
 * 1. Pagamento completato → genera DDT
 * 2. DDT include dettagli dispositivo, cliente, tracking
 * 3. Salva in database per tracciabilità
 * 4. [TODO] Integrazione con corriere per tracking
 */

import { TemplateEngine } from './email-service'

// Logo Medica GB - Data URL per embedding in HTML/PDF
const MEDICA_GB_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='60' viewBox='0 0 200 60'%3E%3Cg%3E%3Crect x='10' y='15' width='8' height='30' fill='%233b82f6' rx='1'/%3E%3Crect x='5' y='23' width='18' height='8' fill='%233b82f6' rx='1'/%3E%3C/g%3E%3Ctext x='35' y='35' font-family='Arial,sans-serif' font-size='22' font-weight='bold' fill='%231e40af'%3EMedica GB%3C/text%3E%3Ctext x='35' y='48' font-family='Arial,sans-serif' font-size='8' fill='%2364748b'%3EStartup Innovativa a Vocazione Sociale%3C/text%3E%3C/svg%3E"

export interface DDTData {
  // Dati DDT
  numeroDDT: string
  dataEmissione: string
  annoRiferimento: string
  
  // Cliente (destinatario)
  nomeCliente: string
  cognomeCliente: string
  indirizzoCompleto: string
  cap: string
  citta: string
  provincia: string
  telefono?: string
  email: string
  
  // Mittente (Medica GB)
  ragioneSocialeMittente: string
  indirizzoMittente: string
  capMittente: string
  cittaMittente: string
  provinciaMittente: string
  
  // Dispositivo spedito
  dispositivo: string
  quantita: number
  serialNumber?: string
  descrizione: string
  
  // Riferimenti
  numeroOrdine: string
  codiceContratto: string
  numeroProforma: string
  
  // Trasporto
  corriere?: string
  trackingNumber?: string
  pesoKg?: number
  numeroColli: number
  
  // Note
  note?: string
}

export interface DDTGenerated {
  ddtId: string
  numeroDDT: string
  pdfUrl?: string
  pdfBase64?: string
  createdAt: string
}

/**
 * DDT Generator - Genera documento trasporto per spedizione dispositivi
 */
export class DDTGenerator {
  
  /**
   * Genera DDT completo
   */
  static async generateDDT(
    data: DDTData,
    db: any
  ): Promise<{ success: boolean; ddt?: DDTGenerated; error?: string }> {
    
    try {
      console.log('🚚 [DDT] Generazione DDT per ordine:', data.numeroOrdine)
      
      // 1. Genera numero DDT univoco usando il contatore dal database
      const numeroDDT = await this.generateDDTNumber(db)
      const ddtId = `DDT_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      
      // 2. Prepara dati completi
      const ddtData: DDTData = {
        ...data,
        numeroDDT,
        dataEmissione: data.dataEmissione || new Date().toLocaleDateString('it-IT'),
        annoRiferimento: new Date().getFullYear().toString()
      }
      
      // 3. Genera HTML DDT
      const ddtHtml = this.generateDDTHTML(ddtData)
      
      // 4. Converti in PDF (per ora base64 HTML)
      // TODO: Usare Puppeteer/Chromium per PDF reale in produzione
      const pdfBase64 = Buffer.from(ddtHtml).toString('base64')
      
      // 5. Salva in database
      // TODO: Creare tabella `ddts` se non esiste
      try {
        await db.prepare(`
          INSERT INTO ddts (
            id, numero_ddt, contract_code, proforma_number,
            dispositivo, serial_number, destinatario_nome,
            destinatario_indirizzo, corriere, tracking_number,
            status, pdf_url, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).bind(
          ddtId,
          numeroDDT,
          data.codiceContratto,
          data.numeroProforma,
          data.dispositivo,
          data.serialNumber || null,
          `${data.nomeCliente} ${data.cognomeCliente}`,
          data.indirizzoCompleto,
          data.corriere || null,
          data.trackingNumber || null,
          'preparazione', // Status: preparazione, spedito, consegnato
          `/ddts/${numeroDDT}.pdf`
        ).run()
        
        console.log(`✅ [DDT] DDT salvato nel database: ${numeroDDT}`)
      } catch (dbError) {
        console.warn('⚠️ [DDT] Tabella ddts non esiste, skip salvataggio DB')
        console.warn('💡 [DDT] Creare migration per tabella ddts')
      }
      
      console.log(`✅ [DDT] DDT generato: ${numeroDDT}`)
      
      return {
        success: true,
        ddt: {
          ddtId,
          numeroDDT,
          pdfBase64,
          pdfUrl: `/ddts/${numeroDDT}.pdf`,
          createdAt: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('❌ [DDT] Errore generazione:', error)
      return {
        success: false,
        error: String(error)
      }
    }
  }
  
  /**
   * Genera numero DDT univoco da contatore database
   * Formato: N/YYYY (es. 6/2026, 7/2026, ...)
   * Il contatore si resetta ogni anno
   */
  private static async generateDDTNumber(db: any): Promise<string> {
    const currentYear = new Date().getFullYear().toString()
    
    try {
      // Recupera ultimo numero DDT e anno corrente
      const settings = await db.prepare(`
        SELECT key, value FROM system_settings 
        WHERE key IN ('ultimo_numero_ddt', 'anno_ddt_corrente')
      `).all()
      
      const settingsMap: Record<string, string> = {}
      settings.results?.forEach((row: any) => {
        settingsMap[row.key] = row.value
      })
      
      let ultimoNumero = parseInt(settingsMap['ultimo_numero_ddt'] || '0')
      const annoSalvato = settingsMap['anno_ddt_corrente'] || currentYear
      
      // Se siamo in un nuovo anno, resetta il contatore
      if (annoSalvato !== currentYear) {
        ultimoNumero = 0
        await db.prepare(`
          UPDATE system_settings 
          SET value = ? 
          WHERE key = 'anno_ddt_corrente'
        `).bind(currentYear).run()
        
        console.log(`🔄 [DDT] Nuovo anno ${currentYear}, contatore resettato`)
      }
      
      // Incrementa il contatore
      const nuovoNumero = ultimoNumero + 1
      
      // Aggiorna il contatore nel database
      await db.prepare(`
        UPDATE system_settings 
        SET value = ?, updated_at = datetime('now')
        WHERE key = 'ultimo_numero_ddt'
      `).bind(nuovoNumero.toString()).run()
      
      console.log(`📊 [DDT] Numero generato: ${nuovoNumero}/${currentYear}`)
      
      return `${nuovoNumero}/${currentYear}`
      
    } catch (error) {
      console.error('❌ [DDT] Errore recupero contatore, uso fallback:', error)
      // Fallback: genera numero casuale se il database fallisce
      const sequential = Math.floor(Math.random() * 999999).toString().padStart(6, '0')
      return `${sequential}/${currentYear}`
    }
  }
  
  /**
   * Genera HTML DDT da template
   */
  private static generateDDTHTML(data: DDTData): string {
    const template = this.getDDTTemplate()
    
    const variables = {
      NUMERO_DDT: data.numeroDDT,
      DATA_EMISSIONE: data.dataEmissione,
      ANNO: data.annoRiferimento,
      
      // Mittente
      RAGIONE_SOCIALE_MITTENTE: 'Medica GB S.r.l.',
      INDIRIZZO_MITTENTE: 'Corso Garibaldi 34',
      CAP_CITTA_MITTENTE: '20121 Milano (MI)',
      PIVA_MITTENTE: 'P.IVA: 12435130963',
      
      // Destinatario
      NOME_DESTINATARIO: `${data.nomeCliente} ${data.cognomeCliente}`,
      INDIRIZZO_DESTINATARIO: data.indirizzoCompleto,
      CAP_CITTA_DESTINATARIO: `${data.cap} ${data.citta} (${data.provincia})`,
      TELEFONO_DESTINATARIO: data.telefono || 'Non specificato',
      EMAIL_DESTINATARIO: data.email,
      
      // Dispositivo
      DISPOSITIVO: data.dispositivo,
      QUANTITA: data.quantita.toString(),
      SERIAL_NUMBER: data.serialNumber || 'Da assegnare',
      DESCRIZIONE_DISPOSITIVO: data.descrizione,
      
      // Riferimenti
      NUMERO_ORDINE: data.numeroOrdine,
      CODICE_CONTRATTO: data.codiceContratto,
      NUMERO_PROFORMA: data.numeroProforma,
      
      // Trasporto
      CORRIERE: data.corriere || 'Da definire',
      TRACKING_NUMBER: data.trackingNumber || 'Verrà comunicato via email',
      PESO_KG: data.pesoKg ? `${data.pesoKg} kg` : '~0.5 kg',
      NUMERO_COLLI: data.numeroColli.toString(),
      
      // Note
      NOTE: data.note || 'Merce viaggia a rischio e pericolo del destinatario. Verificare integrità colli alla consegna.'
    }
    
    return TemplateEngine.render(template, variables)
  }
  
  /**
   * Template HTML DDT
   */
  private static getDDTTemplate(): string {
    return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DDT {{NUMERO_DDT}} - Medica GB</title>
  <style>
    body {
      font-family: Arial, sans-serif;
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
    }
    .ddt-title {
      font-size: 24px;
      color: #1e40af;
      margin: 20px 0;
      text-align: center;
    }
    .section {
      background: #f9fafb;
      padding: 15px;
      margin: 15px 0;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    .section h3 {
      margin-top: 0;
      color: #3b82f6;
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
      background: #3b82f6;
      color: white;
      font-weight: bold;
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
    <!-- Logo Medica GB -->
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${MEDICA_GB_LOGO}" alt="Medica GB" style="height: 60px; margin: 0 auto; display: block;">
    </div>
    
    <div class="logo">🚚 DOCUMENTO DI TRASPORTO (DDT)</div>
    <div style="font-size: 14px; color: #666; margin-top: 10px;">
      {{INDIRIZZO_MITTENTE}}, {{CAP_CITTA_MITTENTE}}<br>
      {{PIVA_MITTENTE}} | REA MI-2654321
    </div>
  </div>

  <h1 class="ddt-title">DDT N. {{NUMERO_DDT}}</h1>
  
  <div style="text-align: center; margin: 20px 0; font-size: 16px;">
    <strong>Data Emissione:</strong> {{DATA_EMISSIONE}}
  </div>

  <div class="section">
    <h3>📦 MITTENTE</h3>
    <p>
      <strong>{{RAGIONE_SOCIALE_MITTENTE}}</strong><br>
      {{INDIRIZZO_MITTENTE}}<br>
      {{CAP_CITTA_MITTENTE}}<br>
      {{PIVA_MITTENTE}}
    </p>
  </div>

  <div class="section">
    <h3>👤 DESTINATARIO</h3>
    <p>
      <strong>{{NOME_DESTINATARIO}}</strong><br>
      {{INDIRIZZO_DESTINATARIO}}<br>
      {{CAP_CITTA_DESTINATARIO}}<br>
      📞 {{TELEFONO_DESTINATARIO}}<br>
      📧 {{EMAIL_DESTINATARIO}}
    </p>
  </div>

  <div class="section">
    <h3>📋 RIFERIMENTI ORDINE</h3>
    <table style="width: 100%;">
      <tr>
        <td><strong>Numero Ordine:</strong></td>
        <td>{{NUMERO_ORDINE}}</td>
      </tr>
      <tr>
        <td><strong>Codice Contratto:</strong></td>
        <td>{{CODICE_CONTRATTO}}</td>
      </tr>
      <tr>
        <td><strong>Numero Proforma:</strong></td>
        <td>{{NUMERO_PROFORMA}}</td>
      </tr>
    </table>
  </div>

  <h3 style="color: #3b82f6; margin-top: 30px;">🔧 ARTICOLI SPEDITI</h3>
  <table class="table">
    <thead>
      <tr>
        <th>Descrizione</th>
        <th>Seriale</th>
        <th style="text-align: center;">Quantità</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>{{DISPOSITIVO}}</strong><br>
          <small>{{DESCRIZIONE_DISPOSITIVO}}</small>
        </td>
        <td>{{SERIAL_NUMBER}}</td>
        <td style="text-align: center;">{{QUANTITA}}</td>
      </tr>
    </tbody>
  </table>

  <div class="section">
    <h3>🚛 DETTAGLI TRASPORTO</h3>
    <table style="width: 100%;">
      <tr>
        <td><strong>Corriere:</strong></td>
        <td>{{CORRIERE}}</td>
      </tr>
      <tr>
        <td><strong>Tracking Number:</strong></td>
        <td>{{TRACKING_NUMBER}}</td>
      </tr>
      <tr>
        <td><strong>Numero Colli:</strong></td>
        <td>{{NUMERO_COLLI}}</td>
      </tr>
      <tr>
        <td><strong>Peso Totale:</strong></td>
        <td>{{PESO_KG}}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <h3>📝 NOTE</h3>
    <p>{{NOTE}}</p>
    <p style="margin-top: 15px; font-size: 14px; color: #666;">
      ⚠️ <strong>IMPORTANTE:</strong> Verificare l'integrità dell'imballo alla consegna. 
      In caso di danni visibili, NON accettare la merce e contattare immediatamente il corriere e Medica GB.
    </p>
  </div>

  <div style="margin: 40px 0; text-align: center;">
    <p style="font-size: 14px; color: #666;">
      Per assistenza sulla consegna:<br>
      📧 <a href="mailto:info@telemedcare.it">info@telemedcare.it</a> | 
      📞 335 730 1206
    </p>
  </div>

  <div class="footer">
    <p><strong>Medica GB S.r.l.</strong> - Startup Innovativa a Vocazione Sociale</p>
    <p>
      🏢 Milano: Corso Garibaldi 34, 20121 | 🏢 Genova: Via delle Eriche 53, 16148
    </p>
    <p>
      📧 info@medicagb.it | 📞 02 8715 6826 | 🌐 www.medicagb.it
    </p>
    <p style="margin-top: 15px; font-style: italic;">
      Documento generato automaticamente il {{DATA_EMISSIONE}} - Anno {{ANNO}}
    </p>
  </div>
</body>
</html>`
  }
}

/**
 * Helper: Crea DDT da contratto e proforma
 */
export async function createDDTFromOrder(
  contractCode: string,
  proformaNumber: string,
  nomeCliente: string,
  cognomeCliente: string,
  emailCliente: string,
  indirizzoCompleto: string,
  dispositivo: string,
  servizio: 'FAMILY' | 'PRO' | 'PREMIUM'
): Promise<DDTData> {
  
  // Determina dispositivo in base al servizio
  const dispositivoMap: Record<string, string> = {
    'FAMILY': 'Senium - Braccialetto Salvavita',
    'PRO': 'SiDLY Care PRO V12.0 - Dispositivo Medico Certificato',
    'PREMIUM': 'SiDLY Vital Care - Monitoraggio Avanzato'
  }
  
  const descrizioneMap: Record<string, string> = {
    'FAMILY': 'Dispositivo indossabile per protezione anziani con GPS e SOS',
    'PRO': 'Dispositivo medico Classe IIa con rilevamento cadute, GPS, parametri vitali',
    'PREMIUM': 'Dispositivo avanzato con monitoraggio continuo parametri vitali e telemedicina'
  }
  
  // Parsing indirizzo (semplificato)
  const indirizzoParts = indirizzoCompleto.split(',')
  const via = indirizzoParts[0]?.trim() || indirizzoCompleto
  const capCitta = indirizzoParts[1]?.trim() || ''
  
  // Estrai CAP, Città, Provincia (regex semplificato)
  const capMatch = capCitta.match(/(\d{5})\s+(.+?)\s+\(([A-Z]{2})\)/)
  const cap = capMatch ? capMatch[1] : '00000'
  const citta = capMatch ? capMatch[2] : capCitta
  const provincia = capMatch ? capMatch[3] : 'XX'
  
  return {
    numeroDDT: '', // Generato automaticamente
    dataEmissione: new Date().toLocaleDateString('it-IT'),
    annoRiferimento: new Date().getFullYear().toString(),
    
    nomeCliente,
    cognomeCliente,
    indirizzoCompleto: via,
    cap,
    citta,
    provincia,
    email: emailCliente,
    
    ragioneSocialeMittente: 'Medica GB S.r.l.',
    indirizzoMittente: 'Corso Garibaldi 34',
    capMittente: '20121',
    cittaMittente: 'Milano',
    provinciaMittente: 'MI',
    
    dispositivo: dispositivoMap[servizio] || 'Dispositivo eCura',
    quantita: 1,
    descrizione: descrizioneMap[servizio] || 'Dispositivo teleassistenza',
    
    numeroOrdine: contractCode,
    codiceContratto: contractCode,
    numeroProforma: proformaNumber,
    
    numeroColli: 1,
    
    note: 'Dispositivo pre-configurato. Attivazione automatica al primo utilizzo.'
  }
}

export default DDTGenerator
