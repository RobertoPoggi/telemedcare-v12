/**
 * Sincronizzazione gentile (upsert idempotente) di un assistito CRM verso SiDLY Health.
 *
 * Regole (dal prompt "Carica su SiDLY"):
 *  - assistito assente in piattaforma  -> creazione (POST /manager/patient)
 *  - assistito presente                -> PATCH dei soli campi vuoti in piattaforma o diversi dal CRM
 *                                         (CRM master solo per l'anagrafica amministrativa)
 *  - mai inviare campi vuoti del CRM (si omettono, non si azzera)
 *  - configurazione operativa (SOS, soglie, zone, notifiche) = master la piattaforma:
 *    su assistito esistente si riempie solo se vuota, se diverge si segnala un warning
 *  - URL di consegna frame registrato solo se configurato (SIDLY_FRAME_URL)
 *
 * Nessun segreto nei log o nelle risposte. Le risposte della piattaforma non vengono mai copiate
 * nei messaggi d'errore (solo il codice HTTP).
 *
 * ATTENZIONE: i nomi dei campi di login / risposta e il formato del prefisso telefonico NON sono
 * nel prompt: sono isolati qui sotto (LOGIN_*, PHONE_PREFIX_FORMAT, normalizePlatformPatient) e
 * documentati in docs/sidly-sync/OPEN_QUESTIONS.md. Vanno verificati sull'ambiente dev SiDLY.
 */

export interface SidlyEnv {
  SIDLY_USER?: string
  SIDLY_PASSWORD?: string
  SIDLY_BASE_URL?: string
  /** URL pubblico https a cui SiDLY deve inoltrare i frame (Canale 2). Se assente il passo viene saltato. */
  SIDLY_FRAME_URL?: string
  /** JSON opzionale con i default operativi per la CREAZIONE (fall, sos_notif, minHr, ...). */
  SIDLY_BAND_DEFAULTS?: string
  /** Nome del campo utente nel body di /user/login. Default "login" (non documentato). */
  SIDLY_LOGIN_FIELD?: string
}

export type Fetch = (url: string, init?: any) => Promise<{ status: number; ok?: boolean; text(): Promise<string>; headers?: any }>

export type Esito = 'creato' | 'aggiornato' | 'invariato' | 'errore' | 'anteprima' | 'conferma_richiesta'

export interface Azione { azione: string; risultato: string; campi?: string[] }
export interface CampoInviato { campo: string; valore: any }
export interface Candidato { user_id: string; first_name: string; last_name: string }

export interface SyncResult {
  esito: Esito
  previsto?: 'creato' | 'aggiornato' | 'invariato'
  sidly_user_id: string | null
  azioni: Azione[]
  warning: string[]
  campi_inviati: CampoInviato[]
  url_for_band: { registrato: boolean; url?: string; motivo?: string }
  candidati?: Candidato[]
  motivo_conferma?: string
  errore?: string
  /** Solo in anteprima: struttura (nomi dei campi e tipi, MAI valori) della risposta di GET /patient. */
  diagnostica?: { forma_risposta_patient: unknown }
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalizzazioni dei dati CRM
// ─────────────────────────────────────────────────────────────────────────────

// Formato del prefisso inviato in user.phonePrefix / phones[].numberPrefix (NON documentato: "+39" assunto).
const PHONE_PREFIX_FORMAT = (digits: string) => '+' + digits
const DEFAULT_PREFIX_DIGITS = '39'
const DEFAULT_SOS_REPEAT = 1 // semantica di repeatNumber non documentata

const KNOWN_PREFIXES = [
  '1', '7', '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47', '48', '49',
  '351', '352', '353', '354', '355', '356', '357', '358', '359', '370', '371', '372', '380', '385', '386', '420', '421',
].sort((a, b) => b.length - a.length)

export function splitPhone(raw: unknown): { prefix: string; number: string } | null {
  let s = String(raw ?? '').trim()
  if (!s) return null
  s = s.replace(/[^\d+]/g, '')
  if (s.startsWith('00')) s = '+' + s.slice(2)
  if (s.startsWith('+')) {
    const d = s.slice(1)
    const p = KNOWN_PREFIXES.find(x => d.startsWith(x))
    if (!p || d.length - p.length < 6) return null
    return { prefix: PHONE_PREFIX_FORMAT(p), number: d.slice(p.length) }
  }
  if (s.length < 6) return null
  // "39" + 10 cifre (mobile) o + fisso: prefisso scritto senza "+"
  if (s.startsWith('39') && (s.length === 12 || s.length === 13)) {
    return { prefix: PHONE_PREFIX_FORMAT('39'), number: s.slice(2) }
  }
  return { prefix: PHONE_PREFIX_FORMAT(DEFAULT_PREFIX_DIGITS), number: s }
}

export function parseBirthDate(raw: unknown): { year: number; month: number; day: number } | null {
  const s = String(raw ?? '').trim()
  if (!s) return null
  let y = 0, mo = 0, d = 0
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) { y = +m[1]; mo = +m[2]; d = +m[3] } else {
    m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})/)
    if (!m) return null
    d = +m[1]; mo = +m[2]; y = +m[3]
  }
  const dt = new Date(Date.UTC(y, mo - 1, d))
  const real = dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d
  if (!real || y < 1900 || y > new Date().getUTCFullYear()) return null
  return { year: y, month: mo, day: d }
}

