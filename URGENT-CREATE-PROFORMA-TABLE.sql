-- ================================================================
-- SCRIPT MIGRAZIONE URGENTE - CREAZIONE TABELLA PROFORMA
-- Da eseguire su CloudFlare D1 Dashboard
-- ================================================================

-- STEP 1: Verifica se la tabella esiste già
SELECT name, sql FROM sqlite_master 
WHERE type='table' AND name='proforma';

-- STEP 2: Crea la tabella proforma (se non esiste)
CREATE TABLE IF NOT EXISTS proforma (
    id TEXT PRIMARY KEY,
    leadId TEXT NOT NULL,
    numero_proforma TEXT NOT NULL UNIQUE,
    data_emissione TEXT NOT NULL,
    data_scadenza TEXT NOT NULL,
    importo_base REAL NOT NULL,
    importo_iva REAL NOT NULL,
    importo_totale REAL NOT NULL,
    valuta TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'GENERATED',
    servizio TEXT,
    piano TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    -- Constraint
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE
);

-- STEP 3: Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_proforma_leadId 
ON proforma(leadId);

CREATE INDEX IF NOT EXISTS idx_proforma_status 
ON proforma(status);

CREATE INDEX IF NOT EXISTS idx_proforma_numero 
ON proforma(numero_proforma);

CREATE INDEX IF NOT EXISTS idx_proforma_created 
ON proforma(created_at DESC);

-- STEP 4: Verifica struttura creata
PRAGMA table_info(proforma);

-- STEP 5: Conta record (dovrebbe essere 0 se nuova)
SELECT COUNT(*) as total_proforma FROM proforma;

-- STEP 6: Test insert (commentato - decommenta per testare)
-- INSERT INTO proforma (
--     id, leadId, numero_proforma, 
--     data_emissione, data_scadenza,
--     importo_base, importo_iva, importo_totale,
--     valuta, status, servizio, piano,
--     created_at, updated_at
-- ) VALUES (
--     'PRF-TEST-001',
--     'LEAD-IRBEMA-00001',
--     'PRF202602-TEST',
--     '2026-02-23',
--     '2026-03-25',
--     480.00,
--     105.60,
--     585.60,
--     'EUR',
--     'GENERATED',
--     'eCura PRO',
--     'BASE',
--     datetime('now'),
--     datetime('now')
-- );

-- STEP 7: Verifica insert test (se eseguito)
-- SELECT * FROM proforma WHERE id = 'PRF-TEST-001';

-- STEP 8: Elimina test (se eseguito)
-- DELETE FROM proforma WHERE id = 'PRF-TEST-001';

-- ================================================================
-- ISTRUZIONI PER ESECUZIONE SU CLOUDFLARE D1
-- ================================================================
--
-- 1. Vai su: https://dash.cloudflare.com
-- 2. Seleziona: Workers & Pages > D1
-- 3. Clicca sul database: telemedcare-v12 (o il nome corretto)
-- 4. Vai su: Console
-- 5. Copia e incolla questo script (dalla riga 9 alla riga 60)
-- 6. Clicca: Execute
-- 7. Verifica output: dovrebbe mostrare la struttura della tabella
-- 8. Ritorna alla dashboard e riprova i bottoni
--
-- ================================================================

-- ALTERNATIVE: Se preferisci usare Wrangler CLI
--
-- wrangler d1 execute telemedcare-v12 --file=migrate-proforma-table.sql
--
-- ================================================================
