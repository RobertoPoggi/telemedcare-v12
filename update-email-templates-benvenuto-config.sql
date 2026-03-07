-- Aggiorna template email_benvenuto e email_configurazione con i contenuti corretti

-- 1. Template email_benvenuto
DELETE FROM email_templates WHERE name = 'email_benvenuto';

INSERT INTO email_templates (name, subject, content, created_at)
SELECT 
  'email_benvenuto',
  'Benvenuto/a in TeleMedCare!',
  readfile('templates/email_benvenuto.html'),
  datetime('now')
WHERE EXISTS (SELECT 1);

-- 2. Template email_configurazione (form post-pagamento)
DELETE FROM email_templates WHERE name = 'email_configurazione';

INSERT INTO email_templates (name, subject, content, created_at)
SELECT 
  'email_configurazione',
  'Completa la Configurazione del tuo dispositivo',
  readfile('templates/email_configurazione.html'),
  datetime('now')
WHERE EXISTS (SELECT 1);

-- Verifica
SELECT name, subject, length(content) as content_length FROM email_templates 
WHERE name IN ('email_benvenuto', 'email_configurazione');
