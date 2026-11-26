-- =====================================================================
-- FASE 2 — Claim DM (D.Lgs. 137/2022, art. 26) lato CRM
-- Stato globale del meccanismo + scostamenti per blocco + log sincronizzazioni
-- Idempotente: si puo' applicare piu' volte senza effetti collaterali.
-- =====================================================================

CREATE TABLE IF NOT EXISTS claim_dm_stato (
  chiave      TEXT PRIMARY KEY,          -- 'stato_globale' oppure 'EC-01' ... 'EC-12'
  valore      TEXT,                      -- ORIGINALE | TRANSITORIA | AUTORIZZATA (NULL = eredita lo stato globale)
  motivo      TEXT,
  updated_at  TEXT NOT NULL,
  updated_by  TEXT
);

CREATE INDEX IF NOT EXISTS idx_claim_dm_stato_valore ON claim_dm_stato(valore);

CREATE TABLE IF NOT EXISTS claim_dm_sync_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  chiamata    TEXT NOT NULL,             -- 'save' | 'purge' | 'riconcilia'
  esito       TEXT NOT NULL,             -- 'ok' | 'errore'
  http_status INTEGER,
  durata_ms   INTEGER,
  dettaglio   TEXT,
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_claim_dm_sync_log_created ON claim_dm_sync_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claim_dm_sync_log_esito ON claim_dm_sync_log(chiamata, esito, id DESC);

-- Valore iniziale: ORIGINALE (comportamento attuale della landing: template statici)
INSERT OR IGNORE INTO claim_dm_stato (chiave, valore, motivo, updated_at, updated_by)
VALUES ('stato_globale', 'ORIGINALE', 'Impostazione iniziale Fase 2', datetime('now'), 'system');
