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

    // Verifica se la tabella settings esiste, altrimenti creala
    try {
      await c.env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          description TEXT,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run()

      // Inserisci valori di default se non esistono
      await c.env.DB.prepare(`
        INSERT OR IGNORE INTO settings (key, value, description) VALUES 
          ('hubspot_auto_import_enabled', 'false', 'Abilita import automatico da HubSpot'),
          ('lead_email_notifications_enabled', 'false', 'Abilita invio email automatiche ai lead'),
          ('admin_email_notifications_enabled', 'true', 'Abilita notifiche email a info@telemedcare.it')
      `).run()
    } catch (initError) {
      console.warn('⚠️ Errore inizializzazione settings:', initError)
    }

    const result = await c.env.DB.prepare(
      'SELECT key, value, description FROM settings'
    ).all()

    const settings: Record<string, any> = {}
    result.results.forEach((row: any) => {
      settings[row.key] = {
        value: row.value,  // Mantieni come stringa, non convertire in boolean
        description: row.description
      }
    })

    return c.json({
      success: true,
      settings
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

    // Aggiorna il valore
    const stringValue = value ? 'true' : 'false'
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
    
    return result?.value === 'true'
  } catch (error) {
    console.error(`❌ Errore lettura setting ${key}:`, error)
    return false
  }
}
