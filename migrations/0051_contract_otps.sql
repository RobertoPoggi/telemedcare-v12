-- TeleMedCare V12.0 - Migration 0051
-- Tabella contract_otps per OTP firma contratto
-- Data: 2026-02-11

-- Crea tabella per gestione OTP
CREATE TABLE IF NOT EXISTS contract_otps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  sms_sid TEXT,
  created_at TEXT NOT NULL,
  verified INTEGER DEFAULT 0,
  verified_at TEXT,
  failed_attempts INTEGER DEFAULT 0,
  UNIQUE(contract_id)
);

-- Indice per performance
CREATE INDEX IF NOT EXISTS idx_contract_otps_contract_id ON contract_otps(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_otps_verified ON contract_otps(verified);
