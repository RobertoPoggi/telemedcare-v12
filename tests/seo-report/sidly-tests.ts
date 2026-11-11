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
function makePlatform(opts: { patients?: Record<string, any>; tokenExpiresOnce?: boolean; alwaysFail?: number; searchResults?: any[]; searchStatus?: number } = {}) {
  const patients: Record<string, any> = opts.patients || {}
  const calls: Call[] = []
  let logins = 0
  let tokenValid = ''
  let expireOnce = !!opts.tokenExpiresOnce
  let nextId = 14879
  const fetchImpl: S.Fetch = async (url, init) => {
    const path = url.replace(ENV.SIDLY_BASE_URL!, '')
    const method = init?.method || 'GET'
    const body = init?.body ? JSON.parse(init.body) : undefined
    const token = init?.headers?.['X-Access-Token']
    const reply = (status: number, json?: any) => ({ status, text: async () => (json === undefined ? '' : JSON.stringify(json)), headers: { get: () => null } })
    if (path === '/user/login') { logins++; tokenValid = 'tok-' + logins; return reply(200, { token: tokenValid }) }
    calls.push({ method, path, body, token })
    if (expireOnce) { expireOnce = false; tokenValid = ''; return reply(401, {}) } // il token emesso è scaduto lato piattaforma
    if (!tokenValid || token !== tokenValid) return reply(401, {})
    if (opts.alwaysFail) return reply(opts.alwaysFail, {})
    if (path.startsWith('/patient/myShortInfo')) return reply(opts.searchStatus || 200, { items: opts.searchResults || [] })
    let m = path.match(/^\/patient\/(\d+)$/)
    if (method === 'GET' && m) { const p = patients[m[1]]; return p ? reply(200, p) : reply(404, {}) }
    if (method === 'POST' && path === '/manager/patient') {
      const id = nextId++
      patients[body.band.imei] = { user_id: id, user: { ...body.user }, band: { ...body.band } }
      return reply(201, { user_id: id })
    }
    m = path.match(/^\/manager\/patient\/(\d+)$/)
    if (method === 'PATCH' && m) {
      const p = patients[m[1]] || Object.values(patients).find((x: any) => String(x.user_id) === m![1])
      if (!p) return reply(404, {})
      Object.assign(p.user, body.user || {}); Object.assign(p.band, body.band || {})
      return reply(200, {})
    }
    if (method === 'POST' && path === '/manager/set-url-for-band') return reply(200, {})
    return reply(404, {})
  }
  return { fetchImpl, calls, patients, get logins() { return logins } }
}

const SRC = (over: any = {}): S.CrmSources => ({
  assistito: { id: 7, imei: IMEI, status: 'ATTIVO', nome_assistito: 'Anna', cognome_assistito: 'Rossi', telefono: '3331112233', peso: 62, altezza: 160, ...(over.assistito || {}) },
  lead: { dataNascitaAssistito: '1944-03-09', indirizzoAssistito: 'Via Roma 1', cittaAssistito: 'Milano', capAssistito: '20100', provinciaAssistito: 'MI', ...(over.lead || {}) },
  config: { telefono: '+39 333 1112233', contatto_emergenza_1_telefono: '3470001111', contatto_emergenza_2_telefono: '', ...(over.config || {}) },
  simNumber: over.simNumber === undefined ? '3897770000' : over.simNumber,
})
const crmOf = (over: any = {}) => { const r = S.buildCrmPatient(SRC(over), ENV); if ('error' in r) throw new Error(r.error); return r }

/** Il paziente come lo vedrebbe la piattaforma dopo una creazione dal CRM (tutto allineato). */
const platformFrom = (crm: S.CrmPatient, extraBand: any = {}, userOver: any = {}) => ({ user_id: 14879, user: { ...crm.user, ...userOver }, band: { ...crm.band, minHr: 50, maxHr: 120, zone: [{ lat: 1, lng: 2, r: 100 }], ...extraBand } })

