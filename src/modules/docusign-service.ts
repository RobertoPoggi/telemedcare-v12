/**
 * DOCUSIGN-SERVICE.TS - Integrazione DocuSign API
 * eCura V11.0 - Digital Signature Integration
 * 
 * Gestisce l'invio di documenti per firma digitale tramite DocuSign
 * Supporta firma embedded e firma via email
 * 
 * WORKFLOW:
 * 1. Upload contratto PDF a DocuSign
 * 2. Crea envelope con signers
 * 3. Invia per firma (email o embedded view)
 * 4. Riceve webhook al completamento firma
 */

export interface DocuSignConfig {
  accountId: string
  clientId: string
  userId: string
  privateKey: string
  oauthBasePath: string
  apiBasePath: string
}

export interface SignerInfo {
  name: string
  email: string
  recipientId: string
  clientUserId?: string // Per embedded signing
}

export interface DocumentInfo {
  documentId: string
  name: string
  fileExtension: string
  documentBase64: string
}

export interface EnvelopeRequest {
  emailSubject: string
  emailMessage?: string
  documents: DocumentInfo[]
  signers: SignerInfo[]
  status: 'sent' | 'created' // 'sent' invia subito, 'created' draft
  callbackUrl?: string // Webhook URL
}

export interface EnvelopeResponse {
  envelopeId: string
  status: string
  statusDateTime: string
  uri?: string
}

export interface RecipientViewRequest {
  returnUrl: string
  authenticationMethod: string
  email: string
  userName: string
  clientUserId: string
}

export interface RecipientViewResponse {
  url: string
}

/**
 * DocuSign Service - Gestione firma digitale
 */
export class DocuSignService {
  private config: DocuSignConfig
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(config: DocuSignConfig) {
    this.config = config
  }

  /**
   * Ottiene access token JWT per DocuSign API
   */
  private async getAccessToken(): Promise<string> {
    // Se token valido, riutilizza
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    console.log('🔐 [DOCUSIGN] Richiesta nuovo JWT access token...')

    // TODO: Implementare JWT authentication con DocuSign
    // Per ora, mock token per sviluppo
    this.accessToken = 'MOCK_DOCUSIGN_TOKEN_' + Date.now()
    this.tokenExpiry = Date.now() + (3600 * 1000) // 1 ora

    console.log('✅ [DOCUSIGN] Access token ottenuto (valido 1h)')
    return this.accessToken
  }

  /**
   * Crea e invia envelope DocuSign con contratto per firma
   */
  async createEnvelope(request: EnvelopeRequest): Promise<EnvelopeResponse> {
    try {
      console.log(`📤 [DOCUSIGN] Creazione envelope per firma digitale...`)
      console.log(`📧 [DOCUSIGN] Destinatario: ${request.signers[0]?.email}`)

      const token = await this.getAccessToken()

      // Prepara richiesta DocuSign API
      const envelopeDefinition = {
        emailSubject: request.emailSubject,
        emailBlurb: request.emailMessage || 'Firma il contratto eCura',
        documents: request.documents,
        recipients: {
          signers: request.signers.map((signer, index) => ({
            email: signer.email,
            name: signer.name,
            recipientId: signer.recipientId || String(index + 1),
            clientUserId: signer.clientUserId,
            routingOrder: '1',
            tabs: {
              signHereTabs: [
                {
                  documentId: '1',
                  pageNumber: '1',
                  xPosition: '100',
                  yPosition: '600'
                }
              ],
              dateSignedTabs: [
                {
                  documentId: '1',
                  pageNumber: '1',
                  xPosition: '100',
                  yPosition: '650'
                }
              ]
            }
          }))
        },
        status: request.status,
        eventNotification: request.callbackUrl ? {
          url: request.callbackUrl,
          loggingEnabled: 'true',
          requireAcknowledgment: 'true',
          envelopeEvents: [
            { envelopeEventStatusCode: 'completed' },
            { envelopeEventStatusCode: 'declined' },
            { envelopeEventStatusCode: 'voided' }
          ]
        } : undefined
      }

      // TODO: Chiamata reale API DocuSign
      // const response = await fetch(`${this.config.apiBasePath}/restapi/v2.1/accounts/${this.config.accountId}/envelopes`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(envelopeDefinition)
      // })

      // MOCK response per sviluppo
      const mockEnvelopeId = `ENV_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const mockResponse: EnvelopeResponse = {
        envelopeId: mockEnvelopeId,
        status: request.status,
        statusDateTime: new Date().toISOString(),
        uri: `/envelopes/${mockEnvelopeId}`
      }

      console.log(`✅ [DOCUSIGN] Envelope creato: ${mockResponse.envelopeId}`)
      console.log(`📬 [DOCUSIGN] Email firma inviata a: ${request.signers[0]?.email}`)

      return mockResponse
    } catch (error) {
      console.error('❌ [DOCUSIGN] Errore creazione envelope:', error)
      throw new Error(`DocuSign envelope creation failed: ${error}`)
    }
  }

  /**
   * Genera URL per firma embedded (iframe/popup)
   */
  async getRecipientView(
    envelopeId: string,
    request: RecipientViewRequest
  ): Promise<RecipientViewResponse> {
    try {
      console.log(`🔗 [DOCUSIGN] Generazione URL firma embedded per envelope: ${envelopeId}`)

      const token = await this.getAccessToken()

      // TODO: Chiamata reale API DocuSign
      // const response = await fetch(
      //   `${this.config.apiBasePath}/restapi/v2.1/accounts/${this.config.accountId}/envelopes/${envelopeId}/views/recipient`,
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify(request)
      //   }
      // )

      // MOCK URL per sviluppo
      const mockUrl = `https://demo.docusign.net/signing/${envelopeId}?clientUserId=${request.clientUserId}`

      console.log(`✅ [DOCUSIGN] URL firma generato: ${mockUrl}`)

      return { url: mockUrl }
    } catch (error) {
      console.error('❌ [DOCUSIGN] Errore generazione recipient view:', error)
      throw new Error(`DocuSign recipient view failed: ${error}`)
    }
  }

