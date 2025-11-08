CREATE TABLE IF NOT EXISTS docusign_envelopes (
  envelope_id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  contract_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent', -- sent, delivered, completed, declined, voided
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  signing_url TEXT,
  signed_document_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Foreign keys
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (contract_id) REFERENCES contracts(id)
);
CREATE INDEX IF NOT EXISTS idx_docusign_lead_id ON docusign_envelopes(lead_id);
CREATE INDEX IF NOT EXISTS idx_docusign_contract_id ON docusign_envelopes(contract_id);
CREATE INDEX IF NOT EXISTS idx_docusign_status ON docusign_envelopes(status);
CREATE INDEX IF NOT EXISTS idx_docusign_created_at ON docusign_envelopes(created_at);
ALTER TABLE contracts ADD COLUMN docusign_envelope_id TEXT;
CREATE INDEX IF NOT EXISTS idx_contracts_docusign_envelope ON contracts(docusign_envelope_id);
CREATE TABLE IF NOT EXISTS docusign_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  access_token TEXT NOT NULL,
  token_type TEXT NOT NULL DEFAULT 'Bearer',
  expires_at TEXT NOT NULL,  -- ISO timestamp quando scade
  scope TEXT,
  refresh_token TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_docusign_tokens_expires_at ON docusign_tokens(expires_at);
CREATE TRIGGER IF NOT EXISTS cleanup_old_docusign_tokens
AFTER INSERT ON docusign_tokens
BEGIN
  DELETE FROM docusign_tokens
  WHERE id NOT IN (
    SELECT id FROM docusign_tokens
    ORDER BY created_at DESC
    LIMIT 1
  );
END;
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
CREATE INDEX IF NOT EXISTS idx_proformas_status ON proformas(status);
CREATE INDEX IF NOT EXISTS idx_proformas_contract_id ON proformas(contract_id);
CREATE INDEX IF NOT EXISTS idx_proformas_lead_id ON proformas(lead_id);
CREATE INDEX IF NOT EXISTS idx_proformas_code ON proformas(proforma_code);
CREATE TRIGGER IF NOT EXISTS update_proformas_timestamp
AFTER UPDATE ON proformas
BEGIN
  UPDATE proformas SET updated_at = datetime('now') WHERE id = NEW.id;
END;
CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_code TEXT NOT NULL UNIQUE, -- Codice univoco dispositivo (es: SIDLY-001)
  serial_number TEXT UNIQUE, -- Numero seriale del dispositivo
  
  -- Tipo dispositivo
  device_type TEXT NOT NULL DEFAULT 'SIDLY', -- SIDLY, ALTRO
  model TEXT, -- Modello specifico
  
  -- Stati possibili: AVAILABLE, TO_CONFIGURE, ASSOCIATED, MAINTENANCE, RETURNED, DAMAGED, DECOMMISSIONED
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  
  -- Associazione
  lead_id TEXT, -- ID del lead/assistito associato
  associated_at TEXT, -- Data associazione
  associated_by TEXT, -- Admin che ha associato
  
  -- Configurazione
  configuration_data TEXT, -- JSON con dati configurazione
  configured_at TEXT,
  configured_by TEXT,
  
  -- Storico
  last_maintenance_date TEXT,
  return_date TEXT,
  return_reason TEXT,
  
  -- Dati dispositivo
  firmware_version TEXT,
  hardware_version TEXT,
  purchase_date TEXT,
  warranty_expiry TEXT,
  
  -- Note admin
  admin_notes TEXT,
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_code ON devices(device_code);
CREATE INDEX IF NOT EXISTS idx_devices_serial ON devices(serial_number);
CREATE INDEX IF NOT EXISTS idx_devices_lead_id ON devices(lead_id);
CREATE TRIGGER IF NOT EXISTS update_devices_timestamp
AFTER UPDATE ON devices
BEGIN
  UPDATE devices SET updated_at = datetime('now') WHERE id = NEW.id;
END;
CREATE TABLE IF NOT EXISTS device_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- CREATED, CONFIGURED, ASSOCIATED, MAINTENANCE, RETURNED, etc.
  previous_status TEXT,
  new_status TEXT,
  lead_id TEXT, -- Lead associato all'azione
  performed_by TEXT, -- Admin che ha eseguito l'azione
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_device_history_device_id ON device_history(device_id);
CREATE INDEX IF NOT EXISTS idx_device_history_lead_id ON device_history(lead_id);
ALTER TABLE contracts ADD COLUMN signature_status TEXT DEFAULT 'PENDING';
ALTER TABLE contracts ADD COLUMN signature_type TEXT; -- MANUAL, DOCUSIGN, null
ALTER TABLE contracts ADD COLUMN signed_at TEXT;
ALTER TABLE contracts ADD COLUMN signed_document BLOB; -- PDF firmato caricato manualmente
ALTER TABLE contracts ADD COLUMN confirmed_by TEXT; -- Admin che ha confermato la firma manuale
ALTER TABLE contracts ADD COLUMN confirmed_at TEXT;
CREATE INDEX IF NOT EXISTS idx_contracts_signature_status ON contracts(signature_status);
