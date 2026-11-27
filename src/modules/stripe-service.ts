/**
 * STRIPE-SERVICE.TS - Stripe Payment Integration (FASE 2: chiamate reali, niente mock)
 * eCura V12.0 - Payment Processing
 *
 * - Payment Links reali (POST /v1/payment_links)
 * - Payment Intent reali (POST /v1/payment_intents)
 * - Verifica firma webhook (HMAC-SHA256 su `t.payload`, tolleranza 5 minuti) via Web Crypto
 *
 * Nessuna chiave nel codice: arrivano da env (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET).
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
  /** @deprecated non supportato da /v1/payment_links, non viene inviato a Stripe */
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

export interface WebhookVerification {
  ok: boolean
  error?: string
  timestamp?: number
}

const DEFAULT_SUCCESS_URL = 'https://www.ecura.it/grazie'
const TOLERANZA_SECONDI = 300

function encodeForm(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') sp.append(k, String(v))
  }
  return sp.toString()
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16)
  return out
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
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

  private assertSecret(): void {
    if (!this.config.secretKey || !String(this.config.secretKey).trim()) {
      throw new Error('STRIPE_SECRET_KEY non configurata')
    }
  }

  private async request(path: string, init?: RequestInit): Promise<any> {
    this.assertSecret()
    const r = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.config.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(init?.headers || {}),
      },
    })
    const testo = await r.text()
    let body: any = null
    try { body = JSON.parse(testo) } catch { body = { raw: testo.slice(0, 500) } }
    if (!r.ok) {
      const msg = body?.error?.message || `HTTP ${r.status}`
      throw new Error(`Stripe API: ${msg}`)
    }
    return body
  }

  /**
   * Crea Payment Link reale per proforma.
   */
  async createPaymentLink(request: PaymentLinkRequest): Promise<PaymentLinkResponse> {
    const body: Record<string, string | number> = {
      'line_items[0][price_data][currency]': request.currency || 'eur',
      'line_items[0][price_data][product_data][name]': request.description,
      'line_items[0][price_data][unit_amount]': request.amount,
      'line_items[0][quantity]': 1,
      'after_completion[type]': 'redirect',
      'after_completion[redirect][url]': request.successUrl || DEFAULT_SUCCESS_URL,
    }
    // I metadata del Payment Link NON vengono copiati sul payment_intent: il webhook
    // (payment_intent.succeeded) li legge dal payment_intent, quindi vanno passati anche in
    // payment_intent_data[metadata]. `metadata[...]` resta per ritrovarli sul link/checkout session.
    // `cancelUrl` non e' un parametro di /v1/payment_links (Stripe rifiuta i parametri sconosciuti): ignorato.
    for (const [k, v] of Object.entries(request.metadata || {})) {
      if (v === undefined || v === null) continue
      const valore = String(v).slice(0, 500)
      body[`metadata[${k}]`] = valore
      body[`payment_intent_data[metadata][${k}]`] = valore
    }

    const data = await this.request('/payment_links', { method: 'POST', body: encodeForm(body) })
    if (!data?.url) throw new Error('Stripe: risposta senza URL del Payment Link')
    return { id: data.id, url: data.url, active: data.active !== false }
  }

  /**
   * Crea Payment Intent reale (alternativa al Payment Link).
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'eur',
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    const body: Record<string, string | number> = {
      amount,
      currency,
      'automatic_payment_methods[enabled]': 'true',
    }
    for (const [k, v] of Object.entries(metadata || {})) {
      if (v === undefined || v === null) continue
      body[`metadata[${k}]`] = String(v).slice(0, 500)
    }
    const data = await this.request('/payment_intents', { method: 'POST', body: encodeForm(body) })
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      clientSecret: data.client_secret,
    }
  }

  /**
   * Recupera Payment Intent reale.
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    const data = await this.request(`/payment_intents/${encodeURIComponent(paymentIntentId)}`, { method: 'GET', headers: { 'Content-Type': '' } })
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      clientSecret: data.client_secret,
    }
  }

  /**
   * Verifica firma webhook Stripe (header `stripe-signature`: t=...,v1=...).
   * Firma calcolata su `${t}.${payload}` con HMAC-SHA256 e segreto `whsec_...`.
   * Ritorna { ok:false } su firma mancante/malformata/non valida o timestamp fuori tolleranza.
   */
  static async verifyWebhookSignature(
    payload: string,
    signatureHeader: string | undefined | null,
    secret: string | undefined | null,
    tolleranzaSecondi: number = TOLERANZA_SECONDI
  ): Promise<WebhookVerification> {
    if (!secret) return { ok: false, error: 'STRIPE_WEBHOOK_SECRET non configurato' }
    if (!signatureHeader) return { ok: false, error: 'Header stripe-signature mancante' }
    if (typeof payload !== 'string') return { ok: false, error: 'Payload non disponibile' }

    let timestamp = ''
    const firme: string[] = []
    for (const parte of String(signatureHeader).split(',')) {
      const [k, v] = parte.split('=').map(s => (s || '').trim())
      if (k === 't') timestamp = v || ''
      else if (k === 'v1' && v) firme.push(v)
    }
    if (!timestamp || !firme.length) return { ok: false, error: 'Header stripe-signature malformato' }

    const ts = Number(timestamp)
    if (!Number.isFinite(ts)) return { ok: false, error: 'Timestamp firma non valido' }
    const adesso = Math.floor(Date.now() / 1000)
    if (Math.abs(adesso - ts) > tolleranzaSecondi) return { ok: false, error: 'Timestamp firma fuori tolleranza', timestamp: ts }

    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const firmaCalcolata = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${payload}`)))

    for (const f of firme) {
      if (!/^[0-9a-fA-F]+$/.test(f) || f.length % 2 !== 0) continue
      if (timingSafeEqualBytes(firmaCalcolata, hexToBytes(f))) return { ok: true, timestamp: ts }
    }
    return { ok: false, error: 'Firma non valida', timestamp: ts }
  }
}

/**
 * Helper: Crea Stripe service da env
 */
export function createStripeService(env: any): StripeService {
  const config: StripeConfig = {
    secretKey: env.STRIPE_SECRET_KEY || '',
    publicKey: env.STRIPE_PUBLISHABLE_KEY || env.STRIPE_PUBLIC_KEY || '',
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
    apiVersion: '2023-10-16',
  }
  return new StripeService(config)
}

/** Helper: Converti euro in centesimi per Stripe */
export function euroToCents(euro: number): number {
  return Math.round(euro * 100)
}

/** Helper: Converti centesimi in euro */
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
  // Il webhook aggiorna `proformas` per numero_proforma: senza numero il pagamento non e' riconciliabile.
  if (!proformaNumber || !String(proformaNumber).trim()) {
    throw new Error('createProformaPaymentLink: proformaNumber obbligatorio (metadata.proforma_number)')
  }
  if (!contractCode || !String(contractCode).trim()) {
    throw new Error('createProformaPaymentLink: contractCode obbligatorio (metadata.contract_code)')
  }
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
      cliente_email: emailCliente,
    },
    successUrl: `https://www.ecura.it/pagamento-confermato?proforma=${proformaNumber}`,
  })
}

export default StripeService
