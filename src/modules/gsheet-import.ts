/**
 * GOOGLE SHEETS IMPORT — TeleMedCare V12.0
 *
 * Importa lead dal foglio Google Sheets condiviso (backup HubSpot eCura).
 * 
 * Accesso: export CSV pubblico (sheet deve essere "Chiunque con il link — Visualizzatore")
 * oppure via GOOGLE_SHEETS_API_KEY come variabile d'ambiente su Cloudflare.
 *
 * Tracciato atteso (flessibile — rilevato dall'intestazione riga 1):
 *  Timestamp | Nome | Cognome | Email | Telefono | Servizio | Piano |
 *  Nome Assistito | Cognome Assistito | Età Assistito | Note | Canale | Consenso Privacy
 *
 * Logica: stessa di hubspot-auto-import — UPSERT per email (non duplica).
 * ID generato: LEAD-GSHEET-00001, LEAD-GSHEET-00002, …
 */

import type { D1Database } from '@cloudflare/workers-types'
import { applyDiscountFromNotes } from './discount-from-notes'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface GSheetImportResult {
  success: boolean
  message: string
  imported: number
  updated: number
  skipped: number
  errors: number
  errorDetails: string[]
  rowsRead: number
  dryRun: boolean
}

export interface GSheetImportConfig {
  spreadsheetId: string
  sheetGid?: string        // gid del foglio (0 per il primo)
  dryRun?: boolean
  apiKey?: string          // GOOGLE_SHEETS_API_KEY (opzionale se sheet è pubblico)
  skipFirstRow?: boolean   // true = prima riga è intestazione (default true)
}

// ─────────────────────────────────────────────
// COLONNE ATTESE (case-insensitive, trim)
// ─────────────────────────────────────────────

/** Mappa da nome colonna normalizzato → chiave interna */
const COL_MAP: Record<string, string> = {
  // Timestamp / data
  'timestamp':              'timestamp',
  'data':                   'timestamp',
  'data compilazione':      'timestamp',
  'data richiesta':         'timestamp',

  // Richiedente
  'nome':                   'nome',
  'nome richiedente':       'nome',
  'first name':             'nome',
  'firstname':              'nome',

  'cognome':                'cognome',
  'cognome richiedente':    'cognome',
  'last name':              'cognome',
  'lastname':               'cognome',

  'email':                  'email',
  'e-mail':                 'email',
  'indirizzo email':        'email',

  'telefono':               'telefono',
  'cellulare':              'telefono',
  'phone':                  'telefono',
  'contatto telefonico':    'telefono',

  // Assistito
  'nome assistito':         'nomeAssistito',
  'nome dell\'assistito':   'nomeAssistito',

  'cognome assistito':      'cognomeAssistito',
  'cognome dell\'assistito':'cognomeAssistito',

  'età assistito':          'etaAssistito',
  'eta assistito':          'etaAssistito',
  'età':                    'etaAssistito',

  // Prodotto
  'servizio':               'servizio',
  'servizio ecura':         'servizio',
  'servizio di interesse':  'servizio',
  'piano':                  'piano',
  'piano ecura':            'piano',
  'piano desiderato':       'piano',

  // Canale
  'canale':                 'canale',
  'canale acquisizione':    'canale',
  'source':                 'canale',
  'utm_source':             'canale',
  'canale_acquisizione':    'canale',

  // Note
  'note':                   'note',
  'messaggio':              'note',
  'message':                'note',
  'note aggiuntive':        'note',

  // Consensi
  'privacy':                'privacy',
  'consenso privacy':       'privacy',
  'gdpr':                   'privacy',
  'consenso':               'privacy',
  'marketing':              'marketing',
  'consenso marketing':     'marketing',
  'terze':                  'terze',
  'consenso terze':         'terze',

  // Stato / Status
  'status':                 'status',
  'stato':                  'status',

  // External ID (per deduplicazione con HubSpot)
  'hubspot id':             'hubspotId',
  'hs_id':                  'hubspotId',
  'external_id':            'hubspotId',
  'id hubspot':             'hubspotId',
}

