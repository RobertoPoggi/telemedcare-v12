/**
 * PAYMENT_SERVICE.TS - Sistema Pagamenti Multi-Method
 * TeleMedCare V12.0-Cloudflare - Sistema Modulare
 * 
 * Gestisce:
 * - Pagamento Stripe per proforma e contratti
 * - Pagamento bonifico bancario con tracking
 * - Pagamento PayPal per transazioni internazionali
 * - Tracking stati pagamento e notifiche automatiche
 * - Integrazione con workflow TeleMedCare dopo proforma
 * - Fatturazione automatica e gestione IVA
 */

export interface PaymentRequest {
  id: string
  customerId: string
  
  // Dati ordine
  orderType: 'PROFORMA' | 'CONTRACT' | 'SUBSCRIPTION' | 'DEVICE' | 'CONSULTATION'
  amount: number
  currency: 'EUR' | 'USD' | 'GBP'
  description: string
  
  // Dati cliente
  customerName: string
  customerEmail: string
  customerPhone?: string
  
  // Metodo pagamento
  paymentMethod: 'STRIPE' | 'BANK_TRANSFER' | 'PAYPAL' | 'APPLE_PAY' | 'GOOGLE_PAY'
  
  // Status tracking
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  createdAt: string
  
  // Metadata
  metadata?: Record<string, any>
  
  // Invoice data
  invoiceData?: {
    companyName?: string
    vatNumber?: string
    address?: string
    city?: string
    country?: string
    fiscalCode?: string
  }
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  paymentUrl?: string // Per redirect Stripe/PayPal
  bankDetails?: BankTransferDetails // Per bonifico
  transactionId?: string
  error?: string
  timestamp: string
  nextSteps?: string[]
}

export interface BankTransferDetails {
  iban: string
  bic: string
  bankName: string
  accountHolder: string
  reference: string
  amount: number
  currency: string
  instructions: string[]
}

export interface StripePaymentData {
  paymentIntentId: string
  clientSecret: string
  paymentMethodTypes: string[]
  captureMethod: 'automatic' | 'manual'
}

// =====================================================================
// PAYMENT METHODS CONFIGURATION
// =====================================================================

export const PAYMENT_METHODS = {
  STRIPE: {
    id: 'stripe',
    name: 'Carta di Credito/Debito',
    description: 'Pagamento immediato con Visa, Mastercard, American Express',
    processingTime: 'Immediato',
    fees: '2.9% + €0.25',
    currencies: ['EUR', 'USD', 'GBP'],
    supported: ['visa', 'mastercard', 'amex', 'bancontact', 'sepa_debit']
  },
  BANK_TRANSFER: {
    id: 'bank_transfer', 
    name: 'Bonifico Bancario',
    description: 'Bonifico SEPA gratuito con tracking automatico',
    processingTime: '1-3 giorni lavorativi',
    fees: 'Gratuito',
    currencies: ['EUR'],
    supported: ['sepa', 'wire_transfer']
  },
  PAYPAL: {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pagamento PayPal per clienti internazionali', 
    processingTime: 'Immediato',
    fees: '3.4% + €0.35',
    currencies: ['EUR', 'USD', 'GBP'],
    supported: ['paypal_balance', 'paypal_credit']
  }
}

// =====================================================================
// STRIPE PAYMENT SERVICE
// =====================================================================

export class StripePaymentService {
  private static readonly STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_...'
  private static readonly STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_...'
  private static readonly WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...'

