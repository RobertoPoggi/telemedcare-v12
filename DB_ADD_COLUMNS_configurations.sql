-- =====================================================
-- MIGRATION: Aggiungi colonne mancanti a configurations
-- Data: 2026-03-06
-- =====================================================
-- SAFE: Aggiunge solo colonne nuove, non tocca quelle esistenti
-- =====================================================

-- STEP 1: Aggiungi dati assistito (se mancano)
ALTER TABLE configurations ADD COLUMN nome_assistito TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN cognome_assistito TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN data_nascita TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN eta TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN peso REAL DEFAULT NULL;
ALTER TABLE configurations ADD COLUMN altezza REAL DEFAULT NULL;
ALTER TABLE configurations ADD COLUMN telefono TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN email TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN indirizzo TEXT DEFAULT '';

-- STEP 2: Aggiungi contatti emergenza formato nuovo
ALTER TABLE configurations ADD COLUMN contatto1_nome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN contatto1_cognome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN contatto1_telefono TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN contatto1_email TEXT DEFAULT '';

ALTER TABLE configurations ADD COLUMN contatto2_nome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN contatto2_cognome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN contatto2_telefono TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN contatto2_email TEXT DEFAULT '';

ALTER TABLE configurations ADD COLUMN contatto3_nome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN contatto3_cognome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN contatto3_telefono TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN contatto3_email TEXT DEFAULT '';

-- STEP 3: Aggiungi whitelist chiamate autorizzate
ALTER TABLE configurations ADD COLUMN whitelist1_nome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist1_cognome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist1_telefono TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist1_email TEXT DEFAULT '';

ALTER TABLE configurations ADD COLUMN whitelist2_nome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist2_cognome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist2_telefono TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist2_email TEXT DEFAULT '';

ALTER TABLE configurations ADD COLUMN whitelist3_nome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist3_cognome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist3_telefono TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist3_email TEXT DEFAULT '';

-- STEP 4: Aggiungi note e farmaci (formato nuovo)
ALTER TABLE configurations ADD COLUMN patologie TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN note_mediche TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN farmaci_data TEXT DEFAULT '';

-- =====================================================
-- NOTE:
-- - Le colonne esistenti NON vengono toccate
-- - Se una colonna esiste già, SQLite darà errore "duplicate column name"
--   ma continuerà con le altre (safe)
-- - Le colonne vecchie (contatto_emergenza_1_*, allergie, farmaci_assunti)
--   rimangono per retrocompatibilità
-- =====================================================

-- VERIFICA dopo migration:
-- SELECT sql FROM sqlite_master WHERE type='table' AND name='configurations';
