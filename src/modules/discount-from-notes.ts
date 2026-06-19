/**
 * discount-from-notes.ts
 * TeleMedCare V12
 *
 * Helper condiviso: cerca un codice sconto valido all'interno del campo `note`
 * di un lead e — se trovato — applica automaticamente lo sconto.
 *
 * Usato da:
 *  - hubspot-auto-import.ts  (autorefresh dashboard + tasto Irbema)
 *  - gsheet-import.ts        (tasto import GSheet / Excel dashboard operativa)
 *  - /api/leads/import-bulk  (import bulk in index.tsx)
 *
 * Logica:
 *  1. Carica tutti i codici attivi dalla tabella discount_codes
 *  2. Cerca ogni codice nel testo delle note (case-insensitive, word-boundary)
 *  3. Al primo match valido (attivo, non scaduto, utilizzi disponibili):
 *     a. Calcola sconto rispettando il CAP percentuale (default 20%)
 *     b. Aggiorna leads: codice_sconto, sconto_percentuale/fisso, prezzo_scontato, sconto_sorgente='FORM'
 *     c. Inserisce riga in lead_discounts (storico audit)
 *     d. Incrementa discount_codes.utilizzi_count
 *  4. Se il lead non ha prezzo_anno valorizzato, salta silenziosamente
 *     (lo sconto verrà applicato al momento del pagamento se prezzo_anno viene impostato)
 *  5. Se il lead ha già un codice sconto applicato, NON sovrascrive
 */

import type { D1Database } from '@cloudflare/workers-types'

export interface DiscountFromNotesResult {
  applied: boolean
  codice?: string
  message: string
  prezzo_finale?: number
  sconto_effettivo?: number
}

/**
 * Cerca un codice sconto valido nelle note e lo applica al lead.
 *
 * @param db       D1 database binding
 * @param leadId   ID del lead nel DB
 * @param note     Testo grezzo del campo note del lead
 * @returns        Risultato dell'operazione
 */