  /**
   * Crea Payment Intent Stripe
   */
  static async createStripePayment(request: Omit<PaymentRequest, 'id' | 'status' | 'createdAt'>): Promise<PaymentResult> {
    try {
      const paymentId = `PAY_STRIPE_${Date.now()}_${Math.random().toString(36).substring(2)}`
      
      console.log('💳 Creazione pagamento Stripe:', {
        customer: request.customerName,
        amount: `€${request.amount}`,
        type: request.orderType
      })

      // Simula creazione Payment Intent Stripe
      // In produzione: usare Stripe SDK
      const mockPaymentIntent = {
        id: `pi_${Date.now()}${Math.random().toString(36).substring(2)}`,
        client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substring(2)}`,
        amount: Math.round(request.amount * 100), // Centesimi
        currency: request.currency.toLowerCase(),
        status: 'requires_payment_method',
        payment_method_types: ['card', 'sepa_debit', 'bancontact'],
        metadata: request.metadata || {} // Include metadata per webhook
      }

      // URL checkout Stripe
      const checkoutUrl = `https://checkout.stripe.com/pay/${mockPaymentIntent.client_secret}`

      return {
        success: true,
        paymentId: paymentId,
        paymentUrl: checkoutUrl,
        transactionId: mockPaymentIntent.id,
        timestamp: new Date().toISOString(),
        nextSteps: [
          '1. Cliente reindirizzato a checkout Stripe',
          '2. Inserimento dati carta di credito',
          '3. Autorizzazione 3D Secure se richiesta',
          '4. Conferma pagamento e ritorno al sito',
          '5. Attivazione automatica servizi TeleMedCare'
        ]
      }

    } catch (error) {
      console.error('❌ Errore Stripe:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore pagamento Stripe',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Gestisce webhook Stripe
   */
  static async processStripeWebhook(payload: any, signature: string): Promise<void> {
    try {
      console.log('🔔 Webhook Stripe ricevuto:', payload.type)
      
      // In produzione: verificare signature
      // const event = stripe.webhooks.constructEvent(payload, signature, this.WEBHOOK_SECRET)
      
      switch (payload.type) {
        case 'payment_intent.succeeded':
          await this.onPaymentSucceeded(payload.data.object)
          break
        case 'payment_intent.payment_failed':
          await this.onPaymentFailed(payload.data.object)
          break
        case 'charge.dispute.created':
          await this.onChargeDispute(payload.data.object)
          break
        case 'invoice.payment_succeeded':
          await this.onInvoicePayment(payload.data.object)
          break
      }

    } catch (error) {
      console.error('❌ Errore webhook Stripe:', error)
    }
  }

  private static async onPaymentSucceeded(paymentIntent: any): Promise<void> {
    console.log('✅ Pagamento Stripe completato:', paymentIntent.id)
    
    try {
      // Estrai lead_id dai metadata del payment intent
      const leadId = paymentIntent.metadata?.lead_id
      const proformaNumber = paymentIntent.metadata?.proforma_number
      
      if (!leadId) {
        console.log('⚠️ Lead ID non trovato nei metadata del pagamento')
        return
      }
      
      console.log('🎉 [WEBHOOK] Attivazione workflow email benvenuto per lead:', leadId)
      
      // Importa dinamicamente la funzione dal modulo principale
      const { triggerWelcomeEmailAfterPayment } = await import('../index')
      
      // Trigger email benvenuto dopo conferma pagamento
      const emailSent = await triggerWelcomeEmailAfterPayment(leadId, paymentIntent.id, proformaNumber)
      
      if (emailSent) {
        console.log('✅ [WEBHOOK] Email benvenuto inviata con successo per lead:', leadId)
      } else {
        console.error('❌ [WEBHOOK] Errore invio email benvenuto per lead:', leadId)
      }
      
    } catch (error) {
      console.error('❌ [WEBHOOK] Errore elaborazione pagamento:', error)
    }
  }

  private static async onPaymentFailed(paymentIntent: any): Promise<void> {
    console.log('❌ Pagamento Stripe fallito:', paymentIntent.id)
    // TODO: Notifica fallimento, offri alternative payment
  }

  private static async onChargeDispute(dispute: any): Promise<void> {
    console.log('⚠️ Controversia Stripe:', dispute.id)
    // TODO: Notifica team, prepara documentazione
  }

  private static async onInvoicePayment(invoice: any): Promise<void> {
    console.log('📋 Fattura Stripe pagata:', invoice.id) 
    // TODO: Marca fattura come pagata, attiva servizi ricorrenti
  }
}

// =====================================================================
// BANK TRANSFER SERVICE
// =====================================================================

export class BankTransferService {
  private static readonly COMPANY_BANK_DETAILS = {
    iban: 'IT60 X054 2811 1010 0000 0123 456',
    bic: 'BPMIITM1XXX',
    bankName: 'Banca Popolare di Milano',
    accountHolder: 'TeleMedCare S.r.l.',
    address: 'Via Roma 123, 20100 Milano, Italy'
  }

  /**
   * Crea bonifico bancario
   */
  static async createBankTransfer(request: Omit<PaymentRequest, 'id' | 'status' | 'createdAt'>): Promise<PaymentResult> {
    try {
      const paymentId = `PAY_BANK_${Date.now()}_${Math.random().toString(36).substring(2)}`
      const reference = `TMC${Date.now().toString().slice(-8)}${request.customerId.slice(-4)}`
      
      console.log('🏦 Creazione bonifico bancario:', {
        customer: request.customerName,
        amount: `€${request.amount}`,
        reference: reference
      })

      const bankDetails: BankTransferDetails = {
        ...this.COMPANY_BANK_DETAILS,
        reference: reference,
        amount: request.amount,
        currency: request.currency,
        instructions: [
          '1. Effettua bonifico SEPA con i dati forniti',
          '2. IMPORTANTE: Inserisci esattamente la causale indicata',
          '3. Il pagamento verrà verificato automaticamente in 1-3 giorni',
          '4. Riceverai email di conferma alla ricezione',
          '5. I servizi saranno attivati entro 24h dalla verifica'
        ]
      }

      // Genera email con dettagli bonifico
      await this.sendBankTransferInstructions(request.customerEmail, request.customerName, bankDetails)

      return {
        success: true,
        paymentId: paymentId,
        bankDetails: bankDetails,
        timestamp: new Date().toISOString(),
        nextSteps: [
          'Email con istruzioni bonifico inviata',
          'Attendere 1-3 giorni lavorativi per accredito',
          'Verifica automatica pagamento',
          'Attivazione servizi TeleMedCare'
        ]
      }

    } catch (error) {
      console.error('❌ Errore bonifico:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore bonifico bancario',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Verifica pagamenti bonifico ricevuti
   */
  static async checkBankTransferPayments(): Promise<void> {
    try {
      console.log('🔍 Verifica pagamenti bonifico ricevuti...')
      
      // In produzione: integrazione con API bancaria o file MT940/camt.053
      // Per ora simula controllo
      const mockTransactions = [
        {
          amount: 299.00,
          reference: 'TMC12345678CUST',
          date: new Date().toISOString(),
          sender: 'Mario Rossi'
        }
      ]

      for (const transaction of mockTransactions) {
        await this.processBankTransferReceived(transaction)
      }

    } catch (error) {
      console.error('❌ Errore verifica bonifici:', error)
    }
  }

  private static async sendBankTransferInstructions(email: string, name: string, bankDetails: BankTransferDetails): Promise<void> {
    console.log(`📧 Istruzioni bonifico inviate a ${email}`)
    // TODO: Integrazione email con template bonifico
  }

  private static async processBankTransferReceived(transaction: any): Promise<void> {
    console.log('✅ Bonifico ricevuto:', transaction.reference)
    // TODO: Match con ordine, attiva servizi, invia conferma
  }
}

// =====================================================================
// PAYPAL PAYMENT SERVICE
// =====================================================================

export class PayPalService {
  private static readonly PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'your_client_id'
  private static readonly PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'your_client_secret'
  private static readonly PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.paypal.com' 
    : 'https://api.sandbox.paypal.com'

  /**
   * Crea ordine PayPal
   */
  static async createPayPalPayment(request: Omit<PaymentRequest, 'id' | 'status' | 'createdAt'>): Promise<PaymentResult> {
    try {
      const paymentId = `PAY_PAYPAL_${Date.now()}_${Math.random().toString(36).substring(2)}`
      
      console.log('💰 Creazione pagamento PayPal:', {
        customer: request.customerName,
        amount: `${request.currency} ${request.amount}`,
        type: request.orderType
      })

      // Simula creazione ordine PayPal
      // In produzione: usare PayPal SDK
      const mockOrder = {
        id: `ORDER_${Date.now()}${Math.random().toString(36).substring(2)}`,
        status: 'CREATED',
        links: [
          {
            href: `https://www.sandbox.paypal.com/checkoutnow?token=ORDER_${Date.now()}`,
            rel: 'approve',
            method: 'GET'
          }
        ]
      }

      const approvalUrl = mockOrder.links.find(link => link.rel === 'approve')?.href

      return {
        success: true,
        paymentId: paymentId,
        paymentUrl: approvalUrl,
        transactionId: mockOrder.id,
        timestamp: new Date().toISOString(),
        nextSteps: [
          '1. Cliente reindirizzato a PayPal',
          '2. Login PayPal o pagamento guest',
          '3. Conferma pagamento PayPal',
          '4. Ritorno al sito TeleMedCare', 
          '5. Attivazione automatica servizi'
        ]
      }

    } catch (error) {
      console.error('❌ Errore PayPal:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore pagamento PayPal',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Gestisce webhook PayPal
   */
  static async processPayPalWebhook(payload: any): Promise<void> {
    try {
      console.log('🔔 Webhook PayPal ricevuto:', payload.event_type)
      
      switch (payload.event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          await this.onPaymentCompleted(payload.resource)
          break
        case 'PAYMENT.CAPTURE.DENIED':
          await this.onPaymentDenied(payload.resource)
          break
        case 'CHECKOUT.ORDER.APPROVED':
          await this.onOrderApproved(payload.resource)
          break
      }

    } catch (error) {
      console.error('❌ Errore webhook PayPal:', error)
    }
  }

  private static async onPaymentCompleted(capture: any): Promise<void> {
    console.log('✅ Pagamento PayPal completato:', capture.id)
    // TODO: Attiva servizi, invia conferma
  }

  private static async onPaymentDenied(capture: any): Promise<void> {
    console.log('❌ Pagamento PayPal negato:', capture.id)
    // TODO: Notifica fallimento
  }

  private static async onOrderApproved(order: any): Promise<void> {
    console.log('👍 Ordine PayPal approvato:', order.id)
    // TODO: Cattura pagamento automaticamente
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
   * Crea richiesta pagamento con metodo selezionato
   */
  async createPaymentRequest(
    orderType: PaymentRequest['orderType'],
    amount: number,
    customerData: {
      name: string
      email: string
      phone?: string
    },
    paymentMethod: PaymentRequest['paymentMethod'] = 'STRIPE',
    currency: PaymentRequest['currency'] = 'EUR',
    description?: string,
    invoiceData?: PaymentRequest['invoiceData']
  ): Promise<PaymentResult> {
    try {
      console.log(`💳 Creazione pagamento ${paymentMethod}:`, {
        customer: customerData.name,
        amount: `${currency} ${amount}`,
        type: orderType
      })

      const request = {
        customerId: `CUST_${Date.now()}`,
        orderType,
        amount,
        currency,
        description: description || `${orderType} - TeleMedCare`,
        customerName: customerData.name,
        customerEmail: customerData.email,
        customerPhone: customerData.phone,
        paymentMethod,
        invoiceData,
        metadata: {
          userAgent: 'TeleMedCare V12.0',
          timestamp: new Date().toISOString(),
          source: 'dashboard'
        }
      }

      switch (paymentMethod) {
        case 'STRIPE':
          return await StripePaymentService.createStripePayment(request)
        
        case 'BANK_TRANSFER':
          return await BankTransferService.createBankTransfer(request)
        
        case 'PAYPAL':
          return await PayPalService.createPayPalPayment(request)
        
        default:
          throw new Error('Metodo di pagamento non supportato')
      }

    } catch (error) {
      console.error('❌ Errore creazione pagamento:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore creazione pagamento',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Ottieni metodi di pagamento disponibili
   */
  getAvailablePaymentMethods(): typeof PAYMENT_METHODS {
    return PAYMENT_METHODS
  }

  /**
   * Verifica stato pagamento
   */
  async getPaymentStatus(paymentId: string): Promise<{
    status: PaymentRequest['status']
    progress: number
    lastUpdate: string
    nextAction?: string
    transactionDetails?: any
  }> {
    // Simula verifica stato
    console.log(`🔍 Verifica stato pagamento: ${paymentId}`)
    
    return {
      status: 'PENDING',
      progress: 50,
      lastUpdate: new Date().toISOString(),
      nextAction: 'Attendere completamento pagamento cliente',
      transactionDetails: {
        method: 'Stripe',
        amount: '€299.00',
        customer: 'Mario Rossi'
      }
    }
  }

  /**
   * Gestisce workflow post-pagamento TeleMedCare
   */
  async processPostPaymentWorkflow(paymentResult: PaymentResult, orderType: string): Promise<void> {
    try {
      if (!paymentResult.success) {
        console.log('❌ Pagamento fallito, skip workflow post-pagamento')
        return
      }

      console.log('🔄 Avvio workflow post-pagamento TeleMedCare:', orderType)

      switch (orderType) {
        case 'PROFORMA':
          await this.activateProformaServices(paymentResult)
          break
        case 'CONTRACT':
          await this.activateContractServices(paymentResult)
          break
        case 'SUBSCRIPTION':
          await this.activateSubscriptionServices(paymentResult)
          break
        case 'DEVICE':
          await this.activateDeviceServices(paymentResult)
          break
        case 'CONSULTATION':
          await this.activateConsultationServices(paymentResult)
          break
      }

    } catch (error) {
      console.error('❌ Errore workflow post-pagamento:', error)
    }
  }

  private async activateProformaServices(paymentResult: PaymentResult): Promise<void> {
    console.log('📋 Attivazione servizi post-proforma:', paymentResult.paymentId)
    // TODO: 
    // 1. Genera contratto definitivo
    // 2. Invia per firma elettronica
    // 3. Attiva servizi base TeleMedCare
    // 4. Associa dispositivi se presenti nell'ordine
    // 5. Programma consultazioni iniziali
  }

  private async activateContractServices(paymentResult: PaymentResult): Promise<void> {
    console.log('📄 Attivazione servizi post-contratto:', paymentResult.paymentId)
    // TODO: Attivazione completa servizi dopo firma contratto
  }

  private async activateSubscriptionServices(paymentResult: PaymentResult): Promise<void> {
    console.log('🔄 Attivazione abbonamento:', paymentResult.paymentId) 
    // TODO: Setup servizi ricorrenti
  }

  private async activateDeviceServices(paymentResult: PaymentResult): Promise<void> {
    console.log('📱 Attivazione dispositivi:', paymentResult.paymentId)
    // TODO: Associa dispositivi, configura monitoraggio
  }

  private async activateConsultationServices(paymentResult: PaymentResult): Promise<void> {
    console.log('👨‍⚕️ Attivazione consulenza:', paymentResult.paymentId)
    // TODO: Programma consulenza, invia link meet
  }
}

// =====================================================================
// EXPORT DEFAULTS
// =====================================================================

// Export StripeService per compatibilità con webhook handler
export const StripeService = {
  processWebhook: async (payload: string, signature: string): Promise<boolean> => {
    try {
      const webhookData = JSON.parse(payload)
      await StripePaymentService.processStripeWebhook(webhookData, signature)
      return true
    } catch (error) {
      console.error('❌ Errore processamento webhook Stripe:', error)
      return false
    }
  }
}

export default PaymentService