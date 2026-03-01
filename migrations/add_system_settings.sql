-- Tabella per impostazioni di sistema
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserisci email commercialista (inizialmente vuota)
INSERT OR IGNORE INTO system_settings (key, value, description)
VALUES ('email_commercialista', '', 'Email del commercialista per invio copia proforma dopo pagamento');
