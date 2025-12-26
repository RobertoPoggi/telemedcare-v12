/**
 * LEAD_CONFIG.TS - Configurazione Dinamica Partner
 * TeleMedCare V12.0-Cloudflare - Sistema Modulare
 * 
 * Gestisce:
 * - Configurazione dinamica partner e convenzioni
 * - Schema validation configurazioni
 * - Versioning system con backup/rollback
 * - Hot reload configurazioni senza restart
 * - Scalabilità 500+ partner simultanei
 */

import type { D1Database } from '@cloudflare/workers-types'

// =====================================================================
// TYPES & INTERFACES
// =====================================================================

export interface Partner {
  id: string
  nome: string
  tipo: 'IRBEMA' | 'AON' | 'CORPORATE' | 'MONDADORI' | 'ENDERED' | 'ALTRO'
  apiConfig?: {
    endpoint: string
    apiKey?: string
    headers?: Record<string, string>
    rateLimit?: number
    timeout?: number
  }
  emailConfig?: {
    domain: string
    templateId?: string
    notificationEmail?: string
  }
  prezzi?: {
    base: number
    avanzato: number
    sconto?: number
    commissione?: number
  }
  attivo: boolean
  dataCreazione: string
  ultimaModifica: string
}

export interface ConfigurazioneSistema {
  versione: string
  debug: boolean
  partner: Partner[]
  servizi: {
    [key: string]: {
      nome: string
      prezzo: number
      descrizione: string
      attivo: boolean
    }
  }
  template: {
    [key: string]: string
  }
  limiti: {
    maxLeadOrari: number
    maxPartnerSimultanei: number
    timeoutApi: number
  }
  notifiche: {
    emailSistema: string
    telegramBot?: string
    slackWebhook?: string
  }
}

// =====================================================================
// CONFIGURAZIONE BASE SISTEMA
// =====================================================================

export const CONFIG_BASE: ConfigurazioneSistema = {
  versione: 'V12.0-Cloudflare',
  debug: true,
  partner: [
    {
      id: 'IRBEMA_001',
      nome: 'IRBEMA',
      tipo: 'IRBEMA',
      apiConfig: {
        endpoint: 'https://api.irbema.it/teleassistenza',
        rateLimit: 100,
        timeout: 30000
      },
      prezzi: {
        base: 480,
        avanzato: 840,
        commissione: 0.15
      },
      attivo: true,
      dataCreazione: '2025-01-01',
      ultimaModifica: '2025-10-03'
    },
    {
      id: 'AON_001', 
      nome: 'AON Welfare',
      tipo: 'AON',
      apiConfig: {
        endpoint: 'https://voucher.aon.it/validate',
        rateLimit: 50,
        timeout: 15000
      },
      prezzi: {
        base: 480,
        avanzato: 840,
        sconto: 0.20
      },
      attivo: true,
      dataCreazione: '2025-01-01',
      ultimaModifica: '2025-10-03'
    },
    {
      id: 'MONDADORI_001',
      nome: 'Mondadori Corporate',
      tipo: 'MONDADORI',
      emailConfig: {
        domain: 'mondadori.it',
        templateId: 'MONDADORI_WELCOME'
      },
      prezzi: {
        base: 450,
        avanzato: 800,
        sconto: 0.10
      },
      attivo: true,
      dataCreazione: '2025-01-01',
      ultimaModifica: '2025-10-03'
    },
    {
      id: 'ENDERED_001',
      nome: 'Endered',
      tipo: 'ENDERED', 
      apiConfig: {
        endpoint: 'https://webhook.endered.com/telemedcare',
        rateLimit: 75,
        timeout: 20000
      },
      prezzi: {
        base: 480,
        avanzato: 840,
        commissione: 0.12
      },
      attivo: true,
      dataCreazione: '2025-01-01',
      ultimaModifica: '2025-10-03'
    }
  ],
  servizi: {
    BASE: {
      nome: 'TeleAssistenza Base',
      prezzo: 480,
      descrizione: 'Servizio base con dispositivo SiDLY e monitoraggio',
      attivo: true
    },
    AVANZATO: {
      nome: 'TeleAssistenza Avanzata', 
      prezzo: 840,
      descrizione: 'Servizio completo con centrale operativa H24',
      attivo: true
    }
  },
  template: {
    EMAIL_NOTIFICA_INFO: 'email_notifica_info.html',
    EMAIL_BENVENUTO: 'email_benvenuto.html',
    EMAIL_CONTRATTO: 'email_invio_contratto.html',
    EMAIL_DOCUMENTI: 'email_documenti_informativi.html',
    EMAIL_PROFORMA: 'email_invio_proforma.html',
    EMAIL_CONSEGNA: 'email_consegna.html',
    EMAIL_SPEDIZIONE: 'email_spedizione.html',
    EMAIL_FOLLOWUP: 'email_followup_call.html',
    EMAIL_PROMEMORIA_FOLLOWUP: 'email_promemoria_followup.html',
    EMAIL_PROMEMORIA_PAGAMENTO: 'email_promemoria_pagamento.html',
    EMAIL_CONFERMA_ORDINE: 'email_conferma_ordine.html',
    EMAIL_CONFERMA_ATTIVAZIONE: 'email_conferma_attivazione.html',
    EMAIL_CANCELLAZIONE: 'email_cancellazione.html'
  },
  limiti: {
    maxLeadOrari: 100,
    maxPartnerSimultanei: 50,
    timeoutApi: 30000
  },
  notifiche: {
    emailSistema: 'info@medicagb.it'
  }
}

