/**
 * Lead Completion System
 * 
 * Sistema per gestire il completamento dati di lead incompleti:
 * - Generazione token sicuri con scadenza configurabile
 * - Email automatica con link form pre-compilato
 * - Reminder automatici configurabili
 * - Logging completo delle azioni
 * 
 * @module lead-completion
 */

import { D1Database } from '@cloudflare/workers-types'
import { getBaseUrl } from './url-helper'

// ============================================
// TYPES & INTERFACES
// ============================================

export interface LeadCompletionToken {
  id: string
  lead_id: string
  token: string
  expires_at: string
  completed: number
  created_at: string
  completed_at: string | null
  reminder_sent_at: string | null
  reminder_count: number
}

export interface SystemConfig {
  auto_completion_enabled: boolean
  auto_completion_token_days: number
  auto_completion_reminder_days: number
  auto_completion_max_reminders: number
  cron_enabled: boolean  // Interruttore ON/OFF per il cron reminder
  hubspot_sync_enabled: boolean  // Interruttore ON/OFF per sync HubSpot
}

export interface MissingFields {
  telefono?: boolean
  nomeAssistito?: boolean
  cognomeAssistito?: boolean
  dataNascitaAssistito?: boolean
  luogoNascitaAssistito?: boolean
  cfAssistito?: boolean
  indirizzoAssistito?: boolean
  condizioniSalute?: boolean
  // Aggiungi altri campi obbligatori
}

export interface CompletionEmailData {
  leadId: string
  nomeRichiedente: string
  cognomeRichiedente: string
  email: string
  token: string
  completionUrl: string
  missingFields: string[]
  availableFields: Record<string, any>
  expiresInDays: number
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Genera un token sicuro random
 */
export function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

/**
 * Calcola data scadenza token
 */
export function calculateExpiryDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

/**
 * Verifica quali campi mancano per completare un lead
 * Basato sui campi obbligatori per il contratto
 */
export function getMissingFields(leadData: any): { missing: string[]; available: Record<string, any> } {
  const requiredFields = {
    // Dati richiedente (per contratto)
    telefono: 'Telefono',
    
    // Dati assistito (obbligatori per contratto)
    nomeAssistito: 'Nome Assistito',
    cognomeAssistito: 'Cognome Assistito',
    dataNascitaAssistito: 'Data di Nascita Assistito',
    luogoNascitaAssistito: 'Luogo di Nascita Assistito',
    cfAssistito: 'Codice Fiscale Assistito',  // DB usa cfAssistito, non cfAssistito
    indirizzoAssistito: 'Indirizzo Assistito',
    capAssistito: 'CAP Assistito',
    cittaAssistito: 'Città Assistito',
    provinciaAssistito: 'Provincia Assistito',
    
    // Condizioni salute (importante per servizio)
    condizioniSalute: 'Condizioni di Salute',
  }
  
  const missing: string[] = []
  const available: Record<string, any> = {}
  
  Object.entries(requiredFields).forEach(([fieldKey, fieldLabel]) => {
    const value = leadData[fieldKey]
    if (!value || value === '' || value === null || value === undefined) {
      missing.push(fieldLabel)
    } else {
      available[fieldLabel] = value
    }
  })
  
  // Aggiungi campi sempre disponibili (già inseriti)
  if (leadData.nomeRichiedente) available['Nome Richiedente'] = leadData.nomeRichiedente
  if (leadData.cognomeRichiedente) available['Cognome Richiedente'] = leadData.cognomeRichiedente
  if (leadData.email) available['Email'] = leadData.email
  if (leadData.servizio) available['Servizio Richiesto'] = leadData.servizio
  if (leadData.piano) available['Piano Selezionato'] = leadData.piano
  
  return { missing, available }
}

/**
 * Verifica se un lead è completo
 */
export function isLeadComplete(leadData: any): boolean {
  const { missing } = getMissingFields(leadData)
  return missing.length === 0
}

// ============================================
// DATABASE OPERATIONS
// ============================================

/**
 * Ottiene configurazione sistema
 */
export async function getSystemConfig(db: D1Database): Promise<SystemConfig> {
  const configs = await db.prepare('SELECT key, value FROM system_config').all()
  
  const config: any = {}
  configs.results.forEach((row: any) => {
    const key = row.key
    const value = row.value
    
    if (key === 'auto_completion_enabled' || key === 'cron_enabled' || key === 'hubspot_sync_enabled') {
      config[key] = value === 'true'
    } else {
      config[key] = parseInt(value, 10)
    }
  })
  
  return {
    auto_completion_enabled: config.auto_completion_enabled || false,
    auto_completion_token_days: config.auto_completion_token_days || 30,
    auto_completion_reminder_days: config.auto_completion_reminder_days || 7,  // ✅ MODIFICATO: 3→7 giorni
    auto_completion_max_reminders: config.auto_completion_max_reminders || 2,
    cron_enabled: config.cron_enabled !== undefined ? config.cron_enabled : true,  // Default: true
    hubspot_sync_enabled: config.hubspot_sync_enabled !== undefined ? config.hubspot_sync_enabled : false  // Default: false
  }
}

/**
 * Aggiorna configurazione sistema
 */
export async function updateSystemConfig(
  db: D1Database,
  key: keyof SystemConfig,
  value: string | number | boolean
): Promise<void> {
  const stringValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value)
  
