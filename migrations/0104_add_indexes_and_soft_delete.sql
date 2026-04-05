-- Migration 0104: Indici aggiuntivi e soft-delete (deleted_at) per GDPR
-- Data: 2026-04-05

-- ============================================================
-- INDICI SU created_at (query di ordinamento temporale)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_leads_created_at      ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at  ON contracts(created_at);
CREATE INDEX IF NOT EXISTS idx_proforma_created_at   ON proforma(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_created_at   ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

-- ============================================================
-- INDICE COMPOSTO stato+created_at (filtri dashboard comuni)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_leads_status_created  ON leads(status, created_at);

-- ============================================================
-- SOFT DELETE: colonna deleted_at sulle tabelle principali
-- Record con deleted_at NOT NULL sono considerati cancellati
-- ============================================================
ALTER TABLE leads      ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE contracts  ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE proforma   ADD COLUMN deleted_at DATETIME DEFAULT NULL;

-- Indici per filtrare rapidamente i record non cancellati
CREATE INDEX IF NOT EXISTS idx_leads_deleted_at     ON leads(deleted_at)     WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_deleted_at ON contracts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_proforma_deleted_at  ON proforma(deleted_at)  WHERE deleted_at IS NULL;
