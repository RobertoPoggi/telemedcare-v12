-- Migration 0013: Fix email_notifica_info template with ALL fields
-- Date: 2025-11-09
-- Issue: Template was missing critical fields (LEAD_ID, FONTE, full addresses, etc.)
-- Solution: Update with complete template matching the code's templateData

UPDATE document_templates 
SET 
  html_content = '<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuova Richiesta TeleMedCare</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .email-container {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .meta-info {
            background: rgba(255,255,255,0.2);
            padding: 15px;
            margin-top: 15px;
            border-radius: 6px;
            font-size: 14px;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 30px;
            border-left: 4px solid #3b82f6;
            padding-left: 20px;
        }
        .section-title {
            color: #1e40af;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .field-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 10px;
        }
        .field {
            background: #f8fafc;
            padding: 12px;
            border-radius: 4px;
            border-left: 3px solid #3b82f6;
        }
        .field-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
            font-weight: 600;
        }
        .field-value {
            font-size: 15px;
            color: #1e293b;
            font-weight: 500;
        }
        .field-full {
            grid-column: 1 / -1;
        }
        .highlight-box {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .highlight-box h3 {
            margin: 0 0 10px 0;
            color: #d97706;
        }
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🔔 NUOVA RICHIESTA TELEMEDCARE</h1>
            <p>Sistema di Notifica Automatica - {{VERSIONE_SISTEMA}}</p>
            <div class="meta-info">
                <strong>Richiesta ricevuta:</strong> {{DATA_RICHIESTA}} alle {{ORA_RICHIESTA}}<br>
                <strong>Lead ID:</strong> {{LEAD_ID}}<br>
                <strong>Fonte:</strong> {{FONTE}}
            </div>
        </div>
        
        <div class="content">
            <!-- DATI RICHIEDENTE -->
            <div class="section">
                <div class="section-title">
                    👤 DATI RICHIEDENTE (Intestatario Contratto)
                </div>
                <div class="field-grid">
                    <div class="field">
                        <div class="field-label">Nome</div>
                        <div class="field-value">{{NOME_RICHIEDENTE}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Cognome</div>
                        <div class="field-value">{{COGNOME_RICHIEDENTE}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Email</div>
                        <div class="field-value">{{EMAIL_RICHIEDENTE}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Telefono</div>
                        <div class="field-value">{{TELEFONO_RICHIEDENTE}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Codice Fiscale</div>
                        <div class="field-value">{{CF_RICHIEDENTE}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Data di Nascita</div>
                        <div class="field-value">{{DATA_NASCITA_RICHIEDENTE}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Luogo di Nascita</div>
                        <div class="field-value">{{LUOGO_NASCITA_RICHIEDENTE}}</div>
                    </div>
                    <div class="field field-full">
                        <div class="field-label">Indirizzo Completo</div>
                        <div class="field-value">{{INDIRIZZO_RICHIEDENTE}}, {{CAP_RICHIEDENTE}} {{CITTA_RICHIEDENTE}} ({{PROVINCIA_RICHIEDENTE}})</div>
                    </div>
                </div>
            </div>

            <!-- DATI ASSISTITO -->
            <div class="section">
                <div class="section-title">
                    🏥 DATI ASSISTITO (Persona da Assistere)
                </div>
                <div class="field-grid">
                    <div class="field">
                        <div class="field-label">Nome</div>
                        <div class="field-value">{{NOME_ASSISTITO}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Cognome</div>
                        <div class="field-value">{{COGNOME_ASSISTITO}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Età</div>
                        <div class="field-value">{{ETA_ASSISTITO}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Data di Nascita</div>
                        <div class="field-value">{{DATA_NASCITA_ASSISTITO}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Luogo di Nascita</div>
                        <div class="field-value">{{LUOGO_NASCITA_ASSISTITO}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Codice Fiscale</div>
                        <div class="field-value">{{CF_ASSISTITO}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Email</div>
                        <div class="field-value">{{EMAIL_ASSISTITO}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Telefono</div>
                        <div class="field-value">{{TELEFONO_ASSISTITO}}</div>
                    </div>
                    <div class="field field-full">
                        <div class="field-label">Indirizzo Completo</div>
                        <div class="field-value">{{INDIRIZZO_ASSISTITO}}, {{CAP_ASSISTITO}} {{CITTA_ASSISTITO}} ({{PROVINCIA_ASSISTITO}})</div>
                    </div>
                </div>
            </div>

            <!-- SERVIZIO RICHIESTO -->
            <div class="section">
                <div class="section-title">
                    📦 SERVIZIO RICHIESTO
                </div>
                <div class="field-grid">
                    <div class="field">
                        <div class="field-label">Piano Servizio</div>
                        <div class="field-value">{{PIANO_SERVIZIO}} ({{TIPO_SERVIZIO}})</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Prezzo</div>
                        <div class="field-value">{{PREZZO_PIANO}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Richiede Contratto</div>
                        <div class="field-value">{{VUOLE_CONTRATTO}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Intestazione Contratto</div>
                        <div class="field-value">{{INTESTAZIONE_CONTRATTO}}</div>
                    </div>
                </div>
            </div>

            <!-- RICHIESTE DOCUMENTAZIONE -->
            <div class="section">
                <div class="section-title">
                    📄 RICHIESTE DOCUMENTAZIONE
                </div>
                <div class="field-grid">
                    <div class="field">
                        <div class="field-label">Brochure</div>
                        <div class="field-value">{{VUOLE_BROCHURE}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Manuale Utente</div>
                        <div class="field-value">{{VUOLE_MANUALE}}</div>
                    </div>
                </div>
            </div>

            <!-- CONDIZIONI SALUTE E PRIORITÀ -->
            <div class="highlight-box">
                <h3>⚠️ CONDIZIONI SALUTE E PRIORITÀ</h3>
                <div class="field-grid">
                    <div class="field">
                        <div class="field-label">Condizioni di Salute</div>
                        <div class="field-value">{{CONDIZIONI_SALUTE}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Urgenza Risposta</div>
                        <div class="field-value">{{URGENZA_RISPOSTA}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Giorni Risposta Richiesti</div>
                        <div class="field-value">{{GIORNI_RISPOSTA}}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Preferenza Contatto</div>
                        <div class="field-value">{{PREFERENZA_CONTATTO}}</div>
                    </div>
                    <div class="field field-full">
                        <div class="field-label">Note Aggiuntive</div>
                        <div class="field-value">{{NOTE_AGGIUNTIVE}}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>TeleMedCare</strong> - Medica GB S.r.l.</p>
            <p>Sistema Automatico di Gestione Lead - {{VERSIONE_SISTEMA}}</p>
        </div>
    </div>
</body>
</html>',
  updated_at = datetime('now')
WHERE id = 'email_notifica_info';

-- Verifica aggiornamento
SELECT id, name, length(html_content) as html_size, updated_at 
FROM document_templates 
WHERE id = 'email_notifica_info';
