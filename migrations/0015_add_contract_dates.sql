-- =============================================
-- Migration 0003: ADD CONTRACT DATE FIELDS
-- =============================================
-- Aggiunge campi data_firma e data_scadenza
-- per gestione corretta rinnovi contratti
-- Data: 2026-02-15
-- =============================================

-- Aggiungi colonna data_firma (data firma contratto)
ALTER TABLE contracts ADD COLUMN data_firma TEXT;

-- Aggiungi colonna data_scadenza (data scadenza contratto per rinnovi)
ALTER TABLE contracts ADD COLUMN data_scadenza TEXT;

-- Crea indice per query su scadenze imminenti
CREATE INDEX IF NOT EXISTS idx_contracts_data_scadenza ON contracts(data_scadenza);

-- Crea indice per query su data firma
CREATE INDEX IF NOT EXISTS idx_contracts_data_firma ON contracts(data_firma);

-- Aggiorna contratti esistenti con date calcolate da created_at e durata_mesi
UPDATE contracts 
SET data_firma = date(created_at),
    data_scadenza = date(created_at, '+' || COALESCE(durata_mesi, 12) || ' months', '-1 day')
WHERE data_firma IS NULL 
  AND created_at IS NOT NULL;

-- Verifica risultati
SELECT 
  'Contratti con date aggiornate' as info,
  COUNT(*) as count
FROM contracts 
WHERE data_firma IS NOT NULL;

SELECT 
  'Contratti in scadenza prossimi 90 giorni' as info,
  COUNT(*) as count
FROM contracts 
WHERE data_scadenza BETWEEN date('now') AND date('now', '+90 days');
