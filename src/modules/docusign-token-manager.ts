/**
 * DOCUSIGN-TOKEN-MANAGER.TS
 * Gestione persistente dei token DocuSign OAuth
 * TeleMedCare V11.0
 */

export interface DocuSignToken {
  id?: number
  access_token: string
  token_type: string
  expires_at: string  // ISO timestamp
  scope?: string
  refresh_token?: string
  created_at?: string
  updated_at?: string
}

/**
 * Manager per token DocuSign con storage nel database
 */
export class DocuSignTokenManager {
  private db: D1Database

  constructor(db: D1Database) {
    this.db = db
  }

  /**
   * Salva un nuovo token nel database
   */
  async saveToken(
    accessToken: string,
    expiresIn: number,  // secondi
    tokenType: string = 'Bearer',
    scope?: string,
    refreshToken?: string
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

      await this.db.prepare(`
        INSERT INTO docusign_tokens (access_token, token_type, expires_at, scope, refresh_token)
        VALUES (?, ?, ?, ?, ?)
      `).bind(accessToken, tokenType, expiresAt, scope, refreshToken).run()

      console.log('✅ [DocuSignTokenManager] Token salvato nel database')
      console.log(`   Scadenza: ${expiresAt}`)
    } catch (error) {
      console.error('❌ [DocuSignTokenManager] Errore salvataggio token:', error)
      throw error
    }
  }

  /**
   * Ottiene il token valido più recente
   */
  async getValidToken(): Promise<string | null> {
    try {
      const now = new Date().toISOString()

      const result = await this.db.prepare(`
        SELECT access_token, expires_at
        FROM docusign_tokens
        WHERE expires_at > ?
        ORDER BY created_at DESC
        LIMIT 1
      `).bind(now).first<DocuSignToken>()

      if (result) {
        console.log('✅ [DocuSignTokenManager] Token valido trovato nel database')
        console.log(`   Scade: ${result.expires_at}`)
        return result.access_token
      }

      console.log('⚠️  [DocuSignTokenManager] Nessun token valido trovato')
      return null
    } catch (error) {
      console.error('❌ [DocuSignTokenManager] Errore recupero token:', error)
      return null
    }
  }

  /**
   * Verifica se abbiamo un token valido
   */
  async hasValidToken(): Promise<boolean> {
    const token = await this.getValidToken()
    return token !== null
  }

  /**
   * Elimina tutti i token scaduti
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const now = new Date().toISOString()

      const result = await this.db.prepare(`
        DELETE FROM docusign_tokens
        WHERE expires_at <= ?
      `).bind(now).run()

      if (result.changes > 0) {
        console.log(`🧹 [DocuSignTokenManager] Eliminati ${result.changes} token scaduti`)
      }
    } catch (error) {
      console.error('❌ [DocuSignTokenManager] Errore pulizia token:', error)
    }
  }

  /**
   * Elimina TUTTI i token (per testing o logout)
   */
  async clearAllTokens(): Promise<void> {
    try {
      await this.db.prepare(`DELETE FROM docusign_tokens`).run()
      console.log('🧹 [DocuSignTokenManager] Tutti i token eliminati')
    } catch (error) {
      console.error('❌ [DocuSignTokenManager] Errore eliminazione token:', error)
      throw error
    }
  }

  /**
   * Ottiene informazioni sul token corrente
   */
  async getTokenInfo(): Promise<DocuSignToken | null> {
    try {
      const now = new Date().toISOString()

      const result = await this.db.prepare(`
        SELECT *
        FROM docusign_tokens
        WHERE expires_at > ?
        ORDER BY created_at DESC
        LIMIT 1
      `).bind(now).first<DocuSignToken>()

      return result || null
    } catch (error) {
      console.error('❌ [DocuSignTokenManager] Errore recupero info token:', error)
      return null
    }
  }
}

/**
 * Factory function per creare il token manager
 */
export function createDocuSignTokenManager(db: D1Database): DocuSignTokenManager {
  return new DocuSignTokenManager(db)
}

export default DocuSignTokenManager
