-- TeleMedCare V11.0 - Migration 0003
-- Fix schema database: aggiungi colonne mancanti
-- Data: 2025-11-07

-- 1. Aggiungere colonne mancanti a contracts
ALTER TABLE contracts ADD COLUMN codice_contratto TEXT;
ALTER TABLE contracts ADD COLUMN piano_servizio TEXT;
ALTER TABLE contracts ADD COLUMN prezzo REAL;
ALTER TABLE contracts ADD COLUMN intestatario TEXT;
ALTER TABLE contracts ADD COLUMN cf_intestatario TEXT;
ALTER TABLE contracts ADD COLUMN indirizzo_intestatario TEXT;

-- 2. Aggiungere colonna usage_count a document_templates  
ALTER TABLE document_templates ADD COLUMN usage_count INTEGER DEFAULT 0;
ALTER TABLE document_templates ADD COLUMN last_used TEXT;

-- 3. Creare indici per le nuove colonne
CREATE INDEX IF NOT EXISTS idx_contracts_codice ON contracts(codice_contratto);
CREATE INDEX IF NOT EXISTS idx_templates_usage ON document_templates(usage_count);
