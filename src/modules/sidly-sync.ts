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
export interface CampoInviato { campo: string; valore: any; /** Testi per l'operatore (solo visualizzazione): nome leggibile e valori su piu' righe. */ etichetta?: string; mostra_prima?: string; mostra_dopo?: string; /** Valore attualmente su SiDLY (solo campi user.*; '' se vuoto): serve all'operatore per capire cosa verrebbe sovrascritto. */ precedente?: any }
export interface Candidato { user_id: string; first_name: string; last_name: string }

export interface SyncResult {
  esito: Esito
  /** Nome e cognome dell'assistito, solo per il titolo del pannello (non viene salvato nel DB). */
  assistito?: string
  /** Confronto riga per riga SiDLY / CRM per la tabella dell'anteprima (non viene salvato nel DB). */
  confronto?: RigaConfronto[]
  previsto?: 'creato' | 'aggiornato' | 'invariato'
  sidly_user_id: string | null
  azioni: Azione[]
  warning: string[]
  campi_inviati: CampoInviato[]
  url_for_band: { registrato: boolean; url?: string; motivo?: string }
  candidati?: Candidato[]
  motivo_conferma?: string
  errore?: string
  /** Modifiche scritte (o, in anteprima, previste) nel CRM per le righe in cui l'operatore ha scelto SiDLY. Non salvato nel DB. */
  crm_scritture?: CampoCrm[]
  /** Solo in anteprima: struttura (nomi dei campi e tipi, MAI valori) della risposta di GET /patient. */
  diagnostica?: Record<string, unknown>
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

export interface CrmSources { assistito: any; lead: any | null; /** id della richiesta (leads.id), serve per scrivere nel CRM. */ leadId?: string | null; config: any | null; simNumber: string | null; /** Altri campi della richiesta (CF, luogo di nascita, richiedente, piano): solo per il confronto a video. */ extra?: any | null }
export interface SosPhone { numberPrefix: string; number: string; repeatNumber: number; alias?: string }
export interface Referente { name: string; phone: string; family_kind?: string; others?: string; email?: string }
export interface WhitelistEntry { number: string; alias: string }
export interface MedicalCrm { flags: Record<string, 1>; other_diseases?: string; allergy?: string; medicines?: string; more_info?: string }
export type StatoRiga = 'uguale' | 'cambia' | 'diverso' | 'solo_sidly' | 'solo_crm' | 'non_sincronizzato' | 'non_verificato'
export type Scelta = 'crm' | 'sidly'
export interface RigaConfronto {
  gruppo: string; campo: string; sidly: string; crm: string; stato: StatoRiga
  /** Il CRM non ha proprio questo campo. */ assenteCrm?: boolean
  /** SiDLY non ha proprio questo campo. */ assenteSidly?: boolean
  /** Chiave per scegliere la direzione (solo campi presenti in entrambi gli ambienti e con valori diversi). */ chiave?: string
  /** Direzioni possibili: 'crm' = il valore giusto e' quello del CRM (si scrive su SiDLY); 'sidly' = il valore giusto e' quello di SiDLY (si scrive nel CRM). */ verso?: Scelta[]
  /** Spiegazione breve quando una direzione non e' disponibile. */ nota?: string
}
export interface CrmPatient {
  imei: string
  referenti: Referente[]
  whitelist: WhitelistEntry[]
  medical: MedicalCrm
  user: { firstName: string; lastName: string; date?: { year: number; month: number; day: number }; weight?: number; height?: number; phonePrefix?: string; phone?: string; address?: string }
  band: { imei: string; phones?: SosPhone[]; simNumber?: string; timezone: string; lang_band: string; [k: string]: any }
  /** Scheda assistito (patientCard): solo i campi che il CRM possiede (medico curante, centro di riferimento). */
  scheda: { name_of_doctor?: string; hospital_info?: string }
  emailAssistito: string
  /** Dati presenti nel CRM che SiDLY non ha (solo visualizzazione). */
  altriCrm: Array<{ etichetta: string; valore: string }>
  /** Elenco grezzo di patologie_croniche del CRM (serve per aggiungere/togliere una patologia). */
  croniche: string[]
  /** Quali righe del CRM esistono (per sapere dove si puo' scrivere). */
  fonti: { config: boolean; lead: boolean; ddt: boolean; colAssistiti: string[] }
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

// ── "Dettagli utente": referenti, numeri ammessi (whitelist), patologie/farmaci ─────────────────────
function fullPhone(raw: unknown): string {
  const sp = splitPhone(raw)
  return sp ? sp.prefix + sp.number : ''
}

function buildReferenti(cfg: any, warnings: string[]): Referente[] {
  const out: Referente[] = []
  for (const n of [1, 2, 3]) {
    const name = [toStr(cfg[`contatto${n}_nome`]), toStr(cfg[`contatto${n}_cognome`])].filter(Boolean).join(' ')
    const rawTel = toStr(cfg[`contatto${n}_telefono`])
    const phone = fullPhone(rawTel)
    if (!name && !phone) continue
    if (rawTel && !phone) warnings.push(`Referente ${n}: telefono non interpretabile, non inviato`)
    const email = toStr(cfg[`contatto${n}_email`])
    // Il CRM non ha il grado di parentela dei referenti: family_kind non viene inviato.
    out.push({ name, phone, ...(email ? { others: `email: ${email}`, email } : {}) })
  }
  return out
}

function buildWhitelist(cfg: any): WhitelistEntry[] {
  const out: WhitelistEntry[] = []
  for (const n of [1, 2, 3]) {
    const number = fullPhone(cfg[`whitelist${n}_telefono`])
    if (!number) continue
    const alias = [toStr(cfg[`whitelist${n}_nome`]), toStr(cfg[`whitelist${n}_cognome`])].filter(Boolean).join(' ')
    out.push({ number, alias: alias || number })
  }
  return out
}

// Patologie del CRM (elenco di modifica-dati.html) -> interruttori di SiDLY. Mappatura dedotta dall'ordine della
// schermata del portale: "Cardiopatia" = po_zawale (unico interruttore rimasto). Da confermare (OPEN_QUESTIONS).
const PATOLOGIA_FLAG: Record<string, string> = {
  ipertensione: 'nadcisnienie', diabete: 'cukrzyca', cardiopatia: 'po_zawale', demenza: 'alzheimer',
  parkinson: 'parkinson', epilessia: 'padaczka', bpco: 'astma',
}
const PATOLOGIA_LABEL: Record<string, string> = {
  ictus: 'Ictus', oncologica: 'Patologia oncologica', insufficienza_renale: 'Insufficienza renale',
  osteoporosi: 'Osteoporosi', depressione: 'Depressione / Ansia',
}
export const SIDLY_DISEASE_FLAGS = ['alzheimer', 'aparat', 'arytmia', 'cukrzyca', 'nadcisnienie', 'padaczka', 'parkinson', 'po_zawale', 'rozrusznik', 'tarczyca', 'astma'] as const

function parseList(raw: unknown): string[] {
  const t = toStr(raw)
  if (!t) return []
  try { const j = JSON.parse(t); if (Array.isArray(j)) return j.map(x => toStr(x)).filter(Boolean) } catch { /* elenco separato da virgole */ }
  return t.split(',').map(x => x.trim()).filter(Boolean)
}

function buildMedical(cfg: any): MedicalCrm {
  const flags: Record<string, 1> = {}
  const extra: string[] = []
  for (const v of parseList(cfg.patologie_croniche)) {
    const k = v.toLowerCase()
    if (PATOLOGIA_FLAG[k]) flags[PATOLOGIA_FLAG[k]] = 1
    else extra.push(PATOLOGIA_LABEL[k] || v)
  }
  const other = [...extra, toStr(cfg.patologie)].filter(Boolean).join(', ')
  let medicines = ''
  const fd = toStr(cfg.farmaci_data)
  if (fd) {
    try {
      const j = JSON.parse(fd)
      if (Array.isArray(j)) medicines = j.map((f: any) => typeof f === 'string' ? f.trim() : [f?.nome, f?.dosaggio, f?.orario].map(toStr).filter(Boolean).join(' ')).filter(Boolean).join('; ')
      else medicines = fd
    } catch { medicines = fd }
  }
  if (!medicines) medicines = toStr(cfg.farmaci_assunti)
  const m: MedicalCrm = { flags }
  if (other) m.other_diseases = other
  if (toStr(cfg.allergie)) m.allergy = toStr(cfg.allergie)
  if (medicines) m.medicines = medicines
  if (toStr(cfg.note_mediche)) m.more_info = toStr(cfg.note_mediche)
  return m
}

const hasMedical = (m: MedicalCrm) => Object.keys(m.flags).length > 0 || !!(m.other_diseases || m.allergy || m.medicines || m.more_info)


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