  await db.prepare(`
    INSERT INTO system_config (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `).bind(key, stringValue).run()
}

/**
 * Crea un nuovo token di completamento
 */
export async function createCompletionToken(
  db: D1Database,
  leadId: string,
  expiryDays: number = 30
): Promise<LeadCompletionToken> {
  const token = generateSecureToken()
  const tokenId = `TOKEN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
  const expiresAt = calculateExpiryDate(expiryDays)
  const now = new Date().toISOString()
  
  await db.prepare(`
    INSERT INTO lead_completion_tokens (
      id, lead_id, token, expires_at, completed, created_at
    ) VALUES (?, ?, ?, ?, 0, ?)
  `).bind(tokenId, leadId, token, expiresAt, now).run()
  
  // Log creazione token
  await logCompletionAction(db, leadId, tokenId, 'token_created', `Token creato, scadenza: ${expiresAt}`)
  
  return {
    id: tokenId,
    lead_id: leadId,
    token,
    expires_at: expiresAt,
    completed: 0,
    created_at: now,
    completed_at: null,
    reminder_sent_at: null,
    reminder_count: 0
  }
}

/**
 * Valida un token di completamento
 */
export async function validateCompletionToken(
  db: D1Database,
  token: string
): Promise<{ valid: boolean; tokenData?: LeadCompletionToken; error?: string }> {
  const result = await db.prepare(
    'SELECT * FROM lead_completion_tokens WHERE token = ? LIMIT 1'
  ).bind(token).first<LeadCompletionToken>()
  
  if (!result) {
    return { valid: false, error: 'Token non trovato' }
  }
  
  if (result.completed) {
    return { valid: false, error: 'Token già utilizzato' }
  }
  
  const now = new Date()
  const expiresAt = new Date(result.expires_at)
  
  if (now > expiresAt) {
    return { valid: false, error: 'Token scaduto' }
  }
  
  return { valid: true, tokenData: result }
}

/**
 * Marca un token come completato
 */
export async function markTokenAsCompleted(
  db: D1Database,
  tokenId: string
): Promise<void> {
  const now = new Date().toISOString()
  
  await db.prepare(`
    UPDATE lead_completion_tokens
    SET completed = 1, completed_at = ?
    WHERE id = ?
  `).bind(now, tokenId).run()
  
  // Ottieni lead_id per log
  const tokenData = await db.prepare(
    'SELECT lead_id FROM lead_completion_tokens WHERE id = ?'
  ).bind(tokenId).first<{ lead_id: string }>()
  
  if (tokenData) {
    await logCompletionAction(db, tokenData.lead_id, tokenId, 'completed', 'Lead completato con successo')
  }
}

/**
 * Registra un reminder inviato
 */
export async function recordReminderSent(
  db: D1Database,
  tokenId: string
): Promise<void> {
  const now = new Date().toISOString()
  
  await db.prepare(`
    UPDATE lead_completion_tokens
    SET reminder_sent_at = ?, reminder_count = reminder_count + 1
    WHERE id = ?
  `).bind(now, tokenId).run()
  
  const tokenData = await db.prepare(
    'SELECT lead_id, reminder_count FROM lead_completion_tokens WHERE id = ?'
  ).bind(tokenId).first<{ lead_id: string; reminder_count: number }>()
  
  if (tokenData) {
    await logCompletionAction(
      db,
      tokenData.lead_id,
      tokenId,
      'reminder_sent',
      `Reminder ${tokenData.reminder_count} inviato`
    )
  }
}

/**
 * Ottiene token per lead specifico
 */
export async function getTokenForLead(
  db: D1Database,
  leadId: string
): Promise<LeadCompletionToken | null> {
  return db.prepare(`
    SELECT * FROM lead_completion_tokens
    WHERE lead_id = ? AND completed = 0
    ORDER BY created_at DESC
    LIMIT 1
  `).bind(leadId).first<LeadCompletionToken>()
}

/**
 * Ottiene token che necessitano reminder
 * 
 * FIX: Aggiunta protezione contro invii multipli nello stesso giorno
 * Invia reminder SOLO se passate almeno 23 ore dall'ultimo invio
 */
export async function getTokensNeedingReminder(
  db: D1Database,
  reminderDays: number,
  maxReminders: number
): Promise<LeadCompletionToken[]> {
  const reminderDate = new Date()
  reminderDate.setDate(reminderDate.getDate() - reminderDays)
  
  // FIX: 23 ore di protezione contro doppi invii
  const minTimeBetweenReminders = new Date()
  minTimeBetweenReminders.setHours(minTimeBetweenReminders.getHours() - 23)
  
  // ============================================
  // 🎯 QUERY AVANZATA CON PRIORITÀ E FILTRI
  // ============================================
  // Regole:
  // 1. ❌ ESCLUDI lead con contratto già firmato (status = CONTRACT_SIGNED o ACTIVE)
  // 2. ❌ ESCLUDI lead "NON INTERESSATI" (status = NOT_INTERESTED)
  // 3. ✅ PRIORITÀ 1: status = "INTERESTED" (Interessati)
  // 4. ✅ PRIORITÀ 2: status = "TO_RECONTACT" (Da ricontattare)
  // 5. ✅ Più vecchi per primi (created_at ASC)
  // 6. ⚠️ NOTA: Contratti firmati manualmente possono non essere nel DB
  //    (es. Margherita Delaude, Maria Grazia Ronca - lead Andrea D'Avella)
  
  const result = await db.prepare(`
    SELECT t.*, l.status, l.nomeRichiedente, l.cognomeRichiedente, l.created_at as lead_created_at
    FROM lead_completion_tokens t
    JOIN leads l ON t.lead_id = l.id
    WHERE t.completed = 0
      AND t.expires_at > datetime('now')
      AND t.reminder_count < ?
      AND (
        t.reminder_sent_at IS NULL
        OR (
          t.reminder_sent_at < ? 
          AND t.reminder_sent_at < ?
        )
      )
      -- ❌ ESCLUDI lead già convertiti (contratti firmati o attivi)
      AND l.status NOT IN ('CONTRACT_SIGNED', 'ACTIVE')
      -- ❌ ESCLUDI lead non interessati
      AND l.status != 'NOT_INTERESTED'
      -- ✅ ORDINA PER PRIORITÀ
    ORDER BY 
      CASE l.status
        WHEN 'INTERESTED' THEN 1      -- Priorità 1: Interessati
        WHEN 'TO_RECONTACT' THEN 2    -- Priorità 2: Da ricontattare
        ELSE 3                         -- Priorità 3: Altri stati validi
      END,
      l.created_at ASC                 -- Più vecchi per primi
  `).bind(maxReminders, reminderDate.toISOString(), minTimeBetweenReminders.toISOString()).all()
  
  return result.results as LeadCompletionToken[]
}

/**
 * Log azione completamento
 */
export async function logCompletionAction(
  db: D1Database,
  leadId: string,
  tokenId: string,
  action: string,
  details: string
): Promise<void> {
  const logId = `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
  const now = new Date().toISOString()
  
  await db.prepare(`
    INSERT INTO lead_completion_log (id, lead_id, token_id, action, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(logId, leadId, tokenId, action, details, now).run()
}

/**
 * Invia email reminder per completamento dati
 * 
 * @param db - Database D1
 * @param env - Environment variables
 * @param tokenData - Token dati
 * @param leadData - Lead dati
 * @returns Promise<boolean> - true se email inviata con successo
 */
export async function sendReminderEmail(
  db: D1Database,
  env: any,
  tokenData: LeadCompletionToken,
  leadData: any
): Promise<boolean> {
  try {
    // Importazione dinamica per evitare circular dependencies
    const EmailService = (await import('./email-service')).default
    const { loadEmailTemplate, renderTemplate } = await import('./template-loader-clean')
    
    const emailService = new EmailService(env)
    
    // Carica template reminder
    const template = await loadEmailTemplate('email_reminder_completamento', db, env)
    
    // Prepara dati per il template
    const baseUrl = getBaseUrl(env)
    const completionLink = `${baseUrl}/completa-dati?token=${tokenData.token}`
    
    const { missing } = getMissingFields(leadData)
    const missingFieldsHtml = missing.map(field => 
      `<li style="color: #856404; font-weight: 500;">${field}</li>`
    ).join('\n        ')
    
    const expiryDate = new Date(tokenData.expires_at)
    const daysRemaining = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    const templateData = {
      NOME_CLIENTE: leadData.nomeRichiedente || 'Cliente',
      COGNOME_CLIENTE: leadData.cognomeRichiedente || '',
      LEAD_ID: leadData.id,
      SERVIZIO: leadData.servizio || 'eCura',
      PIANO: leadData.piano || 'BASE',
      MISSING_FIELDS_HTML: missingFieldsHtml,
      MISSING_FIELDS_COUNT: missing.length,
      COMPLETION_LINK: completionLink,
      DAYS_REMAINING: daysRemaining,
      TOKEN_EXPIRY: expiryDate.toLocaleDateString('it-IT'),
      REMINDER_COUNT: tokenData.reminder_count + 1
    }
    
    const emailHtml = renderTemplate(template, templateData)
    
    // Invia email
    const result = await emailService.sendEmail({
      to: leadData.email,
      subject: `⏰ Promemoria: Completa i tuoi dati TeleMedCare (${daysRemaining} giorni rimasti)`,
      html: emailHtml,
      tags: [
        { name: 'tipo', value: 'reminder_completamento' },
        { name: 'lead_id', value: leadData.id },
        { name: 'reminder_count', value: String(tokenData.reminder_count + 1) }
      ]
    })
    
    if (result.success) {
      // Registra reminder inviato
      await recordReminderSent(db, tokenData.id)
      console.log(`✅ [REMINDER] Email inviata a ${leadData.email} (reminder #${tokenData.reminder_count + 1})`)
      return true
    } else {
      console.error(`❌ [REMINDER] Errore invio email:`, result.error)
      return false
    }
  } catch (error) {
    console.error(`❌ [REMINDER] Errore sendReminderEmail:`, error)
    return false
  }
}

