-- Migration: Add proformas table
-- eCura V11.0 - Proforma/Invoice Management
-- Created: 2025-12-21

CREATE TABLE IF NOT EXISTS proformas (
  id TEXT PRIMARY KEY,
  numero_proforma TEXT UNIQUE NOT NULL,
  contract_code TEXT NOT NULL,
  lead_id TEXT,
  
  -- Servizio
  servizio TEXT NOT NULL, -- FAMILY, PRO, PREMIUM
  piano TEXT NOT NULL, -- BASE, AVANZATO
  
  -- Prezzi
  importo_base REAL NOT NULL,
  iva REAL NOT NULL,
  totale REAL NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, expired, cancelled
  
  -- Files & Links
  pdf_url TEXT,
  stripe_payment_link TEXT,
  stripe_payment_intent_id TEXT,
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT,
  expires_at TEXT
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_proformas_contract ON proformas(contract_code);
CREATE INDEX IF NOT EXISTS idx_proformas_status ON proformas(status);
CREATE INDEX IF NOT EXISTS idx_proformas_created ON proformas(created_at);