  // Formato usato dal portale SiDLY: "Via, Citta', Provincia, CAP"
  const address = [toStr(lead.indirizzoAssistito), toStr(lead.cittaAssistito), toStr(lead.provinciaAssistito), toStr(lead.capAssistito)].filter(Boolean).join(', ')
  if (address) user.address = address

  const band: CrmPatient['band'] = { imei, timezone: 'Europe/Rome', lang_band: 'IT' }
  const phones: SosPhone[] = []
  const referenti = buildReferenti(cfg, warnings)
  // I numeri SOS coincidono con i referenti ("Dettagli utente"); senza referenti si usano i vecchi contatti di emergenza.
  const sosRaw: Array<{ raw: unknown; alias: string }> = referenti.some(r => r.phone)
    ? referenti.map(r => ({ raw: r.phone, alias: r.name }))
    : [{ raw: cfg.contatto_emergenza_1_telefono, alias: toStr(cfg.contatto_emergenza_1_nome) }, { raw: cfg.contatto_emergenza_2_telefono, alias: toStr(cfg.contatto_emergenza_2_nome) }]
  for (const { raw, alias } of sosRaw.slice(0, 3)) {
    const sp = splitPhone(raw)
    if (sp && !phones.some(p => digits(p.numberPrefix) + p.number === digits(sp.prefix) + sp.number)) {
      phones.push({ numberPrefix: sp.prefix, number: sp.number, repeatNumber: DEFAULT_SOS_REPEAT, ...(alias ? { alias: alias.slice(0, 50) } : {}) })
    }
  }
  if (phones.length) band.phones = phones
  else warnings.push('Nessun numero SOS (contatti di emergenza) nel CRM')
  if (toStr(src.simNumber)) band.simNumber = toStr(src.simNumber)

