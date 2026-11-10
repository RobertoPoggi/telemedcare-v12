/**
 * Controllo accesso "difesa in profondita'" per endpoint che modificano molti record.
 * Consente: sessione di login con ruolo ADMIN, oppure header Authorization: Bearer <API_KEY>.
 * Un OPERATOR e un visitatore anonimo vengono rifiutati. Se API_KEY non e' configurata
 * la via "chiave" e' chiusa (mai un confronto con undefined).
 */
import { isSessionValid } from './auth-service'
import type { AuthSession } from './auth-service'

export type GuardResult = { ok: true; via: 'admin-session' | 'api-key' } | { ok: false; status: 401 | 403; error: string }

export function checkAdminOrApiKey(
  cookie: string | undefined | null,
  authHeader: string | undefined | null,
  apiKey: string | undefined | null
): GuardResult {
  if (apiKey && authHeader && authHeader === `Bearer ${apiKey}`) return { ok: true, via: 'api-key' }

  const m = cookie ? cookie.match(/(?:^|;\s*)session=([^;]+)/) : null
  if (m) {
    try {
      const session: AuthSession = JSON.parse(decodeURIComponent(m[1]))
      if (session && isSessionValid(session)) {
        if (session.role === 'ADMIN') return { ok: true, via: 'admin-session' }
        return { ok: false, status: 403, error: 'Operazione riservata agli amministratori' }
      }
    } catch { /* cookie non valido: tratta come anonimo */ }
  }
  return { ok: false, status: 401, error: 'Unauthorized' }
}
