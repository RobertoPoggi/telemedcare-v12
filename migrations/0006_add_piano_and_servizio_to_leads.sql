-- Migration 0006: Aggiungi campi piano e servizio alla tabella leads
-- Data: 2026-01-01
-- Scopo: Separare concetti di SERVIZIO (eCura PRO/FAMILY/PREMIUM) e PIANO (BASE/AVANZATO)

-- PROBLEMA ATTUALE:
-- - tipoServizio contiene BASE/AVANZATO (questo è il PIANO, non il servizio!)
-- - Non esiste campo per il servizio (eCura PRO/FAMILY/PREMIUM)

-- SOLUZIONE:
-- 1. Aggiungi campo 'piano' (BASE/AVANZATO)
-- 2. Aggiungi campo 'servizio' (PRO/FAMILY/PREMIUM)
-- 3. Migra dati: tipoServizio → piano
-- 4. Imposta servizio = 'PRO' per tutti (default attuale)
-- 5. Mantieni tipoServizio per retrocompatibilità (deprecated)

-- Step 1: Aggiungi colonna 'piano' se non esiste
-- SQLite non supporta ALTER TABLE IF NOT EXISTS, quindi usiamo un approccio diverso
-- Ignora errore se colonna già esiste

-- Verifica se la colonna esiste già
-- Se non esiste, verrà aggiunta; se esiste, verrà ignorato l'errore

-- Aggiungi campo 'piano'
ALTER TABLE leads ADD COLUMN piano TEXT DEFAULT 'BASE';

-- Aggiungi campo 'servizio'
ALTER TABLE leads ADD COLUMN servizio TEXT DEFAULT 'PRO';

-- Step 2: Migra dati esistenti da tipoServizio a piano
UPDATE leads 
SET piano = CASE 
    WHEN UPPER(tipoServizio) = 'AVANZATO' THEN 'AVANZATO'
    WHEN UPPER(tipoServizio) = 'BASE' THEN 'BASE'
    ELSE 'BASE'
END
WHERE piano IS NULL OR piano = 'BASE';

-- Step 3: Imposta servizio = 'PRO' per tutti i lead esistenti (default attuale)
UPDATE leads 
SET servizio = 'PRO'
WHERE servizio IS NULL OR servizio = 'PRO';

-- Step 4: Log risultato
SELECT 
    COUNT(*) as total_leads,
    SUM(CASE WHEN piano = 'BASE' THEN 1 ELSE 0 END) as piano_base,
    SUM(CASE WHEN piano = 'AVANZATO' THEN 1 ELSE 0 END) as piano_avanzato,
    SUM(CASE WHEN servizio = 'PRO' THEN 1 ELSE 0 END) as servizio_pro
FROM leads;

-- NOTA: 
-- - tipoServizio è mantenuto per retrocompatibilità ma è DEPRECATED
-- - Da ora in poi usare 'piano' e 'servizio' separati
-- - piano: BASE | AVANZATO
-- - servizio: PRO | FAMILY | PREMIUM
