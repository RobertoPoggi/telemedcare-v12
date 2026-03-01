-- Migration: add_ddts_table.sql
-- Tabella per gestire i Documenti di Trasporto (DDT)
-- Traccia le spedizioni dei dispositivi ai clienti

CREATE TABLE IF NOT EXISTS ddts (
    id TEXT PRIMARY KEY,
    numero_ddt TEXT UNIQUE NOT NULL,
    contract_code TEXT,
    proforma_number TEXT,
    
    -- Dispositivo spedito
    dispositivo TEXT NOT NULL,
    serial_number TEXT,
    quantita INTEGER DEFAULT 1,
    
    -- Destinatario
    destinatario_nome TEXT NOT NULL,
    destinatario_indirizzo TEXT NOT NULL,
    destinatario_cap TEXT,
    destinatario_citta TEXT,
    destinatario_provincia TEXT,
    destinatario_telefono TEXT,
    destinatario_email TEXT,
    
    -- Trasporto
    corriere TEXT,
    tracking_number TEXT,
    peso_kg DECIMAL(5,2),
    numero_colli INTEGER DEFAULT 1,
    
    -- Status tracking
    status TEXT DEFAULT 'preparazione',
    -- Status: preparazione, spedito, in_transito, consegnato, anomalia
    
    data_spedizione DATETIME,
    data_consegna DATETIME,
    
    -- PDF
    pdf_url TEXT,
    pdf_generated BOOLEAN DEFAULT FALSE,
    
    -- Note
    note TEXT,
    
    -- Timestamp
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes per ricerche veloci
    FOREIGN KEY (contract_code) REFERENCES contracts(codice_contratto),
    FOREIGN KEY (proforma_number) REFERENCES proforma(numero_proforma)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_ddts_numero ON ddts(numero_ddt);
CREATE INDEX IF NOT EXISTS idx_ddts_contract ON ddts(contract_code);
CREATE INDEX IF NOT EXISTS idx_ddts_proforma ON ddts(proforma_number);
CREATE INDEX IF NOT EXISTS idx_ddts_status ON ddts(status);
CREATE INDEX IF NOT EXISTS idx_ddts_tracking ON ddts(tracking_number);
