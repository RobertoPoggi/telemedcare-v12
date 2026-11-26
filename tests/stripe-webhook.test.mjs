/**
 * Test rotta POST /api/webhooks/stripe (node:test, nessuna dipendenza esterna).
 * La logica vive in src/modules/stripe-webhook-route.ts, compilata al volo con esbuild.
 * La verifica firma usata nei test è quella REALE di StripeService (HMAC con crypto.subtle).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHmac } from 'node:crypto'

const dir = mkdtempSync(join(tmpdir(), 'stripe-wh-'))
execFileSync('npx', ['--yes', 'esbuild', 'src/modules/stripe-webhook-route.ts', '--format=esm', '--platform=node', '--outfile=' + join(dir, 'route.mjs')], { stdio: 'pipe' })
execFileSync('npx', ['--yes', 'esbuild', 'src/modules/stripe-service.ts', '--format=esm', '--platform=node', '--outfile=' + join(dir, 'stripe.mjs')], { stdio: 'pipe' })

const { handleStripeWebhook } = await import(pathToFileURL(join(dir, 'route.mjs')).href)
const { StripeService } = await import(pathToFileURL(join(dir, 'stripe.mjs')).href)

const SEGRETO = 'whsec_test_segreto_di_prova'
const payload = JSON.stringify({
  id: 'evt_test_1',
  type: 'payment_intent.succeeded',
  created: Math.floor(Date.now() / 1000),
  data: { object: { id: 'pi_test_1', amount: 24900, status: 'succeeded' } }
})

function firmaValida(body = payload, segreto = SEGRETO, ts = Math.floor(Date.now() / 1000)) {
  const v1 = createHmac('sha256', segreto).update(`${ts}.${body}`).digest('hex')
  return `t=${ts},v1=${v1}`
}

const verifySignature = (p, s, sec) => StripeService.verifyWebhookSignature(p, s, sec)

test('senza header firma → 400 "Firma non valida"', async () => {
  const r = await handleStripeWebhook(payload, null, { STRIPE_WEBHOOK_SECRET: SEGRETO }, {}, { verifySignature })
  assert.equal(r.status, 400)
  assert.equal(r.body.error, 'Firma non valida')
})

test('firma HMAC valida → 200 e handler chiamato una volta', async () => {
  const chiamate = []
  const processEvent = async (event) => {
    chiamate.push(event.type)
    return { success: true, message: 'gestito', ...{} }
  }
  const r = await handleStripeWebhook(payload, firmaValida(), { STRIPE_WEBHOOK_SECRET: SEGRETO }, { finto: 'db' }, { verifySignature, processEvent })
  assert.equal(r.status, 200)
  assert.equal(r.body.success, true)
  assert.equal(r.body.eventType, 'payment_intent.succeeded')
  assert.deepEqual(chiamate, ['payment_intent.succeeded'])
})

test('firma alterata (segreto diverso) → 400', async () => {
  const r = await handleStripeWebhook(payload, firmaValida(payload, 'whsec_sbagliato'), { STRIPE_WEBHOOK_SECRET: SEGRETO }, {}, { verifySignature })
  assert.equal(r.status, 400)
  assert.equal(r.body.error, 'Firma non valida')
})

test('payload manomesso dopo la firma → 400', async () => {
  const firma = firmaValida()
  const r = await handleStripeWebhook(payload.replace('24900', '1'), firma, { STRIPE_WEBHOOK_SECRET: SEGRETO }, {}, { verifySignature })
  assert.equal(r.status, 400)
})

test('senza STRIPE_WEBHOOK_SECRET → 503 "Webhook non configurato"', async () => {
  const r = await handleStripeWebhook(payload, firmaValida(), {}, {}, { verifySignature })
  assert.equal(r.status, 503)
  assert.equal(r.body.error, 'Webhook non configurato')
})

test('firma valida ma payload non JSON → 400 "Payload non valido"', async () => {
  const r = await handleStripeWebhook('non-json', firmaValida('non-json'), { STRIPE_WEBHOOK_SECRET: SEGRETO }, {}, { verifySignature })
  assert.equal(r.status, 400)
  assert.equal(r.body.error, 'Payload non valido')
})
