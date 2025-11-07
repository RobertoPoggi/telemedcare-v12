/**
 * DOCUSIGN_INTEGRATION.TS - Integrazione DocuSign API Reale
 * TeleMedCare V11.0 - Sistema Firma Elettronica
 * 
 * Implementa:
 * - Autenticazione JWT (JSON Web Token)
 * - Creazione envelope con documento PDF
 * - Invio per firma elettronica
 * - Gestione webhook DocuSign
 * - Download documento firmato
 */

export interface DocuSignConfig {
  integrationKey: string       // Integration Key (Client ID)
  secretKey?: string            // Secret Key (per Authorization Code)
  accountId: string             // Account ID DocuSign
  userId: string                // User ID DocuSign
  baseUrl: string               // https://demo.docusign.net/restapi
  privateKey?: string           // RSA Private Key (per JWT)
  redirectUri?: string          // Redirect URI per OAuth
}

export interface DocuSignEnvelopeRequest {
  documentName: string
  documentPdfBase64: string     // PDF in Base64
  recipientEmail: string
  recipientName: string
  subject: string
  emailBody: string
  callbackUrl?: string          // Webhook URL
}

export interface DocuSignEnvelopeResponse {
  envelopeId: string
  status: string
  statusDateTime: string
  uri: string
  recipientUri?: string         // URL per firma
}

/**
 * DocuSign API Client
 */
export class DocuSignClient {
  private config: DocuSignConfig
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0
  private useOAuth: boolean = false

  constructor(config: DocuSignConfig, useOAuth: boolean = false) {
    this.config = config
    this.useOAuth = useOAuth
  }

  /**
   * Imposta access token manualmente (per OAuth flow)
   */
  setAccessToken(token: string, expiresIn: number): void {
    this.accessToken = token
    this.tokenExpiresAt = Date.now() + (expiresIn * 1000) - 60000 // 1 min buffer
    console.log('✅ [DocuSign] Access token configurato (scade tra', Math.floor(expiresIn / 60), 'minuti)')
  }

