-- =============================================
-- Migration 0001: CREATE CONTRACTS TABLE
-- =============================================
-- Crea la tabella contracts per gestire i contratti
-- Data: 2026-02-01
-- =============================================

CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    leadId TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    -- Dati contratto
    codice_contratto TEXT,
    tipo_contratto TEXT,
    template_utilizzato TEXT,
    
    -- Contenuto
    contenuto_html TEXT,
    pdf_url TEXT,
    pdf_generated INTEGER DEFAULT 0,
    
    -- Pricing
    prezzo_mensile REAL,
    durata_mesi INTEGER DEFAULT 12,
    prezzo_totale REAL,
    
    -- Date
    data_invio TEXT,
    data_scadenza TEXT,
    data_firma TEXT,
    
    -- Email tracking
    email_sent INTEGER DEFAULT 0,
    email_template_used TEXT,
    
    -- Servizio e piano
    piano TEXT,
    servizio TEXT,
    
    -- Firma
    firma_digitale TEXT,
    ip_address TEXT,
    user_agent TEXT,
    
    -- Relazioni
    assistito_id INTEGER,
    
    FOREIGN KEY (leadId) REFERENCES leads(id)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_contracts_leadId ON contracts(leadId);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_codice ON contracts(codice_contratto);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON contracts(created_at);