function toNum(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const n = parseFloat(String(raw).replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : null
}

function toStr(raw: unknown): string { return String(raw ?? '').trim() }
const digits = (v: unknown) => String(v ?? '').replace(/\D/g, '')
function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true
  if (typeof v === 'string') return v.trim() === ''
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') return Object.keys(v as object).length === 0
  return false
}

// ─────────────────────────────────────────────────────────────────────────────
// Dati CRM -> paziente SiDLY
// ─────────────────────────────────────────────────────────────────────────────

export interface CrmSources { assistito: any; lead: any | null; config: any | null; simNumber: string | null }
export interface SosPhone { numberPrefix: string; number: string; repeatNumber: number }
export interface CrmPatient {
  imei: string
  user: { firstName: string; lastName: string; date?: { year: number; month: number; day: number }; weight?: number; height?: number; phonePrefix?: string; phone?: string; address?: string }
  band: { imei: string; phones?: SosPhone[]; simNumber?: string; timezone: string; lang_band: string; [k: string]: any }
  warnings: string[]
}

const BAND_DEFAULT_KEYS = ['fall', 'sos_notif', 'fall_notif', 'zone_notif', 'measure', 'minHr', 'maxHr', 'isHr'] as const

export function parseBandDefaults(raw: string | undefined): Record<string, any> {
  if (!raw) return {}
  try {
    const o = JSON.parse(raw)
    const out: Record<string, any> = {}
    for (const k of BAND_DEFAULT_KEYS) if (o && o[k] !== undefined && o[k] !== null) out[k] = o[k]
    return out
  } catch { return {} }
}

