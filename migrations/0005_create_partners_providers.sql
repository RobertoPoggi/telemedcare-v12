-- Migration 0005: Tabelle Partner, Provider Welfare, Convenzioni Aziendali
-- Database completo per gestione commissioni, sconti, fatturazione

-- ============================================
-- TABELLA PARTNER (IRBEMA, BLK, ecc.)
-- ============================================
CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'PARTNER', 'WELFARE', 'CONVENZIONE'
  codice TEXT UNIQUE NOT NULL, -- Es: 'IRBEMA', 'BLK_CONDOMINI', 'EUDAIMON'
  
  -- Dati aziendali
  ragione_sociale TEXT NOT NULL,
  partita_iva TEXT,
  codice_fiscale TEXT,
  
  -- Indirizzo
  indirizzo TEXT,
  cap TEXT,
  citta TEXT,
  provincia TEXT,
  
  -- Contatti
  email TEXT,
  telefono TEXT,
  pec TEXT,
  
  -- Condizioni commerciali
  percentuale_commissione REAL DEFAULT 0, -- Es: 0.05 per 5%
  percentuale_sconto REAL DEFAULT 0,      -- Es: 0.10 per 10%
  
  -- Logica fatturazione
  fattura_a TEXT DEFAULT 'CLIENTE', -- 'CLIENTE', 'PROVIDER', 'RICHIEDENTE', 'ASSISTITO'
  codice_sdi TEXT, -- Per fatturazione elettronica
  
  -- Pagamenti
  iban TEXT,
  banca TEXT,
  intestatario_conto TEXT,
  
  -- Note e metadata
  note TEXT,
  active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDICI PER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_partners_codice ON partners(codice);
CREATE INDEX IF NOT EXISTS idx_partners_tipo ON partners(tipo);
CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(active);

-- ============================================
-- POPOLA CON DATI INIZIALI
-- ============================================

-- IRBEMA (Partner - 0% commissione, fattura a richiedente)
INSERT OR REPLACE INTO partners (id, nome, tipo, codice, ragione_sociale, percentuale_commissione, fattura_a, email, active) VALUES
('PARTNER_IRBEMA', 'IRBEMA', 'PARTNER', 'IRBEMA', 'IRBEMA S.r.l.', 0.00, 'RICHIEDENTE', 'info@irbema.it', 1);

-- BLK Condomini (Partner - 5% commissione, fattura a richiedente)
INSERT OR REPLACE INTO partners (id, nome, tipo, codice, ragione_sociale, percentuale_commissione, fattura_a, email, active) VALUES
('PARTNER_BLK', 'BLK Condomini', 'PARTNER', 'BLK_CONDOMINI', 'BLK Condomini S.r.l.', 0.05, 'RICHIEDENTE', 'info@blkcondomini.it', 1);

-- Luxottica (Partner - 5% commissione)
INSERT OR REPLACE INTO partners (id, nome, tipo, codice, ragione_sociale, percentuale_commissione, fattura_a, email, active) VALUES
('PARTNER_LUXOTTICA', 'Luxottica', 'PARTNER', 'LUXOTTICA', 'Luxottica Group S.p.A.', 0.05, 'CLIENTE', 'convenzioni@luxottica.it', 1);

-- Pirelli (Partner - 5% commissione)
INSERT OR REPLACE INTO partners (id, nome, tipo, codice, ragione_sociale, percentuale_commissione, fattura_a, email, active) VALUES
('PARTNER_PIRELLI', 'Pirelli', 'PARTNER', 'PIRELLI', 'Pirelli & C. S.p.A.', 0.05, 'CLIENTE', 'welfare@pirelli.com', 1);

-- FAS (Partner - 5% commissione)
INSERT OR REPLACE INTO partners (id, nome, tipo, codice, ragione_sociale, percentuale_commissione, fattura_a, email, active) VALUES
('PARTNER_FAS', 'FAS', 'PARTNER', 'FAS', 'FAS S.p.A.', 0.05, 'CLIENTE', 'info@fas.it', 1);

-- ============================================
-- WELFARE PROVIDERS (Fattura al provider)
-- ============================================

-- Eudaimon (Welfare - 5% commissione, fattura al provider)
INSERT OR REPLACE INTO partners (id, nome, tipo, codice, ragione_sociale, partita_iva, percentuale_commissione, fattura_a, email, pec, codice_sdi, active) VALUES
('WELFARE_EUDAIMON', 'Eudaimon', 'WELFARE', 'EUDAIMON', 'Eudaimon S.p.A.', '12345678901', 0.05, 'PROVIDER', 'fatturazione@eudaimon.it', 'eudaimon@pec.it', 'ABCD123', 1);

-- Double You (Welfare - 5% commissione, fattura al provider)
INSERT OR REPLACE INTO partners (id, nome, tipo, codice, ragione_sociale, partita_iva, percentuale_commissione, fattura_a, email, pec, codice_sdi, active) VALUES
('WELFARE_DOUBLEYOU', 'Double You', 'WELFARE', 'DOUBLEYOU', 'Double You S.r.l.', '23456789012', 0.05, 'PROVIDER', 'fatturazione@doubleyou.it', 'doubleyou@pec.it', 'EFGH456', 1);

-- Edenred (Welfare - 5% commissione, fattura al provider)
INSERT OR REPLACE INTO partners (id, nome, tipo, codice, ragione_sociale, partita_iva, percentuale_commissione, fattura_a, email, pec, codice_sdi, active) VALUES
('WELFARE_EDENRED', 'Edenred', 'WELFARE', 'EDENRED', 'Edenred Italia S.r.l.', '34567890123', 0.05, 'PROVIDER', 'fatturazione@edenred.it', 'edenred@pec.it', 'IJKL789', 1);

-- ============================================
-- CONVENZIONI AZIENDALI (Sconti)
-- ============================================

-- Mondadori (Convenzione - 10% sconto, fattura a richiedente)
INSERT OR REPLACE INTO partners (id, nome, tipo, codice, ragione_sociale, partita_iva, percentuale_sconto, fattura_a, email, active) VALUES
('CONV_MONDADORI', 'Mondadori', 'CONVENZIONE', 'MONDADORI', 'Arnoldo Mondadori Editore S.p.A.', '45678901234', 0.10, 'RICHIEDENTE', 'hr@mondadori.it', 1);

-- ============================================
-- VENDITA DIRETTA
-- ============================================
INSERT OR REPLACE INTO partners (id, nome, tipo, codice, ragione_sociale, percentuale_commissione, percentuale_sconto, fattura_a, active) VALUES
('DIRECT', 'Vendita Diretta', 'DIRECT', 'DIRECT', 'Medica GB S.r.l.', 0.00, 0.00, 'CLIENTE', 1);
