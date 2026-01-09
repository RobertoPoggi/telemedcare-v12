-- ============================================================================
-- CLEANUP PRODUCTION: Elimina dati di test
-- Data: 2026-01-09
-- Descrizione: Rimuove lead e contratti di test (176*) da PRODUCTION
-- ⚠️ Eseguire SOLO su database PRODUCTION!
-- ⚠️ NON eseguire su Preview (i dati rimangono lì per test)
-- ============================================================================

-- BACKUP AUTOMATICO PRIMA DELL'ELIMINAZIONE
-- Esporta i dati che verranno eliminati (per sicurezza)
-- SELECT * FROM leads WHERE id LIKE 'LEAD-MANUAL-176%';
-- SELECT * FROM contracts WHERE id LIKE 'CONTRACT-176%';
-- SELECT * FROM lead_completion_tokens WHERE lead_id LIKE 'LEAD-MANUAL-176%';
-- SELECT * FROM lead_completion_log WHERE lead_id LIKE 'LEAD-MANUAL-176%';

-- ============================================================================
-- ELIMINAZIONE DATI TEST
-- ============================================================================

-- 1. Elimina log completamento correlati
DELETE FROM lead_completion_log 
WHERE lead_id LIKE 'LEAD-MANUAL-176%';

-- 2. Elimina token completamento correlati
DELETE FROM lead_completion_tokens 
WHERE lead_id LIKE 'LEAD-MANUAL-176%';

-- 3. Elimina contratti correlati (se esistono)
DELETE FROM contracts 
WHERE id LIKE 'CONTRACT-176%';

-- 4. Elimina lead di test
DELETE FROM leads 
WHERE id LIKE 'LEAD-MANUAL-176%';

-- ============================================================================
-- VERIFICA POST-ELIMINAZIONE
-- ============================================================================

-- Conta lead rimanenti
SELECT COUNT(*) as total_leads FROM leads;

-- Verifica che non ci siano più lead 176*
SELECT COUNT(*) as deleted_leads_check FROM leads WHERE id LIKE 'LEAD-MANUAL-176%';
-- Dovrebbe restituire 0

-- Verifica lead per fonte (per sicurezza)
SELECT fonte, COUNT(*) as count 
FROM leads 
GROUP BY fonte 
ORDER BY count DESC;
