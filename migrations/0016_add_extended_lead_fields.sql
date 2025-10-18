-- Migration 0016: Add extended lead fields
-- Aggiunge campi per raccogliere informazioni complete su richiedente e assistito

-- Campi richiedente
ALTER TABLE leads ADD COLUMN cfRichiedente TEXT;
ALTER TABLE leads ADD COLUMN indirizzoRichiedente TEXT;

-- Campi assistito
ALTER TABLE leads ADD COLUMN cfAssistito TEXT;
ALTER TABLE leads ADD COLUMN indirizzoAssistito TEXT;
ALTER TABLE leads ADD COLUMN dataNascitaAssistito TEXT;
ALTER TABLE leads ADD COLUMN luogoNascitaAssistito TEXT;

-- Condizioni mediche
ALTER TABLE leads ADD COLUMN condizioniSalute TEXT;
ALTER TABLE leads ADD COLUMN patologie TEXT;
ALTER TABLE leads ADD COLUMN allergie TEXT;
ALTER TABLE leads ADD COLUMN farmaci TEXT;

-- Preferenze contatto
ALTER TABLE leads ADD COLUMN preferenzaContatto TEXT; -- 'email', 'telefono', 'whatsapp'
ALTER TABLE leads ADD COLUMN orarioPreferito TEXT;

-- Note operative
ALTER TABLE leads ADD COLUMN noteOperative TEXT; -- Note interne staff

-- Indice per ricerche
CREATE INDEX IF NOT EXISTS idx_leads_cf_richiedente ON leads(cfRichiedente);
CREATE INDEX IF NOT EXISTS idx_leads_cf_assistito ON leads(cfAssistito);
