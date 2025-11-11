-- Verifica e crea la tabella proforma con lo schema corretto

-- Drop existing table if needed (in dev only!)
DROP TABLE IF EXISTS proforma;

-- Create proforma table with complete schema
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
  status TEXT NOT NULL DEFAULT 'PENDING',  -- 'DRAFT', 'SENT', 'PAID', 'CANCELLED', 'PENDING'
  email_template_used TEXT,
  inviata_il TEXT,  -- Data invio email
  
  -- Timestamps
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_proforma_contract_id ON proforma(contract_id);
CREATE INDEX IF NOT EXISTS idx_proforma_lead_id ON proforma(lead_id);
CREATE INDEX IF NOT EXISTS idx_proforma_numero ON proforma(numero_proforma);
CREATE INDEX IF NOT EXISTS idx_proforma_status ON proforma(status);
