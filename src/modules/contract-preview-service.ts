/**
 * CONTRACT_PREVIEW_SERVICE.TS - Sistema Preview e Test Contratti
 * TeleMedCare V11.0 - Verifica Generazione Contratti PDF
 * 
 * Permette di:
 * - Generare contratti PDF con dati reali
 * - Visualizzare anteprima prima della firma
 * - Testare personalizzazione con dati variabili
 * - Simulare processo di firma elettronica
 */

export interface ContractTemplate {
  id: string
  name: string
  fileName: string
  description: string
  requiredVariables: string[]
  contractType: 'BASE' | 'AVANZATO' | 'PROFORMA'
  pricing: {
    firstYear: number
    renewal: number
  }
}

export interface ContractPreviewData {
  template: ContractTemplate
  renderedContent: string
  personalizedVariables: Record<string, any>
  estimatedPages: number
  estimatedSize: string
  contractId: string
  generatedAt: string
}

export interface ContractTestResult {
  success: boolean
  previewData?: ContractPreviewData
  validationErrors?: string[]
  testMetadata: {
    renderTime: number
    templateSize: number
    variablesUsed: number
    missingVariables: string[]
  }
}

class ContractPreviewService {
  private static instance: ContractPreviewService

  // Template definitions per i contratti
  private contractTemplates: ContractTemplate[] = [
    {
      id: 'contratto_base',
      name: 'Contratto TeleAssistenza Base',
      fileName: 'Template_Contratto_Base_TeleMedCare.docx',
      description: 'Contratto standard per servizio TeleAssistenza Base',
      requiredVariables: ['nomeCliente', 'cognomeCliente', 'cfCliente', 'indirizzoCliente', 'emailCliente', 'telefonoCliente', 'dataContratto'],
      contractType: 'BASE',
      pricing: { firstYear: 480, renewal: 240 }
    },
    {
      id: 'contratto_avanzato',
      name: 'Contratto TeleAssistenza Avanzata',
      fileName: 'Template_Contratto_Avanzato_TeleMedCare.docx',
      description: 'Contratto per servizio TeleAssistenza Avanzata con centrale operativa H24',
      requiredVariables: ['nomeCliente', 'cognomeCliente', 'cfCliente', 'indirizzoCliente', 'emailCliente', 'telefonoCliente', 'dataContratto', 'nomeAssistito', 'cfAssistito'],
      contractType: 'AVANZATO',
      pricing: { firstYear: 840, renewal: 600 }
    },
    {
      id: 'proforma_unificata',
      name: 'Proforma Unificata Pagamento',
      fileName: 'Template_Proforma_Unificato_TeleMedCare.docx',
      description: 'Proforma per pagamento dopo firma contratto',
      requiredVariables: ['nomeCliente', 'cognomeCliente', 'pianoServizio', 'importoPrimoAnno', 'importoRinnovo', 'dataScadenza'],
      contractType: 'PROFORMA',
      pricing: { firstYear: 0, renewal: 0 } // Viene calcolato dinamicamente
    }
  ]

  private constructor() {}

  public static getInstance(): ContractPreviewService {
    if (!ContractPreviewService.instance) {
      ContractPreviewService.instance = new ContractPreviewService()
    }
    return ContractPreviewService.instance
  }

  /**
   * Ottieni lista template contratti disponibili
   */
  getAvailableTemplates(): ContractTemplate[] {
    return this.contractTemplates
  }

  /**
   * Ottieni template specifico per ID
   */
  getTemplate(templateId: string): ContractTemplate | null {
    return this.contractTemplates.find(t => t.id === templateId) || null
  }

