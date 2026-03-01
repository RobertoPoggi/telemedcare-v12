-- Migration: Fix proforma table - Ensure id is AUTOINCREMENT
-- Problema: id è NULL dopo INSERT, manca AUTOINCREMENT
-- Soluzione: Ricrea tabella con id INTEGER PRIMARY KEY AUTOINCREMENT

-- Step 1: Backup dati esistenti (solo record validi con id NOT NULL)
CREATE TABLE IF NOT EXISTS proforma_backup AS 
SELECT * FROM proforma WHERE id IS NOT NULL;

-- Step 2: Drop tabella vecchia
DROP TABLE IF EXISTS proforma;

-- Step 3: Ricrea tabella con schema corretto
CREATE TABLE proforma (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id TEXT,
  leadId TEXT,
  numero_proforma TEXT UNIQUE,
  data_emissione TEXT,
  data_scadenza TEXT,
  cliente_nome TEXT,
  cliente_cognome TEXT,
  cliente_email TEXT,
  cliente_telefono TEXT,
  cliente_indirizzo TEXT,
  cliente_citta TEXT,
  cliente_cap TEXT,
  cliente_provincia TEXT,
  cliente_codice_fiscale TEXT,
  tipo_servizio TEXT,
  prezzo_mensile REAL,
  durata_mesi INTEGER,
  prezzo_totale REAL,
  status TEXT DEFAULT 'DRAFT',
  email_sent INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

-- Step 4: Ripristina dati validi (se esistevano)
INSERT INTO proforma 
SELECT * FROM proforma_backup;

-- Step 5: Drop backup
DROP TABLE IF EXISTS proforma_backup;

-- Step 6: Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_proforma_contract ON proforma(contract_id);
CREATE INDEX IF NOT EXISTS idx_proforma_lead ON proforma(leadId);
CREATE INDEX IF NOT EXISTS idx_proforma_numero ON proforma(numero_proforma);
CREATE INDEX IF NOT EXISTS idx_proforma_status ON proforma(status);
