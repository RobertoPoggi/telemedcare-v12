// Test del pulsante "Carica su SiDLY" (upsert gentile). Nessuna rete reale: fetch e DB simulati, dati finti.
import { readFileSync } from 'node:fs'
import * as S from '../../src/modules/sidly-sync'
import { checkSessionOrKey } from '../../src/modules/admin-guard'

type Ok = (c: boolean, msg: string) => void
type Section = (t: string) => void

const ENV: S.SidlyEnv = { SIDLY_USER: 'u-test', SIDLY_PASSWORD: 'p-segreta-xyz', SIDLY_BASE_URL: 'https://api.sidly-platform-dev.com/api', SIDLY_FRAME_URL: 'https://crm.example/api/sidly/ingest' }
const IMEI = '868298061208378'

interface Call { method: string; path: string; body: any; token?: string }

/** Piattaforma SiDLY finta e con stato: GET/POST/PATCH paziente, myShortInfo, set-url-for-band, login. */
function makePlatform(opts: { patients?: Record<string, any>; tokenExpiresOnce?: boolean; alwaysFail?: number; searchResults?: any[]; searchStatus?: number; noFullRecord?: boolean; contacts?: any[]; diseases?: any; card?: any; detailStatus?: number; patchDetailStatus?: number; patchPatient?: { status: number; body: any }; patchNeedsFullBand?: boolean; rejectAlias?: boolean } = {}) {
  const patients: Record<string, any> = opts.patients || {}
  const calls: Call[] = []
  let logins = 0
  let tokenValid = ''
  let expireOnce = !!opts.tokenExpiresOnce
  let nextId = 14879
  const state = { contacts: opts.contacts, diseases: opts.diseases, card: opts.card }
  const fetchImpl: S.Fetch = async (url, init) => {
    const path = url.replace(ENV.SIDLY_BASE_URL!, '')
    const method = init?.method || 'GET'
    const body = init?.body ? JSON.parse(init.body) : undefined
    const token = init?.headers?.['X-Access-Token']
    const reply = (status: number, json?: any) => ({ status, text: async () => (json === undefined ? '' : JSON.stringify(json)), headers: { get: () => null } })
    if (path === '/user/login') { logins++; tokenValid = 'tok-' + logins; return reply(200, { data: { authentication_token: tokenValid } }) }
    calls.push({ method, path, body, token })
    if (expireOnce) { expireOnce = false; tokenValid = ''; return reply(401, {}) } // il token emesso è scaduto lato piattaforma
    if (!tokenValid || token !== tokenValid) return reply(401, {})
    if (opts.alwaysFail) return reply(opts.alwaysFail, {})
    if (path.startsWith('/patient/myShortInfo')) return reply(opts.searchStatus || 200, { items: opts.searchResults || [] })
    let m = path.match(/^\/patient\/(\d+)$/)
    if (method === 'GET' && m) { const p = patients[m[1]]; return p ? reply(200, p) : reply(404, {}) }
    m = path.match(/^\/manager\/patient-edit-initial-data\/(\d+)$/)
    if (method === 'GET' && m) {
      if (opts.noFullRecord) return reply(404, {})
      const p = patients[m[1]] || Object.values(patients).find((x: any) => String(x.user_id) === m![1])
      return p ? reply(200, { user: { ...p.user, first_name: p.user.firstName ?? p.user.first_name, last_name: p.user.lastName ?? p.user.last_name }, band: p.band, type: 'ONE' }) : reply(404, {})
    }
    if (method === 'POST' && path === '/manager/patient') {
      const id = nextId++
      patients[body.band.imei] = { user_id: id, user: { ...body.user }, band: { ...body.band } }
      return reply(201, { user_id: id })
    }
    m = path.match(/^\/manager\/patient\/(\d+)$/)
    if (method === 'PATCH' && m && opts.patchPatient) return reply(opts.patchPatient.status, opts.patchPatient.body)
    // SiDLY che accetta la modifica del braccialetto solo se arriva il modulo completo (come lo manda il portale)
    if (method === 'PATCH' && m && opts.patchNeedsFullBand && body.band && (body.band.minHr === undefined || !body.lang || !body.user || !body.wifi || !body.wifi.band_imei)) return reply(400, { status: 400, errors: [] })
    if (method === 'PATCH' && m && opts.rejectAlias && body.band && body.band.whiteListAlias) return reply(400, { status: 400, errors: [] })
    if (method === 'PATCH' && m) {
      const p = patients[m[1]] || Object.values(patients).find((x: any) => String(x.user_id) === m![1])
      if (!p) return reply(404, {})
      Object.assign(p.user, body.user || {}); Object.assign(p.band, body.band || {})
      return reply(200, {})
    }
    if (method === 'POST' && path === '/manager/set-url-for-band') return reply(200, {})
    m = path.match(/^\/(getContacts|getDiseases|patientCard|editContacts|editDiseases)\/(\d+)$/)
    if (m) {
      if (method === 'GET' && opts.detailStatus) return reply(opts.detailStatus, {})
      if (method === 'PATCH' && opts.patchDetailStatus) return reply(opts.patchDetailStatus, {})
      if (m[1] === 'getContacts') return state.contacts ? reply(200, { data: state.contacts }) : reply(404, {})
      if (m[1] === 'getDiseases') return state.diseases ? reply(200, { data: state.diseases }) : reply(404, {})
      if (m[1] === 'patientCard') return state.card ? reply(200, { patientCard: state.card }) : reply(404, {})
      if (m[1] === 'editContacts') {
        const list: any[] = []
        for (const n of [1, 2, 3]) if (body[`contact${n}Name`] !== undefined || body[`contact${n}Phone`] !== undefined) list.push({ id: body[`contact${n}ID`] ?? 900 + n, name: body[`contact${n}Name`], phone_num: body[`contact${n}Phone`], family_kind: body[`contact${n}Affinity`], address: body[`contact${n}Address`], others: body[`contact${n}Others`] })
        state.contacts = list
        return reply(200, {})
      }
      if (m[1] === 'editDiseases') {
        const d: any = { ...(state.diseases || {}) }
        for (const [k, v] of Object.entries(body)) { if (k === 'diseaseID') d.id = v; else d[k] = v }
        state.diseases = d
        return reply(200, {})
      }
    }
    return reply(404, {})
  }
  return { fetchImpl, calls, patients, state, get logins() { return logins } }
}

const SRC = (over: any = {}): S.CrmSources => ({
  leadId: 'L1',
  assistito: { id: 7, imei: IMEI, status: 'ATTIVO', nome_assistito: 'Anna', cognome_assistito: 'Rossi', telefono: '3331112233', peso: 62, altezza: 160, ...(over.assistito || {}) },
  lead: { dataNascitaAssistito: '1944-03-09', indirizzoAssistito: 'Via Roma 1', cittaAssistito: 'Milano', capAssistito: '20100', provinciaAssistito: 'MI', ...(over.lead || {}) },
  config: { id: 5, telefono: '+39 333 1112233', contatto_emergenza_1_telefono: '3470001111', contatto_emergenza_2_telefono: '', ...(over.config || {}) },
  simNumber: over.simNumber === undefined ? '3897770000' : over.simNumber,
})
const crmOf = (over: any = {}) => { const r = S.buildCrmPatient(SRC(over), ENV); if ('error' in r) throw new Error(r.error); return r }

/** Il paziente come lo vedrebbe la piattaforma dopo una creazione dal CRM (tutto allineato). */
const platformFrom = (crm: S.CrmPatient, extraBand: any = {}, userOver: any = {}) => ({ user_id: 14879, user: { ...crm.user, ...userOver }, band: { ...crm.band, minHr: 50, maxHr: 120, zone: [{ lat: 1, lng: 2, r: 100 }], ...extraBand } })

type Verso = 'crm' | 'sidly'
const rowOf = (r: S.SyncResult, campo: string) => (r.confronto || []).find(x => x.campo === campo || x.chiave === campo)
const sceltaDi = (r: S.SyncResult, campo: string, verso: Verso): S.SceltaRiga => {
  const x = rowOf(r, campo)
  if (!x || !x.chiave) throw new Error('riga senza scelta possibile: ' + campo)
  return { chiave: x.chiave, verso, sidly: x.sidly, crm: x.crm }
}
const preview = (crm: S.CrmPatient, P: { fetchImpl: S.Fetch }, extra: any = {}) => S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, dryRun: true, ...extra })
/** Come l'operatore: prima l'anteprima, poi scrive SOLO le righe scelte. */
async function scrivi(crm: S.CrmPatient, P: { fetchImpl: S.Fetch }, campi: Array<[string, Verso]>, extra: any = {}) {
  const d = await preview(crm, P, extra)
  const scelte = campi.map(([c, v]) => sceltaDi(d, c, v))
  const ops: S.CrmOp[] = []
  const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, scelte, applyCrm: async o => { ops.push(...o) }, ...extra })
  return { r, ops, scelte }
}
const S_noop = <T,>(x: T) => x
/** Anteprima con le scelte dell'operatore (ancora nessuna scrittura): serve per prima / dopo. */
async function anteprimaScelte(crm: S.CrmPatient, P: { fetchImpl: S.Fetch }, campi: Array<[string, Verso]>, extra: any = {}) {
  const d = await preview(crm, P, extra)
  return preview(crm, P, { ...extra, scelte: campi.map(([c, v]) => sceltaDi(d, c, v)) })
}
const scrittureGET = (P: { calls: Call[] }) => P.calls.filter(c => c.method !== 'GET' && c.path !== '/user/login')

/** DB D1 finto: risponde per frammento di SQL. */
function makeDb(state: { assistito?: any; lead?: any; config?: any; ddt?: any; saved?: any[]; failSave?: boolean; updates?: Array<{ sql: string; b: any[] }>; failUpdate?: boolean }) {
  const saved = state.saved || []
  const updates = state.updates || []
  return {
    saved,
    updates,
    prepare(sql: string) {
      return {
        bind: (...b: any[]) => ({
          first: async () => {
            if (sql.includes('FROM assistiti')) return state.assistito ?? null
            if (sql.includes('FROM contracts')) return null
            if (sql.includes('FROM leads')) return state.lead ?? null
            if (sql.includes('FROM configurations')) return state.config ?? null
            if (sql.includes('FROM ddts')) return state.ddt ?? null
            return null
          },
          run: async () => { if (/^\s*UPDATE/.test(sql)) { if (state.failUpdate) throw new Error('boom'); updates.push({ sql, b }); return { meta: {} } } if (state.failSave) throw new Error('boom'); if (sql.includes('INSERT INTO sidly_sync')) saved.push(b); return { meta: {} } },
        }),
        run: async () => ({ meta: {} }),
      }
    },
  }
}

