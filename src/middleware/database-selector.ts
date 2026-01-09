/**
 * Database Selector Middleware
 * 
 * Seleziona il database corretto in base all'ambiente:
 * - PRODUCTION → DB_PRODUCTION (telemedcare-leads)
 * - PREVIEW → DB_PREVIEW (telemedcare-leads-preview)
 * 
 * Cloudflare Pages non supporta binding diversi per ambiente,
 * quindi usiamo 2 bindings e scegliamo nel codice.
 */

import { Context, Next } from 'hono'

export async function databaseSelector(c: Context, next: Next) {
  const env = c.env.ENVIRONMENT || 'production'
  
  // Seleziona il database corretto
  if (env === 'preview') {
    // Preview: usa DB_PREVIEW
    if (!c.env.DB_PREVIEW) {
      console.error('❌ DB_PREVIEW non configurato!')
      return c.json({ 
        success: false, 
        error: 'Database preview non configurato' 
      }, 500)
    }
    c.env.DB = c.env.DB_PREVIEW
    console.log('🔵 [PREVIEW] Using DB_PREVIEW (telemedcare-leads-preview)')
  } else {
    // Production: usa DB_PRODUCTION
    if (!c.env.DB_PRODUCTION) {
      console.error('❌ DB_PRODUCTION non configurato!')
      return c.json({ 
        success: false, 
        error: 'Database production non configurato' 
      }, 500)
    }
    c.env.DB = c.env.DB_PRODUCTION
    console.log('🟢 [PRODUCTION] Using DB_PRODUCTION (telemedcare-leads)')
  }
  
  await next()
}