/**
 * Invia email reminder per firma contratto
 * 
 * @param db - Database D1
 * @param env - Environment variables
 * @param leadData - Dati del lead con contratto da firmare
 * @param contractData - Dati del contratto
 * @returns Promise<boolean>
 */
export async function sendReminderFirma(
  db: D1Database,
  env: any,
  leadData: any,
  contractData: any
): Promise<boolean> {
  try {
    const EmailService = (await import('./email-service')).default
    const emailService = new EmailService(env)
    
    const baseUrl = getBaseUrl(env)
    const firmaLink = contractData.pdf_url || `${baseUrl}/firma-contratto?id=${contractData.id}`
    
    const nomeCliente = `${leadData.nomeRichiedente || 'Cliente'} ${leadData.cognomeRichiedente || ''}`.trim()
    
    const emailHtml = `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><title>Promemoria firma contratto</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: linear-gradient(135deg, #1a56db 0%, #1e40af 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Promemoria Firma Contratto</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0;">TeleMedCare – eCura</p>
  </div>
  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; color: #374151;">Gentile <strong>${nomeCliente}</strong>,</p>
    <p style="color: #4b5563; line-height: 1.6;">
      Le ricordiamo che il Suo contratto <strong>${contractData.codice_contratto || ''}</strong> per il servizio 
      <strong>${leadData.servizio || 'eCura'}</strong> è in attesa della Sua firma.
    </p>
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ Il contratto richiede la Sua firma per essere attivato.</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${firmaLink}" 
         style="display: inline-block; background: #1a56db; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
        ✍️ Firma il Contratto
      </a>
    </div>
    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      Se ha già firmato il contratto, ignori questa email.
    </p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
      TeleMedCare S.r.l. | <a href="https://telemedcare.it" style="color: #9ca3af;">telemedcare.it</a>
    </p>
  </div>
</body>
</html>`
    
    const result = await emailService.sendEmail({
      to: leadData.email,
      subject: `⏰ Promemoria: Il Suo contratto TeleMedCare è in attesa di firma`,
      html: emailHtml,
      tags: [
        { name: 'tipo', value: 'reminder_firma' },
        { name: 'lead_id', value: leadData.id }
      ]
    })
    
    if (result.success) {
      // Aggiorna reminder_firma_sent_at nel DB (campo leads)
      const now = new Date().toISOString()
      await db.prepare(
        `UPDATE leads SET reminder_firma_sent_at = ?, reminder_firma_count = COALESCE(reminder_firma_count, 0) + 1, updated_at = ? WHERE id = ?`
      ).bind(now, now, leadData.id).run()
      console.log(`✅ [REMINDER-FIRMA] Email inviata a ${leadData.email} (lead ${leadData.id})`)
      return true
    } else {
      console.error(`❌ [REMINDER-FIRMA] Errore:`, result.error)
      return false
    }
  } catch (error) {
    console.error(`❌ [REMINDER-FIRMA] Eccezione:`, error)
    return false
  }
}

