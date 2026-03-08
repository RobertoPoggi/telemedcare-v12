/**
 * TeleMedCare V12.0 - Payment Manager
 * Gestisce pagamenti: bonifici e Stripe
 */

export interface PaymentData {
  proformaId: string
  contractId: string
  leadId: string
  importo: number
  metodoPagamento: 'BONIFICO' | 'STRIPE_CARD' | 'STRIPE_SEPA'
  transactionId?: string
  riferimentoBonifico?: string
  ibanMittente?: string
  stripePaymentIntentId?: string
  stripeChargeId?: string
  note?: string
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  error?: string
  stripeClientSecret?: string
}

/**
 * Genera ID pagamento univoco
 */
function generatePaymentId(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `PAY${timestamp}${random}`
}

/**
 * Registra un pagamento nel database
 */
export async function registerPayment(
  db: D1Database,
  paymentData: PaymentData
): Promise<PaymentResult> {
  try {
    const paymentId = generatePaymentId()
    
    console.log(`💳 [PAYMENT] Registrazione pagamento ${paymentId} per proforma ${paymentData.proformaId}`)
    console.log(`💳 [PAYMENT DEBUG] Full paymentData:`, JSON.stringify(paymentData))

    // ✅ Prepara TUTTI i campi dello schema payments
    const now = new Date().toISOString()
    
    // Inserisci pagamento nel database con TUTTI i campi
    const insertResult = await db.prepare(`
      INSERT INTO payments (
        id,
        proforma_id,
        contract_id,
        leadId,
        importo,
        valuta,
        metodo_pagamento,
        transaction_id,
        riferimento_bonifico,
        iban_mittente,
        status,
        data_pagamento,
        data_conferma,
        stripe_payment_intent_id,
        stripe_charge_id,
        paypal_transaction_id,
        note,
        verificato_manualmente,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      paymentId,                                    // id
      paymentData.proformaId,                       // proforma_id
      paymentData.contractId,                       // contract_id
      paymentData.leadId,                           // leadId
      paymentData.importo,                          // importo
      'EUR',                                        // valuta
      paymentData.metodoPagamento,                  // metodo_pagamento
      paymentData.transactionId || null,            // transaction_id
      paymentData.riferimentoBonifico || null,      // riferimento_bonifico
      paymentData.ibanMittente || null,             // iban_mittente
      'COMPLETED',                                  // status (COMPLETED se arriva qui da Stripe)
      now,                                          // data_pagamento
      now,                                          // data_conferma
      paymentData.stripePaymentIntentId || null,    // stripe_payment_intent_id
      paymentData.stripeChargeId || null,           // stripe_charge_id
      null,                                         // paypal_transaction_id
      paymentData.note || null,                     // note
      0,                                            // verificato_manualmente
      now,                                          // created_at
      now                                           // updated_at
    ).run()
    
    console.log(`✅ [PAYMENT] INSERT successful:`, insertResult)

    console.log(`✅ [PAYMENT] Pagamento ${paymentId} registrato con successo`)

    return {
      success: true,
      paymentId: paymentId
    }

  } catch (error) {
    console.error(`❌ [PAYMENT] Errore registrazione pagamento:`, error)
    
    // Return debug info in error response
    const field1 = generatePaymentId()
    const field2 = paymentData.proformaId
    const field3 = paymentData.contractId
    const field4 = paymentData.leadId
    const field5 = paymentData.importo
    const field6 = 'EUR'
    const field7 = paymentData.metodoPagamento
    const field8 = paymentData.transactionId || null
    const field9 = 'PENDING'
    
    const debugInfo = {
      field1_id: { value: field1, type: typeof field1, isUndefined: field1 === undefined },
      field2_proforma_id: { value: field2, type: typeof field2, isUndefined: field2 === undefined },
      field3_contract_id: { value: field3, type: typeof field3, isUndefined: field3 === undefined },
      field4_leadId: { value: field4, type: typeof field4, isUndefined: field4 === undefined },
      field5_importo: { value: field5, type: typeof field5, isUndefined: field5 === undefined },
      field6_valuta: { value: field6, type: typeof field6, isUndefined: field6 === undefined },
      field7_metodo: { value: field7, type: typeof field7, isUndefined: field7 === undefined },
      field8_transaction_id: { value: field8, type: typeof field8, isUndefined: field8 === undefined },
      field9_status: { value: field9, type: typeof field9, isUndefined: field9 === undefined },
      originalError: error.message
    }
    
    return {
      success: false,
      error: error.message,
      debug: debugInfo
    } as any
  }
}

/**
 * Conferma un pagamento (manuale per bonifici, automatico per Stripe)
 */
export async function confirmPayment(
  db: D1Database,
  paymentId: string
): Promise<PaymentResult> {
  try {
    console.log(`✅ [PAYMENT] Conferma pagamento ${paymentId}`)

    // Aggiorna status pagamento a COMPLETED
    await db.prepare(`
      UPDATE payments 
      SET status = 'COMPLETED', 
          data_conferma = datetime('now')
      WHERE id = ?
    `).bind(paymentId).run()

    // Ottieni dati pagamento per aggiornare proforma e lead
    const payment = await db.prepare(`
      SELECT * FROM payments WHERE id = ?
    `).bind(paymentId).first<any>()

    if (payment) {
      // Aggiorna status proforma a PAID
      await db.prepare(`
        UPDATE proforma 
        SET status = 'PAID', updated_at = datetime('now')
        WHERE id = ?
      `).bind(payment.proforma_id).run()

      // Aggiorna status lead a CONVERTED
      await db.prepare(`
        UPDATE leads 
        SET status = 'CONVERTED', updated_at = datetime('now')
        WHERE id = ?
      `).bind(payment.leadId).run()

      console.log(`✅ [PAYMENT] Pagamento confermato e status aggiornati`)
    }

    return {
      success: true,
      paymentId: paymentId
    }

  } catch (error) {
    console.error(`❌ [PAYMENT] Errore conferma pagamento:`, error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Crea un Payment Intent Stripe
 */
export async function createStripePaymentIntent(
  env: any,
  amount: number, // in centesimi (es. 58560 per €585.60)
  description: string,
  metadata: any
): Promise<PaymentResult> {
  try {
    console.log(`💳 [STRIPE] Creazione Payment Intent per €${(amount / 100).toFixed(2)}`)

    // ✅ Usa STRIPE_SECRET_KEY che contiene:
    // - sk_test_... in Preview (Environment Variables Preview)
    // - sk_live_... in Production (Environment Variables Production)
    const stripeApiKey = env.STRIPE_SECRET_KEY
    
    if (!stripeApiKey) {
      console.warn(`⚠️ [STRIPE] API Key non configurata, modalità test`)
      return {
        success: true,
        stripeClientSecret: `test_client_secret_${Date.now()}`,
        paymentId: `test_pi_${Date.now()}`
      }
    }
    
    const isTestMode = stripeApiKey.startsWith('sk_test')
    console.log(`🔑 [STRIPE] Using ${isTestMode ? 'TEST' : 'LIVE'} mode`)
    console.log(`🔑 [STRIPE] Key prefix: ${stripeApiKey.substring(0, 15)}...`)
    
    // Verifica che in produzione non si usi test key
    if (env.ENVIRONMENT === 'production' && isTestMode) {
      console.error(`🚨 [STRIPE] ERRORE: Stai usando TEST key in ambiente PRODUCTION!`)
    }
    if (env.ENVIRONMENT !== 'production' && !isTestMode) {
      console.warn(`⚠️ [STRIPE] ATTENZIONE: Stai usando LIVE key in ambiente NON-production!`)
    }

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeApiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        amount: amount.toString(),
        currency: 'eur',
        description: description,
        'metadata[proforma_id]': metadata.proformaId || '',
        'metadata[contract_id]': metadata.contractId || '',
        'metadata[lead_id]': metadata.leadId || ''
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Stripe API error: ${error}`)
    }

    const paymentIntent = await response.json()

    console.log(`✅ [STRIPE] Payment Intent creato: ${paymentIntent.id}`)

    return {
      success: true,
      stripeClientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id
    }

  } catch (error) {
    console.error(`❌ [STRIPE] Errore creazione Payment Intent:`, error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Gestisce webhook Stripe per conferma pagamento automatica
 */
export async function handleStripeWebhook(
  db: D1Database,
  event: any
): Promise<PaymentResult> {
  try {
    console.log(`🔔 [STRIPE WEBHOOK] Evento ricevuto: ${event.type}`)

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object

      // Cerca il pagamento nel database
      const payment = await db.prepare(`
        SELECT * FROM payments 
        WHERE stripe_payment_intent_id = ?
      `).bind(paymentIntent.id).first<any>()

      if (payment) {
        // Conferma automaticamente il pagamento
        await confirmPayment(db, payment.id)
        
        console.log(`✅ [STRIPE WEBHOOK] Pagamento ${payment.id} confermato automaticamente`)

        return {
          success: true,
          paymentId: payment.id
        }
      } else {
        console.warn(`⚠️ [STRIPE WEBHOOK] Pagamento non trovato per PaymentIntent ${paymentIntent.id}`)
      }
    }

    return { success: true }

  } catch (error) {
    console.error(`❌ [STRIPE WEBHOOK] Errore gestione webhook:`, error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Verifica se una proforma è stata pagata
 */
export async function isProformaPaid(
  db: D1Database,
  proformaId: string
): Promise<boolean> {
  try {
    const result = await db.prepare(`
      SELECT COUNT(*) as count 
      FROM payments 
      WHERE proforma_id = ? AND status = 'COMPLETED'
    `).bind(proformaId).first<any>()

    return result?.count > 0

  } catch (error) {
    console.error(`❌ [PAYMENT] Errore verifica pagamento:`, error)
    return false
  }
}

/**
 * Ottieni dettagli pagamento
 */
export async function getPaymentDetails(
  db: D1Database,
  paymentId: string
): Promise<any> {
  try {
    const payment = await db.prepare(`
      SELECT * FROM payments WHERE id = ?
    `).bind(paymentId).first()

    return payment

  } catch (error) {
    console.error(`❌ [PAYMENT] Errore recupero dettagli pagamento:`, error)
    return null
  }
}

export default {
  registerPayment,
  confirmPayment,
  createStripePaymentIntent,
  handleStripeWebhook,
  isProformaPaid,
  getPaymentDetails
}
