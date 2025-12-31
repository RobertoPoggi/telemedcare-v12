-- =============================================
-- SCRIPT FIX DATABASE CONTRATTI
-- TeleMedCare V12.0
-- =============================================
-- Corregge errori nei contratti esistenti
-- Data: 2025-12-31
-- =============================================

-- 1. ELIMINA CONTRATTI ERRATI/DUPLICATI
-- =============================================

-- Elimina contratto Elena Saglia (errato, deve essere Eileen King)
DELETE FROM contracts WHERE codice_contratto = 'CTR-SAGLIA-2025';
DELETE FROM signatures WHERE contract_id IN (SELECT id FROM contracts WHERE codice_contratto = 'CTR-SAGLIA-2025');

-- Elimina eventuale duplicato Caterina D'Alterio (tenere solo il più recente)
DELETE FROM contracts WHERE codice_contratto = 'CTR-DALTERIO-OLD-2025';
DELETE FROM signatures WHERE contract_id IN (SELECT id FROM contracts WHERE codice_contratto = 'CTR-DALTERIO-OLD-2025');

-- 2. AGGIORNA CONTRATTO KING AD AVANZATO
-- =============================================

UPDATE contracts 
SET 
  tipo_contratto = 'AVANZATO',
  piano = 'AVANZATO',
  prezzo_totale = 840.00,
  prezzo_mensile = 70.00,
  servizio = 'eCura PRO',
  updated_at = datetime('now')
WHERE codice_contratto = 'CTR-KING-2025';

-- 3. VERIFICA CONTRATTO PIZZUTTO ESISTE
-- =============================================
-- Se non esiste, verrà creato dallo script Node.js

-- 4. AGGIUNGI CONTRATTO MARIA CAPONE (se mancante)
-- =============================================
-- Verrà creato dallo script Node.js con email Giorgio Riela

-- =============================================
-- FINE SCRIPT
-- =============================================

-- Query di verifica:
SELECT 
  codice_contratto,
  tipo_contratto,
  piano,
  status,
  prezzo_totale,
  data_firma
FROM contracts
WHERE status = 'SIGNED'
ORDER BY data_firma DESC;
