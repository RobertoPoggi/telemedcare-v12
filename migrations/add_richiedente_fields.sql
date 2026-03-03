-- Aggiungi campi richiedente mancanti
ALTER TABLE leads ADD COLUMN cfRichiedente TEXT;
ALTER TABLE leads ADD COLUMN indirizzoRichiedente TEXT;
ALTER TABLE leads ADD COLUMN capRichiedente TEXT;
ALTER TABLE leads ADD COLUMN cittaRichiedente TEXT;
ALTER TABLE leads ADD COLUMN provinciaRichiedente TEXT;
