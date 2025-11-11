-- Restore correct email templates from yesterday (20:57)
-- This restores the templates that were working correctly before they were accidentally changed
-- Source: git commit c9cab68 (email_notifica_info) and migration 0012 (email_conferma_attivazione)

-- ========================================================================
-- 1. RESTORE email_notifica_info template (for info@telemedcare.it)
-- ========================================================================
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

-- ========================================================================
-- 2. RESTORE email_conferma_attivazione template (for customer)
-- ========================================================================
UPDATE document_templates 
SET 
  html_content = '<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Conferma Attivazione TeleMedCare</title>
  <style>
    /* Email-safe basic styles */
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #333333;
      -webkit-text-size-adjust: 100%;
    }
    table {
      border-collapse: collapse;
    }
    .container {
      width: 100%;
      padding: 20px 16px;
    }
    .card {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(16,24,40,0.08);
    }
    .card-inner {
      padding: 24px;
    }
    h1, h2, h3 {
      margin: 0 0 12px 0;
      color: #0b2545;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
    }
    h2 {
      font-size: 16px;
      font-weight: 700;
    }
    p {
      margin: 0 0 12px 0;
      line-height: 1.45;
    }
    .muted {
      color: #667085;
      font-size: 14px;
    }
    .section {
      margin-bottom: 18px;
    }
    .device-info {
      background: #f8fafc;
      border: 1px solid #eef2f7;
      padding: 12px;
      border-radius: 6px;
      font-size: 15px;
    }
    .device-info b {
      color: #0b2545;
    }
    ul {
      padding-left: 18px;
      margin: 8px 0 12px 0;
    }
    li {
      margin-bottom: 8px;
    }
    .button {
      display: inline-block;
      background: #0066cc;
      color: #ffffff;
      text-decoration: none;
      padding: 10px 16px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
    }
    .footer {
      padding: 18px 24px;
      background: #f8fafc;
      font-size: 13px;
      color: #667085;
      border-top: 1px solid #eef2f7;
    }
    .signature {
      margin-top: 12px;
      font-weight: 600;
      color: #0b2545;
    }
    @media (max-width: 620px) {
      .card-inner { padding: 16px; }
    }
  </style>
</head>
<body>
  <table class="container" width="100%" role="presentation">
    <tr>
      <td align="center">
        <table class="card" width="100%" role="presentation">
          <tr>
            <td class="card-inner">
              <!-- Header / Greeting -->
              <h1>Gentile {{NOME_CLIENTE}},</h1>
              <p class="muted"> Il Suo servizio è ora <strong>ATTIVO</strong>!</p>

              <!-- Activation message -->
              <div class="section">
                <p>Il dispositivo <strong>SiDLY</strong> è configurato e funzionante. È ora protetto/a H24!</p>
                <p><strong>Data Attivazione:</strong> {{DATA_ATTIVAZIONE}}</p>
              </div>

              <!-- Device information -->
              <div class="section">
                <h2> Informazioni Dispositivo</h2>
                <div class="device-info">
                  <p><strong>Dispositivo:</strong> SiDLY - Classe IIa Certificato</p>
                  <p><strong>Codice Dispositivo:</strong> {{CODICE_DISPOSITIVO}}</p>
                  <p><strong>Piano Attivo:</strong> {{PIANO_SERVIZIO}}</p>
                  <p><strong>Scadenza Servizio:</strong> {{DATA_SCADENZA}}</p>
                </div>
              </div>

              <!-- Important info -->
              <div class="section">
                <h2> Informazioni Importanti</h2>
                <ul>
                  <li><strong>Indossi sempre il dispositivo:</strong> Solo così può proteggerLa efficacemente</li>
                  <li><strong>Ricarica quotidiana:</strong> Metta in carica ogni sera per 2-3 ore oppure metta in carica ogni giorno quando non è da solo/a in casa</li>
                  <li><strong>Aggiornamenti automatici:</strong> Il dispositivo si aggiorna da solo</li>
                </ul>
              </div>

              <!-- SOS button instructions -->
              <div class="section">
                <h2> Come Funziona il Pulsante SOS</h2>
                <ol>
                  <li><strong>Emergenza:</strong> Prema e tenga premuto il pulsante rosso per 3 secondi</li>
                  <li><strong>Invio Automatico:</strong> Viene inviato allarme con la Sua posizione GPS</li>
                  <li><strong>Contatti Immediati:</strong> Vengono avvisati familiari e la Centrale Operativa</li>
                  <li><strong>Comunicazione:</strong> Può parlare direttamente attraverso il dispositivo</li>
                </ol>
              </div>

              <!-- Reassurance -->
              <div class="section">
                <h2> Stia Tranquillo/a</h2>
                <p><strong>È ora protetto/a H24 con la tecnologia SiDLY!</strong></p>
                <p class="muted"><em>La Sua sicurezza è la nostra missione.</em></p>

                <p class="signature">Il Team TeleMedCare</p>
                <p class="muted">Il Team TeleMedCare è sempre a Sua disposizione per qualsiasi necessità o domanda.</p>
              </div>

            </td>
          </tr>
          <tr>
            <td class="footer" align="center">
              TeleMedCare · Assistenza 24/7 · <span style="color:#0b2545;font-weight:600">support@telemedcare.it</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  updated_at = datetime('now')
WHERE id = 'email_conferma_attivazione';

-- ========================================================================
-- Verification query
-- ========================================================================
SELECT 
  id, 
  name, 
  length(html_content) as html_size, 
  updated_at 
FROM document_templates 
WHERE id IN ('email_notifica_info', 'email_conferma_attivazione')
ORDER BY id;
