-- Migration 0103: Add detailed configuration columns
-- Data: 2026-03-06
-- Aggiunge colonne dettagliate per nome assistito, contatti, whitelist, patologie, farmaci

-- Aggiungi colonne dati assistito
ALTER TABLE configurations ADD COLUMN nome_assistito TEXT;
ALTER TABLE configurations ADD COLUMN cognome_assistito TEXT;
ALTER TABLE configurations ADD COLUMN data_nascita TEXT;
ALTER TABLE configurations ADD COLUMN eta TEXT;
ALTER TABLE configurations ADD COLUMN peso REAL;
ALTER TABLE configurations ADD COLUMN altezza REAL;
ALTER TABLE configurations ADD COLUMN telefono TEXT;
ALTER TABLE configurations ADD COLUMN email TEXT;
ALTER TABLE configurations ADD COLUMN indirizzo TEXT;

-- Aggiungi contatti emergenza (nuova struttura)
ALTER TABLE configurations ADD COLUMN contatto1_nome TEXT;
ALTER TABLE configurations ADD COLUMN contatto1_cognome TEXT;
ALTER TABLE configurations ADD COLUMN contatto1_telefono TEXT;
ALTER TABLE configurations ADD COLUMN contatto1_email TEXT;

ALTER TABLE configurations ADD COLUMN contatto2_nome TEXT;
ALTER TABLE configurations ADD COLUMN contatto2_cognome TEXT;
ALTER TABLE configurations ADD COLUMN contatto2_telefono TEXT;
ALTER TABLE configurations ADD COLUMN contatto2_email TEXT;

ALTER TABLE configurations ADD COLUMN contatto3_nome TEXT;
ALTER TABLE configurations ADD COLUMN contatto3_cognome TEXT;
ALTER TABLE configurations ADD COLUMN contatto3_telefono TEXT;
ALTER TABLE configurations ADD COLUMN contatto3_email TEXT;

-- Aggiungi whitelist chiamate
ALTER TABLE configurations ADD COLUMN whitelist1_nome TEXT;
ALTER TABLE configurations ADD COLUMN whitelist1_cognome TEXT;
ALTER TABLE configurations ADD COLUMN whitelist1_telefono TEXT;
ALTER TABLE configurations ADD COLUMN whitelist1_email TEXT;

ALTER TABLE configurations ADD COLUMN whitelist2_nome TEXT;
ALTER TABLE configurations ADD COLUMN whitelist2_cognome TEXT;
ALTER TABLE configurations ADD COLUMN whitelist2_telefono TEXT;
ALTER TABLE configurations ADD COLUMN whitelist2_email TEXT;

ALTER TABLE configurations ADD COLUMN whitelist3_nome TEXT;
ALTER TABLE configurations ADD COLUMN whitelist3_cognome TEXT;
ALTER TABLE configurations ADD COLUMN whitelist3_telefono TEXT;
ALTER TABLE configurations ADD COLUMN whitelist3_email TEXT;

-- Aggiungi colonne per patologie e farmaci
ALTER TABLE configurations ADD COLUMN patologie TEXT;
ALTER TABLE configurations ADD COLUMN note_mediche TEXT;
ALTER TABLE configurations ADD COLUMN farmaci_data TEXT; -- JSON string con array farmaci
ALTER TABLE configurations ADD COLUMN note_aggiuntive TEXT;
