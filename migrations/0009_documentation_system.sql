-- TeleMedCare V11.0: Sistema di documentazione
-- Data: 2024-10-06
-- Descrizione: Aggiunge tabella per gestione documentazione di sistema

-- Tabella per sezioni di documentazione
CREATE TABLE IF NOT EXISTS documentation_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT,
  author TEXT,
  version TEXT DEFAULT '1.0',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indici per migliorare performance
CREATE INDEX IF NOT EXISTS idx_documentation_category ON documentation_sections(category);
CREATE INDEX IF NOT EXISTS idx_documentation_active ON documentation_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_documentation_created ON documentation_sections(created_at);

-- Trigger per aggiornare updated_at automaticamente
CREATE TRIGGER IF NOT EXISTS update_documentation_timestamp 
  AFTER UPDATE ON documentation_sections
BEGIN
  UPDATE documentation_sections 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

-- Inserimento sezioni di documentazione di base
INSERT OR IGNORE INTO documentation_sections (category, title, content, tags, author) VALUES
(
  'architecture',
  'Architettura TeleMedCare V11.0',
  'Sistema costruito su architettura modulare con Cloudflare Workers/Pages. Stack: Hono framework, Cloudflare D1 database, TailwindCSS frontend. Moduli principali: gestione lead, assistiti, analytics, email, sicurezza.',
  'architettura,sistema,tecnologie',
  'TeleMedCare Development Team'
),
(
  'environment_management',
  'Gestione Ambienti Multi-Ambiente', 
  'Quattro ambienti: Development (telemedcare-leads), Test (telemedcare_test_0n), Staging (telemedcare_staging), Production (telemedcare_database). Scripts automatici per deployment e clonazione ambienti.',
  'deployment,ambienti,database',
  'TeleMedCare DevOps Team'
),
(
  'api_reference',
  'API Reference Base',
  'API REST con autenticazione JWT. Endpoints principali: /api/leads, /api/assistiti, /api/analytics, /api/email, /api/admin. Rate limiting: 100 req/min standard, 1000 req/min autenticato.',
  'api,endpoints,autenticazione',
  'TeleMedCare API Team'
),
(
  'user_guide',
  'Guida Utente Sistema',
  'Guida per operatori: login, gestione lead, registrazione assistiti, invio email, visualizzazione analytics. Interfaccia web responsive con dashboard real-time.',
  'guida,utente,operatori',
  'TeleMedCare UX Team'
),
(
  'deployment_guide',
  'Guida Deployment',
  'Deployment automatico su Cloudflare Pages. Comandi: npm run deploy:test, npm run deploy:staging, npm run deploy:production. Gestione database D1 e migrazioni automatiche.',
  'deployment,produzione,cloudflare',
  'TeleMedCare DevOps Team'
);