-- Migration 0008: Aggiunge campi mancanti per dati completi richiedente e assistito
-- Data: 2025-11-07
-- Risolve: Dati incompleti nelle email, mancanza campi per Stripe/DocuSign

-- DATI RICHIEDENTE MANCANTI
ALTER TABLE leads ADD COLUMN capRichiedente TEXT;
ALTER TABLE leads ADD COLUMN cittaRichiedente TEXT;
ALTER TABLE leads ADD COLUMN provinciaRichiedente TEXT;
ALTER TABLE leads ADD COLUMN dataNascitaRichiedente TEXT;
ALTER TABLE leads ADD COLUMN luogoNascitaRichiedente TEXT;

-- DATI ASSISTITO MANCANTI  
ALTER TABLE leads ADD COLUMN emailAssistito TEXT;
ALTER TABLE leads ADD COLUMN telefonoAssistito TEXT;
ALTER TABLE leads ADD COLUMN capAssistito TEXT;
ALTER TABLE leads ADD COLUMN cittaAssistito TEXT;
ALTER TABLE leads ADD COLUMN provinciaAssistito TEXT;
ALTER TABLE leads ADD COLUMN luogoNascitaAssistito TEXT;

-- CONDIZIONI E URGENZA MANCANTI
ALTER TABLE leads ADD COLUMN urgenzaRisposta TEXT;
ALTER TABLE leads ADD COLUMN giorniRisposta TEXT;
