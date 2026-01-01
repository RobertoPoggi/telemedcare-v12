-- Migration 0006: Aggiungi campi piano e servizio alla tabella leads
-- Data: 2026-01-01
-- Scopo: Separare concetti di SERVIZIO (eCura PRO/FAMILY/PREMIUM) e PIANO (BASE/AVANZATO)

-- PROBLEMA ATTUALE:
-- - tipoServizio contiene IL SERVIZIO (es. "eCura PRO"), NON il piano!
-- - Il piano (BASE/AVANZATO) è nelle note come "Piano: AVANZATO"

-- SOLUZIONE:
-- 1. Aggiungi campo 'piano' (BASE/AVANZATO) - estratto dalle note
-- 2. Aggiungi campo 'servizio' (eCura PRO/eCura FAMILY/eCura PREMIUM) - copiato da tipoServizio
-- 3. Mantieni tipoServizio per retrocompatibilità (deprecated)

-- Step 1: Aggiungi colonna 'piano' se non esiste
ALTER TABLE leads ADD COLUMN piano TEXT DEFAULT 'BASE';

-- Step 2: Aggiungi colonna 'servizio' se non esiste
ALTER TABLE leads ADD COLUMN servizio TEXT DEFAULT 'eCura PRO';

-- Step 3: Migra dati esistenti
-- SERVIZIO: Copia da tipoServizio (che contiene "eCura PRO", non BASE/AVANZATO!)
-- PIANO: Estrai dalle note
UPDATE leads 
SET servizio = COALESCE(tipoServizio, 'eCura PRO'),
    piano = CASE 
        WHEN note LIKE '%Piano: AVANZATO%' OR note LIKE '%AVANZATO%' THEN 'AVANZATO'
        ELSE 'BASE'
    END
WHERE 1=1;

-- Step 4: Log risultato
SELECT 
    COUNT(*) as total_leads,
    SUM(CASE WHEN piano = 'BASE' THEN 1 ELSE 0 END) as piano_base,
    SUM(CASE WHEN piano = 'AVANZATO' THEN 1 ELSE 0 END) as piano_avanzato,
    SUM(CASE WHEN servizio = 'eCura PRO' THEN 1 ELSE 0 END) as servizio_pro,
    SUM(CASE WHEN servizio = 'eCura Family' THEN 1 ELSE 0 END) as servizio_family,
    SUM(CASE WHEN servizio = 'eCura PREMIUM' THEN 1 ELSE 0 END) as servizio_premium
FROM leads;

-- NOTA: 
-- - tipoServizio è mantenuto per retrocompatibilità ma è DEPRECATED
-- - Da ora in poi usare 'piano' e 'servizio' separati
-- - piano: BASE | AVANZATO
-- - servizio: eCura PRO | eCura Family | eCura PREMIUM
