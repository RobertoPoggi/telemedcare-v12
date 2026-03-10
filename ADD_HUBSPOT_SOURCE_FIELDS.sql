-- ================================================================
-- Migration: Aggiunta campi HubSpot source alla tabella leads
-- Data: 2026-03-08
-- Autore: GenSpark AI Developer
-- ================================================================
-- 
-- SCOPO: Aggiungere i campi hs_object_source, hs_object_source_detail_1
--        e dettaglio_fonte per tracciare meglio la provenienza dei lead
--        da HubSpot CRM.
--
-- CAMPI:
-- - hs_object_source: fonte principale dal CRM (es. 'FORM', 'IMPORT', 'INTEGRATION')
-- - hs_object_source_detail_1: dettaglio fonte (es. 'Form eCura')
-- - dettaglio_fonte: campo calcolato/normalizzato basato su hs_object_source
--
-- ================================================================

-- Step 1: Aggiungi colonna hs_object_source
ALTER TABLE leads ADD COLUMN hs_object_source TEXT;

-- Step 2: Aggiungi colonna hs_object_source_detail_1
ALTER TABLE leads ADD COLUMN hs_object_source_detail_1 TEXT;

-- Step 3: Aggiungi colonna dettaglio_fonte (calcolato)
ALTER TABLE leads ADD COLUMN dettaglio_fonte TEXT;

-- Step 4: Popola dettaglio_fonte per i lead esistenti con fonte 'Form eCura' dal 29/01/2026
--         Include anche varianti: "Form eCura x Test", "Form eCura x test"
--         NOTA: Lead prima del 30/01/2026 non hanno fonte='Form eCura' (altri metodi filtro)
UPDATE leads 
SET dettaglio_fonte = 'FORM'
WHERE (fonte = 'Form eCura' OR fonte LIKE 'Form eCura x %')
  AND (created_at >= '2026-01-29' OR timestamp >= '2026-01-29 00:00:00')
  AND dettaglio_fonte IS NULL;

-- Step 5: Verifica risultati
SELECT 
  COUNT(*) as total_leads,
  COUNT(hs_object_source) as con_hs_object_source,
  COUNT(hs_object_source_detail_1) as con_hs_object_source_detail_1,
  COUNT(dettaglio_fonte) as con_dettaglio_fonte
FROM leads;

-- Step 6: Mostra distribuzione per dettaglio_fonte
SELECT 
  dettaglio_fonte,
  COUNT(*) as count
FROM leads
WHERE fonte = 'Form eCura'
GROUP BY dettaglio_fonte
ORDER BY count DESC;

PRAGMA table_info(leads);