  /**
   * Ottiene Access Token via JWT (JSON Web Token) o OAuth
   * https://developers.docusign.com/platform/auth/jwt/
   */
  async getAccessToken(): Promise<string> {
    // Se token ancora valido, riusa
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    // Se OAuth, token deve essere impostato manualmente
    if (this.useOAuth) {
      throw new Error('OAuth mode: Access token must be set manually using setAccessToken()')
    }

    try {
      console.log('🔐 [DocuSign] Richiesta access token via JWT...')

      // JWT Authentication
      const jwtPayload = {
        iss: this.config.integrationKey,
        sub: this.config.userId,
        aud: 'account-d.docusign.com', // Demo environment
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 ora
        scope: 'signature impersonation'
      }

      // ⚠️ NOTA: In produzione, firma JWT con private key RSA
      // Per ora usiamo Authorization Code Grant come fallback
      
      const tokenUrl = 'https://account-d.docusign.com/oauth/token'
      
      // Per JWT: POST con assertion
      // Per ora implementiamo Authorization Code come workaround
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: await this.createJWT(jwtPayload)
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`DocuSign auth failed: ${response.status} - ${error}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000 // 1 min buffer

      console.log('✅ [DocuSign] Access token ottenuto')
      return this.accessToken

    } catch (error) {
      console.error('❌ [DocuSign] Errore autenticazione:', error)
      throw error
    }
  }

  /**
   * Crea JWT token (semplificato per demo)
   * In produzione: usare libreria jsonwebtoken con RSA private key
   */
  private async createJWT(payload: any): Promise<string> {
    // ⚠️ PLACEHOLDER: In produzione implementare firma RSA corretta
    // Per ora ritorna un JWT base per testing
    const header = { alg: 'RS256', typ: 'JWT' }
    const encodedHeader = btoa(JSON.stringify(header))
    const encodedPayload = btoa(JSON.stringify(payload))
    
    // In produzione: firma con RSA private key
    const signature = 'PLACEHOLDER_SIGNATURE'
    
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  /**
   * Crea Envelope DocuSign con documento PDF
   * https://developers.docusign.com/docs/esign-rest-api/reference/envelopes/envelopes/create/
   */
  async createEnvelope(request: DocuSignEnvelopeRequest): Promise<DocuSignEnvelopeResponse> {
    try {
      console.log('📋 [DocuSign] Creazione envelope...', {
        recipient: request.recipientEmail,
        document: request.documentName
      })

      const accessToken = await this.getAccessToken()

      // Envelope Definition
      const envelopeDefinition = {
        emailSubject: request.subject,
        emailBlurb: request.emailBody,
        status: 'sent', // Invia subito
        documents: [
          {
            documentBase64: request.documentPdfBase64,
            name: request.documentName,
            fileExtension: 'pdf',
            documentId: '1'
          }
        ],
        recipients: {
          signers: [
            {
              email: request.recipientEmail,
              name: request.recipientName,
              recipientId: '1',
              routingOrder: '1',
              tabs: {
                signHereTabs: [
                  {
                    documentId: '1',
                    pageNumber: '1',
                    xPosition: '100',
                    yPosition: '700',
                    tabLabel: 'Firma Qui'
                  }
                ],
                dateSignedTabs: [
                  {
                    documentId: '1',
                    pageNumber: '1',
                    xPosition: '100',
                    yPosition: '650',
                    tabLabel: 'Data Firma'
                  }
                ]
              }
            }
          ]
        }
      }

      // Webhook configuration (se specificato)
      if (request.callbackUrl) {
        envelopeDefinition['eventNotification'] = {
          url: request.callbackUrl,
          loggingEnabled: 'true',
          requireAcknowledgment: 'true',
          useSoapInterface: 'false',
          includeCertificateWithSoap: 'false',
          signMessageWithX509Cert: 'false',
          includeDocuments: 'true',
          includeEnvelopeVoidReason: 'true',
          includeTimeZone: 'true',
          includeSenderAccountAsCustomField: 'true',
          includeDocumentFields: 'true',
          includeCertificateOfCompletion: 'true',
          envelopeEvents: [
            { envelopeEventStatusCode: 'sent' },
            { envelopeEventStatusCode: 'delivered' },
            { envelopeEventStatusCode: 'completed' },
            { envelopeEventStatusCode: 'declined' },
            { envelopeEventStatusCode: 'voided' }
          ],
          recipientEvents: [
            { recipientEventStatusCode: 'Sent' },
            { recipientEventStatusCode: 'Delivered' },
            { recipientEventStatusCode: 'Completed' },
            { recipientEventStatusCode: 'Declined' },
            { recipientEventStatusCode: 'AuthenticationFailed' },
            { recipientEventStatusCode: 'AutoResponded' }
          ]
        }
      }

      // API Call
      const url = `${this.config.baseUrl}/v2.1/accounts/${this.config.accountId}/envelopes`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(envelopeDefinition)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`DocuSign API error: ${response.status} - ${error}`)
      }

      const result = await response.json()

      console.log('✅ [DocuSign] Envelope creato:', result.envelopeId)

      // Ottieni URL per firma embedded (opzionale)
      let recipientUri = undefined
      try {
        recipientUri = await this.getRecipientView(result.envelopeId, request.recipientEmail, request.recipientName)
      } catch (err) {
        console.warn('⚠️ [DocuSign] Impossibile ottenere recipient view:', err)
      }

      return {
        envelopeId: result.envelopeId,
        status: result.status,
        statusDateTime: result.statusDateTime,
        uri: result.uri,
        recipientUri
      }

    } catch (error) {
      console.error('❌ [DocuSign] Errore creazione envelope:', error)
      throw error
    }
  }

  /**
   * Ottiene URL per firma embedded
   * https://developers.docusign.com/docs/esign-rest-api/reference/envelopes/envelopeviews/createrecipient/
   */
  async getRecipientView(envelopeId: string, recipientEmail: string, recipientName: string): Promise<string> {
    try {
      const accessToken = await this.getAccessToken()

      const viewRequest = {
        returnUrl: `${this.config.redirectUri || 'https://telemedcare.it'}/docusign/return`,
        authenticationMethod: 'none',
        email: recipientEmail,
        userName: recipientName,
        clientUserId: recipientEmail // Same as email for tracking
      }

      const url = `${this.config.baseUrl}/v2.1/accounts/${this.config.accountId}/envelopes/${envelopeId}/views/recipient`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(viewRequest)
      })

      if (!response.ok) {
        throw new Error(`Failed to get recipient view: ${response.status}`)
      }

      const result = await response.json()
      return result.url

    } catch (error) {
      console.error('❌ [DocuSign] Errore recipient view:', error)
      throw error
    }
  }

  /**
   * Scarica documento firmato
   * https://developers.docusign.com/docs/esign-rest-api/reference/envelopes/envelopedocuments/get/
   */
  async downloadSignedDocument(envelopeId: string, documentId: string = '1'): Promise<ArrayBuffer> {
    try {
      console.log('📥 [DocuSign] Download documento firmato:', envelopeId)

      const accessToken = await this.getAccessToken()

      const url = `${this.config.baseUrl}/v2.1/accounts/${this.config.accountId}/envelopes/${envelopeId}/documents/${documentId}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.status}`)
      }

      const pdfBuffer = await response.arrayBuffer()
      console.log('✅ [DocuSign] Documento scaricato:', pdfBuffer.byteLength, 'bytes')

      return pdfBuffer

    } catch (error) {
      console.error('❌ [DocuSign] Errore download documento:', error)
      throw error
    }
  }

  /**
   * Verifica stato envelope
   */
  async getEnvelopeStatus(envelopeId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken()

      const url = `${this.config.baseUrl}/v2.1/accounts/${this.config.accountId}/envelopes/${envelopeId}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get envelope status: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('❌ [DocuSign] Errore verifica stato:', error)
      throw error
    }
  }
}

/**
 * Factory per creare client DocuSign da environment variables
 * @param env - Environment variables
 * @param useOAuth - Se true, usa OAuth invece di JWT (default: true)
 */
export function createDocuSignClient(env: any, useOAuth: boolean = true): DocuSignClient {
  const config: DocuSignConfig = {
    integrationKey: env.DOCUSIGN_INTEGRATION_KEY || '',
    secretKey: env.DOCUSIGN_SECRET_KEY,
    accountId: env.DOCUSIGN_ACCOUNT_ID || '',
    userId: env.DOCUSIGN_USER_ID || '',
    baseUrl: env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi',
    privateKey: env.DOCUSIGN_PRIVATE_KEY,
    redirectUri: env.DOCUSIGN_REDIRECT_URI || 'https://telemedcare.it/api/docusign/callback'
  }

  // Validazione
  if (!config.integrationKey || !config.accountId || !config.userId) {
    throw new Error('DocuSign configuration incomplete. Check environment variables.')
  }

  return new DocuSignClient(config, useOAuth)
}

export default DocuSignClient