  /**
   * Ottiene status di un envelope
   */
  async getEnvelopeStatus(envelopeId: string): Promise<any> {
    try {
      console.log(`🔍 [DOCUSIGN] Verifica status envelope: ${envelopeId}`)

      const token = await this.getAccessToken()

      // TODO: Chiamata reale API DocuSign
      // const response = await fetch(
      //   `${this.config.apiBasePath}/restapi/v2.1/accounts/${this.config.accountId}/envelopes/${envelopeId}`,
      //   {
      //     method: 'GET',
      //     headers: {
      //       'Authorization': `Bearer ${token}`
      //     }
      //   }
      // )

      // MOCK status
      return {
        envelopeId,
        status: 'sent',
        statusDateTime: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ [DOCUSIGN] Errore verifica status:', error)
      throw error
    }
  }

  /**
   * Download documento firmato
   */
  async downloadDocument(envelopeId: string, documentId: string = '1'): Promise<Buffer> {
    try {
      console.log(`📥 [DOCUSIGN] Download documento firmato: ${envelopeId}`)

      const token = await this.getAccessToken()

      // TODO: Chiamata reale API DocuSign
      // const response = await fetch(
      //   `${this.config.apiBasePath}/restapi/v2.1/accounts/${this.config.accountId}/envelopes/${envelopeId}/documents/${documentId}`,
      //   {
      //     method: 'GET',
      //     headers: {
      //       'Authorization': `Bearer ${token}`
      //     }
      //   }
      // )

      // MOCK: ritorna buffer vuoto
      console.log(`✅ [DOCUSIGN] Documento scaricato`)
      return Buffer.from('MOCK_PDF_CONTENT')
    } catch (error) {
      console.error('❌ [DOCUSIGN] Errore download documento:', error)
      throw error
    }
  }
}

/**
 * Helper: Crea DocuSign service da env
 */
export function createDocuSignService(env: any): DocuSignService {
  const config: DocuSignConfig = {
    accountId: env.DOCUSIGN_ACCOUNT_ID || 'DEMO_ACCOUNT_ID',
    clientId: env.DOCUSIGN_CLIENT_ID || 'DEMO_CLIENT_ID',
    userId: env.DOCUSIGN_USER_ID || 'DEMO_USER_ID',
    privateKey: env.DOCUSIGN_PRIVATE_KEY || 'DEMO_PRIVATE_KEY',
    oauthBasePath: env.DOCUSIGN_OAUTH_BASE_PATH || 'https://account-d.docusign.com',
    apiBasePath: env.DOCUSIGN_API_BASE_PATH || 'https://demo.docusign.net'
  }

  return new DocuSignService(config)
}

/**
 * Helper: Prepara contratto per DocuSign
 */
export function prepareContractForDocuSign(
  contractCode: string,
  contractBase64: string,
  signerName: string,
  signerEmail: string
): EnvelopeRequest {
  return {
    emailSubject: `✍️ Firma Contratto eCura - ${contractCode}`,
    emailMessage: `
Gentile ${signerName},

Il tuo contratto eCura è pronto per la firma digitale.

Codice Contratto: ${contractCode}

Clicca sul pulsante per firmare il documento online in modo sicuro.

Grazie per aver scelto eCura!

---
eCura by Medica GB S.r.l.
📧 info@telemedcare.it
📞 02 8715 6826
    `.trim(),
    documents: [
      {
        documentId: '1',
        name: `Contratto_eCura_${contractCode}.pdf`,
        fileExtension: 'pdf',
        documentBase64: contractBase64
      }
    ],
    signers: [
      {
        name: signerName,
        email: signerEmail,
        recipientId: '1'
      }
    ],
    status: 'sent'
  }
}

export default DocuSignService
