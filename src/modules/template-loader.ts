/**
 * Template Loader - TeleMedCare V12.0
 * Caricamento template reali dai file esistenti nel repository
 */

export interface TemplateFile {
  nome_file: string;
  tipo_documento: 'PROFORMA' | 'CONTRACT' | 'EMAIL';
  categoria: string;
  html_content: string;
  variabili_trovate: string[];
}

export class TemplateLoader {
  private db: D1Database;

  constructor(database: D1Database) {
    this.db = database;
  }

  /**
   * Carica i template reali dal repository (DA IMPLEMENTARE - richiede accesso al file system)
   * Per ora usa le definizioni hardcoded che corrispondono ai file reali
   */
  async loadRealTemplates(): Promise<{ loaded: number; errors: string[] }> {
    const templates = await this.getRealTemplatesFromRepository();
    let loaded = 0;
    const errors: string[] = [];

    for (const template of templates) {
      try {
        await this.insertOrUpdateTemplate(template);
        loaded++;
      } catch (error) {
        errors.push(`Errore caricamento ${template.nome_file}: ${error.message}`);
      }
    }

    return { loaded, errors };
  }

  /**
   * Carica template reali dal repository - per ora implementazione basica
   * TODO: Implementare lettura diretta da file system quando disponibile
   */
  private async getRealTemplatesFromRepository(): Promise<TemplateFile[]> {
    // Per ora ritorna le definizioni hardcoded che corrispondono ai file reali
    // In futuro potrà leggere direttamente da /home/user/webapp/templates/
    return this.getRealTemplatesDefinition();
  }

  /**
   * Definizione dei template reali presenti nel repository
   */
  private getRealTemplatesDefinition(): TemplateFile[] {
    return [
      // Template Proforma Commerciale
      {
        nome_file: 'proforma_commerciale.html',
        tipo_documento: 'PROFORMA',
        categoria: 'COMMERCIALE',
        html_content: this.getProformaCommercialeTemplate(),
        variabili_trovate: [
          'NUMERO_PROFORMA', 'DATA_RICHIESTA', 'NOME_ASSISTITO', 'COGNOME_ASSISTITO',
          'CODICE_FISCALE', 'INDIRIZZO_COMPLETO', 'CITTA', 'EMAIL_RICHIEDENTE',
          'DATA_ATTIVAZIONE', 'SERIAL_NUMBER', 'COMUNICAZIONE_TIPO', 'TELEFONO_SIDLY',
          'PREZZO_PACCHETTO'
        ]
      },
      
      // Template Contratto Vendita
      {
        nome_file: 'contratto_vendita.html',
        tipo_documento: 'CONTRACT',
        categoria: 'VENDITA',
        html_content: this.getContrattoVenditaTemplate(),
        variabili_trovate: [
          'NUMERO_CONTRATTO', 'NOME_RAPPRESENTANTE', 'QUALIFICA_RAPPRESENTANTE',
          'NOME_COGNOME_CLIENTE', 'CODICE_FISCALE_CLIENTE', 'PARTITA_IVA_CLIENTE',
          'INDIRIZZO_CLIENTE', 'CAP_CLIENTE', 'CITTA_CLIENTE', 'PROVINCIA_CLIENTE',
          'EMAIL_CLIENTE', 'TELEFONO_CLIENTE', 'NOME_PRODOTTO', 'MODELLO_PRODOTTO',
          'IMEI_PRODOTTO', 'QUANTITA', 'PREZZO_UNITARIO', 'PREZZO_TOTALE',
          'SUBTOTALE', 'ALIQUOTA_IVA', 'IMPORTO_IVA', 'TOTALE_GENERALE',
          'MODALITA_PAGAMENTO', 'SCADENZA_PAGAMENTO', 'COORDINATE_BANCARIE',
          'MODALITA_CONSEGNA', 'INDIRIZZO_CONSEGNA', 'TEMPI_CONSEGNA',
          'SPESE_SPEDIZIONE', 'PERIODO_GARANZIA', 'DATA_CONTRATTO', 'LUOGO_CONTRATTO'
        ]
      }
    ];
  }

