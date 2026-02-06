// ==========================================
// SETTINGS API
// Gestione configurazioni globali
// ==========================================

import { Context } from 'hono'

// GET /api/settings - Ottieni tutte le configurazioni
export async function getSettings(c: Context) {
  try {
    if (!c.env?.DB) {
      return c.json({ success: false, error: 'Database non configurato' }, 500)
    }

    // Inizializza i settings necessari nella tabella settings
    const defaultSettings = [
      { key: 'hubspot_auto_import_enabled', value: 'false', description: 'Abilita import automatico da HubSpot' },
      { key: 'lead_email_notifications_enabled', value: 'false', description: 'Abilita invio email automatiche ai lead' },
      { key: 'admin_email_notifications_enabled', value: 'true', description: 'Abilita notifiche email a info@telemedcare.it' },
      { key: 'reminder_completion_enabled', value: 'false', description: 'Abilita reminder automatici completamento dati lead' },
      { key: 'auto_completion_enabled', value: 'false', description: 'Abilita invio automatico email completamento dati' },
      { key: 'auto_payment_workflow_enabled', value: 'false', description: 'Abilita workflow automatico pagamenti' },
      { key: 'auto_contract_workflow_enabled', value: 'false', description: 'Abilita workflow automatico contratti' }
    ]

    for (const setting of defaultSettings) {
      try {
        await c.env.DB.prepare(`
          INSERT OR IGNORE INTO settings (key, value, description, updated_at) 
          VALUES (?, ?, ?, datetime('now'))
        `).bind(setting.key, setting.value, setting.description).run()
      } catch (err) {
        console.warn(`⚠️ Skip init setting ${setting.key}:`, err)
      }
    }

    const result = await c.env.DB.prepare(
      'SELECT key, value, description FROM settings'
    ).all()

    const settings: Record<string, any> = {}
    const settingsFlat: Record<string, boolean> = {}
    
    result.results.forEach((row: any) => {
      const boolValue = row.value === 'true'
      settings[row.key] = {
        value: row.value,  // Mantieni come stringa
        description: row.description
      }
      // Aggiungi anche chiave diretta per retrocompatibilità
      settingsFlat[row.key] = boolValue
    })

    return c.json({
      success: true,
      settings,
      ...settingsFlat  // Aggiungi chiavi dirette (es. hubspot_auto_import_enabled: true)
    })
  } catch (error) {
    console.error('❌ Errore get settings:', error)
    return c.json({
      success: false,
      error: 'Errore recupero configurazioni'
    }, 500)
  }
}

// PUT /api/settings/:key - Aggiorna un setting
export async function updateSetting(c: Context) {
  try {
    if (!c.env?.DB) {
      return c.json({ success: false, error: 'Database non configurato' }, 500)
    }

    const key = c.req.param('key')
    const { value } = await c.req.json()

    // Valida che il setting esista
    const existing = await c.env.DB.prepare(
      'SELECT key FROM settings WHERE key = ?'
    ).bind(key).first()

    if (!existing) {
      return c.json({
        success: false,
        error: `Setting '${key}' non trovato`
      }, 404)
    }

    // Normalizza il valore a stringa 'true' o 'false'
    // Gestisce: boolean, string "true"/"false", numeri 0/1
    let stringValue = 'false'
    if (value === true || value === 'true' || value === '1' || value === 1) {
      stringValue = 'true'
    }
    
    await c.env.DB.prepare(
      'UPDATE settings SET value = ?, updated_at = ? WHERE key = ?'
    ).bind(stringValue, new Date().toISOString(), key).run()

    console.log(`⚙️ Setting aggiornato: ${key} = ${stringValue}`)

    return c.json({
      success: true,
      message: 'Setting aggiornato',
      key,
      value: stringValue === 'true'
    })
  } catch (error) {
    console.error('❌ Errore update setting:', error)
    return c.json({
      success: false,
      error: 'Errore aggiornamento setting'
    }, 500)
  }
}

// Helper per leggere un singolo setting
export async function getSetting(db: any, key: string): Promise<boolean> {
  try {
    const result = await db.prepare(
      'SELECT value FROM settings WHERE key = ?'
    ).bind(key).first()
    
    // Usa solo confronto con 'true' (stringa)
    return result?.value === 'true'
  } catch (error) {
    console.error(`❌ Errore lettura setting ${key}:`, error)
    return false
  }
}
