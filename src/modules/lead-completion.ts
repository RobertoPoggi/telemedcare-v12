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
  codiceFiscaleAssistito?: boolean
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
    codiceFiscaleAssistito: 'Codice Fiscale Assistito',
    indirizzoAssistito: 'Indirizzo Assistito',
    
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
    auto_completion_reminder_days: config.auto_completion_reminder_days || 3,
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
 */
export async function getTokensNeedingReminder(
  db: D1Database,
  reminderDays: number,
  maxReminders: number
): Promise<LeadCompletionToken[]> {
  const reminderDate = new Date()
  reminderDate.setDate(reminderDate.getDate() - reminderDays)
  
  const result = await db.prepare(`
    SELECT * FROM lead_completion_tokens
    WHERE completed = 0
      AND expires_at > datetime('now')
      AND reminder_count < ?
      AND (
        reminder_sent_at IS NULL
        OR reminder_sent_at < ?
      )
  `).bind(maxReminders, reminderDate.toISOString()).all()
  
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
    const baseUrl = env.PUBLIC_URL || env.PAGES_URL || 'https://genspark-ai_developer.telemedcare-v12.pages.dev'
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
 * Processo batch di invio reminder
 * 
 * @param db - Database D1
 * @param env - Environment variables
 * @returns Promise<{ success: number; failed: number; total: number }>
 */
export async function processReminders(
  db: D1Database,
  env: any
): Promise<{ success: number; failed: number; total: number; disabled?: boolean }> {
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
  
  let success = 0
  let failed = 0
  
  for (const token of tokens) {
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
  
  return {
    success,
    failed,
    total: tokens.length
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
  processReminders
}
