/**
 * Test Fase 2 Claim DM (node:test, nessuna dipendenza esterna).
 * Il modulo TS viene compilato al volo con esbuild (presente come dipendenza di vite).
 *
 * Copre: default ORIGINALE, scostamenti per-blocco, validazione payload,
 * bearer di /api/claim-block-states (401/503), forma eventi per la landing,
 * e verifica firma webhook Stripe (HMAC reale, firma valida / non valida / scaduta).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHmac } from 'node:crypto'

const dir = mkdtempSync(join(tmpdir(), 'claim-dm-'))
execFileSync('npx', ['--yes', 'esbuild', 'src/modules/claim-dm.ts', '--format=esm', '--platform=node', '--outfile=' + join(dir, 'claim-dm.mjs')], { stdio: 'pipe' })
execFileSync('npx', ['--yes', 'esbuild', 'src/modules/stripe-service.ts', '--format=esm', '--platform=node', '--outfile=' + join(dir, 'stripe.mjs')], { stdio: 'pipe' })

const DM = await import(pathToFileURL(join(dir, 'claim-dm.mjs')).href)
const Stripe = await import(pathToFileURL(join(dir, 'stripe.mjs')).href)

// ── Fake D1 minimale: una Map di righe per tabella ───────────────────────────
function fakeDb(righe = []) {
  const store = new Map(righe.map(r => [r.chiave, r]))
  return {
    store,
    prepare(sql) {
      const s = String(sql)
      const api = {
        _args: [],
        bind(...a) { api._args = a; return api },
        async all() {
          if (/FROM claim_dm_stato/.test(s)) return { results: [...store.values()] }
          if (/FROM claim_dm_sync_log/.test(s)) return { results: [] }
          return { results: [] }
        },
        async first() {
          if (/FROM settings/.test(s)) return null
          return null
        },
        async run() {
          if (/INSERT OR IGNORE INTO claim_dm_stato/.test(s)) {
            const [chiave, valore, motivo] = api._args
            if (!store.has(chiave)) store.set(chiave, { chiave, valore, motivo, updated_at: api._args[3] || new Date().toISOString(), updated_by: 'system' })
          }
          if (/ON CONFLICT\(chiave\) DO UPDATE/.test(s)) {
            const [chiave, valore, motivo, updated_at, updated_by] = api._args
            store.set(chiave, { chiave, valore, motivo, updated_at, updated_by })
          }
          if (/DELETE FROM claim_dm_stato/.test(s)) store.delete(api._args[0])
          return { success: true }
        },
      }
      return api
    },
  }
}

test('stato di default è ORIGINALE e tutti i blocchi ereditano', async () => {
  const db = fakeDb([{ chiave: 'stato_globale', valore: 'ORIGINALE', updated_at: '2026-11-26T10:00:00.000Z', updated_by: 'system' }])
  const s = await DM.getStato(db)
  assert.equal(s.stato_globale, 'ORIGINALE')
  assert.equal(Object.keys(s.blocchi).length, 12)
  for (const b of DM.BLOCCHI) assert.equal(s.blocchi[b], null)
  const ev = DM.eventiDaStato(s, s.updated_at)
  assert.equal(ev.length, 12)
  assert.ok(ev.every(e => e.stato === 'ORIGINALE'))
  assert.ok(ev.every(e => /^\d{4}-\d{2}-\d{2}T/.test(e.updated_at)))
})

test('scostamento per-blocco vince sullo stato globale', async () => {
  const db = fakeDb([
    { chiave: 'stato_globale', valore: 'TRANSITORIA', updated_at: '2026-11-26T10:00:00.000Z', updated_by: 'admin' },
    { chiave: 'EC-04', valore: 'AUTORIZZATA', updated_at: '2026-11-26T10:00:00.000Z', updated_by: 'admin' },
  ])
  const s = await DM.getStato(db)
  assert.equal(DM.statoEffettivo(s, 'EC-04'), 'AUTORIZZATA')
  assert.equal(DM.statoEffettivo(s, 'EC-05'), 'TRANSITORIA')
  assert.equal(DM.statoEffettivo(s, 'EC-01'), 'TRANSITORIA')
})

test('validaPayload rifiuta stati e blocchi non ammessi, accetta null (eredita)', () => {
  assert.equal(DM.validaPayload(null).ok, false)
  assert.equal(DM.validaPayload({ stato_globale: 'BOLLO' }).ok, false)
  assert.equal(DM.validaPayload({ stato_globale: 'ORIGINALE', blocchi: { 'EC-99': 'ORIGINALE' } }).ok, false)
  assert.equal(DM.validaPayload({ stato_globale: 'ORIGINALE', blocchi: { 'EC-01': 'QUARANTENA' } }).ok, false)
  const ok = DM.validaPayload({ stato_globale: 'AUTORIZZATA', blocchi: { 'EC-02': null, 'EC-03': 'TRANSITORIA' }, motivo: 'provv. 0032' })
  assert.equal(ok.ok, true)
  assert.equal(ok.blocchi['EC-02'], null)
  assert.equal(ok.blocchi['EC-03'], 'TRANSITORIA')
  assert.equal(ok.motivo, 'provv. 0032')
})

function upsertDb(iniziale) {
  const store = new Map((iniziale || []).map(r => [r.chiave, { ...r }]))
  return {
    store,
    prepare(sql) {
      const s = String(sql)
      const st = { args: [] }
      st.bind = (...a) => { st.args = a; return st }
      st.run = async () => {
        if (/DELETE FROM claim_dm_stato/.test(s)) {
          store.delete(st.args[0])
        } else if (/ON CONFLICT\(chiave\) DO UPDATE/.test(s)) {
          if (s.includes("'stato_globale'")) {
            const [v, mot, up, by] = st.args
            store.set('stato_globale', { chiave: 'stato_globale', valore: v, motivo: mot, updated_at: up, updated_by: by })
          } else {
            const [k, v, mot, up, by] = st.args
            store.set(k, { chiave: k, valore: v, motivo: mot, updated_at: up, updated_by: by })
          }
        }
        return { success: true }
      }
      st.all = async () => ({ results: [...store.values()] })
      st.first = async () => null
      return st
    },
  }
}

test('setStato persiste globlale e scostamenti e rimuove il override con null', async () => {
  const db = upsertDb([{ chiave: 'stato_globale', valore: 'ORIGINALE', updated_at: '2026-11-26T10:00:00.000Z', updated_by: 'system' }])
  let s = await DM.setStato(db, { stato_globale: 'TRANSITORIA', blocchi: { 'EC-01': 'AUTORIZZATA' }, motivo: 'test' }, 'tester')
  assert.equal(s.stato_globale, 'TRANSITORIA')
  assert.equal(s.blocchi['EC-01'], 'AUTORIZZATA')
  s = await DM.setStato(db, { stato_globale: 'TRANSITORIA', blocchi: { 'EC-01': null }, motivo: 'reset' }, 'tester')
  assert.equal(s.blocchi['EC-01'], null)
})

test('/api/claim-block-states: 503 senza segreto, 401 con bearer errato o malformato, ok con bearer corretto', () => {
  assert.deepEqual(DM.checkClaimApiToken('Bearer x', ''), { ok: false, status: 503, error: 'CLAIM_API_TOKEN non configurato' })
  assert.equal(DM.checkClaimApiToken('Bearer x', undefined).status, 503)
  assert.deepEqual(DM.checkClaimApiToken(undefined, 'tok'), { ok: false, status: 401, error: 'Non autorizzato' })
  assert.deepEqual(DM.checkClaimApiToken('Bearer sbagliato', 'tok'), { ok: false, status: 401, error: 'Non autorizzato' })
  assert.deepEqual(DM.checkClaimApiToken('tok', 'tok'), { ok: false, status: 401, error: 'Non autorizzato' })
  assert.deepEqual(DM.checkClaimApiToken('Bearer tok', 'tok'), { ok: true })
})

test('eventi rispettano il contratto della landing (block_id EC-NN, stato ammesso, updated_at ISO UTC)', async () => {
  const db = fakeDb([{ chiave: 'stato_globale', valore: 'AUTORIZZATA', updated_at: '2026-11-26T10:00:00.000Z', updated_by: 'admin' }])
  const s = await DM.getStato(db)
  for (const e of DM.eventiDaStato(s)) {
    assert.match(e.block_id, /^EC-\d{2}$/)
    assert.ok(DM.STATI.includes(e.stato))
    assert.match(e.updated_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/)
  }
})

test('fallimentiConsecutivi conta solo la coda di errori', async () => {
  const db = fakeDb([])
  db.prepare = (sql) => ({
    bind() { return this },
    async all() {
      if (/FROM claim_dm_sync_log/.test(String(sql))) {
        return { results: [{ esito: 'errore' }, { esito: 'errore' }, { esito: 'errore' }, { esito: 'ok' }] }
      }
      return { results: [] }
    },
    async run() { return { success: true } },
    async first() { return null },
  })
  assert.equal(await DM.fallimentiConsecutivi(db), 3)
})

// ── Stripe: firma webhook ────────────────────────────────────────────────────
const SECRET = 'whsec_test_segreto'
const payload = JSON.stringify({ id: 'evt_test', type: 'payment_intent.succeeded', data: { object: { id: 'pi_1' } } })
const firma = (ts, p = payload, s = SECRET) => 't=' + ts + ',v1=' + createHmac('sha256', s).update(ts + '.' + p).digest('hex')
const adesso = () => Math.floor(Date.now() / 1000)

test('stripe: firma valida accettata', async () => {
  const r = await Stripe.StripeService.verifyWebhookSignature(payload, firma(adesso()), SECRET)
  assert.equal(r.ok, true)
})

test('stripe: firma non valida rifiutata', async () => {
  const r = await Stripe.StripeService.verifyWebhookSignature(payload, firma(adesso(), payload, 'whsec_sbagliato'), SECRET)
  assert.equal(r.ok, false)
  assert.match(r.error, /Firma non valida/)
})

test('stripe: payload alterato rifiutato', async () => {
  const r = await Stripe.StripeService.verifyWebhookSignature(payload + ' ', firma(adesso()), SECRET)
  assert.equal(r.ok, false)
})

test('stripe: timestamp scaduto rifiutato', async () => {
  const r = await Stripe.StripeService.verifyWebhookSignature(payload, firma(adesso() - 3600), SECRET)
  assert.equal(r.ok, false)
  assert.match(r.error, /tolleranza/)
})

test('stripe: header mancante o segreto assente', async () => {
  assert.equal((await Stripe.StripeService.verifyWebhookSignature(payload, null, SECRET)).ok, false)
  assert.equal((await Stripe.StripeService.verifyWebhookSignature(payload, firma(adesso()), '')).ok, false)
  assert.equal((await Stripe.StripeService.verifyWebhookSignature(payload, 'garbage', SECRET)).ok, false)
})

test('stripe: usa il primo v1 valido tra più firme (rotazione del segreto)', async () => {
  const ts = adesso()
  const header = 't=' + ts + ',v1=' + 'a'.repeat(64) + ',v1=' + createHmac('sha256', SECRET).update(ts + '.' + payload).digest('hex')
  assert.equal((await Stripe.StripeService.verifyWebhookSignature(payload, header, SECRET)).ok, true)
})
