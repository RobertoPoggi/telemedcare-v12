-- =============================================
-- Migration 0030: ADD SIGNATURE FIELDS TO CONTRACTS
-- =============================================
-- Aggiunge campi per firma digitale contratti
-- Data: 2026-02-03
-- =============================================

-- Campi firma digitale
ALTER TABLE contracts ADD COLUMN signature_data TEXT;
ALTER TABLE contracts ADD COLUMN signature_ip TEXT;
ALTER TABLE contracts ADD COLUMN signature_timestamp TEXT;
ALTER TABLE contracts ADD COLUMN signature_user_agent TEXT;
ALTER TABLE contracts ADD COLUMN signature_screen_resolution TEXT;
ALTER TABLE contracts ADD COLUMN signed_at TEXT;

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_contracts_signed_at ON contracts(signed_at);
CREATE INDEX IF NOT EXISTS idx_contracts_signature_timestamp ON contracts(signature_timestamp);
