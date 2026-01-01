-- =============================================
-- Migration 0005: FIX SCHEMA CONTRACTS
-- =============================================
-- Aggiunge campi mancanti alla tabella contracts
-- Data: 2026-01-01
-- =============================================

-- Aggiungi colonne mancanti alla tabella contracts
-- SQLite richiede ALTER TABLE ADD COLUMN separati

-- Campi identificativi
ALTER TABLE contracts ADD COLUMN codice_contratto TEXT;
ALTER TABLE contracts ADD COLUMN tipo_contratto TEXT; -- BASE, AVANZATO
ALTER TABLE contracts ADD COLUMN template_utilizzato TEXT;

-- Contenuto e PDF
ALTER TABLE contracts ADD COLUMN contenuto_html TEXT;
ALTER TABLE contracts ADD COLUMN pdf_url TEXT;
ALTER TABLE contracts ADD COLUMN pdf_generated INTEGER DEFAULT 0;

-- Pricing
ALTER TABLE contracts ADD COLUMN prezzo_mensile REAL;
ALTER TABLE contracts ADD COLUMN durata_mesi INTEGER DEFAULT 12;
ALTER TABLE contracts ADD COLUMN prezzo_totale REAL;

-- Date e scadenze
ALTER TABLE contracts ADD COLUMN data_invio TEXT;
ALTER TABLE contracts ADD COLUMN data_scadenza TEXT;
ALTER TABLE contracts ADD COLUMN data_firma TEXT;

-- Email tracking
ALTER TABLE contracts ADD COLUMN email_sent INTEGER DEFAULT 0;
ALTER TABLE contracts ADD COLUMN email_template_used TEXT;

-- CAMPI CRITICI MANCANTI
ALTER TABLE contracts ADD COLUMN piano TEXT; -- BASE, AVANZATO
ALTER TABLE contracts ADD COLUMN servizio TEXT; -- eCura FAMILY, eCura PRO, eCura PREMIUM

-- Relazione con assistito
ALTER TABLE contracts ADD COLUMN assistito_id INTEGER;

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_contracts_codice ON contracts(codice_contratto);
CREATE INDEX IF NOT EXISTS idx_contracts_piano ON contracts(piano);
CREATE INDEX IF NOT EXISTS idx_contracts_servizio ON contracts(servizio);
CREATE INDEX IF NOT EXISTS idx_contracts_tipo ON contracts(tipo_contratto);
CREATE INDEX IF NOT EXISTS idx_contracts_data_invio ON contracts(data_invio);
CREATE INDEX IF NOT EXISTS idx_contracts_assistito_id ON contracts(assistito_id);

-- Aggiorna i contratti esistenti se hanno il campo contract_type
UPDATE contracts 
SET tipo_contratto = contract_type 
WHERE contract_type IS NOT NULL AND tipo_contratto IS NULL;
