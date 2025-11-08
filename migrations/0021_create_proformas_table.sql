-- Migration: Create proformas table
-- Description: Gestione proforma per pagamenti contratti

CREATE TABLE IF NOT EXISTS proformas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proforma_code TEXT NOT NULL UNIQUE,
  contract_id INTEGER NOT NULL,
  lead_id TEXT NOT NULL,
  
  -- Importi
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  
  -- Stati possibili: PENDING, PAID_BANK_TRANSFER, PAID_STRIPE, CANCELLED, EXPIRED
  status TEXT NOT NULL DEFAULT 'PENDING',
  
  -- Metodo di pagamento: BANK_TRANSFER, STRIPE, null se non ancora pagato
  payment_method TEXT,
  
  -- Dati pagamento
  payment_date TEXT,
  payment_reference TEXT, -- Riferimento bonifico o transaction ID Stripe
  payment_confirmed_by TEXT, -- Email dell'admin che ha confermato
  payment_confirmed_at TEXT,
  
  -- Dati proforma
  proforma_pdf BLOB, -- PDF della proforma generata
  proforma_sent_at TEXT, -- Quando è stata inviata
  proforma_sent_to TEXT, -- Email destinatario
  
  -- Scadenza
  due_date TEXT,
  
  -- Note admin
  admin_notes TEXT,
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Foreign keys
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_proformas_status ON proformas(status);
CREATE INDEX IF NOT EXISTS idx_proformas_contract_id ON proformas(contract_id);
CREATE INDEX IF NOT EXISTS idx_proformas_lead_id ON proformas(lead_id);
CREATE INDEX IF NOT EXISTS idx_proformas_code ON proformas(proforma_code);

-- Trigger per aggiornare updated_at
CREATE TRIGGER IF NOT EXISTS update_proformas_timestamp
AFTER UPDATE ON proformas
BEGIN
  UPDATE proformas SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Comments per documentazione
-- Stati proforma:
-- PENDING: In attesa di pagamento
-- PAID_BANK_TRANSFER: Pagata con bonifico (confermato manualmente)
-- PAID_STRIPE: Pagata elettronicamente via Stripe
-- CANCELLED: Annullata
-- EXPIRED: Scaduta