  /**
   * Contenuto template proforma commerciale reale
   */
  private getProformaCommercialeTemplate(): string {
    return `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pro Forma - TeleMedCare</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }
        .company-info {
            font-weight: bold;
            font-size: 14px;
        }
        .document-title {
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0;
            text-transform: uppercase;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .patient-info {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            padding: 15px;
            margin: 10px 0;
        }
        .service-description {
            background-color: #fafafa;
            border-left: 4px solid #0066cc;
            padding: 15px;
            margin: 15px 0;
        }
        .pricing {
            background-color: #fff3cd;
            border: 2px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .payment-info {
            background-color: #e8f4f8;
            border: 1px solid #bee5eb;
            padding: 15px;
            margin: 15px 0;
        }
        .footer {
            margin-top: 40px;
            font-size: 10px;
            text-align: center;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 15px;
        }
        .signature-area {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 45%;
            border-top: 1px solid #000;
            padding-top: 10px;
            text-align: center;
        }
        .highlight {
            background-color: #fff3cd;
            padding: 10px;
            border-radius: 5px;
            font-weight: bold;
        }
        .bank-details {
            font-family: 'Courier New', monospace;
            background-color: #f8f9fa;
            padding: 10px;
            border: 1px solid #dee2e6;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            MEDICA GB S.R.L.<br>
            Corso Giuseppe Garibaldi, 34 – 20121 Milano<br>
            P.IVA: 12435130963 - REA: MI-2661409<br>
            Tel: +39 331 643 2390 - Email: info@medicagb.it
        </div>
        <div class="document-title">
            PRO FORMA<br>
            N° {{NUMERO_PROFORMA}}
        </div>
        <div>
            <strong>Milano, {{DATA_RICHIESTA}}</strong>
        </div>
    </div>

    <div class="section">
        <div class="section-title">ANAGRAFICA PAZIENTE</div>
        
        <div class="patient-info">
            <strong>NOME:</strong> {{NOME_ASSISTITO}}<br>
            <strong>COGNOME:</strong> {{COGNOME_ASSISTITO}}<br>
            <strong>C.F.:</strong> {{CODICE_FISCALE}}<br>
            <strong>RESIDENTE IN:</strong> {{INDIRIZZO_COMPLETO}}<br>
            <strong>CITTÀ:</strong> {{CITTA}}<br><br>
            
            <div class="highlight">
                <strong>E.MAIL PER INVIO FATTURAZIONE:</strong> {{EMAIL_RICHIEDENTE}}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">TIPOLOGIA PRESTAZIONE EROGATA</div>
        
        <p><strong>DATA ATTIVAZIONE:</strong> {{DATA_ATTIVAZIONE}}</p>
        
        <div class="service-description">
            <h4>TIPO DI PRESTAZIONE:</h4>
            <p><strong>SiDLY Care PRO numero seriale: {{SERIAL_NUMBER}}</strong></p>
            
            <p>Sistema di allarme mobile di piccole dimensioni ed indossabile. È progettato per monitorare e proteggere le persone. In caso di emergenza, la persona può attivarlo premendo un pulsante SOS sull'unità e la funzione di comunicazione vocale bidirezionale consente di parlare con {{COMUNICAZIONE_TIPO}} le persone individuate come care givers.</p>
            
            <p>È integrato con sensori che consentono la geolocalizzazione, il geo-fencing, il rilevamento cadute, il reminder dei farmaci e la gestione dell'alimentazione.</p>
            
            <p><strong>È un Dispositivo Medico certificato in classe IIA (codice CDN Z12040199)</strong> e, come tale, consente la rilevazione della Frequenza Cardiaca (FC) e della Saturazione (SpO2).</p>
            
            <p><strong>INCLUSO NEL SERVIZIO:</strong></p>
            <ul>
                <li>Basetta per la ricarica</li>
                <li>Alimentatore e cavo</li>
                <li>Installazione e collaudo inclusi</li>
                <li>SIM SiDLY per comunicazione e trasmissione dati</li>
                <li>Piattaforma/APP SiDLY (Dispositivo medicale in classe I)</li>
            </ul>
            
            <p><strong>Tel. Supporto:</strong> {{TELEFONO_SIDLY}}</p>
        </div>
    </div>

    <div class="section">
        <div class="pricing">
            <h3>💰 TOTALE DA FATTURARE</h3>
            <div style="font-size: 18px; font-weight: bold; color: #0066cc;">
                {{PREZZO_PACCHETTO}} + IVA 22%
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">PAGAMENTO CON BONIFICO</div>
        
        <div class="payment-info">
            <p><strong>Intestatario:</strong> Medica GB S.r.l.<br>
            Corso Giuseppe Garibaldi, 34 – 20121 Milano</p>
            
            <div class="bank-details">
                <strong>BANCA BPM S.P.A.</strong><br>
                FILIALE MILANO-GARIBALDI<br>
                C/C 03519<br>
                ABI 05034<br>
                CAB 01727<br>
                <strong>IBAN: IT97L0503401727000000003519</strong>
            </div>
        </div>
    </div>

    <div class="section">
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; font-style: italic; text-align: center;">
            <strong>NOTA IMPORTANTE:</strong><br>
            Il presente documento non costituisce fattura che verrà emessa all'atto del pagamento ai sensi dell'art.6 DPR 26.10.1972 n. 633.
        </div>
    </div>

    <div class="signature-area">
        <div class="signature-box">
            <strong>MEDICA GB S.R.L.</strong><br><br>
            _________________________<br>
            Stefania Rocca<br>
            Amministratore
        </div>
        <div class="signature-box">
            <strong>IL CLIENTE</strong><br><br>
            _________________________<br>
            {{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}}
        </div>
    </div>

    <div class="footer">
        <p>
            <strong>Medica GB S.r.l.</strong><br>
            Corso Giuseppe Garibaldi, 34 – 20121 Milano<br>
            PEC: medicagbsrl@pecimprese.it - Email: info@medicagb.it<br>
            Codice Fiscale e P.IVA: 12435130963 - REA: MI-2661409<br>
            www.medicagb.it - www.telemedcare.it
        </p>
        <p style="margin-top: 15px;">
            <strong>Data:</strong> {{DATA_RICHIESTA}} - <strong>Documento N°:</strong> {{NUMERO_PROFORMA}}<br>
            Documento generato automaticamente dal sistema TeleMedCare V12.0
        </p>
    </div>
</body>
</html>`;
  }

