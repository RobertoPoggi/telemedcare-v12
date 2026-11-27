/**
 * Fase 2-bis: cablaggio proforma -> Payment Link -> webhook (node:test, nessuna rete, nessuna chiave reale).
 *  1. il Payment Link porta proforma_number + contract_code SIA sul link SIA su payment_intent_data
 *     (i metadata del link NON arrivano al payment_intent: il webhook li legge da li');
 *  2. senza numero proforma / codice contratto il link non viene creato;
 *  3. il webhook REALE aggiorna `proforma` (tabella vera di produzione, NON `proformas`) e leads su SQLite
 *     con lo schema di produzione (migration 0031 + contracts.leadId), usando i metadata del lato creazione;
 *  4. il generatore scrive su `proforma` e il giro generatore -> webhook chiude il cerchio.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHmac } from 'node:crypto'
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
build('src/modules/stripe-carta.ts', 'carta.mjs')
build('src/modules/payment-manager.ts', 'pm.mjs')
build('src/modules/stripe-webhook-route.ts', 'route-bundle.mjs')
const { createStripeService, createProformaPaymentLink } = await import(pathToFileURL(join(dir, 'stripe.mjs')).href)
const { StripeWebhookHandler } = await import(pathToFileURL(join(dir, 'handler.mjs')).href)
const { ProformaGenerator } = await import(pathToFileURL(join(dir, 'proforma.mjs')).href)
const { statoCartaStripe, totaleProformaIvaInclusa } = await import(pathToFileURL(join(dir, 'carta.mjs')).href)
const { createStripePaymentIntent } = await import(pathToFileURL(join(dir, 'pm.mjs')).href)
const { handleStripeWebhook } = await import(pathToFileURL(join(dir, 'route-bundle.mjs')).href)

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

// --- schema di PRODUZIONE: proforma (migration 0031, senza colonne di pagamento), contracts.leadId ---
function dbSqlite({ conColonne = false, conProforma = true } = {}) {
  const raw = new DatabaseSync(':memory:')
  if (conProforma) {
    const m = readFileSync('migrations/0031_fix_proforma_id_autoincrement.sql', 'utf8')
    const create = m.slice(m.indexOf('CREATE TABLE proforma ('))
    raw.exec(create.slice(0, create.indexOf(');') + 2))
    if (conColonne) raw.exec('ALTER TABLE proforma ADD COLUMN payment_intent_id TEXT; ALTER TABLE proforma ADD COLUMN paid_at TEXT; ALTER TABLE proforma ADD COLUMN stripe_payment_link TEXT;')
  }
  raw.exec(`CREATE TABLE leads (id TEXT PRIMARY KEY, status TEXT, email TEXT, updated_at TEXT);
            CREATE TABLE contracts (id TEXT PRIMARY KEY, leadId TEXT, codice_contratto TEXT);
            CREATE TABLE document_templates (name TEXT, html_content TEXT, active INTEGER);
            CREATE TABLE system_settings (key TEXT, value TEXT);`)
  raw.exec(`INSERT INTO leads VALUES ('L1','CONTRACT_SIGNED','mario@example.com',NULL);
            INSERT INTO contracts VALUES ('C1','L1','CTR-2026-001');`)
  const prepare = sql => { let a = []; const o = { bind: (...x) => { a = x; return o }, first: async () => raw.prepare(sql).get(...a) ?? null, all: async () => ({ results: raw.prepare(sql).all(...a) }), run: async () => { const r = raw.prepare(sql).run(...a); return { success: true, meta: { last_row_id: Number(r.lastInsertRowid) } } } }; return o }
  return { raw, prepare }
}
const inserisciProforma = db => db.raw.exec(`INSERT INTO proforma (contract_id, leadId, numero_proforma, status) VALUES ('C1','L1','PF-202611-ABC123','SENT')`)
const evento = metadata => ({ id: 'evt_1', type: 'payment_intent.succeeded', created: 0, data: { object: { id: 'pi_test_1', amount: 58560, metadata } } })

test('webhook reale: con i metadata del lato creazione -> proforma PAID + leads PAYMENT_COMPLETED', async () => {
  const db = dbSqlite({ conColonne: true }); inserisciProforma(db)
  const r = await StripeWebhookHandler.processWebhook(evento({ proforma_number: 'PF-202611-ABC123', contract_code: 'CTR-2026-001' }), db)
  assert.equal(r.success, true, r.error)
  const p = db.raw.prepare("SELECT status, payment_intent_id, paid_at FROM proforma WHERE numero_proforma='PF-202611-ABC123'").get()
  assert.equal(p.status, 'PAID'); assert.equal(p.payment_intent_id, 'pi_test_1'); assert.ok(p.paid_at)
  assert.equal(db.raw.prepare("SELECT status FROM leads WHERE id='L1'").get().status, 'PAYMENT_COMPLETED')
})

test('webhook reale: senza proforma_number nel payment_intent -> errore (il caso del vecchio link con numero vuoto)', async () => {
  const db = dbSqlite({ conColonne: true }); inserisciProforma(db)
  const r = await StripeWebhookHandler.processWebhook(evento({ contract_code: 'CTR-2026-001' }), db)
  assert.equal(r.success, false)
  assert.match(String(r.error), /proforma_number mancante/)
})

test('SCHEMA: la tabella `proformas` (plurale) NON viene mai toccata e non serve', async () => {
  const db = dbSqlite({ conColonne: true }); inserisciProforma(db)
  const tabelle = db.raw.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'proforma%'").all().map(t => t.name)
  assert.deepEqual(tabelle, ['proforma'])
  const r = await StripeWebhookHandler.processWebhook(evento({ proforma_number: 'PF-202611-ABC123', contract_code: 'CTR-2026-001' }), db)
  assert.equal(r.success, true, r.error)
})

test('SCHEMA: senza le colonne di pagamento su proforma il webhook fallisce (motivo del guard)', async () => {
  const db = dbSqlite({ conColonne: false }); inserisciProforma(db)
  const r = await StripeWebhookHandler.processWebhook(evento({ proforma_number: 'PF-202611-ABC123', contract_code: 'CTR-2026-001' }), db)
  assert.equal(r.success, false)
  assert.match(String(r.error), /no such column: (paid_at|payment_intent_id)/)
  assert.equal(db.raw.prepare("SELECT status FROM leads WHERE id='L1'").get().status, 'CONTRACT_SIGNED')
})

test('JOIN: il lead si trova da contracts.leadId (colonna reale), non lead_id', async () => {
  const db = dbSqlite({ conColonne: true }); inserisciProforma(db)
  assert.equal(db.raw.prepare("SELECT 1 FROM pragma_table_info('contracts') WHERE name='lead_id'").get(), undefined)
  const r = await StripeWebhookHandler.processWebhook(evento({ proforma_number: 'PF-202611-ABC123', contract_code: 'CTR-2026-001' }), db)
  assert.equal(r.success, true, r.error)
})

test('stati webhook failed/canceled -> FAILED/CANCELED maiuscolo come il resto del CRM', async () => {
  for (const [tipo, atteso] of [['payment_intent.payment_failed', 'FAILED'], ['payment_intent.canceled', 'CANCELED']]) {
    const db = dbSqlite({ conColonne: true }); inserisciProforma(db)
    const r = await StripeWebhookHandler.processWebhook({ id: 'evt_x', type: tipo, created: 0, data: { object: { id: 'pi_x', amount: 1, metadata: { proforma_number: 'PF-202611-ABC123' } } } }, db)
    assert.equal(r.success, true)
    assert.equal(db.raw.prepare("SELECT status FROM proforma WHERE numero_proforma='PF-202611-ABC123'").get().status, atteso)
  }
})

// --- guardia di schema nella rotta webhook ---
execFileSync('npx', ['--yes', 'esbuild', 'src/modules/stripe-webhook-route.ts', '--format=esm', '--platform=node', '--outfile=' + join(dir, 'route.mjs')], { stdio: 'pipe' })
const { assicuraColonnaPaymentIntent } = await import(pathToFileURL(join(dir, 'route.mjs')).href)

test('guardia schema: aggiunge le 3 colonne a proforma solo se mancano, poi il webhook reale funziona; seconda chiamata no-op', async () => {
  const db = dbSqlite({ conColonne: false }); inserisciProforma(db)
  await assicuraColonnaPaymentIntent(db)
  await assicuraColonnaPaymentIntent(db) // idempotente
  const cols = db.raw.prepare('PRAGMA table_info(proforma)').all().map(c => c.name)
  for (const n of ['payment_intent_id', 'paid_at', 'stripe_payment_link']) assert.equal(cols.filter(c => c === n).length, 1, n)
  const r = await StripeWebhookHandler.processWebhook(evento({ proforma_number: 'PF-202611-ABC123', contract_code: 'CTR-2026-001' }), db)
  assert.equal(r.success, true, r.error)
  assert.equal(db.raw.prepare("SELECT status FROM proforma WHERE numero_proforma='PF-202611-ABC123'").get().status, 'PAID')
  assert.equal(db.raw.prepare("SELECT status FROM leads WHERE id='L1'").get().status, 'PAYMENT_COMPLETED')
})

test('guardia schema: colonne gia presenti non vengono toccate (nessun ALTER)', async () => {
  const db = dbSqlite({ conColonne: true })
  const sqlEseguite = []
  const spia = { prepare: sql => { sqlEseguite.push(sql); return db.prepare(sql) } }
  await assicuraColonnaPaymentIntent(spia)
  assert.equal(sqlEseguite.filter(q => /ALTER/i.test(q)).length, 0)
})

test('guardia schema: db assente o tabella proforma assente -> nessuna eccezione e nessuna tabella creata', async () => {
  await assicuraColonnaPaymentIntent(null)
  const db = dbSqlite({ conProforma: false })
  await assicuraColonnaPaymentIntent(db)
  assert.equal(db.raw.prepare("SELECT name FROM sqlite_master WHERE name LIKE 'proforma%'").all().length, 0)
})

// --- generatore -> proforma -> webhook (giro completo sullo schema di produzione) ---
test('ProformaGenerator: rispetta il numero riservato, scrive su `proforma`, e il webhook lo chiude PAID', async () => {
  const num = ProformaGenerator.generateProformaNumber()
  assert.match(num, /^PF-\d{6}-[A-Z0-9]{1,6}$/)
  const db = dbSqlite({ conColonne: false })
  const r = await ProformaGenerator.generateProforma({
    numeroProforma: num, codiceContratto: 'CTR-2026-001', contractId: 'C1', leadId: 'L1', servizio: 'PRO', piano: 'BASE', importoBase: 480, iva: 105.6, totale: 585.6,
    nomeCliente: 'M', cognomeCliente: 'R', emailCliente: 'm@r.it', linkPagamentoStripe: 'https://buy.stripe.com/test_x',
  }, db)
  assert.equal(r.success, true, r.error)
  assert.equal(r.proforma.numeroProforma, num)
  const riga = db.raw.prepare('SELECT * FROM proforma WHERE numero_proforma = ?').get(num)
  assert.equal(riga.contract_id, 'C1'); assert.equal(riga.leadId, 'L1'); assert.equal(riga.prezzo_totale, 585.6); assert.equal(riga.status, 'DRAFT')
  await assicuraColonnaPaymentIntent(db)
  const w = await StripeWebhookHandler.processWebhook(evento({ proforma_number: num, contract_code: 'CTR-2026-001' }), db)
  assert.equal(w.success, true, w.error)
  const dopo = db.raw.prepare('SELECT status, payment_intent_id FROM proforma WHERE numero_proforma = ?').get(num)
  assert.equal(dopo.status, 'PAID'); assert.equal(dopo.payment_intent_id, 'pi_test_1')
  assert.equal(db.raw.prepare("SELECT name FROM sqlite_master WHERE name='proformas'").get(), undefined)
})

// ============================================================================
// Pagamento con carta dalla pagina "Pagamento Proforma" (public/pagamento.html)
// ============================================================================
const SK_TEST = 'sk_test_finta_per_i_test'
const PK_TEST = 'pk_test_finta_per_i_test'

test('carta: con chiavi test coerenti parte da sola e la pagina riceve la chiave pubblica', () => {
  const st = statoCartaStripe({ STRIPE_SECRET_KEY: SK_TEST, STRIPE_PUBLISHABLE_KEY: PK_TEST })
  assert.equal(st.abilitata, true); assert.equal(st.modalita, 'test'); assert.equal(st.publishableKey, PK_TEST)
})

test('carta: la pubblica puo stare in STRIPE_PUBLIC_KEY (nome gia usato nei docs/Cloudflare) oltre che in STRIPE_PUBLISHABLE_KEY', () => {
  assert.equal(statoCartaStripe({ STRIPE_SECRET_KEY: SK_TEST, STRIPE_PUBLIC_KEY: PK_TEST }).abilitata, true)
  assert.equal(statoCartaStripe({ STRIPE_SECRET_KEY: SK_TEST, STRIPE_PUBLISHABLE_KEY: 'pk_test_a', STRIPE_PUBLIC_KEY: 'pk_test_b' }).publishableKey, 'pk_test_a')
})

test('carta: senza STRIPE_SECRET_KEY o senza chiave pubblica NON e abilitata (motivo nei log, mai alla pagina)', () => {
  assert.equal(statoCartaStripe({ STRIPE_PUBLISHABLE_KEY: PK_TEST }).abilitata, false)
  assert.match(statoCartaStripe({ STRIPE_SECRET_KEY: SK_TEST }).motivo, /pubblica mancante/)
  assert.equal(statoCartaStripe({}).abilitata, false)
  assert.equal(statoCartaStripe({ STRIPE_SECRET_KEY: 'qualcosa', STRIPE_PUBLISHABLE_KEY: PK_TEST }).abilitata, false)
})

test('carta: chiavi incoerenti (segreta test + pubblica live) -> NON abilitata', () => {
  const st = statoCartaStripe({ STRIPE_SECRET_KEY: SK_TEST, STRIPE_PUBLISHABLE_KEY: 'pk_live_finta' })
  assert.equal(st.abilitata, false); assert.match(st.motivo, /incoerenti/)
})

test('carta LIVE: serve STRIPE_CARTA_LIVE_ATTIVA (apertura ai clienti solo dopo il pagamento reale con rimborso)', () => {
  const live = { STRIPE_SECRET_KEY: 'sk_live_finta', STRIPE_PUBLISHABLE_KEY: 'pk_live_finta' }
  assert.equal(statoCartaStripe(live).abilitata, false)
  assert.match(statoCartaStripe(live).motivo, /live non ancora attivata/)
  assert.equal(statoCartaStripe({ ...live, STRIPE_CARTA_LIVE_ATTIVA: '0' }).abilitata, false)
  assert.equal(statoCartaStripe({ ...live, STRIPE_CARTA_LIVE_ATTIVA: '1' }).abilitata, true)
})

test('importo: la carta addebita il totale IVA INCLUSA che vede il cliente (prezzo_totale e IVA esclusa)', () => {
  assert.equal(totaleProformaIvaInclusa({ prezzo_totale: 840, iva_esente: 1 }), 840)          // il caso della schermata: 840,00
  assert.equal(totaleProformaIvaInclusa({ prezzo_totale: 480 }), 585.6)                          // 22%
  assert.equal(totaleProformaIvaInclusa({ prezzo_totale: 1000, iva_agevolata: 1 }), 1040)        // 4%
  assert.equal(totaleProformaIvaInclusa({ prezzo_totale: 480 }, { iva_esente: 1 }), 480)         // flag dal lead
  assert.equal(totaleProformaIvaInclusa({ prezzo_totale: 'x' }), 0)
})

function conStripeFinto(rispondi, fn) {
  const originale = globalThis.fetch
  const chiamate = []
  globalThis.fetch = async (url, init) => { chiamate.push({ url: String(url), init }); return rispondi(String(url), init) }
  return fn(chiamate).finally(() => { globalThis.fetch = originale })
}

test('Payment Intent: metadata proforma_number e contract_code (nomi attesi dal webhook) + nessun finto client secret senza chiavi', () =>
  conStripeFinto((u, init) => new Response(JSON.stringify({ id: 'pi_test_9', client_secret: 'pi_test_9_secret_x' }), { status: 200 }), async chiamate => {
    const r = await createStripePaymentIntent({ STRIPE_SECRET_KEY: SK_TEST, STRIPE_PUBLISHABLE_KEY: PK_TEST }, 84000, 'Pagamento Proforma PRF202611-57YV',
      { proformaId: 7, proforma_number: 'PRF202611-57YV', contract_code: 'CTR-2026-001', leadId: 'L1' })
    assert.equal(r.success, true); assert.equal(r.paymentId, 'pi_test_9')
    assert.match(chiamate[0].url, /\/v1\/payment_intents$/)
    const p = new URLSearchParams(chiamate[0].init.body)
    assert.equal(p.get('metadata[proforma_number]'), 'PRF202611-57YV')
    assert.equal(p.get('metadata[contract_code]'), 'CTR-2026-001')
    assert.equal(p.get('amount'), '84000')
    assert.equal(p.get('metadata[lead_id]'), 'L1')
    const senza = await createStripePaymentIntent({}, 100, 'x', { proforma_number: 'PRF1' })
    assert.equal(senza.success, false); assert.equal(senza.stripeClientSecret, undefined)
    assert.equal(chiamate.length, 1, 'senza chiavi non si deve chiamare Stripe')
  }))

test('webhook: contract_code vuoto -> il lead si trova comunque dalla proforma (leadId) e il pagamento si chiude', async () => {
  const db = dbSqlite({ conColonne: true })
  db.raw.exec(`INSERT INTO proforma (contract_id, leadId, numero_proforma, status) VALUES ('', 'L1', 'PRF202611-57YV', 'SENT')`)
  const r = await StripeWebhookHandler.processWebhook(evento({ proforma_number: 'PRF202611-57YV', contract_code: '' }), db)
  assert.equal(r.success, true, r.error)
  assert.equal(db.raw.prepare("SELECT status FROM proforma WHERE numero_proforma='PRF202611-57YV'").get().status, 'PAID')
  assert.equal(db.raw.prepare("SELECT status FROM leads WHERE id='L1'").get().status, 'PAYMENT_COMPLETED')
})

// --- Giro completo in locale: Payment Intent -> evento Stripe firmato -> rotta webhook REALE -> D1 ---
test('GIRO COMPLETO: Payment Intent -> webhook firmato HMAC -> 200 -> proforma PAID, lead PAYMENT_COMPLETED, riga in stripe_webhook_events', async () => {
  const SEGRETO = 'whsec_finto_per_i_test'
  const db = dbSqlite({ conColonne: false })
  db.raw.exec(readFileSync('migrations/0109_create_stripe_webhook_events.sql', 'utf8'))
  db.raw.exec(`INSERT INTO proforma (contract_id, leadId, numero_proforma, status, prezzo_totale) VALUES ('C1', 'L1', 'PRF202611-57YV', 'SENT', 840)`)
  // 1) la pagina chiede il Payment Intent: Stripe (finto) lo crea e restituisce i metadata ricevuti
  let metadataInviati = {}
  await conStripeFinto((u, init) => {
    const p = new URLSearchParams(init.body)
    metadataInviati = { proforma_number: p.get('metadata[proforma_number]'), contract_code: p.get('metadata[contract_code]') }
    return new Response(JSON.stringify({ id: 'pi_test_e2e', client_secret: 'pi_test_e2e_secret' }), { status: 200 })
  }, async () => {
    const r = await createStripePaymentIntent({ STRIPE_SECRET_KEY: SK_TEST, STRIPE_PUBLISHABLE_KEY: PK_TEST }, 84000, 'Pagamento Proforma PRF202611-57YV',
      { proformaId: 1, proforma_number: 'PRF202611-57YV', contract_code: 'CTR-2026-001', leadId: 'L1' })
    assert.equal(r.success, true)
  })
  // 2) Stripe invia payment_intent.succeeded con quei metadata, firmato
  const corpo = JSON.stringify({ id: 'evt_e2e_1', type: 'payment_intent.succeeded', livemode: false, created: 0,
    data: { object: { id: 'pi_test_e2e', amount: 84000, metadata: metadataInviati } } })
  const ts = Math.floor(Date.now() / 1000)
  const firma = `t=${ts},v1=${createHmac('sha256', SEGRETO).update(`${ts}.${corpo}`).digest('hex')}`
  const esito = await handleStripeWebhook(corpo, firma, { STRIPE_WEBHOOK_SECRET: SEGRETO }, db)
  // 3) risultato
  assert.equal(esito.status, 200, JSON.stringify(esito.body))
  const pf = db.raw.prepare("SELECT status, payment_intent_id FROM proforma WHERE numero_proforma='PRF202611-57YV'").get()
  assert.equal(pf.status, 'PAID'); assert.equal(pf.payment_intent_id, 'pi_test_e2e')
  assert.equal(db.raw.prepare("SELECT status FROM leads WHERE id='L1'").get().status, 'PAYMENT_COMPLETED')
  const ev = db.raw.prepare('SELECT event_id, event_type, esito, http_status FROM stripe_webhook_events ORDER BY id DESC LIMIT 1').get()
  assert.deepEqual({ ...ev }, { event_id: 'evt_e2e_1', event_type: 'payment_intent.succeeded', esito: 'ok', http_status: 200 })
  // 4) firma sbagliata -> 400 e nessun cambio
  const db2 = dbSqlite({ conColonne: true }); db2.raw.exec(readFileSync('migrations/0109_create_stripe_webhook_events.sql', 'utf8'))
  inserisciProforma(db2)
  const rifiutato = await handleStripeWebhook(corpo, `t=${ts},v1=${'0'.repeat(64)}`, { STRIPE_WEBHOOK_SECRET: SEGRETO }, db2)
  assert.equal(rifiutato.status, 400)
  assert.equal(db2.raw.prepare("SELECT status FROM leads WHERE id='L1'").get().status, 'CONTRACT_SIGNED')
})
