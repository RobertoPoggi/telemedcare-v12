-- Migration 0014: Fix contract email template to use dynamic document text
-- Date: 2025-11-09
-- Issue: Email text was hardcoded with "contratto e brochure" regardless of what was actually requested
-- Solution: Replace hardcoded text with {{TESTO_DOCUMENTI_AGGIUNTIVI}} placeholder

UPDATE document_templates
SET html_content = REPLACE(
    html_content,
    '<p>
            Siamo lieti di accompagnarLa in questo importante passo verso una maggiore sicurezza e tranquillità. Come
                promesso, Le inviamo in allegato il <strong>contratto per il servizio {{PIANO_SERVIZIO}}</strong> e la
                <strong>brochure aziendale</strong> con tutti i dettagli sui nostri servizi innovativi.
              </p>',
    '<p>
            Siamo lieti di accompagnarLa in questo importante passo verso una maggiore sicurezza e tranquillità. Come
                promesso, Le inviamo in allegato il <strong>contratto per il servizio {{PIANO_SERVIZIO}}</strong>{{TESTO_DOCUMENTI_AGGIUNTIVI}}.
              </p>'
),
updated_at = datetime('now')
WHERE id = 'email_invio_contratto';

-- Verify the update
SELECT id, name, 
       CASE 
           WHEN html_content LIKE '%{{TESTO_DOCUMENTI_AGGIUNTIVI}}%' THEN 'YES' 
           ELSE 'NO' 
       END as has_dynamic_text,
       updated_at
FROM document_templates
WHERE id = 'email_invio_contratto';
