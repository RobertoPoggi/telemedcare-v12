-- Remove old email_configurazione template from database
-- This will force the system to use the updated file from templates/email_configurazione.html

DELETE FROM email_templates WHERE name = 'email_configurazione';

-- Verify deletion
SELECT COUNT(*) as remaining_templates FROM email_templates WHERE name = 'email_configurazione';
