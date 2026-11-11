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
  /** Una riga per sezione: cambia / gia' allineato / solo segnalato / non verificabile. */
  riepilogo?: Riepilogo[]
  previsto?: 'creato' | 'aggiornato' | 'invariato'
  sidly_user_id: string | null
  azioni: Azione[]
  warning: string[]
  campi_inviati: CampoInviato[]
  url_for_band: { registrato: boolean; url?: string; motivo?: string }
  candidati?: Candidato[]
  motivo_conferma?: string
  errore?: string
  /** Differenze CRM/SiDLY NON modificate (la piattaforma e' master). Non viene salvato nel DB del CRM. */
  differenze?: Differenza[]
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

export interface CrmSources { assistito: any; lead: any | null; config: any | null; simNumber: string | null }
export interface SosPhone { numberPrefix: string; number: string; repeatNumber: number; alias?: string }
export interface Referente { name: string; phone: string; family_kind?: string; others?: string }
export interface WhitelistEntry { number: string; alias: string }
export interface MedicalCrm { flags: Record<string, 1>; other_diseases?: string; allergy?: string; medicines?: string; more_info?: string }
export interface Differenza { campo: string; crm: unknown; sidly: unknown; etichetta?: string }
export interface Riepilogo { sezione: string; stato: 'cambia' | 'allineato' | 'solo_segnalato' | 'non_verificato' }
export interface CrmPatient {
  imei: string
  referenti: Referente[]
  whitelist: WhitelistEntry[]
  medical: MedicalCrm
  user: { firstName: string; lastName: string; date?: { year: number; month: number; day: number }; weight?: number; height?: number; phonePrefix?: string; phone?: string; address?: string }
  band: { imei: string; phones?: SosPhone[]; simNumber?: string; timezone: string; lang_band: string; [k: string]: any }
  /** Scheda assistito (patientCard): solo i campi che il CRM possiede (medico curante, centro di riferimento). */
  scheda: { name_of_doctor?: string; hospital_info?: string }
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
    out.push({ name, phone, ...(email ? { others: `email: ${email}` } : {}) })
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
  return { imei, user, band, warnings, referenti, whitelist, medical: buildMedical(cfg), scheda }
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

export interface Diff { userPatch: Record<string, any>; bandPatch: Record<string, any>; warnings: string[]; campi: CampoInviato[] }

const eqStr = (a: any, b: any) => toStr(a).toLowerCase() === toStr(b).toLowerCase()
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
const USER_EQ: Record<string, (a: any, b: any) => boolean> = {
  firstName: eqStr, lastName: eqStr, address: eqAddress, phone: eqDigits, phonePrefix: eqDigits, date: eqDate, weight: eqNum, height: eqNum,
}
const phoneKey = (p: SosPhone) => digits(p.numberPrefix) + digits(p.number)

export function diffPatient(crm: CrmPatient, plat: PlatformPatient, nonVisibili: string[] = []): Diff {
  const userPatch: Record<string, any> = {}
  const bandPatch: Record<string, any> = {}
  const warnings: string[] = []
  const campi: CampoInviato[] = []

  for (const k of Object.keys(USER_EQ)) {
    const c = (crm.user as any)[k]
    if (isEmpty(c)) continue // mai azzerare: campo vuoto nel CRM = omesso
    if (nonVisibili.includes(k)) continue // scheda completa non letta: non so se e' vuoto, quindi non lo tocco
    const p = (plat.user as any)[k]
    if (isEmpty(p) || !USER_EQ[k](c, p)) {
      userPatch[k] = c
      campi.push({ campo: 'user.' + k, valore: c, precedente: isEmpty(p) ? '' : p })
    }
  }

  const nv = nonVisibili.filter(k => !isEmpty((crm.user as any)[k]))
  if (nv.length) warnings.push(`Scheda completa SiDLY non leggibile: non inviati per prudenza i campi ${nv.join(', ')} (non so se sono già compilati)`)

  // Numeri SOS: devono coincidere con i referenti di "Dettagli utente" (richiesta esplicita): il CRM e' master.
  // Dell'esistente si conserva repeatNumber (configurazione operativa) per i numeri gia' presenti.
  const cPhones = crm.band.phones || []
  const pPhones = plat.band.phones || []
  if (cPhones.length) {
    const a = new Set(cPhones.map(phoneKey)), b = new Set(pPhones.map(phoneKey))
    const same = a.size === b.size && [...a].every(x => b.has(x))
    if (!same) {
      bandPatch.phones = cPhones.map(c => {
        const m = pPhones.find(p => phoneKey(p) === phoneKey(c))
        return m && m.repeatNumber ? { ...c, repeatNumber: m.repeatNumber } : c
      })
      campi.push({ campo: 'band.phones', valore: cPhones.map(c => c.numberPrefix + c.number), precedente: pPhones.map(p => p.numberPrefix + p.number) })
      const persi = pPhones.filter(p => !a.has(phoneKey(p)))
      if (persi.length) warnings.push(`Numeri SOS presenti solo su SiDLY e non tra i referenti del CRM: verranno sostituiti (${persi.map(p => p.numberPrefix + p.number).join(', ')})`)
    }
  }
  // Numeri ammessi (whitelist): CRM master.
  if (crm.whitelist.length) {
    const cw = new Set(crm.whitelist.map(w => digits(w.number)))
    const pw = new Set((plat.band.whitelist || []).map(digits))
    const same = cw.size === pw.size && [...cw].every(x => pw.has(x))
    if (!same) {
      bandPatch.whitelistNumbers = crm.band.whitelistNumbers
      bandPatch.whiteListAlias = crm.band.whiteListAlias
      campi.push({ campo: 'band.whitelistNumbers', valore: crm.band.whitelistNumbers, precedente: (plat.band.whitelist || []).join(',') })
    }
  }
  if (crm.band.simNumber) {
    if (isEmpty(plat.band.simNumber)) {
      bandPatch.simNumber = crm.band.simNumber
      campi.push({ campo: 'band.simNumber', valore: crm.band.simNumber, precedente: '' })
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

export interface DettagliPlan {
  contactsForm: Record<string, any> | null
  diseasesForm: Record<string, any> | null
  campi: CampoInviato[]
  differenze: Differenza[]
  warnings: string[]
}

/** Referenti CRM -> contatti SiDLY (posizione n = referente n). Il CRM e' master per nome e telefono; parentela e indirizzo di SiDLY non si toccano. */
export function planContacts(crm: CrmPatient, platJson: any): { form: Record<string, any> | null; campi: CampoInviato[] } {
  const list = pickArray(platJson)
  const campi: CampoInviato[] = []
  const form: Record<string, any> = {}
  let changed = false
  for (let i = 0; i < 3; i++) {
    const n = i + 1
    const ref = crm.referenti[i]
    const pc = list[i] || null
    if (!ref && !pc) continue
    const cur = { name: toStr(pc?.name), phone: toStr(pc?.phone_num ?? pc?.phone), kind: toStr(pc?.family_kind), address: toStr(pc?.address), others: toStr(pc?.others) }
    let name = cur.name, phone = cur.phone, others = cur.others
    if (ref?.name && !eqStr(ref.name, cur.name)) { name = ref.name; campi.push({ campo: `referente${n}.nome`, valore: ref.name, precedente: cur.name }) }
    if (ref?.phone && !eqPhoneLoose(ref.phone, cur.phone)) { phone = ref.phone; campi.push({ campo: `referente${n}.telefono`, valore: ref.phone, precedente: cur.phone }) }
    if (ref?.others && !cur.others) { others = ref.others; campi.push({ campo: `referente${n}.altro`, valore: ref.others, precedente: '' }) }
    if (name !== cur.name || phone !== cur.phone || others !== cur.others) changed = true
    // Il portale invia sempre l'intero modulo: si rimandano anche i valori gia' presenti su SiDLY.
    if (pc?.id !== undefined && pc?.id !== null) form[`contact${n}ID`] = pc.id
    form[`contact${n}Name`] = name
    form[`contact${n}Phone`] = phone
    form[`contact${n}Affinity`] = cur.kind
    form[`contact${n}Address`] = cur.address
    form[`contact${n}Others`] = others
  }
  return { form: changed ? form : null, campi }
}

const DISEASE_TEXT: Array<[keyof MedicalCrm, string]> = [['allergy', 'allergy'], ['other_diseases', 'other_diseases'], ['medicines', 'medicines'], ['more_info', 'more_info']]
const DISEASE_PASS: Array<[string, string]> = [
  ['walking_person', 'walkingPerson'], ['hearing', 'hearing'], ['seeing', 'seeing'], ['thinking', 'thinking'],
  ['place_for_documents', 'placeForDocuments'], ['place_for_medicines', 'placeForMedicine'], ['vaccine', 'vaccine'], ['vaccine_date', 'vaccineDate'], ['covid', 'covid'],
]

/** Patologie/farmaci CRM -> SiDLY: gli interruttori si accendono ma non si spengono; i testi si compilano solo se vuoti su SiDLY (se diversi: solo segnalati). */
export function planDiseases(crm: CrmPatient, platJson: any): { form: Record<string, any> | null; campi: CampoInviato[]; differenze: Differenza[] } {
  const campi: CampoInviato[] = []
  const differenze: Differenza[] = []
  const d = rootOf(platJson)
  const form: Record<string, any> = {}
  let changed = false
  for (const f of SIDLY_DISEASE_FLAGS) {
    const on = truthy(d[f])
    if (crm.medical.flags[f] && !on) { form[f] = 1; changed = true; campi.push({ campo: 'patologie.' + f, valore: 1, precedente: 0 }) }
    else form[f] = on ? 1 : 0
  }
  for (const [ck, sk] of DISEASE_TEXT) {
    const c = toStr(crm.medical[ck])
    const p = toStr(d[sk])
    if (c && !p) { form[sk] = c; changed = true; campi.push({ campo: 'patologie.' + sk, valore: c, precedente: '' }) }
    else {
      form[sk] = p
      if (c && !containsAll(p, c)) differenze.push({ campo: 'patologie.' + sk, crm: c, sidly: p })
    }
  }
  for (const [gk, fk] of DISEASE_PASS) form[fk] = d[gk] ?? ''
  if (d.id !== undefined && d.id !== null) form.diseaseID = d.id
  return { form: changed ? form : null, campi, differenze }
}

/** Scheda assistito (patientCard): per ora SOLA LETTURA, segnala le differenze con medico curante / centro di riferimento. */
export function planScheda(crm: CrmPatient, platJson: any): Differenza[] {
  const card = (rootOf(platJson).patientCard && typeof rootOf(platJson).patientCard === 'object') ? rootOf(platJson).patientCard : rootOf(platJson)
  const out: Differenza[] = []
  for (const [k, v] of Object.entries(crm.scheda)) {
    const p = toStr((card as any)[k])
    if (v && !containsAll(p, v)) out.push({ campo: 'scheda.' + k, crm: v, sidly: p })
  }
  return out
}

/** Anteprima per un assistito che non esiste ancora su SiDLY: tutto cio' che si scriverebbe dopo la creazione, con "Prima" vuoto. */
export function anteprimaDettagliNuovo(crm: CrmPatient): CampoInviato[] {
  const out: CampoInviato[] = []
  crm.referenti.forEach((r, i) => {
    if (r.name) out.push({ campo: `referente${i + 1}.nome`, valore: r.name, precedente: '' })
    if (r.phone) out.push({ campo: `referente${i + 1}.telefono`, valore: r.phone, precedente: '' })
    if (r.others) out.push({ campo: `referente${i + 1}.altro`, valore: r.others, precedente: '' })
  })
  for (const f of Object.keys(crm.medical.flags)) out.push({ campo: 'patologie.' + f, valore: 1, precedente: 0 })
  for (const [ck, sk] of DISEASE_TEXT) { const v = toStr(crm.medical[ck]); if (v) out.push({ campo: 'patologie.' + sk, valore: v, precedente: '' }) }
  return out
}

async function syncDettagli(client: SidlyClient, crm: CrmPatient, imei: string, dry: boolean, out: SyncResult): Promise<string | null> {
  const diag: Record<string, unknown> = {}
  const differenze: Differenza[] = []
  // Contatti (referenti)
  if (crm.referenti.length) {
    const g = await client.request('GET', `/getContacts/${enc(imei)}`)
    out.azioni.push({ azione: 'GET /getContacts/{imei}', risultato: String(g.status) })
    if (dry) diag.forma_contatti = ok2xx(g.status) ? shapeOf(g.json) : 'non leggibile'
    if (ok2xx(g.status)) {
      const pl = planContacts(crm, g.json)
      out.campi_inviati.push(...pl.campi)
      if (pl.form) {
        const campi = pl.campi.map(c => c.campo)
        if (dry) out.azioni.push({ azione: 'PATCH /editContacts/{imei}', risultato: 'non eseguito (anteprima)', campi })
        else {
          const p = await client.request('PATCH', `/editContacts/${enc(imei)}`, pl.form)
          out.azioni.push({ azione: 'PATCH /editContacts/{imei}', risultato: String(p.status), campi })
          if (!ok2xx(p.status)) return `Aggiornamento dei referenti su SiDLY non riuscito (HTTP ${p.status})`
        }
      }
    } else out.warning.push(`Referenti non sincronizzati: lettura dei contatti SiDLY non riuscita (HTTP ${g.status})`)
  }
  // Patologie e farmaci
  if (hasMedical(crm.medical)) {
    const g = await client.request('GET', `/getDiseases/${enc(imei)}`)
    out.azioni.push({ azione: 'GET /getDiseases/{imei}', risultato: String(g.status) })
    if (dry) diag.forma_patologie = ok2xx(g.status) ? shapeOf(g.json) : 'non leggibile'
    if (ok2xx(g.status)) {
      const pl = planDiseases(crm, g.json)
      differenze.push(...pl.differenze)
      out.campi_inviati.push(...pl.campi)
      if (pl.form) {
        const campi = pl.campi.map(c => c.campo)
        if (dry) out.azioni.push({ azione: 'PATCH /editDiseases/{imei}', risultato: 'non eseguito (anteprima)', campi })
        else {
          const p = await client.request('PATCH', `/editDiseases/${enc(imei)}`, pl.form)
          out.azioni.push({ azione: 'PATCH /editDiseases/{imei}', risultato: String(p.status), campi })
          if (!ok2xx(p.status)) return `Aggiornamento di patologie e farmaci su SiDLY non riuscito (HTTP ${p.status})`
        }
      }
    } else out.warning.push(`Patologie e farmaci non sincronizzati: lettura SiDLY non riuscita (HTTP ${g.status})`)
  }
  // Scheda assistito: sola lettura
  if (Object.keys(crm.scheda).length) {
    const g = await client.request('GET', `/patientCard/${enc(imei)}`)
    out.azioni.push({ azione: 'GET /patientCard/{imei} (sola lettura)', risultato: String(g.status) })
    if (dry) diag.forma_scheda_assistito = ok2xx(g.status) ? shapeOf(g.json) : 'non leggibile'
    if (ok2xx(g.status)) differenze.push(...planScheda(crm, g.json))
    else out.warning.push(`Scheda assistito non letta (HTTP ${g.status}): il portale la usa solo per alcuni profili`)
  }
  if (differenze.length) {
    out.differenze = [...(out.differenze || []), ...differenze]
    out.warning.push(`${differenze.length} campo/i di "Dettagli utente" su SiDLY diversi dal CRM (o vuoti nella scheda assistito): non sovrascritti, vedi "Differenze"`)
  }
  if (dry && Object.keys(diag).length) out.diagnostica = { ...(out.diagnostica || {}), ...diag }
  return null
}

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
  let m = campo.match(/^referente(\d)\.(nome|telefono|altro)$/)
  if (m) return `Referente ${m[1]} · ${m[2] === 'altro' ? 'e-mail / note' : m[2]}`
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

function decora(out: SyncResult, crm: CrmPatient): void {
  out.assistito = `${crm.user.firstName} ${crm.user.lastName}`.trim()
  out.campi_inviati = out.campi_inviati.map(c => {
    const d: CampoInviato = { ...c, etichetta: etichettaCampo(c.campo) }
    d.mostra_dopo = mostra(c.valore, c.campo)
    if (c.precedente !== undefined) d.mostra_prima = mostra(c.precedente, c.campo)
    if (c.campo === 'band.phones') d.mostra_dopo = (crm.band.phones || []).map(p => conAlias(p.numberPrefix + p.number, p.alias || '')).join('\n')
    if (c.campo === 'band.whitelistNumbers') {
      d.mostra_dopo = crm.whitelist.map(w => conAlias(w.number, w.alias)).join('\n')
      if (c.precedente !== undefined) d.mostra_prima = String(c.precedente).split(',').filter(Boolean).join('\n')
    }
    return d
  })
  if (out.differenze) out.differenze = out.differenze.map(x => ({ ...x, etichetta: etichettaCampo(x.campo) }))

  const has = (re: RegExp) => out.campi_inviati.some(c => re.test(c.campo))
  const hasDiff = (re: RegExp) => (out.differenze || []).some(x => re.test(x.campo))
  const letto = (nome: string) => { const a = out.azioni.find(x => x.azione.startsWith(nome)); return !a || /^2\d\d$/.test(a.risultato) }
  const r: Riepilogo[] = []
  r.push({ sezione: 'Anagrafica (nome, indirizzo, data di nascita, telefono, peso, altezza)', stato: has(/^user\./) ? 'cambia' : (out.warning.some(w => /Scheda completa SiDLY non leggibile/.test(w)) ? 'non_verificato' : 'allineato') })
  if (crm.referenti.length) r.push({ sezione: 'Referenti ("Dettagli utente")', stato: !letto('GET /getContacts') ? 'non_verificato' : has(/^referente/) ? 'cambia' : 'allineato' })
  if (crm.band.phones?.length) r.push({ sezione: 'Numeri SOS (devono coincidere con i 3 referenti)', stato: has(/^band\.phones$/) ? 'cambia' : 'allineato' })
  if (crm.whitelist.length) r.push({ sezione: 'Numeri ammessi', stato: has(/^band\.whitelistNumbers$/) ? 'cambia' : 'allineato' })
  if (crm.band.simNumber) r.push({ sezione: 'Numero SIM', stato: has(/^band\.simNumber$/) ? 'cambia' : out.warning.some(w => /Numero SIM diverso/.test(w)) ? 'solo_segnalato' : 'allineato' })
  if (hasMedical(crm.medical)) r.push({ sezione: 'Patologie, farmaci, allergie, note mediche', stato: !letto('GET /getDiseases') ? 'non_verificato' : has(/^patologie\./) ? 'cambia' : hasDiff(/^patologie\./) ? 'solo_segnalato' : 'allineato' })
  if (Object.keys(crm.scheda).length) r.push({ sezione: 'Scheda assistito (medico curante, centro di riferimento)', stato: !letto('GET /patientCard') ? 'non_verificato' : hasDiff(/^scheda\./) ? 'solo_segnalato' : 'allineato' })
  out.riepilogo = r
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
        // Anteprima completa anche per i dettagli che verrebbero scritti subito dopo la creazione (su SiDLY ora: niente).
        out.campi_inviati.push(...anteprimaDettagliNuovo(crm))
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
      const brief = normalizePlatformPatient(res.json)
      // GET /patient/{id} e' una scheda BREVE (niente indirizzo, data di nascita, prefisso): la scheda completa
      // e' /manager/patient-edit-initial-data/{imei}, la stessa che legge il portale SiDLY.
      const imeiPlat = String((res.json && (res.json.imei ?? res.json.data?.imei)) || (assoc ? '' : crm.imei) || '')
      let plat = brief
      let nonVisibili: string[] = []
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
      if (!fullJson) nonVisibili = ['address', 'date', 'phonePrefix']
      if (dry) out.diagnostica = { forma_risposta_patient: shapeOf(res.json), forma_scheda_completa: fullJson ? shapeOf(fullJson) : 'non leggibile' }
      out.sidly_user_id = plat.userId || (assoc || null)
      const d = diffPatient(crm, plat, nonVisibili)
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

    // "Dettagli utente" (referenti, patologie/farmaci, scheda): l'assistito deve esistere su SiDLY.
    if (previsto === 'creato' && dry) {
      out.warning.push('Assistito nuovo: referenti e patologie vengono scritti subito dopo la creazione; nell\'anteprima sono elencati con "Prima" vuoto')
    } else {
      const errD = await syncDettagli(client, crm, assoc || crm.imei, dry, out)
      if (errD) return fail(errD)
      if (previsto === 'invariato' && out.campi_inviati.length) previsto = 'aggiornato'
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
    decora(out, crm)
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
