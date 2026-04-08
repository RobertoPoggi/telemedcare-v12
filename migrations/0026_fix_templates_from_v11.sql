-- Fix email templates with correct placeholders from V11
-- Generated: 2026-01-02

UPDATE document_templates 
SET html_content = (
  SELECT content FROM (
    SELECT '$(cat templates/email_notifica_info.html | sed "s/'/'''/g")' as content
  )
),
updated_at = CURRENT_TIMESTAMP
WHERE id = 'email_notifica_info';
