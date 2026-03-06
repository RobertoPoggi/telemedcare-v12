-- =====================================================
-- MIGRATION: Configurazioni - Email + Whitelist
-- Data: 2026-03-06
-- =====================================================
-- Aggiunge campi email ai contatti emergenza e whitelist
-- =====================================================

-- STEP 1: Verifica schema attuale
-- Esegui per vedere le colonne esistenti:
-- SELECT sql FROM sqlite_master WHERE type='table' AND name='configurations';

-- STEP 2: Aggiungi colonne email contatti emergenza (se non esistono)
-- SQLite non supporta ADD COLUMN IF NOT EXISTS, quindi verifica prima!

ALTER TABLE configurations ADD COLUMN contatto1_email TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN contatto2_email TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN contatto3_email TEXT DEFAULT '';

-- STEP 3: Aggiungi colonne whitelist (se non esistono)

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

-- STEP 4: Verifica nuove colonne
-- SELECT * FROM configurations LIMIT 1;

-- =====================================================
-- NOTE:
-- - Se le colonne esistono già, gli ALTER TABLE daranno errore
-- - In produzione, usa Cloudflare D1 Dashboard per eseguire questo SQL
-- - Oppure usa wrangler d1 execute <DB_NAME> --file=DB_MIGRATION_configurations.sql
-- =====================================================