  const whitelist = buildWhitelist(cfg)
  if (whitelist.length) {
    band.whitelistNumbers = whitelist.map(w => w.number).join(',')
    band.whiteListAlias = whitelist.map(w => w.alias.slice(0, 50).replace(/,/g, ' ')).join(',')
  }
  const scheda: CrmPatient['scheda'] = {}
  const doc = [toStr(cfg.medico_curante_nome), toStr(cfg.medico_curante_telefono)].filter(Boolean).join(' - ')
  if (doc) scheda.name_of_doctor = doc
  if (toStr(cfg.centro_medico_riferimento)) scheda.hospital_info = toStr(cfg.centro_medico_riferimento)
  const ex = src.extra || {}
  const altriCrm: Array<{ etichetta: string; valore: string }> = []
  const add = (etichetta: string, v: unknown) => { const t = toStr(v); if (t) altriCrm.push({ etichetta, valore: t }) }
  add('Codice fiscale assistito', ex.cfAssistito)
  add('Luogo di nascita', ex.luogoNascitaAssistito)
  add('Richiedente', [ex.nomeRichiedente, ex.cognomeRichiedente].filter(Boolean).join(' '))
  add('E-mail del richiedente', ex.email)
  add('Telefono del richiedente', ex.telefono)
  add('Servizio / piano', [ex.servizio, ex.piano].filter(Boolean).join(' · '))
  return { imei, user, band, warnings, referenti, whitelist, medical: buildMedical(cfg), scheda, emailAssistito: toStr(cfg.email), altriCrm, croniche: parseList(cfg.patologie_croniche), fonti: { config: !!src.config && src.config.id != null, lead: !!src.leadId, ddt: !!src.simNumber, colAssistiti: ['nome_assistito', 'cognome_assistito', 'peso', 'altezza'].filter(k => k in a) } }
}

// ─────────────────────────────────────────────────────────────────────────────
// Risposta piattaforma -> forma comune (formato di GET /patient non documentato nel prompt)
// ─────────────────────────────────────────────────────────────────────────────

export interface PlatformPatient {
  userId: string | null
  user: { firstName?: string; lastName?: string; date?: { year: number; month: number; day: number } | null; weight?: number | null; height?: number | null; phonePrefix?: string; phone?: string; address?: string }
  band: { phones?: SosPhone[]; simNumber?: string; whitelist?: string[] }
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
    ? rawPhones.filter((p: any) => p && (p.number || p.numberPrefix)).map((p: any) => ({ numberPrefix: String(p.numberPrefix ?? ''), number: String(p.number ?? ''), repeatNumber: Number(p.repeatNumber ?? 0), alias: toStr(p.alias) }))
    : []
  const rawWl = pick(b.whitelistNumbers, b.whitelist_numbers, root.whitelistNumbers, root.whitelist_numbers)
  const whitelist: string[] | undefined = rawWl === undefined ? undefined : (Array.isArray(rawWl) ? rawWl : String(rawWl).split(',')).map((x: any) => toStr(x)).filter(Boolean)
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
    band: { phones, simNumber: pick(b.simNumber, b.sim_number, u.sim_number, u.simNumber, root.sim_number, root.simNumber), whitelist },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DIFF (CRM master per l'anagrafica; piattaforma master per la configurazione operativa)
// ─────────────────────────────────────────────────────────────────────────────

const squash = (v: any) => toStr(v).toLowerCase().replace(/\s+/g, ' ')
const eqStr = (a: any, b: any) => squash(a) === squash(b)
const eqDigits = (a: any, b: any) => digits(a) === digits(b)
const eqNum = (a: any, b: any) => Math.abs(Number(a) - Number(b)) < 0.05
const eqDate = (a: any, b: any) => !!a && !!b && Number(a.year) === Number(b.year) && Number(a.month) === Number(b.month) && Number(a.day) === Number(b.day)
/** Indirizzo: stesso insieme di parole, ignorando maiuscole, punteggiatura e ordine ("Via X 1, Genova, GE, 16166" == "Via X 1, 16166 Genova (GE)"). */
const addrKey = (v: any) => toStr(v).toLowerCase().replace(/[^a-z0-9\u00c0-\u024f\s]/g, ' ').split(/\s+/).filter(Boolean).sort().join(' ')
export const eqAddress = (a: any, b: any) => addrKey(a) === addrKey(b)
/** Telefono: stesse cifre, oppure una e' l'altra senza prefisso internazionale. */
export const eqPhoneLoose = (a: any, b: any) => {
  const x = digits(a), y = digits(b)
  if (!x || !y) return false
  return x === y || (Math.min(x.length, y.length) >= 6 && (x.endsWith(y) || y.endsWith(x)))
}
const phoneKey = (p: SosPhone) => digits(p.numberPrefix) + digits(p.number)

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
  /** Scelte per riga (direzione CRM → SiDLY o SiDLY → CRM). Senza scelte non viene scritto nulla sui dati esistenti. */
  scelte?: SceltaRiga[]
  /** Esegue le scritture nel CRM (fornita da runSidlySync; mai chiamata in anteprima). */
  applyCrm?: (ops: CrmOp[]) => Promise<void>
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

// ── "Dettagli utente": referenti, patologie e farmaci, scheda assistito ──────────────────────────────
const truthy = (v: unknown) => v === 1 || v === true || v === '1' || v === 'true'
const norm = (v: unknown) => toStr(v).toLowerCase().replace(/\s+/g, ' ')
/** Il testo SiDLY contiene ogni voce (separate da virgola o punto e virgola) del testo CRM, in qualunque ordine. */
const containsAll = (plat: unknown, crm: unknown) => {
  const p = norm(plat)
  const items = toStr(crm).split(/[,;]/).map(x => norm(x)).filter(Boolean)
  return items.every(i => p.includes(i))
}
const rootOf = (j: any) => (j && typeof j === 'object' && j.data && typeof j.data === 'object' && !Array.isArray(j.data)) ? j.data : (j || {})

// ── Testi leggibili per l'operatore (solo visualizzazione: non influiscono su cio' che viene inviato) ───────────
const FLAG_LABEL: Record<string, string> = {
  nadcisnienie: 'ipertensione', cukrzyca: 'diabete', po_zawale: 'cardiopatia', alzheimer: 'demenza / Alzheimer', parkinson: 'Parkinson',
  padaczka: 'epilessia', astma: 'BPCO / asma', arytmia: 'aritmia', rozrusznik: 'pacemaker', tarczyca: 'tiroide', aparat: 'apparecchio (aparat)',
}
const ETICHETTE: Record<string, string> = {
  'user.firstName': 'Nome', 'user.lastName': 'Cognome', 'user.address': 'Indirizzo', 'user.phone': 'Telefono dell\'assistito', 'user.phonePrefix': 'Prefisso telefonico',
  'user.date': 'Data di nascita', 'user.weight': 'Peso (kg)', 'user.height': 'Altezza (cm)',
  'band.phones': 'Numeri SOS (i 3 referenti)', 'band.whitelistNumbers': 'Numeri ammessi', 'band.simNumber': 'Numero SIM',
  'band.imei': 'IMEI del braccialetto', 'band.timezone': 'Fuso orario', 'band.lang_band': 'Lingua del braccialetto',
  'patologie.allergy': 'Allergie', 'patologie.other_diseases': 'Altre patologie', 'patologie.medicines': 'Farmaci', 'patologie.more_info': 'Note mediche',
  'scheda.name_of_doctor': 'Medico curante', 'scheda.hospital_info': 'Centro medico di riferimento',
}
export function etichettaCampo(campo: string): string {
  if (ETICHETTE[campo]) return ETICHETTE[campo]
  let m = campo.match(/^referente(\d)\.(nome|telefono|altro|email)$/)
  if (m) return `Referente ${m[1]} · ${m[2] === 'altro' || m[2] === 'email' ? 'e-mail' : m[2]}`
  m = campo.match(/^patologie\.(\w+)$/)
  if (m && FLAG_LABEL[m[1]]) return 'Patologia: ' + FLAG_LABEL[m[1]]
  return campo
}
const pad2 = (n: unknown) => String(n).padStart(2, '0')
function mostra(v: unknown, campo: string): string {
  if (v === undefined || v === null) return ''
  if (campo.startsWith('patologie.') && (v === 0 || v === 1 || v === true || v === false)) return v ? 'Sì' : 'No'
  if (Array.isArray(v)) return v.map(x => (x && typeof x === 'object')
    ? `${(x as any).alias && (x as any).alias !== `${(x as any).numberPrefix}${(x as any).number}` ? (x as any).alias + ' ' : ''}${(x as any).numberPrefix ?? ''}${(x as any).number ?? ''}`
    : String(x)).join('\n')
  if (typeof v === 'object') {
    const d = v as any
    if (d.year && d.month && d.day) return `${pad2(d.day)}/${pad2(d.month)}/${d.year}`
    return JSON.stringify(v)
  }
  return String(v)
}
const conAlias = (n: string, a: string) => (a && a !== n ? `${a} ${n}` : n)

// ── Confronto riga per riga SiDLY / CRM (tabella dell'anteprima) ────────────────────────────────────
const DISEASE_SOLO_SIDLY: Array<[string, string]> = [
  ['walking_person', 'Autonomia nel camminare'], ['hearing', 'Udito'], ['seeing', 'Vista'], ['thinking', 'Capacità di pensiero'],
  ['place_for_documents', 'Dove si trovano i documenti'], ['place_for_medicines', 'Dove si trovano i farmaci'],
  ['vaccine', 'Vaccinazione'], ['vaccine_date', 'Data vaccinazione'], ['covid', 'Covid'],
]
const CARD_SOLO_SIDLY: Array<[string, string]> = [
  ['description_building', 'Descrizione dell\'edificio'], ['intercom_code', 'Codice citofono'], ['register_hospital_info', 'Ospedale di registrazione'], ['diet', 'Dieta'],
]
const BAND_SOLO_SIDLY: Array<[string, string]> = [
  ['min_hr', 'Soglia frequenza cardiaca minima'], ['max_hr', 'Soglia frequenza cardiaca massima'], ['fall', 'Rilevamento cadute'], ['measure', 'Intervallo misurazioni'],
  ['is_alarm_zone', 'Zona di sicurezza attiva'], ['sos_notif', 'Notifiche SOS'], ['fall_notif', 'Notifiche caduta'], ['firmware_version', 'Versione firmware'],
]
const PATOLOGIE_MAPPATE = new Set(Object.values(PATOLOGIA_FLAG))

// ── Confronto e scelta della direzione, riga per riga ────────────────────────────────────────────
// Nessuna scrittura automatica: l'operatore sceglie per ogni riga quale valore e' giusto.
//  'crm'   = vale il CRM  -> si scrive su SiDLY
//  'sidly' = vale SiDLY   -> si scrive nel CRM
// Si puo' scegliere solo dove il campo esiste in entrambi gli ambienti e il valore di partenza non e' vuoto (mai svuotare l'altro lato).

export type Tabella = 'configurations' | 'leads' | 'assistiti' | 'ddts'
/** Scrittura da fare nel CRM (solo colonne fisse decise dal codice, mai nomi arrivati dal browser). */
export type CrmOp =
  | { t: 'col'; tabella: Tabella; col: string; val: string | number; chiave: string }
  | { t: 'croniche'; key: string; on: boolean; chiave: string }
/** Scelta dell'operatore per una riga: i valori sidly/crm sono quelli visti a video e vengono ricontrollati. */
export interface SceltaRiga { chiave: string; verso: Scelta; sidly: string; crm: string }
export interface CampoCrm { campo: string; prima: string; dopo: string }

interface Plan {
  user: Record<string, any>
  band: Record<string, any>
  contacts: Record<number, { name?: string; phone?: string; others?: string }>
  diseases: Record<string, any>
  ops: CrmOp[]
}
const newPlan = (): Plan => ({ user: {}, band: {}, contacts: {}, diseases: {}, ops: [] })
const planHasSidly = (w: Plan) => !!(Object.keys(w.user).length || Object.keys(w.band).length || Object.keys(w.contacts).length || Object.keys(w.diseases).length)

interface RigaInt extends RigaConfronto { toSidly?: (w: Plan) => void; toCrm?: (w: Plan) => void }
interface Raw { nuovo?: boolean; plat?: PlatformPatient; brief?: any; full?: any; contacts?: any; diseases?: any; card?: any }

interface Def {
  g: string; campo: string; chiave: string; s: unknown; c: unknown
  eq?: (a: string, b: string) => boolean
  toSidly?: (w: Plan) => void; toCrm?: (w: Plan) => void
  /** Perche' non si puo' scrivere su SiDLY / nel CRM (mostrato nella riga). */
  notaSidly?: string; notaCrm?: string
  nonVerificato?: boolean
  /** Tabelle del CRM che servono per scrivere: se manca la riga, la direzione SiDLY → CRM non viene offerta. */
  needs?: Tabella[]
}

function riga(d: Def, nuovo: boolean): RigaInt {
  const s = toStr(d.s), c = toStr(d.c)
  const eq = d.eq || eqStr
  const stato: StatoRiga = d.nonVerificato ? 'non_verificato' : (!s && !c) ? 'uguale' : !c ? 'solo_sidly' : !s ? 'solo_crm' : eq(s, c) ? 'uguale' : 'diverso'
  const r: RigaInt = { gruppo: d.g, campo: d.campo, sidly: s, crm: c, stato, chiave: d.chiave }
  if (stato === 'uguale' || stato === 'non_verificato' || nuovo) return r
  const verso: Scelta[] = [], note: string[] = []
  if (c) { if (d.toSidly) verso.push('crm'); else if (d.notaSidly) note.push(d.notaSidly) }
  if (s) { if (d.toCrm) verso.push('sidly'); else if (d.notaCrm) note.push(d.notaCrm) }
  r.verso = verso
  if (note.length) r.nota = note.join(' ')
  if (d.toSidly) r.toSidly = d.toSidly
  if (d.toCrm) r.toCrm = d.toCrm
  return r
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
/** L'indirizzo e-mail contenuto in un testo libero ("email: x@y.it", "email x@y.it", ...). */
export const emailOf = (t: unknown): string => toStr(t).match(EMAIL_RE)?.[0] || ''
/** Mette l'e-mail nel campo "altro" di SiDLY senza perdere le altre note. */
const conEmail = (others: string, email: string) => {
  const cur = emailOf(others)
  return cur ? others.replace(cur, () => email) : ((others ? others.trim() + ' ' : '') + 'email: ' + email)
}
/** "Via X 1, Citta', MI, 20100" -> 4 caselle del CRM; null se non e' nel formato standard del portale. */
export function parseIndirizzo(a: unknown): { indirizzo: string; citta: string; provincia: string; cap: string } | null {
  const m = toStr(a).match(/^(.+),\s*([^,]+),\s*([A-Za-z]{2}),\s*(\d{5})$/)
  return m ? { indirizzo: m[1].trim(), citta: m[2].trim(), provincia: m[3].toUpperCase(), cap: m[4] } : null
}
const splitNome = (n: string) => { const p = toStr(n).split(/\s+/).filter(Boolean); return { nome: p[0] || '', cognome: p.slice(1).join(' ') } }
const FLAG_TO_CRM: Record<string, string> = Object.fromEntries(Object.entries(PATOLOGIA_FLAG).map(([k, v]) => [v, k]))

const colOp = (w: Plan, chiave: string, tabella: Tabella, col: string, val: unknown, permettiVuoto = false) => {
  const v = typeof val === 'number' ? val : toStr(val)
  if (!permettiVuoto && v === '') return
  w.ops.push({ t: 'col', tabella, col, val: v, chiave })
}

export function buildRows(crm: CrmPatient, raw: Raw): RigaInt[] {
  const rows: RigaInt[] = []
  const nuovo = !!raw.nuovo
  const plat: PlatformPatient = raw.plat || { userId: null, user: {}, band: {} }
  const full = rootOf(raw.full), brief = rootOf(raw.brief)
  const fu = full.user || {}, fb = full.band || {}
  const letto = nuovo || !!raw.full
  const ha = (t: Tabella) => t === 'assistiti' || (t === 'configurations' && crm.fonti.config) || (t === 'leads' && crm.fonti.lead) || (t === 'ddts' && crm.fonti.ddt)
  const def = (d: Def) => {
    if (d.toCrm && d.needs && d.needs.some(t => !ha(t))) d = { ...d, toCrm: undefined, notaCrm: 'Nel CRM manca la scheda in cui salvare questo dato.' }
    rows.push(riga(d, nuovo))
  }
  /** Colonne di assistiti: si scrive solo se la colonna esiste davvero in questo database. */
  const colA = (w: Plan, ch: string, col: string, v: unknown) => { if (crm.fonti.colAssistiti.includes(col)) colOp(w, ch, 'assistiti', col, v) }
  const push = (r: RigaInt) => rows.push(r)
  /** Campo che esiste solo su SiDLY (il CRM non lo ha): non sincronizzabile. */
  const solo = (gruppo: string, campo: string, sidly: unknown) => push({ gruppo, campo, sidly: toStr(sidly), crm: '', stato: 'solo_sidly', assenteCrm: true })
  const tel = (p?: unknown, n?: unknown) => `${toStr(p)}${toStr(n)}`
  const iso = (d: any) => `${d.year}-${pad2(d.month)}-${pad2(d.day)}`

  // Anagrafica
  const A = 'Anagrafica'
  const nomeCrm = (w: Plan, ch: string, col: 'nome_assistito' | 'cognome_assistito', lead: 'nomeAssistito' | 'cognomeAssistito', v: string) => {
    colOp(w, ch, 'configurations', col, v); colOp(w, ch, 'leads', lead, v); colA(w, ch, col, v)
  }
  def({ g: A, campo: 'Nome', chiave: 'user.firstName', s: plat.user.firstName, c: crm.user.firstName, needs: ['configurations', 'leads'],
    toSidly: w => { w.user.firstName = crm.user.firstName }, toCrm: w => nomeCrm(w, 'user.firstName', 'nome_assistito', 'nomeAssistito', toStr(plat.user.firstName)) })
  def({ g: A, campo: 'Cognome', chiave: 'user.lastName', s: plat.user.lastName, c: crm.user.lastName, needs: ['configurations', 'leads'],
    toSidly: w => { w.user.lastName = crm.user.lastName }, toCrm: w => nomeCrm(w, 'user.lastName', 'cognome_assistito', 'cognomeAssistito', toStr(plat.user.lastName)) })
  const dS = plat.user.date ? mostra(plat.user.date, 'user.date') : '', dC = crm.user.date ? mostra(crm.user.date, 'user.date') : ''
  def({ g: A, campo: 'Data di nascita', chiave: 'user.date', s: dS, c: dC, nonVerificato: !letto, needs: ['configurations', 'leads'],
    toSidly: w => { w.user.date = crm.user.date },
    toCrm: plat.user.date ? (w => { colOp(w, 'user.date', 'configurations', 'data_nascita', iso(plat.user.date)); colOp(w, 'user.date', 'leads', 'dataNascitaAssistito', iso(plat.user.date)) }) : undefined })
  const ind = parseIndirizzo(plat.user.address)
  def({ g: A, campo: 'Indirizzo', chiave: 'user.address', s: plat.user.address, c: crm.user.address, eq: eqAddress, nonVerificato: !letto, needs: ['leads'],
    toSidly: w => { w.user.address = crm.user.address },
    toCrm: ind ? (w => { colOp(w, 'user.address', 'leads', 'indirizzoAssistito', ind.indirizzo); colOp(w, 'user.address', 'leads', 'cittaAssistito', ind.citta); colOp(w, 'user.address', 'leads', 'provinciaAssistito', ind.provincia); colOp(w, 'user.address', 'leads', 'capAssistito', ind.cap) }) : undefined,
    notaCrm: 'L\'indirizzo su SiDLY non è nel formato «Via, Città, Provincia, CAP»: nel CRM è diviso in 4 caselle e non lo scompongo a caso.' })
  def({ g: A, campo: 'Telefono dell\'assistito', chiave: 'user.phone', s: tel(plat.user.phonePrefix, plat.user.phone), c: tel(crm.user.phonePrefix, crm.user.phone), eq: eqPhoneLoose,
    toSidly: w => { w.user.phone = crm.user.phone; if (crm.user.phonePrefix && !eqDigits(plat.user.phonePrefix, crm.user.phonePrefix)) w.user.phonePrefix = crm.user.phonePrefix },
    toCrm: w => colOp(w, 'user.phone', 'configurations', 'telefono', tel(plat.user.phonePrefix, plat.user.phone)) })
  def({ g: A, campo: 'Peso (kg)', chiave: 'user.weight', s: plat.user.weight, c: crm.user.weight, eq: eqNum,
    toSidly: w => { w.user.weight = crm.user.weight },
    toCrm: w => { colOp(w, 'user.weight', 'configurations', 'peso', toNum(plat.user.weight) ?? ''); colA(w, 'user.weight', 'peso', toNum(plat.user.weight) ?? '') } })
  def({ g: A, campo: 'Altezza (cm)', chiave: 'user.height', s: plat.user.height, c: crm.user.height, eq: eqNum,
    toSidly: w => { w.user.height = crm.user.height },
    toCrm: w => { colOp(w, 'user.height', 'configurations', 'altezza', toNum(plat.user.height) ?? ''); colA(w, 'user.height', 'altezza', toNum(plat.user.height) ?? '') } })
  def({ g: A, campo: 'E-mail dell\'assistito', chiave: 'user.email', s: fu.email, c: crm.emailAssistito, nonVerificato: !letto,
    toCrm: w => colOp(w, 'user.email', 'configurations', 'email', toStr(fu.email)),
    notaSidly: 'L\'e-mail dell\'assistito su SiDLY si cambia solo dal portale SiDLY.' })
  solo(A, 'Sesso', fu.sex)
  solo(A, 'Descrizione / note libere', fu.description)
  for (const x of crm.altriCrm) push({ gruppo: A, campo: x.etichetta, sidly: '', crm: x.valore, stato: 'solo_crm', assenteSidly: true })

  // Referenti (posizione n del CRM = contatto n di SiDLY)
  const R = 'Referenti ("Dettagli utente")'
  if (!nuovo && raw.contacts === undefined) push({ gruppo: R, campo: 'Referenti', sidly: '', crm: crm.referenti.map(r => r.name).join(', '), stato: 'non_verificato' })
  else {
    const list = nuovo ? [] : pickArray(raw.contacts)
    const slot = (w: Plan, n: number) => (w.contacts[n] = w.contacts[n] || {})
    for (let i = 0; i < 3; i++) {
      const n = i + 1, ref = crm.referenti[i], pc = list[i]
      if (!ref && !pc) continue
      const sn = toStr(pc?.name), sp = toStr(pc?.phone_num ?? pc?.phone), so = toStr(pc?.others)
      def({ g: R, campo: `Referente ${n} · nome`, chiave: `ref${n}.nome`, s: sn, c: ref?.name,
        toSidly: w => { slot(w, n).name = ref!.name },
        toCrm: w => { const p = splitNome(sn); colOp(w, `ref${n}.nome`, 'configurations', `contatto${n}_nome`, p.nome); colOp(w, `ref${n}.nome`, 'configurations', `contatto${n}_cognome`, p.cognome, true) } })
      def({ g: R, campo: `Referente ${n} · telefono`, chiave: `ref${n}.telefono`, s: sp, c: ref?.phone, eq: eqPhoneLoose,
        toSidly: w => { slot(w, n).phone = ref!.phone },
        toCrm: w => colOp(w, `ref${n}.telefono`, 'configurations', `contatto${n}_telefono`, sp) })
      solo(R, `Referente ${n} · parentela`, pc?.family_kind)
      solo(R, `Referente ${n} · indirizzo`, pc?.address)
      // L'e-mail si confronta come indirizzo (non come testo): "email x@y.it" e "email: x@y.it" sono la stessa e-mail.
      const eS = emailOf(so)
      def({ g: R, campo: `Referente ${n} · e-mail`, chiave: `ref${n}.email`, s: eS || so, c: ref?.email,
        toSidly: w => { slot(w, n).others = conEmail(so, ref!.email!) },
        toCrm: eS ? (w => colOp(w, `ref${n}.email`, 'configurations', `contatto${n}_email`, eS)) : undefined,
        notaCrm: 'Su SiDLY non c\'è un indirizzo e-mail in questo campo, solo note.' })
    }
  }

  // Braccialetto
  const B = 'Braccialetto'
  const kset = (arr: SosPhone[]) => arr.map(phoneKey).sort().join()
  const sosS = (plat.band.phones || []).map(p => conAlias(p.numberPrefix + p.number, p.alias || '')).join('\n')
  const sosC = (crm.band.phones || []).map(p => conAlias(p.numberPrefix + p.number, p.alias || '')).join('\n')
  if (sosS || sosC) def({ g: B, campo: 'Numeri SOS (devono essere i 3 referenti)', chiave: 'band.phones', s: sosS, c: sosC, eq: () => kset(plat.band.phones || []) === kset(crm.band.phones || []),
    toSidly: w => { w.band.phones = (crm.band.phones || []).map(c => { const m = (plat.band.phones || []).find(p => phoneKey(p) === phoneKey(c)); return m && m.repeatNumber ? { ...c, repeatNumber: m.repeatNumber } : c }) },
    notaCrm: 'Nel CRM i numeri SOS sono i referenti: per cambiarli usa le righe dei referenti.' })
  const wlS = (plat.band.whitelist || []).join('\n')
  const wlC = crm.whitelist.map(w => conAlias(w.number, w.alias)).join('\n')
  const dset = (a: string[]) => a.map(digits).sort().join()
  if (wlS || wlC) def({ g: B, campo: 'Numeri ammessi (whitelist)', chiave: 'band.whitelist', s: wlS, c: wlC, eq: () => dset(plat.band.whitelist || []) === dset(crm.whitelist.map(w => w.number)),
    toSidly: w => { w.band.whitelistNumbers = crm.band.whitelistNumbers; w.band.whiteListAlias = crm.band.whiteListAlias },
    notaCrm: 'Nel CRM i numeri ammessi hanno anche il nome: modificali dal CRM.' })
  def({ g: B, campo: 'Numero SIM', chiave: 'band.simNumber', s: plat.band.simNumber, c: crm.band.simNumber, eq: eqDigits,
    toSidly: w => { w.band.simNumber = crm.band.simNumber },
    toCrm: w => colOp(w, 'band.simNumber', 'ddts', 'sim_number', toStr(plat.band.simNumber)) })
  push({ gruppo: B, campo: 'IMEI', sidly: toStr(brief.imei ?? (nuovo ? '' : crm.imei)), crm: crm.imei, stato: 'uguale' })
  if (letto && !nuovo) {
    for (const [k, lab] of BAND_SOLO_SIDLY) if (fb[k] !== undefined) solo(B, lab, fb[k])
    if (brief.batteryLevel !== undefined) solo(B, 'Livello batteria', brief.batteryLevel)
    if (brief.last_contact !== undefined) solo(B, 'Ultimo contatto', brief.last_contact)
  }

  // Patologie e farmaci
  const P = 'Patologie e farmaci'
  if (!nuovo && raw.diseases === undefined) push({ gruppo: P, campo: 'Patologie e farmaci', sidly: '', crm: '', stato: 'non_verificato' })
  else {
    const d: any = nuovo ? {} : rootOf(raw.diseases)
    for (const f of SIDLY_DISEASE_FLAGS) {
      const on = truthy(d[f])
      if (!PATOLOGIE_MAPPATE.has(f)) { solo(P, FLAG_LABEL[f] || f, on ? 'Sì' : 'No'); continue }
      // Gli interruttori si possono solo ACCENDERE (in entrambe le direzioni): un «No» puo' voler dire «non compilato».
      const crmOn = !!crm.medical.flags[f]
      def({ g: P, campo: FLAG_LABEL[f] || f, chiave: 'pat.' + f, s: on ? 'Sì' : 'No', c: crmOn ? 'Sì' : 'No', needs: ['configurations'],
        toSidly: crmOn ? (w => { w.diseases[f] = 1 }) : undefined,
        toCrm: on ? (w => { w.ops.push({ t: 'croniche', key: FLAG_TO_CRM[f], on: true, chiave: 'pat.' + f }) }) : undefined,
        notaSidly: 'Non spengo una patologia su SiDLY: nel CRM «No» può voler dire «non compilato».',
        notaCrm: 'Non tolgo una patologia dal CRM: su SiDLY «No» può voler dire «non compilato».' })
    }
    const testi: Array<[keyof MedicalCrm, string, string, string | null]> = [
      ['allergy', 'allergy', 'Allergie', 'allergie'], ['other_diseases', 'other_diseases', 'Altre patologie', null],
      ['medicines', 'medicines', 'Farmaci', null], ['more_info', 'more_info', 'Note mediche', 'note_mediche'],
    ]
    for (const [ck, sk, lab, crmCol] of testi) {
      const sv = toStr(d[sk]), cv = toStr(crm.medical[ck])
      def({ g: P, campo: lab, chiave: 'pat.' + sk, s: sv, c: cv, eq: (a, b) => containsAll(a, b),
        toSidly: w => { w.diseases[sk] = cv },
        toCrm: crmCol ? (w => colOp(w, 'pat.' + sk, 'configurations', crmCol, sv)) : undefined,
        notaCrm: 'Nel CRM questo campo ha una struttura propria (elenco di patologie o farmaci con orari): non lo riscrivo da SiDLY.' })
    }
    for (const [k, lab] of DISEASE_SOLO_SIDLY) solo(P, lab, d[k])
  }

  // Scheda assistito (SiDLY: sola lettura finche' l'endpoint di scrittura non e' confermato)
  const S2 = 'Scheda assistito'
  if (!nuovo && raw.card === undefined) push({ gruppo: S2, campo: 'Scheda assistito', sidly: '', crm: [crm.scheda.name_of_doctor, crm.scheda.hospital_info].filter(Boolean).join(' · '), stato: 'non_verificato' })
  else {
    const cardRoot = rootOf(raw.card)
    const card: any = nuovo ? {} : (cardRoot.patientCard && typeof cardRoot.patientCard === 'object' ? cardRoot.patientCard : cardRoot)
    const noScrittura = 'La scrittura sulla scheda assistito di SiDLY non è ancora attiva (endpoint da confermare).'
    def({ g: S2, campo: 'Medico curante', chiave: 'card.name_of_doctor', s: card.name_of_doctor, c: crm.scheda.name_of_doctor, eq: (a, b) => containsAll(a, b),
      notaSidly: noScrittura, notaCrm: 'Nel CRM il medico ha nome e telefono nello stesso campo: non lo scompongo.' })
    def({ g: S2, campo: 'Centro medico di riferimento', chiave: 'card.hospital_info', s: card.hospital_info, c: crm.scheda.hospital_info, eq: (a, b) => containsAll(a, b),
      notaSidly: noScrittura, toCrm: w => colOp(w, 'card.hospital_info', 'configurations', 'centro_medico_riferimento', toStr(card.hospital_info)) })
    for (const [k, lab] of CARD_SOLO_SIDLY) solo(S2, lab, card[k])
  }
  return rows
}

export function parseScelte(input: unknown): SceltaRiga[] | { errore: string } {
  if (input === undefined || input === null) return []
  if (!Array.isArray(input) || input.length > 100) return { errore: 'Elenco delle scelte non valido' }
  const out: SceltaRiga[] = []
  for (const x of input) {
    if (!x || typeof x !== 'object') return { errore: 'Scelta non valida' }
    const { chiave, verso, sidly, crm } = x as any
    if (typeof chiave !== 'string' || !chiave || chiave.length > 60 || (verso !== 'crm' && verso !== 'sidly') || typeof sidly !== 'string' || typeof crm !== 'string' || sidly.length > 4000 || crm.length > 4000) return { errore: 'Scelta non valida' }
    out.push({ chiave, verso, sidly, crm })
  }
  return out
}

/** Controlla le scelte contro le righe REALI lette ora (stesse righe viste dall'operatore) e prepara le scritture. */
function pianifica(rows: RigaInt[], scelte: SceltaRiga[]): { plan: Plan; campi: CampoInviato[]; crm: CampoCrm[]; errore?: string } {
  const plan = newPlan(), campi: CampoInviato[] = [], crm: CampoCrm[] = []
  const viste = new Set<string>()
  for (const s of scelte) {
    if (viste.has(s.chiave)) return { plan, campi, crm, errore: `Scelta duplicata per «${s.chiave}»` }
    viste.add(s.chiave)
    const r = rows.find(x => x.chiave === s.chiave)
    if (!r || !r.verso || !r.verso.includes(s.verso)) return { plan, campi, crm, errore: `Scelta non consentita per «${r?.campo || s.chiave}»: il campo non esiste in entrambi gli ambienti o il valore di partenza è vuoto` }
    if (s.sidly !== r.sidly || s.crm !== r.crm) return { plan, campi, crm, errore: `«${r.campo}» è cambiato dopo l'anteprima: richiudi e riapri il confronto prima di scegliere` }
    if (s.verso === 'crm') {
      r.toSidly!(plan)
      campi.push({ campo: r.chiave!, etichetta: r.campo, valore: r.crm, precedente: r.sidly, mostra_prima: r.sidly, mostra_dopo: r.crm })
    } else {
      const before = plan.ops.length
      r.toCrm!(plan)
      if (plan.ops.length === before) return { plan, campi, crm, errore: `«${r.campo}»: nessun dato da scrivere nel CRM` }
      crm.push({ campo: r.campo, prima: r.crm, dopo: r.sidly })
    }
  }
  return { plan, campi, crm }
}

function formContatti(list: any[], edits: Plan['contacts']): Record<string, any> {
  const form: Record<string, any> = {}
  for (let i = 0; i < 3; i++) {
    const n = i + 1, pc = list[i] || null, e = edits[n]
    if (!pc && !e) continue
    // Il portale invia sempre l'intero modulo: si rimandano anche i valori gia' presenti su SiDLY.
    if (pc?.id !== undefined && pc?.id !== null) form[`contact${n}ID`] = pc.id
    form[`contact${n}Name`] = e?.name ?? toStr(pc?.name)
    form[`contact${n}Phone`] = e?.phone ?? toStr(pc?.phone_num ?? pc?.phone)
    form[`contact${n}Affinity`] = toStr(pc?.family_kind)
    form[`contact${n}Address`] = toStr(pc?.address)
    form[`contact${n}Others`] = e?.others ?? toStr(pc?.others)
  }
  return form
}

const DISEASE_TEXT_KEYS = ['allergy', 'other_diseases', 'medicines', 'more_info']
const DISEASE_PASS: Array<[string, string]> = [
  ['walking_person', 'walkingPerson'], ['hearing', 'hearing'], ['seeing', 'seeing'], ['thinking', 'thinking'],
  ['place_for_documents', 'placeForDocuments'], ['place_for_medicines', 'placeForMedicine'], ['vaccine', 'vaccine'], ['vaccine_date', 'vaccineDate'], ['covid', 'covid'],
]
function formPatologie(platJson: any, edits: Record<string, any>): Record<string, any> {
  const d = rootOf(platJson)
  const form: Record<string, any> = {}
  for (const f of SIDLY_DISEASE_FLAGS) form[f] = f in edits ? edits[f] : (truthy(d[f]) ? 1 : 0)
  for (const k of DISEASE_TEXT_KEYS) form[k] = k in edits ? edits[k] : toStr(d[k])
  for (const [gk, fk] of DISEASE_PASS) form[fk] = d[gk] ?? ''
  if (d.id !== undefined && d.id !== null) form.diseaseID = d.id
  return form
}

/** Anteprima per un assistito che non esiste ancora su SiDLY: cosa verrebbe scritto subito dopo la creazione. */
export function anteprimaDettagliNuovo(crm: CrmPatient): CampoInviato[] {
  const out: CampoInviato[] = []
  crm.referenti.forEach((r, i) => {
    if (r.name) out.push({ campo: `referente${i + 1}.nome`, valore: r.name, precedente: '' })
    if (r.phone) out.push({ campo: `referente${i + 1}.telefono`, valore: r.phone, precedente: '' })
    if (r.email) out.push({ campo: `referente${i + 1}.email`, valore: r.email, precedente: '' })
  })
  for (const f of Object.keys(crm.medical.flags)) out.push({ campo: 'patologie.' + f, valore: 1, precedente: 0 })
  for (const k of DISEASE_TEXT_KEYS) { const v = toStr((crm.medical as any)[k]); if (v) out.push({ campo: 'patologie.' + k, valore: v, precedente: '' }) }
  return out
}

// ── Lettura di SiDLY ─────────────────────────────────────────────────────────────────────────────
async function leggiScheda(client: SidlyClient, crm: CrmPatient, resJson: any, assoc: string, out: SyncResult, raw: Raw, dry: boolean): Promise<void> {
  const brief = normalizePlatformPatient(resJson)
  // GET /patient/{id} e' una scheda BREVE (niente indirizzo, data di nascita, prefisso): la scheda completa
  // e' /manager/patient-edit-initial-data/{imei}, la stessa che legge il portale SiDLY.
  const imeiPlat = String((resJson && (resJson.imei ?? resJson.data?.imei)) || (assoc ? '' : crm.imei) || '')
  let plat = brief
  let fullJson: any = null
  if (imeiPlat) {
    const f = await client.request('GET', `/manager/patient-edit-initial-data/${enc(imeiPlat)}`)
    out.azioni.push({ azione: 'GET /manager/patient-edit-initial-data/{imei} (scheda completa)', risultato: String(f.status) })
    if (ok2xx(f.status) && f.json && typeof f.json === 'object') {
      fullJson = f.json
      const full = normalizePlatformPatient(f.json)
      plat = {
        userId: full.userId || brief.userId,
        user: { ...brief.user, ...Object.fromEntries(Object.entries(full.user).filter(([, v]) => v !== undefined && v !== null)) },
        band: { phones: full.band.phones && full.band.phones.length ? full.band.phones : brief.band.phones, simNumber: full.band.simNumber ?? brief.band.simNumber, whitelist: full.band.whitelist ?? brief.band.whitelist },
      }
    }
  }
  raw.brief = resJson; raw.full = fullJson; raw.plat = plat
  if (dry) out.diagnostica = { ...(out.diagnostica || {}), forma_risposta_patient: shapeOf(resJson), forma_scheda_completa: fullJson ? shapeOf(fullJson) : 'non leggibile' }
  out.sidly_user_id = plat.userId || assoc || out.sidly_user_id
  if (!fullJson) out.warning.push('Scheda completa SiDLY non leggibile: indirizzo e data di nascita non verificabili, quindi non modificabili')
}

async function leggiDettagli(client: SidlyClient, crm: CrmPatient, imei: string, raw: Raw, out: SyncResult, dry: boolean, quali: Array<'contacts' | 'diseases' | 'card'> = ['contacts', 'diseases', 'card']): Promise<void> {
  const diag: Record<string, unknown> = {}
  const voci: Array<{ k: 'contacts' | 'diseases' | 'card'; path: string; label: string; diag: string; serve: boolean; msg: string }> = [
    { k: 'contacts', path: '/getContacts', label: 'GET /getContacts/{imei}', diag: 'forma_contatti', serve: crm.referenti.length > 0, msg: 'Referenti non verificabili: lettura dei contatti SiDLY non riuscita' },
    { k: 'diseases', path: '/getDiseases', label: 'GET /getDiseases/{imei}', diag: 'forma_patologie', serve: hasMedical(crm.medical), msg: 'Patologie e farmaci non verificabili: lettura SiDLY non riuscita' },
    { k: 'card', path: '/patientCard', label: 'GET /patientCard/{imei} (sola lettura)', diag: 'forma_scheda_assistito', serve: Object.keys(crm.scheda).length > 0, msg: 'Scheda assistito non letta: il portale la usa solo per alcuni profili' },
  ]
  for (const v of voci.filter(x => quali.includes(x.k))) {
    const g = await client.request('GET', `${v.path}/${enc(imei)}`)
    out.azioni.push({ azione: v.label, risultato: String(g.status) })
    if (dry) diag[v.diag] = ok2xx(g.status) ? shapeOf(g.json) : 'non leggibile'
    if (ok2xx(g.status)) raw[v.k] = g.json
    else if (v.serve) out.warning.push(`${v.msg} (HTTP ${g.status})`)
  }
  if (dry && Object.keys(diag).length) out.diagnostica = { ...(out.diagnostica || {}), ...diag }
}

/** Scrive su SiDLY SOLO cio' che e' nel piano. In anteprima elenca le chiamate senza eseguirle. */
async function scriviSidly(client: SidlyClient, crm: CrmPatient, id: string, assoc: string, raw: Raw, plan: Plan, out: SyncResult, dry: boolean): Promise<string | null> {
  const body: any = {}
  if (Object.keys(plan.user).length) body.user = plan.user
  if (Object.keys(plan.band).length) body.band = plan.band
  const chiamate: Array<{ azione: string; metodo: string; path: string; body: any; campi: string[]; errore: string }> = []
  if (body.user || body.band) chiamate.push({
    azione: assoc ? 'PATCH /manager/patient/{user_id}' : 'PATCH /manager/patient/{imei}', metodo: 'PATCH', path: `/manager/patient/${enc(id)}`, body,
    campi: [...Object.keys(plan.user).map(k => 'user.' + k), ...Object.keys(plan.band).map(k => 'band.' + k)], errore: 'Aggiornamento assistito su SiDLY non riuscito',
  })
  if (Object.keys(plan.contacts).length) chiamate.push({
    azione: 'PATCH /editContacts/{imei}', metodo: 'PATCH', path: `/editContacts/${enc(id)}`, body: formContatti(pickArray(raw.contacts), plan.contacts),
    campi: Object.keys(plan.contacts).map(n => 'referente' + n), errore: 'Aggiornamento dei referenti su SiDLY non riuscito',
  })
  if (Object.keys(plan.diseases).length) chiamate.push({
    azione: 'PATCH /editDiseases/{imei}', metodo: 'PATCH', path: `/editDiseases/${enc(id)}`, body: formPatologie(raw.diseases, plan.diseases),
    campi: Object.keys(plan.diseases).map(k => 'patologie.' + k), errore: 'Aggiornamento di patologie e farmaci su SiDLY non riuscito',
  })
  for (const c of chiamate) {
    if (dry) { out.azioni.push({ azione: c.azione, risultato: 'non eseguito (anteprima)', campi: c.campi }); continue }
    const p = await client.request(c.metodo, c.path, c.body)
    out.azioni.push({ azione: c.azione, risultato: String(p.status), campi: c.campi })
    if (!ok2xx(p.status)) return `${c.errore} (HTTP ${p.status})`
  }
  return null
}

function decora(out: SyncResult, crm: CrmPatient, rows: RigaInt[]): void {
  out.assistito = `${crm.user.firstName} ${crm.user.lastName}`.trim()
  out.campi_inviati = out.campi_inviati.map(c => {
    const d: CampoInviato = { ...c }
    if (!d.etichetta) d.etichetta = etichettaCampo(c.campo)
    if (d.mostra_dopo === undefined) d.mostra_dopo = c.campo === 'band.phones' ? (crm.band.phones || []).map(p => conAlias(p.numberPrefix + p.number, p.alias || '')).join('\n') : mostra(c.valore, c.campo)
    if (c.precedente !== undefined && d.mostra_prima === undefined) d.mostra_prima = mostra(c.precedente, c.campo)
    return d
  })
  out.confronto = rows.map(({ toSidly, toCrm, ...r }) => r)
}

export async function syncAssistito(opts: SyncOptions): Promise<SyncResult> {
  const { crm, env } = opts
  const dry = !!opts.dryRun
  const client = new SidlyClient(env, opts.fetchImpl)
  const out: SyncResult = {
    esito: 'errore', sidly_user_id: null, azioni: [], warning: [...crm.warnings], campi_inviati: [], url_for_band: { registrato: false },
  }
  const fail = (msg: string): SyncResult => { out.esito = 'errore'; out.errore = msg; return out }
  const raw: Raw = {}

  try {
    let identifier = crm.imei
    const assoc = opts.associaUserId ? digits(opts.associaUserId) : ''
    if (assoc) identifier = assoc

    let res = await client.request('GET', `/patient/${enc(identifier)}`)
    out.azioni.push({ azione: assoc ? 'GET /patient/{user_id}' : 'GET /patient/{imei}', risultato: String(res.status) })

    let previsto: 'creato' | 'aggiornato' | 'invariato'
    let rows: RigaInt[] = []
    let creato = false

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

      // CREAZIONE (assistito inesistente su SiDLY: l'operatore l'ha richiesta e confermata esplicitamente)
      previsto = 'creato'
      creato = true
      raw.nuovo = true
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
        out.campi_inviati.push(...anteprimaDettagliNuovo(crm))
        out.warning.push('Assistito nuovo: referenti e patologie vengono scritti subito dopo la creazione; nell\'anteprima sono elencati con "Prima" vuoto')
      } else {
        const p = await client.request('POST', '/manager/patient', body)
        out.azioni.push({ azione: 'POST /manager/patient', risultato: String(p.status), campi })
        if (!ok2xx(p.status)) return fail(`Creazione assistito su SiDLY non riuscita (HTTP ${p.status})`)
        const j = p.json || {}
        const id = j.user_id ?? j.userId ?? j.data?.user_id ?? j.data?.userId ?? j.id ?? j.data?.id
        out.sidly_user_id = id === undefined || id === null ? null : String(id)
        if (!out.sidly_user_id) out.warning.push('SiDLY non ha restituito lo user_id: non salvato nel CRM')
        // Dettagli utente dell'assistito appena creato (referenti, patologie): dati del CRM, scritti solo se presenti.
        const w = newPlan()
        crm.referenti.forEach((r, i) => { w.contacts[i + 1] = { ...(r.name ? { name: r.name } : {}), ...(r.phone ? { phone: r.phone } : {}), ...(r.others ? { others: r.others } : {}) } })
        for (const f of Object.keys(crm.medical.flags)) w.diseases[f] = 1
        for (const k of DISEASE_TEXT_KEYS) { const v = toStr((crm.medical as any)[k]); if (v) w.diseases[k] = v }
        if (planHasSidly(w)) {
          const raw2: Raw = {}
          await leggiDettagli(client, crm, crm.imei, raw2, out, false, ['contacts', 'diseases'])
          const e2 = await scriviSidly(client, crm, crm.imei, '', raw2, w, out, false)
          if (e2) return fail(e2)
        }
      }
      rows = buildRows(crm, raw)
    } else if (res.status === 200) {
      await leggiScheda(client, crm, res.json, assoc, out, raw, dry)
      await leggiDettagli(client, crm, assoc || crm.imei, raw, out, dry)
      rows = buildRows(crm, raw)
      previsto = 'invariato' // senza scelte dell'operatore non si scrive nulla
      const scelte = opts.scelte || []
      if (scelte.length) {
        const p = pianifica(rows, scelte)
        if (p.errore) return fail(p.errore)
        out.campi_inviati = p.campi
        out.crm_scritture = p.crm
        const e1 = await scriviSidly(client, crm, assoc || crm.imei, assoc, raw, p.plan, out, dry)
        if (e1) return fail(e1)
        if (p.plan.ops.length) {
          const campi = p.crm.map(c => c.campo)
          if (dry) out.azioni.push({ azione: 'Scrittura nel CRM', risultato: 'non eseguito (anteprima)', campi })
          else {
            if (!opts.applyCrm) return fail('Scrittura nel CRM non disponibile')
            try { await opts.applyCrm(p.plan.ops) } catch (e: any) {
              return fail('Scrittura nel CRM non riuscita (' + String(e?.message || e).slice(0, 100) + (planHasSidly(p.plan) ? '); le modifiche su SiDLY erano già state applicate' : ')'))
            }
            out.azioni.push({ azione: 'Scrittura nel CRM', risultato: 'ok', campi })
          }
        }
        if (planHasSidly(p.plan) || p.plan.ops.length) previsto = 'aggiornato'
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
    void creato
    decora(out, crm, rows)
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
  // Query separata: se una colonna non esiste in un ambiente, il confronto perde solo queste righe, non la sincronizzazione.
  const extra = leadId ? await safeFirst(db, 'SELECT cfAssistito, luogoNascitaAssistito, nomeRichiedente, cognomeRichiedente, email, telefono, piano, servizio FROM leads WHERE id = ?', leadId) : null
  const config = leadId ? await safeFirst(db, 'SELECT * FROM configurations WHERE leadId = ? ORDER BY id DESC LIMIT 1', leadId) : null
  const ddt = assistito.imei ? await safeFirst(db, 'SELECT sim_number FROM ddts WHERE serial_number = ? AND sim_number IS NOT NULL AND sim_number != \'\' ORDER BY created_at DESC LIMIT 1', assistito.imei) : null
  return { assistito, lead, leadId, config, simNumber: ddt?.sim_number || null, extra }
}

export interface RunOptions {
  db: any
  env: SidlyEnv
  assistitoId: number
  dryRun?: boolean
  associaUserId?: string
  confermaCrea?: boolean
  fetchImpl?: Fetch
  scelte?: SceltaRiga[]
}

/** Colonne del CRM che si possono scrivere da questa funzione (elenco chiuso: nessun nome di colonna arriva dal browser). */
const COLONNE_OK: Record<Tabella, RegExp> = {
  configurations: /^(nome_assistito|cognome_assistito|data_nascita|telefono|peso|altezza|email|allergie|note_mediche|centro_medico_riferimento|contatto[123]_(nome|cognome|telefono|email))$/,
  leads: /^(nomeAssistito|cognomeAssistito|dataNascitaAssistito|indirizzoAssistito|cittaAssistito|provinciaAssistito|capAssistito)$/,
  assistiti: /^(nome_assistito|cognome_assistito|peso|altezza)$/,
  ddts: /^sim_number$/,
}

/** Scrive nel CRM le righe in cui l'operatore ha scelto "vale SiDLY". Tutto o niente (batch D1 quando disponibile). */
export async function applyCrmOps(db: any, ops: CrmOp[], ctx: { assistitoId: number; leadId: string | null; configId: number | null; imei: string; cronicheRaw: string }): Promise<void> {
  const stmts: any[] = []
  let croniche: string[] | null = null
  for (const op of ops) {
    if (op.t === 'croniche') {
      croniche = croniche || parseList(ctx.cronicheRaw)
      const k = op.key.toLowerCase()
      const senza = croniche.filter(x => x.toLowerCase() !== k)
      croniche = op.on ? [...senza, op.key] : senza
      continue
    }
    if (!COLONNE_OK[op.tabella]?.test(op.col)) throw new Error('colonna non ammessa')
    let where: string, id: unknown
    if (op.tabella === 'configurations') { where = 'id = ?'; id = ctx.configId }
    else if (op.tabella === 'leads') { where = 'id = ?'; id = ctx.leadId }
    else if (op.tabella === 'assistiti') { where = 'id = ?'; id = ctx.assistitoId }
    else { where = 'serial_number = ?'; id = ctx.imei }
    if (id === null || id === undefined || id === '') throw new Error('scheda del CRM non trovata')
    stmts.push(db.prepare(`UPDATE ${op.tabella} SET ${op.col} = ? WHERE ${where}`).bind(op.val, id))
  }
  if (croniche) {
    if (ctx.configId === null) throw new Error('scheda del CRM non trovata')
    const t = ctx.cronicheRaw.trim()
    const val = (!t || t.startsWith('[')) ? JSON.stringify(croniche) : croniche.join(',')
    stmts.push(db.prepare('UPDATE configurations SET patologie_croniche = ? WHERE id = ?').bind(val, ctx.configId))
  }
  if (typeof db.batch === 'function') await db.batch(stmts)
  else for (const s of stmts) await s.run()
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

  const result = await syncAssistito({ crm, env: o.env, fetchImpl: o.fetchImpl, dryRun: o.dryRun, associaUserId: o.associaUserId, confermaCrea: o.confermaCrea, scelte: o.scelte,
    applyCrm: o.dryRun ? undefined : (ops) => applyCrmOps(o.db, ops, { assistitoId: o.assistitoId, leadId: src.leadId || null, configId: src.config?.id ?? null, imei: crm.imei, cronicheRaw: toStr(src.config?.patologie_croniche) }) })

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
