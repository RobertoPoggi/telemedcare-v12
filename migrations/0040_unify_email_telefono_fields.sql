-- =============================================
-- Migration 0040: UNIFY EMAIL/TELEFONO FIELDS
-- =============================================
-- Risolve l'inconsistenza tra schema.sql (email/telefono) e migrations (emailRichiedente/telefonoRichiedente)
-- Data: 2026-02-11
-- =============================================

-- PROBLEMA:
-- - schema.sql usa: email, telefono
-- - migrations incrementali usano: emailRichiedente, telefonoRichiedente
-- - Il codice INSERT usa ENTRAMBI i set di campi in posti diversi
-- - Questo causa NOT NULL constraint failed quando un INSERT popola solo uno dei due set

-- SOLUZIONE:
-- 1. Garantire che ENTRAMBI i set di campi esistano
-- 2. Creare trigger per sincronizzarli automaticamente
-- 3. Aggiungere DEFAULT per evitare NOT NULL failures

-- =============================================
-- STEP 1: Aggiungi i campi se non esistono
-- =============================================

-- Campo email (se non esiste) con DEFAULT per evitare NOT NULL failures su INSERT vecchi
ALTER TABLE leads ADD COLUMN email TEXT;

-- Campo telefono (se non esiste)
ALTER TABLE leads ADD COLUMN telefono TEXT;

-- Campo emailRichiedente (se non esiste)
ALTER TABLE leads ADD COLUMN emailRichiedente TEXT;

-- Campo telefonoRichiedente (se non esiste)
ALTER TABLE leads ADD COLUMN telefonoRichiedente TEXT;

-- =============================================
-- STEP 2: Migra dati esistenti (sincronizza campi)
-- =============================================

-- Se email è popolato ma emailRichiedente no, copia
UPDATE leads SET emailRichiedente = email WHERE emailRichiedente IS NULL AND email IS NOT NULL;

-- Se emailRichiedente è popolato ma email no, copia
UPDATE leads SET email = emailRichiedente WHERE email IS NULL AND emailRichiedente IS NOT NULL;

-- Se telefono è popolato ma telefonoRichiedente no, copia
UPDATE leads SET telefonoRichiedente = telefono WHERE telefonoRichiedente IS NULL AND telefono IS NOT NULL;

-- Se telefonoRichiedente è popolato ma telefono no, copia
UPDATE leads SET telefono = telefonoRichiedente WHERE telefono IS NULL AND telefonoRichiedente IS NOT NULL;

-- =============================================
-- STEP 3: Crea trigger per sincronizzazione automatica
-- =============================================

-- Trigger: quando si inserisce/aggiorna email, sincronizza emailRichiedente
CREATE TRIGGER IF NOT EXISTS sync_email_to_emailRichiedente
AFTER INSERT ON leads
FOR EACH ROW
WHEN NEW.email IS NOT NULL AND NEW.emailRichiedente IS NULL
BEGIN
  UPDATE leads SET emailRichiedente = NEW.email WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS sync_email_on_update
AFTER UPDATE OF email ON leads
FOR EACH ROW
WHEN NEW.email IS NOT NULL AND NEW.email != OLD.email
BEGIN
  UPDATE leads SET emailRichiedente = NEW.email WHERE id = NEW.id;
END;

-- Trigger: quando si inserisce/aggiorna emailRichiedente, sincronizza email
CREATE TRIGGER IF NOT EXISTS sync_emailRichiedente_to_email
AFTER INSERT ON leads
FOR EACH ROW
WHEN NEW.emailRichiedente IS NOT NULL AND NEW.email IS NULL
BEGIN
  UPDATE leads SET email = NEW.emailRichiedente WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS sync_emailRichiedente_on_update
AFTER UPDATE OF emailRichiedente ON leads
FOR EACH ROW
WHEN NEW.emailRichiedente IS NOT NULL AND NEW.emailRichiedente != OLD.emailRichiedente
BEGIN
  UPDATE leads SET email = NEW.emailRichiedente WHERE id = NEW.id;
END;

-- Trigger: quando si inserisce/aggiorna telefono, sincronizza telefonoRichiedente
CREATE TRIGGER IF NOT EXISTS sync_telefono_to_telefonoRichiedente
AFTER INSERT ON leads
FOR EACH ROW
WHEN NEW.telefono IS NOT NULL AND NEW.telefonoRichiedente IS NULL
BEGIN
  UPDATE leads SET telefonoRichiedente = NEW.telefono WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS sync_telefono_on_update
AFTER UPDATE OF telefono ON leads
FOR EACH ROW
WHEN NEW.telefono IS NOT NULL AND NEW.telefono != OLD.telefono
BEGIN
  UPDATE leads SET telefonoRichiedente = NEW.telefono WHERE id = NEW.id;
END;

-- Trigger: quando si inserisce/aggiorna telefonoRichiedente, sincronizza telefono
CREATE TRIGGER IF NOT EXISTS sync_telefonoRichiedente_to_telefono
AFTER INSERT ON leads
FOR EACH ROW
WHEN NEW.telefonoRichiedente IS NOT NULL AND NEW.telefono IS NULL
BEGIN
  UPDATE leads SET telefono = NEW.telefonoRichiedente WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS sync_telefonoRichiedente_on_update
AFTER UPDATE OF telefonoRichiedente ON leads
FOR EACH ROW
WHEN NEW.telefonoRichiedente IS NOT NULL AND NEW.telefonoRichiedente != OLD.telefonoRichiedente
BEGIN
  UPDATE leads SET telefono = NEW.telefonoRichiedente WHERE id = NEW.id;
END;

-- =============================================
-- STEP 4: Verifica risultati
-- =============================================
SELECT 
    COUNT(*) as total_leads,
    COUNT(email) as has_email,
    COUNT(emailRichiedente) as has_emailRichiedente,
    COUNT(telefono) as has_telefono,
    COUNT(telefonoRichiedente) as has_telefonoRichiedente,
    SUM(CASE WHEN email != emailRichiedente THEN 1 ELSE 0 END) as email_mismatch,
    SUM(CASE WHEN telefono != telefonoRichiedente THEN 1 ELSE 0 END) as telefono_mismatch
FROM leads;

-- =============================================
-- NOTE:
-- =============================================
-- Dopo questa migration, il codice può usare INDIFFERENTEMENTE:
-- - email o emailRichiedente (vengono sincronizzati automaticamente)
-- - telefono o telefonoRichiedente (vengono sincronizzati automaticamente)
--
-- Raccomandazione: standardizzare il codice per usare UN SOLO set di campi
-- (preferibilmente emailRichiedente/telefonoRichiedente per consistenza con il naming)
