/**
 * STRIPE-SERVICE.TS - Stripe Payment Integration
 * eCura V12.0 - Payment Processing
 * 
 * Gestisce pagamenti tramite Stripe:
 * - Payment Links per proforma
 * - Webhook per eventi pagamento
 * - Payment Intents tracking
 * 
 * WORKFLOW:
 * 1. Genera Payment Link per proforma
 * 2. Cliente paga tramite link
 * 3. Stripe invia webhook conferma pagamento
 * 4. Sistema attiva servizio (Passo 4)
 */

export interface StripeConfig {
  secretKey: string
  publicKey: string
  webhookSecret: string
  apiVersion: string
}

export interface PaymentLinkRequest {
  amount: number // in centesimi (es. 102480 = €1.024,80)
  currency: string // 'eur'
  description: string
  metadata?: Record<string, string>
  successUrl?: string
  cancelUrl?: string
}

export interface PaymentLinkResponse {
  id: string
  url: string
  active: boolean
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  clientSecret?: string
}

/**
 * Stripe Service - Gestione pagamenti
 */
export class StripeService {
  private config: StripeConfig
  private baseUrl: string = 'https://api.stripe.com/v1'

  constructor(config: StripeConfig) {
    this.config = config
  }

  /**
   * Crea Payment Link per proforma
   */
  async createPaymentLink(request: PaymentLinkRequest): Promise<PaymentLinkResponse> {
    try {
      console.log(`💳 [STRIPE] Creazione Payment Link per €${(request.amount / 100).toFixed(2)}`)

      // TODO: Chiamata reale API Stripe
      // const response = await fetch(`${this.baseUrl}/payment_links`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.config.secretKey}`,
      //     'Content-Type': 'application/x-www-form-urlencoded'
      //   },
      //   body: new URLSearchParams({
      //     'line_items[0][price_data][currency]': request.currency,
      //     'line_items[0][price_data][product_data][name]': request.description,
      //     'line_items[0][price_data][unit_amount]': request.amount.toString(),
      //     'line_items[0][quantity]': '1',
      //     'after_completion[type]': 'redirect',
      //     'after_completion[redirect][url]': request.successUrl || 'https://ecura.it/grazie',
      //     ...Object.entries(request.metadata || {}).reduce((acc, [key, val]) => ({
      //       ...acc,
      //       [`metadata[${key}]`]: val
      //     }), {})
      //   })
      // })

      // MOCK response per sviluppo
      const mockId = `plink_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const mockUrl = `https://buy.stripe.com/test_${mockId}`

      const mockResponse: PaymentLinkResponse = {
        id: mockId,
        url: mockUrl,
        active: true
      }

      console.log(`✅ [STRIPE] Payment Link creato: ${mockResponse.url}`)

      return mockResponse
    } catch (error) {
      console.error('❌ [STRIPE] Errore creazione Payment Link:', error)
      throw new Error(`Stripe Payment Link creation failed: ${error}`)
    }
  }

  /**
   * Crea Payment Intent (alternativa a Payment Link)
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'eur',
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    try {
      console.log(`💳 [STRIPE] Creazione Payment Intent per €${(amount / 100).toFixed(2)}`)

      // TODO: Chiamata reale API Stripe
      // const response = await fetch(`${this.baseUrl}/payment_intents`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.config.secretKey}`,
      //     'Content-Type': 'application/x-www-form-urlencoded'
      //   },
      //   body: new URLSearchParams({
      //     amount: amount.toString(),
      //     currency,
      //     'automatic_payment_methods[enabled]': 'true',
      //     ...Object.entries(metadata || {}).reduce((acc, [key, val]) => ({
      //       ...acc,
      //       [`metadata[${key}]`]: val
      //     }), {})
      //   })
      // })

      // MOCK response
      const mockId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

      return {
        id: mockId,
        amount,
        currency,
        status: 'requires_payment_method',
        clientSecret: `${mockId}_secret_${Math.random().toString(36).substring(2, 9)}`
      }
    } catch (error) {
      console.error('❌ [STRIPE] Errore creazione Payment Intent:', error)
      throw error
    }
  }

  /**
   * Recupera Payment Intent
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      console.log(`🔍 [STRIPE] Recupero Payment Intent: ${paymentIntentId}`)

      // TODO: Chiamata reale API Stripe
      // const response = await fetch(`${this.baseUrl}/payment_intents/${paymentIntentId}`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${this.config.secretKey}`
      //   }
      // })

      // MOCK
      return {
        id: paymentIntentId,
        amount: 102480,
        currency: 'eur',
        status: 'succeeded'
      }
    } catch (error) {
      console.error('❌ [STRIPE] Errore recupero Payment Intent:', error)
      throw error
    }
  }

  /**
   * Valida webhook signature Stripe
   */
  static validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // TODO: Implementare validazione HMAC Stripe
    // const crypto = require('crypto')
    // const expectedSignature = crypto
    //   .createHmac('sha256', secret)
    //   .update(payload)
    //   .digest('hex')
    // return signature === expectedSignature

    console.log('⚠️ [STRIPE] Validazione webhook signature TODO')
    return true // Per sviluppo
  }
}

/**
 * Helper: Crea Stripe service da env
 */
export function createStripeService(env: any): StripeService {
  const config: StripeConfig = {
    secretKey: env.STRIPE_SECRET_KEY || 'sk_test_DEMO',
    publicKey: env.STRIPE_PUBLIC_KEY || 'pk_test_DEMO',
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || 'whsec_DEMO',
    apiVersion: '2023-10-16'
  }

  return new StripeService(config)
}

/**
 * Helper: Converti euro in centesimi per Stripe
 */
export function euroToCents(euro: number): number {
  return Math.round(euro * 100)
}

/**
 * Helper: Converti centesimi in euro
 */
export function centsToEuro(cents: number): number {
  return cents / 100
}

/**
 * Helper: Crea Payment Link per proforma eCura
 */
export async function createProformaPaymentLink(
  stripe: StripeService,
  proformaNumber: string,
  contractCode: string,
  servizio: string,
  piano: string,
  totale: number,
  nomeCliente: string,
  emailCliente: string
): Promise<PaymentLinkResponse> {
  
  const description = `Proforma ${proformaNumber} - eCura ${servizio} ${piano}`
  
  return await stripe.createPaymentLink({
    amount: euroToCents(totale),
    currency: 'eur',
    description,
    metadata: {
      proforma_number: proformaNumber,
      contract_code: contractCode,
      servizio,
      piano,
      cliente_nome: nomeCliente,
      cliente_email: emailCliente
    },
    successUrl: `https://www.ecura.it/pagamento-confermato?proforma=${proformaNumber}`,
    cancelUrl: `https://www.ecura.it/pagamento-annullato?proforma=${proformaNumber}`
  })
}

export default StripeService
