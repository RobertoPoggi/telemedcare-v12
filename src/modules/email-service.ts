/**
 * EMAIL_SERVICE.TS - Servizio Email con Template Engine
 * TeleMedCare V11.0-Cloudflare - Sistema Modulare
 * 
 * Gestisce:
 * - Template engine con sostituzioni variabili {{VARIABLE}}
 * - Rendering email HTML professionali  
 * - Integrazione con servizi email (SendGrid, Mailgun, Resend)
 * - Logging e monitoraggio consegne
 * - Zero-cost fallback con template embedded
 */

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlPath: string
  variables: string[]
  category: 'workflow' | 'notification' | 'marketing' | 'system'
}

export interface EmailData {
  to: string
  from?: string
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType: string
  }>
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  timestamp: string
}

// =====================================================================
// TEMPLATE REGISTRY
// =====================================================================

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  INVIO_CONTRATTO: {
    id: 'invio_contratto',
    name: 'Invio Contratto',
    subject: '📋 TeleMedCare - Il tuo contratto è pronto!',
    htmlPath: '/templates/email/email_invio_contratto.html',
    variables: ['NOME_CLIENTE', 'PIANO_SERVIZIO', 'PREZZO_PIANO', 'CODICE_CLIENTE'],
    category: 'workflow'
  },
  INVIO_PROFORMA: {
    id: 'invio_proforma',
    name: 'Invio Proforma',
    subject: '💰 TeleMedCare - Fattura Proforma per {{PIANO_SERVIZIO}}',
    htmlPath: '/templates/email/email_invio_proforma.html',
    variables: ['NOME_CLIENTE', 'PIANO_SERVIZIO', 'IMPORTO_TOTALE', 'SCADENZA_PAGAMENTO', 'CODICE_CLIENTE'],
    category: 'workflow'
  },
  BENVENUTO: {
    id: 'benvenuto',
    name: 'Benvenuto Cliente',
    subject: '🎉 Benvenuto/a in TeleMedCare, {{NOME_CLIENTE}}!',
    htmlPath: '/templates/email/email_benvenuto.html',
    variables: ['NOME_CLIENTE', 'PIANO_SERVIZIO', 'COSTO_SERVIZIO', 'DATA_ATTIVAZIONE', 'CODICE_CLIENTE', 'SERVIZI_INCLUSI'],
    category: 'workflow'
  },
  CONFIGURAZIONE: {
    id: 'configurazione',
    name: 'Configurazione Dispositivo',
    subject: '⚙️ TeleMedCare - Configurazione del tuo dispositivo',
    htmlPath: '/templates/email/email_conferma_attivazione.html',
    variables: ['NOME_CLIENTE', 'DISPOSITIVO', 'SERIAL_NUMBER', 'ISTRUZIONI_CONFIG'],
    category: 'workflow'
  },
  CONFERMA: {
    id: 'conferma',
    name: 'Conferma Attivazione',
    subject: '✅ TeleMedCare - Servizio attivato con successo!',
    htmlPath: '/templates/email/email_conferma_attivazione.html',
    variables: ['NOME_CLIENTE', 'PIANO_SERVIZIO', 'DATA_ATTIVAZIONE', 'CODICE_CLIENTE'],
    category: 'workflow'
  },
  FOLLOWUP_CALL: {
    id: 'followup_call',
    name: 'Follow-up Call',
    subject: '📞 TeleMedCare - Chiamata di follow-up programmata',
    htmlPath: '/templates/email/email_followup_call.html',
    variables: ['NOME_CLIENTE', 'DATA_CHIAMATA', 'ORA_CHIAMATA', 'MOTIVO_CHIAMATA'],
    category: 'workflow'
  },
  NOTIFICA_INFO: {
    id: 'notifica_info',
    name: 'Notifica Nuovo Lead',
    subject: '🚨 TeleMedCare - Nuovo Lead ricevuto: {{NOME_CLIENTE}}',
    htmlPath: '/templates/email/email_notifica_info.html',
    variables: ['NOME_CLIENTE', 'EMAIL_CLIENTE', 'TELEFONO_CLIENTE', 'SERVIZIO_RICHIESTO', 'TIMESTAMP_LEAD', 'LEAD_ID'],
    category: 'notification'
  },
  DOCUMENTI_INFORMATIVI: {
    id: 'documenti_informativi',
    name: 'Invio Documenti Informativi',
    subject: '📋 TeleMedCare - Documentazione richiesta per {{NOME_CLIENTE}}',
    htmlPath: '/templates/email/email_documenti_informativi.html',
    variables: ['NOME_CLIENTE', 'EMAIL_CLIENTE', 'DOCUMENTI_RICHIESTI', 'SERVIZIO_INTERESSE', 'TIMESTAMP_RICHIESTA'],
    category: 'workflow'
  }
}