/**
 * Invia email reminder per pagamento proforma
 * 
 * @param db - Database D1
 * @param env - Environment variables
 * @param leadData - Dati del lead con proforma da pagare
 * @param proformaData - Dati della proforma
 * @returns Promise<boolean>
 */
export async function sendReminderProforma(
  db: D1Database,
  env: any,
  leadData: any,
  proformaData: any
): Promise<boolean> {
  try {
    const EmailService = (await import('./email-service')).default
    const emailService = new EmailService(env)
    
    const baseUrl = getBaseUrl(env)
    const pagamentoLink = proformaData.payment_url || `${baseUrl}/pagamento?proforma=${proformaData.id}`
    
    const nomeCliente = `${leadData.nomeRichiedente || 'Cliente'} ${leadData.cognomeRichiedente || ''}`.trim()
    const importo = proformaData.prezzo_totale ? `€ ${Number(proformaData.prezzo_totale).toFixed(2)}` : ''
    
    const emailHtml = `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><title>Promemoria pagamento proforma</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Promemoria Pagamento</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0;">TeleMedCare – eCura</p>
  </div>
  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; color: #374151;">Gentile <strong>${nomeCliente}</strong>,</p>
    <p style="color: #4b5563; line-height: 1.6;">
      Le ricordiamo che la proforma <strong>${proformaData.numero_proforma || ''}</strong> 
      ${importo ? `di <strong>${importo}</strong>` : ''} per il servizio 
      <strong>${leadData.servizio || 'eCura'}</strong> è in attesa di pagamento.
    </p>
    <div style="background: #d1fae5; border-left: 4px solid #059669; padding: 16px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #065f46; font-weight: 600;">💳 Il pagamento è necessario per completare l'attivazione del servizio.</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${pagamentoLink}" 
         style="display: inline-block; background: #059669; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
        💳 Procedi al Pagamento
      </a>
    </div>
    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      Se ha già effettuato il pagamento, ignori questa email.
    </p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
      TeleMedCare S.r.l. | <a href="https://telemedcare.it" style="color: #9ca3af;">telemedcare.it</a>
    </p>
  </div>
</body>
</html>`
    
    const result = await emailService.sendEmail({
      to: leadData.email || proformaData.cliente_email,
      subject: `⏰ Promemoria: Pagamento proforma TeleMedCare in attesa`,
      html: emailHtml,
      tags: [
        { name: 'tipo', value: 'reminder_proforma' },
        { name: 'lead_id', value: leadData.id },
        { name: 'proforma_id', value: proformaData.id }
      ]
    })
    
    if (result.success) {
      const now = new Date().toISOString()
      await db.prepare(
        `UPDATE leads SET reminder_proforma_sent_at = ?, reminder_proforma_count = COALESCE(reminder_proforma_count, 0) + 1, updated_at = ? WHERE id = ?`
      ).bind(now, now, leadData.id).run()
      console.log(`✅ [REMINDER-PROFORMA] Email inviata a ${leadData.email || proformaData.cliente_email} (lead ${leadData.id})`)
      return true
    } else {
      console.error(`❌ [REMINDER-PROFORMA] Errore:`, result.error)
      return false
    }
  } catch (error) {
    console.error(`❌ [REMINDER-PROFORMA] Eccezione:`, error)
    return false
  }
}

