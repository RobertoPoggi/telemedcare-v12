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
function makePlatform(opts: { patients?: Record<string, any>; tokenExpiresOnce?: boolean; alwaysFail?: number; searchResults?: any[]; searchStatus?: number; noFullRecord?: boolean; contacts?: any[]; diseases?: any; card?: any; detailStatus?: number; patchDetailStatus?: number } = {}) {
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
    ok(r.esito === 'aggiornato' && JSON.stringify(patch?.body) === '{"user":{"address":"Via Roma 1, Milano, MI, 20100"}}', 'caso 4: address vuoto in piattaforma → PATCH con solo user.address')
  }

  // ── caso 5: vuoto nel CRM, valorizzato in piattaforma → mai azzerato ───────
  {
    const crm = crmOf({ lead: { indirizzoAssistito: '', cittaAssistito: '', capAssistito: '', provinciaAssistito: '' }, assistito: { peso: null } })
    const full = crmOf()
    const P = makePlatform({ patients: { [IMEI]: platformFrom(full) } })
    const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
    ok(r.esito === 'invariato' && !P.calls.some(c => c.method === 'PATCH'), 'caso 5: vuoto nel CRM + valorizzato in piattaforma → nessuna PATCH')
    ok(P.patients[IMEI].user.address === 'Via Roma 1, Milano, MI, 20100' && P.patients[IMEI].user.weight === 62, 'caso 5: i dati in piattaforma restano intatti')
    const d = S.diffPatient(crm, S.normalizePlatformPatient(platformFrom(full)))
    ok(!('address' in d.userPatch) && !('weight' in d.userPatch), 'caso 5: address e weight assenti dal diff')
  }

  // ── SOS = referenti ("Dettagli utente"): il CRM e' master, ma le soglie/zone/misure restano della piattaforma ─
  {
    const crm = crmOf({ config: { contatto_emergenza_1_telefono: '3490001234' } })
    const P = makePlatform({ patients: { [IMEI]: platformFrom(crm, { phones: [{ numberPrefix: '+39', number: '3470001111', repeatNumber: 1 }] }) } })
    const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
    const patch = P.calls.find(c => c.method === 'PATCH' && c.path.startsWith('/manager/patient/'))
    ok(r.esito === 'aggiornato' && Object.keys(patch?.body || {}).join() === 'band' && Object.keys(patch?.body.band).join() === 'phones', 'SOS diversi in piattaforma → allineati al CRM (solo band.phones nella PATCH)')
    const txt = JSON.stringify(patch?.body)
    ok(!txt.includes('minHr') && !txt.includes('maxHr') && !txt.includes('zone') && !txt.includes('measure'), 'SOS allineati: soglie FC, zone e misure NON compaiono nel body')
    ok(r.warning.some(w => /SOS.*sostituiti/i.test(w)) && r.campi_inviati.some(c => c.campo === 'band.phones' && Array.isArray(c.precedente)), 'SOS sostituiti: warning e valore precedente mostrati all\'operatore')
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
      ok(!rf.campi_inviati.some(c => ['user.address', 'user.date', 'user.phonePrefix'].includes(c.campo)), 'scheda completa: indirizzo, data e prefisso già presenti su SiDLY → NON vengono inviati')
      ok(!!rf.diagnostica && (rf.diagnostica as any).forma_scheda_completa !== 'non leggibile', 'anteprima: diagnostica anche sulla forma della scheda completa')

      // scheda completa non leggibile → mai scrivere campi che non posso confrontare
      const Pn = makePlatform({ noFullRecord: true, patients: { [IMEI]: { ...piena, ...brevePlat } } })
      const rn = await S.syncAssistito({ crm, env: ENV, fetchImpl: Pn.fetchImpl })
      ok(!rn.campi_inviati.some(c => ['user.address', 'user.date', 'user.phonePrefix'].includes(c.campo)), 'scheda completa non leggibile: indirizzo, data e prefisso NON vengono inviati')
      ok(rn.warning.some(w => /Scheda completa SiDLY non leggibile/.test(w)), 'scheda completa non leggibile: avviso esplicito all\'operatore')
      ok(!Pn.calls.some(c => c.method === 'PATCH' && c.body?.user && ('address' in c.body.user || 'date' in c.body.user || 'phonePrefix' in c.body.user)), 'scheda completa non leggibile: nessuna PATCH con quei campi')

      // scheda completa vuota su SiDLY → i campi mancanti si compilano
      const Pv = makePlatform({ patients: { [IMEI]: { user_id: 14879, id: 14879, imei: IMEI, user: { first_name: 'Anna', last_name: 'Rossi' }, band: {}, first_name: 'Anna', last_name: 'Rossi' } } })
      const rv = await S.syncAssistito({ crm, env: ENV, fetchImpl: Pv.fetchImpl, dryRun: true })
      ok(rv.campi_inviati.some(c => c.campo === 'user.address') && rv.campi_inviati.some(c => c.campo === 'user.date'), 'scheda completa con campi vuoti: indirizzo e data vengono proposti')
    }
    // Anteprima: per ogni campo anagrafico si mostra anche il valore attuale su SiDLY (vuoto o diverso)
    {
      const crm = crmOf()
      const base = (addr: any) => ({ user_id: 14879, id: 14879, imei: IMEI, first_name: 'Anna', last_name: 'Rossi', user: { first_name: 'Anna', last_name: 'Rossi', birth_date: '1944-03-09', phonePrefix: '+39', phone: '3331112233', weight: 62, height: 160, address: addr }, band: { simNumber: '3897770000' } })
      const rE = await S.syncAssistito({ crm, env: ENV, dryRun: true, fetchImpl: makePlatform({ patients: { [IMEI]: base('') } }).fetchImpl })
      const cE = rE.campi_inviati.find(c => c.campo === 'user.address')
      ok(!!cE && cE.precedente === '', 'anteprima: indirizzo vuoto su SiDLY → precedente "" (nessuna sovrascrittura di valori esistenti)')
      const rD = await S.syncAssistito({ crm, env: ENV, dryRun: true, fetchImpl: makePlatform({ patients: { [IMEI]: base('Via Vecchia 9, Genova') } }).fetchImpl })
      const cD = rD.campi_inviati.find(c => c.campo === 'user.address')
      ok(!!cD && cD.precedente === 'Via Vecchia 9, Genova', 'anteprima: indirizzo diverso su SiDLY → mostrato il valore attuale che verrebbe sovrascritto')
      const sommario = JSON.stringify({ esito: rD.esito, azioni: rD.azioni.map(a => ({ azione: a.azione, risultato: a.risultato })), warning: rD.warning })
      ok(!sommario.includes('Via Vecchia'), 'sidly_sync: il riepilogo salvato nel DB non contiene valori anagrafici')
    }
    ok(/function sidlyConfronto/.test(dash) && /<th style="' \+ th \+ '">SiDLY<\/th><th style="' \+ th \+ '">CRM<\/th>/.test(dash), 'dashboard: tabella orizzontale con le colonne SiDLY e CRM')
    ok(/campo non presente nel CRM/.test(dash) && /campo non presente su SiDLY/.test(dash) && /solo su SiDLY/.test(dash) && /solo nel CRM/.test(dash), 'dashboard: i campi che esistono da una sola parte sono marcati come tali')
    ok(/verrà aggiornato col valore del CRM/.test(dash) && /diverso: non lo tocco/.test(dash) && /<details/.test(dash) && /Dettagli tecnici/.test(dash), 'dashboard: esito per riga e note tecniche nascoste nei \"Dettagli tecnici\"')
    ok(/white-space:pre-line/.test(dash) && /max-width:1040px/.test(dash) && /position:sticky/.test(dash), 'dashboard: valori su più righe, pannello largo e intestazione fissa')
    ok(/r\.previsto !== 'invariato'/.test(dash), 'dashboard: il pulsante \"Conferma\" compare solo se c\'è qualcosa da scrivere')
    ok(/payload\.dry_run = true/.test(dash) && /conferma_scrittura = true/.test(dash) && /window\.sidlyConfirm/.test(dash) && /Conferma e scrivi su SiDLY/.test(dash), 'dashboard: il click apre SEMPRE l\'anteprima; si scrive solo dopo "Conferma e scrivi"')
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
    ok(crm.band.whitelistNumbers === '+390102345678,+393331234567' && crm.band.whiteListAlias === 'Farmacia Centrale,Vicina', 'numeri ammessi → whitelistNumbers / whiteListAlias (stringhe separate da virgola)')
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
      ok(!r.campi_inviati.some(c => c.campo === 'user.address'), 'indirizzo già presente in altro formato → non viene riscritto')
    }

    // piattaforma con contatti/malattie vuoti: tutto si compila
    {
      const plat = platformFrom(crm, { phones: [], whitelistNumbers: '', whiteListAlias: '' })
      const P = makePlatform({ patients: { [IMEI]: plat }, contacts: [], diseases: { id: 55, walking_person: 'sì', hearing: 'ok' }, card: {} })
      const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
      const pc = P.calls.find(c => c.method === 'PATCH' && c.path === `/editContacts/${IMEI}`)
      const pd = P.calls.find(c => c.method === 'PATCH' && c.path === `/editDiseases/${IMEI}`)
      ok(r.esito === 'aggiornato' && !!pc && !!pd, 'piattaforma vuota: PATCH su editContacts e editDiseases')
      ok(pc?.body.contact1Name === 'Mario Bianchi' && pc?.body.contact3Phone === '+393490003333' && pc?.body.contact2Name === 'Luisa Verdi', 'editContacts: i tre referenti nelle posizioni 1-3')
      ok(pc?.body.contact1Others === 'email: m@x.it', 'editContacts: email del referente nel campo "altro"')
      ok(pd?.body.nadcisnienie === 1 && pd?.body.cukrzyca === 1 && pd?.body.diseaseID === 55 && pd?.body.medicines.includes('Cardioaspirina') && pd?.body.allergy === 'Penicillina', 'editDiseases: interruttori, farmaci, allergie e diseaseID')
      ok(pd?.body.walkingPerson === 'sì' && pd?.body.hearing === 'ok', 'editDiseases: i campi di autonomia già su SiDLY vengono rimandati invariati (il CRM non li possiede)')
      const pb = P.calls.find(c => c.method === 'PATCH' && c.path.startsWith('/manager/patient/'))
      ok(pb?.body.band.whitelistNumbers === crm.band.whitelistNumbers && pb?.body.band.phones.length === 3, 'band: numeri ammessi e tre SOS nella stessa PATCH')
      ok(!JSON.stringify(P.calls.filter(c => c.method === 'PATCH').map(c => c.body)).includes('minHr'), 'nessuna PATCH tocca soglie FC')
      // secondo giro: tutto allineato → invariato (idempotenza)
      const P2calls = P.calls.length
      const r2 = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl })
      ok(r2.esito === 'invariato' && !P.calls.slice(P2calls).some(c => c.method === 'PATCH'), 'secondo click: invariato, nessuna PATCH (idempotenza)')
    }

    {
      const P = makePlatform({ patients: { [IMEI]: platformFrom(crm) } , contacts: [], diseases: { id: 1 } })
      const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, dryRun: true })
      ok(!r.campi_inviati.some(c => c.campo === 'band.whitelistNumbers' || c.campo === 'band.phones'), 'numeri ammessi e SOS già allineati su SiDLY → non inviati')
    }

    // referenti: non azzera, mantiene parentela/indirizzo di SiDLY, segnala valori diversi sostituiti
    {
      const contacts = [
        { id: 1, name: 'Mario Bianchi', phone_num: '3470001111', family_kind: 'figlio', address: 'Via X', others: 'note SiDLY' },
        { id: 2, name: 'Vecchia Persona', phone_num: '3200000000', family_kind: 'vicina', address: '', others: '' },
      ]
      const pl = S.planContacts(crm, { data: contacts })
      ok(!!pl.form && pl.form.contact1Affinity === 'figlio' && pl.form.contact1Address === 'Via X' && pl.form.contact1Others === 'note SiDLY', 'referenti: parentela, indirizzo e note già su SiDLY non vengono azzerati né sovrascritti')
      ok(pl.form?.contact2Name === 'Luisa Verdi' && pl.form?.contact2Affinity === 'vicina' && pl.form?.contact2ID === 2, 'referente 2: nome/telefono dal CRM, parentela di SiDLY mantenuta, ID conservato')
      ok(pl.campi.some(c => c.campo === 'referente2.telefono' && c.precedente === '3200000000'), 'referente sostituito: mostrato il valore precedente')
      ok(!pl.campi.some(c => c.campo.startsWith('referente1.')), 'referente 1 già uguale (anche senza prefisso): nessun campo inviato')
      const noChange = S.planContacts(crmOf({ config: { contatto1_nome: 'Mario', contatto1_cognome: 'Bianchi', contatto1_telefono: '3470001111' } }), { data: [contacts[0]] })
      ok(noChange.form === null, 'referenti già allineati → nessuna PATCH')
      ok(!Object.values(pl.form || {}).some(v => v === undefined || v === null), 'editContacts: nessun valore undefined/null nel body')
    }

    // patologie: gli interruttori si accendono ma non si spengono; testi diversi → solo segnalati
    {
      const pl = S.planDiseases(crm, { data: { id: 9, parkinson: 1, cukrzyca: 0, nadcisnienie: 1, allergy: 'Polline', medicines: '', other_diseases: 'Glaucoma, Ictus' } })
      ok(pl.form?.parkinson === 1 && pl.form?.cukrzyca === 1 && pl.form?.nadcisnienie === 1, 'patologie: parkinson (solo su SiDLY) mantenuto, diabete acceso')
      ok(pl.form?.allergy === 'Polline' && !pl.campi.some(c => c.campo === 'patologie.allergy'), 'allergie diverse su SiDLY: non sovrascritte')
      ok(pl.differenze.some(d => d.campo === 'patologie.allergy' && d.crm === 'Penicillina' && d.sidly === 'Polline'), 'allergie diverse: riportate in "differenze"')
      ok(!pl.differenze.some(d => d.campo === 'patologie.other_diseases'), 'altre patologie già contenute su SiDLY: nessuna differenza')
      ok(!!pl.form?.medicines && pl.campi.some(c => c.campo === 'patologie.medicines' && c.precedente === ''), 'farmaci vuoti su SiDLY: compilati dal CRM')
      const none = S.planDiseases(crmOf({ config: { patologie_croniche: '[]' } }), { data: { id: 1 } })
      ok(none.form === null, 'nessuna patologia nel CRM → nessuna PATCH')
    }

    // scheda: sola lettura + differenze, e le differenze non finiscono nel riepilogo salvato
    {
      const plat = platformFrom(crm)
      const P = makePlatform({ patients: { [IMEI]: plat }, contacts: [], diseases: { id: 1 }, card: { name_of_doctor: 'Dott. Rossi', hospital_info: '' } })
      const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, dryRun: true })
      ok(r.differenze?.some(d => d.campo === 'scheda.name_of_doctor' && d.sidly === 'Dott. Rossi') && r.differenze?.some(d => d.campo === 'scheda.hospital_info'), 'scheda assistito: differenze con medico e centro riportate')
      ok(P.calls.some(c => c.path === `/patientCard/${IMEI}` && c.method === 'GET') && !P.calls.some(c => c.path.startsWith('/patientCard') && c.method !== 'GET'), 'scheda assistito: solo lettura (nessuna scrittura)')
      ok(!P.calls.some(c => c.method !== 'GET' && c.path !== '/user/login'), 'anteprima: nessuna scrittura su nessun endpoint')
      const diag = JSON.stringify(r.diagnostica || {})
      ok(!diag.includes('Dott. Rossi') && !diag.includes('Mario') && /forma_contatti/.test(diag) && /forma_patologie/.test(diag), 'diagnostica dettagli: solo struttura, nessun dato personale')
    }

    // testi leggibili e riepilogo per l'operatore
    {
      const plat = platformFrom(crm, { phones: [{ numberPrefix: '+39', number: '3470001111', repeatNumber: 1 }], whitelistNumbers: '' })
      const P = makePlatform({ patients: { [IMEI]: plat }, contacts: [{ id: 1, name: 'Mario Bianchi', phone_num: '3470001111', family_kind: 'figlio', address: '', others: 'email: m@x.it' }, { id: 2, name: 'Luisa Verdi', phone_num: '+39 348 0002222', family_kind: '', address: '', others: '' }, { id: 3, name: 'Paolo Neri', phone_num: '3490003333', family_kind: '', address: '', others: '' }], diseases: { id: 1, nadcisnienie: 1, cukrzyca: 1, allergy: 'Penicillina', other_diseases: 'Ictus, Glaucoma', medicines: 'Cardioaspirina 100mg mattina', more_info: 'Cammina col bastone' }, card: { name_of_doctor: 'Dott. Gallo - 0101112222', hospital_info: 'Ospedale Galliera' } })
      const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, dryRun: true })
      ok(r.assistito === 'Anna Rossi', 'anteprima: nome dell\'assistito per il titolo del pannello')
      const sos = r.campi_inviati.find(c => c.campo === 'band.phones')
      ok(sos?.etichetta === 'Numeri SOS (i 3 referenti)' && /Mario Bianchi \+393470001111/.test(sos?.mostra_dopo || '') && (sos?.mostra_dopo || '').split('\n').length === 3, 'SOS: etichetta italiana e un numero per riga con il nome del referente')
      ok(sos?.mostra_prima === '+393470001111', 'SOS: \"prima\" leggibile (un solo numero)')
      const wl = r.campi_inviati.find(c => c.campo === 'band.whitelistNumbers')
      ok(wl?.etichetta === 'Numeri ammessi' && (wl?.mostra_dopo || '').split('\n').length === 2 && /Farmacia Centrale \+390102345678/.test(wl?.mostra_dopo || '') && wl?.mostra_prima === '', 'numeri ammessi: etichetta italiana, un numero per riga con il nome')
      ok(!r.campi_inviati.some(c => !c.etichetta || c.etichetta === c.campo), 'ogni campo mostrato ha un\'etichetta in italiano (niente nomi tecnici)')
      ok((r.riepilogo || []).find(x => /^Referenti/.test(x.sezione))?.stato === 'allineato' && (r.riepilogo || []).find(x => /^Numeri SOS/.test(x.sezione))?.stato === 'cambia' && (r.riepilogo || []).find(x => /^Numeri ammessi/.test(x.sezione))?.stato === 'cambia', 'riepilogo: referenti già allineati, SOS e numeri ammessi da cambiare')
      ok((r.riepilogo || []).find(x => /^Patologie/.test(x.sezione))?.stato === 'allineato' && (r.riepilogo || []).find(x => /^Scheda assistito/.test(x.sezione))?.stato === 'allineato', 'riepilogo: patologie e scheda assistito già allineate')
      const rm = await S.syncAssistito({ crm, env: ENV, fetchImpl: makePlatform({ patients: { [IMEI]: platformFrom(crm) }, detailStatus: 500 }).fetchImpl, dryRun: true })
      ok((rm.riepilogo || []).find(x => /^Referenti/.test(x.sezione))?.stato === 'non_verificato', 'riepilogo: lettura fallita → \"non verificabile\" (mai \"già uguale\")')
      ok(S.etichettaCampo('patologie.nadcisnienie') === 'Patologia: ipertensione' && S.etichettaCampo('referente2.telefono') === 'Referente 2 · telefono', 'etichette: patologie e referenti in italiano')
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
      ok(row('Referente 2 · nome')?.stato === 'cambia' && row('Referente 2 · nome')?.sidly === '' && row('Referente 2 · nome')?.crm === 'Luisa Verdi', 'confronto: referente 2 assente su SiDLY → da aggiornare')
      ok(row('Numeri ammessi (whitelist)')?.stato === 'cambia' && row('Numeri ammessi (whitelist)')?.sidly === '', 'confronto: numeri ammessi vuoti su SiDLY → da aggiornare')
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
      ok((r.confronto || []).length > 10 && (r.confronto || []).find(x => x.campo === 'Nome')?.stato === 'cambia' && !P.calls.some(c => c.path.startsWith('/getContacts')), 'confronto: assistito nuovo → righe da creare, nessuna lettura dettagli')
      const blob = JSON.stringify(r.confronto)
      ok(!blob.includes('p-segreta-xyz') && !blob.includes('tok-'), 'confronto: nessun token o password')
    }

    // errori: lettura o scrittura dei dettagli non riuscita
    {
      const P = makePlatform({ patients: { [IMEI]: platformFrom(crm) }, detailStatus: 500 })
      const r = await S.syncAssistito({ crm, env: ENV, fetchImpl: P.fetchImpl, dryRun: true })
      ok(r.esito === 'anteprima' && r.warning.some(w => /Referenti non sincronizzati/.test(w)) && r.warning.some(w => /Patologie e farmaci non sincronizzati/.test(w)), 'lettura dettagli fallita (HTTP 500): avvisi, nessun invio alla cieca')
      const P2 = makePlatform({ patients: { [IMEI]: platformFrom(crm) }, contacts: [], diseases: { id: 1 }, patchDetailStatus: 500 })
      const r2 = await S.syncAssistito({ crm, env: ENV, fetchImpl: P2.fetchImpl })
      ok(r2.esito === 'errore' && /referenti/i.test(r2.errore || ''), 'scrittura referenti fallita → esito errore con messaggio chiaro')
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