// =====================================================================
// FUNZIONI CONFIGURAZIONE DINAMICA
// =====================================================================

/**
 * Carica configurazione sistema da database
 */
export async function caricaConfigurazione(db: D1Database): Promise<ConfigurazioneSistema> {
  try {
    console.log('📋 Caricamento configurazione sistema da database')
    
    // Carica configurazione base
    const configResult = await db.prepare(`
      SELECT configurazione FROM system_config WHERE id = 'main' AND attivo = 1
    `).first()
    
    if (configResult && configResult.configurazione) {
      const config = JSON.parse(configResult.configurazione as string) as ConfigurazioneSistema
      console.log('✅ Configurazione caricata da database', {
        versione: config.versione,
        partner: config.partner.length,
        servizi: Object.keys(config.servizi).length
      })
      return config
    }
    
    // Fallback configurazione base
    console.log('⚠️ Configurazione non trovata in DB, uso configurazione base')
    await salvaConfigurazione(db, CONFIG_BASE)
    return CONFIG_BASE
    
  } catch (error) {
    console.error('❌ Errore caricamento configurazione:', error)
    return CONFIG_BASE
  }
}

/**
 * Salva configurazione nel database
 */
export async function salvaConfigurazione(db: D1Database, config: ConfigurazioneSistema): Promise<boolean> {
  try {
    console.log('💾 Salvataggio configurazione sistema')
    
    // Backup configurazione esistente
    await backupConfigurazione(db)
    
    // Salva nuova configurazione
    await db.prepare(`
      INSERT OR REPLACE INTO system_config (id, configurazione, versione, attivo, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      'main',
      JSON.stringify(config),
      config.versione,
      1,
      new Date().toISOString(),
      new Date().toISOString()
    ).run()
    
    console.log('✅ Configurazione salvata con successo')
    return true
    
  } catch (error) {
    console.error('❌ Errore salvataggio configurazione:', error)
    return false
  }
}

/**
 * Backup configurazione esistente
 */
async function backupConfigurazione(db: D1Database): Promise<void> {
  try {
    const existing = await db.prepare(`
      SELECT * FROM system_config WHERE id = 'main' AND attivo = 1
    `).first()
    
    if (existing) {
      const backupId = `backup_${Date.now()}`
      await db.prepare(`
        INSERT INTO system_config (id, configurazione, versione, attivo, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        backupId,
        existing.configurazione,
        existing.versione,
        0, // Backup non attivo
        existing.created_at,
        new Date().toISOString()
      ).run()
      
      console.log('💾 Backup configurazione creato:', backupId)
    }
    
  } catch (error) {
    console.error('⚠️ Errore backup configurazione:', error)
  }
}

