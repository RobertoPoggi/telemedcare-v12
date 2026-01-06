-- =============================================
-- Migration 0020: ALIGN LEADS SCHEMA WITH CODE
-- =============================================
-- Allinea lo schema della tabella leads con il codice attuale
-- Data: 2026-01-06
-- =============================================

-- STEP 1: Aggiungi colonne mancanti (se non esistono già)

-- Campi email e telefono con naming corretto
ALTER TABLE leads ADD COLUMN emailRichiedente TEXT;
ALTER TABLE leads ADD COLUMN telefonoRichiedente TEXT;

-- Campi assistito
ALTER TABLE leads ADD COLUMN cfAssistito TEXT;

-- GDPR
ALTER TABLE leads ADD COLUMN gdprConsent INTEGER DEFAULT 0;

-- Intestazione contratto
ALTER TABLE leads ADD COLUMN intestazioneContratto TEXT DEFAULT 'richiedente';

-- Altri campi già esistenti (già aggiunti in migrazioni precedenti):
-- - piano (aggiunto in 0006)
-- - servizio (aggiunto in 0006)
-- - luogoNascitaAssistito
-- - dataNascitaAssistito
-- - indirizzoAssistito
-- - capAssistito
-- - cittaAssistito
-- - provinciaAssistito
-- - codiceFiscaleAssistito
-- - condizioniSalute

-- STEP 2: Migra i dati esistenti
UPDATE leads SET emailRichiedente = email WHERE emailRichiedente IS NULL;
UPDATE leads SET telefonoRichiedente = telefono WHERE telefonoRichiedente IS NULL;
UPDATE leads SET cfAssistito = codiceFiscaleAssistito WHERE cfAssistito IS NULL AND codiceFiscaleAssistito IS NOT NULL;

-- STEP 3: Converti consensoPrivacy BOOLEAN in gdprConsent INTEGER
UPDATE leads SET gdprConsent = 1 WHERE consensoPrivacy = TRUE AND (gdprConsent IS NULL OR gdprConsent = 0);
UPDATE leads SET gdprConsent = 0 WHERE consensoPrivacy = FALSE AND (gdprConsent IS NULL OR gdprConsent = 1);

-- STEP 4: Verifica risultati (query di controllo)
-- Mostra quanti lead hanno i nuovi campi popolati
SELECT 
    COUNT(*) as total_leads,
    COUNT(emailRichiedente) as has_email_richiedente,
    COUNT(telefonoRichiedente) as has_telefono_richiedente,
    COUNT(cfAssistito) as has_cf_assistito,
    COUNT(gdprConsent) as has_gdpr_consent
FROM leads;
