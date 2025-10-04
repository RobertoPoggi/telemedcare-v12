/**
 * PAYMENT_SERVICE.TS - Servizio Pagamenti Multi-Gateway
 * TeleMedCare V11.0-Cloudflare - Sistema Modulare
 * 
 * Gestisce:
 * - Stripe payment processing per carte di credito
 * - Bonifico bancario con IBAN automatico
 * - Paypal integration (opzionale)
 * - Installments e finanziamenti
 * - Webhook processing per conferme automatiche
 * - PCI DSS compliance via Stripe
 */

export interface PaymentMethod {
  id: string
  type: 'STRIPE' | 'BONIFICO' | 'PAYPAL' | 'VOUCHER' | 'CORPORATE'
  name: string
  description: string
  fees: number // Percentuale commissioni
  processingTime: string // Tempo elaborazione
  available: boolean
}

export interface PaymentRequest {
  customerId: string
  amount: number // In centesimi (es. 84000 = 840€)
  currency: 'EUR' | 'USD'
  description: string
  
  // Opzioni
  paymentMethodId?: string
  installments?: number // Numero rate
  metadata?: Record<string, string>
  
  // Customer info
  customerEmail: string
  customerName: string
  billingAddress?: {
    line1: string
    city: string
    postal_code: string
    country: string
  }
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  clientSecret?: string // Per Stripe frontend
  redirectUrl?: string // Per bonifici/PayPal
  error?: string
  metadata?: Record<string, any>
  timestamp: string
}

export interface WebhookEvent {
  id: string
  type: string
  data: any
  created: number
}

// =====================================================================
// PAYMENT METHODS CONFIGURATION
// =====================================================================

export const PAYMENT_METHODS: Record<string, PaymentMethod> = {
  STRIPE_CARD: {
    id: 'stripe_card',
    type: 'STRIPE',
    name: 'Carta di Credito/Debito',
    description: 'Visa, Mastercard, American Express',
    fees: 1.8, // 1.8% + €0.25
    processingTime: 'Immediato',
    available: true
  },
  STRIPE_SEPA: {
    id: 'stripe_sepa',
    type: 'STRIPE',
    name: 'Addebito Diretto SEPA',
    description: 'Pagamento diretto dal conto corrente',
    fees: 0.8, // 0.8%
    processingTime: '2-3 giorni lavorativi',
    available: true
  },
  BONIFICO: {
    id: 'bonifico_bancario',
    type: 'BONIFICO',
    name: 'Bonifico Bancario',
    description: 'Bonifico su IBAN aziendale',
    fees: 0, // Nessuna commissione
    processingTime: '1-2 giorni lavorativi',
    available: true
  },
  VOUCHER: {
    id: 'voucher_inps',
    type: 'VOUCHER',
    name: 'Voucher INPS',
    description: 'Pagamento con voucher assistenza',
    fees: 0,
    processingTime: 'Soggetto ad approvazione',
    available: true
  }
}

// =====================================================================
// STRIPE INTEGRATION
// =====================================================================

export class StripeService {
  private static readonly STRIPE_SECRET_KEY = 'sk_test_...' // Da configurare
  private static readonly WEBHOOK_SECRET = 'whsec_...' // Da configurare

  /**
   * Crea Payment Intent Stripe
   */
  static async createPaymentIntent(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // SIMULAZIONE per development
      // In produzione, usare: const stripe = new Stripe(STRIPE_SECRET_KEY)
      
      console.log('💳 Creazione Payment Intent Stripe:', {
        amount: request.amount,
        currency: request.currency,
        customer: request.customerEmail
      })

      // Simula creazione payment intent
      const mockPaymentIntent = {
        id: `pi_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substring(2)}`,
        amount: request.amount,
        currency: request.currency.toLowerCase(),
        status: 'requires_payment_method'
      }

      // In produzione:
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: request.amount,
      //   currency: request.currency.toLowerCase(),
      //   customer: await this.getOrCreateStripeCustomer(request),
      //   description: request.description,
      //   metadata: request.metadata || {},
      //   payment_method_types: ['card', 'sepa_debit'],
      //   ...(request.installments && {
      //     payment_method_options: {
      //       card: { installments: { enabled: true } }
      //     }
      //   })
      // })

      return {
        success: true,
        paymentId: mockPaymentIntent.id,
        clientSecret: mockPaymentIntent.client_secret,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('❌ Errore Stripe Payment Intent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore Stripe',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Gestisce webhook Stripe
   */
  static async processWebhook(payload: string, signature: string): Promise<boolean> {
    try {
      // In produzione:
      // const stripe = new Stripe(STRIPE_SECRET_KEY)
      // const event = stripe.webhooks.constructEvent(payload, signature, WEBHOOK_SECRET)
      
      console.log('🔔 Webhook Stripe ricevuto')
      
      // Mock event per development
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 84000,
            currency: 'eur',
            customer: 'cus_test_123'
          }
        }
      }

      await this.handleStripeEvent(mockEvent)
      return true

    } catch (error) {
      console.error('❌ Errore webhook Stripe:', error)
      return false
    }
  }