// ─────────────────────────────────────────────
// PARSE CSV (RFC 4180 compatible)
// ─────────────────────────────────────────────

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // escaped quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function parseCsv(text: string): string[][] {
  // Normalizza line endings
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const rows: string[][] = []
  let i = 0

  while (i < lines.length) {
    // Conta le virgolette per capire se la riga continua sulla successiva
    let line = lines[i]
    let quoteCount = (line.match(/"/g) || []).length
    while (quoteCount % 2 !== 0 && i + 1 < lines.length) {
      i++
      line += '\n' + lines[i]
      quoteCount = (line.match(/"/g) || []).length
    }
    if (line.trim()) rows.push(parseCsvLine(line))
    i++
  }
  return rows
}

// ─────────────────────────────────────────────
// NORMALIZZAZIONE VALORI
// ─────────────────────────────────────────────

function normalizeHeader(h: string): string {
  return h.toLowerCase().trim().replace(/\s+/g, ' ')
}

function normalizeServizio(raw: string): string {
  const v = raw.toUpperCase().trim()
  if (v.includes('PRO') && v.includes('FAMILY')) return 'eCura Family PRO'
  if (v.includes('FAMILY')) return 'eCura Family'
  if (v.includes('PREMIUM')) return 'eCura PREMIUM'  // PREMIUM prima di PRO
  if (v.includes('PRO')) return 'eCura PRO'
  if (v.includes('CARE')) return 'eCura'
  return raw || 'eCura'
}

function normalizePiano(raw: string): string {
  const v = raw.toUpperCase().trim()
  if (v.includes('AVANZATO') || v.includes('ADVANCED')) return 'AVANZATO'
  if (v.includes('BASE') || v.includes('BASIC')) return 'BASE'
  return raw || 'BASE'
}

function normalizeCanale(raw: string): string | null {
  const v = raw.toUpperCase().trim()
  if (v.includes('META') || v.includes('FACEBOOK') || v.includes('INSTAGRAM') || v.includes('FB')) return 'META'
  if (v.includes('GOOGLE') || v.includes('SEARCH') || v.includes('ADWORDS')) return 'GOOGLE'
  if (v.includes('DIRETTO') || v.includes('DIRECT')) return 'DIRETTO'
  if (v.includes('ALTRO') || v.includes('OTHER') || v.includes('EMAIL')) return 'ALTRO'
  return raw || null
}

/** Normalizza numero di telefono: rimuove spazi, trattini, parentesi.
 *  Gestisce prefisso italiano: 0039 → +39, 39XXXXXXXX → +39XXXXXXXX */
function normalizePhone(raw: string): string {
  let p = raw.replace(/[\s\-().]/g, '')
  if (p.startsWith('0039')) p = '+39' + p.slice(4)
  else if (p.startsWith('39') && p.length >= 11 && !p.startsWith('+')) p = '+' + p
  return p
}

function normalizeConsent(raw: string): boolean {
  const v = raw.toLowerCase().trim()
  return v === 'true' || v === '1' || v === 'si' || v === 'sì' || v === 'yes' || v === 'ok' || v === 'accetto'
}

function normalizeStatus(raw: string): string {
  const v = raw.toUpperCase().trim()
  if (v === 'CONVERTED' || v === 'CONVERTITO') return 'CONVERTED'
  if (v === 'LOST' || v === 'PERSO') return 'LOST'
  if (v === 'CONTACTED' || v === 'CONTATTATO') return 'CONTACTED'
  if (v === 'NEW' || v === 'NUOVO' || !v) return 'NEW'
  return 'NEW'
}

// ─────────────────────────────────────────────
// FETCH CSV DAL GOOGLE SHEET
// ─────────────────────────────────────────────

async function fetchSheetCsv(config: GSheetImportConfig): Promise<string> {
  const { spreadsheetId, sheetGid = '0', apiKey } = config

  const isHtml = (text: string) =>
    text.trimStart().startsWith('<!') || text.trimStart().startsWith('<html')

  // ── Prova 1: URL "Pubblica sul Web" (/pub?output=csv)
  // Funziona anche con Google Workspace che vieta la condivisione pubblica esterna.
  // Richiede che il foglio sia pubblicato via File → Condividi → Pubblica sul Web.
  const pubUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/pub?gid=${sheetGid}&single=true&output=csv`
  try {
    const res = await fetch(pubUrl, { redirect: 'follow' })
    if (res.ok) {
      const text = await res.text()
      if (!isHtml(text) && text.trim().length > 0) {
        console.log(`✅ [GSHEET] Accesso via /pub?output=csv riuscito (${text.length} bytes)`)
        return text
      }
    }
  } catch (_) { /* fallthrough */ }

  // ── Prova 2: export CSV diretto (/export?format=csv)
  // Funziona solo se il foglio è "Chiunque con il link può visualizzare".
  const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${sheetGid}`
  try {
    const res = await fetch(exportUrl, { headers: { 'Accept': 'text/csv' }, redirect: 'follow' })
    if (res.ok) {
      const text = await res.text()
      if (!isHtml(text) && text.trim().length > 0) {
        console.log(`✅ [GSHEET] Accesso via /export?format=csv riuscito (${text.length} bytes)`)
        return text
      }
    }
  } catch (_) { /* fallthrough */ }

  // ── Prova 3: Google Sheets API v4 con API Key
  if (apiKey) {
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:Z?key=${apiKey}`
    const res = await fetch(apiUrl)
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Google Sheets API error ${res.status}: ${err.slice(0, 200)}`)
    }
    const json = await res.json() as { values?: string[][] }
    if (!json.values || json.values.length === 0) {
      throw new Error('Google Sheets API: nessun dato nel foglio')
    }
    console.log(`✅ [GSHEET] Accesso via Sheets API v4 riuscito (${json.values.length} righe)`)
    return json.values
      .map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
  }

  throw new Error(
    'Errore accesso foglio — Errore sconosciuto. ' +
    'Vai su File → Condividi → Pubblica sul Web → scegli CSV → clicca Pubblica. ' +
    'Il foglio non deve essere necessariamente pubblico: la pubblicazione web è separata dalla condivisione.'
  )
}

// ─────────────────────────────────────────────
// GENERATORE ID LEAD-GSHEET
// ─────────────────────────────────────────────

async function nextGSheetLeadId(db: D1Database): Promise<string> {
  const last = await db.prepare(
    `SELECT id FROM leads WHERE id LIKE 'LEAD-GSHEET-%' ORDER BY id DESC LIMIT 1`
  ).first()

  let nextNum = 1
  if (last?.id) {
    const match = (last.id as string).match(/LEAD-GSHEET-(\d+)/)
    if (match) nextNum = parseInt(match[1]) + 1
  }
  return `LEAD-GSHEET-${nextNum.toString().padStart(5, '0')}`
}

// ─────────────────────────────────────────────
// IMPORT PRINCIPALE
// ─────────────────────────────────────────────

export async function executeGSheetImport(
  db: D1Database,
  env: any,
  config: GSheetImportConfig
): Promise<GSheetImportResult> {

  const result: GSheetImportResult = {
    success: false,
    message: '',
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    errorDetails: [],
    rowsRead: 0,
    dryRun: config.dryRun ?? false
  }

  const dryRun = config.dryRun ?? false

  // Inietta API key dall'env se non passata esplicitamente
  if (!config.apiKey && env?.GOOGLE_SHEETS_API_KEY) {
    config.apiKey = env.GOOGLE_SHEETS_API_KEY
  }

  // ── 1. FETCH CSV ──────────────────────────────────────
  let csvText: string
  try {
    csvText = await fetchSheetCsv(config)
  } catch (e: any) {
    result.message = `Errore accesso Google Sheet: ${e.message}`
    result.errorDetails.push(e.message)
    return result
  }

  // ── 2. PARSE ──────────────────────────────────────────
  const rows = parseCsv(csvText)
  if (rows.length < 2) {
    result.success = true
    result.message = 'Foglio vuoto o solo intestazione — nessun lead da importare'
    return result
  }

  // ── 3. MAPPA INTESTAZIONI ─────────────────────────────
  const headerRow = rows[0]
  const colIndex: Record<string, number> = {}
  for (let c = 0; c < headerRow.length; c++) {
    const normalized = normalizeHeader(headerRow[c])
    const key = COL_MAP[normalized]
    if (key) colIndex[key] = c
  }

  console.log(`📋 [GSHEET-IMPORT] Intestazioni rilevate:`, headerRow)
  console.log(`📋 [GSHEET-IMPORT] Mappatura colonne:`, colIndex)

  const dataRows = rows.slice(1) // skip header
  result.rowsRead = dataRows.length

  // ── 4. PROCESSA OGNI RIGA ─────────────────────────────
  const get = (row: string[], key: string): string =>
    colIndex[key] !== undefined ? (row[colIndex[key]] || '').trim() : ''

  // Fill-down per la colonna DATA/timestamp:
  // se una riga ha la data vuota, usa l'ultima data valorizzata
  // (es. 23/5/2026 vale per tutti i record successivi fino al cambio data)
  let lastValidDate: string = ''

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]

    // Skip righe completamente vuote
    if (row.every(c => !c.trim())) continue

    const email = get(row, 'email').toLowerCase().replace(/\s+/g, '')
    const nome  = get(row, 'nome')
    const cognome = get(row, 'cognome')

    // Email o telefono: il foglio eCura può avere lead solo telefonici
    const telefono = get(row, 'telefono')
    if ((!email || !email.includes('@')) && !telefono) {
      result.skipped++
      console.log(`⏭️  [GSHEET-IMPORT] Riga ${i + 2}: email e telefono mancanti — skip`)
      continue
    }
    // Genera email placeholder per lead senza email (necessaria per deduplicazione DB)
    const emailEffettiva = (email && email.includes('@'))
      ? email
      : `noemail-${telefono.replace(/\D/g, '')}-gsheet@placeholder.ecura.it`

    const nomeAss     = get(row, 'nomeAssistito')
    const cognomeAss  = get(row, 'cognomeAssistito')
    const etaRaw      = get(row, 'etaAssistito')
    const etaAssistito = etaRaw ? parseInt(etaRaw) || null : null
    const servizioRaw = get(row, 'servizio')
    const pianoRaw    = get(row, 'piano')
    const canaleRaw   = get(row, 'canale')
    const noteRaw     = get(row, 'note')
    const statusRaw   = get(row, 'status')
    const hubspotId   = get(row, 'hubspotId')
    const tsRaw       = get(row, 'timestamp')
    const privacyRaw  = get(row, 'privacy')
    const marketingRaw= get(row, 'marketing')
    const terzeRaw    = get(row, 'terze')

    const servizio    = servizioRaw ? normalizeServizio(servizioRaw) : 'eCura'
    const piano       = pianoRaw    ? normalizePiano(pianoRaw)       : 'BASE'
    const canale      = canaleRaw   ? normalizeCanale(canaleRaw)     : null
    const status      = statusRaw   ? normalizeStatus(statusRaw)     : 'NEW'
    const gdprConsent = privacyRaw  ? normalizeConsent(privacyRaw)   : true
    const consensoMkt = marketingRaw? normalizeConsent(marketingRaw) : false
    const consensoTerze= terzeRaw   ? normalizeConsent(terzeRaw)     : false

    // Timestamp creazione con fill-down:
    // se la data è valorizzata → aggiorna lastValidDate e usala
    // se è vuota → usa lastValidDate (ultima data valorizzata sopra)
    // se non c'è mai stata una data → usa ora attuale
    let createdAt: string
    if (tsRaw) {
      // Supporta formati italiani: DD/MM/YYYY e DD/MM/YY
      let parsedDate: Date | null = null
      const itMatch = tsRaw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/)
      if (itMatch) {
        const [, d, m, y] = itMatch
        const year = y.length === 2 ? 2000 + parseInt(y) : parseInt(y)
        parsedDate = new Date(year, parseInt(m) - 1, parseInt(d))
      } else {
        parsedDate = new Date(tsRaw)
      }
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        createdAt = parsedDate.toISOString()
        lastValidDate = createdAt  // aggiorna fill-down
      } else {
        createdAt = lastValidDate || new Date().toISOString()
      }
    } else {
      // Data vuota: fill-down dall'ultima data valorizzata
      createdAt = lastValidDate || new Date().toISOString()
    }

    // hs_object_source_detail_1 derivato dal canale
    const hsDetail = canale ? `Form eCura_ ${canale}` : 'Form eCura'

    // Telefono normalizzato (per fallback deduplicazione)
    const telefonoNorm = normalizePhone(telefono)

    try {
      // ── UPSERT 3 livelli ──────────────────────────────
      //
      // Livello 1: email esatta (o hubspotId)
      // Livello 2: telefono normalizzato + cognome (case-insensitive)
      // Livello 3: nome + cognome esatti (case-insensitive)
      // → nessun match: INSERT nuovo lead

      let existing: Record<string, unknown> | null = null
      let matchReason = ''

      // — Livello 1: email / hubspotId —
      if (!existing) {
        const q = hubspotId
          ? `SELECT id, fonte FROM leads WHERE email = ? OR external_source_id = ? LIMIT 1`
          : `SELECT id, fonte FROM leads WHERE email = ? LIMIT 1`
        existing = hubspotId
          ? await db.prepare(q).bind(emailEffettiva, hubspotId).first() as any
          : await db.prepare(q).bind(emailEffettiva).first() as any
        if (existing) matchReason = 'email'
      }

      // — Livello 2: telefono normalizzato + cognome —
      if (!existing && telefonoNorm && cognome) {
        // Cerca normalizzando il telefono nel DB: rimuove spazi/trattini a runtime
        existing = await db.prepare(`
          SELECT id, fonte FROM leads
          WHERE REPLACE(REPLACE(REPLACE(REPLACE(telefono,' ',''),'-',''),'(',''),')','') = ?
            AND LOWER(TRIM(cognomeRichiedente)) = LOWER(TRIM(?))
          LIMIT 1
        `).bind(telefonoNorm, cognome).first() as any
        if (existing) matchReason = 'telefono+cognome'
      }

      // — Livello 3: nome + cognome (entrambi presenti e non generici) —
      if (!existing && nome && cognome && nome !== 'N/A') {
        existing = await db.prepare(`
          SELECT id, fonte FROM leads
          WHERE LOWER(TRIM(nomeRichiedente))  = LOWER(TRIM(?))
            AND LOWER(TRIM(cognomeRichiedente)) = LOWER(TRIM(?))
          LIMIT 1
        `).bind(nome, cognome).first() as any
        if (existing) matchReason = 'nome+cognome'
      }

      if (existing) {
        // Protezione lead di test
        if ((existing as any).fonte === 'Form eCura x Test') {
          result.skipped++
          continue
        }

        if (!dryRun) {
          // Aggiorna solo campi NULL o vuoti (non sovrascrive mai il DB)
          await db.prepare(`
            UPDATE leads SET
              nomeRichiedente  = CASE WHEN nomeRichiedente  IS NULL OR nomeRichiedente  = '' THEN ? ELSE nomeRichiedente  END,
              cognomeRichiedente = CASE WHEN cognomeRichiedente IS NULL OR cognomeRichiedente = '' THEN ? ELSE cognomeRichiedente END,
              telefono         = CASE WHEN telefono IS NULL OR telefono = '' THEN ? ELSE telefono END,
              nomeAssistito    = CASE WHEN nomeAssistito IS NULL OR nomeAssistito = '' THEN ? ELSE nomeAssistito END,
              cognomeAssistito = CASE WHEN cognomeAssistito IS NULL OR cognomeAssistito = '' THEN ? ELSE cognomeAssistito END,
              servizio         = CASE WHEN servizio IS NULL OR servizio = '' THEN ? ELSE servizio END,
              piano            = CASE WHEN piano IS NULL OR piano = '' THEN ? ELSE piano END,
              note             = CASE WHEN note IS NULL OR note = '' THEN ? ELSE note END,
              canale_acquisizione = CASE WHEN canale_acquisizione IS NULL OR canale_acquisizione = '' THEN ? ELSE canale_acquisizione END,
              hs_object_source_detail_1 = CASE
                WHEN hs_object_source_detail_1 IS NULL OR hs_object_source_detail_1 = '' THEN ?
                WHEN hs_object_source_detail_1 = 'Form eCura' AND ? IS NOT NULL AND ? != 'Form eCura' THEN ?
                ELSE hs_object_source_detail_1
              END,
              updated_at = ?
            WHERE id = ?
          `).bind(
            nome, cognome, telefono,
            nomeAss || null, cognomeAss || null,
            servizio, piano,
            noteRaw || null,
            canale,
            hsDetail, hsDetail, hsDetail, hsDetail,
            new Date().toISOString(),
            (existing as any).id
          ).run()
        }

        result.updated++
        console.log(`🔄 [GSHEET-IMPORT] Updated [${matchReason}]: ${(existing as any).id} (${emailEffettiva})`)

        // 🏷️ Cerca codice sconto nelle note
        if (!dryRun && noteRaw) {
          const discountRes = await applyDiscountFromNotes(db, (existing as any).id, noteRaw)
          if (discountRes.applied) {
            console.log(`🏷️  [GSHEET-IMPORT] UPDATE sconto applicato: ${discountRes.message}`)
          }
        }
        continue
      }

      // ── INSERT nuovo lead ─────────────────────────────
      if (dryRun) {
        result.imported++
        console.log(`🔍 [GSHEET-IMPORT DRY-RUN] Riga ${i + 2}: nuovo lead ${emailEffettiva}`)
        continue
      }

      const leadId = await nextGSheetLeadId(db)

      await db.prepare(`
        INSERT INTO leads (
          id, nomeRichiedente, cognomeRichiedente, email, telefono,
          nomeAssistito, cognomeAssistito, etaAssistito,
          servizio, piano, tipoServizio,
          fonte, external_source_id, status, note,
          hs_object_source, hs_object_source_detail_1, dettaglio_fonte,
          canale_acquisizione,
          vuoleContratto, vuoleBrochure, vuoleManuale,
          gdprConsent, consensoMarketing, consensoTerze,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        leadId,
        nome || 'N/A',
        cognome || '',
        emailEffettiva,
        telefono || '',
        nomeAss || null,
        cognomeAss || null,
        etaAssistito,
        servizio,
        piano,
        piano === 'BASE' ? 'BASE' : 'AVANZATO',    // tipoServizio
        'Form eCura',                               // fonte (stessa di HubSpot)
        hubspotId || null,                          // external_source_id
        status,
        noteRaw || null,
        'FORM',                                     // hs_object_source
        hsDetail,                                   // hs_object_source_detail_1
        hsDetail,                                   // dettaglio_fonte
        canale,                                     // canale_acquisizione (META/GOOGLE/…)
        'No',                                       // vuoleContratto
        'No',                                       // vuoleBrochure
        'No',                                       // vuoleManuale
        gdprConsent ? 1 : 0,
        consensoMkt ? 1 : 0,
        consensoTerze ? 1 : 0,
        createdAt,
        new Date().toISOString()
      ).run()

      result.imported++
      console.log(`✅ [GSHEET-IMPORT] INSERT: ${leadId} (${emailEffettiva})`)

      // 🏷️ Cerca codice sconto nelle note
      if (noteRaw) {
        const discountRes = await applyDiscountFromNotes(db, leadId, noteRaw)
        if (discountRes.applied) {
          console.log(`🏷️  [GSHEET-IMPORT] INSERT sconto applicato: ${discountRes.message}`)
        }
      }

    } catch (err: any) {
      result.errors++
      const msg = `Riga ${i + 2} (${emailEffettiva}): ${err.message}`
      result.errorDetails.push(msg)
      console.error(`❌ [GSHEET-IMPORT] ${msg}`)
    }
  }

  // ── 5. RISULTATO ──────────────────────────────────────
  result.success = true
  result.message = dryRun
    ? `Dry run: ${result.imported} nuovi, ${result.updated} aggiornati, ${result.skipped} skippati`
    : `Import completato: ${result.imported} nuovi lead, ${result.updated} aggiornati`

  return result
}
