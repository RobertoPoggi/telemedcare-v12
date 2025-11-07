-- Migration 0019: Tabella DocuSign Envelopes
-- Traccia tutti gli envelope DocuSign inviati per firma

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

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_docusign_lead_id ON docusign_envelopes(lead_id);
CREATE INDEX IF NOT EXISTS idx_docusign_contract_id ON docusign_envelopes(contract_id);
CREATE INDEX IF NOT EXISTS idx_docusign_status ON docusign_envelopes(status);
CREATE INDEX IF NOT EXISTS idx_docusign_created_at ON docusign_envelopes(created_at);

-- Aggiungi colonna docusign_envelope_id alla tabella contracts (se non esiste)
-- Questo permette di collegare direttamente il contratto all'envelope
ALTER TABLE contracts ADD COLUMN docusign_envelope_id TEXT;

-- Indice per lookup veloce
CREATE INDEX IF NOT EXISTS idx_contracts_docusign_envelope ON contracts(docusign_envelope_id);
