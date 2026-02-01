-- =============================================
-- Migration: ADD INTESTATARIO FIELDS
-- =============================================
-- Aggiunge campi mancanti per l'intestatario del contratto
-- Data: 2026-02-01
-- =============================================

-- Campi intestatario contratto
ALTER TABLE leads ADD COLUMN cfIntestatario TEXT;
ALTER TABLE leads ADD COLUMN codiceFiscaleIntestatario TEXT;
ALTER TABLE leads ADD COLUMN indirizzoIntestatario TEXT;
ALTER TABLE leads ADD COLUMN capIntestatario TEXT;
ALTER TABLE leads ADD COLUMN cittaIntestatario TEXT;
ALTER TABLE leads ADD COLUMN provinciaIntestatario TEXT;
ALTER TABLE leads ADD COLUMN luogoNascitaIntestatario TEXT;
ALTER TABLE leads ADD COLUMN dataNascitaIntestatario TEXT;

-- Campo età calcolata
ALTER TABLE leads ADD COLUMN etaCalcolata INTEGER;

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_leads_cf_intestatario ON leads(cfIntestatario);
CREATE INDEX IF NOT EXISTS idx_leads_citta_intestatario ON leads(cittaIntestatario);

-- Migra dati esistenti quando intestazioneContratto = 'assistito'
-- In questo caso l'intestatario coincide con l'assistito
UPDATE leads 
SET 
  cfIntestatario = cfAssistito,
  codiceFiscaleIntestatario = codiceFiscaleAssistito,
  indirizzoIntestatario = indirizzoAssistito,
  capIntestatario = capAssistito,
  cittaIntestatario = cittaAssistito,
  provinciaIntestatario = provinciaAssistito,
  luogoNascitaIntestatario = luogoNascitaAssistito,
  dataNascitaIntestatario = dataNascitaAssistito
WHERE intestazioneContratto = 'assistito' 
  AND cfIntestatario IS NULL;

-- Quando intestazioneContratto = 'richiedente' (default)
-- L'intestatario coincide con il richiedente
UPDATE leads 
SET 
  cfIntestatario = COALESCE(cfRichiedente, codiceFiscaleRichiedente),
  luogoNascitaIntestatario = luogoNascitaRichiedente,
  dataNascitaIntestatario = dataNascitaRichiedente,
  indirizzoIntestatario = indirizzoRichiedente,
  capIntestatario = capRichiedente,
  cittaIntestatario = cittaRichiedente,
  provinciaIntestatario = provinciaRichiedente
WHERE (intestazioneContratto = 'richiedente' OR intestazioneContratto IS NULL)
  AND cfIntestatario IS NULL;
