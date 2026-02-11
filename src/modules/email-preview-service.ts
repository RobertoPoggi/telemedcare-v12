/**
 * EMAIL_PREVIEW_SERVICE.TS - Sistema Preview e Test Email
 * TeleMedCare V12.0 - Verifica Template e Contenuti Email
 * 
 * Permette di:
 * - Renderizzare email templates con dati reali
 * - Visualizzare anteprima prima dell'invio
 * - Testare personalizzazione con dati variabili
 * - Simulare invio per test workflow
 */

export interface EmailTemplate {
  id: string
  name: string
  fileName: string
  subject: string
  description: string
  requiredVariables: string[]
  templateType: 'notifica' | 'documento' | 'contratto' | 'promemoria' | 'benvenuto' | 'conferma'
}

export interface EmailPreviewData {
  template: EmailTemplate
  renderedSubject: string
  renderedContent: string
  personalizedVariables: Record<string, any>
  attachments?: string[]
  recipientEmail: string
  estimatedSize: string
}

export interface EmailTestResult {
  success: boolean
  previewData: EmailPreviewData
  validationErrors?: string[]
  testMetadata: {
    renderTime: number
    templateSize: number
    variablesUsed: number
    missingVariables: string[]
  }
}

class EmailPreviewService {
  private static instance: EmailPreviewService

  // Template definitions con i nomi italiani corretti
  private emailTemplates: EmailTemplate[] = [
    {
      id: 'email_notifica_info',
      name: 'Notifica Info Interna',
      fileName: 'email_notifica_info.html',
      subject: '🚨 Nuova Richiesta TeleMedCare - {{nomeRichiedente}} {{cognomeRichiedente}} [{{pianoServizio}}]',
      description: 'Email di notifica interna a info@medicagb.it per nuove richieste',
      requiredVariables: ['nomeRichiedente', 'cognomeRichiedente', 'email', 'pianoServizio', 'dataRichiesta', 'oraRichiesta'],
      templateType: 'notifica'
    },
    {
      id: 'email_documenti_informativi',
      name: 'Invio Documenti Informativi',
      fileName: 'email_documenti_informativi.html', 
      subject: '📋 Documentazione TeleMedCare - {{nomeCliente}}',
      description: 'Email con brochure e documentazione per richieste solo informative',
      requiredVariables: ['nomeCliente', 'emailCliente'],
      templateType: 'documento'
    },
    {
      id: 'email_invio_contratto',
      name: 'Invio Contratto per Firma',
      fileName: 'email_invio_contratto.html',
      subject: '📋 Il Tuo Contratto TeleMedCare è Pronto - Firma Elettronica',
      description: 'Email con contratto pre-compilato per firma elettronica',
      requiredVariables: ['nomeCliente', 'pianoServizio', 'emailCliente'],
      templateType: 'contratto'
    },
    {
      id: 'email_invio_proforma',
      name: 'Invio Proforma per Pagamento',
      fileName: 'email_invio_proforma.html',
      subject: '💰 Proforma TeleMedCare - Completa il Pagamento',
      description: 'Email con proforma unificata dopo firma contratto',
      requiredVariables: ['nomeCliente', 'pianoServizio', 'emailCliente'],
      templateType: 'contratto'
    },
    {
      id: 'email_benvenuto',
      name: 'Email di Benvenuto',
      fileName: 'email_benvenuto.html',
      subject: '🎉 Benvenuto in TeleMedCare - {{nomeCliente}}!',
      description: 'Email di benvenuto dopo pagamento completato',
      requiredVariables: ['nomeCliente', 'pianoServizio', 'dataAttivazione', 'codiceCliente'],
      templateType: 'benvenuto'
    },
    {
      id: 'email_conferma',
      name: 'Conferma Configurazione',
      fileName: 'email_conferma.html',
      subject: '✅ Configurazione Completata - Dispositivo {{dispositivoId}}',
      description: 'Email di conferma dopo configurazione dispositivo',
      requiredVariables: ['nomeCliente', 'dispositivoId', 'dataAssociazione'],
      templateType: 'conferma'
    },
    {
      id: 'email_promemoria',
      name: 'Email Promemoria',
      fileName: 'email_promemoria.html',
      subject: '🔔 {{tipoPromemoria}} - TeleMedCare',
      description: 'Email promemoria per richieste contratto (3 e 5 giorni)',
      requiredVariables: ['nomeCliente', 'tipoPromemoria'],
      templateType: 'promemoria'
    }
  ]

