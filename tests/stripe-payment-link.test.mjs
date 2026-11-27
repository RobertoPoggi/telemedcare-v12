/**
 * Fase 2-bis: cablaggio proforma -> Payment Link -> webhook (node:test, nessuna rete, nessuna chiave reale).
 *  1. il Payment Link porta proforma_number + contract_code SIA sul link SIA su payment_intent_data
 *     (i metadata del link NON arrivano al payment_intent: il webhook li legge da li');
 *  2. senza numero proforma / codice contratto il link non viene creato;
 *  3. l'handler webhook REALE (non modificato) aggiorna proformas e leads su SQLite
 *     usando i metadata prodotti dal lato creazione.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const dir = mkdtempSync(join(tmpdir(), 'stripe-plink-'))
const build = (src, out) => execFileSync('npx', ['--yes', 'esbuild', src, '--bundle', '--format=esm', '--platform=node', '--outfile=' + join(dir, out)], { stdio: 'pipe' })
build('src/modules/stripe-service.ts', 'stripe.mjs')
build('src/modules/stripe-webhook-handler.ts', 'handler.mjs')
build('src/modules/proforma-generator.ts', 'proforma.mjs')
const { createStripeService, createProformaPaymentLink } = await import(pathToFileURL(join(dir, 'stripe.mjs')).href)
const { StripeWebhookHandler } = await import(pathToFileURL(join(dir, 'handler.mjs')).href)
const { ProformaGenerator } = await import(pathToFileURL(join(dir, 'proforma.mjs')).href)

function conFetchFinto(fn) {
  const originale = globalThis.fetch
  const chiamate = []
  globalThis.fetch = async (url, init) => {
    chiamate.push({ url: String(url), init })
    return new Response(JSON.stringify({ id: 'plink_test_1', url: 'https://buy.stripe.com/test_x', active: true }), { status: 200 })
  }
  return fn(chiamate).finally(() => { globalThis.fetch = originale })
}

const stripe = createStripeService({ STRIPE_SECRET_KEY: 'sk_test_finta_per_i_test' })

test('Payment Link: proforma_number e contract_code su link E payment_intent_data', () =>
  conFetchFinto(async chiamate => {
    await createProformaPaymentLink(stripe, 'PF-202611-ABC123', 'CTR-2026-001', 'PRO', 'BASE', 585.6, 'Mario Rossi', 'mario@example.com')
    assert.equal(chiamate.length, 1)
    assert.match(chiamate[0].url, /\/v1\/payment_links$/)
    const p = new URLSearchParams(chiamate[0].init.body)
    for (const k of ['proforma_number', 'contract_code']) {
      assert.ok(p.get(`metadata[${k}]`), `manca metadata[${k}]`)
      assert.equal(p.get(`payment_intent_data[metadata][${k}]`), p.get(`metadata[${k}]`))
    }
    assert.equal(p.get('payment_intent_data[metadata][proforma_number]'), 'PF-202611-ABC123')
    assert.equal(p.get('payment_intent_data[metadata][contract_code]'), 'CTR-2026-001')
    assert.equal(p.get('line_items[0][price_data][unit_amount]'), '58560')
    assert.equal(p.has('cancel_url'), false, 'cancel_url non e un parametro di /v1/payment_links')
    assert.match(chiamate[0].init.headers.Authorization, /^Bearer sk_test_/)
  }))

test('Payment Link: senza numero proforma o contratto il link NON viene creato', () =>
  conFetchFinto(async chiamate => {
    await assert.rejects(() => createProformaPaymentLink(stripe, '', 'CTR-1', 'PRO', 'BASE', 10, 'A', 'a@b.it'), /proformaNumber obbligatorio/)
    await assert.rejects(() => createProformaPaymentLink(stripe, 'PF-1', '  ', 'PRO', 'BASE', 10, 'A', 'a@b.it'), /contractCode obbligatorio/)
    assert.equal(chiamate.length, 0)
  }))

test('ProformaGenerator: rispetta il numero riservato prima del link', async () => {
  const num = ProformaGenerator.generateProformaNumber()
  assert.match(num, /^PF-\d{6}-[A-Z0-9]{1,6}$/)
  let inserito
  const db = { prepare: () => ({ bind: (...a) => ({ run: async () => { inserito = a } }) }) }
  const r = await ProformaGenerator.generateProforma({
    numeroProforma: num, codiceContratto: 'CTR-9', servizio: 'PRO', piano: 'BASE', importoBase: 480, iva: 105.6, totale: 585.6,
    nomeCliente: 'M', cognomeCliente: 'R', emailCliente: 'm@r.it', linkPagamentoStripe: 'https://buy.stripe.com/test_x',
  }, db)
  assert.equal(r.success, true)
  assert.equal(r.proforma.numeroProforma, num)
  assert.equal(inserito[1], num)
})

// --- handler webhook reale su SQLite (schema = migration 0003 + colonne attese dal handler) ---
function dbSqlite({ conColonnaPaymentIntentId }) {
  const raw = new DatabaseSync(':memory:')
  raw.exec(readFileSync('migrations/0003_add_proformas_table.sql', 'utf8'))
  if (conColonnaPaymentIntentId) raw.exec('ALTER TABLE proformas ADD COLUMN payment_intent_id TEXT')
  raw.exec(`CREATE TABLE leads (id TEXT PRIMARY KEY, status TEXT, email TEXT, updated_at TEXT);
            CREATE TABLE contracts (id TEXT PRIMARY KEY, lead_id TEXT, codice_contratto TEXT);
            CREATE TABLE document_templates (name TEXT, html_content TEXT, active INTEGER);
            CREATE TABLE system_settings (key TEXT, value TEXT);`)
  raw.exec(`INSERT INTO leads VALUES ('L1','CONTRACT_SIGNED','mario@example.com',NULL);
            INSERT INTO contracts VALUES ('C1','L1','CTR-2026-001');
            INSERT INTO proformas (id,numero_proforma,contract_code,servizio,piano,importo_base,iva,totale) VALUES ('P1','PF-202611-ABC123','CTR-2026-001','PRO','BASE',480,105.6,585.6);`)
  const prepare = sql => { let a = []; const o = { bind: (...x) => { a = x; return o }, first: async () => raw.prepare(sql).get(...a) ?? null, all: async () => ({ results: raw.prepare(sql).all(...a) }), run: async () => { raw.prepare(sql).run(...a); return { success: true } } }; return o }
  return { raw, prepare }
}
const evento = metadata => ({ id: 'evt_1', type: 'payment_intent.succeeded', created: 0, data: { object: { id: 'pi_test_1', amount: 58560, metadata } } })

test('webhook reale: con i metadata del lato creazione -> proformas paid + leads PAYMENT_COMPLETED', async () => {
  const db = dbSqlite({ conColonnaPaymentIntentId: true })
  const r = await StripeWebhookHandler.processWebhook(evento({ proforma_number: 'PF-202611-ABC123', contract_code: 'CTR-2026-001' }), db)
  assert.equal(r.success, true, r.error)
  const p = db.raw.prepare("SELECT status, payment_intent_id, paid_at FROM proformas WHERE numero_proforma='PF-202611-ABC123'").get()
  assert.equal(p.status, 'paid'); assert.equal(p.payment_intent_id, 'pi_test_1'); assert.ok(p.paid_at)
  assert.equal(db.raw.prepare("SELECT status FROM leads WHERE id='L1'").get().status, 'PAYMENT_COMPLETED')
})

test('webhook reale: senza proforma_number nel payment_intent -> errore (il caso del vecchio link con numero vuoto)', async () => {
  const db = dbSqlite({ conColonnaPaymentIntentId: true })
  const r = await StripeWebhookHandler.processWebhook(evento({ contract_code: 'CTR-2026-001' }), db)
  assert.equal(r.success, false)
  assert.match(String(r.error), /proforma_number mancante/)
})

test('SCHEMA: con il solo schema 0003 (senza proformas.payment_intent_id) il webhook fallisce', async () => {
  const db = dbSqlite({ conColonnaPaymentIntentId: false })
  const r = await StripeWebhookHandler.processWebhook(evento({ proforma_number: 'PF-202611-ABC123', contract_code: 'CTR-2026-001' }), db)
  assert.equal(r.success, false)
  assert.match(String(r.error), /payment_intent_id/)
  assert.equal(db.raw.prepare("SELECT status FROM leads WHERE id='L1'").get().status, 'CONTRACT_SIGNED')
})

// --- guardia di schema nella rotta webhook ---
execFileSync('npx', ['--yes', 'esbuild', 'src/modules/stripe-webhook-route.ts', '--format=esm', '--platform=node', '--outfile=' + join(dir, 'route.mjs')], { stdio: 'pipe' })
const { assicuraColonnaPaymentIntent } = await import(pathToFileURL(join(dir, 'route.mjs')).href)

test('guardia schema: aggiunge payment_intent_id solo se manca, poi il webhook reale funziona; seconda chiamata no-op', async () => {
  const db = dbSqlite({ conColonnaPaymentIntentId: false })
  await assicuraColonnaPaymentIntent(db)
  await assicuraColonnaPaymentIntent(db) // idempotente
  const cols = db.raw.prepare('PRAGMA table_info(proformas)').all().filter(c => c.name === 'payment_intent_id')
  assert.equal(cols.length, 1)
  const r = await StripeWebhookHandler.processWebhook(evento({ proforma_number: 'PF-202611-ABC123', contract_code: 'CTR-2026-001' }), db)
  assert.equal(r.success, true, r.error)
  assert.equal(db.raw.prepare("SELECT status FROM proformas WHERE id='P1'").get().status, 'paid')
  assert.equal(db.raw.prepare("SELECT status FROM leads WHERE id='L1'").get().status, 'PAYMENT_COMPLETED')
})

test('guardia schema: db assente o tabella proformas assente -> nessuna eccezione', async () => {
  await assicuraColonnaPaymentIntent(null)
  const raw = new DatabaseSync(':memory:')
  const db = { prepare: sql => { let a = []; const o = { bind: (...x) => { a = x; return o }, all: async () => ({ results: raw.prepare(sql).all(...a) }), run: async () => raw.prepare(sql).run(...a) }; return o } }
  await assicuraColonnaPaymentIntent(db)
})
