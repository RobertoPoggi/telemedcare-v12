-- Migration 0028: Create assistiti table
-- Purpose: Store converted leads as active assistiti (patients) with full service data
-- Created: 2025-11-11

CREATE TABLE IF NOT EXISTS assistiti (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL UNIQUE,
  configuration_id TEXT,
  
  -- Dati Personali Assistito
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  codice_fiscale TEXT,
  data_nascita TEXT,
  eta INTEGER,
  sesso TEXT,
  
  -- Contatti Assistito
  telefono TEXT,
  email TEXT,
  indirizzo_completo TEXT,
  via TEXT,
  civico TEXT,
  cap TEXT,
  citta TEXT,
  provincia TEXT,
  
  -- Dati Fisici
  peso REAL,
  altezza REAL,
  gruppo_sanguigno TEXT,
  
  -- Piano Servizio
  piano_servizio TEXT NOT NULL,  -- BASE, AVANZATO
  data_attivazione TEXT NOT NULL,
  data_scadenza TEXT,
  stato_servizio TEXT DEFAULT 'ATTIVO',  -- ATTIVO, SOSPESO, CESSATO
  
  -- Dispositivo Assegnato
  dispositivo_id TEXT,
  dispositivo_imei TEXT,
  dispositivo_seriale TEXT,
  data_assegnazione_dispositivo TEXT,
  
  -- Contatti Emergenza (da configuration)
  contatto1_nome TEXT,
  contatto1_cognome TEXT,
  contatto1_telefono TEXT,
  contatto1_email TEXT,
  contatto1_relazione TEXT,
  
  contatto2_nome TEXT,
  contatto2_cognome TEXT,
  contatto2_telefono TEXT,
  contatto2_email TEXT,
  contatto2_relazione TEXT,
  
  contatto3_nome TEXT,
  contatto3_cognome TEXT,
  contatto3_telefono TEXT,
  contatto3_email TEXT,
  contatto3_relazione TEXT,
  
  -- Informazioni Mediche
  patologie TEXT,
  farmaci_nome TEXT,
  farmaci_dosaggio TEXT,
  farmaci_orario TEXT,
  allergie TEXT,
  note_mediche TEXT,
  
  -- Dati Richiedente (se diverso dall'assistito)
  richiedente_nome TEXT,
  richiedente_cognome TEXT,
  richiedente_email TEXT,
  richiedente_telefono TEXT,
  richiedente_relazione TEXT,
  
  -- Dati Amministrativi
  contratto_id TEXT,
  proforma_id TEXT,
  importo_pagato REAL,
  metodo_pagamento TEXT,
  data_pagamento TEXT,
  
  -- Note e Tracking
  note_generali TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT,
  
  -- Foreign Keys
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (configuration_id) REFERENCES configurations(id),
  FOREIGN KEY (dispositivo_id) REFERENCES devices(id),
  FOREIGN KEY (contratto_id) REFERENCES contracts(id),
  FOREIGN KEY (proforma_id) REFERENCES proforma(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assistiti_lead_id ON assistiti(lead_id);
CREATE INDEX IF NOT EXISTS idx_assistiti_dispositivo_id ON assistiti(dispositivo_id);
CREATE INDEX IF NOT EXISTS idx_assistiti_stato_servizio ON assistiti(stato_servizio);
CREATE INDEX IF NOT EXISTS idx_assistiti_data_attivazione ON assistiti(data_attivazione);
CREATE INDEX IF NOT EXISTS idx_assistiti_cognome ON assistiti(cognome);
CREATE INDEX IF NOT EXISTS idx_assistiti_codice_fiscale ON assistiti(codice_fiscale);
