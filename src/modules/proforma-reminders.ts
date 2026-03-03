/**
 * Proforma Payment Reminder System
 * 
 * Sistema per gestire i reminder di pagamento proforma:
 * - Reminder automatici ogni 2 giorni
 * - Max 4 reminder per proforma (più urgente)
 * - Validità proforma 3 giorni
 * 
 * @module proforma-reminders
 */

import { D1Database } from '@cloudflare/workers-types'
import { getBaseUrl } from './url-helper'

export interface ProformaReminderConfig {
  proforma_reminder_enabled: boolean
  proforma_reminder_days: number
  proforma_max_reminders: number
  proforma_validity_days: number
}

export interface Proforma {
  id: string
  lead_id: string
  numero_proforma: string
  email: string
  nome_cliente: string
  importo_mensile: number
  importo_totale: number
  paid: number
  sent_at: string
  reminder_sent_at: string | null
  reminder_count: number
  created_at: string
  scadenza: string
}

/**
 * Ottieni proforma che necessitano reminder
 */
export async function getProformasNeedingReminder(
  db: D1Database,
  reminderDays: number,
  maxReminders: number
): Promise<Proforma[]> {
  const reminderDate = new Date()
  reminderDate.setDate(reminderDate.getDate() - reminderDays)
  
  // Protezione anti-duplicati: 23 ore
  const minTimeBetweenReminders = new Date()
  minTimeBetweenReminders.setHours(minTimeBetweenReminders.getHours() - 23)
  
  const result = await db.prepare(`
    SELECT 
      p.*,
      l.email,
      l.nome || ' ' || l.cognome as nome_cliente
    FROM proforma p
    JOIN leads l ON p.lead_id = l.id
    WHERE p.paid = 0
      AND p.sent_at IS NOT NULL
      AND COALESCE(p.reminder_count, 0) < ?
      AND (
        p.reminder_sent_at IS NULL
        OR (
          p.reminder_sent_at < ? 
          AND p.reminder_sent_at < ?
        )
      )
      AND datetime(p.scadenza) > datetime('now')
      AND l.status NOT IN ('NOT_INTERESTED')
    ORDER BY p.scadenza ASC
  `).bind(
    maxReminders, 
    reminderDate.toISOString(), 
    minTimeBetweenReminders.toISOString()
  ).all()
  
  return (result.results || []) as Proforma[]
}

/**
 * Invia email reminder pagamento proforma
 */
export async function sendProformaReminder(
  db: D1Database,
  env: any,
  proforma: Proforma
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
      WHERE name = 'email_reminder_pagamento_proforma'
      LIMIT 1
    `).first()
    
    if (!templateRow) {
      console.warn('⚠️ [PROFORMA-REMINDER] Template email_reminder_pagamento_proforma non trovato')
      return false
    }
    
    // Calcola giorni rimanenti
    const scadenza = new Date(proforma.scadenza)
    const oggi = new Date()
    const giorniRimanenti = Math.ceil((scadenza.getTime() - oggi.getTime()) / (1000 * 60 * 60 * 24))
    
    // Compila template
    const htmlContent = templateManager.compile(
      templateRow.html_content as string,
      {
        NOME_CLIENTE: proforma.nome_cliente || 'Cliente',
        NUMERO_PROFORMA: proforma.numero_proforma,
        IMPORTO_MENSILE: proforma.importo_mensile 
          ? `€${proforma.importo_mensile.toFixed(2)}` 
          : 'N/A',
        IMPORTO_TOTALE: proforma.importo_totale 
          ? `€${proforma.importo_totale.toFixed(2)}` 
          : 'N/A',
        DATA_SCADENZA: new Date(proforma.scadenza).toLocaleDateString('it-IT'),
        GIORNI_RIMANENTI: giorniRimanenti.toString(),
        URGENZA: giorniRimanenti <= 1 ? '⚠️ URGENTE' : '',
        LINK_PAGAMENTO: `${getBaseUrl(env)}/pagamento.html?proforma=${proforma.id}`
      }
    )
    
    // Invia email
    const subject = giorniRimanenti <= 1 
      ? `URGENTE: Scade ${giorniRimanenti === 0 ? 'OGGI' : 'DOMANI'} - Proforma ${proforma.numero_proforma}`
      : `Reminder: Pagamento Proforma ${proforma.numero_proforma}`
    
    const result = await emailService.sendEmail({
      to: proforma.email,
      subject,
      html: htmlContent,
      from: env.EMAIL_FROM || 'noreply@telemedcare.it'
    })
    
    if (result.success) {
      // Aggiorna reminder_count
      await db.prepare(`
        UPDATE proforma
        SET reminder_sent_at = datetime('now'),
            reminder_count = COALESCE(reminder_count, 0) + 1
        WHERE id = ?
      `).bind(proforma.id).run()
      
      console.log(`✅ [PROFORMA-REMINDER] Inviato a ${proforma.email} (proforma ${proforma.numero_proforma}, scade tra ${giorniRimanenti} giorni)`)
      return true
    }
    
    return false
    
  } catch (error) {
    console.error(`❌ [PROFORMA-REMINDER] Errore:`, error)
    return false
  }
}

/**
 * Processa tutti i reminder proforma
 */
export async function processProformaReminders(
  db: D1Database,
  env: any
): Promise<{ success: number; failed: number; total: number; queued: number }> {
  console.log('💰 [PROFORMA-REMINDER] Avvio processo...')
  
  // Configurazione default
  const REMINDER_DAYS = 2  // Ogni 2 giorni (URGENTE)
  const MAX_REMINDERS = 4  // Max 4 reminder
  const DAILY_LIMIT = 5    // Max 5 email/giorno (PRIORITÀ ALTA - budget totale 30 condiviso)
  
  const proformas = await getProformasNeedingReminder(db, REMINDER_DAYS, MAX_REMINDERS)
  
  console.log(`📧 [PROFORMA-REMINDER] Trovate ${proformas.length} proforma che necessitano reminder`)
  
  // Limita a 30 email/giorno
  const proformasToProcess = proformas.slice(0, DAILY_LIMIT)
  const queued = Math.max(0, proformas.length - DAILY_LIMIT)
  
  let success = 0
  let failed = 0
  
  for (const proforma of proformasToProcess) {
    const sent = await sendProformaReminder(db, env, proforma)
    if (sent) {
      success++
    } else {
      failed++
    }
    
    // Pausa 1 secondo tra invii
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log(`✅ [PROFORMA-REMINDER] Completato: ${success} inviati, ${failed} falliti, ${queued} in coda`)
  
  return {
    success,
    failed,
    total: success + failed,
    queued
  }
}
