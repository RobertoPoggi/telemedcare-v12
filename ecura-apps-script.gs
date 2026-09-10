// ============================================================
// Google Apps Script — eCura Lead Sheet
// ============================================================
// doGet  → DUPLICE USO:
//   1. action=read  → lettura lead (pulsante "GSheet eCura" in TeleMedCare)
//   2. action=write → scrittura lead (da Cloudflare Worker eCura Landing)
//      (usiamo GET perché Apps Script converte POST→GET nei redirect)
//
// Colonne foglio (riga 1):
//   Data | Email | Nome | Cognome | Cellulare | Città
//   Servizio | Piano desiderato | Note | Fonte
// ============================================================

const SPREADSHEET_ID = '1AZs2t0PpFxZYpxT6byX6uVpAE8VqZFPRuag-CAenKgo'
const SECRET_KEY      = 'ecura-import-2026'

function doGet(e) {
  try {
    const key = e.parameter.key
    if (key !== SECRET_KEY) {
      return jsonOut({ error: 'Unauthorized' })
    }

    const action = e.parameter.action || 'read'

    // ── SCRITTURA lead da eCura Landing ────────────────────────────────────
    if (action === 'write') {
      const ss    = SpreadsheetApp.openById(SPREADSHEET_ID)
      const sheet = ss.getSheets()[0]

      const p = e.parameter   // tutti i campi arrivano come query params

      // Riga allineata alle colonne del foglio:
      // Data | Email | Nome | Cognome | Cellulare | Città | Servizio | Piano desiderato | Note | Fonte
      const row = [
        p.data_ora  || new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }),
        p.email     || '',
        p.nome      || '',
        p.cognome   || '',
        p.telefono  || '',
        p.citta     || '',
        p.servizio  || '',
        p.piano     || '',
        buildNote(p),
        p.fonte     || '',
      ]

      sheet.appendRow(row)
      return jsonOut({ success: true })
    }

    // ── LETTURA lead (default) — invariata per TeleMedCare ─────────────────
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID)
    const sheet = ss.getSheets()[0]
    const data  = sheet.getDataRange().getValues()
    return jsonOut({ values: data })

  } catch(err) {
    return jsonOut({ error: err.toString() })
  }
}

// doPost rimane presente come fallback (invocato solo da client che
// gestiscono correttamente il redirect, es. fetch() nel browser)
function doPost(e) {
  try {
    let data = {}
    try { data = JSON.parse(e.postData.contents) } catch(x) {}

    const key = data.key || (e.parameter && e.parameter.key) || ''
    if (key !== SECRET_KEY) return jsonOut({ error: 'Unauthorized' })

    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID)
    const sheet = ss.getSheets()[0]

    const row = [
      data.data_ora  || new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }),
      data.email     || '',
      data.nome      || '',
      data.cognome   || '',
      data.telefono  || '',
      data.citta     || '',
      data.servizio  || '',
      data.piano     || '',
      buildNote(data),
      data.fonte     || '',
    ]

    sheet.appendRow(row)
    return jsonOut({ success: true })

  } catch(err) {
    return jsonOut({ success: false, error: err.toString() })
  }
}

// ── buildNote: riassume i parametri di tracking nel campo Note ───────────────
function buildNote(p) {
  const parts = []
  if (p.canale)       parts.push('Canale: '   + p.canale)
  if (p.utm_source)   parts.push('Source: '   + p.utm_source)
  if (p.utm_medium)   parts.push('Medium: '   + p.utm_medium)
  if (p.utm_campaign) parts.push('Campaign: ' + p.utm_campaign)
  if (p.utm_content)  parts.push('Content: '  + p.utm_content)
  if (p.utm_term)     parts.push('Term: '     + p.utm_term)
  if (p.referrer)     parts.push('Ref: '      + p.referrer)
  if (p.page_url)     parts.push('URL: '      + p.page_url)
  if (p.landing)      parts.push('Landing: '  + p.landing)
  if (p.note)         parts.push('Nota: '     + p.note)
  return parts.join(' | ')
}

// ── Helper JSON response ─────────────────────────────────────────────────────
function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}