export async function applyDiscountFromNotes(
  db: D1Database,
  leadId: string,
  note: string | null | undefined
): Promise<DiscountFromNotesResult> {
  try {
    if (!note || note.trim() === '') {
      return { applied: false, message: 'Note vuote — nessun codice da cercare' }
    }

    // 1. Verifica se il lead ha già uno sconto applicato
    const leadRow = await (db as any)
      .prepare('SELECT codice_sconto, prezzo_anno FROM leads WHERE id = ?')
      .bind(leadId)
      .first() as { codice_sconto: string | null; prezzo_anno: number | null } | null

    if (!leadRow) {
      return { applied: false, message: `Lead ${leadId} non trovato` }
    }

    if (leadRow.codice_sconto) {
      return {
        applied: false,
        codice: leadRow.codice_sconto,
        message: `Lead ${leadId} ha già codice sconto "${leadRow.codice_sconto}" — skip`
      }
    }

    // 2. Carica tutti i codici attivi e non scaduti
    const allCodes = await (db as any)
      .prepare(`
        SELECT * FROM discount_codes
        WHERE attivo = 1
          AND (data_scadenza IS NULL OR date(data_scadenza) >= date('now'))
          AND (utilizzi_max IS NULL OR utilizzi_count < utilizzi_max)
        ORDER BY LENGTH(codice) DESC
      `)
      .all() as { results: any[] }

    if (!allCodes?.results?.length) {
      return { applied: false, message: 'Nessun codice sconto attivo nel database' }
    }

    // 3. Cerca il primo codice che appare nelle note (case-insensitive)
    const noteUpper = note.toUpperCase()
    let matchedCode: any = null

    for (const dc of allCodes.results) {
      const codiceUpper = (dc.codice as string).toUpperCase()
      // Cerca come parola intera: prima/dopo il codice ci deve essere un non-alfanumerico
      // oppure il codice è all'inizio/fine della stringa
      const regex = new RegExp(`(?<![A-Z0-9])${codiceUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Z0-9])`)
      if (regex.test(noteUpper)) {
        matchedCode = dc
        break
      }
    }

    if (!matchedCode) {
      return { applied: false, message: 'Nessun codice sconto trovato nelle note' }
    }

    // 4. Calcola e applica lo sconto
    const prezzoOriginale = Number(leadRow.prezzo_anno) || 0

    if (prezzoOriginale <= 0) {
      // Lead senza prezzo: registra solo il codice trovato senza calcolare il prezzo scontato
      // Verrà ricalcolato quando il prezzo viene impostato
      await (db as any)
        .prepare(`
          UPDATE leads SET
            codice_sconto   = ?,
            sconto_sorgente = 'FORM',
            updated_at      = datetime('now')
          WHERE id = ?
        `)
        .bind(matchedCode.codice, leadId)
        .run()

      console.log(`🏷️  [DISCOUNT-FROM-NOTES] Lead ${leadId}: codice "${matchedCode.codice}" trovato nelle note ma prezzo_anno non valorizzato — salvato il codice, sconto verrà calcolato al pagamento`)

      return {
        applied: true,
        codice: matchedCode.codice,
        message: `Codice "${matchedCode.codice}" trovato nelle note — prezzo_anno non disponibile, codice salvato per applicazione futura`
      }
    }

    const capPerc = Number(matchedCode.cap_percentuale) || 20
    let percentualeEffettiva = 0
    let importoFisso = 0

    if (matchedCode.tipo === 'PERCENTUALE') {
      percentualeEffettiva = Math.min(Number(matchedCode.valore), capPerc)
      importoFisso = 0
    } else {
      // FISSO — converti in % per verifica CAP
      const percEquivalente = (Number(matchedCode.valore) / prezzoOriginale) * 100
      if (percEquivalente > capPerc) {
        importoFisso = (prezzoOriginale * capPerc) / 100
        percentualeEffettiva = capPerc
      } else {
        importoFisso = Number(matchedCode.valore)
        percentualeEffettiva = percEquivalente
      }
    }

    const scontoEffettivo = matchedCode.tipo === 'PERCENTUALE'
      ? Math.round((prezzoOriginale * percentualeEffettiva / 100) * 100) / 100
      : Math.round(importoFisso * 100) / 100

    const prezzoFinale = Math.round((prezzoOriginale - scontoEffettivo) * 100) / 100

    // 5. Aggiorna leads
    await (db as any)
      .prepare(`
        UPDATE leads SET
          codice_sconto      = ?,
          sconto_percentuale = ?,
          sconto_fisso       = ?,
          prezzo_scontato    = ?,
          sconto_sorgente    = 'FORM',
          updated_at         = datetime('now')
        WHERE id = ?
      `)
      .bind(
        matchedCode.codice,
        matchedCode.tipo === 'PERCENTUALE' ? percentualeEffettiva : 0,
        matchedCode.tipo === 'FISSO'       ? importoFisso         : 0,
        prezzoFinale,
        leadId
      )
      .run()

    // 6. Inserisce storico
    try {
      await (db as any)
        .prepare(`
          INSERT INTO lead_discounts
            (lead_id, discount_code_id, codice, tipo, valore, sconto_effettivo,
             prezzo_originale, prezzo_finale, sorgente, applicato_da)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'FORM', 'auto-import-notes')
        `)
        .bind(
          leadId,
          matchedCode.id,
          matchedCode.codice,
          matchedCode.tipo,
          matchedCode.valore,
          scontoEffettivo,
          prezzoOriginale,
          prezzoFinale
        )
        .run()
    } catch (histErr) {
      // Non bloccare se lead_discounts non esiste ancora (tabella creata da migrate-schema)
      console.warn(`⚠️  [DISCOUNT-FROM-NOTES] lead_discounts insert skip:`, histErr)
    }

    // 7. Incrementa utilizzi_count
    await (db as any)
      .prepare(`
        UPDATE discount_codes
        SET utilizzi_count = utilizzi_count + 1, updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(matchedCode.id)
      .run()

    const msg = `🏷️  Codice "${matchedCode.codice}" trovato nelle note → sconto -${scontoEffettivo}€ applicato (prezzo finale: €${prezzoFinale})`
    console.log(`[DISCOUNT-FROM-NOTES] Lead ${leadId}: ${msg}`)

    return {
      applied: true,
      codice: matchedCode.codice,
      prezzo_finale: prezzoFinale,
      sconto_effettivo: scontoEffettivo,
      message: msg
    }
  } catch (err: any) {
    console.error(`❌ [DISCOUNT-FROM-NOTES] Lead ${leadId}:`, err)
    return { applied: false, message: `Errore: ${err?.message || 'sconosciuto'}` }
  }
}
