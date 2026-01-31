import EmailService from '../modules/email-service'

/**
 * Invia notifica email automatica per nuovo lead
 * Chiamare SEMPRE dopo la creazione di un nuovo lead
 * Controlla il setting 'admin_email_notifications_enabled' prima di inviare
 */
export async function sendNewLeadNotification(
  leadId: string,
  leadData: {
    nomeRichiedente: string
    cognomeRichiedente?: string
    email?: string
    telefono?: string
    citta?: string
    servizio?: string
    piano?: string
    fonte?: string
    note?: string
    created_at?: string
  },
  env: any
): Promise<void> {
  try {
    // Controlla se le notifiche admin sono abilitate
    if (env?.DB) {
      const setting = await env.DB.prepare(
        'SELECT value FROM settings WHERE key = ?'
      ).bind('admin_email_notifications_enabled').first()
      
      if (setting?.value !== 'true') {
        console.log(`⏭️ [NOTIFICATION] Notifiche admin disabilitate, skip email per lead ${leadId}`)
        return
      }
    }
    
    const emailService = new EmailService(env)
    
    const nome = leadData.nomeRichiedente || 'N/A'
    const cognome = leadData.cognomeRichiedente || ''
    const email = leadData.email || 'N/A'
    const telefono = leadData.telefono || 'Non fornito'
    const citta = leadData.citta || 'Non fornita'
    const servizio = leadData.servizio || 'eCura PRO'
    const piano = leadData.piano || 'BASE'
    const fonte = leadData.fonte || 'N/A'
    const note = leadData.note || ''
    const dataCreazione = leadData.created_at 
      ? new Date(leadData.created_at).toLocaleString('it-IT')
      : new Date().toLocaleString('it-IT')

    await emailService.sendEmail({
      to: env?.EMAIL_TO_INFO || 'info@telemedcare.it',
      from: env?.EMAIL_FROM || 'info@telemedcare.it',
      subject: `🆕 Nuovo Lead: ${nome} ${cognome} - ${piano}`,
      html: `
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuovo Lead TeleMedCare</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🆕 Nuovo Lead TeleMedCare</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;"><strong>Richiesta ricevuta:</strong> ${dataCreazione}</p>
            
            <h2 style="color: #667eea; margin-top: 30px;">👤 Dati Richiedente</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Nome:</td>
                <td style="padding: 10px;">${nome} ${cognome}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Email:</td>
                <td style="padding: 10px;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Telefono:</td>
                <td style="padding: 10px;">${telefono}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Città:</td>
                <td style="padding: 10px;">${citta}</td>
              </tr>
            </table>
            
            <h2 style="color: #667eea; margin-top: 30px;">📋 Dettagli Servizio</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Servizio:</td>
                <td style="padding: 10px;">${servizio}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Piano:</td>
                <td style="padding: 10px;">${piano}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Fonte:</td>
                <td style="padding: 10px;">${fonte}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Lead ID:</td>
                <td style="padding: 10px;"><code>${leadId}</code></td>
              </tr>
            </table>
            
            ${note ? `
            <h2 style="color: #667eea; margin-top: 30px;">📝 Note</h2>
            <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">${note}</p>
            </div>
            ` : ''}
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="https://telemedcare-v12.pages.dev/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visualizza nella Dashboard</a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
            <p style="margin: 5px 0;">TeleMedCare - Sistema di Gestione Lead</p>
            <p style="margin: 5px 0;">info@telemedcare.it</p>
          </div>
        </body>
        </html>
      `,
      text: `Nuovo Lead: ${nome} ${cognome}\n\nEmail: ${email}\nTelefono: ${telefono}\nCittà: ${citta}\nServizio: ${servizio} - ${piano}\nFonte: ${fonte}\nLead ID: ${leadId}`
    })

    console.log(`📧 [NOTIFICATION] Email inviata per nuovo lead ${leadId} (fonte: ${fonte})`)
  } catch (error) {
    console.error(`⚠️ [NOTIFICATION] Errore invio email per lead ${leadId}:`, error)
    // Non bloccare l'operazione se l'email fallisce
  }
}