  private constructor() {}

  public static getInstance(): EmailPreviewService {
    if (!EmailPreviewService.instance) {
      EmailPreviewService.instance = new EmailPreviewService()
    }
    return EmailPreviewService.instance
  }

  /**
   * Ottieni lista template disponibili
   */
  getAvailableTemplates(): EmailTemplate[] {
    return this.emailTemplates
  }

  /**
   * Ottieni template specifico per ID
   */
  getTemplate(templateId: string): EmailTemplate | null {
    return this.emailTemplates.find(t => t.id === templateId) || null
  }

  /**
   * Renderizza template email con dati personalizzati
   */
  async renderEmailPreview(templateId: string, variables: Record<string, any>, recipientEmail: string): Promise<EmailTestResult> {
    const startTime = performance.now()
    
    try {
      const template = this.getTemplate(templateId)
      if (!template) {
        return {
          success: false,
          previewData: {} as EmailPreviewData,
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

      // Renderizza subject
      const renderedSubject = this.replaceVariables(template.subject, variables)
      
      // Carica e renderizza contenuto template
      const templateContent = await this.loadTemplateContent(template.fileName)
      const renderedContent = this.replaceVariables(templateContent, variables)

      const previewData: EmailPreviewData = {
        template,
        renderedSubject,
        renderedContent,
        personalizedVariables: variables,
        recipientEmail,
        estimatedSize: this.calculateEmailSize(renderedContent),
        attachments: this.getTemplateAttachments(templateId)
      }

      return {
        success: missingVariables.length === 0,
        previewData,
        validationErrors: missingVariables.length > 0 ? [`Variabili mancanti: ${missingVariables.join(', ')}`] : undefined,
        testMetadata: {
          renderTime: performance.now() - startTime,
          templateSize: templateContent.length,
          variablesUsed: Object.keys(variables).length,
          missingVariables
        }
      }
    } catch (error) {
      return {
        success: false,
        previewData: {} as EmailPreviewData,
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
   * Simula invio email per test workflow
   */
  async simulateEmailSend(templateId: string, variables: Record<string, any>, recipientEmail: string): Promise<{
    success: boolean
    simulationResult: {
      emailSent: boolean
      messageId: string
      deliveryTime: number
      previewData: EmailPreviewData
    }
    error?: string
  }> {
    try {
      const renderResult = await this.renderEmailPreview(templateId, variables, recipientEmail)
      
      if (!renderResult.success) {
        return {
          success: false,
          simulationResult: {} as any,
          error: renderResult.validationErrors?.join(', ')
        }
      }

      // Simula invio (in produzione qui andrebbe l'integrazione con SendGrid/Mailgun)
      const simulatedDeliveryTime = Math.random() * 1000 + 500 // 500-1500ms
      
      await new Promise(resolve => setTimeout(resolve, simulatedDeliveryTime))

      return {
        success: true,
        simulationResult: {
          emailSent: true,
          messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          deliveryTime: simulatedDeliveryTime,
          previewData: renderResult.previewData
        }
      }
    } catch (error) {
      return {
        success: false,
        simulationResult: {} as any,
        error: error instanceof Error ? error.message : 'Errore simulazione'
      }
    }
  }

  /**
   * Genera dati di test per template specifico
   */
  generateTestData(templateId: string): Record<string, any> {
    const testDataSets: Record<string, Record<string, any>> = {
      'email_notifica_info': {
        nomeRichiedente: 'Mario',
        cognomeRichiedente: 'Rossi',
        email: 'mario.rossi@test.com',
        pianoServizio: 'TeleAssistenza Avanzata',
        dataRichiesta: new Date().toLocaleDateString('it-IT'),
        oraRichiesta: new Date().toLocaleTimeString('it-IT')
      },
      'email_documenti_informativi': {
        nomeCliente: 'Anna Bianchi',
        emailCliente: 'anna.bianchi@test.com'
      },
      'email_invio_contratto': {
        nomeCliente: 'Giuseppe Verdi',
        pianoServizio: 'TeleAssistenza Base',
        emailCliente: 'giuseppe.verdi@test.com'
      },
      'email_invio_proforma': {
        nomeCliente: 'Laura Ferrari',
        pianoServizio: 'TeleAssistenza Avanzata',
        emailCliente: 'laura.ferrari@test.com'
      },
      'email_benvenuto': {
        nomeCliente: 'Roberto Silva',
        pianoServizio: 'TeleAssistenza Base',
        dataAttivazione: new Date().toLocaleDateString('it-IT'),
        codiceCliente: `TCM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      },
      'email_conferma': {
        nomeCliente: 'Elena Conti',
        dispositivoId: `SiDLY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        dataAssociazione: new Date().toLocaleDateString('it-IT')
      },
      'email_promemoria': {
        nomeCliente: 'Francesco Lombardi',
        tipoPromemoria: 'PRIMO_CONTRATTO'
      }
    }

    return testDataSets[templateId] || {}
  }

  // Helper methods
  private async loadTemplateContent(fileName: string): Promise<string> {
    // In produzione caricherebbe da /templates/email/
    // Per ora restituisce template HTML di base
    const basicTemplate = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #3B82F6; }
        .content { line-height: 1.6; color: #374151; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 14px; color: #6B7280; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">TeleMedCare</div>
            <p>Medica GB - Innovazione Socio-Sanitaria</p>
        </div>
        
        <div class="content">
            <h2>Template: ${fileName}</h2>
            <p><strong>Destinatario:</strong> {{recipientEmail}}</p>
            <p><strong>Data:</strong> {{dataRichiesta}} {{oraRichiesta}}</p>
            
            <div style="background: #EBF8FF; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3>Dati Personalizzati:</h3>
                <p>Nome Cliente: {{nomeCliente}} {{nomeRichiedente}}</p>
                <p>Email: {{emailCliente}} {{email}}</p>
                <p>Piano Servizio: {{pianoServizio}}</p>
                <p>Codice Cliente: {{codiceCliente}}</p>
                <p>Dispositivo ID: {{dispositivoId}}</p>
            </div>
            
            <p>Questo è un template di preview per <strong>${fileName}</strong>. In produzione verrà sostituito con il contenuto reale del template.</p>
        </div>
        
        <div class="footer">
            <p>TeleMedCare V12.0 - Sistema di Automazione Email<br>
            Medica GB S.r.l. | info@medicagb.it</p>
        </div>
    </div>
</body>
</html>`
    
    return basicTemplate
  }

  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template
    
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, String(variables[key] || ''))
    })
    
    return result
  }

  private calculateEmailSize(content: string): string {
    const sizeInBytes = new Blob([content]).size
    if (sizeInBytes < 1024) return `${sizeInBytes} bytes`
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
  }

  private getTemplateAttachments(templateId: string): string[] {
    const attachmentMap: Record<string, string[]> = {
      'email_documenti_informativi': ['/documents/brochure_telemedcare.pdf', '/documents/manuale_sidly.pdf'],
      'email_invio_contratto': ['/contracts/contratto_precompilato.pdf'],
      'email_invio_proforma': ['/contracts/proforma_unificata.pdf'],
      'email_benvenuto': ['/documents/guida_attivazione.pdf']
    }
    
    return attachmentMap[templateId] || []
  }
}

export { EmailPreviewService }
export default EmailPreviewService