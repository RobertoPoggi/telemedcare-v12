/**
 * Database Selector Middleware
 * 
 * Seleziona il database corretto in base all'ambiente:
 * - PRODUCTION → DB_PRODUCTION (telemedcare-leads)
 * - PREVIEW → DB_PREVIEW (telemedcare-leads-preview)
 * 
 * Cloudflare Pages non supporta binding diversi per ambiente,
 * quindi usiamo 2 bindings e scegliamo nel codice.
 * 
 * FALLBACK: Se i nuovi bindings non sono configurati, usa il vecchio DB
 */

import { Context, Next } from 'hono'

export async function databaseSelector(c: Context, next: Next) {
  const env = c.env.ENVIRONMENT || 'production'
  
  // Verifica se i nuovi bindings sono disponibili
  const hasNewBindings = c.env.DB_PRODUCTION && c.env.DB_PREVIEW
  
  if (hasNewBindings) {
    // NUOVO SISTEMA: Bindings separati
    if (env === 'preview') {
      c.env.DB = c.env.DB_PREVIEW
      console.log('🔵 [PREVIEW] Using DB_PREVIEW (telemedcare-leads-preview)')
    } else {
      c.env.DB = c.env.DB_PRODUCTION
      console.log('🟢 [PRODUCTION] Using DB_PRODUCTION (telemedcare-leads)')
    }
  } else {
    // FALLBACK: Usa vecchio binding DB (temporaneo)
    if (!c.env.DB) {
      console.error('❌ Nessun database configurato!')
      return c.json({ 
        success: false, 
        error: 'Database non configurato' 
      }, 500)
    }
    console.warn(`⚠️ [${env.toUpperCase()}] Using legacy DB binding (shared database)`)
    console.warn('⚠️ I nuovi bindings DB_PRODUCTION e DB_PREVIEW non sono ancora attivi')
  }
  
  await next()
}
