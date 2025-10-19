-- =====================================================
-- PULIZIA COMPLETA DATABASE TELEMEDCARE
-- Rimuove tutti i dati mock e simulati
-- Mantiene solo lo schema delle tabelle
-- =====================================================

-- Disabilita foreign keys temporaneamente per eliminazione
PRAGMA foreign_keys = OFF;

-- Pulizia tabelle in ordine inverso delle dipendenze
DELETE FROM email_logs WHERE 1=1;
DELETE FROM configurations WHERE 1=1;
DELETE FROM devices WHERE 1=1;
DELETE FROM payments WHERE 1=1;
DELETE FROM proforma WHERE 1=1;
DELETE FROM signatures WHERE 1=1;
DELETE FROM contracts WHERE 1=1;
DELETE FROM leads WHERE 1=1;

-- Reset degli autoincrement
DELETE FROM sqlite_sequence WHERE name IN ('signatures', 'devices', 'configurations', 'email_logs');

-- Riabilita foreign keys
PRAGMA foreign_keys = ON;
