/**
 * Contract Reminder System
 * 
 * Sistema per gestire i reminder di firma contratto:
 * - Reminder automatici ogni 4 giorni
 * - Max 3 reminder per contratto
 * - Validità contratto 30 giorni
 * 
 * @module contract-reminders
 */

import { D1Database } from '@cloudflare/workers-types'
import { getBaseUrl } from './url-helper'

export interface ContractReminderConfig {
  contract_reminder_enabled: boolean
  contract_reminder_days: number
  contract_max_reminders: number
  contract_validity_days: number
}

export interface Contract {
  id: string
  lead_id: string
  codice_contratto: string
  email: string
  nome: string
  cognome: string
  servizio: string
  piano: string
  prezzo_totale: number
  signed: number
  sent_at: string
  reminder_sent_at: string | null
  reminder_count: number
  created_at: string
}

/**
 * Ottieni contratti che necessitano reminder
 */
export async function getContractsNeedingReminder(
  db: D1Database,
  reminderDays: number,
  maxReminders: number
): Promise<Contract[]> {
  const reminderDate = new Date()
  reminderDate.setDate(reminderDate.getDate() - reminderDays)
  
  // Protezione anti-duplicati: 23 ore
  const minTimeBetweenReminders = new Date()
  minTimeBetweenReminders.setHours(minTimeBetweenReminders.getHours() - 23)
  
  const result = await db.prepare(`
    SELECT 
      c.*,
      l.email,
      l.nome || ' ' || l.cognome as nome_completo
    FROM contracts c
    JOIN leads l ON c.lead_id = l.id
    WHERE c.signed = 0
      AND c.sent_at IS NOT NULL
      AND COALESCE(c.reminder_count, 0) < ?
      AND (
        c.reminder_sent_at IS NULL
        OR (
          c.reminder_sent_at < ? 
          AND c.reminder_sent_at < ?
        )
      )
      AND datetime(c.sent_at, '+30 days') > datetime('now')
      AND l.status NOT IN ('NOT_INTERESTED', 'ACTIVE')
    ORDER BY c.sent_at ASC
  `).bind(
    maxReminders, 
    reminderDate.toISOString(), 
    minTimeBetweenReminders.toISOString()
  ).all()
  
  return (result.results || []) as Contract[]
}

/**
 * Invia email reminder firma contratto
 */
export async function sendContractReminder(
  db: D1Database,
  env: any,
  contract: Contract
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
      WHERE name = 'email_reminder_firma_contratto'
      LIMIT 1
    `).first()
    
    if (!templateRow) {
      console.warn('⚠️ [CONTRACT-REMINDER] Template email_reminder_firma_contratto non trovato')
      return false
    }
    
    // Compila template
    const htmlContent = templateManager.compile(
      templateRow.html_content as string,
      {
        NOME_CLIENTE: contract.nome_completo || contract.nome || 'Cliente',
        CODICE_CONTRATTO: contract.codice_contratto,
        PIANO_SERVIZIO: `${contract.servizio} ${contract.piano || ''}`.trim(),
        PREZZO_PIANO: contract.prezzo_totale 
          ? `€${contract.prezzo_totale.toFixed(2)}` 
          : 'N/A',
        LINK_FIRMA: `${getBaseUrl(env)}/firma-contratto.html?contract=${contract.id}`
      }
    )
    
    // Invia email
    const result = await emailService.sendEmail({
      to: contract.email,
      subject: `Reminder: Firma Contratto ${contract.codice_contratto}`,
      html: htmlContent,
      from: env.EMAIL_FROM || 'noreply@telemedcare.it'
    })
    
    if (result.success) {
      // Aggiorna reminder_count
      await db.prepare(`
        UPDATE contracts
        SET reminder_sent_at = datetime('now'),
            reminder_count = COALESCE(reminder_count, 0) + 1
        WHERE id = ?
      `).bind(contract.id).run()
      
      console.log(`✅ [CONTRACT-REMINDER] Inviato a ${contract.email} (contratto ${contract.codice_contratto})`)
      return true
    }
    
    return false
    
  } catch (error) {
    console.error(`❌ [CONTRACT-REMINDER] Errore:`, error)
    return false
  }
}

/**
 * Processa tutti i reminder contratti
 */
export async function processContractReminders(
  db: D1Database,
  env: any
): Promise<{ success: number; failed: number; total: number; queued: number }> {
  console.log('🔔 [CONTRACT-REMINDER] Avvio processo...')
  
  // Configurazione default
  const REMINDER_DAYS = 4  // Ogni 4 giorni
  const MAX_REMINDERS = 3  // Max 3 reminder
  const DAILY_LIMIT = 10   // Max 10 email/giorno (budget totale 30 condiviso)
  
  const contracts = await getContractsNeedingReminder(db, REMINDER_DAYS, MAX_REMINDERS)
  
  console.log(`📧 [CONTRACT-REMINDER] Trovati ${contracts.length} contratti che necessitano reminder`)
  
  // Limita a 30 email/giorno
  const contractsToProcess = contracts.slice(0, DAILY_LIMIT)
  const queued = Math.max(0, contracts.length - DAILY_LIMIT)
  
  let success = 0
  let failed = 0
  
  for (const contract of contractsToProcess) {
    const sent = await sendContractReminder(db, env, contract)
    if (sent) {
      success++
    } else {
      failed++
    }
    
    // Pausa 1 secondo tra invii
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log(`✅ [CONTRACT-REMINDER] Completato: ${success} inviati, ${failed} falliti, ${queued} in coda`)
  
  return {
    success,
    failed,
    total: success + failed,
    queued
  }
}