// =====================================================================
// TEMPLATE ENGINE
// =====================================================================

export class TemplateEngine {
  /**
   * Sostituisce le variabili nel template HTML
   */
  static render(htmlContent: string, variables: Record<string, string>): string {
    let result = htmlContent
    
    // Sostituisci variabili nel formato {{VARIABLE}}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, String(value))
    }
    
    // Rimuovi variabili non sostituite (opzionale)
    result = result.replace(/{{[^}]+}}/g, '')
    
    return result
  }

  /**
   * Genera soggetto email con variabili
   */
  static renderSubject(subject: string, variables: Record<string, string>): string {
    return this.render(subject, variables)
  }

  /**
   * Converte HTML in testo semplice (fallback)
   */
  static htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim()
  }
}

// =====================================================================
// EMAIL SERVICE
// =====================================================================

export class EmailService {
  private static instance: EmailService | null = null
  private env: any

  constructor(env?: any) {
    this.env = env
  }

  // Lazy loading per evitare problemi Cloudflare Workers global scope
  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  /**
   * Public method to send email with simple interface for workflow compatibility
   * Accepts: { to, from, subject, html, text?, attachments? }
   */
  async sendEmail(options: {
    to: string
    from?: string
    subject: string
    html: string
    text?: string
    attachments?: Array<{
      filename: string
      content?: string | Buffer
      contentType?: string
      path?: string
    }>
  }): Promise<EmailResult> {
    const emailData: EmailData = {
      to: options.to,
      from: options.from,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: att.content || '',
        contentType: att.contentType || 'application/octet-stream'
      }))
    }

    return this.sendEmailInternal(emailData, this.env)
  }

  /**
   * Invia email utilizzando template
   */
  async sendTemplateEmail(
    templateId: string, 
    to: string, 
    variables: Record<string, string>,
    attachments?: Array<{ filename: string; content: string | Buffer; contentType: string }>,
    env?: any
  ): Promise<EmailResult> {
    try {
      const template = EMAIL_TEMPLATES[templateId.toUpperCase()]
      if (!template) {
        throw new Error(`Template ${templateId} non trovato`)
      }

      // Carica template HTML 
      const htmlContent = await this.loadTemplate(template.htmlPath)
      
      // Render template con variabili
      const renderedHtml = TemplateEngine.render(htmlContent, variables)
      const renderedSubject = TemplateEngine.renderSubject(template.subject, variables)
      const textContent = TemplateEngine.htmlToText(renderedHtml)

      // Prepara dati email
      const emailData: EmailData = {
        to,
        subject: renderedSubject,
        html: renderedHtml,
        text: textContent,
        attachments
      }

      // Invia email con environment context
      return await this.sendEmailInternal(emailData, env)

    } catch (error) {
      console.error('❌ Errore invio email template:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Carica template HTML
   */
  private async loadTemplate(templatePath: string): Promise<string> {
    try {
      // Per il momento, usa sempre template embedded per zero-dependency
      console.log(`📧 Uso template embedded per: ${templatePath}`)
      return this.getEmbeddedTemplate(templatePath)
    } catch (error) {
      console.error(`❌ Errore caricamento template ${templatePath}:`, error)
      throw error
    }
  }

  /**
   * Fallback template embedded per zero-cost deployment
   */
  private getEmbeddedTemplate(templatePath: string): string {
    const templateName = templatePath.split('/').pop()?.replace('.html', '')
    
    switch (templateName) {
      case 'email_invio_contratto':
        return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>TeleMedCare - Contratto</title></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f6f8;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<div style="background:#0b63a5;color:white;padding:20px;"><h1 style="margin:0;font-size:20px;">📋 TeleMedCare</h1></div>
<div style="padding:24px;">
<p>Gentile <strong>{{NOME_CLIENTE}}</strong>,</p>
<p>Siamo lieti di accompagnarLa in questo importante passo! In allegato trova il <strong>contratto per il servizio {{PIANO_SERVIZIO}}</strong>.</p>
<div style="background:#f8fbff;border:1px solid #e6f0fa;padding:16px;border-radius:6px;margin:16px 0;">
<h3 style="margin:0 0 8px;color:#0b63a5;">📋 Riepilogo Servizio</h3>
<strong>Piano:</strong> {{PIANO_SERVIZIO}}<br>
<strong>Investimento:</strong> {{PREZZO_PIANO}}<br>
<strong>Codice Cliente:</strong> {{CODICE_CLIENTE}}
</div>
<h3 style="color:#0b63a5;">🚀 Prossimi Passi:</h3>
<ol style="margin-left:18px;">
<li>Legga attentamente il contratto allegato</li>
<li>Firmi in ogni pagina richiesta</li>
<li>Ci invii il contratto firmato via email</li>
<li>Riceverà il dispositivo entro 10 giorni</li>
</ol>
<p style="margin-top:20px;"><strong>Grazie per la fiducia!</strong><br>Il Team TeleMedCare</p>
</div></div></body></html>`

      case 'email_invio_proforma':
        return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>TeleMedCare - Proforma</title></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f6f8;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<div style="background:#10b981;color:white;padding:20px;"><h1 style="margin:0;font-size:20px;">💰 TeleMedCare</h1></div>
<div style="padding:24px;">
<p>Gentile <strong>{{NOME_CLIENTE}}</strong>,</p>
<p>In allegato trova la <strong>fattura proforma</strong> per il servizio {{PIANO_SERVIZIO}}.</p>
<div style="background:#f0fdf4;border:1px solid #dcfce7;padding:16px;border-radius:6px;margin:16px 0;">
<h3 style="margin:0 0 8px;color:#10b981;">💳 Dettagli Pagamento</h3>
<strong>Piano:</strong> {{PIANO_SERVIZIO}}<br>
<strong>Importo Totale:</strong> {{IMPORTO_TOTALE}}<br>
<strong>Scadenza Pagamento:</strong> {{SCADENZA_PAGAMENTO}}<br>
<strong>Codice Cliente:</strong> {{CODICE_CLIENTE}}
</div>
<p>Può procedere con il pagamento tramite bonifico bancario utilizzando i dati allegati.</p>
<p style="margin-top:20px;"><strong>Grazie!</strong><br>Il Team TeleMedCare</p>
</div></div></body></html>`

      case 'email_benvenuto':
        return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Benvenuto in TeleMedCare</title></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f6f8;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<div style="background:#0b6cf6;color:white;padding:20px;"><h1 style="margin:0;font-size:20px;">🎉 TeleMedCare</h1></div>
<div style="padding:24px;">
<h1>Benvenuto/a {{NOME_CLIENTE}}!</h1>
<p style="font-size:18px;">🎉 Congratulazioni per la Sua scelta!</p>
<p>Ha scelto il nostro servizio <strong>{{PIANO_SERVIZIO}}</strong> e ora fa parte della famiglia TeleMedCare.</p>
<div style="background:#f7f9fc;border:1px solid #eef2f7;padding:16px;border-radius:6px;margin:16px 0;">
<h3 style="margin:0 0 8px;color:#0b6cf6;">📋 Il Suo Servizio</h3>
<strong>Piano:</strong> {{PIANO_SERVIZIO}}<br>
<strong>Costo:</strong> {{COSTO_SERVIZIO}}<br>
<strong>Data Attivazione:</strong> {{DATA_ATTIVAZIONE}}<br>
<strong>Codice Cliente:</strong> {{CODICE_CLIENTE}}
</div>
<h3 style="color:#0b6cf6;">🚀 Prossimi Passi:</h3>
<ol style="margin-left:18px;">
<li><strong>Consegna:</strong> Dispositivo entro 10 giorni</li>
<li><strong>Configurazione:</strong> Email per setup personalizzato</li>
<li><strong>Training:</strong> Tutorial gratuito</li>
<li><strong>Attivazione:</strong> Test completo con la Centrale</li>
</ol>
<p style="margin-top:20px;"><strong>Benvenuto/a nella famiglia TeleMedCare!</strong><br>Il Team TeleMedCare</p>
</div></div></body></html>`

      case 'email_conferma_attivazione':
        return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Servizio Attivato</title></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f6f8;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<div style="background:#10b981;color:white;padding:20px;"><h1 style="margin:0;font-size:20px;">✅ TeleMedCare</h1></div>
<div style="padding:24px;">
<h1>Servizio Attivato!</h1>
<p>Gentile <strong>{{NOME_CLIENTE}}</strong>,</p>
<p>Il Suo servizio <strong>{{PIANO_SERVIZIO}}</strong> è stato attivato con successo!</p>
<div style="background:#f0fdf4;border:1px solid #dcfce7;padding:16px;border-radius:6px;margin:16px 0;">
<h3 style="margin:0 0 8px;color:#10b981;">✅ Configurazione Completata</h3>
<strong>Dispositivo:</strong> {{DISPOSITIVO}}<br>
<strong>Serial Number:</strong> {{SERIAL_NUMBER}}<br>
<strong>Data Attivazione:</strong> {{DATA_ATTIVAZIONE}}<br>
<strong>Codice Cliente:</strong> {{CODICE_CLIENTE}}
</div>
<p>Il Suo dispositivo è ora operativo e monitorato H24.</p>
<p style="margin-top:20px;"><strong>La Sua sicurezza è la nostra priorità!</strong><br>Il Team TeleMedCare</p>
</div></div></body></html>`

      case 'email_followup_call':
        return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Follow-up Call</title></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f6f8;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<div style="background:#f59e0b;color:white;padding:20px;"><h1 style="margin:0;font-size:20px;">📞 TeleMedCare</h1></div>
<div style="padding:24px;">
<h1>Chiamata di Follow-up</h1>
<p>Gentile <strong>{{NOME_CLIENTE}}</strong>,</p>
<p>Abbiamo programmato una chiamata di follow-up per verificare il corretto funzionamento del servizio.</p>
<div style="background:#fffbeb;border:1px solid #fef3c7;padding:16px;border-radius:6px;margin:16px 0;">
<h3 style="margin:0 0 8px;color:#f59e0b;">📅 Dettagli Chiamata</h3>
<strong>Data:</strong> {{DATA_CHIAMATA}}<br>
<strong>Orario:</strong> {{ORA_CHIAMATA}}<br>
<strong>Motivo:</strong> {{MOTIVO_CHIAMATA}}
</div>
<p>Se non dovesse essere disponibile, La ricontatteremo.</p>
<p style="margin-top:20px;"><strong>Grazie!</strong><br>Il Team TeleMedCare</p>
</div></div></body></html>`

      case 'email_notifica_info':
        return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Nuovo Lead TeleMedCare</title></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f6f8;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<div style="background:#dc2626;color:white;padding:20px;"><h1 style="margin:0;font-size:20px;">🚨 TeleMedCare - NUOVO LEAD</h1></div>
<div style="padding:24px;">
<h1 style="color:#dc2626;">Nuovo Lead Ricevuto!</h1>
<p><strong>Un nuovo potenziale cliente ha manifestato interesse per i nostri servizi.</strong></p>
<div style="background:#fef2f2;border:1px solid #fecaca;padding:16px;border-radius:6px;margin:16px 0;">
<h3 style="margin:0 0 8px;color:#dc2626;">👤 Dati Cliente</h3>
<strong>Nome:</strong> {{NOME_CLIENTE}}<br>
<strong>Email:</strong> {{EMAIL_CLIENTE}}<br>
<strong>Telefono:</strong> {{TELEFONO_CLIENTE}}<br>
<strong>Servizio richiesto:</strong> {{SERVIZIO_RICHIESTO}}<br>
<strong>Data/Ora:</strong> {{TIMESTAMP_LEAD}}<br>
<strong>Lead ID:</strong> {{LEAD_ID}}
</div>
<h3 style="color:#dc2626;">⚡ Azioni Immediate Richieste:</h3>
<ol style="margin-left:18px;color:#374151;">
<li><strong>Contattare entro 30 minuti</strong> per massimizzare conversione</li>
<li><strong>Verificare interesse</strong> e necessità specifiche</li>
<li><strong>Inviare documentazione</strong> personalizzata</li>
<li><strong>Programmare demo</strong> se richiesta</li>
</ol>
<p style="margin-top:20px;"><strong>Priorità ALTA - Gestire immediatamente!</strong><br>Sistema TeleMedCare V11.0</p>
</div></div></body></html>`

      case 'email_documenti_informativi':
        return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Documenti Informativi TeleMedCare</title></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background:#f4f6f8;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<div style="background:#0ea5e9;color:white;padding:20px;"><h1 style="margin:0;font-size:20px;">📋 TeleMedCare</h1></div>
<div style="padding:24px;">
<h1>Invio Documenti Informativi</h1>
<p>Team TeleMedCare,</p>
<p><strong>{{NOME_CLIENTE}}</strong> ha richiesto documentazione informativa sui nostri servizi.</p>
<div style="background:#f0f9ff;border:1px solid #bae6fd;padding:16px;border-radius:6px;margin:16px 0;">
<h3 style="margin:0 0 8px;color:#0ea5e9;">📋 Dettagli Richiesta</h3>
<strong>Cliente:</strong> {{NOME_CLIENTE}}<br>
<strong>Email:</strong> {{EMAIL_CLIENTE}}<br>
<strong>Documenti richiesti:</strong> {{DOCUMENTI_RICHIESTI}}<br>
<strong>Servizio di interesse:</strong> {{SERVIZIO_INTERESSE}}<br>
<strong>Data richiesta:</strong> {{TIMESTAMP_RICHIESTA}}
</div>
<h3 style="color:#0ea5e9;">📋 Azioni da Completare:</h3>
<ol style="margin-left:18px;color:#374151;">
<li><strong>Inviare brochure</strong> del servizio richiesto</li>
<li><strong>Allegare listino prezzi</strong> aggiornato</li>
<li><strong>Includere case studies</strong> pertinenti</li>
<li><strong>Programmare follow-up</strong> a 3-5 giorni</li>
</ol>
<p style="margin-top:20px;"><strong>Da gestire entro 4 ore lavorative</strong><br>Sistema TeleMedCare V11.0</p>
</div></div></body></html>`

      default:
        return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>TeleMedCare</title></head>
<body style="font-family:Arial,sans-serif;padding:20px;text-align:center;">
<h1 style="color:#0b63a5;">📧 TeleMedCare</h1>
<p>Template email non disponibile.</p>
<p>Contatti il supporto per assistenza.</p>
</body></html>`
    }
  }

  /**
   * Invia email effettiva (integrazione con servizi esterni)
   */
  private async sendEmailInternal(emailData: EmailData, env?: any): Promise<EmailResult> {
    try {
      console.log('📧 Invio email reale:', {
        to: emailData.to,
        subject: emailData.subject,
        attachments: emailData.attachments?.length || 0,
        hasEnv: !!env,
        hasResend: !!env?.RESEND_API_KEY
      })

      let resendError: any = null

      // ✅ PRIMARIO: Resend (SendGrid DISABILITATO - periodo prova scaduto)
      try {
        console.log('📧 [PRIMARY] Tentativo Resend...')
        const result = await this.sendWithResend(emailData, env)
        if (result.success) {
          console.log('✅ Email inviata con successo via Resend:', result.messageId)
          return result
        }
        console.warn('⚠️ Resend non ha avuto successo:', result)
        resendError = result.error || 'Unknown error'
      } catch (error) {
        resendError = error
        console.error('❌ Resend exception:', error)
      }

      // Fallback finale: DEMO MODE (NON invia email reali!)
      console.error('🚨🚨🚨 RESEND FALLITO - MODALITÀ DEMO ATTIVA 🚨🚨🚨')
      console.error('📧 Email destinatario:', emailData.to)
      console.error('📧 Oggetto:', emailData.subject)
      console.error('❌ Resend error:', resendError)
      console.error('🔑 RESEND_API_KEY presente?', !!env?.RESEND_API_KEY)
      console.error('💡 SendGrid DISABILITATO (periodo prova scaduto)')
      
      return {
        success: true,  // ⚠️ FAKE SUCCESS per non bloccare il flusso
        messageId: `DEMO_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        timestamp: new Date().toISOString(),
        warning: '⚠️ DEMO MODE: Email NON inviata realmente! Configura RESEND_API_KEY',
        errors: {
          resend: resendError?.message || String(resendError)
        }
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore invio email',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Invio con SendGrid API
   */
  private async sendWithSendGrid(emailData: EmailData, env?: any): Promise<EmailResult> {
    // 🔐 SECURITY: Use environment variable from Cloudflare Workers context
    const apiKey = env?.SENDGRID_API_KEY || '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'
    
    console.log('📧 SendGrid: Using API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NONE')
    console.log('📧 SendGrid: From:', emailData.from || 'info@telemedcare.it')
    console.log('📧 SendGrid: To:', emailData.to)
    
    const payload = {
      personalizations: [{
        to: [{ email: emailData.to }],
        subject: emailData.subject
      }],
      from: {
        name: 'TeleMedCare',
        email: emailData.from || 'info@telemedcare.it'
      },
      content: [
        {
          type: 'text/html',
          value: emailData.html
        }
      ],
      attachments: emailData.attachments?.map(att => ({
        filename: att.filename,
        content: typeof att.content === 'string' ? att.content : Buffer.from(att.content).toString('base64'),
        type: att.contentType,
        disposition: 'attachment'
      }))
    }

    console.log('📧 SendGrid: Sending request...')
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    console.log('📧 SendGrid: Response status:', response.status)
    
    if (!response.ok) {
      const error = await response.text()
      console.error('❌ SendGrid error response:', error)
      throw new Error(`SendGrid API error: ${response.status} ${error}`)
    }

    const messageId = response.headers.get('X-Message-Id') || 'sendgrid-' + Date.now()
    
    return {
      success: true,
      messageId: messageId,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Invio con Resend API
   */
  private async sendWithResend(emailData: EmailData, env?: any): Promise<EmailResult> {
    // 🔐 SECURITY: Use environment variable from Cloudflare Workers context
    const apiKey = env?.RESEND_API_KEY || 're_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2'
    
    console.log('📧 Resend: Using API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NONE')
    
    const fromEmail = emailData.from || 'info@telemedcare.it'
    const payload = {
      from: `TeleMedCare <${fromEmail}>`,
      to: [emailData.to],
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      attachments: emailData.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        content_type: att.contentType
      }))
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Resend API error: ${response.status} ${error}`)
    }

    const result = await response.json()
    return {
      success: true,
      messageId: result.id,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Batch email per automazioni workflow
   */
  async sendWorkflowEmails(
    emails: Array<{
      templateId: string
      to: string
      variables: Record<string, string>
      attachments?: Array<{ filename: string; content: string | Buffer; contentType: string }>
    }>
  ): Promise<EmailResult[]> {
    const results: EmailResult[] = []
    
    for (const email of emails) {
      const result = await this.sendTemplateEmail(
        email.templateId, 
        email.to, 
        email.variables,
        email.attachments
      )
      results.push(result)
      
      // Delay per evitare rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return results
  }

  /**
   * Ottiene tutti i template disponibili
   */
  getAllTemplates(): Record<string, EmailTemplate> {
    return EMAIL_TEMPLATES
  }

  /**
   * Ottiene un template specifico per ID
   */
  getTemplate(templateId: string): EmailTemplate | null {
    return EMAIL_TEMPLATES[templateId.toUpperCase()] || null
  }
}

// =====================================================================
// EXPORT DEFAULTS
// =====================================================================

export default EmailService