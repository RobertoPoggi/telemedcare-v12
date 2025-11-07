-- TeleMedCare V11.0 - Migration 0007
-- Fix proforma table schema to match INSERT queries
-- Date: 2025-11-07
-- Purpose: Align proforma table with complete workflow orchestrator requirements

-- Drop old proforma table (backup data if needed in production)
DROP TABLE IF EXISTS proforma;

-- Create new proforma table with complete schema
CREATE TABLE IF NOT EXISTS proforma (
  -- Primary identification
  id TEXT PRIMARY KEY NOT NULL,
  contract_id TEXT NOT NULL,
  lead_id TEXT NOT NULL,
  numero_proforma TEXT NOT NULL UNIQUE,
  
  -- Dates
  data_emissione TEXT NOT NULL,
  data_scadenza TEXT NOT NULL,
  
  -- Client information
  cliente_nome TEXT NOT NULL,
  cliente_cognome TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  
  -- Service details
  tipo_servizio TEXT NOT NULL,  -- 'BASE' or 'ADVANCED'
  prezzo_mensile REAL NOT NULL,
  durata_mesi INTEGER NOT NULL DEFAULT 12,
  prezzo_totale REAL NOT NULL,
  
  -- File storage
  file_path TEXT,
  content TEXT,  -- Base64 PDF content
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'SENT',  -- 'DRAFT', 'SENT', 'PAID', 'CANCELLED'
  email_template_used TEXT,
  
  -- Timestamps
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  
  -- Foreign keys
  FOREIGN KEY (contract_id) REFERENCES contracts(id),
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_proforma_contract_id ON proforma(contract_id);
CREATE INDEX IF NOT EXISTS idx_proforma_lead_id ON proforma(lead_id);
CREATE INDEX IF NOT EXISTS idx_proforma_numero ON proforma(numero_proforma);
CREATE INDEX IF NOT EXISTS idx_proforma_status ON proforma(status);
CREATE INDEX IF NOT EXISTS idx_proforma_data_emissione ON proforma(data_emissione);
CREATE INDEX IF NOT EXISTS idx_proforma_data_scadenza ON proforma(data_scadenza);

-- Note: This migration drops and recreates the table
-- In production, you should:
-- 1. Backup existing data: CREATE TABLE proforma_backup AS SELECT * FROM proforma;
-- 2. Migrate data to new schema
-- 3. Verify data integrity
-- 4. Drop backup table