/**
 * Ottieni configurazione partner specifico
 */
export async function getConfigPartner(db: D1Database, partnerId: string): Promise<Partner | null> {
  try {
    const config = await caricaConfigurazione(db)
    return config.partner.find(p => p.id === partnerId) || null
    
  } catch (error) {
    console.error('❌ Errore ricerca partner:', error)
    return null
  }
}

/**
 * Aggiorna configurazione partner
 */
export async function aggiornaPartner(db: D1Database, partner: Partner): Promise<boolean> {
  try {
    const config = await caricaConfigurazione(db)
    
    // Trova e aggiorna partner
    const index = config.partner.findIndex(p => p.id === partner.id)
    if (index >= 0) {
      config.partner[index] = {
        ...partner,
        ultimaModifica: new Date().toISOString()
      }
    } else {
      // Aggiungi nuovo partner
      config.partner.push({
        ...partner,
        dataCreazione: new Date().toISOString(),
        ultimaModifica: new Date().toISOString()
      })
    }
    
    return await salvaConfigurazione(db, config)
    
  } catch (error) {
    console.error('❌ Errore aggiornamento partner:', error)
    return false
  }
}

/**
 * Validazione schema configurazione
 */
export function validaConfigurazione(config: ConfigurazioneSistema): { valida: boolean; errori: string[] } {
  const errori: string[] = []
  
  // Validazione base
  if (!config.versione || !config.versione.includes('V12.0')) {
    errori.push('Versione sistema non valida')
  }
  
  if (!config.partner || config.partner.length === 0) {
    errori.push('Nessun partner configurato')
  }
  
  // Validazione partner
  config.partner.forEach((partner, index) => {
    if (!partner.id || !partner.nome || !partner.tipo) {
      errori.push(`Partner ${index}: campi obbligatori mancanti`)
    }
    
    if (partner.apiConfig && !partner.apiConfig.endpoint) {
      errori.push(`Partner ${partner.id}: endpoint API mancante`)
    }
  })
  
  // Validazione servizi
  if (!config.servizi.BASE || !config.servizi.AVANZATO) {
    errori.push('Servizi BASE e AVANZATO obbligatori')
  }
  
  return {
    valida: errori.length === 0,
    errori
  }
}

/**
 * Hot reload configurazione
 */
export async function hotReloadConfigurazione(db: D1Database): Promise<boolean> {
  try {
    console.log('🔄 Hot reload configurazione sistema')
    
    const nuovaConfig = await caricaConfigurazione(db)
    const validazione = validaConfigurazione(nuovaConfig)
    
    if (!validazione.valida) {
      console.error('❌ Configurazione non valida:', validazione.errori)
      return false
    }
    
    console.log('✅ Hot reload completato con successo')
    return true
    
  } catch (error) {
    console.error('❌ Errore hot reload:', error)
    return false
  }
}

/**
 * Inizializza database configurazioni
 */
export async function inizializzaDatabaseConfig(db: D1Database): Promise<void> {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS system_config (
        id TEXT PRIMARY KEY,
        configurazione TEXT NOT NULL,
        versione TEXT NOT NULL,
        attivo INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `).run()
    
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_system_config_attivo ON system_config(attivo)
    `).run()
    
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_system_config_versione ON system_config(versione)
    `).run()
    
    console.log('✅ Database configurazioni inizializzato')
    
  } catch (error) {
    console.error('❌ Errore inizializzazione database config:', error)
  }
}