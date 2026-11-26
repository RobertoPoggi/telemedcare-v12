/**
 * STRIPE-WEBHOOK-ROUTE.TS
 * Logica della rotta POST /api/webhooks/stripe, isolata dal router per poterla testare
 * senza avviare un worker: nessuna modifica a stripe-service.ts / stripe-webhook-handler.ts.
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
  const secret = env?.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('❌ [WEBHOOK] STRIPE_WEBHOOK_SECRET non configurato: webhook rifiutato')
    return { status: 503, body: { success: false, error: 'Webhook non configurato' } }
  }

  let verify = deps.verifySignature
  if (!verify) {
    const { StripeService } = await import('./stripe-service')
    verify = (payload, sig, sec) => StripeService.verifyWebhookSignature(payload, sig, sec)
  }
  const verifica = await verify(rawBody, signature, secret)
  if (!verifica.ok) {
    console.warn('⚠️ [WEBHOOK] Firma Stripe rifiutata:', verifica.error)
    return { status: 400, body: { success: false, error: 'Firma non valida' } }
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return { status: 400, body: { success: false, error: 'Payload non valido' } }
  }
  if (!event || typeof event.type !== 'string') {
    return { status: 400, body: { success: false, error: 'Payload non valido' } }
  }

  let processEvent = deps.processEvent
  if (!processEvent) {
    const { StripeWebhookHandler } = await import('./stripe-webhook-handler')
    processEvent = (ev, d) => StripeWebhookHandler.processWebhook(ev, d)
  }
  const result = await processEvent(event, db)

  console.log('✅ [WEBHOOK] Stripe processato:', result)

  return {
    status: 200,
    body: { success: result.success, message: result.message, eventType: event.type }
  }
}