export function buildCrmPatient(src: CrmSources, env: SidlyEnv): CrmPatient | { error: string } {
  const a = src.assistito || {}
  const lead = src.lead || {}
  const cfg = src.config || {}
  const warnings: string[] = []

  const imei = digits(a.imei)
  if (!imei) return { error: 'L\'assistito non ha un IMEI assegnato' }

  let firstName = toStr(a.nome_assistito) || toStr(cfg.nome_assistito) || toStr(lead.nomeAssistito)
  let lastName = toStr(a.cognome_assistito) || toStr(cfg.cognome_assistito) || toStr(lead.cognomeAssistito)
  if (!firstName || !lastName) {
    const parts = toStr(a.nome).split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      firstName = firstName || parts[0]
      lastName = lastName || parts.slice(1).join(' ')
      warnings.push('Nome e cognome ricavati dal campo "nome" unico: controlla che siano divisi correttamente')
    }
  }
  if (!firstName || !lastName) return { error: 'Nome e cognome dell\'assistito mancanti nel CRM' }

  const user: CrmPatient['user'] = { firstName, lastName }

  const birth = parseBirthDate(cfg.data_nascita) || parseBirthDate(lead.dataNascitaAssistito)
  if (birth) user.date = birth
  else if (toStr(cfg.data_nascita) || toStr(lead.dataNascitaAssistito)) warnings.push('Data di nascita presente ma non interpretabile: non inviata')

  const weight = toNum(a.peso) ?? toNum(cfg.peso)
  if (weight) user.weight = weight
  let height = toNum(a.altezza) ?? toNum(cfg.altezza)
  if (height && height < 3) height = Math.round(height * 100) // metri -> cm (unita' piattaforma assunta: cm)
  if (height) user.height = height

  const cfgPhone = splitPhone(cfg.telefono)
  const aPhone = splitPhone(a.telefono)
  const ph = cfgPhone || aPhone
  if (ph) {
    user.phonePrefix = ph.prefix
    user.phone = ph.number
    if (!cfgPhone && aPhone) warnings.push('Telefono preso dall\'anagrafica assistiti: potrebbe essere quello del richiedente, non dell\'assistito')
  } else if (toStr(cfg.telefono) || toStr(a.telefono)) {
    warnings.push('Telefono presente ma non interpretabile: non inviato')
  }

  const addr = [
    toStr(lead.indirizzoAssistito),
    [toStr(lead.capAssistito), toStr(lead.cittaAssistito)].filter(Boolean).join(' '),
  ].filter(Boolean).join(', ')
  const prov = toStr(lead.provinciaAssistito)
  const address = addr && prov ? `${addr} (${prov})` : addr
  if (address) user.address = address

  const band: CrmPatient['band'] = { imei, timezone: 'Europe/Rome', lang_band: 'IT' }
  const phones: SosPhone[] = []
  for (const key of ['contatto_emergenza_1_telefono', 'contatto_emergenza_2_telefono']) {
    const sp = splitPhone(cfg[key])
    if (sp && !phones.some(p => digits(p.numberPrefix) + p.number === digits(sp.prefix) + sp.number)) {
      phones.push({ numberPrefix: sp.prefix, number: sp.number, repeatNumber: DEFAULT_SOS_REPEAT })
    }
  }
  if (phones.length) band.phones = phones
  else warnings.push('Nessun numero SOS (contatti di emergenza) nel CRM')
  if (toStr(src.simNumber)) band.simNumber = toStr(src.simNumber)

  return { imei, user, band, warnings }
}

// ─────────────────────────────────────────────────────────────────────────────
// Risposta piattaforma -> forma comune (formato di GET /patient non documentato nel prompt)
// ─────────────────────────────────────────────────────────────────────────────

export interface PlatformPatient {
  userId: string | null
  user: { firstName?: string; lastName?: string; date?: { year: number; month: number; day: number } | null; weight?: number | null; height?: number | null; phonePrefix?: string; phone?: string; address?: string }
  band: { phones?: SosPhone[]; simNumber?: string }
}

