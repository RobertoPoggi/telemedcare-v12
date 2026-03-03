-- Aggiungi campi mancanti intestatario
ALTER TABLE leads ADD COLUMN nomeIntestatario TEXT;
ALTER TABLE leads ADD COLUMN cognomeIntestatario TEXT;
ALTER TABLE leads ADD COLUMN emailIntestatario TEXT;
ALTER TABLE leads ADD COLUMN telefonoIntestatario TEXT;
