/**
 * EMAIL_DOCUMENT_SENDER.TS - Sistema Invio Email con Documenti Allegati
 * TeleMedCare V11.0-Cloudflare - Sistema Modulare
 * 
 * Gestisce:
 * - Invio email con contratti allegati (BASE/AVANZATO)
 * - Invio email con proforma allegata
 * - Sostituzione placeholder nei template email
 * - Integrazione con EmailService (RESEND/SENDGRID)
 * - Tracking invio email nel database
 * 
 * Template utilizzati:
 * - email_invio_contratto.html (unico per BASE e AVANZATO)
 * - email_invio_proforma.html
 */

import type { D1Database } from '@cloudflare/workers-types'
import { readFile } from 'fs/promises'
import { join } from 'path'

// =====================================================================
// TYPES & INTERFACES
// =====================================================================

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface DocumentEmailData {
  // Dati destinatario
  recipientEmail: string
  recipientName: string
  
  // Dati servizio
  tipoServizio: 'BASE' | 'AVANZATO'
  prezzoFormattato: string
  
  // Dati contratto/proforma
  contractId?: string
  proformaId?: string
  numeroProforma?: string
  
  // Allegati (path o URL)
  contractPdfPath?: string
  proformaPdfPath?: string
}

// =====================================================================
// EMAIL DOCUMENT SENDER CLASS
// =====================================================================

export class EmailDocumentSender {
  private db: D1Database
  private emailService: any // EmailService instance
  private templatesDir: string
  
  constructor(db: D1Database, emailService: any) {
    this.db = db
    this.emailService = emailService
    this.templatesDir = join(process.cwd(), 'templates', 'email')
  }
  
  /**
   * Invia email con contratto allegato
   */
  async sendContractEmail(data: DocumentEmailData): Promise<EmailSendResult> {
    try {
      console.log(`📧 Preparazione invio email contratto a ${data.recipientEmail}`)
      
      // 1. Leggi template email
      const templatePath = join(this.templatesDir, 'email_invio_contratto.html')
      let emailHtml = await readFile(templatePath, 'utf-8')
      
      // 2. Sostituisci placeholder
      const placeholders = {
        'NOME_CLIENTE': data.recipientName,
        'PIANO_SERVIZIO': data.tipoServizio === 'BASE' ? 'Base' : 'Avanzato',
        'PREZZO_PIANO': data.prezzoFormattato,
        'CODICE_CLIENTE': data.contractId || ''
      }
      
      emailHtml = this.replacePlaceholders(emailHtml, placeholders)
      
      // 3. Prepara allegati
      const attachments = []
      
      if (data.contractPdfPath) {
        attachments.push({
          filename: `Contratto_TeleMedCare_${data.tipoServizio}_${data.contractId}.pdf`,
          path: data.contractPdfPath,
          contentType: 'application/pdf'
        })
      }
      
      // 4. Invia email tramite EmailService
      const subject = `TeleMedCare ${data.tipoServizio} - Contratto e Documentazione`
      
      const result = await this.emailService.sendEmail({
        to: data.recipientEmail,
        subject: subject,
        html: emailHtml,
        attachments: attachments
      })
      
      // 5. Aggiorna database se invio riuscito
      if (result.success && data.contractId) {
        await this.updateContractEmailStatus(data.contractId, true, result.messageId)
      }
      
      console.log('✅ Email contratto inviata con successo')
      
      return {
        success: true,
        messageId: result.messageId
      }
      
    } catch (error) {
      console.error('❌ Errore invio email contratto:', error)
      
      // Aggiorna database con errore
      if (data.contractId) {
        await this.updateContractEmailStatus(data.contractId, false)
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      }
    }
  }
  
  /**
   * Invia email con proforma allegata
   */
  async sendProformaEmail(data: DocumentEmailData): Promise<EmailSendResult> {
    try {
      console.log(`📧 Preparazione invio email proforma a ${data.recipientEmail}`)
      
      // 1. Leggi template email
      const templatePath = join(this.templatesDir, 'email_invio_proforma.html')
      let emailHtml = await readFile(templatePath, 'utf-8')
      
      // 2. Sostituisci placeholder
      const placeholders = {
        'NOME_CLIENTE': data.recipientName,
        'PIANO_SERVIZIO': data.tipoServizio === 'BASE' ? 'Base' : 'Avanzato',
        'NUMERO_PROFORMA': data.numeroProforma || '',
        'PREZZO_PIANO': data.prezzoFormattato
      }
      
      emailHtml = this.replacePlaceholders(emailHtml, placeholders)
      
      // 3. Prepara allegati
      const attachments = []
      
      if (data.proformaPdfPath) {
        attachments.push({
          filename: `Proforma_TeleMedCare_${data.proformaId}.pdf`,
          path: data.proformaPdfPath,
          contentType: 'application/pdf'
        })
      }
      
      // 4. Invia email tramite EmailService
      const subject = `TeleMedCare - Pro-forma ${data.tipoServizio}`
      
      const result = await this.emailService.sendEmail({
        to: data.recipientEmail,
        subject: subject,
        html: emailHtml,
        attachments: attachments
      })
      
      // 5. Aggiorna database se invio riuscito
      if (result.success && data.proformaId) {
        await this.updateProformaEmailStatus(data.proformaId, true, result.messageId)
      }
      
      console.log('✅ Email proforma inviata con successo')
      
      return {
        success: true,
        messageId: result.messageId
      }
      
    } catch (error) {
      console.error('❌ Errore invio email proforma:', error)
      
      // Aggiorna database con errore
      if (data.proformaId) {
        await this.updateProformaEmailStatus(data.proformaId, false)
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      }
    }
  }
  