/**
 * Processo batch di invio reminder
 * 
 * @param db - Database D1
 * @param env - Environment variables
 * @returns Promise<{ success: number; failed: number; total: number }>
 */
export async function processReminders(
  db: D1Database,
  env: any
): Promise<{ success: number; failed: number; total: number; queued?: number; blacklisted?: number; disabled?: boolean }> {
  const config = await getSystemConfig(db)
  
  // ============================================
  // CONTROLLO INTERRUTTORE CRON
  // ============================================
  if (!config.cron_enabled) {
    console.log('⚠️ [REMINDER] Cron disabilitato dalla dashboard - nessuna azione eseguita')
    return {
      success: 0,
      failed: 0,
      total: 0,
      disabled: true
    }
  }
  
  console.log('✅ [REMINDER] Cron abilitato - avvio processo reminder')
  
  // Ottieni token che necessitano reminder
  const tokens = await getTokensNeedingReminder(
    db,
    config.auto_completion_reminder_days,
    config.auto_completion_max_reminders
  )
  
  console.log(`📧 [REMINDER] Trovati ${tokens.length} token che necessitano reminder`)
  
  // ============================================
  // 🛡️ PROTEZIONE BUDGET: LIMITE GIORNALIERO
  // ============================================
  const DAILY_LIMIT = 10 // 🔻 MODIFICATO: Max 10 reminder al giorno (budget totale 30 email condiviso con altri reminder)
  
  // ============================================
  // 🚫 BLACKLIST: Lead già attivi (clienti con dispositivo attivo)
  // ============================================
  // IMPORTANTE: Questa lista contiene i NOMI DEI LEAD (richiedenti), NON degli assistiti!
  // Lead con dispositivi attivi NON presenti nel DB contracts con status ACTIVE:
  // Lista aggiornata manualmente da dashboard dispositivi attivi
  // Mappatura Lead → Assistito confermata il 2026-03-02
  const MANUAL_CONTRACTS_BLACKLIST = [
    // Lead attivi (dispositivi CARE e VITAL CARE)
    'Francesco Pepe',      // → Anna De Marco
    'Claudio Macchi',      // → Claudio Macchi (stesso)
    'Alberto Locatelli',   // → Giovanni Locatelli
    'Paolo Macrì',         // → Giuliana Balzarotti
    'Elisabetta Cattini',  // → Giuseppina Cozzi
    'Giorgio Riela',       // → Maria Capone
    'Caterina D\'Alterio', // → Rita Pennacchio
    'Elena Saglia',        // → Eileen Elisabeth King
    'Stefania Rocca',      // → Laura Calvi
    'Margherita Delaude',  // → Margherita Delaude (stesso)
    'Maria Grazia Ronca',  // → Maria Grazia Ronca (stesso)
    'Andrea D\'Avella',    // → Maria Grazia Ronca
    'Simona Pizzutto'      // → Gianni Paolo Pizzutto
  ]
  
  // Filtra blacklist (confronta nome richiedente)
  const tokensFiltered = tokens.filter((token: any) => {
    const nomeCognome = `${token.nomeRichiedente || ''} ${token.cognomeRichiedente || ''}`.trim()
    const isBlacklisted = MANUAL_CONTRACTS_BLACKLIST.some(name => 
      nomeCognome.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(nomeCognome.toLowerCase())
    )
    
    if (isBlacklisted) {
      console.log(`🚫 [REMINDER] Skipped (blacklist): ${nomeCognome} (lead ${token.lead_id})`)
    }
    
    return !isBlacklisted
  })
  
  console.log(`📊 [REMINDER] Dopo filtro blacklist: ${tokensFiltered.length}/${tokens.length} token validi (${tokens.length - tokensFiltered.length} clienti attivi saltati)`)
  
  const tokensToProcess = tokensFiltered.slice(0, DAILY_LIMIT)
  
  if (tokensFiltered.length > DAILY_LIMIT) {
    console.log(`⚠️ [REMINDER] Budget limit: ${DAILY_LIMIT} invii/giorno`)
    console.log(`📊 [REMINDER] Processando ${tokensToProcess.length}/${tokensFiltered.length} token (${tokensFiltered.length - DAILY_LIMIT} in coda)`)
  }
  
  let success = 0
  let failed = 0
  
  // ============================================
  // 1️⃣ REMINDER COMPLETAMENTO DATI
  // ============================================
  for (const token of tokensToProcess) {
    try {
      // Ottieni dati lead
      const leadData = await db.prepare('SELECT * FROM leads WHERE id = ?')
        .bind(token.lead_id)
        .first()
      
      if (!leadData) {
        console.warn(`⚠️ [REMINDER] Lead ${token.lead_id} non trovato`)
        failed++
        continue
      }
      
      // Invia reminder
      const sent = await sendReminderEmail(db, env, token, leadData)
      
      if (sent) {
        success++
      } else {
        failed++
      }
      
      // Pausa per evitare rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`❌ [REMINDER] Errore processando token ${token.id}:`, error)
      failed++
    }
  }

  // ============================================
  // 2️⃣ REMINDER FIRMA CONTRATTO
  // Lead con status CONTRACT_SENT da più di reminderDays giorni
  // e non hanno ricevuto reminder_firma nelle ultime 23 ore
  // ============================================
  const firmaReminderDate = new Date()
  firmaReminderDate.setDate(firmaReminderDate.getDate() - config.auto_completion_reminder_days)
  const firmaMinTime = new Date()
  firmaMinTime.setHours(firmaMinTime.getHours() - 23)
  
  try {
    const contractLeads = await db.prepare(`
      SELECT l.*, 
             c.id as contract_id, c.codice_contratto, c.pdf_url, c.status as contract_status
      FROM leads l
      JOIN contracts c ON c.leadId = l.id
      WHERE l.status = 'CONTRACT_SENT'
        AND c.status NOT IN ('SIGNED', 'PAID')
        AND l.email IS NOT NULL AND l.email != ''
        AND l.updated_at < ?
        AND l.status NOT IN ('CONTRACT_SIGNED', 'ACTIVE', 'NOT_INTERESTED')
        AND COALESCE(l.reminder_firma_count, 0) < ?
        AND (
          l.reminder_firma_sent_at IS NULL
          OR (l.reminder_firma_sent_at < ? AND l.reminder_firma_sent_at < ?)
        )
      ORDER BY l.updated_at ASC
      LIMIT 5
    `).bind(
      firmaReminderDate.toISOString(),
      config.auto_completion_max_reminders,
      firmaReminderDate.toISOString(),
      firmaMinTime.toISOString()
    ).all()
    
    const firmaLeads = (contractLeads.results || []) as any[]
    console.log(`✍️ [REMINDER-FIRMA] Trovati ${firmaLeads.length} lead con contratto da firmare`)
    
    for (const lead of firmaLeads) {
      // Blacklist check
      const nomeCognome = `${lead.nomeRichiedente || ''} ${lead.cognomeRichiedente || ''}`.trim()
      const isBlacklisted = MANUAL_CONTRACTS_BLACKLIST.some(name =>
        nomeCognome.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(nomeCognome.toLowerCase())
      )
      if (isBlacklisted) {
        console.log(`🚫 [REMINDER-FIRMA] Skipped (blacklist): ${nomeCognome}`)
        continue
      }
      
      const contractData = {
        id: lead.contract_id,
        codice_contratto: lead.codice_contratto,
        pdf_url: lead.pdf_url
      }
      
      const sent = await sendReminderFirma(db, env, lead, contractData)
      if (sent) success++
      else failed++
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  } catch (firmaError) {
    console.error(`❌ [REMINDER-FIRMA] Errore query:`, firmaError)
    // Non bloccare il processo principale
  }

  // ============================================
  // 3️⃣ REMINDER PAGAMENTO PROFORMA
  // Lead con status PROFORMA_SENT da più di reminderDays giorni
  // ============================================
  const proformaReminderDate = new Date()
  proformaReminderDate.setDate(proformaReminderDate.getDate() - config.auto_completion_reminder_days)
  const proformaMinTime = new Date()
  proformaMinTime.setHours(proformaMinTime.getHours() - 23)
  
  try {
    const proformaLeads = await db.prepare(`
      SELECT l.*,
             p.id as proforma_id, p.numero_proforma, p.prezzo_totale, 
             p.payment_url, p.cliente_email, p.status as proforma_status
      FROM leads l
      JOIN proforma p ON p.leadId = l.id
      WHERE l.status = 'PROFORMA_SENT'
        AND p.status NOT IN ('paid', 'PAID')
        AND (l.email IS NOT NULL AND l.email != '' OR p.cliente_email IS NOT NULL AND p.cliente_email != '')
        AND l.updated_at < ?
        AND COALESCE(l.reminder_proforma_count, 0) < ?
        AND (
          l.reminder_proforma_sent_at IS NULL
          OR (l.reminder_proforma_sent_at < ? AND l.reminder_proforma_sent_at < ?)
        )
      ORDER BY l.updated_at ASC
      LIMIT 5
    `).bind(
      proformaReminderDate.toISOString(),
      config.auto_completion_max_reminders,
      proformaReminderDate.toISOString(),
      proformaMinTime.toISOString()
    ).all()
    
    const pLeads = (proformaLeads.results || []) as any[]
    console.log(`💳 [REMINDER-PROFORMA] Trovati ${pLeads.length} lead con proforma da pagare`)
    
    for (const lead of pLeads) {
      const nomeCognome = `${lead.nomeRichiedente || ''} ${lead.cognomeRichiedente || ''}`.trim()
      const isBlacklisted = MANUAL_CONTRACTS_BLACKLIST.some(name =>
        nomeCognome.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(nomeCognome.toLowerCase())
      )
      if (isBlacklisted) {
        console.log(`🚫 [REMINDER-PROFORMA] Skipped (blacklist): ${nomeCognome}`)
        continue
      }
      
      const proformaData = {
        id: lead.proforma_id,
        numero_proforma: lead.numero_proforma,
        prezzo_totale: lead.prezzo_totale,
        payment_url: lead.payment_url,
        cliente_email: lead.cliente_email,
        proforma_status: lead.proforma_status
      }
      
      const sent = await sendReminderProforma(db, env, lead, proformaData)
      if (sent) success++
      else failed++
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  } catch (proformaError) {
    console.error(`❌ [REMINDER-PROFORMA] Errore query:`, proformaError)
    // Non bloccare il processo principale
  }
  
  return {
    success,
    failed,
    total: tokensToProcess.length,
    queued: tokensFiltered.length - tokensToProcess.length,  // Lead in coda
    blacklisted: tokens.length - tokensFiltered.length       // Lead saltati (blacklist)
  }
}

// ============================================
// EXPORT
// ============================================

export default {
  generateSecureToken,
  calculateExpiryDate,
  getMissingFields,
  isLeadComplete,
  getSystemConfig,
  updateSystemConfig,
  createCompletionToken,
  validateCompletionToken,
  markTokenAsCompleted,
  recordReminderSent,
  getTokenForLead,
  getTokensNeedingReminder,
  logCompletionAction,
  sendReminderEmail,
  sendReminderFirma,
  sendReminderProforma,
  processReminders
}