  /**
   * Contenuto template contratto vendita reale
   */
  private getContrattoVenditaTemplate(): string {
    return `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contratto di Vendita - TeleMedCare</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }
        .company-info {
            font-weight: bold;
            font-size: 14px;
        }
        .contract-title {
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            text-transform: uppercase;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 10px;
        }
        .party-info {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            padding: 15px;
            margin: 10px 0;
        }
        .product-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .product-table th, .product-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }
        .product-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .terms-list {
            margin-left: 20px;
        }
        .terms-list li {
            margin-bottom: 8px;
        }
        .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 45%;
            border-top: 1px solid #000;
            padding-top: 10px;
            text-align: center;
        }
        .footer {
            margin-top: 30px;
            font-size: 10px;
            text-align: center;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            TELEMEDCARE S.R.L.<br>
            Via Roma 123, 20100 Milano (MI)<br>
            P.IVA: 12345678901 - C.F.: 12345678901<br>
            Tel: +39 02 1234 5678 - Email: info@telemedcare.it
        </div>
        <div class="contract-title">
            CONTRATTO DI VENDITA<br>
            N° {{NUMERO_CONTRATTO}}
        </div>
    </div>

    <div class="section">
        <div class="section-title">PARTI CONTRAENTI</div>
        
        <div class="party-info">
            <strong>VENDITORE:</strong><br>
            TeleMedCare S.r.l.<br>
            Codice Fiscale: 12345678901<br>
            Partita IVA: 12345678901<br>
            Sede Legale: Via Roma 123, 20100 Milano (MI)<br>
            Rappresentata da: {{NOME_RAPPRESENTANTE}}<br>
            in qualità di {{QUALIFICA_RAPPRESENTANTE}}
        </div>

        <div class="party-info">
            <strong>ACQUIRENTE:</strong><br>
            {{NOME_COGNOME_CLIENTE}}<br>
            Codice Fiscale: {{CODICE_FISCALE_CLIENTE}}<br>
            {{#PARTITA_IVA_CLIENTE}}Partita IVA: {{PARTITA_IVA_CLIENTE}}<br>{{/PARTITA_IVA_CLIENTE}}
            Residenza: {{INDIRIZZO_CLIENTE}}<br>
            {{CAP_CLIENTE}} {{CITTA_CLIENTE}} ({{PROVINCIA_CLIENTE}})<br>
            Email: {{EMAIL_CLIENTE}}<br>
            Telefono: {{TELEFONO_CLIENTE}}
        </div>
    </div>

    <div class="section">
        <div class="section-title">OGGETTO DEL CONTRATTO</div>
        <p>Il Venditore vende e l'Acquirente acquista il/i seguente/i bene/i:</p>
        
        <table class="product-table">
            <thead>
                <tr>
                    <th>Descrizione Prodotto</th>
                    <th>Modello</th>
                    <th>Codice/IMEI</th>
                    <th>Quantità</th>
                    <th>Prezzo Unitario</th>
                    <th>Totale</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{NOME_PRODOTTO}}</td>
                    <td>{{MODELLO_PRODOTTO}}</td>
                    <td>{{IMEI_PRODOTTO}}</td>
                    <td>{{QUANTITA}}</td>
                    <td>€ {{PREZZO_UNITARIO}}</td>
                    <td>€ {{PREZZO_TOTALE}}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="5" style="text-align: right;"><strong>Subtotale:</strong></td>
                    <td><strong>€ {{SUBTOTALE}}</strong></td>
                </tr>
                <tr>
                    <td colspan="5" style="text-align: right;"><strong>IVA ({{ALIQUOTA_IVA}}%):</strong></td>
                    <td><strong>€ {{IMPORTO_IVA}}</strong></td>
                </tr>
                <tr>
                    <td colspan="5" style="text-align: right;"><strong>TOTALE GENERALE:</strong></td>
                    <td><strong>€ {{TOTALE_GENERALE}}</strong></td>
                </tr>
            </tfoot>
        </table>
    </div>

    <div class="section">
        <div class="section-title">MODALITÀ DI PAGAMENTO</div>
        <ul>
            <li><strong>Modalità:</strong> {{MODALITA_PAGAMENTO}}</li>
            <li><strong>Importo:</strong> € {{TOTALE_GENERALE}}</li>
            <li><strong>Scadenza:</strong> {{SCADENZA_PAGAMENTO}}</li>
            {{#COORDINATE_BANCARIE}}<li><strong>Coordinate Bancarie:</strong> {{COORDINATE_BANCARIE}}</li>{{/COORDINATE_BANCARIE}}
        </ul>
    </div>

    <div class="section">
        <div class="section-title">CONSEGNA</div>
        <ul>
            <li><strong>Modalità di Consegna:</strong> {{MODALITA_CONSEGNA}}</li>
            <li><strong>Indirizzo di Consegna:</strong> {{INDIRIZZO_CONSEGNA}}</li>
            <li><strong>Tempi di Consegna:</strong> {{TEMPI_CONSEGNA}}</li>
            <li><strong>Spese di Spedizione:</strong> {{SPESE_SPEDIZIONE}}</li>
        </ul>
    </div>

    <div class="section">
        <div class="section-title">GARANZIA</div>
        <ul class="terms-list">
            <li>Il prodotto è garantito per <strong>{{PERIODO_GARANZIA}}</strong> dalla data di consegna.</li>
            <li>La garanzia copre difetti di fabbricazione e malfunzionamenti non dovuti ad uso improprio.</li>
            <li>Per attivare la garanzia è necessario conservare il presente contratto e il documento di trasporto.</li>
            <li>La garanzia non copre danni dovuti a caduta, immersione in liquidi, uso improprio o normale usura.</li>
        </ul>
    </div>

    <div class="section">
        <div class="section-title">DIRITTO DI RECESSO</div>
        <ul class="terms-list">
            <li>L'Acquirente ha diritto di recedere dal presente contratto entro <strong>14 giorni</strong> dalla ricezione del bene.</li>
            <li>Il recesso deve essere comunicato tramite lettera raccomandata o email certificata.</li>
            <li>Il bene deve essere restituito integro, nella confezione originale e con tutti gli accessori.</li>
            <li>Le spese di restituzione sono a carico dell'Acquirente.</li>
        </ul>
    </div>

    <div class="section">
        <div class="section-title">CLAUSOLE FINALI</div>
        <ul class="terms-list">
            <li>Il presente contratto è regolato dalla legge italiana.</li>
            <li>Per qualsiasi controversia è competente il Foro di Milano.</li>
            <li>Il contratto si intende accettato in tutte le sue parti con la firma dell'Acquirente.</li>
            <li>Ai sensi dell'art. 1341 C.C. l'Acquirente dichiara di aver letto e approvare specificamente gli articoli relativi a garanzia, recesso e foro competente.</li>
        </ul>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <strong>IL VENDITORE</strong><br>
            TeleMedCare S.r.l.<br><br>
            _________________________<br>
            {{NOME_RAPPRESENTANTE}}<br>
            {{QUALIFICA_RAPPRESENTANTE}}
        </div>
        <div class="signature-box">
            <strong>L'ACQUIRENTE</strong><br><br><br>
            _________________________<br>
            {{NOME_COGNOME_CLIENTE}}
        </div>
    </div>

    <div class="footer">
        <p>
            <strong>Data:</strong> {{DATA_CONTRATTO}} - <strong>Luogo:</strong> {{LUOGO_CONTRATTO}}<br>
            Documento generato automaticamente dal sistema TeleMedCare V12.0<br>
            Per informazioni: info@telemedcare.it - Tel: +39 02 1234 5678
        </p>
    </div>
</body>
</html>`;
  }

