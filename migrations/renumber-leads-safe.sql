-- ============================================================================
-- MIGRATION: Rinumerazione Lead IRBEMA senza buchi (Safe Version)
-- Data: 2026-02-12
-- Descrizione: Rinumera i lead IRBEMA da 150 in poi eliminando i buchi
--              Aggiorna automaticamente tutte le foreign key
-- ============================================================================

-- STEP 1: Crea tabella temporanea per il mapping
CREATE TABLE IF NOT EXISTS temp_lead_mapping (
  old_id TEXT PRIMARY KEY,
  new_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- STEP 2: Popola mapping con i nuovi ID sequenziali
-- Query da eseguire via API (vedi script renumber-leads.js)

-- STEP 3: Aggiorna leads.id
-- Usa la tabella temp_lead_mapping per aggiornare

-- STEP 4: Aggiorna foreign keys in tutte le tabelle collegate
-- contracts.leadId
-- proforma.leadId  
-- dispositivi.leadId
-- email_logs.leadId
-- automations.leadId

-- STEP 5: Verifica integrità
-- SELECT COUNT(*) FROM contracts WHERE leadId NOT IN (SELECT id FROM leads);
-- SELECT COUNT(*) FROM proforma WHERE leadId NOT IN (SELECT id FROM leads);

-- STEP 6: Cleanup
-- DROP TABLE temp_lead_mapping;

-- ============================================================================
-- NOTA: Questa è una migration template.
-- Per eseguirla, usa lo script JavaScript renumber-leads.js che:
-- 1. Crea il mapping in memoria
-- 2. Esegue gli UPDATE in modo transazionale
-- 3. Verifica l'integrità dei dati
-- ============================================================================
