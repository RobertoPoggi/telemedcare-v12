-- Migration: Update contracts table with detailed status
-- Description: Aggiungi stati dettagliati per tracking firma contratti

-- Aggiungi nuove colonne se non esistono
ALTER TABLE contracts ADD COLUMN signature_status TEXT DEFAULT 'PENDING';
ALTER TABLE contracts ADD COLUMN signature_type TEXT; -- MANUAL, DOCUSIGN, null
ALTER TABLE contracts ADD COLUMN signed_at TEXT;
ALTER TABLE contracts ADD COLUMN signed_document BLOB; -- PDF firmato caricato manualmente
ALTER TABLE contracts ADD COLUMN confirmed_by TEXT; -- Admin che ha confermato la firma manuale
ALTER TABLE contracts ADD COLUMN confirmed_at TEXT;

-- Indici
CREATE INDEX IF NOT EXISTS idx_contracts_signature_status ON contracts(signature_status);

-- Comments per documentazione
-- Stati signature_status:
-- PENDING: In attesa di firma
-- SIGNED_MANUAL: Firmato manualmente (olografo)
-- SIGNED_DOCUSIGN: Firmato digitalmente con DocuSign
-- EXPIRED: Scaduto
-- CANCELLED: Annullato

-- Tipi signature_type:
-- MANUAL: Firma olografa/manuale
-- DOCUSIGN: Firma digitale DocuSign
