-- Update email templates with correct V11 placeholders
-- Date: 2026-01-02
-- Fix: Replace wrong placeholders (NOME_CLIENTE) with correct ones (NOME_RICHIEDENTE)

-- This is a placeholder migration - actual update will be done via admin endpoint
-- The templates are too large to include inline in SQL

-- Template email_notifica_info should use:
-- {{NOME_RICHIEDENTE}}, {{COGNOME_RICHIEDENTE}}, {{EMAIL_RICHIEDENTE}}, {{TELEFONO_RICHIEDENTE}}
-- {{NOME_ASSISTITO}}, {{COGNOME_ASSISTITO}}, {{PIANO_SERVIZIO}}, {{PREZZO_PIANO}}
-- {{LEAD_ID}}, {{DATA_RICHIESTA}}, {{ORA_RICHIESTA}}, {{TIMESTAMP_COMPLETO}}

-- Template email_documenti_informativi should use:
-- {{NOME_CLIENTE}}, {{COGNOME_CLIENTE}}, {{TIPO_SERVIZIO}}, {{DATA_RICHIESTA}}
-- {{PACCHETTO}}, {{PREZZO_PIANO}}

SELECT 'Templates placeholders need manual update via admin endpoint' as message;
