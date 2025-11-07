-- Aggiorna template email_notifica_info con TUTTI i campi

UPDATE document_templates
SET 
  html_content = '
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Nuova Richiesta TeleMedCare</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #0066cc; border-bottom: 3px solid #0066cc; padding-bottom: 10px;">
            📋 NUOVA RICHIESTA TELEMEDCARE
        </h1>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #0066cc;">
            <p><strong>⏰ Richiesta ricevuta:</strong> {{DATA_RICHIESTA}} alle {{ORA_RICHIESTA}}</p>
            <p><strong>🆔 Lead ID:</strong> {{LEAD_ID}}</p>
            <p><strong>📍 Fonte:</strong> {{FONTE}}</p>
        </div>

        <h2 style="color: #0066cc; margin-top: 30px;">🔹 DATI RICHIEDENTE (Intestatario Contratto)</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Nome Completo:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{NOME_RICHIEDENTE}} {{COGNOME_RICHIEDENTE}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{EMAIL_RICHIEDENTE}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Telefono:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{TELEFONO_RICHIEDENTE}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Codice Fiscale:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{CF_RICHIEDENTE}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Indirizzo:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{INDIRIZZO_RICHIEDENTE}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>CAP - Città - Provincia:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{CAP_RICHIEDENTE}} {{CITTA_RICHIEDENTE}} ({{PROVINCIA_RICHIEDENTE}})</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Data Nascita:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{DATA_NASCITA_RICHIEDENTE}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Luogo Nascita:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{LUOGO_NASCITA_RICHIEDENTE}}</td></tr>
        </table>

        <h2 style="color: #0066cc; margin-top: 30px;">🔹 DATI ASSISTITO (Chi riceve il servizio)</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Nome Completo:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Età:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{ETA_ASSISTITO}} anni</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{EMAIL_ASSISTITO}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Telefono:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{TELEFONO_ASSISTITO}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Codice Fiscale:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{CF_ASSISTITO}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Indirizzo:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{INDIRIZZO_ASSISTITO}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>CAP - Città - Provincia:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{CAP_ASSISTITO}} {{CITTA_ASSISTITO}} ({{PROVINCIA_ASSISTITO}})</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Data Nascita:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{DATA_NASCITA_ASSISTITO}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Luogo Nascita:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{LUOGO_NASCITA_ASSISTITO}}</td></tr>
        </table>

        <h2 style="color: #0066cc; margin-top: 30px;">🔹 SERVIZIO RICHIESTO</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Pacchetto:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;"><span style="background-color: #0066cc; color: white; padding: 5px 10px; border-radius: 3px;">{{PIANO_SERVIZIO}}</span></td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Prezzo:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{PREZZO_PIANO}} IVA inclusa</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Intestazione Contratto:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{INTESTAZIONE_CONTRATTO}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Vuole Contratto:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{VUOLE_CONTRATTO}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Vuole Brochure:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{VUOLE_BROCHURE}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Vuole Manuale:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{VUOLE_MANUALE}}</td></tr>
        </table>

        <h2 style="color: #0066cc; margin-top: 30px;">🔹 CONDIZIONI SALUTE E URGENZA</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Condizioni Salute:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{CONDIZIONI_SALUTE}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Urgenza Risposta:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{URGENZA_RISPOSTA}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Giorni Risposta:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{GIORNI_RISPOSTA}}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Preferenza Contatto:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">{{PREFERENZA_CONTATTO}}</td></tr>
        </table>

        <h2 style="color: #0066cc; margin-top: 30px;">📝 NOTE AGGIUNTIVE</h2>
        <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
            <p>{{NOTE_AGGIUNTIVE}}</p>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666;">
            <p><strong>Sistema di Notifica Automatica TeleMedCare V11.0</strong></p>
            <p>Timestamp: {{TIMESTAMP_COMPLETO}}</p>
        </div>
    </div>
</body>
</html>',
  variables = '["NOME_RICHIEDENTE","COGNOME_RICHIEDENTE","EMAIL_RICHIEDENTE","TELEFONO_RICHIEDENTE","CF_RICHIEDENTE","INDIRIZZO_RICHIEDENTE","CAP_RICHIEDENTE","CITTA_RICHIEDENTE","PROVINCIA_RICHIEDENTE","DATA_NASCITA_RICHIEDENTE","LUOGO_NASCITA_RICHIEDENTE","NOME_ASSISTITO","COGNOME_ASSISTITO","EMAIL_ASSISTITO","TELEFONO_ASSISTITO","ETA_ASSISTITO","CF_ASSISTITO","INDIRIZZO_ASSISTITO","CAP_ASSISTITO","CITTA_ASSISTITO","PROVINCIA_ASSISTITO","DATA_NASCITA_ASSISTITO","LUOGO_NASCITA_ASSISTITO","PIANO_SERVIZIO","TIPO_SERVIZIO","PREZZO_PIANO","INTESTAZIONE_CONTRATTO","VUOLE_CONTRATTO","VUOLE_BROCHURE","VUOLE_MANUALE","CONDIZIONI_SALUTE","URGENZA_RISPOSTA","GIORNI_RISPOSTA","PREFERENZA_CONTATTO","NOTE_AGGIUNTIVE","FONTE","DATA_RICHIESTA","ORA_RICHIESTA","TIMESTAMP_COMPLETO","LEAD_ID"]',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'email_notifica_info';
