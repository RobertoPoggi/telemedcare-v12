/**
 * DOCUSIGN_AUTH.TS - Authorization Code Grant Flow
 * TeleMedCare V11.0
 * 
 * Implementa OAuth 2.0 Authorization Code Grant
 */

export interface DocuSignAuthConfig {
  integrationKey: string
  secretKey: string
  redirectUri: string
  baseUrl: string
}

export interface DocuSignTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

/**
 * DocuSign OAuth Helper
 */
export class DocuSignOAuth {
  private config: DocuSignAuthConfig

  constructor(config: DocuSignAuthConfig) {
    this.config = config
  }

  /**
   * Genera URL di autorizzazione per il primo accesso
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      scope: 'signature impersonation',
      client_id: this.config.integrationKey,
      redirect_uri: this.config.redirectUri,
      state: state || Math.random().toString(36).substring(7)
    })

    return `https://account-d.docusign.com/oauth/auth?${params.toString()}`
  }

  /**
   * Scambia authorization code con access token
   */
  async getAccessTokenFromCode(code: string): Promise<DocuSignTokenResponse> {
    const tokenUrl = 'https://account-d.docusign.com/oauth/token'
    
    // Basic Auth con Integration Key e Secret Key
    const basicAuth = btoa(`${this.config.integrationKey}:${this.config.secretKey}`)

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`DocuSign token exchange failed: ${response.status} - ${error}`)
    }

    return await response.json()
  }

  /**
   * Ottiene user info dopo autenticazione
   */
  async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch('https://account-d.docusign.com/oauth/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.status}`)
    }

    return await response.json()
  }
}

/**
 * Helper per salvare/recuperare access token
 * In produzione: salvare in database o KV storage
 */
export class TokenManager {
  private static token: string | null = null
  private static expiresAt: number = 0

  static setToken(token: string, expiresIn: number): void {
    this.token = token
    this.expiresAt = Date.now() + (expiresIn * 1000) - 60000 // 1 min buffer
  }

  static getToken(): string | null {
    if (this.token && Date.now() < this.expiresAt) {
      return this.token
    }
    return null
  }

  static clearToken(): void {
    this.token = null
    this.expiresAt = 0
  }

  static isValid(): boolean {
    return this.token !== null && Date.now() < this.expiresAt
  }
}