  /**
   * Invia email con contratto E proforma (insieme)
   */
  async sendContractAndProformaEmail(data: DocumentEmailData): Promise<EmailSendResult> {
    try {
      console.log(`📧 Preparazione invio email contratto+proforma a ${data.recipientEmail}`)
      
      // 1. Leggi template email contratto (usa questo per entrambi)
      const templatePath = join(this.templatesDir, 'email_invio_contratto.html')
      let emailHtml = await readFile(templatePath, 'utf-8')
      
      // 2. Sostituisci placeholder
      const placeholders = {
        'NOME_CLIENTE': data.recipientName,
        'PIANO_SERVIZIO': data.tipoServizio === 'BASE' ? 'Base' : 'Avanzato',
        'PREZZO_PIANO': data.prezzoFormattato,
        'CODICE_CLIENTE': data.contractId || ''
      }
      
      emailHtml = this.replacePlaceholders(emailHtml, placeholders)
      
      // 3. Prepara ENTRAMBI gli allegati
      const attachments = []
      
      if (data.contractPdfPath) {
        attachments.push({
          filename: `Contratto_TeleMedCare_${data.tipoServizio}_${data.contractId}.pdf`,
          path: data.contractPdfPath,
          contentType: 'application/pdf'
        })
      }
      
      if (data.proformaPdfPath) {
        attachments.push({
          filename: `Proforma_TeleMedCare_${data.proformaId}.pdf`,
          path: data.proformaPdfPath,
          contentType: 'application/pdf'
        })
      }
      
      // 4. Invia email tramite EmailService
      const subject = `TeleMedCare ${data.tipoServizio} - Contratto e Pro-forma`
      
      const result = await this.emailService.sendEmail({
        to: data.recipientEmail,
        subject: subject,
        html: emailHtml,
        attachments: attachments
      })
      
      // 5. Aggiorna database per entrambi
      if (result.success) {
        if (data.contractId) {
          await this.updateContractEmailStatus(data.contractId, true, result.messageId)
        }
        if (data.proformaId) {
          await this.updateProformaEmailStatus(data.proformaId, true, result.messageId)
        }
      }
      
      console.log('✅ Email contratto+proforma inviata con successo')
      
      return {
        success: true,
        messageId: result.messageId
      }
      
    } catch (error) {
      console.error('❌ Errore invio email contratto+proforma:', error)
      
      // Aggiorna database con errore
      if (data.contractId) {
        await this.updateContractEmailStatus(data.contractId, false)
      }
      if (data.proformaId) {
        await this.updateProformaEmailStatus(data.proformaId, false)
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      }
    }
  }
  
  /**
   * Sostituisce placeholder nel template HTML
   */
  private replacePlaceholders(html: string, placeholders: Record<string, string>): string {
    let result = html
    
    for (const [key, value] of Object.entries(placeholders)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      result = result.replace(regex, value)
    }
    
    return result
  }
  
  /**
   * Aggiorna status email contratto nel database
   */
  private async updateContractEmailStatus(
    contractId: string, 
    sent: boolean, 
    messageId?: string
  ): Promise<void> {
    try {
      await this.db.prepare(`
        UPDATE contracts 
        SET 
          email_sent = ?,
          data_invio = ?,
          status = CASE WHEN ? THEN 'SENT' ELSE status END,
          updated_at = ?
        WHERE id = ?
      `).bind(
        sent,
        sent ? new Date().toISOString() : null,
        sent,
        new Date().toISOString(),
        contractId
      ).run()
      
      console.log(`✅ Status email contratto ${contractId} aggiornato: ${sent}`)
      
    } catch (error) {
      console.error('❌ Errore aggiornamento status email contratto:', error)
    }
  }
  
  /**
   * Aggiorna status email proforma nel database
   */
  private async updateProformaEmailStatus(
    proformaId: string, 
    sent: boolean, 
    messageId?: string
  ): Promise<void> {
    try {
      await this.db.prepare(`
        UPDATE proforma 
        SET 
          email_sent = ?,
          data_invio = ?,
          status = CASE WHEN ? THEN 'SENT' ELSE status END,
          updated_at = ?
        WHERE id = ?
      `).bind(
        sent,
        sent ? new Date().toISOString() : null,
        sent,
        new Date().toISOString(),
        proformaId
      ).run()
      
      console.log(`✅ Status email proforma ${proformaId} aggiornato: ${sent}`)
      
    } catch (error) {
      console.error('❌ Errore aggiornamento status email proforma:', error)
    }
  }
}

// =====================================================================
// EXPORT FUNCTIONS
// =====================================================================

/**
 * Invia email con contratto
 */
export async function sendContractEmail(
  db: D1Database,
  emailService: any,
  data: DocumentEmailData
): Promise<EmailSendResult> {
  const sender = new EmailDocumentSender(db, emailService)
  return sender.sendContractEmail(data)
}

/**
 * Invia email con proforma
 */
export async function sendProformaEmail(
  db: D1Database,
  emailService: any,
  data: DocumentEmailData
): Promise<EmailSendResult> {
  const sender = new EmailDocumentSender(db, emailService)
  return sender.sendProformaEmail(data)
}

/**
 * Invia email con contratto E proforma insieme
 */
export async function sendContractAndProformaEmail(
  db: D1Database,
  emailService: any,
  data: DocumentEmailData
): Promise<EmailSendResult> {
  const sender = new EmailDocumentSender(db, emailService)
  return sender.sendContractAndProformaEmail(data)
}