  /**
   * Inserisce o aggiorna un template nel database
   */
  private async insertOrUpdateTemplate(template: TemplateFile): Promise<void> {
    await this.db
      .prepare(`
        INSERT OR REPLACE INTO document_templates (
          nome_template, tipo_documento, categoria, versione,
          html_template, variabili_disponibili, descrizione,
          formato_output, orientamento, formato_carta, margini,
          attivo, template_predefinito, utilizzi_totali,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
      .bind(
        template.nome_file,
        template.tipo_documento,
        template.categoria,
        '1.0',
        template.html_content,
        JSON.stringify(template.variabili_trovate),
        `Template originale da repository: ${template.nome_file}`,
        'HTML',
        'portrait',
        'A4',
        JSON.stringify({ top: 20, bottom: 20, left: 20, right: 20 }),
        1, // attivo
        1, // template_predefinito
        0  // utilizzi_totali
      )
      .run();
  }

  /**
   * Estrae le variabili da un template HTML
   */
  extractVariables(htmlContent: string): string[] {
    const regex = /{{\s*([A-Z_]+)\s*}}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(htmlContent)) !== null) {
      const variable = match[1];
      if (!variables.includes(variable)) {
        variables.push(variable);
      }
    }

    return variables.sort();
  }
}

export default TemplateLoader;