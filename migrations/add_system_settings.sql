-- Tabella per impostazioni di sistema
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserisci impostazioni iniziali
INSERT OR IGNORE INTO system_settings (key, value, description)
VALUES 
  ('email_commercialista', '', 'Email del commercialista per invio copia proforma dopo pagamento'),
  ('ultimo_numero_ddt', '6', 'Ultimo numero DDT generato (incrementale per anno corrente)'),
  ('anno_ddt_corrente', '2026', 'Anno di riferimento per numerazione DDT');