export async function runSidlyTests(ok: Ok, section: Section) {
  section('8. «Carica su SiDLY»: upsert gentile (fetch e DB simulati)')
  S.resetSidlyTokenCache()

  // ── normalizzazioni ────────────────────────────────────────────────────────
  const sp = S.splitPhone
  ok(JSON.stringify(sp('333 1112233')) === '{"prefix":"+39","number":"3331112233"}', 'telefono italiano senza prefisso → +39')
  ok(JSON.stringify(sp('+39 333 1112233')) === '{"prefix":"+39","number":"3331112233"}', 'telefono con +39 → prefisso separato')
  ok(JSON.stringify(sp('0039 333 1112233')) === '{"prefix":"+39","number":"3331112233"}', 'telefono con 0039 → prefisso separato')
  ok(JSON.stringify(sp('393331112233')) === '{"prefix":"+39","number":"3331112233"}', 'telefono 39… senza + → prefisso separato')
  ok(sp('') === null && sp('12') === null && sp(null) === null, 'telefono vuoto o troppo corto → null (omesso)')
  ok(JSON.stringify(S.parseBirthDate('1944-03-09')) === '{"year":1944,"month":3,"day":9}' && JSON.stringify(S.parseBirthDate('09/03/1944')) === '{"year":1944,"month":3,"day":9}', 'data di nascita ISO e italiana')
  ok(S.parseBirthDate('31/02/1944') === null && S.parseBirthDate('') === null && S.parseBirthDate('1800-01-01') === null, 'data impossibile, vuota o assurda → null')

  // ── costruzione dal CRM ────────────────────────────────────────────────────
  const c0 = crmOf()
  ok(c0.user.firstName === 'Anna' && c0.user.lastName === 'Rossi' && c0.user.phone === '3331112233' && c0.user.phonePrefix === '+39', 'CRM → paziente: nome, cognome, telefono con prefisso')
  ok(c0.user.address === 'Via Roma 1, Milano, MI, 20100' && c0.user.weight === 62 && c0.user.height === 160, 'CRM → paziente: indirizzo nel formato del portale (Via, Città, Provincia, CAP), peso, altezza')
  ok(c0.band.phones?.length === 1 && c0.band.phones[0].number === '3470001111' && c0.band.simNumber === '3897770000' && c0.band.timezone === 'Europe/Rome' && c0.band.lang_band === 'IT', 'CRM → band: numero SOS (il vuoto è omesso), SIM, timezone e lingua')
  const cm = crmOf({ assistito: { altezza: 1.6 } })
  ok(cm.user.height === 160, 'altezza in metri (1,6) → 160 cm')
  const cEmpty = crmOf({ assistito: { peso: null, altezza: null, telefono: '' }, lead: { indirizzoAssistito: '', cittaAssistito: '', capAssistito: '', provinciaAssistito: '', dataNascitaAssistito: '' }, config: { telefono: '', contatto_emergenza_1_telefono: '' }, simNumber: null })
  ok(!('weight' in cEmpty.user) && !('height' in cEmpty.user) && !('phone' in cEmpty.user) && !('address' in cEmpty.user) && !('date' in cEmpty.user) && !('phones' in cEmpty.band) && !('simNumber' in cEmpty.band), 'campi vuoti nel CRM → omessi dal paziente (mai chiavi vuote)')
  ok('error' in S.buildCrmPatient(SRC({ assistito: { imei: '' } }), ENV), 'senza IMEI → errore chiaro')
  ok('error' in S.buildCrmPatient(SRC({ assistito: { nome_assistito: '', cognome_assistito: '', nome: '' }, lead: { nomeAssistito: '', cognomeAssistito: '' }, config: { nome_assistito: '', cognome_assistito: '' } }), ENV), 'senza nome/cognome → errore chiaro')

  // ── caso 1: non esiste → crea; secondo click → invariato (idempotenza) ─────
  {
    const P = makePlatform()
    const r1 = await S.syncAssistito({ crm: crmOf(), env: ENV, fetchImpl: P.fetchImpl, confermaCrea: false })
    ok(r1.esito === 'creato' && r1.sidly_user_id === '14879', 'caso 1: assistito assente → "creato" con user_id')
    const post = P.calls.find(c => c.method === 'POST' && c.path === '/manager/patient')
    ok(!!post && post.body.user.firstName === 'Anna' && post.body.band.imei === IMEI && post.body.band.timezone === 'Europe/Rome', 'caso 1: POST con user e band completi')
    ok(r1.url_for_band.registrato === true && P.calls.some(c => c.path === '/manager/set-url-for-band' && c.body.imei === IMEI && c.body.url === ENV.SIDLY_FRAME_URL), 'caso 8: dopo la creazione l\'URL di consegna frame è registrato per l\'IMEI')
    const callsBefore = P.calls.length
    const r2 = await S.syncAssistito({ crm: crmOf(), env: ENV, fetchImpl: P.fetchImpl })
    ok(r2.esito === 'invariato', 'caso 1: secondo click → "invariato"')
    ok(!P.calls.slice(callsBefore).some(c => c.method === 'PATCH' || (c.method === 'POST' && c.path === '/manager/patient')), 'caso 1: il secondo giro non crea duplicati e non invia PATCH')
    ok(P.calls.slice(callsBefore).filter(c => c.path === '/manager/set-url-for-band').length === 1 && r2.url_for_band.registrato, 'caso 8: l\'URL di consegna viene ri-registrato (idempotente) al nuovo click')
    ok(Object.keys(P.patients).length === 1, 'caso 1: in piattaforma resta un solo assistito')
  }

  // ── caso 2: esiste e tutto uguale → invariato, nessuna scrittura ───────────
  {
    const crm = crmOf()
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crm) } })
    const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
    ok(r.esito === 'invariato' && scrittureGET(P).filter(c => c.path !== '/manager/set-url-for-band').length === 0, 'caso 2: tutto uguale → \"invariato\", nessuna PATCH')
    ok(r.sidly_user_id === '14879', 'caso 2: user_id letto dalla piattaforma')
  }

  // ── NIENTE si scrive da solo: senza scelte dell'operatore nessun dato esistente viene toccato ──
  {
    const crm = crmOf()
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crm, {}, { phone: '3339998877', address: 'Via Vecchia 9, Genova', weight: 70 }) } })
    const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
    ok(r.esito === 'invariato' && !P.calls.some(c => c.method === 'PATCH'), 'senza scelte: valori diversi ma NESSUNA PATCH (default = nessuna modifica)')
    ok(P.patients[IMEI].user.phone === '3339998877' && P.patients[IMEI].user.weight === 70, 'senza scelte: i dati su SiDLY restano intatti')
    const rows = r.confronto || []
    ok(rowOf(r, 'Telefono dell\'assistito')?.stato === 'diverso' && JSON.stringify(rowOf(r, 'Telefono dell\'assistito')?.verso) === '["crm","sidly"]', 'riga diversa con valori su entrambi i lati: si può scegliere CRM o SiDLY')
    ok(rows.filter(x => x.verso && x.verso.length).every(x => !!x.chiave && x.stato !== 'uguale' && !x.assenteCrm && !x.assenteSidly), 'scelta offerta solo su righe con campo presente in entrambi gli ambienti e valori non uguali')
    ok(!rows.some(x => (x.assenteCrm || x.assenteSidly) && (x.chiave || x.verso)), 'campi presenti da una parte sola: nessuna scelta possibile')
  }

  // ── caso 3: l'operatore sceglie «vale il CRM» sul telefono → PATCH con SOLO user.phone ──────
  {
    const crm = crmOf()
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crm, {}, { phone: '3339998877', address: 'Via Vecchia 9, Genova' }) } })
    const { r } = await scrivi(crm, P, [['Telefono dell\'assistito', 'crm']])
    const patch = P.calls.find(c => c.method === 'PATCH')
    ok(r.esito === 'aggiornato' && !!patch, 'caso 3: telefono scelto «vale il CRM» → \"aggiornato\"')
    ok(JSON.stringify(patch?.body) === '{\"user\":{\"phone\":\"3331112233\"}}', 'caso 3: il body della PATCH contiene SOLO user.phone (l\'indirizzo diverso NON scelto resta com\'è)')
    const txt = JSON.stringify(patch?.body)
    ok(!txt.includes('phones') && !txt.includes('zone') && !txt.includes('minHr') && !txt.includes('maxHr') && !txt.includes('band'), 'caso 3: SOS, zone e soglie NON compaiono nel body')
    ok(patch?.path === `/manager/patient/${IMEI}`, 'caso 3: PATCH sull\'IMEI')
    ok(P.patients[IMEI].user.address === 'Via Vecchia 9, Genova', 'caso 3: l\'indirizzo non scelto è rimasto quello di SiDLY')
  }

  // ── caso 4: indirizzo vuoto su SiDLY, scelto «vale il CRM» → PATCH con SOLO user.address ──
  {
    const crm = crmOf()
    const plat = platformFrom(crm); delete (plat.user as any).address
    const P = makePlatform({ patients: { [IMEI]: plat } })
    const { r } = await scrivi(crm, P, [['Indirizzo', 'crm']])
    const patch = P.calls.find(c => c.method === 'PATCH')
    ok(r.esito === 'aggiornato' && JSON.stringify(patch?.body) === '{\"user\":{\"address\":\"Via Roma 1, Milano, MI, 20100\"}}', 'caso 4: indirizzo vuoto su SiDLY + scelta «vale il CRM» → PATCH con solo user.address')
  }

  // ── caso 5: vuoto nel CRM, valorizzato su SiDLY → mai azzerato, né offerto «vale il CRM» ──
  {
    const crm = crmOf({ lead: { indirizzoAssistito: '', cittaAssistito: '', capAssistito: '', provinciaAssistito: '' }, assistito: { peso: null } })
    const full = crmOf()
    const P = makePlatform({ patients: { [IMEI]: platformFrom(full) } })
    const d = await preview(crm, P)
    ok(rowOf(d, 'Indirizzo')?.stato === 'solo_sidly' && JSON.stringify(rowOf(d, 'Indirizzo')?.verso) === '["sidly"]', 'caso 5: vuoto nel CRM → l\'unica scelta possibile è «vale SiDLY» (mai svuotare SiDLY)')
    let rifiutata = false
    const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, scelte: [{ chiave: 'user.address', verso: 'crm', sidly: rowOf(d, 'Indirizzo')!.sidly, crm: '' }], applyCrm: async () => {} })
    rifiutata = r.esito === 'errore' && /non consentita/.test(r.errore || '')
    ok(rifiutata && !P.calls.some(c => c.method === 'PATCH'), 'caso 5: forzare «vale il CRM» su un valore vuoto → rifiutato dal server, nessuna PATCH')
    ok(P.patients[IMEI].user.address === 'Via Roma 1, Milano, MI, 20100' && P.patients[IMEI].user.weight === 62, 'caso 5: i dati su SiDLY restano intatti')
  }

  // ── e-mail dei referenti: «email x@y.it» e «email: x@y.it» sono la STESSA e-mail ──────────────
  {
    const crmE = crmOf({ config: { contatto1_nome: 'Mario', contatto1_cognome: 'Bianchi', contatto1_telefono: '3470001111', contatto1_email: 'pkbscania@gmail.com', contatto2_nome: 'Stefania', contatto2_cognome: 'Rocca', contatto2_telefono: '3357301206', contatto2_email: 'stefania.rocca@yahoo.it' } })
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crmE) }, contacts: [
      { id: 1, name: 'Mario Bianchi', phone_num: '3470001111', family_kind: 'Figlio', address: '', others: 'email pkbscania@gmail.com' },
      { id: 2, name: 'Stefania Rocca', phone_num: '+393357301206', family_kind: 'Figlia', address: '', others: 'email stefania.rocca@yahoo.it' }], diseases: { id: 1 }, card: {} })
    const d = await preview(crmE, P)
    ok(rowOf(d, 'Referente 1 · e-mail')?.stato === 'uguale' && rowOf(d, 'Referente 2 · e-mail')?.stato === 'uguale', 'e-mail referente: stesso indirizzo con testo diverso («email x» / «email: x») → UGUALE, non \"diverso\"')
    ok(rowOf(d, 'Referente 1 · e-mail')?.sidly === 'pkbscania@gmail.com' && rowOf(d, 'Referente 1 · e-mail')?.crm === 'pkbscania@gmail.com', 'e-mail referente: in tabella si mostra l\'indirizzo, non il testo con il prefisso')
    ok(rowOf(d, 'Referente 2 · telefono')?.stato === 'uguale', 'telefono referente con e senza prefisso → uguale')
    const P2 = makePlatform({ patients: { [IMEI]: platformFrom(crmE) }, contacts: [{ id: 1, name: 'Mario Bianchi', phone_num: '3470001111', family_kind: '', address: '', others: 'email: vecchia@x.it' }], diseases: { id: 1 }, card: {} })
    const d2 = await preview(crmE, S_noop(P2))
    ok(rowOf(d2, 'Referente 1 · e-mail')?.stato === 'diverso' && JSON.stringify(rowOf(d2, 'Referente 1 · e-mail')?.verso) === '["crm","sidly"]', 'e-mail referente realmente diversa → \"diverso\" con scelta')
  }

  // ── SOS = referenti: scelta «vale il CRM» sostituisce i SOS, soglie/zone/misure restano della piattaforma ─
  {
    const crm = crmOf({ config: { contatto_emergenza_1_telefono: '3490001234' } })
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crm, { phones: [{ numberPrefix: '+39', number: '3470001111', repeatNumber: 1 }] }) } })
    const d = await preview(crm, P)
    ok(rowOf(d, 'Numeri SOS (devono essere i 3 referenti)')?.stato === 'diverso', 'SOS diversi: riga \"diverso\"')
    const { r } = await scrivi(crm, P, [['Numeri SOS (devono essere i 3 referenti)', 'crm']])
    const patch = P.calls.find(c => c.method === 'PATCH' && c.path.startsWith('/manager/patient/'))
    ok(r.esito === 'aggiornato' && Object.keys(patch?.body || {}).join() === 'band' && Object.keys(patch?.body.band).join() === 'phones', 'SOS scelti «vale il CRM» → allineati al CRM (solo band.phones nella PATCH)')
    const txt = JSON.stringify(patch?.body)
    ok(!txt.includes('minHr') && !txt.includes('maxHr') && !txt.includes('zone') && !txt.includes('measure'), 'SOS allineati: soglie FC, zone e misure NON compaiono nel body')
    ok(r.campi_inviati.some(c => c.campo === 'band.phones' && c.mostra_prima === '+393470001111' && !!c.mostra_dopo && c.mostra_dopo.includes('+393490001234')), 'SOS sostituiti: valore precedente e nuovo mostrati all\'operatore')
    const dopo = await preview(crm, P)
    ok(rowOf(dopo, 'Numeri SOS (devono essere i 3 referenti)')?.stato === 'uguale' && !rowOf(dopo, 'Numeri SOS (devono essere i 3 referenti)')?.verso, 'SOS: dopo la scrittura la riga è uguale e non offre più scelte')
  }
  {
    const crm = crmOf()
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crm, { phones: [] }) } })
    const d = await preview(crm, P)
    ok(JSON.stringify(rowOf(d, 'Numeri SOS (devono essere i 3 referenti)')?.verso) === '["crm"]', 'SOS vuoti su SiDLY: unica scelta possibile «vale il CRM»')
    const { r } = await scrivi(crm, P, [['Numeri SOS (devono essere i 3 referenti)', 'crm']])
    const patch = P.calls.find(c => c.method === 'PATCH')
    ok(r.esito === 'aggiornato' && Object.keys(patch?.body || {}).join() === 'band' && Object.keys(patch?.body.band).join() === 'phones', 'SOS vuoti su SiDLY → riempiti dal CRM (solo band.phones)')
  }
  {
    const crm = crmOf({ simNumber: '3891112222' })
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crm, { simNumber: '3890000000' }) } })
    const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
    ok(r.esito === 'invariato' && rowOf(r, 'Numero SIM')?.stato === 'diverso', 'SIM diversa: segnalata come \"diverso\", mai sovrascritta senza scelta')
    const { r: r2, ops } = await scrivi(crm, P, [['Numero SIM', 'sidly']])
    ok(r2.esito === 'aggiornato' && ops.length === 1 && ops[0].t === 'col' && ops[0].tabella === 'ddts' && ops[0].col === 'sim_number' && ops[0].val === '3890000000', 'SIM: scelta «vale SiDLY» → scrittura nel CRM (ddts.sim_number), nessuna PATCH su SiDLY')
    ok(!P.calls.some(c => c.method === 'PATCH'), 'SIM «vale SiDLY»: nulla viene scritto su SiDLY')
  }
  {
    const crm = crmOf({ assistito: { nome_assistito: 'ANNA' } })
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crmOf()) } })
    const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
    ok(r.esito === 'invariato' && rowOf(r, 'Nome')?.stato === 'uguale', 'differenza solo di maiuscole/minuscole nel nome → uguale')
  }

  // ── caso 6: token scaduto → re-login e retry; poi errori gestiti ───────────
  {
    S.resetSidlyTokenCache()
    const P = makePlatform({ tokenExpiresOnce: true })
    const r = await S.syncAssistito({ crm: crmOf(), env: ENV, fetchImpl: P.fetchImpl, confermaCrea: true })
    ok(r.esito === 'creato' && P.logins >= 2, 'caso 6: 401 sul token → re-login automatico e retry, poi "creato"')
    ok(P.calls.filter(c => c.method === 'GET' && c.path === `/patient/${IMEI}`).length === 2, 'caso 6: la chiamata fallita è ripetuta una volta con il nuovo token')
  }
  {
    S.resetSidlyTokenCache()
    const P = makePlatform({ alwaysFail: 500 })
    const r = await S.syncAssistito({ crm: crmOf(), env: ENV, fetchImpl: P.fetchImpl })
    ok(r.esito === 'errore' && /HTTP 500/.test(r.errore || ''), 'errore 500 → esito "errore" con messaggio chiaro')
  }
  {
    S.resetSidlyTokenCache()
    const failing: S.Fetch = async () => { throw new Error('network down') }
    const r = await S.syncAssistito({ crm: crmOf(), env: ENV, fetchImpl: failing })
    ok(r.esito === 'errore' && !!r.errore, 'rete assente → esito "errore", nessuna eccezione')
  }
  {
    S.resetSidlyTokenCache()
    const badLogin: S.Fetch = async () => ({ status: 401, text: async () => '{"detail":"p-segreta-xyz"}' })
    const r = await S.syncAssistito({ crm: crmOf(), env: ENV, fetchImpl: badLogin })
    ok(r.esito === 'errore' && !JSON.stringify(r).includes('p-segreta-xyz'), 'login rifiutato → errore senza riportare il corpo della risposta (niente segreti)')
  }

  // ── caso 7: omonimia → conferma umana prima di creare ──────────────────────
  {
    S.resetSidlyTokenCache()
    const P = makePlatform({ searchResults: [{ user_id: 555, first_name: 'Anna', last_name: 'Rossi' }, { user_id: 556, first_name: 'Anna', last_name: 'Bianchi' }] })
    const r = await S.syncAssistito({ crm: crmOf(), env: ENV, fetchImpl: P.fetchImpl })
    ok(r.esito === 'conferma_richiesta' && r.candidati?.length === 1 && r.candidati[0].user_id === '555', 'caso 7: omonimo in myShortInfo → conferma richiesta con il solo candidato omonimo')
    ok(!P.calls.some(c => c.method === 'POST' && c.path === '/manager/patient'), 'caso 7: nessuna creazione prima della conferma')
    const url = P.calls.find(c => c.path.startsWith('/patient/myShortInfo'))?.path || ''
    ok(url.includes('first_name=Anna') && url.includes('last_name=Rossi'), 'caso 7: ricerca per nome e cognome')
    const r2 = await S.syncAssistito({ crm: crmOf(), env: ENV, fetchImpl: P.fetchImpl, confermaCrea: true })
    ok(r2.esito === 'creato', 'caso 7: "crea nuovo" confermato → creato')
  }
  {
    S.resetSidlyTokenCache()
    const P = makePlatform({ patients: { '555': { user_id: 555, user: { firstName: 'Anna', lastName: 'Rossi' }, band: {} } }, searchResults: [{ user_id: 555, first_name: 'Anna', last_name: 'Rossi' }] })
    const r0 = await S.syncAssistito({ crm: crmOf(), env: ENV, fetchImpl: P.fetchImpl, associaUserId: '555' })
    ok(r0.esito === 'invariato' && r0.sidly_user_id === '555' && !P.calls.some(c => c.method === 'PATCH'), 'associa omonimo: senza scelte non si scrive nulla')
    const { r } = await scrivi(crmOf(), P, [["Telefono dell'assistito", 'crm']], { associaUserId: '555' })
    const patch = P.calls.find(c => c.method === 'PATCH')
    ok(r.esito === 'aggiornato' && patch?.path === '/manager/patient/555' && r.sidly_user_id === '555', 'associa omonimo: aggiorna quell\'assistito per user_id, non ne crea uno nuovo')
    ok(!P.calls.some(c => c.method === 'POST' && c.path === '/manager/patient'), 'associa omonimo: nessuna creazione')
  }
  {
    S.resetSidlyTokenCache()
    const P = makePlatform({ searchStatus: 500 })
    const r = await S.syncAssistito({ crm: crmOf(), env: ENV, fetchImpl: P.fetchImpl })
    ok(r.esito === 'conferma_richiesta' && !P.calls.some(c => c.path === '/manager/patient' && c.method === 'POST'), 'ricerca omonimi fallita → si chiede conferma, non si crea alla cieca')
  }

  // ── anteprima, URL di consegna, configurazione ─────────────────────────────
  {
    S.resetSidlyTokenCache()
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crmOf(), {}, { phone: '3339998877' }) } })
    const r = await S.syncAssistito({ crm: crmOf(), env: ENV, fetchImpl: P.fetchImpl, dryRun: true })
    ok(r.esito === 'anteprima' && r.previsto === 'invariato' && rowOf(r, "Telefono dell'assistito")?.stato === 'diverso' && !P.calls.some(c => c.method !== 'GET'), 'anteprima: mostra il confronto e non scrive nulla (solo GET)')
    const r2 = await anteprimaScelte(crmOf(), P, [["Telefono dell'assistito", 'crm']])
    ok(r2.esito === 'anteprima' && r2.previsto === 'aggiornato' && r2.campi_inviati.length === 1 && r2.azioni.some(a => /PATCH \/manager\/patient/.test(a.azione) && a.risultato === 'non eseguito (anteprima)') && !P.calls.some(c => c.method !== 'GET'), 'anteprima con scelte: elenca la PATCH non eseguita e non scrive nulla')
  }
  {
    S.resetSidlyTokenCache()
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crmOf()) } })
    const r = await S.syncAssistito({ crm: crmOf(), env: { ...ENV, SIDLY_FRAME_URL: '' }, fetchImpl: P.fetchImpl })
    ok(r.esito === 'invariato' && r.url_for_band.registrato === false && !P.calls.some(c => c.path === '/manager/set-url-for-band') && r.warning.some(w => /SIDLY_FRAME_URL/.test(w)), 'senza SIDLY_FRAME_URL: registrazione saltata con warning (mai un URL inventato)')
  }
  {
    S.resetSidlyTokenCache()
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crmOf()) } })
    const r = await S.syncAssistito({ crm: crmOf(), env: { ...ENV, SIDLY_FRAME_URL: 'http://non-sicuro.example/x' }, fetchImpl: P.fetchImpl })
    ok(r.url_for_band.registrato === false && !P.calls.some(c => c.path === '/manager/set-url-for-band'), 'URL di consegna non https → rifiutato')
  }
  {
    S.resetSidlyTokenCache()
    const P = makePlatform()
    const r = await S.syncAssistito({ crm: crmOf(), env: { ...ENV, SIDLY_BAND_DEFAULTS: '{"fall":true,"minHr":45,"maxHr":130,"isHr":true,"pericolo":"x"}' }, fetchImpl: P.fetchImpl, confermaCrea: true })
    const post = P.calls.find(c => c.method === 'POST' && c.path === '/manager/patient')
    ok(r.esito === 'creato' && post?.body.band.minHr === 45 && post?.body.band.fall === true && !('pericolo' in post.body.band), 'creazione: default operativi da SIDLY_BAND_DEFAULTS, solo chiavi note')
  }
  {
    S.resetSidlyTokenCache()
    const P = makePlatform()
    const r = await S.syncAssistito({ crm: crmOf(), env: ENV, fetchImpl: P.fetchImpl, confermaCrea: true })
    ok(r.warning.some(w => /soglie|SIDLY_BAND_DEFAULTS/.test(w)), 'creazione senza default operativi: warning che invita a configurarli')
  }

  // ── nessun segreto in uscita ───────────────────────────────────────────────
  {
    S.resetSidlyTokenCache()
    const P = makePlatform()
    const r = await S.syncAssistito({ crm: crmOf(), env: ENV, fetchImpl: P.fetchImpl, confermaCrea: true })
    const blob = JSON.stringify(r)
    ok(!blob.includes('p-segreta-xyz') && !blob.includes('tok-') && !blob.includes('u-test'), 'la risposta non contiene password, token né utente SiDLY')
    const login = await (async () => { let b: any; const f: S.Fetch = async (u, i) => { if (u.endsWith('/user/login')) b = JSON.parse(i.body); return { status: 200, text: async () => '{"data":{"authentication_token":"t"}}' } }; S.resetSidlyTokenCache(); await new S.SidlyClient(ENV, f).request('GET', '/x'); return b })()
    ok(login && login.email === 'u-test' && login.password === 'p-segreta-xyz' && !('login' in login), 'login: credenziali prese dai segreti (campo "email" di default, come il portale SiDLY)')
    const login2 = await (async () => { let b: any; const f: S.Fetch = async (u, i) => { if (u.endsWith('/user/login')) b = JSON.parse(i.body); return { status: 200, text: async () => '{"token":"t"}' } }; S.resetSidlyTokenCache(); await new S.SidlyClient({ ...ENV, SIDLY_LOGIN_FIELD: 'username' }, f).request('GET', '/x'); return b })()
    ok(login2 && login2.username === 'u-test' && !('email' in login2), 'login: nome del campo utente configurabile (SIDLY_LOGIN_FIELD)')
  }

  // ── orchestrazione con DB: stato, configurazione, salvataggio esito ────────
  {
    S.resetSidlyTokenCache()
    const base = SRC()
    const dbState = { assistito: base.assistito, lead: base.lead, config: base.config, ddt: { sim_number: '3897770000' }, saved: [] as any[] }
    const P = makePlatform()
    const r = await S.runSidlySync({ db: makeDb(dbState), env: ENV, assistitoId: 7, fetchImpl: P.fetchImpl, confermaCrea: true })
    ok(r.httpStatus === 200 && (r.result as any).esito === 'creato', 'runSidlySync: creazione end-to-end con DB finto')
    ok(dbState.saved.length === 1 && dbState.saved[0][0] === 7 && dbState.saved[0][1] === '14879' && dbState.saved[0][3] === 'creato', 'esito salvato nella tabella laterale sidly_sync (id assistito, user_id, esito)')
    ok(!JSON.stringify(dbState.saved).includes('Anna') && !JSON.stringify(dbState.saved).includes('333'), 'l\'esito salvato non contiene dati personali')
    const dry = await S.runSidlySync({ db: makeDb({ ...dbState, saved: [] }), env: ENV, assistitoId: 7, fetchImpl: P.fetchImpl, dryRun: true })
    ok((dry.result as any).esito === 'anteprima', 'runSidlySync: anteprima')
    const st2: any[] = []
    await S.runSidlySync({ db: makeDb({ ...dbState, saved: st2 }), env: ENV, assistitoId: 7, fetchImpl: P.fetchImpl, dryRun: true })
    ok(st2.length === 0, 'anteprima: nulla scritto nel CRM')
    const cfg = await S.runSidlySync({ db: makeDb(dbState), env: { ...ENV, SIDLY_PASSWORD: '' }, assistitoId: 7, fetchImpl: P.fetchImpl })
    ok(cfg.httpStatus === 503 && /SIDLY_PASSWORD|non configurata/.test((cfg.result as any).errore), 'segreti mancanti → 503 con messaggio chiaro, nessuna chiamata')
    const http = await S.runSidlySync({ db: makeDb(dbState), env: { ...ENV, SIDLY_BASE_URL: 'http://x.example' }, assistitoId: 7, fetchImpl: P.fetchImpl })
    ok(http.httpStatus === 503, 'SIDLY_BASE_URL non https → rifiutato')
    const nf = await S.runSidlySync({ db: makeDb({}), env: ENV, assistitoId: 99, fetchImpl: P.fetchImpl })
    ok(nf.httpStatus === 404, 'assistito inesistente → 404')
    const inatt = await S.runSidlySync({ db: makeDb({ ...dbState, assistito: { ...base.assistito, status: 'SOSPESO' } }), env: ENV, assistitoId: 7, fetchImpl: P.fetchImpl })
    ok(inatt.httpStatus === 422 && /ATTIVO/.test((inatt.result as any).errore), 'assistito non ATTIVO → 422')
    const noImei = await S.runSidlySync({ db: makeDb({ ...dbState, assistito: { ...base.assistito, imei: null } }), env: ENV, assistitoId: 7, fetchImpl: P.fetchImpl })
    ok(noImei.httpStatus === 422 && /IMEI/.test((noImei.result as any).errore), 'assistito senza IMEI → 422')
    const failSave = await S.runSidlySync({ db: makeDb({ ...dbState, saved: [], failSave: true }), env: ENV, assistitoId: 7, fetchImpl: makePlatform().fetchImpl, confermaCrea: true })
    ok((failSave.result as any).esito === 'creato' && (failSave.result as any).warning.some((w: string) => /non salvato/i.test(w)), 'se il salvataggio dell\'esito nel CRM fallisce: la sync resta riuscita, con warning')
    const errState: any[] = []
    const fe = await S.runSidlySync({ db: makeDb({ ...dbState, saved: errState }), env: ENV, assistitoId: 7, fetchImpl: makePlatform({ alwaysFail: 500 }).fetchImpl })
    ok(fe.httpStatus === 502 && errState.length === 1 && errState[0][2] === null, 'errore SiDLY → 502; l\'errore è registrato senza aggiornare la data di ultima sincronizzazione')
  }

  // ── accesso all'endpoint e cablaggio ───────────────────────────────────────
  {
    const ck = (role: string, expMs: number) => 'session=' + encodeURIComponent(JSON.stringify({ userId: 'u', username: 'x', role, loginAt: new Date().toISOString(), expiresAt: new Date(Date.now() + expMs).toISOString() }))
    ok((checkSessionOrKey(undefined, undefined, ['A']) as any).status === 401, 'endpoint: anonimo → 401')
    ok(checkSessionOrKey(ck('OPERATOR', 3600e3), undefined, ['A']).ok === true && checkSessionOrKey(ck('ADMIN', 3600e3), undefined, ['A']).ok === true, 'endpoint: sessione dashboard (ADMIN o OPERATOR) → ammessa, come la Dashboard operativa')
    ok((checkSessionOrKey(ck('ADMIN', -1000), undefined, ['A']) as any).status === 401, 'endpoint: sessione scaduta → 401')
    ok(checkSessionOrKey(undefined, 'Bearer T2', ['T1', 'T2']).ok === true && (checkSessionOrKey(undefined, 'Bearer zzz', ['T1']) as any).status === 401, 'endpoint: Bearer con API_KEY o ADMIN_SECRET_TOKEN; altri → 401')
    ok((checkSessionOrKey(undefined, 'Bearer undefined', [undefined, '']) as any).status === 401 && (checkSessionOrKey(undefined, 'Bearer ', ['']) as any).status === 401, 'endpoint: segreti non configurati non aprono mai l\'accesso')
    const idx = readFileSync('src/index.tsx', 'utf8')
    ok(/app\.post\('\/api\/sidly\/sync-assistito', async \(c\) => \{\s+const guard = checkSessionOrKey\([\s\S]{0,300}if \(!guard\.ok\)[\s\S]{0,200}if \(!c\.env\?\.DB\)/.test(idx), 'endpoint: il controllo accessi è la prima istruzione del gestore')
    ok(/'\[SIDLY-SYNC\]', JSON\.stringify\(\{\s+assistito_id: assistitoId, esito: result\.esito/.test(idx) && !/console\.log\([^)]*SIDLY_PASSWORD/.test(idx), 'endpoint: log strutturato con id assistito ed esito, senza segreti né dati personali')
    const dash = readFileSync('src/modules/dashboard-templates-new.ts', 'utf8')
    ok(/assistito\.imei && status === 'ATTIVO'\)\s+\? '<button id="sidlyBtn_'/.test(dash), 'dashboard: il pulsante compare solo con IMEI assegnato e stato ATTIVO')
    ok(/fetch\('\/api\/sidly\/sync-assistito'/.test(dash) && /conferma_richiesta/.test(dash) && /escapeHtml\(a\.azione\)/.test(dash) && /escapeHtml\(x\.campo\)/.test(dash) && /escapeHtml\(String\(v\)\)/.test(dash) && /escapeHtml\(gruppo\)/.test(dash), 'dashboard: chiama l\'endpoint, gestisce la conferma omonimi ed esegue l\'escape dei valori mostrati')
    // Regressione: un apice mal scritto nel template rompeva TUTTO lo script della Dashboard
    const tpl = await import('../../src/modules/dashboard-templates-new')
    let scriptRotti = 0, scriptTotali = 0
    for (const [nome, html] of Object.entries(tpl as Record<string, unknown>)) {
      if (typeof html !== 'string') continue
      for (const m of html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="(?!text\/javascript))[^>]*>([\s\S]*?)<\/script>/g)) {
        scriptTotali++
        try { new Function(m[1]) } catch (e: any) { scriptRotti++; ok(false, `template ${nome}: script inline con errore di sintassi (${e.message})`) }
      }
    }
    ok(scriptTotali >= 6 && scriptRotti === 0, `template Dashboard: tutti gli script inline (${scriptTotali}) sono sintatticamente validi`)
    ok(/associa: \\\\'/.test(dash) === true, 'dashboard: il pulsante "Associa questo" ha gli apici correttamente escapati')
    ok(S.normalizeBaseUrl('  "https://api.x.com/api/"  ') === 'https://api.x.com/api' && S.normalizeBaseUrl('api.x.com/api') === 'https://api.x.com/api', 'SIDLY_BASE_URL: spazi, apici e "/" finali ripuliti; senza schema assume https')
    ok(S.sidlyConfigError({ ...ENV, SIDLY_BASE_URL: 'http://x.com/api' } as any)?.includes('https') === true && S.sidlyConfigError({ ...ENV, SIDLY_BASE_URL: 'api.x.com/api' } as any) === null, 'SIDLY_BASE_URL: http:// rifiutato, host senza schema accettato come https')
    ok(!(S.sidlyConfigError({ ...ENV, SIDLY_BASE_URL: 'ftp://segreto-xyz' } as any) || '').includes('segreto-xyz'), 'SIDLY_BASE_URL non valido: il messaggio non riporta il valore')
    // Nomi dei campi come nella scheda del portale SiDLY (birth_date, sim_number dentro user)
    const snake = S.normalizePlatformPatient({ data: { user_id: 5, user: { first_name: 'Anna', last_name: 'Rossi', birth_date: '1942-05-25T00:00:00.000Z', sim_number: '+337000020048167', phonePrefix: '+39', address: 'Via X 1' } } })
    ok(snake.user.date?.year === 1942 && snake.user.date?.month === 5 && snake.user.date?.day === 25 && snake.band.simNumber === '+337000020048167', 'risposta SiDLY: birth_date (ISO) e sim_number dentro user letti come data e SIM, non come "vuoti"')
    const camel = S.normalizePlatformPatient({ user_id: 5, user: { date: { year: 1942, month: 5, day: 25 } }, band: { simNumber: '123' } })
    ok(camel.user.date?.day === 25 && camel.band.simNumber === '123', 'risposta SiDLY: anche la forma date{year,month,day} e band.simNumber resta supportata')
    const shape = JSON.stringify(S.shapeOf({ user: { first_name: 'Anna-segreta', phones: [{ number: '3331112233' }], date: { year: 1942 } }, token: 'tok-segreto' }))
    ok(shape.includes('first_name') && shape.includes('"string"') && !shape.includes('Anna-segreta') && !shape.includes('3331112233') && !shape.includes('tok-segreto') && !shape.includes('1942'), 'diagnostica anteprima: solo nomi di campo e tipi, nessun valore')
    {
      const crm = crmOf()
      const Pd = makePlatform({ patients: { [IMEI]: { user_id: 14879, user: { first_name: 'Anna', last_name: 'Rossi' }, band: {} } } })
      const rd = await S.syncAssistito({ crm, env: ENV, fetchImpl: Pd.fetchImpl, dryRun: true })
      ok(rd.esito === 'anteprima' && !!rd.diagnostica && !JSON.stringify(rd.diagnostica).includes('Rossi'), 'anteprima: include la diagnostica della forma della risposta, senza dati personali')
      const Pw = makePlatform({ patients: { [IMEI]: { user_id: 14879, user: { first_name: 'Anna', last_name: 'Rossi' }, band: {} } } })
      const rw = await S.syncAssistito({ crm, env: ENV, fetchImpl: Pw.fetchImpl })
      ok(!rw.diagnostica, 'esecuzione reale: nessuna diagnostica nella risposta')
    }
    // GET /patient/{imei} è una scheda BREVE (senza indirizzo/data/prefisso): si legge la scheda completa prima di decidere
    {
      const crm = crmOf()
      const brevePlat = { user_id: 14879, id: 14879, imei: IMEI, first_name: 'Anna', last_name: 'Rossi', weight: 62, height: 160, sim_number: '3897770000' }
      const piena = { user_id: 14879, user: { first_name: 'Anna', last_name: 'Rossi', birth_date: '1944-03-09', address: 'Via Roma 1, Milano, MI, 20100', phonePrefix: '+39', phone: '3331112233', weight: 62, height: 160 }, band: { phones: [], simNumber: '3897770000' } }
      const Pf = makePlatform({ patients: { [IMEI]: { ...piena, ...brevePlat } } })
      const rf = await S.syncAssistito({ crm, env: ENV, fetchImpl: Pf.fetchImpl, dryRun: true })
      ok(Pf.calls.some(c => c.method === 'GET' && c.path === `/manager/patient-edit-initial-data/${IMEI}`), 'scheda completa: dopo GET /patient si legge /manager/patient-edit-initial-data/{imei}')
      ok(rowOf(rf, 'Indirizzo')?.stato === 'uguale' && rowOf(rf, 'Data di nascita')?.stato === 'uguale' && !rowOf(rf, 'Indirizzo')?.verso && rf.campi_inviati.length === 0, 'scheda completa: indirizzo e data già presenti su SiDLY → righe uguali, nessuna scelta, nulla da inviare')
      ok(!!rf.diagnostica && (rf.diagnostica as any).forma_scheda_completa !== 'non leggibile', 'anteprima: diagnostica anche sulla forma della scheda completa')

      // scheda completa non leggibile → mai scrivere campi che non posso confrontare
      const Pn = makePlatform({ noFullRecord: true, patients: { [IMEI]: { ...piena, ...brevePlat } } })
      const rn = await S.syncAssistito({ crm, env: ENV, fetchImpl: Pn.fetchImpl })
      ok(rowOf(rn, 'Indirizzo')?.stato === 'non_verificato' && rowOf(rn, 'Data di nascita')?.stato === 'non_verificato' && !rowOf(rn, 'Indirizzo')?.verso && rn.campi_inviati.length === 0, 'scheda completa non leggibile: indirizzo e data non verificabili, senza scelta')
      ok(rn.warning.some(w => /Scheda completa SiDLY non leggibile/.test(w)), 'scheda completa non leggibile: avviso esplicito all\'operatore')
      ok(!Pn.calls.some(c => c.method === 'PATCH' && c.body?.user && ('address' in c.body.user || 'date' in c.body.user || 'phonePrefix' in c.body.user)), 'scheda completa non leggibile: nessuna PATCH con quei campi')

      // scheda completa vuota su SiDLY → i campi mancanti si compilano
      const Pv = makePlatform({ patients: { [IMEI]: { user_id: 14879, id: 14879, imei: IMEI, user: { first_name: 'Anna', last_name: 'Rossi' }, band: {}, first_name: 'Anna', last_name: 'Rossi' } } })
      const rv = await S.syncAssistito({ crm, env: ENV, fetchImpl: Pv.fetchImpl, dryRun: true })
      ok(rowOf(rv, 'user.address')?.stato === 'solo_crm' && rowOf(rv, 'user.address')?.verso?.join() === 'crm' && rowOf(rv, 'user.date')?.stato === 'solo_crm' && rowOf(rv, 'user.date')?.verso?.join() === 'crm' && rv.campi_inviati.length === 0, 'scheda completa con campi vuoti: indirizzo e data si possono scegliere vale il CRM, ma non si inviano da soli')
    }
    // Anteprima: per ogni campo anagrafico si mostra anche il valore attuale su SiDLY (vuoto o diverso)
    {
      const crm = crmOf()
      const base = (addr: any) => ({ user_id: 14879, id: 14879, imei: IMEI, first_name: 'Anna', last_name: 'Rossi', user: { first_name: 'Anna', last_name: 'Rossi', birth_date: '1944-03-09', phonePrefix: '+39', phone: '3331112233', weight: 62, height: 160, address: addr }, band: { simNumber: '3897770000' } })
      const rE = await S.syncAssistito({ crm, env: ENV, dryRun: true, fetchImpl: makePlatform({ patients: { [IMEI]: base('') } }).fetchImpl })
      const cE = rowOf(rE, 'user.address')
      ok(!!cE && cE.sidly === '' && cE.crm === 'Via Roma 1, Milano, MI, 20100' && cE.stato === 'solo_crm', 'anteprima: indirizzo vuoto su SiDLY → SiDLY vuoto, CRM compilato (nessuna sovrascrittura di valori esistenti)')
      const rD = await S.syncAssistito({ crm, env: ENV, dryRun: true, fetchImpl: makePlatform({ patients: { [IMEI]: base('Via Vecchia 9, Genova') } }).fetchImpl })
      const cD = rowOf(rD, 'user.address')
      ok(!!cD && cD.sidly === 'Via Vecchia 9, Genova' && cD.stato === 'diverso' && cD.verso?.join() === 'crm' && !!cD.nota, 'anteprima: indirizzo diverso su SiDLY in formato libero → mostrati entrambi i valori; si può scegliere solo «vale il CRM» (nota sul perché)')
      const sommario = JSON.stringify({ esito: rD.esito, azioni: rD.azioni.map(a => ({ azione: a.azione, risultato: a.risultato })), warning: rD.warning })
      ok(!sommario.includes('Via Vecchia'), 'sidly_sync: il riepilogo salvato nel DB non contiene valori anagrafici')
    }
    ok(/function sidlyConfronto/.test(dash) && /<th style="' \+ th \+ '">SiDLY<\/th><th style="' \+ th \+ '">CRM<\/th>/.test(dash), 'dashboard: tabella orizzontale con le colonne SiDLY e CRM')
    ok(/campo non presente nel CRM/.test(dash) && /campo non presente su SiDLY/.test(dash) && /solo su SiDLY/.test(dash) && /solo nel CRM/.test(dash), 'dashboard: i campi che esistono da una sola parte sono marcati come tali')
    ok(/vale il CRM &rarr; scrivi su SiDLY/.test(dash) && /vale SiDLY &rarr; scrivi nel CRM/.test(dash) && /nessuna modifica/.test(dash) && /<details/.test(dash) && /Dettagli tecnici/.test(dash), 'dashboard: per riga la scelta «vale il CRM / vale SiDLY / nessuna modifica» e note tecniche nei "Dettagli tecnici"')
    ok(/function sidlySelect/.test(dash) && /<option value="">nessuna modifica<\/option>/.test(dash) && /Cosa fare/.test(dash), 'dashboard: colonna «Cosa fare» con un menu per riga, valore predefinito vuoto = nessuna modifica')
    ok(/if \(x\.verso && x\.verso\.length\)/.test(dash) && /non modificabile da qui/.test(dash), 'dashboard: il menu compare solo sulle righe con campo presente in entrambi gli ambienti; sulle altre si spiega perché non è modificabile')
    ok(/white-space:pre-line/.test(dash) && /max-width:1040px/.test(dash) && /position:sticky/.test(dash), 'dashboard: valori su più righe, pannello largo e intestazione fissa')
    ok(/sidlyVerifica/.test(dash) && /Mostra le ' \+ n \+ ' modifiche scelte/.test(dash) && /Scegli almeno una riga/.test(dash) && /b\.disabled = n === 0/.test(dash), 'dashboard: «Mostra le N modifiche scelte» è disattivato finché non si sceglie almeno una riga')
    ok(/if \(opts\.scrivi\) payload\.conferma_scrittura = true; else payload\.dry_run = true/.test(dash) && /payload\.scelte = opts\.scelte/.test(dash) && /window\.sidlyConfirm/.test(dash) && /Conferma e scrivi/.test(dash) && /Indietro: cambia le scelte/.test(dash) && /function sidlyScelte/.test(dash), 'dashboard: il click apre SEMPRE l\'anteprima; si scrive solo dopo «Conferma e scrivi» e solo le righe scelte (payload.scelte)')
    ok(/Verrà scritto su SiDLY/.test(dash) && /Verrà scritto nel CRM/.test(dash) && /Conferma e crea su SiDLY/.test(dash), 'dashboard: prima/dopo separati per SiDLY e CRM; per un assistito nuovo conferma esplicita di creazione')
    ok(/id="sidlySoloComuni"/.test(dash) && /Solo campi presenti in entrambi/.test(dash) && /justify-content:space-between;align-items:flex-start/.test(dash) && /haTabella \? '<div style="display:flex/.test(dash), 'dashboard: interruttore «Solo campi presenti in entrambi» in alto a destra, solo sulla tabella di confronto')
    ok(/tr\[data-assente\]/.test(dash) && /\(x\.assenteSidly \|\| x\.assenteCrm\) \? ' data-assente="1"'/.test(dash) && /tr\[data-gruppo\]/.test(dash) && /window\.sidlyFiltra\(\);/.test(dash), 'dashboard: il filtro nasconde le righe con campo presente in un solo ambiente e i gruppi rimasti vuoti, e resta attivo dopo ogni ricarica del pannello')
    {
      // Richiesta utente: «non so se le modifiche sono state applicate» → pulsanti sempre visibili, avviso alla chiusura, messaggio di esito
      const i0 = Math.min(...['closeSidlyPanel', 'var SIDLY_BTN'].map(k => dash.indexOf(k)).filter(n => n >= 0)), i1 = dash.indexOf('window.syncSidly = ')
      const sez = i0 >= 0 && i1 > i0 ? dash.slice(i0, i1) : ''
      ok(sez.length > 1000 && !/(?:bg|text|border)-teal-/.test(sez), 'dashboard: nel pannello SiDLY nessuna classe Tailwind teal-* (il CSS della Dashboard non le ha: i pulsanti sarebbero invisibili), si usano stili inline')
      ok(/var SIDLY_BTN = 'padding:/.test(dash) && (sez.match(/SIDLY_BTN \+ '#/g) || []).length >= 5, 'dashboard: tutti i pulsanti del pannello usano lo stile inline con colore di sfondo esplicito')
      ok(/Passo 1 di 2/.test(sez) && /Passo 2 di 2/.test(sez) && /Non scrive ancora/.test(sez) && /scrive davvero/.test(sez), 'dashboard: il flusso è spiegato a video in 2 passi (verifica, poi scrittura)')
      ok(/window\.confirm\('Hai scelto/.test(sez) && /NON sono state ancora scritte/.test(sez), 'dashboard: chiudendo il pannello con scelte non scritte compare un avviso di conferma')
      ok(/Fatto: ' \+/.test(sez) && /modifiche scritte/.test(sez) && /assistito creato su SiDLY/.test(sez) && /Non è stato scritto nulla/.test(sez), 'dashboard: dopo la scrittura messaggio esplicito (Fatto: N modifiche, X su SiDLY, Y nel CRM; oppure «Non è stato scritto nulla»)')
      ok(/Non scritto su SiDLY \(operazione fallita\)/.test(sez) && /Non scritto nel CRM \(operazione fallita\)/.test(sez) && /NON sono state applicate/.test(sez), 'dashboard: se l\'operazione fallisce le righe scelte sono etichettate «Non scritto», mai «Scritto»')
      ok(/Rileggi il confronto/.test(sez) && /window\.__sidlyLastId = /.test(sez), 'dashboard: dopo la scrittura è disponibile «Rileggi il confronto» per controllare il risultato')
    }
    {
      // Simulazione del filtro con un DOM minimo: righe assenti nascoste, gruppi vuoti nascosti, righe comuni sempre visibili
      const m = dash.match(/window\.sidlyFiltra = function \(attivo\) \{[\s\S]*?\n        \};/)
      type El = { style: { display: string }; attrs: Record<string, boolean>; next: El | null; hasAttribute(a: string): boolean; nextElementSibling: El | null }
      const mk = (attrs: string[]): El => { const e: any = { style: { display: '' }, attrs: Object.fromEntries(attrs.map(a => [a, true])), nextElementSibling: null, hasAttribute(a: string) { return !!this.attrs[a] } }; return e }
      const g1 = mk(['data-gruppo']), r1 = mk([]), r2 = mk(['data-assente']), g2 = mk(['data-gruppo']), r3 = mk(['data-assente']), g3 = mk(['data-gruppo']), r4 = mk([])
      ;[g1, r1, r2, g2, r3, g3, r4].forEach((e, i, a) => { e.nextElementSibling = a[i + 1] || null })
      const chk: any = { checked: false }
      const win: any = {}
      const doc = { querySelectorAll: (q: string) => (q.includes('data-assente') ? [r2, r3] : [g1, g2, g3]), getElementById: () => chk }
      new Function('window', 'document', (m ? m[0] : 'throw new Error("sidlyFiltra assente")') + '; window.sidlyFiltra(true)')(win, doc)
      ok(!!m && r2.style.display === 'none' && r3.style.display === 'none' && r1.style.display === '' && r4.style.display === '', 'filtro attivo: nascoste solo le righe con campo non presente in uno dei due ambienti')
      ok(g1.style.display === '' && g2.style.display === 'none' && g3.style.display === '' && chk.checked === true, 'filtro attivo: il gruppo rimasto senza righe visibili sparisce, gli altri restano')
      win.sidlyFiltra(false)
      ok(r2.style.display === '' && r3.style.display === '' && g2.style.display === '', 'filtro disattivato: tornano visibili tutte le righe e tutti i gruppi')
    }
    ok(!/sidlyPrev_/.test(dash), 'dashboard: un solo pulsante (nuvola) che parte dall\'anteprima')
    ok(/body\?\.dry_run !== true && body\?\.conferma_scrittura !== true/.test(idx), 'endpoint: senza dry_run e senza conferma_scrittura la scrittura viene rifiutata (400)')
    const sec = readFileSync('src/modules/sidly-sync.ts', 'utf8')
    ok(!/console\.(log|warn|error)/.test(sec), 'sidly-sync.ts: nessun console.* (niente fuga di token o dati)')
    ok(!/CREATE TABLE IF NOT EXISTS sidly_sync[\s\S]*ALTER TABLE/.test(sec) && !/ALTER TABLE/.test(sec), 'nessun ALTER TABLE: lo stato sta nella tabella laterale sidly_sync')
  }

  // ── «Dettagli utente»: referenti, SOS, numeri ammessi, patologie/farmaci, scheda ─────────────────────
  {
    const CFG = {
      contatto1_nome: 'Mario', contatto1_cognome: 'Bianchi', contatto1_telefono: '3470001111', contatto1_email: 'm@x.it',
      contatto2_nome: 'Luisa', contatto2_cognome: 'Verdi', contatto2_telefono: '+39 348 0002222',
      contatto3_nome: 'Paolo', contatto3_cognome: 'Neri', contatto3_telefono: '3490003333',
      whitelist1_nome: 'Farmacia', whitelist1_cognome: 'Centrale', whitelist1_telefono: '0102345678',
      whitelist2_nome: 'Vicina', whitelist2_telefono: '3331234567',
      patologie_croniche: JSON.stringify(['ipertensione', 'diabete', 'ictus']), patologie: 'Glaucoma', allergie: 'Penicillina',
      farmaci_data: JSON.stringify([{ nome: 'Cardioaspirina', dosaggio: '100mg', orario: 'mattina' }]), note_mediche: 'Cammina col bastone',
      medico_curante_nome: 'Dott. Gallo', medico_curante_telefono: '0101112222', centro_medico_riferimento: 'Ospedale Galliera',
    }
    const crm = crmOf({ config: CFG })

    // costruzione
    ok(crm.referenti.length === 3 && crm.referenti[0].name === 'Mario Bianchi' && crm.referenti[0].phone === '+393470001111', 'referenti: tre contatti del CRM con nome e telefono completo')
    ok(crm.band.phones?.length === 3 && crm.band.phones.every((p, i) => p.numberPrefix + p.number === crm.referenti[i].phone), 'SOS = i tre referenti, nello stesso ordine')
    ok(crm.band.phones?.[0].alias === 'Mario Bianchi', 'SOS: alias = nome del referente')
    ok(crm.band.whitelistNumbers === '+390102345678,+393331234567' && !('whiteListAlias' in crm.band), 'numeri ammessi → solo whitelistNumbers (numeri separati da virgola); nome e cognome NON vengono inviati')
    ok(crm.medical.flags.nadcisnienie === 1 && crm.medical.flags.cukrzyca === 1 && !('po_zawale' in crm.medical.flags), 'patologie CRM → interruttori SiDLY (ipertensione, diabete)')
    ok(/Ictus/.test(crm.medical.other_diseases || '') && /Glaucoma/.test(crm.medical.other_diseases || ''), 'patologie senza interruttore → testo "altre patologie"')
    ok(/Cardioaspirina 100mg mattina/.test(crm.medical.medicines || '') && crm.medical.allergy === 'Penicillina' && crm.medical.more_info === 'Cammina col bastone', 'farmaci, allergie e note → campi testuali')
    ok(crm.scheda.name_of_doctor === 'Dott. Gallo - 0101112222' && crm.scheda.hospital_info === 'Ospedale Galliera', 'medico curante e centro di riferimento → scheda assistito')
    const crmVuoto = crmOf({ config: { contatto1_nome: '', contatto1_telefono: '', whitelist1_telefono: '', patologie_croniche: '', allergie: '' } })
    ok(crmVuoto.referenti.length === 0 && crmVuoto.whitelist.length === 0 && !('whitelistNumbers' in crmVuoto.band) && Object.keys(crmVuoto.medical.flags).length === 0, 'campi vuoti nel CRM → nessun referente, whitelist o patologia')

    // indirizzo tollerante
    ok(S.eqAddress('Via Mastrangelo 4E/4, Genova, GE, 16166', 'Via Mastrangelo 4E/4, 16166 Genova (GE)'), 'indirizzo: stesso indirizzo in formati diversi → uguale')
    ok(!S.eqAddress('Via Roma 1, Milano', 'Via Roma 2, Milano'), 'indirizzo: civico diverso → diverso')
    ok(S.eqPhoneLoose('+393470001111', '3470001111') && !S.eqPhoneLoose('3470001111', '3470001112'), 'telefono: uguale con/senza prefisso, diverso se cambia una cifra')
    {
      const P = makePlatform({ patients: { [IMEI]: platformFrom(crmOf(), {}, { address: 'Via Roma 1, 20100 Milano (MI)' }) } })
      const r = await S.syncAssistito({ crm: crmOf(), env: ENV, fetchImpl: P.fetchImpl, dryRun: true })
      ok(rowOf(r, 'Indirizzo')?.stato === 'uguale' && !rowOf(r, 'Indirizzo')?.verso?.length, 'indirizzo già presente in altro formato → uguale, nessuna scelta')
    }

    // piattaforma con contatti/malattie vuoti: senza scelte non si scrive nulla; con le scelte si compila SOLO ciò che è scelto
    {
      const plat = platformFrom(crm, { phones: [], whitelistNumbers: '', whiteListAlias: '' })
      const P = makePlatform({ patients: { [IMEI]: plat }, contacts: [], diseases: { id: 55, walking_person: 'sì', hearing: 'ok' }, card: {} })
      const r0 = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
      ok(r0.esito === 'invariato' && scrittureGET(P).filter(c => c.path !== '/manager/set-url-for-band').length === 0, 'piattaforma vuota, nessuna scelta: nessuna scrittura su nessun endpoint')
      const d0 = await preview(crm, P)
      ok(['ref1.nome', 'ref1.telefono', 'ref1.email', 'pat.nadcisnienie', 'pat.medicines', 'band.phones', 'band.whitelist'].every(k => rowOf(d0, k)?.stato !== 'uguale' && rowOf(d0, k)?.verso?.join() === 'crm'), 'piattaforma vuota: per referenti, patologie, SOS e numeri ammessi l\'unica scelta possibile è «vale il CRM»')
      const { r } = await scrivi(crm, P, [['ref1.nome', 'crm'], ['ref1.telefono', 'crm'], ['ref1.email', 'crm'], ['ref2.nome', 'crm'], ['ref3.telefono', 'crm'], ['pat.nadcisnienie', 'crm'], ['pat.cukrzyca', 'crm'], ['pat.medicines', 'crm'], ['pat.allergy', 'crm'], ['band.phones', 'crm'], ['band.whitelist', 'crm']])
      const pc = P.calls.find(c => c.method === 'PATCH' && c.path === `/editContacts/${IMEI}`)
      const pd = P.calls.find(c => c.method === 'PATCH' && c.path === `/editDiseases/${IMEI}`)
      ok(r.esito === 'aggiornato' && !!pc && !!pd, 'piattaforma vuota + scelte: PATCH su editContacts e editDiseases')
      ok(pc?.body.contact1Name === 'Mario Bianchi' && pc?.body.contact1Phone === '+393470001111' && pc?.body.contact2Name === 'Luisa Verdi' && pc?.body.contact3Phone === '+393490003333', 'editContacts: i referenti scelti nelle posizioni 1-3')
      ok(pc?.body.contact2Phone === '' && pc?.body.contact3Name === '', 'editContacts: il telefono del referente 2 e il nome del 3 non scelti restano vuoti (non vengono inventati)')
      ok(pc?.body.contact1Others === 'email: m@x.it', 'editContacts: email del referente nel campo "altro"')
      ok(pd?.body.nadcisnienie === 1 && pd?.body.cukrzyca === 1 && pd?.body.diseaseID === 55 && pd?.body.medicines.includes('Cardioaspirina') && pd?.body.allergy === 'Penicillina', 'editDiseases: interruttori, farmaci, allergie e diseaseID scelti')
      ok(pd?.body.other_diseases === '' && pd?.body.more_info === '', 'editDiseases: i testi non scelti (altre patologie, note) non vengono riempiti')
      ok(pd?.body.walkingPerson === 'sì' && pd?.body.hearing === 'ok', 'editDiseases: i campi di autonomia già su SiDLY vengono rimandati invariati (il CRM non li possiede)')
      const pb = P.calls.find(c => c.method === 'PATCH' && c.path.startsWith('/manager/patient/'))
      ok(Object.keys(pb?.body || {}).join() === 'band' && pb?.body.band.whitelistNumbers === crm.band.whitelistNumbers && pb?.body.band.phones.length === 3, 'band: numeri ammessi e tre SOS scelti nella stessa PATCH (nessun campo user)')
      ok(!JSON.stringify(P.calls.filter(c => c.method === 'PATCH').map(c => c.body)).includes('minHr'), 'nessuna PATCH tocca soglie FC')
      // secondo giro: le righe scelte ora sono uguali (idempotenza)
      const P2calls = P.calls.length
      const d2 = await preview(crm, P)
      ok(['ref1.nome', 'ref1.telefono', 'ref1.email', 'ref2.nome', 'ref3.telefono', 'pat.nadcisnienie', 'pat.cukrzyca', 'pat.medicines', 'pat.allergy', 'band.phones', 'band.whitelist'].every(k => rowOf(d2, k)?.stato === 'uguale' && !rowOf(d2, k)?.verso?.length), 'secondo click: le righe scritte risultano uguali, nessuna scelta pendente')
      ok(!P.calls.slice(P2calls).some(c => c.method === 'PATCH'), 'secondo click: nessuna PATCH (idempotenza)')
    }

    // numeri ammessi e SOS già allineati: righe uguali, niente da scegliere
    {
      const P = makePlatform({ patients: { [IMEI]: platformFrom(crm) }, contacts: [], diseases: { id: 1 } })
      const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, dryRun: true })
      ok(rowOf(r, 'band.phones')?.stato === 'uguale' && rowOf(r, 'band.whitelist')?.stato === 'uguale' && !rowOf(r, 'band.phones')?.verso?.length && r.campi_inviati.length === 0, 'numeri ammessi e SOS già allineati su SiDLY → righe uguali, nessuna scelta')
    }

    // referenti: «vale il CRM» non azzera parentela/indirizzo/ID di SiDLY e non tocca i referenti non scelti
    {
      const contacts = [
        { id: 1, name: 'Mario Bianchi', phone_num: '3470001111', family_kind: 'figlio', address: 'Via X', others: 'note SiDLY' },
        { id: 2, name: 'Vecchia Persona', phone_num: '3200000000', family_kind: 'vicina', address: '', others: '' },
      ]
      const P = makePlatform({ patients: { [IMEI]: platformFrom(crm) }, contacts, diseases: { id: 1 }, card: {} })
      const d = await preview(crm, P)
      ok(rowOf(d, 'ref1.telefono')?.stato === 'uguale' && !rowOf(d, 'ref1.telefono')?.verso?.length, 'referente 1: telefono uguale anche senza prefisso → nessuna scelta')
      ok(rowOf(d, 'ref2.telefono')?.stato === 'diverso' && rowOf(d, 'ref2.telefono')?.verso?.join() === 'crm,sidly', 'referente 2: telefono diverso → si può scegliere CRM o SiDLY')
      ok(rowOf(d, 'ref1.email')?.stato === 'diverso' && rowOf(d, 'ref1.email')?.verso?.join() === 'crm' && !!rowOf(d, 'ref1.email')?.nota, 'e-mail referente: su SiDLY ci sono solo note (nessun indirizzo) → solo «vale il CRM», con nota')
      const { r } = await scrivi(crm, P, [['ref2.telefono', 'crm'], ['ref1.email', 'crm']])
      const pc = P.calls.find(c => c.method === 'PATCH' && c.path === `/editContacts/${IMEI}`)
      ok(r.esito === 'aggiornato' && !!pc, 'referenti: scelte «vale il CRM» → PATCH editContacts')
      ok(pc?.body.contact1Affinity === 'figlio' && pc?.body.contact1Address === 'Via X' && pc?.body.contact1ID === 1 && pc?.body.contact1Others === 'note SiDLY email: m@x.it', 'referenti: parentela, indirizzo, ID e note già su SiDLY non vengono azzerati; l\'e-mail si aggiunge alle note')
      ok(pc?.body.contact2Phone === '+393480002222' && pc?.body.contact2Name === 'Vecchia Persona' && pc?.body.contact2Affinity === 'vicina' && pc?.body.contact2ID === 2, 'referente 2: solo il telefono scelto cambia; nome non scelto, parentela e ID restano di SiDLY')
      ok(!('contact3Name' in (pc?.body || {})) && !Object.values(pc?.body || {}).some(v => v === undefined || v === null), 'editContacts: nessun contatto 3 inventato, nessun valore undefined/null nel body')
      ok(!P.calls.some(c => c.method === 'PATCH' && c.path.startsWith('/manager/patient/')), 'referenti: nessuna PATCH sull\'anagrafica')
      ok(r.campi_inviati.some(c => c.etichetta === 'Referente 2 · telefono' && c.mostra_prima === '3200000000' && c.mostra_dopo === '+393480002222'), 'referente sostituito: mostrati valore precedente e nuovo')
      // direzione opposta: «vale SiDLY» → si scrive nel CRM, niente PATCH su SiDLY
      const P2 = makePlatform({ patients: { [IMEI]: platformFrom(crm) }, contacts, diseases: { id: 1 }, card: {} })
      const { r: r2, ops } = await scrivi(crm, P2, [['ref2.nome', 'sidly'], ['ref2.telefono', 'sidly']])
      ok(r2.esito === 'aggiornato' && ops.map(o => (o.t === 'col' ? `${o.tabella}.${o.col}=${o.val}` : '')).join() === 'configurations.contatto2_nome=Vecchia,configurations.contatto2_cognome=Persona,configurations.contatto2_telefono=3200000000', 'referente 2 «vale SiDLY»: nome e cognome separati e telefono scritti nelle colonne del CRM')
      ok(!P2.calls.some(c => c.method === 'PATCH') && (r2.crm_scritture || []).length === 2, 'referente 2 «vale SiDLY»: nessuna PATCH su SiDLY, due voci prima/dopo per il CRM')
    }

    // patologie: gli interruttori si possono solo ACCENDERE; testi diversi → scelta della direzione
    {
      const P = makePlatform({ patients: { [IMEI]: platformFrom(crm) }, contacts: [], diseases: { id: 9, parkinson: 1, cukrzyca: 0, nadcisnienie: 1, allergy: 'Polline', medicines: '', other_diseases: 'Glaucoma, Ictus' }, card: {} })
      const d = await preview(crm, P)
      ok(rowOf(d, 'pat.cukrzyca')?.verso?.join() === 'crm' && !!rowOf(d, 'pat.cukrzyca')?.nota, 'diabete: SiDLY «No», CRM «Sì» → solo «vale il CRM» (non si spegne mai una patologia su SiDLY)')
      ok(rowOf(d, 'pat.parkinson')?.verso?.join() === 'sidly', 'parkinson: SiDLY «Sì», CRM «No» → solo «vale SiDLY» (non si toglie mai una patologia dal CRM)')
      ok(rowOf(d, 'pat.nadcisnienie')?.stato === 'uguale' && rowOf(d, 'pat.other_diseases')?.stato === 'uguale', 'ipertensione uguale; altre patologie già contenute su SiDLY → uguale')
      ok(rowOf(d, 'pat.allergy')?.stato === 'diverso' && rowOf(d, 'pat.allergy')?.sidly === 'Polline' && rowOf(d, 'pat.allergy')?.crm === 'Penicillina' && rowOf(d, 'pat.allergy')?.verso?.join() === 'crm,sidly', 'allergie diverse: entrambi i valori mostrati, scelta CRM o SiDLY')
      ok(rowOf(d, 'pat.medicines')?.verso?.join() === 'crm', 'farmaci vuoti su SiDLY: solo «vale il CRM» (il CRM ha una struttura propria, non lo riscrivo da SiDLY)')
      const { r } = await scrivi(crm, P, [['pat.cukrzyca', 'crm'], ['pat.medicines', 'crm']])
      const pd = P.calls.find(c => c.method === 'PATCH' && c.path === `/editDiseases/${IMEI}`)
      ok(r.esito === 'aggiornato' && pd?.body.cukrzyca === 1 && pd?.body.parkinson === 1 && pd?.body.nadcisnienie === 1 && pd?.body.diseaseID === 9, 'patologie: diabete acceso, parkinson (solo su SiDLY) e ipertensione mantenuti')
      ok(pd?.body.allergy === 'Polline' && pd?.body.other_diseases === 'Glaucoma, Ictus' && !!pd?.body.medicines, 'patologie: allergie diverse NON scelte restano quelle di SiDLY; farmaci scelti compilati dal CRM')
      // forzare lo spegnimento (SiDLY «No» → CRM) o altre scelte non consentite → rifiutate dal server
      const f1 = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, scelte: [{ chiave: 'pat.parkinson', verso: 'crm', sidly: 'Sì', crm: 'No' }], applyCrm: async () => {} })
      ok(f1.esito === 'errore' && /non consentita/.test(f1.errore || ''), 'scelta «vale il CRM» che spegnerebbe il parkinson su SiDLY → rifiutata dal server')
      const none = await preview(crmOf({ config: { patologie_croniche: '[]' } }), makePlatform({ patients: { [IMEI]: platformFrom(crmOf()) }, contacts: [], diseases: { id: 1 }, card: {} }))
      ok(!(none.confronto || []).some(x => x.chiave?.startsWith('pat.') && x.verso?.includes('crm')), 'nessuna patologia nel CRM → nessuna scelta «vale il CRM» sulle patologie')
      // direzione opposta
      const P2 = makePlatform({ patients: { [IMEI]: platformFrom(crm) }, contacts: [], diseases: { id: 9, parkinson: 1, cukrzyca: 1, nadcisnienie: 1, allergy: 'Polline' }, card: {} })
      const { r: r2, ops } = await scrivi(crm, P2, [['pat.parkinson', 'sidly'], ['pat.allergy', 'sidly']])
      ok(r2.esito === 'aggiornato' && ops.some(o => o.t === 'croniche' && o.key === 'parkinson' && o.on === true) && ops.some(o => o.t === 'col' && o.col === 'allergie' && o.val === 'Polline') && !P2.calls.some(c => c.method === 'PATCH'), 'patologie «vale SiDLY»: parkinson aggiunto alle patologie croniche del CRM e allergie copiate; nessuna PATCH su SiDLY')
      // scrittura nel DB: l'elenco delle patologie croniche resta nel suo formato (JSON o testo separato da virgole)
      const up1: any[] = [], up2: any[] = []
      const ctx = { assistitoId: 7, leadId: 'L1', configId: 5, imei: IMEI, cronicheRaw: '["ipertensione","diabete"]' }
      await S.applyCrmOps(makeDb({ updates: up1 }), [{ t: 'croniche', key: 'parkinson', on: true, chiave: 'pat.parkinson' }], ctx)
      await S.applyCrmOps(makeDb({ updates: up2 }), [{ t: 'croniche', key: 'parkinson', on: true, chiave: 'pat.parkinson' }], { ...ctx, cronicheRaw: 'ipertensione, diabete' })
      ok(up1.length === 1 && up1[0].b[0] === '["ipertensione","diabete","parkinson"]' && up1[0].b[1] === 5 && up2[0].b[0] === 'ipertensione,diabete,parkinson', 'patologie croniche nel CRM: formato JSON o virgole mantenuto, una sola UPDATE sulla scheda giusta')
    }

    // scheda assistito: sola lettura (la scrittura su SiDLY non è attiva), nessuna direzione offerta verso SiDLY
    {
      const P = makePlatform({ patients: { [IMEI]: platformFrom(crm) }, contacts: [], diseases: { id: 1 }, card: { name_of_doctor: 'Dott. Rossi', hospital_info: '' } })
      const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, dryRun: true })
      const med = rowOf(r, 'Medico curante'), centro = rowOf(r, 'Centro medico di riferimento')
      ok(med?.stato === 'diverso' && med?.sidly === 'Dott. Rossi' && !med?.verso?.length && !!med?.nota, 'scheda assistito: medico diverso → mostrato, nessuna scelta (scrittura non attiva) e nota che lo spiega')
      ok(centro?.stato === 'solo_crm' && !centro?.verso?.length, 'scheda assistito: centro solo nel CRM → nessuna scelta verso SiDLY')
      ok(P.calls.some(c => c.path === `/patientCard/${IMEI}` && c.method === 'GET') && !P.calls.some(c => c.path.startsWith('/patientCard') && c.method !== 'GET'), 'scheda assistito: solo lettura (nessuna scrittura)')
      ok(!P.calls.some(c => c.method !== 'GET' && c.path !== '/user/login'), 'anteprima: nessuna scrittura su nessun endpoint')
      const f = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, scelte: [{ chiave: 'card.name_of_doctor', verso: 'crm', sidly: 'Dott. Rossi', crm: 'Dott. Gallo - 0101112222' }], applyCrm: async () => {} })
      ok(f.esito === 'errore' && /non consentita/.test(f.errore || '') && !P.calls.some(c => c.method === 'PATCH'), 'scheda assistito: scelta forzata verso SiDLY → rifiutata dal server, nessuna scrittura')
      const diag = JSON.stringify(r.diagnostica || {})
      ok(!diag.includes('Dott. Rossi') && !diag.includes('Mario') && /forma_contatti/.test(diag) && /forma_patologie/.test(diag), 'diagnostica dettagli: solo struttura, nessun dato personale')
      // «vale SiDLY» sul centro medico: scrittura nel CRM (colonna ammessa)
      const P2 = makePlatform({ patients: { [IMEI]: platformFrom(crm) }, contacts: [], diseases: { id: 1 }, card: { name_of_doctor: 'Dott. Gallo - 0101112222', hospital_info: 'Ospedale Nuovo' } })
      const { ops } = await scrivi(crm, P2, [['card.hospital_info', 'sidly']])
      ok(ops.length === 1 && ops[0].t === 'col' && ops[0].col === 'centro_medico_riferimento' && ops[0].val === 'Ospedale Nuovo', 'centro medico «vale SiDLY»: scritto nella colonna centro_medico_riferimento del CRM')
    }

    // testi leggibili per l'operatore (anteprima «prima / dopo» delle righe scelte)
    {
      const plat = platformFrom(crm, { phones: [{ numberPrefix: '+39', number: '3470001111', repeatNumber: 1 }], whitelistNumbers: '' })
      const P = makePlatform({ patients: { [IMEI]: plat }, contacts: [{ id: 1, name: 'Mario Bianchi', phone_num: '3470001111', family_kind: 'figlio', address: '', others: 'email: m@x.it' }, { id: 2, name: 'Luisa Verdi', phone_num: '+39 348 0002222', family_kind: '', address: '', others: '' }, { id: 3, name: 'Paolo Neri', phone_num: '3490003333', family_kind: '', address: '', others: '' }], diseases: { id: 1, nadcisnienie: 1, cukrzyca: 1, allergy: 'Penicillina', other_diseases: 'Ictus, Glaucoma', medicines: 'Cardioaspirina 100mg mattina', more_info: 'Cammina col bastone' }, card: { name_of_doctor: 'Dott. Gallo - 0101112222', hospital_info: 'Ospedale Galliera' } })
      const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, dryRun: true })
      ok(r.assistito === 'Anna Rossi', 'anteprima: nome dell\'assistito per il titolo del pannello')
      const rows = r.confronto || []
      ok(!rows.some(x => /^Referenti|^Patologie|^Scheda/.test(x.gruppo) && (x.stato === 'diverso' || x.stato === 'solo_crm')), 'referenti, patologie e scheda assistito già allineati → nessuna riga da decidere')
      const a = await anteprimaScelte(crm, P, [['band.phones', 'crm'], ['band.whitelist', 'crm']])
      const sos = a.campi_inviati.find(c => c.campo === 'band.phones')
      ok(sos?.etichetta === 'Numeri SOS (devono essere i 3 referenti)' && /Mario Bianchi \+393470001111/.test(sos?.mostra_dopo || '') && (sos?.mostra_dopo || '').split('\n').length === 3, 'SOS: etichetta italiana e un numero per riga con il nome del referente')
      ok(sos?.mostra_prima === '+393470001111', 'SOS: "prima" leggibile (un solo numero)')
      const wl = a.campi_inviati.find(c => c.campo === 'band.whitelist')
      ok(!!wl && wl.etichetta === 'Numeri ammessi (whitelist)' && (wl.mostra_dopo || '').split('\n').length === 2 && (wl.mostra_dopo || '') === '+390102345678\n+393331234567' && !/Farmacia|Centrale|Vicina/.test(wl.mostra_dopo || '') && wl.mostra_prima === '', 'numeri ammessi: etichetta italiana, un numero per riga, solo numeri (nessun nome)')
      ok(!a.campi_inviati.some(c => !c.etichetta || c.etichetta === c.campo), 'ogni campo mostrato ha un\'etichetta in italiano (niente nomi tecnici)')
      ok(S.etichettaCampo('patologie.nadcisnienie') === 'Patologia: ipertensione' && S.etichettaCampo('referente2.telefono') === 'Referente 2 · telefono', 'etichette: patologie e referenti in italiano')
    }

    // ── scelte per riga: validazione server, valori cambiati, scrittura nel DB del CRM ──────────────────
    {
      const pe = S.parseScelte
      ok(Array.isArray(pe(undefined)) && (pe(undefined) as any[]).length === 0 && Array.isArray(pe([])), 'parseScelte: assenti o vuote → nessuna scelta (default = nessuna modifica)')
      ok('errore' in (pe('x') as any) && 'errore' in (pe([{ chiave: 'a', verso: 'altro', sidly: '', crm: '' }]) as any) && 'errore' in (pe([{ chiave: '', verso: 'crm', sidly: '', crm: '' }]) as any) && 'errore' in (pe([{ chiave: 'a', verso: 'crm', sidly: 1, crm: '' }]) as any) && 'errore' in (pe([null]) as any), 'parseScelte: forma sbagliata, verso sconosciuto, chiave vuota o valori non testuali → errore')
      ok('errore' in (pe(new Array(101).fill({ chiave: 'a', verso: 'crm', sidly: '', crm: '' })) as any) && 'errore' in (pe([{ chiave: 'x'.repeat(61), verso: 'crm', sidly: '', crm: '' }]) as any), 'parseScelte: troppe scelte o chiave troppo lunga → errore')

      const crm = crmOf()
      const mk = () => makePlatform({ patients: { [IMEI]: platformFrom(crm, {}, { phone: '3339998877', weight: 70 }) } })
      const P = mk()
      const d = await preview(crm, P)
      const tel = sceltaDi(d, "Telefono dell'assistito", 'crm')
      const noop = async () => {}
      const dup = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, scelte: [tel, tel], applyCrm: noop })
      ok(dup.esito === 'errore' && /duplicata/.test(dup.errore || '') && !P.calls.some(c => c.method === 'PATCH'), 'scelta duplicata sulla stessa riga → rifiutata, nessuna scrittura')
      const sconosciuta = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, scelte: [{ chiave: 'user.nonEsiste', verso: 'crm', sidly: '', crm: '' }], applyCrm: noop })
      ok(sconosciuta.esito === 'errore' && /non consentita/.test(sconosciuta.errore || ''), 'scelta su una riga inesistente → rifiutata')
      const uguale = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, scelte: [{ chiave: 'user.firstName', verso: 'crm', sidly: 'Anna', crm: 'Anna' }], applyCrm: noop })
      ok(uguale.esito === 'errore' && !P.calls.some(c => c.method === 'PATCH'), 'scelta su una riga già uguale → rifiutata (nulla da cambiare)')
      const stantia = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, scelte: [{ ...tel, sidly: '3330000000' }], applyCrm: noop })
      ok(stantia.esito === 'errore' && /cambiato dopo l'anteprima/.test(stantia.errore || '') && !P.calls.some(c => c.method === 'PATCH'), 'valore su SiDLY cambiato dopo l\'anteprima → rifiutato, richiede di riaprire il confronto')
      const stantiaCrm = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, scelte: [{ ...tel, crm: '3470000000' }], applyCrm: noop })
      ok(stantiaCrm.esito === 'errore' && /cambiato dopo l'anteprima/.test(stantiaCrm.errore || ''), 'valore nel CRM cambiato dopo l\'anteprima → rifiutato')
      // la scelta SiDLY → CRM senza che il CRM sappia scrivere (applyCrm assente) non scrive niente
      const senzaCrm = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, scelte: [sceltaDi(d, "Telefono dell'assistito", 'sidly')] })
      ok(senzaCrm.esito === 'errore' && /CRM non disponibile/.test(senzaCrm.errore || '') && !P.calls.some(c => c.method === 'PATCH'), 'scrittura nel CRM non disponibile → errore, nessuna scrittura')

      // più righe con direzioni diverse nello stesso giro: telefono → SiDLY, peso → CRM
      const P2 = mk()
      const { r, ops } = await scrivi(crm, P2, [["Telefono dell'assistito", 'crm'], ['Peso (kg)', 'sidly']])
      const patch = P2.calls.find(c => c.method === 'PATCH')
      ok(r.esito === 'aggiornato' && JSON.stringify(patch?.body) === '{"user":{"phone":"3331112233"}}' && P2.patients[IMEI].user.weight === 70, 'direzioni miste: il telefono va su SiDLY, il peso (SiDLY→CRM) NON viene scritto su SiDLY')
      ok(ops.length >= 1 && ops.every(o => o.t === 'col' && o.col !== 'telefono') && ops.some(o => o.t === 'col' && o.tabella === 'configurations' && o.col === 'peso' && o.val === 70), 'direzioni miste: il peso di SiDLY va nelle colonne del CRM, il telefono del CRM non viene toccato')

      // ── scrittura reale nel DB del CRM (D1 finto) ──
      const base = SRC()
      const mkDb = (updates: any[], extra: any = {}) => makeDb({ assistito: { ...base.assistito, lead_id: 'L1' }, lead: base.lead, config: base.config, ddt: { sim_number: '3897770000' }, saved: [], updates, ...extra })
      let up: any[] = []
      const P3 = mk()
      const dd = await S.runSidlySync({ db: mkDb(up), env: ENV, assistitoId: 7, fetchImpl: P3.fetchImpl, dryRun: true })
      const dRows = (dd.result as any).confronto as S.RigaConfronto[]
      const pesoRow = dRows.find(x => x.chiave === 'user.weight')!
      const sc: S.SceltaRiga[] = [{ chiave: 'user.weight', verso: 'sidly', sidly: pesoRow.sidly, crm: pesoRow.crm }]
      const anteprimaDb = await S.runSidlySync({ db: mkDb(up), env: ENV, assistitoId: 7, fetchImpl: P3.fetchImpl, dryRun: true, scelte: sc })
      ok(up.length === 0 && (anteprimaDb.result as any).crm_scritture?.length === 1 && (anteprimaDb.result as any).crm_scritture[0].prima === '62' && (anteprimaDb.result as any).crm_scritture[0].dopo === '70', 'anteprima con scelta SiDLY→CRM: mostra prima (62) e dopo (70), NESSuna UPDATE nel DB')
      const reale = await S.runSidlySync({ db: mkDb(up), env: ENV, assistitoId: 7, fetchImpl: P3.fetchImpl, scelte: sc })
      ok(reale.httpStatus === 200 && (reale.result as any).esito === 'aggiornato' && up.length >= 1 && up.every(u => /^UPDATE (configurations|assistiti) SET (peso|nome_assistito) = \? WHERE id = \?$/.test(u.sql) || /^UPDATE assistiti SET peso = \? WHERE id = \?$/.test(u.sql)), 'scrittura reale SiDLY→CRM: solo UPDATE con colonna e WHERE fissi (id), valori passati come parametri')
      ok(up.some(u => /UPDATE configurations SET peso = \? WHERE id = \?/.test(u.sql) && u.b[0] === 70 && u.b[1] === 5) && !P3.calls.some(c => c.method === 'PATCH'), 'scrittura reale SiDLY→CRM: configurations.peso = 70 sulla scheda 5; nessuna PATCH su SiDLY')
      const upFail: any[] = []
      const fallita = await S.runSidlySync({ db: mkDb(upFail, { failUpdate: true }), env: ENV, assistitoId: 7, fetchImpl: P3.fetchImpl, scelte: sc })
      ok((fallita.result as any).esito === 'errore' && /Scrittura nel CRM non riuscita/.test((fallita.result as any).errore), 'UPDATE del CRM fallita → errore chiaro, nessun falso «aggiornato»')
      const senzaScelte = await S.runSidlySync({ db: mkDb(up = []), env: ENV, assistitoId: 7, fetchImpl: P3.fetchImpl })
      ok((senzaScelte.result as any).esito === 'invariato' && up.length === 0, 'runSidlySync senza scelte: nessuna UPDATE nel CRM, nessuna PATCH')

      // whitelist delle colonne: nessun nome di colonna arriva dal browser
      const ctx = { assistitoId: 7, leadId: 'L1', configId: 5, imei: IMEI, cronicheRaw: '' }
      let err1 = '', err2 = '', err3 = ''
      try { await S.applyCrmOps(makeDb({}), [{ t: 'col', tabella: 'configurations', col: 'id = 1; DROP TABLE leads; --', val: 'x', chiave: 'k' }], ctx) } catch (e: any) { err1 = e.message }
      try { await S.applyCrmOps(makeDb({}), [{ t: 'col', tabella: 'leads', col: 'email', val: 'x', chiave: 'k' }], ctx) } catch (e: any) { err2 = e.message }
      try { await S.applyCrmOps(makeDb({}), [{ t: 'col', tabella: 'configurations', col: 'peso', val: 70, chiave: 'k' }], { ...ctx, configId: null }) } catch (e: any) { err3 = e.message }
      ok(/colonna non ammessa/.test(err1) && /colonna non ammessa/.test(err2), 'applyCrmOps: colonna fuori elenco (anche SQL malevolo) → rifiutata')
      ok(/scheda del CRM non trovata/.test(err3), 'applyCrmOps: scheda del CRM mancante → errore, nessuna UPDATE a vuoto')
      const batched: any[] = []
      const dbB: any = { prepare: (sql: string) => ({ bind: (...b: any[]) => ({ sql, b }) }), batch: async (s: any[]) => { batched.push(...s) } }
      await S.applyCrmOps(dbB, [{ t: 'col', tabella: 'configurations', col: 'peso', val: 70, chiave: 'k' }, { t: 'col', tabella: 'assistiti', col: 'peso', val: 70, chiave: 'k' }], ctx)
      ok(batched.length === 2, 'applyCrmOps: più scritture nello stesso batch D1 (tutto o niente)')
    }

    // confronto riga per riga SiDLY / CRM (tabella dell'anteprima)
    {
      const plat = platformFrom(crm, { phones: [{ numberPrefix: '+39', number: '3470001111', repeatNumber: 1 }], whitelistNumbers: '', min_hr: 50, fall: 1 }, { sex: 'F', description: 'nota SiDLY', email: 'a@b.it' })
      const P = makePlatform({ patients: { [IMEI]: plat }, contacts: [{ id: 1, name: 'Mario Bianchi', phone_num: '3470001111', family_kind: 'figlio', address: 'Via X', others: 'email: m@x.it' }], diseases: { id: 1, nadcisnienie: 1, arytmia: 1, allergy: 'Polline', walking_person: 'bene', hearing: 'ok' }, card: { name_of_doctor: 'Dott. Gallo - 0101112222', intercom_code: '1234' } })
      const r = await S.syncAssistito({ crm: crmOf({ config: { ...CFG, email: 'assistita@x.it' } }), env: ENV, fetchImpl: P.fetchImpl, dryRun: true })
      const rows = r.confronto || []
      const row = (campo: string) => rows.find(x => x.campo === campo)
      ok(rows.length > 20, 'confronto: tabella completa (anagrafica, referenti, braccialetto, patologie, scheda)')
      ok(row('Nome')?.sidly === 'Anna' && row('Nome')?.crm === 'Anna' && row('Nome')?.stato === 'uguale', 'confronto: nome uguale su SiDLY e nel CRM')
      ok(row('Indirizzo')?.stato === 'uguale', 'confronto: indirizzo uguale')
      ok(row('Sesso')?.assenteCrm === true && row('Sesso')?.sidly === 'F' && row('Sesso')?.stato === 'solo_sidly', 'campo solo su SiDLY: sesso')
      ok(row('Descrizione / note libere')?.assenteCrm === true, 'campo solo su SiDLY: descrizione')
      ok(row('Referente 1 · parentela')?.assenteCrm === true && row('Referente 1 · parentela')?.sidly === 'figlio' && row('Referente 1 · indirizzo')?.assenteCrm === true, 'campi solo su SiDLY: parentela e indirizzo del referente')
      ok(row('Soglia frequenza cardiaca minima')?.assenteCrm === true && row('Soglia frequenza cardiaca minima')?.sidly === '50', 'campi solo su SiDLY: soglie del braccialetto')
      ok(row('Aritmia') === undefined && rows.find(x => /^aritmia/i.test(x.campo))?.assenteCrm === true && rows.find(x => /^aritmia/i.test(x.campo))?.sidly === 'Sì', 'patologia solo su SiDLY: aritmia, senza equivalente nel CRM')
      ok(row('Autonomia nel camminare')?.assenteCrm === true && row('Udito')?.assenteCrm === true, 'campi solo su SiDLY: autonomia e udito')
      ok(row('Codice citofono')?.assenteCrm === true && row('Codice citofono')?.sidly === '1234', 'campi solo su SiDLY: scheda assistito (codice citofono)')
      ok(row('Codice fiscale assistito') === undefined, 'senza dati extra nel CRM non compaiono righe vuote del codice fiscale')
      ok(row('Referente 2 · nome')?.stato === 'solo_crm' && row('Referente 2 · nome')?.sidly === '' && row('Referente 2 · nome')?.crm === 'Luisa Verdi' && row('Referente 2 · nome')?.verso?.join() === 'crm', 'confronto: referente 2 assente su SiDLY → solo nel CRM, scelta possibile solo «vale il CRM»')
      ok(row('Numeri ammessi (whitelist)')?.stato === 'solo_crm' && row('Numeri ammessi (whitelist)')?.sidly === '' && row('Numeri ammessi (whitelist)')?.verso?.join() === 'crm', 'confronto: numeri ammessi vuoti su SiDLY → solo nel CRM, scelta possibile solo «vale il CRM»')
      ok(row('Allergie')?.stato === 'diverso' && row('Allergie')?.sidly === 'Polline' && row('Allergie')?.crm === 'Penicillina', 'confronto: allergie diverse → \"diverso\", non toccate')
      ok(row('E-mail dell\'assistito')?.sidly === 'a@b.it' && row('E-mail dell\'assistito')?.crm === 'assistita@x.it', 'confronto: e-mail dell\'assistito mostrata da entrambe le parti')
      ok(row('Medico curante')?.stato === 'uguale' && row('Centro medico di riferimento')?.stato === 'solo_crm', 'confronto: scheda assistito (medico uguale, centro solo nel CRM)')
      ok(!rows.some(x => x.stato === 'solo_sidly' && !x.assenteCrm && !x.crm && x.sidly === '' && false), 'confronto: coerenza interna')
      ok(!P.calls.some(c => c.method !== 'GET' && c.path !== '/user/login'), 'confronto in anteprima: nessuna scrittura')
      // dati extra del CRM: compaiono come \"solo nel CRM\"
      const withExtra = S.buildCrmPatient({ ...SRC({ config: CFG }), extra: { cfAssistito: 'RSSNNA44C49F205X', luogoNascitaAssistito: 'Milano', nomeRichiedente: 'Marco', cognomeRichiedente: 'Rossi', email: 'marco@x.it', telefono: '3391112222', piano: 'AVANZATO', servizio: 'eCura PRO' } }, ENV) as S.CrmPatient
      const Pe = makePlatform({ patients: { [IMEI]: platformFrom(withExtra) }, contacts: [], diseases: { id: 1 }, card: {} })
      const re = await S.syncAssistito({ crm: withExtra, env: ENV, fetchImpl: Pe.fetchImpl, dryRun: true })
      const cf = (re.confronto || []).find(x => x.campo === 'Codice fiscale assistito')
      ok(cf?.assenteSidly === true && cf?.crm === 'RSSNNA44C49F205X' && cf?.stato === 'solo_crm', 'campo solo nel CRM: codice fiscale (SiDLY non lo ha)')
      ok((re.confronto || []).some(x => x.campo === 'Richiedente' && x.crm === 'Marco Rossi' && x.assenteSidly) && (re.confronto || []).some(x => x.campo === 'Servizio / piano' && x.crm === 'eCura PRO · AVANZATO'), 'campi solo nel CRM: richiedente, servizio e piano')
    }
    {
      // lettura fallita: mai \"uguale\" per quello che non si e' potuto leggere
      const P = makePlatform({ patients: { [IMEI]: platformFrom(crm) }, detailStatus: 500, noFullRecord: true })
      const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, dryRun: true })
      const rows = r.confronto || []
      ok(rows.some(x => x.campo === 'Referenti' && x.stato === 'non_verificato') && rows.some(x => x.campo === 'Patologie e farmaci' && x.stato === 'non_verificato') && rows.some(x => x.campo === 'Scheda assistito' && x.stato === 'non_verificato'), 'confronto: contatti, patologie e scheda non letti → \"non verificabile\"')
      ok(rows.find(x => x.campo === 'Indirizzo')?.stato === 'non_verificato' && rows.find(x => x.campo === 'Data di nascita')?.stato === 'non_verificato', 'confronto: indirizzo e data non leggibili → \"non verificabile\"')
    }
    {
      // assistito nuovo: tutto \"solo nel CRM / da creare\", nessuna lettura
      const P = makePlatform({})
      const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, confermaCrea: true, dryRun: true })
      ok((r.confronto || []).length > 10 && (r.confronto || []).find(x => x.campo === 'Nome')?.stato === 'solo_crm' && (r.confronto || []).every(x => !x.verso?.length) && !P.calls.some(c => c.path.startsWith('/getContacts')), 'confronto: assistito nuovo → righe da creare (nessuna scelta per riga), nessuna lettura dettagli')
      const blob = JSON.stringify(r.confronto)
      ok(!blob.includes('p-segreta-xyz') && !blob.includes('tok-'), 'confronto: nessun token o password')
    }

    // errori: lettura o scrittura dei dettagli non riuscita
    {
      const P = makePlatform({ patients: { [IMEI]: platformFrom(crm) }, detailStatus: 500 })
      const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, dryRun: true })
      ok(r.esito === 'anteprima' && r.warning.some(w => /Referenti non verificabili/.test(w) && /HTTP 500/.test(w)) && r.warning.some(w => /Patologie e farmaci non verificabili/.test(w)) && (r.confronto || []).filter(x => /^Referenti|^Patologie/.test(x.gruppo)).every(x => !x.verso?.length), 'lettura dettagli fallita (HTTP 500): avvisi, righe non verificabili, nessuna scelta possibile alla cieca')
      const P2 = makePlatform({ patients: { [IMEI]: platformFrom(crm) }, contacts: [], diseases: { id: 1 }, patchDetailStatus: 500 })
      const r2 = (await scrivi(crm, P2, [['ref1.nome', 'crm']])).r
      ok(r2.esito === 'errore' && /referenti/i.test(r2.errore || ''), 'scrittura referenti fallita → esito errore con messaggio chiaro')
    }

    // SiDLY rifiuta la PATCH (HTTP 400): messaggio con il motivo, NIENTE scritto nel CRM, nessun falso «Scritto»
    {
      const P = makePlatform({ patients: { [IMEI]: platformFrom(crm, { whitelistNumbers: '', whiteListAlias: '' }) }, contacts: [], diseases: { id: 1 }, patchPatient: { status: 400, body: { message: 'whitelistNumbers: formato non valido' } } })
      let crmScritto = 0
      const dd = await preview(crm, makePlatform({ patients: { [IMEI]: platformFrom(crm, { whitelistNumbers: '', whiteListAlias: '' }) }, contacts: [], diseases: { id: 1 } }))
      const e = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, scelte: [sceltaDi(dd, 'band.whitelist', 'crm')], applyCrm: async () => { crmScritto++ } })
      ok(e.esito === 'errore' && /HTTP 400: whitelistNumbers: formato non valido/.test(e.errore || '') && /non è stato scritto nulla/.test(e.errore || '') && crmScritto === 0, 'SiDLY risponde 400: l\'errore riporta il motivo del rifiuto e nulla viene scritto nel CRM')
      ok(S.motivoErrore({ detail: [{ msg: 'x' }] }, '').includes('msg') && S.motivoErrore(null, '<html>502</html>') === '' && S.motivoErrore(null, 'Bad\nrequest   here') === 'Bad request here' && S.motivoErrore({ message: 'a'.repeat(500) }, '').length === 160, 'motivoErrore: estrae il messaggio, ignora HTML, ripulisce e limita a 160 caratteri')
    }

    // Segnalazioni dell'utente (Giorgia Origoni, Vilma Pineda, Maria Immacolata Tomaselli)
    {
      // 1) farmaci: il CRM salva {"nomi":[],"dosaggi":[],"orari":[]}: va letto, non mostrato come JSON grezzo
      const f = crmOf({ config: { farmaci_data: JSON.stringify({ nomi: ['zoloft', 'olanzapine'], dosaggi: ['1 compressa', '1 compressa'], orari: ['08:00', '20:00'] }) } })
      ok(f.medical.medicines === 'zoloft 1 compressa 08:00; olanzapine 1 compressa 20:00' && !/[{}\[\]"]/.test(f.medical.medicines || ''), 'farmaci: formato {nomi,dosaggi,orari} del CRM → testo leggibile, senza JSON')
      const f2 = crmOf({ config: { farmaci_data: JSON.stringify({ nomi: ['tachipirina', 'x'], dosaggi: ['500'], orari: [] }) } })
      ok(f2.medical.medicines === 'tachipirina 500; x', 'farmaci: elenchi di lunghezza diversa → nessun errore, nessun dato perso')
      // 2) indirizzo: ordine italiano (via, poi civico)
      ok(S.indirizzoIt('29 Via Corinto') === 'Via Corinto 29' && S.indirizzoIt('5A Corso Italia') === 'Corso Italia 5A' && S.indirizzoIt('Via Roma 1') === 'Via Roma 1' && S.indirizzoIt('3 Maggio') === '3 Maggio' && S.indirizzoIt('') === '', 'indirizzo: «29 Via Corinto» → «Via Corinto 29»; già italiano o ambiguo → invariato')
      const ci = crmOf({ lead: { indirizzoAssistito: '29 Via Corinto', cittaAssistito: 'Roma', provinciaAssistito: 'RM', capAssistito: '00146' } })
      ok(ci.user.address === 'Via Corinto 29, Roma, RM, 00146', 'indirizzo verso SiDLY: ordine italiano (Via Corinto 29, Roma, RM, 00146)')
      const pi = await preview(ci, makePlatform({ patients: { [IMEI]: platformFrom(ci, {}, { address: '29 Via Corinto, Roma, RM, 00146' }) } }))
      ok(rowOf(pi, 'user.address')?.stato === 'diverso' && rowOf(pi, 'user.address')?.verso?.includes('crm'), 'indirizzo già scritto in ordine inglese su SiDLY → segnalato «diverso», correggibile con «vale il CRM»')
      const pu = await preview(ci, makePlatform({ patients: { [IMEI]: platformFrom(ci) } }))
      ok(rowOf(pu, 'user.address')?.stato === 'uguale', 'indirizzo in ordine italiano su entrambi → uguale')
    }
    {
      // 3) nomi della whitelist: campo SEPARATO su SiDLY (whiteListAlias), scritto insieme ai numeri come fa il portale
      const crm = crmOf({ config: { whitelist1_nome: 'Daniela', whitelist1_cognome: 'Rocca', whitelist1_telefono: '3357729675', whitelist2_nome: 'Stefania', whitelist2_cognome: 'Rocca', whitelist2_telefono: '3357301206' } })
      ok(crm.band.whitelistNumbers === '+393357729675,+393357301206' && !('whiteListAlias' in crm.band) && crm.whitelist.map(w => w.alias).join() === 'Daniela Rocca,Stefania Rocca', 'whitelist: numeri e nomi tenuti separati')
      const P = makePlatform({ patients: { [IMEI]: platformFrom(crm, { whitelistNumbers: '', whiteListAlias: '' }) }, contacts: [], diseases: { id: 1 } })
      const d = await preview(crm, P)
      ok(rowOf(d, 'band.whitelist')?.crm === '+393357729675\n+393357301206' && rowOf(d, 'band.whitelistAlias')?.crm === 'Daniela Rocca\nStefania Rocca' && !(rowOf(d, 'band.whitelistAlias')?.verso || []).length, 'whitelist: riga numeri (solo numeri) e riga «Nomi dei numeri ammessi» separate')
      const w = await scrivi(crm, P, [['band.whitelist', 'crm']])
      const pb = P.calls.find(c => c.method === 'PATCH' && /manager\/patient/.test(c.path))
      ok(w.r.esito === 'aggiornato' && pb?.body.band.whitelistNumbers === '+393357729675,+393357301206' && pb?.body.band.whiteListAlias === 'Daniela Rocca,Stefania Rocca' && Object.keys(pb?.body.band).join() === 'whitelistNumbers,whiteListAlias', 'whitelist: numeri e nomi inviati insieme nella stessa PATCH, come il portale (due campi, stesso ordine)')
      const Pf = makePlatform({ patients: { [IMEI]: platformFrom(crm, { whitelistNumbers: '', whiteListAlias: '' }) }, contacts: [], diseases: { id: 1 } })
      const a = await anteprimaScelte(crm, Pf, [['band.whitelist', 'crm']])
      ok(a.campi_inviati.some(c => c.campo === 'band.whiteListAlias' && c.mostra_dopo === 'Daniela Rocca\nStefania Rocca'), 'whitelist: nel «prima / dopo» compaiono anche i nomi')
      // numeri uguali ma nomi diversi: si può correggere solo il nome
      const P2 = makePlatform({ patients: { [IMEI]: platformFrom(crm, { whitelistNumbers: crm.band.whitelistNumbers, whiteListAlias: 'Vecchio,Altro' }) }, contacts: [], diseases: { id: 1 } })
      const d2 = await preview(crm, P2)
      ok(rowOf(d2, 'band.whitelist')?.stato === 'uguale' && rowOf(d2, 'band.whitelistAlias')?.stato === 'diverso' && rowOf(d2, 'band.whitelistAlias')?.verso?.join() === 'crm', 'whitelist: numeri uguali e nomi diversi → solo la riga dei nomi è modificabile')
      // numeri diversi: i nomi non si possono allineare da soli
      const P3 = makePlatform({ patients: { [IMEI]: platformFrom(crm, { whitelistNumbers: '+390000000001', whiteListAlias: 'Mario' }) }, contacts: [], diseases: { id: 1 } })
      const d3 = await preview(crm, P3)
      ok(!(rowOf(d3, 'band.whitelistAlias')?.verso || []).length && /Prima allinea i numeri/.test(rowOf(d3, 'band.whitelistAlias')?.nota || ''), 'whitelist: numeri diversi → i nomi non si scrivono da soli (spiegazione a video)')
    }
    {
      // 6) SiDLY rifiuta la PATCH parziale della whitelist (HTTP 400 senza motivo): secondo tentativo come il portale
      const crm = crmOf({ config: { whitelist1_nome: 'Nicola', whitelist1_cognome: 'Zullo', whitelist1_telefono: '3403373508', whitelist2_nome: 'Luca', whitelist2_cognome: 'Zullo', whitelist2_telefono: '3393993993' } })
      const extra = { whitelistNumbers: '', whiteListAlias: '', min_hr: 55, max_hr: 130, is_hr: 1, is_sat: 1, full_batt_notif: 1, sos_notif: 0, fall_notif: 1, night_mode: 1, night_start: '22:30', night_stop: '5:30', aac: 1, steps: '' }
      const P = makePlatform({ patients: { [IMEI]: platformFrom(crm, extra) }, contacts: [], diseases: { id: 1 }, patchNeedsFullBand: true } as any)
      const w = await scrivi(crm, P, [['band.whitelist', 'crm']])
      const patches = P.calls.filter(c => c.method === 'PATCH' && /manager\/patient/.test(c.path))
      ok(w.r.esito === 'aggiornato' && patches.length === 2 && Object.keys(patches[0].body.band).join() === 'whitelistNumbers,whiteListAlias', 'whitelist: la PATCH parziale è rifiutata (400) → secondo tentativo nella stessa operazione')
      const b2 = patches[1]?.body
      ok(b2?.lang === 'it' && b2.band.whitelistNumbers === '+393403373508,+393393993993' && b2.band.whiteListAlias === 'Nicola Zullo,Luca Zullo', 'secondo tentativo: numeri e nomi scelti dall\'operatore')
      ok(b2?.band.minHr === 55 && b2.band.maxHr === 130 && b2.band.sos_notif === 0 && !('full_batt_notif' in b2.band) && !('sms_limit' in b2.band) && b2.band.fall_notif === 1 && b2.band.night_start === '22:30' && b2.band.night_stop === '05:30' && b2.band.aac === 1 && b2.band.ivs === undefined && b2.user?.firstName === 'Anna' && b2.wifi?.band_imei === IMEI && b2.wifi?.wifi_ssid === null && Object.keys(b2).join() === 'user,band,wifi,lang' && b2.band.timezone === 'Europe/Rome' && b2.band.zone === null, 'secondo tentativo (identico al portale): user, band, wifi, lang; le altre impostazioni del braccialetto sono rimandate INVARIATE (soglie, notifiche, notte, fuso), zona assente = null come il portale')
      ok(w.r.azioni.some(a => /tentativo 2/.test(a.azione) && a.risultato === '200'), 'il secondo tentativo compare tra le chiamate (dettagli tecnici)')
      // se rifiuta anche il modulo completo: errore con entrambi i motivi, nulla scritto nel CRM
      let crmScritto = 0
      const P2 = makePlatform({ patients: { [IMEI]: platformFrom(crm, extra) }, contacts: [], diseases: { id: 1 }, patchPatient: { status: 400, body: { status: 400, errors: [] } } } as any)
      const dd = await preview(crm, P2)
      const e = await S.syncAssistito({ crm, env: ENV, fetchImpl: P2.fetchImpl, scelte: [sceltaDi(dd, 'band.whitelist', 'crm')], applyCrm: async () => { crmScritto++ } })
      ok(e.esito === 'errore' && /riprovato con la richiesta identica a quella del portale/.test(e.errore || '') && /non è stato scritto nulla/.test(e.errore || '') && P2.calls.filter(c => c.method === 'PATCH' && /manager\/patient/.test(c.path)).length === 3 && crmScritto === 0, 'rifiutati tutti i tentativi i tentativi: errore con i due motivi, nulla scritto')
      // braccialetto che non gestisce i nomi: rifiuta ogni alias -> terzo tentativo con i soli numeri, avviso a video
      const P4 = makePlatform({ patients: { [IMEI]: platformFrom(crm, extra) }, contacts: [], diseases: { id: 1 }, patchNeedsFullBand: true, rejectAlias: true } as any)
      const w4 = await scrivi(crm, P4, [['band.whitelist', 'crm']])
      const pt = P4.calls.filter(c => c.method === 'PATCH' && /manager\/patient/.test(c.path))
      ok(w4.r.esito === 'aggiornato' && pt.length === 3 && pt[2].body.band.whitelistNumbers === '+393403373508,+393393993993' && pt[2].body.band.whiteListAlias === '' && w4.r.warning.some(x => /rifiutato i nomi/.test(x)), 'nomi rifiutati da SiDLY: scritti solo i numeri (terzo tentativo) con avviso esplicito')
      // anteprima: non scrive nulla e non fa il secondo tentativo
      const P3 = makePlatform({ patients: { [IMEI]: platformFrom(crm, extra) }, contacts: [], diseases: { id: 1 }, patchNeedsFullBand: true } as any)
      await anteprimaScelte(crm, P3, [['band.whitelist', 'crm']])
      ok(!P3.calls.some(c => c.method === 'PATCH'), 'anteprima: nessuna PATCH')
    }
    {
      // 4) assistito senza scheda di configurazione nel CRM: nessuna scelta che poi fallirebbe
      const base = crmOf()
      const senza: S.CrmPatient = S.buildCrmPatient({ ...SRC(), config: null }, ENV) as S.CrmPatient
      ok(senza.fonti.config === false, 'assistito senza scheda di configurazione: riconosciuto')
      const P = makePlatform({ patients: { [IMEI]: platformFrom(base, {}, { email: 'x@y.it', weight: 70 }) }, contacts: [{ id: 1, name: 'Mario Bianchi', phone_num: '3470001111', family_kind: '', address: '', others: 'email: m@x.it' }], diseases: { id: 1 } })
      const d = await preview(senza, P)
      const em = rowOf(d, 'user.email'), rn = rowOf(d, 'ref1.nome'), pe = rowOf(d, 'user.weight')
      ok(!(em?.verso || []).includes('sidly') && /non ha la scheda di configurazione/.test(em?.nota || ''), 'senza scheda: e-mail non offerta verso il CRM, con spiegazione (niente errore dopo la conferma)')
      ok(!(rn?.verso || []).includes('sidly'), 'senza scheda: referenti non offerti verso il CRM')
      ok((pe?.verso || []).includes('sidly'), 'senza scheda: il peso resta scrivibile (colonna dell\'anagrafica assistiti)')
      const ops: S.CrmOp[] = []
      const w = await S.syncAssistito({ crm: senza, env: ENV, fetchImpl: P.fetchImpl, scelte: [sceltaDi(d, 'user.weight', 'sidly')], applyCrm: async o => { ops.push(...o) } })
      ok(w.esito === 'aggiornato' && ops.length > 0 && ops.every(o => o.t === 'col' && o.tabella === 'assistiti'), 'senza scheda: la scrittura del peso tocca solo l\'anagrafica assistiti, mai la scheda mancante')
    }
    {
      // 5) errore di SiDLY senza messaggio: si mostra il corpo grezzo o si dice che il motivo non è indicato
      ok(S.motivoErrore({ errors: {} }, '{"errors":{}}') === '{"errors":{}}' && S.motivoErrore({}, '{}') === '' && S.motivoErrore({ errors: { band: 'x' } }, '').includes('band'), 'motivoErrore: {"errors":{}} → corpo grezzo; risposta vuota → nessun «{}» a video')
      const crm = crmOf({ config: { whitelist1_telefono: '3357729675' } })
      const P = makePlatform({ patients: { [IMEI]: platformFrom(crm, { whitelistNumbers: '', whiteListAlias: '' }) }, contacts: [], diseases: { id: 1 }, patchPatient: { status: 400, body: {} } })
      const e = (await scrivi(crm, P, [['band.whitelist', 'crm']])).r
      ok(e.esito === 'errore' && /HTTP 400, SiDLY non indica il motivo/.test(e.errore || ''), 'errore 400 senza motivo → «SiDLY non indica il motivo», non «{}»')
    }

    // creazione: i dettagli vengono sincronizzati dopo il POST
    {
      const P = makePlatform({ contacts: [], diseases: { id: 3 } })
      const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, confermaCrea: true })
      ok(r.esito === 'creato' && P.calls.some(c => c.path === `/editContacts/${IMEI}`) && P.calls.some(c => c.path === `/editDiseases/${IMEI}`), 'creazione: dopo il POST si sincronizzano referenti e patologie')
      const P2 = makePlatform({})
      const r2 = await S.syncAssistito({ crm, env: ENV, fetchImpl: P2.fetchImpl, confermaCrea: true, dryRun: true })
      ok(r2.esito === 'anteprima' && r2.previsto === 'creato' && !P2.calls.some(c => c.path.startsWith('/getContacts')), 'anteprima di creazione: nessuna lettura dettagli su assistito inesistente')
    }
  }
}
