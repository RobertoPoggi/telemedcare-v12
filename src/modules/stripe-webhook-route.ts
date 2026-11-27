/**
 * STRIPE-WEBHOOK-ROUTE.TS
 * Logica della rotta POST /api/webhooks/stripe, isolata dal router per poterla testare
 * senza avviare un worker: nessuna modifica a stripe-service.ts / stripe-webhook-handler.ts.
 *
 * Ogni richiesta lascia una riga in stripe_webhook_events (migration 0109): event_id,
 * event_type, esito, http_status, message. La scrittura del log non puo' mai far fallire
 * il webhook (try/catch interno) e non salva mai il payload né dati di pagamento.
 */
export type StripeWebhookResponse = { status: number; body: Record<string, any> }

type VerificaFn = (
  payload: string,
  signature: string | null,
  secret: string
) => Promise<{ ok: boolean; error?: string }>

type ProcessaFn = (
  event: any,
  db: any
) => Promise<{ success: boolean; message: string }>

export interface StripeWebhookDeps {
  verifySignature?: VerificaFn
  processEvent?: ProcessaFn
}

interface RigaLog {
  event_id: string | null
  event_type: string | null
  esito: string
  http_status: number
  signature_present: number
  message: string | null
  livemode: number | null
  payload_bytes: number
}

/** Scrive l'esito nel registro. Silenziosa per progetto: un log mancante non blocca Stripe. */
async function registraEsito(db: any, riga: RigaLog): Promise<void> {
  if (!db || typeof db.prepare !== 'function') return
  try {
    await db
      .prepare(
        `INSERT INTO stripe_webhook_events
           (event_id, event_type, esito, http_status, signature_present, message, livemode, payload_bytes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        riga.event_id,
        riga.event_type,
        riga.esito,
        riga.http_status,
        riga.signature_present,
        riga.message,
        riga.livemode,
        riga.payload_bytes
      )
      .run()
  } catch (errore) {
    console.warn('⚠️ [WEBHOOK] Registro stripe_webhook_events non scritto:', String(errore))
  }
}

/**
 * Lo handler (non modificabile) scrive `proformas.payment_intent_id`, ma la migration 0003 crea solo
 * `stripe_payment_intent_id`. Se la colonna manca l'UPDATE fallisce e proforma/lead restano non aggiornati.
 * Aggiunge la colonna (nullable) SOLO se assente (PRAGMA table_info): idempotente, mai su colonne esistenti.
 * Il deploy non applica le migration D1, quindi una migration non raggiungerebbe la produzione.
 */
export async function assicuraColonnaPaymentIntent(db: any): Promise<void> {
  if (!db || typeof db.prepare !== 'function') return
  try {
    const info = await db.prepare('PRAGMA table_info(proformas)').all()
    const colonne: any[] = info?.results || []
    if (!colonne.length) return
    if (colonne.some(c => c && c.name === 'payment_intent_id')) return
    await db.prepare('ALTER TABLE proformas ADD COLUMN payment_intent_id TEXT').run()
    console.warn('⚠️ [WEBHOOK] Aggiunta colonna mancante proformas.payment_intent_id')
  } catch (errore) {
    console.warn('⚠️ [WEBHOOK] Verifica colonna proformas.payment_intent_id non riuscita:', String(errore))
  }
}

/**
 * Esegue il webhook Stripe: 503 senza segreto, 400 firma mancante/non valida,
 * 400 payload non JSON, 200 quando l'evento è processato.
 */
export async function handleStripeWebhook(
  rawBody: string,
  signature: string | null,
  env: any,
  db: any,
  deps: StripeWebhookDeps = {}
): Promise<StripeWebhookResponse> {
  const payloadBytes = typeof rawBody === 'string' ? new TextEncoder().encode(rawBody).length : 0
  const signaturePresent = signature ? 1 : 0
  let eventId: string | null = null
  let eventType: string | null = null
  let livemode: number | null = null

  // Unico punto di uscita: risponde e registra (senza payload) cosa è successo.
  const esci = async (
    status: number,
    body: Record<string, any>,
    esito: string
  ): Promise<StripeWebhookResponse> => {
    await registraEsito(db, {
      event_id: eventId,
      event_type: eventType,
      esito,
      http_status: status,
      signature_present: signaturePresent,
      message: typeof body.error === 'string' ? body.error : typeof body.message === 'string' ? body.message : null,
      livemode,
      payload_bytes: payloadBytes
    })
    return { status, body }
  }

  const secret = env?.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('❌ [WEBHOOK] STRIPE_WEBHOOK_SECRET non configurato: webhook rifiutato')
    return esci(503, { success: false, error: 'Webhook non configurato' }, 'non_configurato')
  }

  let verify = deps.verifySignature
  if (!verify) {
    const { StripeService } = await import('./stripe-service')
    verify = (payload, sig, sec) => StripeService.verifyWebhookSignature(payload, sig, sec)
  }
  const verifica = await verify(rawBody, signature, secret)
  if (!verifica.ok) {
    console.warn('⚠️ [WEBHOOK] Firma Stripe rifiutata:', String(verifica.error ?? ''))
    return esci(400, { success: false, error: 'Firma non valida' }, 'firma_non_valida')
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return esci(400, { success: false, error: 'Payload non valido' }, 'payload_non_valido')
  }
  if (!event || typeof event.type !== 'string') {
    return esci(400, { success: false, error: 'Payload non valido' }, 'payload_non_valido')
  }
  if (typeof event.id === 'string') eventId = event.id
  eventType = event.type
  if (typeof event.livemode === 'boolean') livemode = event.livemode ? 1 : 0

  let processEvent = deps.processEvent
  if (!processEvent) {
    const { StripeWebhookHandler } = await import('./stripe-webhook-handler')
    processEvent = (ev, d) => StripeWebhookHandler.processWebhook(ev, d)
  }

  let result: { success: boolean; message: string }
  try {
    if (event.type === 'payment_intent.succeeded') await assicuraColonnaPaymentIntent(db)
    result = await processEvent(event, db)
  } catch (errore) {
    console.error('❌ [WEBHOOK] Errore handler Stripe:', String(errore))
    return esci(
      500,
      { success: false, error: errore instanceof Error ? errore.message : 'Errore webhook Stripe' },
      'errore_handler'
    )
  }

  console.log('✅ [WEBHOOK] Stripe processato: ' + String(result?.message ?? '') + ' success=' + String(result?.success))

  return esci(
    200,
    { success: result.success, message: result.message, eventType: event.type },
    result.success ? 'ok' : 'errore_handler'
  )
}