  /**
   * Gestisce eventi Stripe
   */
  private static async handleStripeEvent(event: WebhookEvent): Promise<void> {
    console.log(`🎯 Gestione evento Stripe: ${event.type}`)

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.onPaymentSuccess(event.data)
        break
      
      case 'payment_intent.payment_failed':
        await this.onPaymentFailed(event.data)
        break
        
      case 'invoice.payment_succeeded':
        await this.onSubscriptionPaymentSuccess(event.data)
        break

      default:
        console.log(`⚠️ Evento Stripe non gestito: ${event.type}`)
    }
  }

  private static async onPaymentSuccess(paymentData: any): Promise<void> {
    console.log('✅ Pagamento completato:', paymentData.object.id)
    // TODO: Aggiorna database, invia email, attiva servizio
  }

  private static async onPaymentFailed(paymentData: any): Promise<void> {
    console.log('❌ Pagamento fallito:', paymentData.object.id)
    // TODO: Notifica cliente, retry automatico
  }

  private static async onSubscriptionPaymentSuccess(invoiceData: any): Promise<void> {
    console.log('💰 Pagamento abbonamento:', invoiceData.object.id)
    // TODO: Rinnovo servizio automatico
  }
}

// =====================================================================
// BONIFICO BANCARIO SERVICE
// =====================================================================

export class BonificoService {
  private static readonly IBAN_AZIENDALE = 'IT97L0503401727000000003519' // IBAN reale Medica GB
  private static readonly INTESTATARIO = 'Medica GB S.r.l.'
  private static readonly BIC = 'BPMIMIT1' // BIC Banca Popolare di Milano

  /**
   * Genera dati bonifico per cliente
   */
  static generateBonificoData(request: PaymentRequest): PaymentResult {
    const causale = `TeleMedCare ${request.customerId} - ${request.description}`
    
    return {
      success: true,
      paymentId: `BON_${Date.now()}_${request.customerId}`,
      metadata: {
        type: 'bonifico',
        iban: this.IBAN_AZIENDALE,
        intestatario: this.INTESTATARIO,
        bic: this.BIC,
        causale: causale,
        importo: (request.amount / 100).toFixed(2) + '€',
        istruzioni: [
          'Effettui il bonifico con i dati seguenti:',
          `IBAN: ${this.IBAN_AZIENDALE}`,
          `Intestatario: ${this.INTESTATARIO}`,
          `Causale: ${causale}`,
          `Importo: ${(request.amount / 100).toFixed(2)}€`,
          'Una volta effettuato il bonifico, riceverà conferma entro 24h.'
        ]
      },
      timestamp: new Date().toISOString()
    }
  }
}

// =====================================================================
// MAIN PAYMENT SERVICE
// =====================================================================

export class PaymentService {
  private static instance: PaymentService | null = null

  // Lazy loading per Cloudflare Workers
  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService()
    }
    return PaymentService.instance
  }

  /**
   * Elabora pagamento con metodo selezionato
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      console.log(`💰 Elaborazione pagamento: ${request.paymentMethodId}`, {
        amount: request.amount / 100 + '€',
        customer: request.customerEmail
      })

      const paymentMethod = PAYMENT_METHODS[request.paymentMethodId?.toUpperCase() || 'STRIPE_CARD']
      
      if (!paymentMethod || !paymentMethod.available) {
        throw new Error('Metodo di pagamento non disponibile')
      }

      switch (paymentMethod.type) {
        case 'STRIPE':
          return await StripeService.createPaymentIntent(request)
          
        case 'BONIFICO':
          return BonificoService.generateBonificoData(request)
          
        case 'VOUCHER':
          return this.processVoucherPayment(request)
          
        default:
          throw new Error('Metodo di pagamento non supportato')
      }

    } catch (error) {
      console.error('❌ Errore elaborazione pagamento:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore pagamento',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Gestisce pagamenti voucher INPS
   */
  private async processVoucherPayment(request: PaymentRequest): Promise<PaymentResult> {
    console.log('🎫 Elaborazione voucher INPS:', request.customerId)
    
    return {
      success: true,
      paymentId: `VOU_${Date.now()}_${request.customerId}`,
      metadata: {
        type: 'voucher',
        status: 'pending_approval',
        message: 'Richiesta voucher in elaborazione. Riceverà aggiornamenti via email.',
        requiredDocuments: [
          'Copia del voucher INPS',
          'Documento di identità',
          'Certificazione ISEE (se richiesta)'
        ]
      },
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Ottieni metodi di pagamento disponibili
   */
  getAvailablePaymentMethods(): PaymentMethod[] {
    return Object.values(PAYMENT_METHODS).filter(method => method.available)
  }

  /**
   * Calcola commissioni per metodo di pagamento
   */
  calculateFees(amount: number, paymentMethodId: string): number {
    const method = PAYMENT_METHODS[paymentMethodId.toUpperCase()]
    if (!method) return 0

    // Stripe: percentuale + fisso
    if (method.type === 'STRIPE') {
      const percentageFee = (amount * method.fees) / 100
      const fixedFee = method.id === 'stripe_card' ? 25 : 0 // 25 centesimi per carte
      return Math.round(percentageFee + fixedFee)
    }

    // Altri metodi: solo percentuale
    return Math.round((amount * method.fees) / 100)
  }

  /**
   * Genera preventivo con commissioni
   */
  generateQuote(amount: number, paymentMethodId: string): {
    baseAmount: number
    fees: number
    totalAmount: number
    method: PaymentMethod
  } {
    const method = PAYMENT_METHODS[paymentMethodId.toUpperCase()]
    if (!method) throw new Error('Metodo di pagamento non trovato')

    const fees = this.calculateFees(amount, paymentMethodId)
    
    return {
      baseAmount: amount,
      fees: fees,
      totalAmount: amount + fees,
      method: method
    }
  }
}

// =====================================================================
// EXPORT DEFAULTS
// =====================================================================

export default PaymentService