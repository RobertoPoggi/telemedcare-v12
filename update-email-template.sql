-- Aggiorna il template email_configurazione_riepilogo nel database
-- Questo template contiene TUTTI i campi del form di configurazione

UPDATE email_templates 
SET 
  html_content = (SELECT content FROM (
    SELECT readfile('templates/email_configurazione_riepilogo.html') as content
  )),
  updated_at = CURRENT_TIMESTAMP
WHERE template_name = 'email_configurazione_riepilogo';

-- Se non esiste, inseriscilo
INSERT OR IGNORE INTO email_templates (template_name, subject, html_content, created_at, updated_at)
VALUES (
  'email_configurazione_riepilogo',
  'Configurazione Dispositivo - {{NOME_CLIENTE}} {{COGNOME_CLIENTE}}',
  (SELECT content FROM (
    SELECT readfile('templates/email_configurazione_riepilogo.html') as content
  )),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Verifica
SELECT template_name, subject, length(html_content) as content_length 
FROM email_templates 
WHERE template_name LIKE '%configurazione%';
