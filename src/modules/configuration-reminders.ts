/**
 * Configuration Form Reminder System
 * 
 * Sistema per gestire i reminder compilazione form configurazione:
 * - Reminder automatici ogni 1 giorno (GIORNALIERO)
 * - Max 5 reminder per form
 * - Validità form 14 giorni
 * 
 * @module configuration-reminders
 */

import { D1Database } from '@cloudflare/workers-types'
import { getBaseUrl } from './url-helper'

export interface ConfigurationReminderConfig {
  configuration_reminder_enabled: boolean
  configuration_reminder_days: number
  configuration_max_reminders: number
  configuration_validity_days: number
}

export interface ConfigurationForm {
  id: string
  lead_id: string
  assistito_id: string
  nome_assistito: string
  cognome_assistito: string
  email: string
  completed: number
  sent_at: string
  reminder_sent_at: string | null
  reminder_count: number
  created_at: string
}

/**
 * Ottieni form configurazione che necessitano reminder
 */
export async function getConfigurationsNeedingReminder(
  db: D1Database,
  reminderDays: number,
  maxReminders: number
): Promise<ConfigurationForm[]> {
  const reminderDate = new Date()
  reminderDate.setDate(reminderDate.getDate() - reminderDays)
  
  // Protezione anti-duplicati: 23 ore
  const minTimeBetweenReminders = new Date()
  minTimeBetweenReminders.setHours(minTimeBetweenReminders.getHours() - 23)
  
  // Query: cerca form configurazione non completati
  // Nota: assumo che esista una tabella 'configuration_forms' o simile
  // Se non esiste, useremo la logica sui contratti firmati non configurati
  
  const result = await db.prepare(`
    SELECT 
      c.id,
      c.lead_id,
      a.id as assistito_id,
      a.nome as nome_assistito,
      a.cognome as cognome_assistito,
      l.email,
      COALESCE(c.configuration_completed, 0) as completed,
      c.signed_at as sent_at,
      c.configuration_reminder_sent_at as reminder_sent_at,
      COALESCE(c.configuration_reminder_count, 0) as reminder_count,
      c.created_at
    FROM contracts c
    JOIN leads l ON c.lead_id = l.id
    LEFT JOIN assistiti a ON a.lead_id = l.id
    WHERE c.signed = 1
      AND COALESCE(c.configuration_completed, 0) = 0
      AND c.signed_at IS NOT NULL
      AND COALESCE(c.configuration_reminder_count, 0) < ?
      AND (
        c.configuration_reminder_sent_at IS NULL
        OR (
          c.configuration_reminder_sent_at < ? 
          AND c.configuration_reminder_sent_at < ?
        )
      )
      AND datetime(c.signed_at, '+14 days') > datetime('now')
      AND l.status NOT IN ('NOT_INTERESTED')
    ORDER BY c.signed_at ASC
  `).bind(
    maxReminders, 
    reminderDate.toISOString(), 
    minTimeBetweenReminders.toISOString()
  ).all()
  
  return (result.results || []) as ConfigurationForm[]
}

/**
 * Invia email reminder compilazione form configurazione
 */
export async function sendConfigurationReminder(
  db: D1Database,
  env: any,
  form: ConfigurationForm
): Promise<boolean> {
  try {
    // Importa EmailService
    const { default: EmailService } = await import('./email-service')
    const { default: TemplateManager } = await import('./template-manager')
    
    const emailService = new EmailService(env)
    const templateManager = new TemplateManager()
    
    // Carica template
    const templateRow = await db.prepare(`
      SELECT html_content FROM email_templates 
      WHERE name = 'email_reminder_compilazione_configurazione'
      LIMIT 1
    `).first()
    
    if (!templateRow) {
      console.warn('⚠️ [CONFIG-REMINDER] Template email_reminder_compilazione_configurazione non trovato')
      return false
    }
    
    // Compila template
    const nomeAssistito = form.nome_assistito && form.cognome_assistito
      ? `${form.nome_assistito} ${form.cognome_assistito}`
      : 'l\'assistito'
    
    const htmlContent = templateManager.compile(
      templateRow.html_content as string,
      {
        NOME_ASSISTITO: nomeAssistito,
        LINK_CONFIGURAZIONE: `${getBaseUrl(env)}/configurazione.html?id=${form.id}`
      }
    )
    
    // Invia email
    const result = await emailService.sendEmail({
      to: form.email,
      subject: `Reminder Giornaliero: Completa Configurazione per ${nomeAssistito}`,
      html: htmlContent,
      from: env.EMAIL_FROM || 'noreply@telemedcare.it'
    })
    
    if (result.success) {
      // Aggiorna reminder_count
      await db.prepare(`
        UPDATE contracts
        SET configuration_reminder_sent_at = datetime('now'),
            configuration_reminder_count = COALESCE(configuration_reminder_count, 0) + 1
        WHERE id = ?
      `).bind(form.id).run()
      
      console.log(`✅ [CONFIG-REMINDER] Inviato a ${form.email} (assistito: ${nomeAssistito})`)
      return true
    }
    
    return false
    
  } catch (error) {
    console.error(`❌ [CONFIG-REMINDER] Errore:`, error)
    return false
  }
}

/**
 * Processa tutti i reminder form configurazione
 */
export async function processConfigurationReminders(
  db: D1Database,
  env: any
): Promise<{ success: number; failed: number; total: number; queued: number }> {
  console.log('⚙️ [CONFIG-REMINDER] Avvio processo...')
  
  // Configurazione default
  const REMINDER_DAYS = 1  // Ogni 1 giorno (GIORNALIERO)
  const MAX_REMINDERS = 5  // Max 5 reminder
  const DAILY_LIMIT = 5    // Max 5 email/giorno (budget totale 30 condiviso)
  
  const forms = await getConfigurationsNeedingReminder(db, REMINDER_DAYS, MAX_REMINDERS)
  
  console.log(`📧 [CONFIG-REMINDER] Trovati ${forms.length} form che necessitano reminder`)
  
  // Limita a 30 email/giorno
  const formsToProcess = forms.slice(0, DAILY_LIMIT)
  const queued = Math.max(0, forms.length - DAILY_LIMIT)
  
  let success = 0
  let failed = 0
  
  for (const form of formsToProcess) {
    const sent = await sendConfigurationReminder(db, env, form)
    if (sent) {
      success++
    } else {
      failed++
    }
    
    // Pausa 1 secondo tra invii
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log(`✅ [CONFIG-REMINDER] Completato: ${success} inviati, ${failed} falliti, ${queued} in coda`)
  
  return {
    success,
    failed,
    total: success + failed,
    queued
  }
}
