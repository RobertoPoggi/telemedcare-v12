-- ================================
-- SCRIPT MIGRAZIONE DATABASE D1
-- Creazione tabella proforma
-- ================================

-- Verifica se la tabella esiste
SELECT name FROM sqlite_master WHERE type='table' AND name='proforma';

-- Se non esiste, creala
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
    updated_at TEXT NOT NULL
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_proforma_leadId ON proforma(leadId);
CREATE INDEX IF NOT EXISTS idx_proforma_status ON proforma(status);
CREATE INDEX IF NOT EXISTS idx_proforma_numero ON proforma(numero_proforma);

-- Verifica struttura
PRAGMA table_info(proforma);

-- Test query
SELECT COUNT(*) as total_proforma FROM proforma;