  /**
   * Renderizza contratto con dati personalizzati
   */
  async renderContractPreview(templateId: string, variables: Record<string, any>): Promise<ContractTestResult> {
    const startTime = performance.now()
    
    try {
      const template = this.getTemplate(templateId)
      if (!template) {
        return {
          success: false,
          validationErrors: [`Template '${templateId}' non trovato`],
          testMetadata: {
            renderTime: performance.now() - startTime,
            templateSize: 0,
            variablesUsed: 0,
            missingVariables: []
          }
        }
      }

      // Verifica variabili richieste
      const missingVariables = template.requiredVariables.filter(
        variable => !variables.hasOwnProperty(variable) || !variables[variable]
      )

      // Arricchisce variabili con dati calcolati
      const enrichedVariables = this.enrichContractVariables(template, variables)
      
      // Genera contenuto contratto
      const contractContent = await this.generateContractContent(template, enrichedVariables)
      const contractId = `CTR_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      const previewData: ContractPreviewData = {
        template,
        renderedContent: contractContent,
        personalizedVariables: enrichedVariables,
        estimatedPages: Math.ceil(contractContent.length / 2000), // Stima 2000 caratteri per pagina
        estimatedSize: this.calculateDocumentSize(contractContent),
        contractId,
        generatedAt: new Date().toISOString()
      }

      return {
        success: missingVariables.length === 0,
        previewData,
        validationErrors: missingVariables.length > 0 ? [`Variabili mancanti: ${missingVariables.join(', ')}`] : undefined,
        testMetadata: {
          renderTime: performance.now() - startTime,
          templateSize: contractContent.length,
          variablesUsed: Object.keys(enrichedVariables).length,
          missingVariables
        }
      }
    } catch (error) {
      return {
        success: false,
        validationErrors: [`Errore rendering: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`],
        testMetadata: {
          renderTime: performance.now() - startTime,
          templateSize: 0,
          variablesUsed: 0,
          missingVariables: []
        }
      }
    }
  }

  /**
   * Simula processo di firma elettronica
   */
  async simulateElectronicSignature(contractId: string, signerData: {
    nome: string
    cognome: string
    cf: string
    email: string
  }): Promise<{
    success: boolean
    signatureResult: {
      signed: boolean
      signatureId: string
      signedAt: string
      verificationCode: string
      signerInfo: any
    }
    error?: string
  }> {
    try {
      // Simula processo di firma (in produzione integrazione con DocuSign/Adobe Sign)
      const simulatedDelay = Math.random() * 2000 + 1000 // 1-3 secondi
      
      await new Promise(resolve => setTimeout(resolve, simulatedDelay))

      return {
        success: true,
        signatureResult: {
          signed: true,
          signatureId: `SIG_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          signedAt: new Date().toISOString(),
          verificationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
          signerInfo: signerData
        }
      }
    } catch (error) {
      return {
        success: false,
        signatureResult: {} as any,
        error: error instanceof Error ? error.message : 'Errore simulazione firma'
      }
    }
  }

  /**
   * Genera dati di test per contratto specifico
   */
  generateTestData(templateId: string): Record<string, any> {
    const testDataSets: Record<string, Record<string, any>> = {
      'contratto_base': {
        nomeCliente: 'Giuseppe',
        cognomeCliente: 'Verdi',
        cfCliente: 'VRDGPP45C15F205Y',
        indirizzoCliente: 'Via Roma 123, 20100 Milano (MI)',
        emailCliente: 'giuseppe.verdi@test.com',
        telefonoCliente: '+39 02 123 456 789',
        dataContratto: new Date().toLocaleDateString('it-IT'),
        pianoServizio: 'TeleAssistenza Base'
      },
      'contratto_avanzato': {
        nomeCliente: 'Maria',
        cognomeCliente: 'Rossi',
        cfCliente: 'RSSMRA70A01F205X',
        indirizzoCliente: 'Via Nazionale 456, 00100 Roma (RM)',
        emailCliente: 'maria.rossi@test.com',
        telefonoCliente: '+39 06 987 654 321',
        dataContratto: new Date().toLocaleDateString('it-IT'),
        pianoServizio: 'TeleAssistenza Avanzata',
        nomeAssistito: 'Giovanni Rossi',
        cfAssistito: 'RSSGNN30B02F205Z'
      },
      'proforma_unificata': {
        nomeCliente: 'Francesco',
        cognomeCliente: 'Bianchi',
        pianoServizio: 'TeleAssistenza Avanzata',
        importoPrimoAnno: 840,
        importoRinnovo: 600,
        dataScadenza: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT') // +30 giorni
      }
    }

    return testDataSets[templateId] || {}
  }

  // Helper methods
  private enrichContractVariables(template: ContractTemplate, variables: Record<string, any>): Record<string, any> {
    const enriched = { ...variables }
    
    // Aggiungi dati automatici
    enriched.dataGenerazione = new Date().toLocaleDateString('it-IT')
    enriched.oraGenerazione = new Date().toLocaleTimeString('it-IT')
    enriched.annoCorrente = new Date().getFullYear()
    enriched.versioneSistema = 'V11.0'
    
    // Calcola prezzi se necessario
    if (template.contractType !== 'PROFORMA') {
      enriched.importoPrimoAnno = template.pricing.firstYear
      enriched.importoRinnovo = template.pricing.renewal
      enriched.importoPrimoAnnoIva = Math.round(template.pricing.firstYear * 1.22)
      enriched.importoRinnovoIva = Math.round(template.pricing.renewal * 1.22)
    }
    
    // Genera codici contratto
    enriched.codiceContratto = `TCM-${template.contractType}-${Date.now().toString().slice(-6)}`
    
    return enriched
  }

  private async generateContractContent(template: ContractTemplate, variables: Record<string, any>): Promise<string> {
    // In produzione caricherebbe il template DOCX reale e lo convertirebbe
    // Per ora genera un HTML simulato del contratto
    
    const contractHTML = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contratto TeleMedCare - ${variables.codiceContratto}</title>
    <style>
        body { font-family: 'Times New Roman', serif; margin: 0; padding: 40px; line-height: 1.6; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #0066cc; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #0066cc; margin-bottom: 10px; }
        .contract-title { font-size: 20px; font-weight: bold; margin: 20px 0; }
        .section { margin: 30px 0; }
        .section h3 { color: #0066cc; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .party-info { background: #f9f9f9; padding: 15px; border-left: 4px solid #0066cc; margin: 15px 0; }
        .terms { text-align: justify; }
        .signature-area { margin-top: 50px; display: flex; justify-content: space-between; }
        .signature-box { width: 200px; border-top: 1px solid #333; text-align: center; padding-top: 10px; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
        .highlight { background: #fff3cd; padding: 10px; border: 1px solid #ffeaa7; border-radius: 4px; }
        .pricing-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .pricing-table th, .pricing-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .pricing-table th { background: #f2f2f2; }
        .total-row { font-weight: bold; background: #e8f4f8; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">TeleMedCare</div>
        <div>Medica GB S.r.l. - Innovazione Socio-Sanitaria</div>
        <div>Via della Salute, 123 - 20100 Milano (MI)</div>
        <div>P.IVA: 12345678901 - Tel: +39 02 123 456 789</div>
    </div>

    <div class="contract-title">
        CONTRATTO DI ${template.contractType === 'BASE' ? 'TELEASSISTENZA BASE' : 
                      template.contractType === 'AVANZATO' ? 'TELEASSISTENZA AVANZATA' : 
                      'PROFORMA DI PAGAMENTO'}
    </div>

    <div class="section">
        <h3>Art. 1 - Parti Contraenti</h3>
        
        <div class="party-info">
            <strong>IL FORNITORE:</strong><br>
            Medica GB S.r.l.<br>
            Sede Legale: Via della Salute, 123 - 20100 Milano (MI)<br>
            P.IVA: 12345678901<br>
            Email: info@medicagb.it
        </div>

        <div class="party-info">
            <strong>IL CLIENTE:</strong><br>
            ${variables.cognomeCliente} ${variables.nomeCliente}<br>
            ${variables.cfCliente ? 'C.F.: ' + variables.cfCliente : ''}<br>
            ${variables.indirizzoCliente || ''}<br>
            Email: ${variables.emailCliente || ''}<br>
            Tel: ${variables.telefonoCliente || ''}
        </div>
    </div>

    <div class="section">
        <h3>Art. 2 - Oggetto del Contratto</h3>
        <div class="terms">
            Il presente contratto ha per oggetto la fornitura del servizio <strong>${variables.pianoServizio}</strong> 
            mediante dispositivo medicale certificato SiDLY Care Pro, per la durata di 12 (dodici) mesi dalla data di attivazione.
            
            ${template.contractType === 'AVANZATO' ? 
              '<div class="highlight">Il servizio include il monitoraggio H24 tramite Centrale Operativa specializzata con intervento immediato in caso di emergenza.</div>' : ''}
        </div>
    </div>

    <div class="section">
        <h3>Art. 3 - Servizi Inclusi</h3>
        <div class="terms">
            <ul>
                <li>Dispositivo medicale certificato SiDLY Care Pro in comodato d'uso</li>
                <li>Rilevamento automatico cadute e perdita di coscienza</li>
                <li>Sistema GPS per geolocalizzazione precisa</li>
                <li>Monitoraggio parametri vitali (frequenza cardiaca, saturazione ossigeno)</li>
                <li>Comunicazione bidirezionale</li>
                <li>Pulsante SOS per emergenze</li>
                <li>Promemoria farmaci personalizzabile</li>
                <li>Notifiche automatiche ai familiari</li>
                ${template.contractType === 'AVANZATO' ? 
                  '<li><strong>Centrale Operativa H24 - 365 giorni all\'anno</strong></li><li><strong>Intervento immediato emergenze</strong></li><li><strong>Coordinamento con servizi sanitari locali</strong></li>' : ''}
            </ul>
        </div>
    </div>

    <div class="section">
        <h3>Art. 4 - Corrispettivi e Modalità di Pagamento</h3>
        
        <table class="pricing-table">
            <thead>
                <tr>
                    <th>Descrizione</th>
                    <th>Importo (€)</th>
                    <th>IVA 22%</th>
                    <th>Totale (€)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Primo Anno di Servizio</td>
                    <td>${variables.importoPrimoAnno || 0}</td>
                    <td>${Math.round((variables.importoPrimoAnno || 0) * 0.22)}</td>
                    <td class="total-row">${variables.importoPrimoAnnoIva || Math.round((variables.importoPrimoAnno || 0) * 1.22)}</td>
                </tr>
                <tr>
                    <td>Rinnovo Annuale</td>
                    <td>${variables.importoRinnovo || 0}</td>
                    <td>${Math.round((variables.importoRinnovo || 0) * 0.22)}</td>
                    <td>${variables.importoRinnovoIva || Math.round((variables.importoRinnovo || 0) * 1.22)}</td>
                </tr>
            </tbody>
        </table>

        <div class="highlight">
            <strong>Modalità di Pagamento:</strong> Bonifico bancario o carta di credito.
            <br><strong>Scadenza:</strong> 30 giorni dalla data del contratto.
        </div>
    </div>

    ${template.contractType !== 'PROFORMA' ? `
    <div class="section">
        <h3>Art. 5 - Durata e Rinnovo</h3>
        <div class="terms">
            Il contratto ha durata di 12 mesi dalla data di attivazione del servizio e si rinnova automaticamente 
            per periodi di 12 mesi, salvo disdetta comunicata con preavviso di 30 giorni.
        </div>
    </div>

    <div class="section">
        <h3>Art. 6 - Recesso</h3>
        <div class="terms">
            Il cliente ha diritto di recedere dal contratto entro 14 giorni dalla data di attivazione del servizio, 
            comunicando la decisione con raccomandata A/R o PEC.
        </div>
    </div>` : ''}

    <div class="section">
        <h3>Art. ${template.contractType !== 'PROFORMA' ? '7' : '5'} - Firma Elettronica</h3>
        <div class="terms">
            Il presente contratto sarà sottoscritto mediante firma elettronica qualificata ai sensi del Regolamento eIDAS.
            La firma digitale avrà piena validità legale.
        </div>
    </div>

    <div class="signature-area">
        <div class="signature-box">
            <div>Il Cliente</div>
            <div style="margin-top: 20px; font-size: 12px; color: #666;">
                (Firma Elettronica)
            </div>
        </div>
        <div class="signature-box">
            <div>Medica GB S.r.l.</div>
            <div style="margin-top: 20px; font-size: 12px; color: #666;">
                (Firma Elettronica)
            </div>
        </div>
    </div>

    <div class="footer">
        <p><strong>Codice Contratto:</strong> ${variables.codiceContratto}</p>
        <p>Generato il ${variables.dataGenerazione} alle ore ${variables.oraGenerazione}</p>
        <p>TeleMedCare ${variables.versioneSistema} - Sistema Automatizzato di Generazione Contratti</p>
        <p>Medica GB S.r.l. - P.IVA: 12345678901 | info@medicagb.it | www.medicagb.it</p>
    </div>
</body>
</html>`;

    return contractHTML
  }

  private calculateDocumentSize(content: string): string {
    const sizeInBytes = new Blob([content]).size
    if (sizeInBytes < 1024) return `${sizeInBytes} bytes`
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
  }
}

export { ContractPreviewService }
export default ContractPreviewService