/** DB D1 finto: risponde per frammento di SQL. */
function makeDb(state: { assistito?: any; lead?: any; config?: any; ddt?: any; saved?: any[]; failSave?: boolean }) {
  const saved = state.saved || []
  return {
    saved,
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
          run: async () => { if (state.failSave) throw new Error('boom'); if (sql.includes('INSERT INTO sidly_sync')) saved.push(b); return { meta: {} } },
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
  ok(c0.user.address === 'Via Roma 1, 20100 Milano (MI)' && c0.user.weight === 62 && c0.user.height === 160, 'CRM → paziente: indirizzo composto, peso, altezza')
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

  // ── caso 2: esiste e tutto uguale → invariato, nessuna PATCH ───────────────
  {
    const crm = crmOf()
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crm) } })
    const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
    ok(r.esito === 'invariato' && !P.calls.some(c => c.method === 'PATCH'), 'caso 2: tutto uguale → "invariato", nessuna PATCH')
    ok(r.sidly_user_id === '14879', 'caso 2: user_id letto dalla piattaforma')
  }

  // ── caso 3: telefono cambiato nel CRM → PATCH con SOLO user.phone ──────────
  {
    const crm = crmOf()
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crm, {}, { phone: '3339998877' }) } })
    const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
    const patch = P.calls.find(c => c.method === 'PATCH')
    ok(r.esito === 'aggiornato' && !!patch, 'caso 3: telefono diverso → "aggiornato"')
    ok(JSON.stringify(patch?.body) === '{"user":{"phone":"3331112233"}}', 'caso 3: il body della PATCH contiene SOLO user.phone')
    const txt = JSON.stringify(patch?.body)
    ok(!txt.includes('phones') && !txt.includes('zone') && !txt.includes('minHr') && !txt.includes('maxHr') && !txt.includes('band'), 'caso 3: SOS, zone e soglie NON compaiono nel body')
    ok(patch?.path === `/manager/patient/${IMEI}`, 'caso 3: PATCH sull\'IMEI')
  }

  // ── caso 4: address vuoto in piattaforma → PATCH con SOLO user.address ─────
  {
    const crm = crmOf()
    const plat = platformFrom(crm); delete (plat.user as any).address
    const P = makePlatform({ patients: { [IMEI]: plat } })
    const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
    const patch = P.calls.find(c => c.method === 'PATCH')
    ok(r.esito === 'aggiornato' && JSON.stringify(patch?.body) === '{"user":{"address":"Via Roma 1, 20100 Milano (MI)"}}', 'caso 4: address vuoto in piattaforma → PATCH con solo user.address')
  }

  // ── caso 5: vuoto nel CRM, valorizzato in piattaforma → mai azzerato ───────
  {
    const crm = crmOf({ lead: { indirizzoAssistito: '', cittaAssistito: '', capAssistito: '', provinciaAssistito: '' }, assistito: { peso: null } })
    const full = crmOf()
    const P = makePlatform({ patients: { [IMEI]: platformFrom(full) } })
    const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
    ok(r.esito === 'invariato' && !P.calls.some(c => c.method === 'PATCH'), 'caso 5: vuoto nel CRM + valorizzato in piattaforma → nessuna PATCH')
    ok(P.patients[IMEI].user.address === 'Via Roma 1, 20100 Milano (MI)' && P.patients[IMEI].user.weight === 62, 'caso 5: i dati in piattaforma restano intatti')
    const d = S.diffPatient(crm, S.normalizePlatformPatient(platformFrom(full)))
    ok(!('address' in d.userPatch) && !('weight' in d.userPatch), 'caso 5: address e weight assenti dal diff')
  }

  // ── CRM master solo per l'anagrafica; configurazione operativa = piattaforma ─
  {
    const crm = crmOf({ config: { contatto_emergenza_1_telefono: '3490001234' } })
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crm, { phones: [{ numberPrefix: '+39', number: '3470001111', repeatNumber: 1 }] }) } })
    const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
    ok(r.esito === 'invariato' && !P.calls.some(c => c.method === 'PATCH'), 'SOS diversi in piattaforma: NON sovrascritti (nessuna PATCH)')
    ok(r.warning.some(w => /SOS.*piattaforma/i.test(w)), 'SOS diversi: warning "campo gestito dalla piattaforma"')
  }
  {
    const crm = crmOf()
    const plat = platformFrom(crm, { phones: [] })
    const P = makePlatform({ patients: { [IMEI]: plat } })
    const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
    const patch = P.calls.find(c => c.method === 'PATCH')
    ok(r.esito === 'aggiornato' && Object.keys(patch?.body || {}).join() === 'band' && Object.keys(patch?.body.band).join() === 'phones', 'SOS vuoti in piattaforma → riempiti dal CRM (solo band.phones)')
  }
  {
    const crm = crmOf({ simNumber: '3891112222' })
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crm, { simNumber: '3890000000' }) } })
    const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
    ok(r.esito === 'invariato' && r.warning.some(w => /SIM/.test(w)), 'SIM diversa in piattaforma: warning, non sovrascritta')
  }
  {
    const crm = crmOf({ assistito: { nome_assistito: 'ANNA' } })
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crmOf()) } })
    const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
    ok(r.esito === 'invariato', 'differenza solo di maiuscole/minuscole nel nome → nessuna PATCH')
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
    const r = await S.syncAssistito({ crm: crmOf(), env: ENV, fetchImpl: P.fetchImpl, associaUserId: '555' })
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
    ok(r.esito === 'anteprima' && r.previsto === 'aggiornato' && !P.calls.some(c => c.method !== 'GET'), 'anteprima: mostra cosa farebbe e non scrive nulla (solo GET)')
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
    const login = await (async () => { let b: any; const f: S.Fetch = async (u, i) => { if (u.endsWith('/user/login')) b = JSON.parse(i.body); return { status: 200, text: async () => '{"token":"t"}' } }; S.resetSidlyTokenCache(); await new S.SidlyClient(ENV, f).request('GET', '/x'); return b })()
    ok(login && login.login === 'u-test' && login.password === 'p-segreta-xyz', 'login: credenziali prese dai segreti (campo "login" di default)')
    const login2 = await (async () => { let b: any; const f: S.Fetch = async (u, i) => { if (u.endsWith('/user/login')) b = JSON.parse(i.body); return { status: 200, text: async () => '{"token":"t"}' } }; S.resetSidlyTokenCache(); await new S.SidlyClient({ ...ENV, SIDLY_LOGIN_FIELD: 'username' }, f).request('GET', '/x'); return b })()
    ok(login2 && login2.username === 'u-test' && !('login' in login2), 'login: nome del campo utente configurabile (SIDLY_LOGIN_FIELD)')
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
    ok(/fetch\('\/api\/sidly\/sync-assistito'/.test(dash) && /conferma_richiesta/.test(dash) && /escapeHtml\(a\.azione\)/.test(dash) && /escapeHtml\(c\.campo\)/.test(dash), 'dashboard: chiama l\'endpoint, gestisce la conferma omonimi ed esegue l\'escape dei valori mostrati')
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
    const sec = readFileSync('src/modules/sidly-sync.ts', 'utf8')
    ok(!/console\.(log|warn|error)/.test(sec), 'sidly-sync.ts: nessun console.* (niente fuga di token o dati)')
    ok(!/CREATE TABLE IF NOT EXISTS sidly_sync[\s\S]*ALTER TABLE/.test(sec) && !/ALTER TABLE/.test(sec), 'nessun ALTER TABLE: lo stato sta nella tabella laterale sidly_sync')
  }
}
