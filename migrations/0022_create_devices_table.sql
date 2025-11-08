-- Migration: Create devices table
-- Description: Gestione dispositivi SIDLY per assistiti

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

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_code ON devices(device_code);
CREATE INDEX IF NOT EXISTS idx_devices_serial ON devices(serial_number);
CREATE INDEX IF NOT EXISTS idx_devices_lead_id ON devices(lead_id);

-- Trigger per aggiornare updated_at
CREATE TRIGGER IF NOT EXISTS update_devices_timestamp
AFTER UPDATE ON devices
BEGIN
  UPDATE devices SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Tabella storico dispositivi per tracking completo
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

-- Comments per documentazione
-- Stati dispositivi:
-- AVAILABLE: Disponibile a stock
-- TO_CONFIGURE: Da configurare
-- ASSOCIATED: Associato ad assistito
-- MAINTENANCE: In manutenzione
-- RETURNED: Reso dall'assistito
-- DAMAGED: Danneggiato
-- DECOMMISSIONED: Dismesso