export function normalizePlatformPatient(resp: any): PlatformPatient {
  const root = (resp && typeof resp === 'object' && resp.data && typeof resp.data === 'object') ? resp.data : (resp || {})
  const u = root.user || root.patient || root
  const b = root.band || root.device || {}
  const pick = (...vals: any[]) => vals.find(v => v !== undefined && v !== null)
  // Il portale SiDLY usa nomi diversi a seconda della schermata: birth_date (scheda), date (modifica).
  let date = pick(u.date, u.birth_date, u.birthDate, root.birth_date)
  if (typeof date === 'string') date = parseBirthDate(date)
  else if (date && typeof date === 'object') {
    date = { year: Number(date.year), month: Number(date.month), day: Number(date.day) }
    if (!date.year || !date.month || !date.day) date = null
  } else date = null
  const rawPhones = pick(b.phones, root.phones, u.phones)
  const phones: SosPhone[] = Array.isArray(rawPhones)
    ? rawPhones.filter((p: any) => p && (p.number || p.numberPrefix)).map((p: any) => ({ numberPrefix: String(p.numberPrefix ?? ''), number: String(p.number ?? ''), repeatNumber: Number(p.repeatNumber ?? 0) }))
    : []
  const id = pick(root.user_id, u.user_id, root.userId, u.userId, root.id, u.id)
  return {
    userId: id === undefined ? null : String(id),
    user: {
      firstName: pick(u.firstName, u.first_name),
      lastName: pick(u.lastName, u.last_name),
      date,
      weight: toNum(u.weight),
      height: toNum(u.height),
      phonePrefix: pick(u.phonePrefix, u.phone_prefix),
      phone: pick(u.phone),
      address: pick(u.address),
    },
    band: { phones, simNumber: pick(b.simNumber, b.sim_number, u.sim_number, u.simNumber, root.sim_number, root.simNumber) },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DIFF (CRM master per l'anagrafica; piattaforma master per la configurazione operativa)
// ─────────────────────────────────────────────────────────────────────────────

export interface Diff { userPatch: Record<string, any>; bandPatch: Record<string, any>; warnings: string[]; campi: CampoInviato[] }

const eqStr = (a: any, b: any) => toStr(a).toLowerCase() === toStr(b).toLowerCase()
const eqDigits = (a: any, b: any) => digits(a) === digits(b)
const eqNum = (a: any, b: any) => Math.abs(Number(a) - Number(b)) < 0.05
const eqDate = (a: any, b: any) => !!a && !!b && Number(a.year) === Number(b.year) && Number(a.month) === Number(b.month) && Number(a.day) === Number(b.day)
const USER_EQ: Record<string, (a: any, b: any) => boolean> = {
  firstName: eqStr, lastName: eqStr, address: eqStr, phone: eqDigits, phonePrefix: eqDigits, date: eqDate, weight: eqNum, height: eqNum,
}
const phoneKey = (p: SosPhone) => digits(p.numberPrefix) + digits(p.number)

export function diffPatient(crm: CrmPatient, plat: PlatformPatient): Diff {
  const userPatch: Record<string, any> = {}
  const bandPatch: Record<string, any> = {}
  const warnings: string[] = []
  const campi: CampoInviato[] = []

  for (const k of Object.keys(USER_EQ)) {
    const c = (crm.user as any)[k]
    if (isEmpty(c)) continue // mai azzerare: campo vuoto nel CRM = omesso
    const p = (plat.user as any)[k]
    if (isEmpty(p) || !USER_EQ[k](c, p)) {
      userPatch[k] = c
      campi.push({ campo: 'user.' + k, valore: c })
    }
  }

  // Configurazione operativa: la piattaforma e' master.
  const cPhones = crm.band.phones || []
  const pPhones = plat.band.phones || []
  if (cPhones.length) {
    if (pPhones.length === 0) {
      bandPatch.phones = cPhones
      campi.push({ campo: 'band.phones', valore: cPhones })
    } else {
      const a = new Set(cPhones.map(phoneKey)), b = new Set(pPhones.map(phoneKey))
      const same = a.size === b.size && [...a].every(x => b.has(x))
      if (!same) warnings.push('Numeri SOS diversi tra CRM e piattaforma: campo gestito dalla piattaforma, verifica sul portale SiDLY (non modificato)')
    }
  }
  if (crm.band.simNumber) {
    if (isEmpty(plat.band.simNumber)) {
      bandPatch.simNumber = crm.band.simNumber
      campi.push({ campo: 'band.simNumber', valore: crm.band.simNumber })
    } else if (!eqDigits(crm.band.simNumber, plat.band.simNumber)) {
      warnings.push('Numero SIM diverso tra CRM e piattaforma: campo gestito dalla piattaforma, verifica sul portale SiDLY (non modificato)')
    }
  }
  return { userPatch, bandPatch, warnings, campi }
}

// ─────────────────────────────────────────────────────────────────────────────
// Client REST SiDLY (login, token in cache, re-login automatico su 401/403)
// ─────────────────────────────────────────────────────────────────────────────

const tokenCache = new Map<string, string>()
export function resetSidlyTokenCache() { tokenCache.clear() }

/** Pulisce il valore del secret: spazi, apici attorno, "/" finali; senza schema assume https://. */
export function normalizeBaseUrl(raw: string | undefined | null): string {
  let v = String(raw || '').trim().replace(/^["'`]+|["'`]+$/g, '').trim()
  if (v && !/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) v = 'https://' + v.replace(/^\/+/, '')
  return v.replace(/\/+$/, '')
}

export function sidlyConfigError(env: SidlyEnv): string | null {
  if (!env.SIDLY_USER || !env.SIDLY_PASSWORD || !env.SIDLY_BASE_URL) {
    return 'Integrazione SiDLY non configurata (mancano SIDLY_USER / SIDLY_PASSWORD / SIDLY_BASE_URL nei segreti Cloudflare)'
  }
  const base = normalizeBaseUrl(env.SIDLY_BASE_URL)
  if (!/^https:\/\/[^\s/]+/i.test(base)) {
    // Nessun frammento del valore nel messaggio: potrebbe essere un segreto incollato nel campo sbagliato
    const raw = String(env.SIDLY_BASE_URL)
    const hint = /^\s*http:\/\//i.test(raw) ? 'usa http:// (serve https://)' : `lunghezza ${raw.length} caratteri, schema non riconosciuto`
    return `SIDLY_BASE_URL non valido: deve essere un indirizzo https:// (${hint})`
  }
  return null
}

export class SidlyClient {
  private base: string
  private cacheKey: string
  constructor(private env: SidlyEnv, private f: Fetch = (u, i) => fetch(u, i) as any) {
    this.base = normalizeBaseUrl(env.SIDLY_BASE_URL)
    this.cacheKey = this.base + '|' + (env.SIDLY_USER || '')
  }

  private async raw(method: string, path: string, body?: any, token?: string) {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (token) headers['X-Access-Token'] = token
    const init: any = { method, headers }
    if (body !== undefined) init.body = JSON.stringify(body)
    try { init.signal = (AbortSignal as any).timeout?.(15000) } catch { /* ambiente senza AbortSignal.timeout */ }
    const res = await this.f(this.base + path, init)
    const text = await res.text()
    let json: any = null
    try { json = text ? JSON.parse(text) : null } catch { json = null }
    return { status: res.status, json, headers: res.headers }
  }

  private async login(): Promise<string> {
    const field = (this.env.SIDLY_LOGIN_FIELD || 'email').trim() || 'email'
    const r = await this.raw('POST', '/user/login', { [field]: this.env.SIDLY_USER, password: this.env.SIDLY_PASSWORD })
    if (r.status < 200 || r.status >= 300) throw new Error(`login SiDLY fallito (HTTP ${r.status})`)
    const j = r.json || {}
    // Il portale SiDLY salva data.authentication_token (verificato sul bundle pubblico); le altre varianti restano per tolleranza
    let token = j.data?.authentication_token ?? j.authentication_token ?? j.token ?? j.access_token ?? j.accessToken ?? j.data?.token ?? j.data?.access_token
    if (!token && r.headers) {
      try { token = typeof r.headers.get === 'function' ? r.headers.get('X-Access-Token') : undefined } catch { /* ignore */ }
    }
    if (!token || typeof token !== 'string') throw new Error('login SiDLY: token non presente nella risposta')
    tokenCache.set(this.cacheKey, token)
    return token
  }

  async request(method: string, path: string, body?: any): Promise<{ status: number; json: any }> {
    let token = tokenCache.get(this.cacheKey) || await this.login()
    let r = await this.raw(method, path, body, token)
    if (r.status === 401 || r.status === 403) {
      tokenCache.delete(this.cacheKey)
      token = await this.login()
      r = await this.raw(method, path, body, token)
    }
    return { status: r.status, json: r.json }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Flusso di sincronizzazione
// ─────────────────────────────────────────────────────────────────────────────

export interface SyncOptions {
  crm: CrmPatient
  env: SidlyEnv
  fetchImpl?: Fetch
  dryRun?: boolean
  /** user_id SiDLY scelto dall'operatore tra gli omonimi: si aggiorna quell'assistito invece di crearne uno. */
  associaUserId?: string
  /** L'operatore ha confermato di creare un nuovo assistito nonostante gli omonimi. */
  confermaCrea?: boolean
}

const ok2xx = (s: number) => s >= 200 && s < 300
const enc = encodeURIComponent

function pickArray(j: any): any[] {
  if (Array.isArray(j)) return j
  if (j && typeof j === 'object') {
    for (const k of ['items', 'patients', 'data', 'results', 'users']) {
      if (Array.isArray(j[k])) return j[k]
      if (j[k] && typeof j[k] === 'object' && Array.isArray(j[k].items)) return j[k].items
    }
  }
  return []
}

/** Descrive la STRUTTURA di un JSON (chiavi e tipi) senza alcun valore: sicura da mostrare in anteprima. */
export function shapeOf(v: any, depth = 0): unknown {
  if (v === null) return 'null'
  if (Array.isArray(v)) return depth >= 3 ? `array[${v.length}]` : { array: v.length, elemento: v.length ? shapeOf(v[0], depth + 1) : null }
  if (typeof v === 'object') {
    if (depth >= 3) return 'object'
    const o: Record<string, unknown> = {}
    for (const k of Object.keys(v).slice(0, 60)) o[k] = shapeOf(v[k], depth + 1)
    return o
  }
  return typeof v
}

export async function syncAssistito(opts: SyncOptions): Promise<SyncResult> {
  const { crm, env } = opts
  const dry = !!opts.dryRun
  const client = new SidlyClient(env, opts.fetchImpl)
  const out: SyncResult = {
    esito: 'errore', sidly_user_id: null, azioni: [], warning: [...crm.warnings], campi_inviati: [], url_for_band: { registrato: false },
  }
  const fail = (msg: string): SyncResult => { out.esito = 'errore'; out.errore = msg; return out }

  try {
    let identifier = crm.imei
    const assoc = opts.associaUserId ? digits(opts.associaUserId) : ''
    if (assoc) identifier = assoc

    let res = await client.request('GET', `/patient/${enc(identifier)}`)
    out.azioni.push({ azione: assoc ? 'GET /patient/{user_id}' : 'GET /patient/{imei}', risultato: String(res.status) })

    let previsto: 'creato' | 'aggiornato' | 'invariato'

    if (res.status === 404 && !assoc) {
      // Deduplica: omonimi gia' presenti in piattaforma -> decide l'operatore.
      if (!opts.confermaCrea) {
        const q = `first_name=${enc(crm.user.firstName)}&last_name=${enc(crm.user.lastName)}`
        const s = await client.request('GET', `/patient/myShortInfo?${q}`)
        out.azioni.push({ azione: 'GET /patient/myShortInfo (ricerca omonimi)', risultato: String(s.status) })
        if (!ok2xx(s.status)) {
          out.esito = 'conferma_richiesta'
          out.candidati = []
          out.motivo_conferma = 'Ricerca omonimi non riuscita: non si puo\' escludere che l\'assistito esista gia\'. Creare comunque un nuovo assistito?'
          return out
        }
        const cands: Candidato[] = pickArray(s.json)
          .map((x: any) => ({
            user_id: digits(x?.user_id ?? x?.userId ?? x?.id),
            first_name: toStr(x?.first_name ?? x?.firstName),
            last_name: toStr(x?.last_name ?? x?.lastName),
          }))
          .filter(x => x.user_id && eqStr(x.first_name, crm.user.firstName) && eqStr(x.last_name, crm.user.lastName))
        if (cands.length) {
          out.esito = 'conferma_richiesta'
          out.candidati = cands
          out.motivo_conferma = 'Trovato un assistito omonimo su SiDLY: associare o creare nuovo?'
          return out
        }
      }

      // CREAZIONE
      previsto = 'creato'
      const band = { ...crm.band, ...parseBandDefaults(env.SIDLY_BAND_DEFAULTS) }
      if (!env.SIDLY_BAND_DEFAULTS) out.warning.push('Parametri operativi (soglie FC, notifiche, misurazioni) non impostati: configurali sul portale SiDLY oppure in SIDLY_BAND_DEFAULTS')
      const body = { user: crm.user, band }
      const campi = [...Object.keys(body.user).map(k => 'user.' + k), ...Object.keys(band).map(k => 'band.' + k)]
      out.campi_inviati = [
        ...Object.entries(body.user).map(([k, v]) => ({ campo: 'user.' + k, valore: v })),
        ...Object.entries(band).map(([k, v]) => ({ campo: 'band.' + k, valore: v })),
      ]
      if (dry) {
        out.azioni.push({ azione: 'POST /manager/patient', risultato: 'non eseguito (anteprima)', campi })
      } else {
        const p = await client.request('POST', '/manager/patient', body)
        out.azioni.push({ azione: 'POST /manager/patient', risultato: String(p.status), campi })
        if (!ok2xx(p.status)) return fail(`Creazione assistito su SiDLY non riuscita (HTTP ${p.status})`)
        const j = p.json || {}
        const id = j.user_id ?? j.userId ?? j.data?.user_id ?? j.data?.userId ?? j.id ?? j.data?.id
        out.sidly_user_id = id === undefined || id === null ? null : String(id)
        if (!out.sidly_user_id) out.warning.push('SiDLY non ha restituito lo user_id: non salvato nel CRM')
      }
    } else if (res.status === 200) {
      if (dry) out.diagnostica = { forma_risposta_patient: shapeOf(res.json) }
      const plat = normalizePlatformPatient(res.json)
      out.sidly_user_id = plat.userId || (assoc || null)
      const d = diffPatient(crm, plat)
      out.warning.push(...d.warnings)
      const hasUser = Object.keys(d.userPatch).length > 0
      const hasBand = Object.keys(d.bandPatch).length > 0
      if (!hasUser && !hasBand) {
        previsto = 'invariato'
      } else {
        previsto = 'aggiornato'
        const body: any = {}
        if (hasUser) body.user = d.userPatch
        if (hasBand) body.band = d.bandPatch
        out.campi_inviati = d.campi
        const campi = d.campi.map(c => c.campo)
        if (dry) {
          out.azioni.push({ azione: 'PATCH /manager/patient/{imei}', risultato: 'non eseguito (anteprima)', campi })
        } else {
          const p = await client.request('PATCH', `/manager/patient/${enc(assoc || crm.imei)}`, body)
          out.azioni.push({ azione: assoc ? 'PATCH /manager/patient/{user_id}' : 'PATCH /manager/patient/{imei}', risultato: String(p.status), campi })
          if (!ok2xx(p.status)) return fail(`Aggiornamento assistito su SiDLY non riuscito (HTTP ${p.status})`)
        }
      }
    } else {
      return fail(`Risposta inattesa da SiDLY nella ricerca dell'assistito (HTTP ${res.status})`)
    }

    // URL di consegna frame (Canale 2): solo se configurato.
    const frameUrl = (env.SIDLY_FRAME_URL || '').trim()
    if (!frameUrl || !/^https:\/\//i.test(frameUrl)) {
      out.url_for_band = { registrato: false, motivo: 'SIDLY_FRAME_URL non configurato (o non https): registrazione saltata' }
      out.warning.push('URL di consegna frame non registrato: SIDLY_FRAME_URL non configurato')
    } else if (dry) {
      out.url_for_band = { registrato: false, url: frameUrl, motivo: 'non eseguito (anteprima)' }
      out.azioni.push({ azione: 'POST /manager/set-url-for-band', risultato: 'non eseguito (anteprima)' })
    } else {
      const u = await client.request('POST', '/manager/set-url-for-band', { imei: crm.imei, url: frameUrl })
      out.azioni.push({ azione: 'POST /manager/set-url-for-band', risultato: String(u.status) })
      if (ok2xx(u.status)) out.url_for_band = { registrato: true, url: frameUrl }
      else {
        out.url_for_band = { registrato: false, url: frameUrl, motivo: `HTTP ${u.status}` }
        out.warning.push(`Registrazione dell'URL di consegna frame non riuscita (HTTP ${u.status})`)
      }
    }

    if (dry) { out.esito = 'anteprima'; out.previsto = previsto } else { out.esito = previsto }
    return out
  } catch (e: any) {
    return fail(e?.message ? String(e.message).slice(0, 200) : 'Errore di comunicazione con SiDLY')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Accesso al DB del CRM + orchestrazione per l'endpoint
// ─────────────────────────────────────────────────────────────────────────────

export const SIDLY_SYNC_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS sidly_sync (
    assistito_id INTEGER PRIMARY KEY,
    sidly_user_id TEXT,
    synced_at TEXT,
    last_esito TEXT,
    last_result TEXT
  )`

async function safeFirst(db: any, sql: string, ...binds: any[]): Promise<any | null> {
  try { return (await db.prepare(sql).bind(...binds).first()) || null } catch { return null }
}

export async function loadCrmSources(db: any, assistitoId: number): Promise<CrmSources | null> {
  const assistito = await safeFirst(db, 'SELECT * FROM assistiti WHERE id = ?', assistitoId)
  if (!assistito) return null
  let leadId: string | null = assistito.lead_id || null
  if (!leadId && assistito.imei) {
    const c = await safeFirst(db, 'SELECT leadId FROM contracts WHERE imei_dispositivo = ? ORDER BY created_at DESC LIMIT 1', assistito.imei)
    leadId = c?.leadId || null
  }
  const lead = leadId
    ? await safeFirst(db, `SELECT nomeAssistito, cognomeAssistito, dataNascitaAssistito, indirizzoAssistito, cittaAssistito, capAssistito, provinciaAssistito FROM leads WHERE id = ?`, leadId)
    : null
  const config = leadId ? await safeFirst(db, 'SELECT * FROM configurations WHERE leadId = ? ORDER BY id DESC LIMIT 1', leadId) : null
  const ddt = assistito.imei ? await safeFirst(db, 'SELECT sim_number FROM ddts WHERE serial_number = ? AND sim_number IS NOT NULL AND sim_number != \'\' ORDER BY created_at DESC LIMIT 1', assistito.imei) : null
  return { assistito, lead, config, simNumber: ddt?.sim_number || null }
}

export interface RunOptions {
  db: any
  env: SidlyEnv
  assistitoId: number
  dryRun?: boolean
  associaUserId?: string
  confermaCrea?: boolean
  fetchImpl?: Fetch
}

export async function runSidlySync(o: RunOptions): Promise<{ httpStatus: number; result: SyncResult | { esito: 'errore'; errore: string } }> {
  const cfgErr = sidlyConfigError(o.env)
  if (cfgErr) return { httpStatus: 503, result: { esito: 'errore', errore: cfgErr } }

  const src = await loadCrmSources(o.db, o.assistitoId)
  if (!src) return { httpStatus: 404, result: { esito: 'errore', errore: 'Assistito non trovato' } }
  if (String(src.assistito.status || '').toUpperCase() !== 'ATTIVO') {
    return { httpStatus: 422, result: { esito: 'errore', errore: 'Sincronizzazione consentita solo per assistiti con stato ATTIVO' } }
  }
  const crm = buildCrmPatient(src, o.env)
  if ('error' in crm) return { httpStatus: 422, result: { esito: 'errore', errore: crm.error } }

  const result = await syncAssistito({ crm, env: o.env, fetchImpl: o.fetchImpl, dryRun: o.dryRun, associaUserId: o.associaUserId, confermaCrea: o.confermaCrea })

  // Registrazione dell'esito nel CRM (tabella laterale: nessun ALTER su assistiti). Mai in anteprima.
  const persistable = result.esito === 'creato' || result.esito === 'aggiornato' || result.esito === 'invariato' || result.esito === 'errore'
  if (!o.dryRun && persistable) {
    try {
      await o.db.prepare(SIDLY_SYNC_TABLE_SQL).run()
      const summary = JSON.stringify({ esito: result.esito, azioni: result.azioni.map(a => ({ azione: a.azione, risultato: a.risultato })), warning: result.warning })
      const now = new Date().toISOString()
      await o.db.prepare(`
        INSERT INTO sidly_sync (assistito_id, sidly_user_id, synced_at, last_esito, last_result) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(assistito_id) DO UPDATE SET
          sidly_user_id = COALESCE(excluded.sidly_user_id, sidly_user_id),
          synced_at = CASE WHEN excluded.last_esito = 'errore' THEN synced_at ELSE excluded.synced_at END,
          last_esito = excluded.last_esito,
          last_result = excluded.last_result
      `).bind(o.assistitoId, result.sidly_user_id, result.esito === 'errore' ? null : now, result.esito, summary).run()
    } catch (e: any) {
      result.warning.push('Esito non salvato nel CRM (tabella sidly_sync): ' + String(e?.message || e).slice(0, 120))
    }
  }

  const httpStatus = result.esito === 'errore' ? 502 : 200
  return { httpStatus, result }
}
