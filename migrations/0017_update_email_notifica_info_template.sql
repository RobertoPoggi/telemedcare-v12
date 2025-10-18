-- Migration 0017: Update email_notifica_info template with all fields
-- Aggiorna il template per includere CF, indirizzo, condizioni salute

UPDATE document_templates SET html_content = '
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuovo Lead TeleMedCare</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .section { margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-left: 4px solid #667eea; border-radius: 4px; }
        .section h3 { margin-top: 0; color: #667eea; font-size: 18px; }
        .field { margin: 10px 0; }
        .field-label { font-weight: bold; color: #555; display: inline-block; width: 180px; }
        .field-value { color: #333; }
        .highlight { background: #fff3cd; padding: 3px 6px; border-radius: 3px; }
        .badge { display: inline-block; padding: 5px 12px; background: #667eea; color: white; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .alert strong { color: #856404; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🆕 Nuovo Lead TeleMedCare</h1>
            <p>Sistema di Notifica Automatica</p>
            <p style="margin-top:10px; font-size:14px;">Richiesta ricevuta: {{TIMESTAMP_COMPLETO}}</p>
        </div>
        
        <div class="content">
            <!-- Servizio Richiesto -->
            <div class="alert">
                <strong>Servizio Richiesto:</strong> <span class="badge">{{PIANO_SERVIZIO}}</span> - {{PREZZO_PIANO}}
            </div>

            <!-- Dati Richiedente -->
            <div class="section">
                <h3>👤 Dati Richiedente</h3>
                <div class="field">
                    <span class="field-label">NOME E COGNOME:</span>
                    <span class="field-value">{{NOME_RICHIEDENTE}} {{COGNOME_RICHIEDENTE}}</span>
                </div>
                <div class="field">
                    <span class="field-label">EMAIL:</span>
                    <span class="field-value highlight">{{EMAIL_RICHIEDENTE}}</span>
                </div>
                <div class="field">
                    <span class="field-label">TELEFONO:</span>
                    <span class="field-value highlight">{{TELEFONO_RICHIEDENTE}}</span>
                </div>
                <div class="field">
                    <span class="field-label">CODICE FISCALE:</span>
                    <span class="field-value">{{CF_RICHIEDENTE}}</span>
                </div>
                <div class="field">
                    <span class="field-label">INDIRIZZO FATTURAZIONE:</span>
                    <span class="field-value">{{INDIRIZZO_RICHIEDENTE}}</span>
                </div>
            </div>

            <!-- Dati Assistito -->
            <div class="section">
                <h3>🏥 Dati Assistito</h3>
                <div class="field">
                    <span class="field-label">NOME E COGNOME:</span>
                    <span class="field-value">{{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}}</span>
                </div>
                <div class="field">
                    <span class="field-label">ETÀ:</span>
                    <span class="field-value">{{ETA_ASSISTITO}} anni</span>
                </div>
                <div class="field">
                    <span class="field-label">DATA DI NASCITA:</span>
                    <span class="field-value">{{DATA_NASCITA_ASSISTITO}}</span>
                </div>
                <div class="field">
                    <span class="field-label">LUOGO DI NASCITA:</span>
                    <span class="field-value">{{LUOGO_NASCITA_ASSISTITO}}</span>
                </div>
                <div class="field">
                    <span class="field-label">CODICE FISCALE:</span>
                    <span class="field-value">{{CF_ASSISTITO}}</span>
                </div>
                <div class="field">
                    <span class="field-label">INDIRIZZO:</span>
                    <span class="field-value">{{INDIRIZZO_ASSISTITO}}</span>
                </div>
            </div>

            <!-- Condizioni di Salute -->
            <div class="section">
                <h3>💊 Condizioni di Salute e Note</h3>
                <div class="field">
                    <span class="field-label">CONDIZIONI:</span>
                    <span class="field-value">{{CONDIZIONI_SALUTE}}</span>
                </div>
                <div class="field">
                    <span class="field-label">NOTE AGGIUNTIVE:</span>
                    <span class="field-value">{{NOTE_AGGIUNTIVE}}</span>
                </div>
            </div>

            <!-- Info Sistema -->
            <div class="section">
                <h3>🔧 Informazioni Sistema</h3>
                <div class="field">
                    <span class="field-label">Data Richiesta:</span>
                    <span class="field-value">{{DATA_RICHIESTA}} alle {{ORA_RICHIESTA}}</span>
                </div>
                <div class="field">
                    <span class="field-label">Versione Sistema:</span>
                    <span class="field-value">{{VERSIONE_SISTEMA}}</span>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>TeleMedCare V11.0</strong> - Sistema di Telemedicina Avanzato</p>
            <p>Medica GB S.r.l. • info@telemedcare.it • www.medicagb.it</p>
        </div>
    </div>
</body>
</html>
' WHERE name = 'email_notifica_info';
