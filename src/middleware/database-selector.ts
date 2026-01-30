/**
 * Database Selector Middleware - WORKAROUND for Cloudflare Pages
 * 
 * Cloudflare Pages non supporta d1_databases dentro [env.preview]
 * 
 * WORKAROUND: 
 * - Creiamo 2 bindings: DB_PROD e DB_PREV
 * - Il middleware seleziona quale usare in base a ENVIRONMENT
 * - Assegna il binding selezionato a c.env.DB
 */

import { Context, Next } from 'hono'

export async function databaseSelector(c: Context, next: Next) {
  const env = c.env.ENVIRONMENT || 'production'
  
  // Seleziona il database corretto in base all'ambiente
  if (env === 'preview') {
    if (!c.env.DB_PREV) {
      console.error('❌ DB_PREV non configurato!')
      return c.json({ 
        success: false, 
        error: 'Database preview non configurato' 
      }, 500)
    }
    c.env.DB = c.env.DB_PREV
    console.log('🔵 [PREVIEW] Using DB_PREV (telemedcare-leads-preview)')
  } else {
    if (!c.env.DB_PROD) {
      console.error('❌ DB_PROD non configurato!')
      return c.json({ 
        success: false, 
        error: 'Database production non configurato' 
      }, 500)
    }
    c.env.DB = c.env.DB_PROD
    console.log('🟢 [PRODUCTION] Using DB_PROD (telemedcare-leads)')
  }
  
  await next()
}
