-- Populate document_templates table
-- Generated: 2025-10-18

INSERT INTO document_templates (
    name, category, description, version,
    html_content, variables,
    subject, from_name,
    active, is_default, author
) VALUES (
    'email_notifica_info',
    'EMAIL',
    'Email di notifica info a TelemedCare con tutti i dati del lead',
    '1.0',
    '<!DOCTYPE html>
<html lang="it" data-theme="light">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Template Email TeleMedCare - Medica GB S.r.l.</title>
<link href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<style>
      body {
        max-width: 880px;
        margin: 0 auto;
        padding: 32px 80px;
        position: relative;
        box-sizing: border-box;
        font-family: ''Inter'', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #ffffff;
      }

      .template-section {
        margin-bottom: 60px;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 40px;
      }

      .template-title {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 20px;
        margin: 0 -20px 30px -20px;
        border-radius: 8px;
        font-size: 20px;
        font-weight: 600;
      }

      .email-container {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        margin: 20px 0;
      }

      .email-header {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 30px 25px;
        text-align: center;
      }

      .email-content {
        padding: 30px 25px;
      }

      .contact-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 20px;
        margin: 20px 0;
      }

      .highlight-box {
        background: #ecfdf5;
        border: 2px solid #22c55e;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .warning-box {
        background: #fef3c7;
        border: 2px solid #f59e0b;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .info-box {
        background: #f0f9ff;
        border-left: 4px solid #3b82f6;
        padding: 20px;
        margin: 20px 0;
      }

      .comparison-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        background: white;
        border: 1px solid #e0e0e0;
      }

      .comparison-table th {
        background: #3b82f6;
        color: white;
        padding: 15px;
        text-align: center;
        font-weight: bold;
      }

      .comparison-table td {
        padding: 12px 15px;
        border-bottom: 1px solid #e5e7eb;
        vertical-align: top;
      }

      .comparison-table tr:nth-child(even) {
        background: #f8faff;
      }

      .footer-standard {
        background: #1f2937;
        color: white;
        padding: 20px;
        text-align: center;
        font-size: 14px;
      }
    </style>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Open%20Sans:wght@400&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Noto%20Sans%20JP:wght@400&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400&amp;display=swap" rel="stylesheet"/></head>
<body>


<div class="email-container">
<div class="email-header" style="background: linear-gradient(135deg, #1a472a 0%, #2d6a4f 100%)">
<h3 style="margin: 0; font-size: 24px">🔔 Nuovo Lead TeleMedCare</h3>
<p style="margin: 10px 0 0 0">Sistema di Notifica Automatica</p>
<div style="
              background-color: rgba(255, 255, 255, 0.2);
              padding: 12px 20px;
              margin-top: 15px;
              border-radius: 6px;
              font-size: 14px;
            ">
<strong>Richiesta ricevuta:</strong> {{DATA_RICHIESTA}} alle {{ORA_RICHIESTA}}
          </div>
</div>
<div class="email-content">
<div style="margin-bottom: 30px">
<h4 style="color: #2d6a4f; border-bottom: 2px solid #52b788; padding-bottom: 8px">👤 Dati Richiedente</h4>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px">
<div style="
                  background-color: #f8f9fa;
                  padding: 12px 15px;
                  border-left: 4px solid #52b788;
                  border-radius: 4px;
                ">
<div style="
                    font-size: 13px;
                    color: #666;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                  ">
                  Nome
                </div>
<div style="font-size: 15px; color: #333; font-weight: 600">{{NOME_RICHIEDENTE}}</div>
</div>
<div style="
                  background-color: #f8f9fa;
                  padding: 12px 15px;
                  border-left: 4px solid #52b788;
                  border-radius: 4px;
                ">
<div style="
                    font-size: 13px;
                    color: #666;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                  ">
                  Cognome
                </div>
<div style="font-size: 15px; color: #333; font-weight: 600">{{COGNOME_RICHIEDENTE}}</div>
</div>
<div style="
                  background-color: #f8f9fa;
                  padding: 12px 15px;
                  border-left: 4px solid #52b788;
                  border-radius: 4px;
                ">
<div style="
                    font-size: 13px;
                    color: #666;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                  ">
                  Email
                </div>
<div style="font-size: 15px; color: #333; font-weight: 600">{{EMAIL_RICHIEDENTE}}</div>
</div>
<div style="
                  background-color: #f8f9fa;
                  padding: 12px 15px;
                  border-left: 4px solid #52b788;
                  border-radius: 4px;
                ">
<div style="
                    font-size: 13px;
                    color: #666;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                  ">
                  Telefono
                </div>
<div style="font-size: 15px; color: #333; font-weight: 600">{{TELEFONO_RICHIEDENTE}}</div>
</div>
</div>
</div>
<div style="margin-bottom: 30px">
<h4 style="color: #2d6a4f; border-bottom: 2px solid #52b788; padding-bottom: 8px">👥 Dati Assistito</h4>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px">
<div style="
                  background-color: #f8f9fa;
                  padding: 12px 15px;
                  border-left: 4px solid #52b788;
                  border-radius: 4px;
                ">
<div style="
                    font-size: 13px;
                    color: #666;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                  ">
                  Nome
                </div>
<div style="font-size: 15px; color: #333; font-weight: 600">{{NOME_ASSISTITO}}</div>
</div>
<div style="
                  background-color: #f8f9fa;
                  padding: 12px 15px;
                  border-left: 4px solid #52b788;
                  border-radius: 4px;
                ">
<div style="
                    font-size: 13px;
                    color: #666;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                  ">
                  Cognome
                </div>
<div style="font-size: 15px; color: #333; font-weight: 600">{{COGNOME_ASSISTITO}}</div>
</div>
<div style="
                  background-color: #f8f9fa;
                  padding: 12px 15px;
                  border-left: 4px solid #52b788;
                  border-radius: 4px;
                  grid-column: 1 / -1;
                ">
<div style="
                    font-size: 13px;
                    color: #666;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                  ">
                  Condizioni di Salute
                </div>
<div style="font-size: 15px; color: #333; font-weight: 600">{{CONDIZIONI_SALUTE}}</div>
</div>
</div>
</div>
<div style="margin-bottom: 30px">
<h4 style="color: #2d6a4f; border-bottom: 2px solid #52b788; padding-bottom: 8px">🎯 Servizio Richiesto</h4>
<div style="
                background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
                border: 2px solid #52b788;
                border-radius: 8px;
                padding: 20px;
                margin: 15px 0;
              ">
<div style="font-size: 16px; font-weight: 700; color: #1a472a; margin-bottom: 10px">
                Piano {{PIANO_SERVIZIO}}
              </div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px">
<div style="
                    background-color: #f8f9fa;
                    padding: 12px 15px;
                    border-left: 4px solid #52b788;
                    border-radius: 4px;
                  ">
<div style="
                      font-size: 13px;
                      color: #666;
                      font-weight: 500;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                      margin-bottom: 4px;
                    ">
                    Pacchetto
                  </div>
<div style="font-size: 15px; color: #333; font-weight: 600">{{PIANO_SERVIZIO}}</div>
</div>
<div style="
                    background-color: #f8f9fa;
                    padding: 12px 15px;
                    border-left: 4px solid #52b788;
                    border-radius: 4px;
                  ">
<div style="
                      font-size: 13px;
                      color: #666;
                      font-weight: 500;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                      margin-bottom: 4px;
                    ">
                    Prezzo
                  </div>
<div style="font-size: 15px; color: #333; font-weight: 600">{{PREZZO_PIANO}}</div>
</div>
</div>
</div>
</div>
<div style="
              background: linear-gradient(135deg, #fff3cd 0%, #fff8e1 100%);
              border: 2px solid #ffc107;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            ">
<h4 style="color: #856404; margin-bottom: 10px">⚡ Azione Richiesta</h4>
<p style="color: #664d03; margin: 0">
              Contattare il cliente entro 24 ore per procedere con l''attivazione del servizio TeleMedCare.
            </p>
</div>
<div class="contact-box">
<h4 style="color: #475569; margin-top: 0">📞 Contatti</h4>
<p><strong>E-MAIL:</strong> <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="127b7c747d527f77767b717375703c7b66">[email&#160;protected]</a></p>
<p><strong>Telefono commerciale:</strong> 335 7301206</p>
<p><strong>Telefono tecnico:</strong> 331 64 32 390</p>
</div>
</div>
<div style="background-color: #f8f9fa; padding: 20px; font-size: 13px; color: #666; border-top: 1px solid #e0e0e0">
<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px">
<div>
<strong>Medica GB S.r.l.</strong> - Startup Innovativa a Vocazione Sociale<br/>
              📧 <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="c9a0a7afa689a4acada0aaa8aeabe7a0bd">[email&#160;protected]</a> | 🌐 www.medicagb.it
            </div>
<div style="text-align: right">
<small>Generato automaticamente da TeleMedCare {{VERSIONE_SISTEMA}}<br/>il {{DATA_RICHIESTA}} alle
                {{ORA_RICHIESTA}}</small>
</div>
</div>
</div>
</div>
</div>
<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script></body>
</html>',
    '["NOME_RICHIEDENTE", "COGNOME_RICHIEDENTE", "EMAIL_RICHIEDENTE", "TELEFONO_RICHIEDENTE", "NOME_ASSISTITO", "COGNOME_ASSISTITO", "ETA_ASSISTITO", "TIPO_SERVIZIO", "PIANO_SERVIZIO", "PREZZO_PIANO", "VUOLE_BROCHURE", "VUOLE_MANUALE", "VUOLE_CONTRATTO", "FONTE_RICHIESTA", "DATA_RICHIESTA", "ORA_RICHIESTA", "CONSENSO_PRIVACY", "CONSENSO_MARKETING", "CONSENSO_TERZE", "VERSIONE_SISTEMA", "CONDIZIONI_SALUTE", "NOTE_AGGIUNTIVE"]',
    'Nuova Richiesta di Informazioni - {{NOME_RICHIEDENTE}} {{COGNOME_RICHIEDENTE}}',
    'TelemedCare Sistema',
    1,
    0,
    'system'
);

INSERT INTO document_templates (
    name, category, description, version,
    html_content, variables,
    subject, from_name,
    active, is_default, author
) VALUES (
    'email_documenti_informativi',
    'EMAIL',
    'Email con brochure e manuale informativo (solo richiesta info)',
    '1.0',
    '<!DOCTYPE html>
<html lang="it" data-theme="light" style=""><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Documenti Informativi - TeleMedCare</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
    <style>
      body {
        max-width: 880px;
        margin: 0 auto;
        padding: 32px 80px;
        position: relative;
        box-sizing: border-box;
        font-family: ''Inter'', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #ffffff;
      }

      .email-container {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        margin: 20px 0;
      }

      .email-header {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 30px 25px;
        text-align: center;
      }

      .email-content {
        padding: 30px 25px;
      }

      .contact-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 20px;
        margin: 20px 0;
      }

      .highlight-box {
        background: #ecfdf5;
        border: 2px solid #22c55e;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .info-box {
        background: #f0f9ff;
        border-left: 4px solid #3b82f6;
        padding: 20px;
        margin: 20px 0;
      }

      .footer-standard {
        background: #1f2937;
        color: white;
        padding: 20px;
        text-align: center;
        font-size: 14px;
      }

      .doc-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 20px 0;
      }

      .doc-card {
        background: #f8fafc;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }
    </style>
  </head>
  <body style="">
    <h1>TEMPLATE 1: EMAIL DOCUMENTI INFORMATIVI</h1>

    <div class="email-container">
      <div class="email-header">
        <h3 style="margin: 0; font-size: 24px">TeleMedCare</h3>
        <p style="margin: 10px 0 0 0">La tecnologia che Le salva salute e vita</p>
        <div style="font-size: 14px; opacity: 0.9">
          <strong>Medica GB S.r.l.</strong> - Startup Innovativa a Vocazione Sociale
        </div>
      </div>

      <div class="email-content">
        <h3 style="color: #1e40af; margin-top: 0">Gentile {{NOME_CLIENTE}},</h3>

        <p>
          Grazie per l''interesse mostrato verso i nostri servizi <strong>TeleMedCare {{PACCHETTO}}</strong>. Come
          richiesto, abbiamo preparato per Lei la documentazione informativa completa.
        </p>

        <p>
          Il nostro servizio � pensato per <strong>{{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}}</strong> e rappresenta una
          soluzione innovativa per la gestione della salute a distanza.
        </p>

        <div class="info-box">
          <h4 style="color: #3b82f6; margin-top: 0">Riepilogo della Sua richiesta</h4>
          <ul>
            <li><strong>Codice pratica:</strong> {{LEAD_ID}}</li>
            <li><strong>Data richiesta:</strong> {{DATA_RICHIESTA}}</li>
            <li><strong>Pacchetto:</strong> {{PACCHETTO}}</li>
            <li><strong>Assistito:</strong> {{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}}</li>
          </ul>
        </div>

        <h4 style="color: #1f2937; margin: 40px 0 25px 0">Documentazione Allegata</h4>

        <div class="doc-grid">
          <div class="doc-card">
            <h5>Brochure TeleMedCare</h5>
            <ul>
              <li>Panoramica completa dei servizi</li>
              <li>Vantaggi della telemedicina</li>
              <li>Confronto tra i pacchetti</li>
            </ul>
          </div>

          {{#if MANUALE_RICHIESTO}}
          <div class="doc-card">
            <h5>Manuale Utente</h5>
            <ul>
              <li>Guida all''installazione</li>
              <li>Utilizzo del dispositivo</li>
              <li>Contatti tecnici</li>
            </ul>
          </div>
          {{/if}}
        </div>

        <div class="highlight-box">
          <h4 style="color: #16a34a; margin-top: 0">Pacchetto {{PACCHETTO}} Selezionato</h4>
          <p><strong>Investimento:</strong> {{PREZZO_PIANO}}</p>
          <p>
            Il pacchetto {{PACCHETTO}} � perfetto per le esigenze di {{NOME_ASSISTITO}} e offre un supporto medico
            completo e personalizzato.
          </p>
        </div>

        <div class="contact-box">
          <h4 style="color: #475569; margin-top: 0"> Contatti</h4>
          <p><strong>E-MAIL:</strong> <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="dab3b4bcb59ab7bfbeb3b9bbbdb8f4b3ae">[email&#160;protected]</a></p>
          <p><strong>Telefono commerciale:</strong> 335 7301206</p>
          <p><strong>Telefono tecnico:</strong> 331 64 32 390</p>
        </div>

        <p>Siamo lieti di accompagnarLa in questo importante passo verso una maggiore sicurezza e tranquillit�.</p>

        <p><strong>Cordiali saluti,</strong><br>Il Team TeleMedCare</p>
      </div>

      <div class="footer-standard">
        <p><strong>Medica GB S.r.l.</strong> - Startup Innovativa a Vocazione Sociale</p>
        <p>Milano: Corso Garibaldi 34, 20121 | Genova: Via delle Eriche 53, 16148</p>
        <p>P.IVA: 12435130963 | <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="b3daddd5dcf3ded6d7dad0d2d4d19ddac7">[email&#160;protected]</a> | www.medicagb.it</p>
      </div>
    </div>
  

<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script></body></html>',
    '["NOME_RICHIEDENTE", "COGNOME_RICHIEDENTE", "TIPO_SERVIZIO", "LINK_BROCHURE", "LINK_MANUALE"]',
    'Documentazione TelemedCare - {{TIPO_SERVIZIO}}',
    'TelemedCare',
    1,
    0,
    'system'
);

INSERT INTO document_templates (
    name, category, description, version,
    html_content, variables,
    subject, from_name,
    active, is_default, author
) VALUES (
    'email_invio_contratto',
    'EMAIL',
    'Email con contratto da firmare digitalmente',
    '1.0',
    '<!DOCTYPE html>
<html lang="it" data-theme="light">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Template Email TeleMedCare - Medica GB S.r.l.</title>
<link href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<style>
      body {
        max-width: 880px;
        margin: 0 auto;
        padding: 32px 80px;
        position: relative;
        box-sizing: border-box;
        font-family: ''Inter'', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #ffffff;
      }

      .template-section {
        margin-bottom: 60px;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 40px;
      }

      .template-title {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 20px;
        margin: 0 -20px 30px -20px;
        border-radius: 8px;
        font-size: 20px;
        font-weight: 600;
      }

      .email-container {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        margin: 20px 0;
      }

      .email-header {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 30px 25px;
        text-align: center;
      }

      .email-content {
        padding: 30px 25px;
      }

      .contact-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 20px;
        margin: 20px 0;
      }

      .highlight-box {
        background: #ecfdf5;
        border: 2px solid #22c55e;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .warning-box {
        background: #fef3c7;
        border: 2px solid #f59e0b;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .info-box {
        background: #f0f9ff;
        border-left: 4px solid #3b82f6;
        padding: 20px;
        margin: 20px 0;
      }

      .comparison-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        background: white;
        border: 1px solid #e0e0e0;
      }

      .comparison-table th {
        background: #3b82f6;
        color: white;
        padding: 15px;
        text-align: center;
        font-weight: bold;
      }

      .comparison-table td {
        padding: 12px 15px;
        border-bottom: 1px solid #e5e7eb;
        vertical-align: top;
      }

      .comparison-table tr:nth-child(even) {
        background: #f8faff;
      }

      .footer-standard {
        background: #1f2937;
        color: white;
        padding: 20px;
        text-align: center;
        font-size: 14px;
      }
    </style>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Open%20Sans:wght@400&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Noto%20Sans%20JP:wght@400&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400&amp;display=swap" rel="stylesheet"/></head>
<body>


<div class="email-container">
<div class="email-header" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #22c55e 100%)">
<h3 style="margin: 0; font-size: 24px">Medica GB S.r.l.</h3>
<p style="margin: 10px 0 0 0">Startup Innovativa a Vocazione Sociale</p>
<div style="font-size: 14px; opacity: 0.8">"La tecnologia che Le salva salute e vita"</div>
</div>
<div class="email-content">
<h3 style="color: #1e40af; margin-top: 0">Gentile {{NOME_CLIENTE}},</h3>
<p>
            Siamo lieti di accompagnarLa in questo importante passo verso una maggiore sicurezza e tranquillità. Come
            promesso, Le inviamo in allegato il <strong>contratto per il servizio {{PIANO_SERVIZIO}}</strong> e la
            <strong>brochure aziendale</strong> con tutti i dettagli sui nostri servizi innovativi.
          </p>
<div class="info-box">
<h4 style="color: #3b82f6; margin-top: 0">📋 Il Suo piano TeleMedCare {{PIANO_SERVIZIO}}</h4>
<ul>
<li><strong>Piano:</strong> {{PIANO_SERVIZIO}}</li>
<li><strong>Investimento:</strong> {{PREZZO_PIANO}}</li>
<li><strong>Codice Cliente:</strong> {{CODICE_CLIENTE}}</li>
</ul>
</div>
<div style="margin: 20px 0">
<h4 style="color: #1f2937">⭐ Perché ha fatto la scelta giusta</h4>
<ul>
<li>
<strong>Innovazione Sociale:</strong> Sta supportando una startup innovativa a vocazione sociale che
                cambia il paradigma della cura tradizionale
              </li>
<li>
<strong>Assistenza Domiciliare:</strong> Riceve cure e monitoraggio direttamente dove serve, senza
                doversi spostare
              </li>
<li>
<strong>Tecnologia Avanzata:</strong> Dispositivo medicale certificato Classe IIa con funzionalità
                all''avanguardia
              </li>
</ul>
</div>
<div class="highlight-box">
<h4 style="color: #16a34a; margin-top: 0">📝 Prossimi passi per l''attivazione</h4>
<ol>
<li>Legga attentamente il contratto allegato</li>
<li>Firmi in ogni pagina richiesta e nell''ultima pagina</li>
<li>Ci invii il contratto firmato via email o WhatsApp</li>
<li>Riceverà il dispositivo entro 10 giorni lavorativi</li>
</ol>
</div>
<div class="warning-box">
<h4 style="color: #d97706; margin-top: 0">💰 Vantaggi Economici e Fiscali</h4>
<ul>
<li><strong>✅ Detrazione Fiscale 19%:</strong> Il servizio è detraibile come spesa sanitaria nel 730</li>
<li><strong>✅ Possibili Rimborsi INPS:</strong> Per ISEE sotto €6.000 + Legge 104</li>
</ul>
</div>
<div class="contact-box">
<h4 style="color: #475569; margin-top: 0">📞 Contatti</h4>
<p><strong>E-MAIL:</strong> <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="c9a0a7afa689a4acada0aaa8aeabe7a0bd">[email&#160;protected]</a></p>
<p><strong>Telefono commerciale:</strong> 335 7301206</p>
<p>
<strong>Telefono tecnico:</strong> 331 64 32 390<br/>
</p>
</div>
<p>
            Siamo qui per accompagnarLa in ogni step di questo percorso. Non esiti a contattarci per qualsiasi
            chiarimento o domanda. La Sua sicurezza e tranquillità sono la nostra priorità.
          </p>
<p><strong>Benvenuto/a nella famiglia TeleMedCare!</strong><br/>Il Team TeleMedCare</p>
</div>
<div class="footer-standard">
<p><strong>Medica GB S.r.l.</strong> - Startup Innovativa a Vocazione Sociale</p>
<p>Milano: Corso Garibaldi 34, 20121 | Genova: Via delle Eriche 53, 16148</p>
<p>P.IVA: 12435130963 | <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="30595e565f705d555459535157521e5944">[email&#160;protected]</a> | www.medicagb.it</p>
</div>
</div>
</div>
<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script></body>
</html>',
    '["NOME_RICHIEDENTE", "COGNOME_RICHIEDENTE", "CODICE_CONTRATTO", "TIPO_CONTRATTO", "PREZZO_MENSILE", "DURATA_MESI", "LINK_FIRMA", "SCADENZA_FIRMA"]',
    'Contratto TelemedCare - {{CODICE_CONTRATTO}}',
    'TelemedCare',
    1,
    0,
    'system'
);

INSERT INTO document_templates (
    name, category, description, version,
    html_content, variables,
    subject, from_name,
    active, is_default, author
) VALUES (
    'email_invio_proforma',
    'EMAIL',
    'Email con proforma per pagamento',
    '1.0',
    '<!DOCTYPE html>
<html lang="it" data-theme="light">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Template Email TeleMedCare - Medica GB S.r.l.</title>
<link href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<style>
      body {
        max-width: 880px;
        margin: 0 auto;
        padding: 32px 80px;
        position: relative;
        box-sizing: border-box;
        font-family: ''Inter'', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #ffffff;
      }

      .template-section {
        margin-bottom: 60px;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 40px;
      }

      .template-title {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 20px;
        margin: 0 -20px 30px -20px;
        border-radius: 8px;
        font-size: 20px;
        font-weight: 600;
      }

      .email-container {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        margin: 20px 0;
      }

      .email-header {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 30px 25px;
        text-align: center;
      }

      .email-content {
        padding: 30px 25px;
      }

      .contact-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 20px;
        margin: 20px 0;
      }

      .highlight-box {
        background: #ecfdf5;
        border: 2px solid #22c55e;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .warning-box {
        background: #fef3c7;
        border: 2px solid #f59e0b;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .info-box {
        background: #f0f9ff;
        border-left: 4px solid #3b82f6;
        padding: 20px;
        margin: 20px 0;
      }

      .comparison-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        background: white;
        border: 1px solid #e0e0e0;
      }

      .comparison-table th {
        background: #3b82f6;
        color: white;
        padding: 15px;
        text-align: center;
        font-weight: bold;
      }

      .comparison-table td {
        padding: 12px 15px;
        border-bottom: 1px solid #e5e7eb;
        vertical-align: top;
      }

      .comparison-table tr:nth-child(even) {
        background: #f8faff;
      }

      .footer-standard {
        background: #1f2937;
        color: white;
        padding: 20px;
        text-align: center;
        font-size: 14px;
      }
    </style>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Open%20Sans:wght@400&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Noto%20Sans%20JP:wght@400&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400&amp;display=swap" rel="stylesheet"/></head>
<body>


<div class="email-container">
<div class="email-header">
<h3 style="margin: 0; font-size: 24px">Medica GB S.r.l.</h3>
<p style="margin: 10px 0 0 0">Startup Innovativa a Vocazione Sociale</p>
<div style="font-size: 14px; opacity: 0.9">"La tecnologia che Le salva salute e vita"</div>
</div>
<div class="email-content">
<h3 style="color: #1e40af; margin-top: 0">Gentile {{NOME_CLIENTE}},</h3>
<p>
            È con grande piacere che Le inviamo la <strong>Pro-forma TeleMedCare</strong>, una soluzione
            innovativa che rappresenta un vero cambiamento di paradigma nell''assistenza socio-sanitaria.
          </p>
<div class="highlight-box">
<h4 style="color: #16a34a; margin-top: 0">📋 Pro-forma {{PIANO_SERVIZIO}}</h4>
<p><strong>Numero Pro-forma:</strong> {{NUMERO_PROFORMA}}</p>
<p style="font-size: 20px; font-weight: bold; color: #16a34a">{{PREZZO_PIANO}}</p>
<p style="margin: 0"><em>Investimento annuale per la Sua sicurezza e tranquillità</em></p>
</div>
<div style="
              background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
              border: 1px solid #22c55e;
            ">
<h4 style="color: #16a34a; margin-top: 0">🌟 La Nostra Mission Sociale</h4>
<p>
<strong>Medica GB</strong> nasce dal desiderio di apportare innovazione in ambito socio-sanitario,
              modificando il paradigma tradizionale:
              <em>non più le persone che si recano nei luoghi di cura, ma la tecnologia che arriva direttamente dove c''è
                necessità di assistenza.</em>
</p>
</div>
<div class="contact-box">
<h4 style="color: #475569; margin-top: 0">📞 Contatti</h4>
<p><strong>E-MAIL:</strong> <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="4e272028210e232b2a272d2f292c60273a">[email&#160;protected]</a></p>
<p><strong>Telefono commerciale:</strong> 335 7301206</p>
<p>
<strong>Telefono tecnico:</strong> 331 64 32 390<br/>
</p>
</div>
<p>
<strong>Cordiali saluti,</strong><br/>Il Team TeleMedCare<br/><em>"La tecnologia che Le salva salute e vita"</em>
</p>
</div>
<div class="footer-standard">
<p><strong>Medica GB S.r.l.</strong> - Startup Innovativa a Vocazione Sociale</p>
<p>Milano: Corso Garibaldi 34, 20121 | Genova: Via delle Eriche 53, 16148</p>
<p>P.IVA: 12435130963 | <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="1a73747c755a777f7e73797b7d7834736e">[email&#160;protected]</a> | www.medicagb.it</p>
</div>
</div>
</div>
<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script></body>
</html>',
    '["NOME_CLIENTE", "COGNOME_CLIENTE", "NUMERO_PROFORMA", "DATA_EMISSIONE", "DATA_SCADENZA", "SCADENZA_PAGAMENTO", "TIPO_SERVIZIO", "PREZZO_MENSILE", "DURATA_MESI", "PREZZO_TOTALE", "IMPORTO_TOTALE", "IBAN", "CAUSALE", "LINK_PAGAMENTO", "LINK_PROFORMA_PDF"]',
    'Proforma {{NUMERO_PROFORMA}} - TelemedCare',
    'TelemedCare Amministrazione',
    1,
    0,
    'system'
);

INSERT INTO document_templates (
    name, category, description, version,
    html_content, variables,
    subject, from_name,
    active, is_default, author
) VALUES (
    'email_benvenuto',
    'EMAIL',
    'Email di benvenuto dopo pagamento con link configurazione',
    '1.0',
    '<!DOCTYPE html>
<html lang="it" data-theme="light">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Template Email TeleMedCare - Medica GB S.r.l.</title>
<link href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<style>
      body {
        max-width: 880px;
        margin: 0 auto;
        padding: 32px 80px;
        position: relative;
        box-sizing: border-box;
        font-family: ''Inter'', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #ffffff;
      }

      .template-section {
        margin-bottom: 60px;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 40px;
      }

      .template-title {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 20px;
        margin: 0 -20px 30px -20px;
        border-radius: 8px;
        font-size: 20px;
        font-weight: 600;
      }

      .email-container {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        margin: 20px 0;
      }

      .email-header {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 30px 25px;
        text-align: center;
      }

      .email-content {
        padding: 30px 25px;
      }

      .contact-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 20px;
        margin: 20px 0;
      }

      .highlight-box {
        background: #ecfdf5;
        border: 2px solid #22c55e;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .warning-box {
        background: #fef3c7;
        border: 2px solid #f59e0b;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .info-box {
        background: #f0f9ff;
        border-left: 4px solid #3b82f6;
        padding: 20px;
        margin: 20px 0;
      }

      .comparison-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        background: white;
        border: 1px solid #e0e0e0;
      }

      .comparison-table th {
        background: #3b82f6;
        color: white;
        padding: 15px;
        text-align: center;
        font-weight: bold;
      }

      .comparison-table td {
        padding: 12px 15px;
        border-bottom: 1px solid #e5e7eb;
        vertical-align: top;
      }

      .comparison-table tr:nth-child(even) {
        background: #f8faff;
      }

      .footer-standard {
        background: #1f2937;
        color: white;
        padding: 20px;
        text-align: center;
        font-size: 14px;
      }
    </style>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Open%20Sans:wght@400&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Noto%20Sans%20JP:wght@400&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400&amp;display=swap" rel="stylesheet"/></head>
<body>


<div class="email-container">
<div class="email-header">
<h3 style="margin: 0; font-size: 24px">TeleMedCare</h3>
<p style="margin: 10px 0 0 0">Medica GB S.r.l.</p>
<div style="font-size: 14px; opacity: 0.9">La tecnologia che Le salva salute e vita</div>
</div>
<div class="email-content">
<h3 style="color: #1e40af; margin-top: 0">Benvenuto/a {{NOME_CLIENTE}}!</h3>
<div class="highlight-box">
<h4 style="color: #16a34a; margin-top: 0">🎉 Congratulazioni per la Sua scelta!</h4>
<p>
              Ha scelto il nostro servizio <strong>{{PIANO_SERVIZIO}}</strong> e ora fa parte della famiglia
              TeleMedCare.
            </p>
<p style="font-size: 18px; margin: 0"><strong>La Sua sicurezza è la nostra priorità!</strong></p>
</div>
<div class="info-box">
<h4 style="color: #3b82f6; margin-top: 0">📋 Riepilogo del Suo servizio:</h4>
<ul>
<li><strong>Piano:</strong> {{PIANO_SERVIZIO}}</li>
<li><strong>Costo:</strong> {{COSTO_SERVIZIO}}</li>
<li><strong>Data Attivazione:</strong> {{DATA_ATTIVAZIONE}}</li>
<li><strong>Codice Cliente:</strong> {{CODICE_CLIENTE}}</li>
</ul>
<p><strong>Servizi inclusi nel Suo piano:</strong></p>
<div style="margin-left: 20px">{{SERVIZI_INCLUSI}}</div>
</div>
<div class="warning-box">
<h4 style="color: #d97706; margin-top: 0">🚀 I prossimi passi:</h4>
<ol>
<li><strong>Consegna Dispositivo:</strong> Riceverà il dispositivo SiDLY entro 10 giorni lavorativi</li>
<li><strong>Configurazione:</strong> Riceverà una e-mail per la configurazione personalizzata</li>
<li>
<strong>Training:</strong> Sessione di formazione gratuita per imparare ad usare il dispositivo tramite
                Tutorial
              </li>
<li>
<strong>Attivazione esclusivamente per Servizio Avanzato:</strong> Verrà contattato dalla Centrale Operativa per il test completo di funzionamento
              </li>
</ol>
</div>
<div class="contact-box">
<h4 style="color: #475569; margin-top: 0">📞 Contatti</h4>
<p><strong>E-MAIL:</strong> <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="167f787079567b73727f75777174387f62">[email&#160;protected]</a></p>
<p><strong>Telefono commerciale:</strong> 335 7301206</p>
<p>
<strong>Telefono tecnico:</strong> 331 64 32 390<br/>
</p>
</div>
<p>
            Siamo lieti di averLa con noi e non vediamo l''ora di offrirLe la tranquillità e la sicurezza che merita.
          </p>
<p><strong>Benvenuto/a nella famiglia TeleMedCare!</strong><br/>Il Team TeleMedCare</p>
</div>
<div class="footer-standard">
<p><strong>Medica GB S.r.l.</strong> - Startup Innovativa a Vocazione Sociale</p>
<p>Milano: Corso Garibaldi 34, 20121 | Genova: Via delle Eriche 53, 16148</p>
<p>P.IVA: 12435130963 | <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="244d4a424b644941404d474543460a4d50">[email&#160;protected]</a> | www.medicagb.it</p>
</div>
</div>
</div>
<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script></body>
</html>',
    '["NOME_RICHIEDENTE", "COGNOME_RICHIEDENTE", "NOME_ASSISTITO", "COGNOME_ASSISTITO", "TIPO_SERVIZIO", "LINK_CONFIGURAZIONE", "NUMERO_SUPPORTO"]',
    'Benvenuto in TelemedCare!',
    'TelemedCare Team',
    1,
    0,
    'system'
);

INSERT INTO document_templates (
    name, category, description, version,
    html_content, variables,
    subject, from_name,
    active, is_default, author
) VALUES (
    'email_conferma',
    'EMAIL',
    'Email di conferma generica (deprecated - sostituito da email_configurazione)',
    '1.0',
    '<!DOCTYPE html>
<html lang="it" data-theme="light">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Template Email TeleMedCare - Medica GB S.r.l.</title>
<link href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<style>
      body {
        max-width: 880px;
        margin: 0 auto;
        padding: 32px 80px;
        position: relative;
        box-sizing: border-box;
        font-family: ''Inter'', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #ffffff;
      }

      .template-section {
        margin-bottom: 60px;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 40px;
      }

      .template-title {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 20px;
        margin: 0 -20px 30px -20px;
        border-radius: 8px;
        font-size: 20px;
        font-weight: 600;
      }

      .email-container {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        margin: 20px 0;
      }

      .email-header {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 30px 25px;
        text-align: center;
      }

      .email-content {
        padding: 30px 25px;
      }

      .contact-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 20px;
        margin: 20px 0;
      }

      .highlight-box {
        background: #ecfdf5;
        border: 2px solid #22c55e;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .warning-box {
        background: #fef3c7;
        border: 2px solid #f59e0b;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .info-box {
        background: #f0f9ff;
        border-left: 4px solid #3b82f6;
        padding: 20px;
        margin: 20px 0;
      }

      .comparison-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        background: white;
        border: 1px solid #e0e0e0;
      }

      .comparison-table th {
        background: #3b82f6;
        color: white;
        padding: 15px;
        text-align: center;
        font-weight: bold;
      }

      .comparison-table td {
        padding: 12px 15px;
        border-bottom: 1px solid #e5e7eb;
        vertical-align: top;
      }

      .comparison-table tr:nth-child(even) {
        background: #f8faff;
      }

      .footer-standard {
        background: #1f2937;
        color: white;
        padding: 20px;
        text-align: center;
        font-size: 14px;
      }
    </style>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Open%20Sans:wght@400&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Noto%20Sans%20JP:wght@400&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400&amp;display=swap" rel="stylesheet"/></head>
<body>


<div class="email-container">
<div class="email-header" style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%)">
<h3 style="margin: 0; font-size: 24px">✅ SERVIZIO ATTIVO</h3>
<p style="margin: 10px 0 0 0">TeleMedCare - Medica GB S.r.l.</p>
<div style="font-size: 14px; opacity: 0.9">Il Suo dispositivo è operativo!</div>
</div>
<div class="email-content">
<h3 style="color: #1e40af; margin-top: 0">Gentile {{NOME_CLIENTE}},</h3>
<div class="highlight-box">
<h4 style="color: #16a34a; margin-top: 0">🎉 Il Suo servizio è ora ATTIVO!</h4>
<p>Il dispositivo SiDLY è configurato e funzionante. È ora protetto/a H24!</p>
<p><strong>Data Attivazione:</strong> {{DATA_ATTIVAZIONE}}</p>
</div>
<div class="info-box">
<h4 style="color: #3b82f6; margin-top: 0">📱 Informazioni Dispositivo</h4>
<ul>
<li><strong>Dispositivo:</strong> SiDLY - Classe IIa Certificato</li>
<li><strong>Codice Dispositivo:</strong> {{CODICE_DISPOSITIVO}}</li>
<li><strong>Piano Attivo:</strong> {{PIANO_SERVIZIO}}</li>
<li><strong>Scadenza Servizio:</strong> {{DATA_SCADENZA}}</li>
</ul>
</div>
<div class="warning-box">
<h4 style="color: #d97706; margin-top: 0">⚠️ Informazioni Importanti</h4>
<ul>
<li><strong>Indossi sempre il dispositivo:</strong> Solo così può proteggerLa efficacemente</li>
<li>
<strong>Ricarica quotidiana:</strong> Metta in carica ogni sera per 2-3 ore oppure lo metta in carica
                ogni giorno quando non è da solo/a in casa
              </li>
<li><strong>Aggiornamenti automatici:</strong> Il dispositivo si aggiorna da solo</li>
</ul>
</div>
<div style="background: #e0f2fe; padding: 20px; border-radius: 6px; border: 1px solid #0ea5e9; margin: 20px 0">
<h4 style="color: #0369a1; margin-top: 0">🆘 Come Funziona il Pulsante SOS</h4>
<ol>
<li><strong>Emergenza:</strong> Prema e tenga premuto il pulsante rosso per 3 secondi</li>
<li><strong>Invio Automatico:</strong> Viene inviato allarme con la Sua posizione GPS</li>
<li>
<strong>Contatti Immediati:</strong> Vengono avvisati familiari{{#if SERVIZIO_AVANZATO}} e la Centrale
                Operativa{{/if}}
              </li>
<li><strong>Comunicazione:</strong> Può parlare direttamente attraverso il dispositivo</li>
</ol>
</div>
<div class="contact-box">
<h4 style="color: #475569; margin-top: 0">📞 Contatti</h4>
<p><strong>E-MAIL:</strong> <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="81e8efe7eec1ece4e5e8e2e0e6e3afe8f5">[email&#160;protected]</a></p>
<p><strong>Telefono commerciale:</strong> 335 7301206</p>
<p>
<strong>Telefono tecnico:</strong> 331 64 32 390<br/>
</p>
</div>
<div style="background: #f0fdf4; padding: 20px; border-radius: 6px; border: 1px solid #22c55e; margin: 20px 0">
<h4 style="color: #16a34a; margin-top: 0">💚 Stia Tranquillo/a</h4>
<p style="text-align: center; font-size: 18px; margin: 0">
<strong>È ora protetto/a H24 con la tecnologia SiDLY!</strong><br/>
<em>La Sua sicurezza è la nostra missione.</em>
</p>
</div>
<p>Il Team TeleMedCare è sempre a Sua disposizione per qualsiasi necessità o domanda.</p>
<p><strong>Il Team TeleMedCare</strong></p>
</div>
<div class="footer-standard">
<p><strong>Medica GB S.r.l.</strong> - Startup Innovativa a Vocazione Sociale</p>
<p>Milano: Corso Garibaldi 34, 20121 | Genova: Via delle Eriche 53, 16148</p>
<p>P.IVA: 12435130963 | <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="355c5b535a755850515c565452571b5c41">[email&#160;protected]</a> | www.medicagb.it</p>
</div>
</div>
</div>
<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script></body>
</html>',
    '["NOME_CLIENTE", "COGNOME_CLIENTE"]',
    'Conferma Attivazione TelemedCare',
    'TelemedCare',
    1,
    0,
    'system'
);

INSERT INTO document_templates (
    name, category, description, version,
    html_content, variables,
    subject, from_name,
    active, is_default, author
) VALUES (
    'email_conferma_attivazione',
    'EMAIL',
    'Email di conferma attivazione servizio dopo associazione dispositivo',
    '1.0',
    '<!doctype html>
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
              <p class="muted"> Il Suo servizio � ora <strong>ATTIVO</strong>!</p>

              <!-- Activation message -->
              <div class="section">
                <p>Il dispositivo <strong>SiDLY</strong> � configurato e funzionante. � ora protetto/a H24!</p>
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
                  <li><strong>Indossi sempre il dispositivo:</strong> Solo cos� pu� proteggerLa efficacemente</li>
                  <li><strong>Ricarica quotidiana:</strong> Metta in carica ogni sera per 2-3 ore oppure metta in carica ogni giorno quando non � da solo/a in casa</li>
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
                  <li><strong>Comunicazione:</strong> Pu� parlare direttamente attraverso il dispositivo</li>
                </ol>
              </div>

              <!-- Reassurance -->
              <div class="section">
                <h2> Stia Tranquillo/a</h2>
                <p><strong>� ora protetto/a H24 con la tecnologia SiDLY!</strong></p>
                <p class="muted"><em>La Sua sicurezza � la nostra missione.</em></p>

                <p class="signature">Il Team TeleMedCare</p>
                <p class="muted">Il Team TeleMedCare � sempre a Sua disposizione per qualsiasi necessit� o domanda.</p>
              </div>

            </td>
          </tr>
          <tr>
            <td class="footer" align="center">
              TeleMedCare � Assistenza 24/7 � <span style="color:#0b2545;font-weight:600">support@telemedcare.it</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
    '["NOME_ASSISTITO", "COGNOME_ASSISTITO", "TIPO_SERVIZIO", "DATA_ATTIVAZIONE", "MODELLO_DISPOSITIVO", "IMEI_DISPOSITIVO", "NUMERO_SIM", "NUMERO_SUPPORTO", "EMAIL_SUPPORTO"]',
    'Servizio Attivato - TelemedCare',
    'TelemedCare Team',
    1,
    0,
    'system'
);

INSERT INTO document_templates (
    name, category, description, version,
    html_content, variables,
    subject, from_name,
    active, is_default, author
) VALUES (
    'email_configurazione',
    'EMAIL',
    'Email per invio form configurazione compilato dal richiedente a info@',
    '1.0',
    '<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurazione SiDLY CARE - Benvenuto | Medica GB</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ''Poppins'', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            padding: 1rem 0;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .logo {
            font-size: 2rem;
            font-weight: 700;
            color: #2563eb;
            margin-right: 1rem;
        }
        
        .company-info {
            text-align: center;
        }
        
        .company-name {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 0.25rem;
        }
        
        .company-subtitle {
            font-size: 0.9rem;
            color: #64748b;
            font-weight: 400;
        }
        
        .main-content {
            padding: 3rem 0;
        }
        
        .welcome-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 3rem 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .success-icon {
            font-size: 4rem;
            color: #10b981;
            margin-bottom: 1.5rem;
        }
        
        .welcome-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 1rem;
            line-height: 1.2;
        }
        
        .welcome-subtitle {
            font-size: 1.2rem;
            color: #64748b;
            margin-bottom: 2rem;
            font-weight: 400;
        }
        
        .process-steps {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 15px;
            padding: 2rem;
            margin-bottom: 2rem;
        }
        
        .steps-title {
            font-size: 1.8rem;
            font-weight: 600;
            color: #1e40af;
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .step {
            display: flex;
            align-items: center;
            padding: 1.5rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            border-left: 5px solid #3b82f6;
        }
        
        .step-number {
            background: #3b82f6;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            margin-right: 1.5rem;
            flex-shrink: 0;
        }
        
        .step-content h3 {
            font-size: 1.2rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }
        
        .step-content p {
            color: #64748b;
            line-height: 1.5;
        }
        
        .info-box {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #93c5fd;
            border-radius: 12px;
            padding: 1.5rem;
            margin: 2rem 0;
        }
        
        .info-icon {
            color: #2563eb;
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
        
        .info-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 1rem;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
        }
        
        .info-list li {
            padding: 0.5rem 0;
            color: #1e40af;
            display: flex;
            align-items: center;
        }
        
        .info-list li i {
            color: #10b981;
            margin-right: 0.75rem;
            width: 20px;
        }
        
        .cta-section {
            text-align: center;
            padding: 2rem 0;
        }
        
        .cta-button {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 1rem 2.5rem;
            border-radius: 50px;
            font-size: 1.2rem;
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
        }
        
        .cta-button i {
            margin-left: 0.5rem;
            font-size: 1.1rem;
        }
        
        .security-note {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid #10b981;
            border-radius: 10px;
            padding: 1rem;
            margin-top: 2rem;
            text-align: center;
        }
        
        .security-note i {
            color: #10b981;
            font-size: 1.2rem;
            margin-right: 0.5rem;
        }
        
        .security-text {
            color: #047857;
            font-weight: 500;
        }
        
        @media (max-width: 768px) {
            .welcome-card {
                padding: 2rem 1rem;
            }
            
            .welcome-title {
                font-size: 2rem;
            }
            
            .step {
                flex-direction: column;
                text-align: center;
            }
            
            .step-number {
                margin-right: 0;
                margin-bottom: 1rem;
            }
            
            .process-steps {
                padding: 1.5rem;
            }
        }
        
        @media (max-width: 480px) {
            .container {
                padding: 0 15px;
            }
            
            .welcome-title {
                font-size: 1.8rem;
            }
            
            .welcome-subtitle {
                font-size: 1rem;
            }
            
            .cta-button {
                padding: 0.8rem 2rem;
                font-size: 1.1rem;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="logo-section">
                <div class="logo">
                    <i class="fas fa-heartbeat"></i>
                </div>
                <div class="company-info">
                    <div class="company-name">Medica GB S.r.l.</div>
                    <div class="company-subtitle">Startup Innovativa a Vocazione Sociale</div>
                </div>
            </div>
        </div>
    </header>

    <main class="main-content">
        <div class="container">
            <div class="welcome-card">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h1 class="welcome-title">Benvenuto nel tuo SiDLY CARE</h1>
                <p class="welcome-subtitle">
                    Grazie per aver scelto la nostra tecnologia di teleassistenza avanzata.<br>
                    Il pagamento � stato elaborato con successo!
                </p>
                
                <div class="info-box">
                    <div class="info-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <h3 class="info-title">Cosa succede ora?</h3>
                    <ul class="info-list">
                        <li><i class="fas fa-check"></i> Il tuo ordine � stato confermato</li>
                        <li><i class="fas fa-check"></i> Riceverai una email di conferma</li>
                        <li><i class="fas fa-check"></i> Il dispositivo SiDLY sar� configurato per te</li>
                        <li><i class="fas fa-check"></i> Riceverai istruzioni per l''attivazione</li>
                    </ul>
                </div>
            </div>

            <div class="process-steps">
                <h2 class="steps-title">
                    <i class="fas fa-cogs"></i> Configurazione Personalizzata
                </h2>
                
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h3>Compila il Form di Configurazione</h3>
                        <p>Per configurare al meglio il tuo dispositivo SiDLY CARE, abbiamo bisogno di alcune informazioni personali e mediche che ci permetteranno di personalizzare completamente il servizio.</p>
                    </div>
                </div>

                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h3>Configurazione Automatica</h3>
                        <p>I nostri tecnici configureranno automaticamente la piattaforma SiDLY CARE con i tuoi dati per garantire un servizio perfettamente personalizzato alle tue esigenze.</p>
                    </div>
                </div>

                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h3>Attivazione e Supporto</h3>
                        <p>Riceverai il dispositivo pre-configurato e le credenziali di accesso. Il nostro team ti contatter� per il supporto all''attivazione e la formazione iniziale.</p>
                    </div>
                </div>
            </div>

            <div class="info-box">
                <div class="info-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <h3 class="info-title">Tempo Richiesto</h3>
                <p style="color: #1e40af; font-weight: 500; margin: 0;">
                    La compilazione richiede circa <strong>5-8 minuti</strong>. I dati sono protetti secondo la normativa GDPR e utilizzati esclusivamente per la configurazione del tuo servizio SiDLY CARE.
                </p>
            </div>

            <div class="cta-section">
                <button class="cta-button" onclick="window.location.href=''sidly_care_configuration_form.html''">
                    Inizia Configurazione
                    <i class="fas fa-arrow-right"></i>
                </button>
                
                <div class="security-note">
                    <i class="fas fa-shield-alt"></i>
                    <span class="security-text">I tuoi dati sono protetti con crittografia SSL 256-bit</span>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Smooth scrolling per dispositivi mobile
        document.addEventListener(''DOMContentLoaded'', function() {
            // Animazione di ingresso per gli elementi
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = ''1'';
                        entry.target.style.transform = ''translateY(0)'';
                    }
                });
            });

            // Osserva tutti gli elementi con classe step
            document.querySelectorAll(''.step'').forEach(step => {
                step.style.opacity = ''0'';
                step.style.transform = ''translateY(30px)'';
                step.style.transition = ''all 0.6s ease'';
                observer.observe(step);
            });

            // Effetto hover per il bottone CTA su dispositivi touch
            const ctaButton = document.querySelector(''.cta-button'');
            if (ctaButton) {
                ctaButton.addEventListener(''touchstart'', function() {
                    this.style.transform = ''translateY(-2px)'';
                });
                
                ctaButton.addEventListener(''touchend'', function() {
                    setTimeout(() => {
                        this.style.transform = ''translateY(0)'';
                    }, 100);
                });
            }
        });

        // Verifica se siamo in modalit� standalone (PWA)
        function checkStandaloneMode() {
            const isStandalone = window.matchMedia(''(display-mode: standalone)'').matches;
            if (isStandalone) {
                document.body.style.paddingTop = ''20px'';
            }
        }

        checkStandaloneMode();
    </script>
</body>
</html>
    <script id="html_badge_script1">
        window.__genspark_remove_badge_link = "https://www.genspark.ai/api/html_badge/" +
            "remove_badge?token=To%2FBnjzloZ3UfQdcSaYfDv6kHDShosh4gGig0a9imBQGSZrGlBQBYSMZ4dv0eUsaioD4hNdAj%2Bixf42yjMrclCbuqW0M%2Bmf1mts10E6Lyd6XqmS2bIgpIEC5v1d7kifheQmK343S7z%2BrJ5yuJIXWcMw1lxQIQsR2A3Of0b818GzM7cFe7UzdkBoZWVo5XQ%2BcdjlToevIYlKrPCxt5Z1SEdUYa0iCQGZ9oQBZnsqwZaulcC5Kmc0nnx6vj9Gv3S%2B5jS61r0nMpf3zE50eHldR%2Bsl%2BQi7Fbz44Syt5DYpBArZGAVzMl0uXdHmw2wbDl9td%2BTXw9w5TeQ5AetLBw%2Bvcjv1xKasLafymADdFSxEdperfPq%2FldONxT8eaWdPgp5pCjHZv7EWp9dv0oTynCKQ6I%2BEpwZyEmzDV8BWrTOq4NTD8qdjdNWG%2BiVSgZ121a9EN74ClNE8r%2B6WFqmPMqAmKnmY6mtMVag4wp8JyTspklNlhmBkdJoWpaQC8G02pFPzL%2BJ3ETongEUFycln8t6Kyeg%3D%3D";
        window.__genspark_locale = "it-IT";
        window.__genspark_token = "To/BnjzloZ3UfQdcSaYfDv6kHDShosh4gGig0a9imBQGSZrGlBQBYSMZ4dv0eUsaioD4hNdAj+ixf42yjMrclCbuqW0M+mf1mts10E6Lyd6XqmS2bIgpIEC5v1d7kifheQmK343S7z+rJ5yuJIXWcMw1lxQIQsR2A3Of0b818GzM7cFe7UzdkBoZWVo5XQ+cdjlToevIYlKrPCxt5Z1SEdUYa0iCQGZ9oQBZnsqwZaulcC5Kmc0nnx6vj9Gv3S+5jS61r0nMpf3zE50eHldR+sl+Qi7Fbz44Syt5DYpBArZGAVzMl0uXdHmw2wbDl9td+TXw9w5TeQ5AetLBw+vcjv1xKasLafymADdFSxEdperfPq/ldONxT8eaWdPgp5pCjHZv7EWp9dv0oTynCKQ6I+EpwZyEmzDV8BWrTOq4NTD8qdjdNWG+iVSgZ121a9EN74ClNE8r+6WFqmPMqAmKnmY6mtMVag4wp8JyTspklNlhmBkdJoWpaQC8G02pFPzL+J3ETongEUFycln8t6Kyeg==";
    </script>
    
    <script id="html_notice_dialog_script" src="https://www.genspark.ai/notice_dialog.js"></script>
    ',
    '["NOME_RICHIEDENTE", "COGNOME_RICHIEDENTE", "EMAIL_RICHIEDENTE", "TELEFONO_RICHIEDENTE", "NOME_ASSISTITO", "COGNOME_ASSISTITO", "DATA_NASCITA_ASSISTITO", "CF_ASSISTITO", "INDIRIZZO", "CITTA", "CAP", "PROVINCIA", "CONTATTO_EMERGENZA_1_NOME", "CONTATTO_EMERGENZA_1_TEL", "CONTATTO_EMERGENZA_1_PARENTELA", "CONTATTO_EMERGENZA_2_NOME", "CONTATTO_EMERGENZA_2_TEL", "CONTATTO_EMERGENZA_2_PARENTELA", "MEDICO_CURANTE", "CENTRO_MEDICO", "CONDIZIONI_SALUTE", "NOTE_MEDICHE", "DATA_CONFIGURAZIONE"]',
    'Nuova Configurazione Cliente - {{NOME_RICHIEDENTE}} {{COGNOME_RICHIEDENTE}}',
    'TelemedCare Sistema',
    1,
    0,
    'system'
);

INSERT INTO document_templates (
    name, category, description, version,
    html_content, variables,
    subject, from_name,
    active, is_default, author
) VALUES (
    'form_configurazione',
    'FORM',
    'Form HTML per configurazione dati cliente dopo pagamento',
    '1.0',
    '<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurazione SiDLY CARE - Dati Cliente</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
    <style>
         {
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
        }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .form-section {
            border-left: 4px solid #3B82F6;
        }
    </style>
</head>
<body class="bg-gray-50 font-sans">
    <!-- Header -->
    <div class="gradient-bg text-white py-6 px-4">
        <div class="max-w-4xl mx-auto">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold">Configurazione SiDLY CARE</h1>
                    <p class="text-blue-100 mt-2">Completa i dati per l''attivazione del servizio</p>
                </div>
                <div class="text-right">
                    <img src="data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 100 40''%3E%3Ctext x=''50'' y=''25'' text-anchor=''middle'' fill=''white'' font-family=''Arial, sans-serif'' font-size=''12'' font-weight=''bold''%3EMedica GB%3C/text%3E%3C/svg%3E" alt="Medica GB" class="h-10">
                </div>
            </div>
        </div>
    </div>

    <!-- Form Container -->
    <div class="max-w-4xl mx-auto py-8 px-4">
        <form id="configurazione-form" class="space-y-8">
            <!-- Dati Anagrafici -->
            <div class="bg-white rounded-lg shadow-lg p-6 form-section">
                <div class="flex items-center mb-6">
                    <i class="fas fa-user text-blue-600 text-2xl mr-3"></i>
                    <h2 class="text-2xl font-bold text-gray-800">Dati Anagrafici</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                        <input type="text" id="nome" name="nome" value="Mario" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Cognome *</label>
                        <input type="text" id="cognome" name="cognome" value="Rossi" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Data di Nascita *</label>
                        <input type="date" id="data_nascita" name="data_nascita" value="1950-03-15" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Et�</label>
                        <input type="text" id="eta" name="eta" value="74 anni" readonly class="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
                        <input type="number" id="peso" name="peso" value="75" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Altezza (cm)</label>
                        <input type="number" id="altezza" name="altezza" value="170" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Telefono *</label>
                        <input type="tel" id="telefono" name="telefono" value="335 123 4567" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" id="email" name="email" value="mario.rossi@email.it" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Indirizzo *</label>
                        <input type="text" id="indirizzo" name="indirizzo" value="Via Roma 123, 20121 Milano (MI)" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
            </div>

            <!-- Contatti di Emergenza -->
            <div class="bg-white rounded-lg shadow-lg p-6 form-section">
                <div class="flex items-center mb-6">
                    <i class="fas fa-phone-alt text-red-600 text-2xl mr-3"></i>
                    <h2 class="text-2xl font-bold text-gray-800">Contatti di Emergenza</h2>
                </div>
                
                <!-- Contatto 1 -->
                <div class="mb-8">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm mr-2">1</span>
                        Contatto Primario *
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                            <input type="text" name="contatto1_nome" value="Anna" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Cognome</label>
                            <input type="text" name="contatto1_cognome" value="Rossi" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
                            <input type="tel" name="contatto1_telefono" value="347 987 6543" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                </div>

                <!-- Contatto 2 -->
                <div class="mb-8">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm mr-2">2</span>
                        Contatto Secondario
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                            <input type="text" name="contatto2_nome" value="Luca" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Cognome</label>
                            <input type="text" name="contatto2_cognome" value="Rossi" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
                            <input type="tel" name="contatto2_telefono" value="338 456 7890" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                </div>

                <!-- Contatto 3 -->
                <div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm mr-2">3</span>
                        Contatto Terziario
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                            <input type="text" name="contatto3_nome" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Cognome</label>
                            <input type="text" name="contatto3_cognome" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
                            <input type="tel" name="contatto3_telefono" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Condizioni Mediche -->
            <div class="bg-white rounded-lg shadow-lg p-6 form-section">
                <div class="flex items-center mb-6">
                    <i class="fas fa-heartbeat text-red-600 text-2xl mr-3"></i>
                    <h2 class="text-2xl font-bold text-gray-800">Condizioni Mediche</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="ipertensione" checked class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Ipertensione arteriosa</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="diabete" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Diabete</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="cardiopatia" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Cardiopatia</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="demenza" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Demenza/Alzheimer</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="ictus" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Ictus</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="parkinson" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Morbo di Parkinson</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="epilessia" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Epilessia</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="oncologica" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Patologia oncologica</span>
                    </label>
                </div>
                <div class="mt-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Altre patologie o note mediche</label>
                    <textarea name="altre_patologie" rows="3" placeholder="Inserisci altre condizioni mediche rilevanti..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                </div>
            </div>

            <!-- Farmaci -->
            <div class="bg-white rounded-lg shadow-lg p-6 form-section">
                <div class="flex items-center mb-6">
                    <i class="fas fa-pills text-green-600 text-2xl mr-3"></i>
                    <h2 class="text-2xl font-bold text-gray-800">Farmaci e Terapie</h2>
                </div>
                <div id="farmaci-container">
                    <div class="farmaco-item bg-gray-50 p-4 rounded-lg mb-4">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nome farmaco</label>
                                <input type="text" name="farmaco_nome[]" value="Ramipril" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Dosaggio</label>
                                <input type="text" name="farmaco_dosaggio[]" value="5 mg" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Orario</label>
                                <input type="time" name="farmaco_orario[]" value="08:00" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                        </div>
                    </div>
                </div>
                <button type="button" onclick="aggiungi_farmaco()" class="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    <i class="fas fa-plus mr-2"></i>Aggiungi farmaco
                </button>
            </div>

            <!-- Note aggiuntive -->
            <div class="bg-white rounded-lg shadow-lg p-6 form-section">
                <div class="flex items-center mb-6">
                    <i class="fas fa-sticky-note text-yellow-600 text-2xl mr-3"></i>
                    <h2 class="text-2xl font-bold text-gray-800">Note Aggiuntive</h2>
                </div>
                <textarea name="note_aggiuntive" rows="4" placeholder="Inserisci eventuali note aggiuntive, allergie, esigenze particolari..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>

            <!-- Submit Button -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="text-center">
                    <button type="submit" class="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">
                        <i class="fas fa-paper-plane mr-2"></i>Invia Configurazione
                    </button>
                    <p class="text-gray-600 mt-4">I dati verranno inviati in modo sicuro per la configurazione del dispositivo SiDLY CARE</p>
                </div>
            </div>
        </form>
    </div>

    <!-- Success Message -->
    <div id="success-message" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-md mx-4">
            <div class="text-center">
                <i class="fas fa-check-circle text-green-500 text-4xl mb-4"></i>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Configurazione Inviata!</h3>
                <p class="text-gray-600">I dati sono stati inviati correttamente. Riceverete conferma dell''attivazione entro 24 ore.</p>
                <button onclick="document.getElementById(''success-message'').classList.add(''hidden'')" class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Chiudi
                </button>
            </div>
        </div>
    </div>

    <script>
        // Initialize EmailJS
        emailjs.init(''-JEWqtrkLWqAEvuoW'');

        // Calculate age from birth date
        document.getElementById(''data_nascita'').addEventListener(''change'', function() {
            const birthDate = new Date(this.value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            document.getElementById(''eta'').value = age + '' anni'';
        });

        // Add new medication
        function aggiungi_farmaco() {
            const container = document.getElementById(''farmaci-container'');
            const newFarmaco = document.createElement(''div'');
            newFarmaco.className = ''farmaco-item bg-gray-50 p-4 rounded-lg mb-4'';
            newFarmaco.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nome farmaco</label>
                        <input type="text" name="farmaco_nome[]" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Dosaggio</label>
                        <input type="text" name="farmaco_dosaggio[]" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Orario</label>
                        <input type="time" name="farmaco_orario[]" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
                <button type="button" onclick="this.parentElement.remove()" class="mt-2 text-red-600 hover:text-red-800">
                    <i class="fas fa-trash mr-1"></i>Rimuovi
                </button>
            `;
            container.appendChild(newFarmaco);
        }

        // Handle form submission
        document.getElementById(''configurazione-form'').addEventListener(''submit'', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData(this);
            const data = {};
            
            // Basic fields
            for (let [key, value] of formData.entries()) {
                if (key.includes(''[]'')) {
                    const cleanKey = key.replace(''[]'', '''');
                    if (!data[cleanKey]) data[cleanKey] = [];
                    data[cleanKey].push(value);
                } else {
                    data[key] = value;
                }
            }
            
            // Prepare email data
            const emailData = {
                to_email: ''info@medicagb.it'',
                client_name: data.nome + '' '' + data.cognome,
                client_data: JSON.stringify(data, null, 2),
                submission_date: new Date().toLocaleDateString(''it-IT''),
                submission_time: new Date().toLocaleTimeString(''it-IT'')
            };
            
            // Send email notification
            emailjs.send(''service_ku6guc3'', ''template_6m9wx7t'', emailData)
                .then(function(response) {
                    console.log(''Email sent successfully:'', response);
                    document.getElementById(''success-message'').classList.remove(''hidden'');
                })
                .catch(function(error) {
                    console.log(''Email error:'', error);
                    alert(''Errore nell\''invio. Riprova pi� tardi.'');
                });
            
            // Here you would also send data to Google Sheets
            // This would typically be done via a Google Apps Script Web App
            console.log(''Configuration data:'', data);
        });

        // Auto-calculate age on page load
        document.addEventListener(''DOMContentLoaded'', function() {
            const birthDateInput = document.getElementById(''data_nascita'');
            if (birthDateInput.value) {
                birthDateInput.dispatchEvent(new Event(''change''));
            }
        });
    </script>
</body>
</html>
    <script id="html_badge_script1">
        window.__genspark_remove_badge_link = "https://www.genspark.ai/api/html_badge/" +
            "remove_badge?token=To%2FBnjzloZ3UfQdcSaYfDpgdMzdSNqKwZbxKIo%2FLBmp56R3AtKCsoDXUE2sZZeVgtPlM%2BJjo3sQEt9fSRLXseyROf1oNesW02dkWNv%2FdjVk3Q6QelrduR8sK0Pnf71mnQOhbBlJYBUxC%2B0%2F2jyWCOaKNaFT%2Bl9S5XJ%2BSs1dvugtyiZhILdNQ2yDk5FTttfOHUjsaW9HOepzzEoxKxZ1LRyQMK8m4Vi2W%2F3SOrMr4cNFvHcrszjgqGIh7v6a3xCJVTpwrd%2BDfNNV4SA4c7ai3k4i1v9QXqOcDk2KcIbE30LPLa2qCgdRinx3%2FvEJFyCbQRrAfwcJZwghwtHTX%2Bo1hwxU7YS3hliKbGVIx3%2F6mHI1tYuJM5yFvX5TfxZ42LX0jjvXB%2FcVh59MotZoj50mjCk6kD%2BLJbekrJELvhMWQRBFRm%2FqqHNrdTYwzYA0OD4u3cRDLY%2Fk4YyYw3uPZfSU9nMuRI1UjAYggsY6%2BWIt9pVumaTwFXV2n9NgOnBk1z7HK4hxFk8ekwZURE%2Bc8KcZJFY8991lmanmZ5O3ZERYWT9Y%3D";
        window.__genspark_locale = "it-IT";
        window.__genspark_token = "To/BnjzloZ3UfQdcSaYfDpgdMzdSNqKwZbxKIo/LBmp56R3AtKCsoDXUE2sZZeVgtPlM+Jjo3sQEt9fSRLXseyROf1oNesW02dkWNv/djVk3Q6QelrduR8sK0Pnf71mnQOhbBlJYBUxC+0/2jyWCOaKNaFT+l9S5XJ+Ss1dvugtyiZhILdNQ2yDk5FTttfOHUjsaW9HOepzzEoxKxZ1LRyQMK8m4Vi2W/3SOrMr4cNFvHcrszjgqGIh7v6a3xCJVTpwrd+DfNNV4SA4c7ai3k4i1v9QXqOcDk2KcIbE30LPLa2qCgdRinx3/vEJFyCbQRrAfwcJZwghwtHTX+o1hwxU7YS3hliKbGVIx3/6mHI1tYuJM5yFvX5TfxZ42LX0jjvXB/cVh59MotZoj50mjCk6kD+LJbekrJELvhMWQRBFRm/qqHNrdTYwzYA0OD4u3cRDLY/k4YyYw3uPZfSU9nMuRI1UjAYggsY6+WIt9pVumaTwFXV2n9NgOnBk1z7HK4hxFk8ekwZURE+c8KcZJFY8991lmanmZ5O3ZERYWT9Y=";
    </script>
    
    <script id="html_notice_dialog_script" src="https://www.genspark.ai/notice_dialog.js"></script>
    ',
    '["NOME_RICHIEDENTE", "COGNOME_RICHIEDENTE", "EMAIL_RICHIEDENTE", "TELEFONO_RICHIEDENTE", "NOME_ASSISTITO", "COGNOME_ASSISTITO", "LEAD_ID", "CONTRACT_ID"]',
    NULL,
    NULL,
    1,
    0,
    'system'
);

INSERT INTO document_templates (
    name, category, description, version,
    html_content, variables,
    subject, from_name,
    active, is_default, author
) VALUES (
    'automazione_lead',
    'FORM',
    'Sistema di automazione per importazione lead da email partner',
    '1.0',
    '<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Automazione Import Lead da Email Partner - TeleMedCare</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .process-step { position: relative; }
        .process-step::after { content: ''''; position: absolute; top: 50%; right: -20px; width: 0; height: 0; border-top: 8px solid transparent; border-bottom: 8px solid transparent; border-left: 16px solid #3B82F6; }
        .process-step:last-child::after { display: none; }
        .status-active { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    </style>
</head>
<body class="bg-gray-50 font-sans">
    <div class="container mx-auto px-4 py-6">
        <!-- Header -->
        <div class="gradient-bg text-white rounded-lg p-6 mb-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold mb-2">
                        <i class="fas fa-envelope-open-text mr-3"></i>
                        Automazione Import Lead da Email Partner
                    </h1>
                    <p class="text-blue-100">Sistema automatico per gestione lead da partner esterni con AI parsing e workflow completo</p>
                </div>
                <div class="text-right">
                    <div class="status-active bg-green-400 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        <i class="fas fa-circle mr-1"></i> Sistema Attivo
                    </div>
                    <div class="mt-2 text-blue-100">
                        <i class="fas fa-clock mr-1"></i> Ultimo check: 2 min fa
                    </div>
                </div>
            </div>
        </div>

        <!-- Status Dashboard -->
        <div class="grid grid-cols-4 gap-4 mb-6">
            <div class="bg-white rounded-lg p-4 shadow card-hover">
                <div class="flex items-center">
                    <div class="bg-blue-100 p-3 rounded-full">
                        <i class="fas fa-inbox text-blue-600 text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-gray-600 text-sm">Email Ricevute Oggi</p>
                        <p class="text-2xl font-bold text-gray-800">47</p>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-lg p-4 shadow card-hover">
                <div class="flex items-center">
                    <div class="bg-green-100 p-3 rounded-full">
                        <i class="fas fa-user-plus text-green-600 text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-gray-600 text-sm">Lead Estratti</p>
                        <p class="text-2xl font-bold text-gray-800">32</p>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-lg p-4 shadow card-hover">
                <div class="flex items-center">
                    <div class="bg-yellow-100 p-3 rounded-full">
                        <i class="fas fa-paper-plane text-yellow-600 text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-gray-600 text-sm">Landing Inviate</p>
                        <p class="text-2xl font-bold text-gray-800">28</p>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-lg p-4 shadow card-hover">
                <div class="flex items-center">
                    <div class="bg-purple-100 p-3 rounded-full">
                        <i class="fas fa-percentage text-purple-600 text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-gray-600 text-sm">Tasso Successo</p>
                        <p class="text-2xl font-bold text-gray-800">87.5%</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Workflow Process -->
        <div class="bg-white rounded-lg p-6 mb-6 shadow">
            <h2 class="text-xl font-bold mb-4 text-gray-800">
                <i class="fas fa-cogs mr-2 text-blue-600"></i>
                Processo Automatico Workflow
            </h2>
            <div class="flex items-center justify-between space-x-4">
                <div class="process-step bg-blue-50 p-4 rounded-lg text-center flex-1">
                    <div class="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">1</div>
                    <h3 class="font-semibold text-blue-700">Monitoraggio Email</h3>
                    <p class="text-xs text-gray-600 mt-1">IMAP/POP3 check ogni 30 sec</p>
                </div>
                <div class="process-step bg-green-50 p-4 rounded-lg text-center flex-1">
                    <div class="bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">2</div>
                    <h3 class="font-semibold text-green-700">AI Parsing</h3>
                    <p class="text-xs text-gray-600 mt-1">Estrazione dati automatica</p>
                </div>
                <div class="process-step bg-yellow-50 p-4 rounded-lg text-center flex-1">
                    <div class="bg-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">3</div>
                    <h3 class="font-semibold text-yellow-700">Validazione</h3>
                    <p class="text-xs text-gray-600 mt-1">Controllo qualit� dati</p>
                </div>
                <div class="process-step bg-purple-50 p-4 rounded-lg text-center flex-1">
                    <div class="bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">4</div>
                    <h3 class="font-semibold text-purple-700">Import CRM</h3>
                    <p class="text-xs text-gray-600 mt-1">Inserimento automatico</p>
                </div>
                <div class="process-step bg-indigo-50 p-4 rounded-lg text-center flex-1">
                    <div class="bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">5</div>
                    <h3 class="font-semibold text-indigo-700">Invio Landing</h3>
                    <p class="text-xs text-gray-600 mt-1">Email personalizzata</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-6 mb-6">
            <!-- Configurazione Email Partner -->
            <div class="bg-white rounded-lg p-6 shadow">
                <h2 class="text-xl font-bold mb-4 text-gray-800">
                    <i class="fas fa-server mr-2 text-blue-600"></i>
                    Configurazione Email Partner
                </h2>
                <div class="space-y-4">
                    <div class="border rounded-lg p-3">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="font-semibold">Partner Assistenza Domiciliare</p>
                                <p class="text-sm text-gray-600"><a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="2a464f4b4e596a5a4b585e444f584e454743494346434504435e">[email&#160;protected]</a></p>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Attivo</span>
                                <button class="text-blue-600 hover:text-blue-800">
                                    <i class="fas fa-cog"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mt-2 text-sm text-gray-500">
                            <i class="fas fa-envelope mr-1"></i> IMAP: mail.partnerdomicilio.it:993
                        </div>
                    </div>
                    
                    <div class="border rounded-lg p-3">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="font-semibold">Rete Sanitaria Milano</p>
                                <p class="text-sm text-gray-600"><a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="0d6e6263796c7979644d7f6879687e6c6364796c7f646c6064236479">[email&#160;protected]</a></p>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Attivo</span>
                                <button class="text-blue-600 hover:text-blue-800">
                                    <i class="fas fa-cog"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mt-2 text-sm text-gray-500">
                            <i class="fas fa-envelope mr-1"></i> POP3: pop.retesanitariami.it:995
                        </div>
                    </div>

                    <button class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                        <i class="fas fa-plus mr-2"></i>
                        Aggiungi Nuovo Partner
                    </button>
                </div>
            </div>

            <!-- AI Parsing Configuration -->
            <div class="bg-white rounded-lg p-6 shadow">
                <h2 class="text-xl font-bold mb-4 text-gray-800">
                    <i class="fas fa-brain mr-2 text-purple-600"></i>
                    Configurazione AI Parsing
                </h2>
                <div class="space-y-4">
                    <div class="border rounded-lg p-3">
                        <h3 class="font-semibold mb-2">Pattern Riconoscimento</h3>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span>Nome/Cognome</span>
                                <span class="text-green-600 font-semibold">95.2%</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Numero Telefono</span>
                                <span class="text-green-600 font-semibold">98.7%</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Email</span>
                                <span class="text-green-600 font-semibold">99.1%</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Tipo Servizio</span>
                                <span class="text-yellow-600 font-semibold">87.3%</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Urgenza</span>
                                <span class="text-yellow-600 font-semibold">82.1%</span>
                            </div>
                        </div>
                    </div>

                    <div class="border rounded-lg p-3">
                        <h3 class="font-semibold mb-2">Classificazione Automatica</h3>
                        <div class="space-y-1 text-sm">
                            <div class="bg-red-50 text-red-700 px-2 py-1 rounded">Alta Priorit�</div>
                            <div class="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">Media Priorit�</div>
                            <div class="bg-green-50 text-green-700 px-2 py-1 rounded">Bassa Priorit�</div>
                        </div>
                    </div>

                    <button class="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition">
                        <i class="fas fa-robot mr-2"></i>
                        Aggiorna Modelli AI
                    </button>
                </div>
            </div>
        </div>

        <!-- Activity Log e Statistiche -->
        <div class="grid grid-cols-2 gap-6 mb-6">
            <!-- Recent Activity -->
            <div class="bg-white rounded-lg p-6 shadow">
                <h2 class="text-xl font-bold mb-4 text-gray-800">
                    <i class="fas fa-history mr-2 text-green-600"></i>
                    Attivit� Recenti
                </h2>
                <div class="space-y-3 max-h-64 overflow-y-auto">
                    <div class="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <div class="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs">
                            <i class="fas fa-check"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-semibold">Lead estratto e importato</p>
                            <p class="text-xs text-gray-600">Mario Rossi - Servizio Base - 14:32</p>
                            <p class="text-xs text-green-600">Landing page inviata automaticamente</p>
                        </div>
                    </div>

                    <div class="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-semibold">Email processata</p>
                            <p class="text-xs text-gray-600">Partner Assistenza Domiciliare - 14:28</p>
                            <p class="text-xs text-blue-600">3 lead identificati</p>
                        </div>
                    </div>

                    <div class="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <div class="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs">
                            <i class="fas fa-exclamation"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-semibold">Parsing parziale</p>
                            <p class="text-xs text-gray-600">Email formato non standard - 14:25</p>
                            <p class="text-xs text-yellow-600">Richiede revisione manuale</p>
                        </div>
                    </div>

                    <div class="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                        <div class="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs">
                            <i class="fas fa-bell"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-semibold">Alert Stefania</p>
                            <p class="text-xs text-gray-600">Lead alta priorit� identificato - 14:20</p>
                            <p class="text-xs text-purple-600">Richiesta follow-up immediato</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Performance Chart -->
            <div class="bg-white rounded-lg p-6 shadow">
                <h2 class="text-xl font-bold mb-4 text-gray-800">
                    <i class="fas fa-chart-line mr-2 text-indigo-600"></i>
                    Performance Import (Ultimi 7 giorni)
                </h2>
                <div style="height: 280px;">
                    <canvas id="performanceChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Template Personalizzazione -->
        <div class="bg-white rounded-lg p-6 mb-6 shadow">
            <h2 class="text-xl font-bold mb-4 text-gray-800">
                <i class="fas fa-envelope-square mr-2 text-red-600"></i>
                Template Email Automatiche
            </h2>
            <div class="grid grid-cols-3 gap-4">
                <div class="border rounded-lg p-4">
                    <h3 class="font-semibold mb-2 text-blue-700">
                        <i class="fas fa-star mr-1"></i>
                        Servizio Base
                    </h3>
                    <p class="text-sm text-gray-600 mb-3">Email per lead interessati al servizio base</p>
                    <div class="space-y-2 text-xs">
                        <div class="bg-gray-100 p-2 rounded">
                            <strong>Oggetto:</strong> {{nome}}, scopri TeleMedCare Base
                        </div>
                        <div class="bg-gray-100 p-2 rounded">
                            <strong>Personalizzazione:</strong> Nome, servizio, prezzo annuale
                        </div>
                    </div>
                    <button class="mt-3 w-full bg-blue-100 text-blue-700 py-1 px-3 rounded text-sm hover:bg-blue-200">
                        <i class="fas fa-edit mr-1"></i> Modifica Template
                    </button>
                </div>

                <div class="border rounded-lg p-4">
                    <h3 class="font-semibold mb-2 text-green-700">
                        <i class="fas fa-crown mr-1"></i>
                        Servizio Avanzato
                    </h3>
                    <p class="text-sm text-gray-600 mb-3">Email per lead interessati al servizio avanzato</p>
                    <div class="space-y-2 text-xs">
                        <div class="bg-gray-100 p-2 rounded">
                            <strong>Oggetto:</strong> {{nome}}, TeleMedCare Avanzato per te
                        </div>
                        <div class="bg-gray-100 p-2 rounded">
                            <strong>Personalizzazione:</strong> Nome, benefici, centrale H24
                        </div>
                    </div>
                    <button class="mt-3 w-full bg-green-100 text-green-700 py-1 px-3 rounded text-sm hover:bg-green-200">
                        <i class="fas fa-edit mr-1"></i> Modifica Template
                    </button>
                </div>

                <div class="border rounded-lg p-4">
                    <h3 class="font-semibold mb-2 text-orange-700">
                        <i class="fas fa-question-circle mr-1"></i>
                        Info Generiche
                    </h3>
                    <p class="text-sm text-gray-600 mb-3">Email per lead senza preferenze specifiche</p>
                    <div class="space-y-2 text-xs">
                        <div class="bg-gray-100 p-2 rounded">
                            <strong>Oggetto:</strong> {{nome}}, quale servizio preferisci?
                        </div>
                        <div class="bg-gray-100 p-2 rounded">
                            <strong>Personalizzazione:</strong> Nome, confronto servizi
                        </div>
                    </div>
                    <button class="mt-3 w-full bg-orange-100 text-orange-700 py-1 px-3 rounded text-sm hover:bg-orange-200">
                        <i class="fas fa-edit mr-1"></i> Modifica Template
                    </button>
                </div>
            </div>
        </div>

        <!-- Alert e Notifiche -->
        <div class="bg-white rounded-lg p-6 mb-6 shadow">
            <h2 class="text-xl font-bold mb-4 text-gray-800">
                <i class="fas fa-bell mr-2 text-yellow-600"></i>
                Sistema Alert e Follow-up Stefania
            </h2>
            <div class="grid grid-cols-2 gap-6">
                <div>
                    <h3 class="font-semibold mb-3 text-red-700">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        Alert Immediati
                    </h3>
                    <div class="space-y-2">
                        <div class="bg-red-50 border border-red-200 p-3 rounded-lg">
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-semibold text-red-800">Lead Alta Priorit�</span>
                                <span class="bg-red-600 text-white px-2 py-1 rounded-full text-xs">URGENTE</span>
                            </div>
                            <p class="text-xs text-red-600 mt-1">WhatsApp + Email immediato a Stefania</p>
                        </div>
                        
                        <div class="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-semibold text-orange-800">Parsing Failed</span>
                                <span class="bg-orange-600 text-white px-2 py-1 rounded-full text-xs">ERRORE</span>
                            </div>
                            <p class="text-xs text-orange-600 mt-1">Email non processabile - revisione manuale</p>
                        </div>

                        <div class="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-semibold text-yellow-800">Volume Elevato</span>
                                <span class="bg-yellow-600 text-white px-2 py-1 rounded-full text-xs">INFO</span>
                            </div>
                            <p class="text-xs text-yellow-600 mt-1">+10 lead in 1 ora - picco di traffico</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="font-semibold mb-3 text-blue-700">
                        <i class="fas fa-clock mr-1"></i>
                        Follow-up Programmati
                    </h3>
                    <div class="space-y-2">
                        <div class="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-semibold text-blue-800">Reminder H+4</span>
                                <span class="text-xs text-blue-600">15:30</span>
                            </div>
                            <p class="text-xs text-blue-600 mt-1">Chiamata follow-up Mario Rossi</p>
                        </div>
                        
                        <div class="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-semibold text-green-800">Email Follow-up</span>
                                <span class="text-xs text-green-600">17:00</span>
                            </div>
                            <p class="text-xs text-green-600 mt-1">Lead senza risposta dopo 2 ore</p>
                        </div>

                        <div class="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-semibold text-purple-800">Report Giornaliero</span>
                                <span class="text-xs text-purple-600">18:00</span>
                            </div>
                            <p class="text-xs text-purple-600 mt-1">Riepilogo attivit� e statistiche</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Settings e Configuration -->
        <div class="bg-white rounded-lg p-6 shadow">
            <h2 class="text-xl font-bold mb-4 text-gray-800">
                <i class="fas fa-cogs mr-2 text-gray-600"></i>
                Impostazioni Sistema
            </h2>
            <div class="grid grid-cols-3 gap-6">
                <div>
                    <h3 class="font-semibold mb-3">Frequenza Check Email</h3>
                    <select class="w-full border rounded-lg p-2 text-sm">
                        <option>Ogni 30 secondi</option>
                        <option>Ogni 1 minuto</option>
                        <option>Ogni 2 minuti</option>
                        <option>Ogni 5 minuti</option>
                    </select>
                </div>

                <div>
                    <h3 class="font-semibold mb-3">Soglia Confidenza AI</h3>
                    <input type="range" min="70" max="95" value="85" class="w-full">
                    <div class="flex justify-between text-xs text-gray-500 mt-1">
                        <span>70%</span>
                        <span class="font-semibold">85%</span>
                        <span>95%</span>
                    </div>
                </div>

                <div>
                    <h3 class="font-semibold mb-3">Auto-invio Landing</h3>
                    <div class="space-y-2">
                        <label class="flex items-center text-sm">
                            <input type="checkbox" checked class="mr-2">
                            Invio automatico sempre
                        </label>
                        <label class="flex items-center text-sm">
                            <input type="checkbox" class="mr-2">
                            Solo se confidenza > 90%
                        </label>
                    </div>
                </div>
            </div>

            <div class="mt-6 pt-6 border-t">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="font-semibold">Stato Sistema</h3>
                        <p class="text-sm text-gray-600">Ultima sincronizzazione: 2 minuti fa</p>
                    </div>
                    <div class="flex space-x-3">
                        <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                            <i class="fas fa-play mr-2"></i>
                            Avvia Sistema
                        </button>
                        <button class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                            <i class="fas fa-stop mr-2"></i>
                            Ferma Sistema
                        </button>
                        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                            <i class="fas fa-sync-alt mr-2"></i>
                            Sincronizza Ora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script>
        // Performance Chart
        const ctx = document.getElementById(''performanceChart'').getContext(''2d'');
        new Chart(ctx, {
            type: ''line'',
            data: {
                labels: [''Lun'', ''Mar'', ''Mer'', ''Gio'', ''Ven'', ''Sab'', ''Dom''],
                datasets: [
                    {
                        label: ''Email Ricevute'',
                        data: [45, 52, 38, 67, 72, 41, 47],
                        borderColor: ''#3B82F6'',
                        backgroundColor: ''rgba(59, 130, 246, 0.1)'',
                        tension: 0.4
                    },
                    {
                        label: ''Lead Estratti'',
                        data: [38, 45, 32, 58, 63, 35, 32],
                        borderColor: ''#10B981'',
                        backgroundColor: ''rgba(16, 185, 129, 0.1)'',
                        tension: 0.4
                    },
                    {
                        label: ''Landing Inviate'',
                        data: [35, 42, 28, 52, 58, 31, 28],
                        borderColor: ''#F59E0B'',
                        backgroundColor: ''rgba(245, 158, 11, 0.1)'',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: ''bottom''
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: ''rgba(0, 0, 0, 0.05)''
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Simula aggiornamenti real-time
        setInterval(() => {
            const activities = document.querySelectorAll(''.status-active'');
            activities.forEach(el => {
                el.style.opacity = el.style.opacity === ''0.5'' ? ''1'' : ''0.5'';
            });
        }, 2000);
    </script>
</body>
</html>
    <script id="html_badge_script1">
        window.__genspark_remove_badge_link = "https://www.genspark.ai/api/html_badge/" +
            "remove_badge?token=To%2FBnjzloZ3UfQdcSaYfDsYzwAZas7JM6hY0JbYigj%2BkcLnbGOEVOm6olqvB%2B6po%2BotZEDm1CLxysBfkHWCPiN%2BvUSvcDgb3gQMK6L1m4JLaGd%2FOhaSkwicwC2xrIdxwVeM4jKm0JFwmBP7gZRWGFdsBjdu6xBhfrQVnILsxGvYjFW7T2O%2BkFf4gxu4xltdhUX8yrvoBQo9Ysxlcup2Cra5RBllexF8KoRrW5zt8GWJKFFHtp6wcYLloN6v1%2B%2F4%2B%2Fhgcv7rHsjjbYS8y80SYTKzznUGDDVJ4aqHOrC4PChYUmDfbJ%2F9WkoIzFuIQE8yp5v4eskUufePMd2p%2FPMfFg6IqPEM2eugEa8KBBEG1m2xH%2F1OPOSiLnxoy%2FT9ZxSn040FGwsywd2M5b6jc9M4Rc9f%2Byvz1T2ZFTGXPkfxzCvGJJGiVhgknyUfhHIE11Y3rDZq%2FY21faV6mmLM7L5bIyf%2BzCNK9meadLGO%2Fsv5ai8A%2BOOPT20Y3vQVIaeMJtERMBLTHVWNlQYkqGiqRKTjfE5wYz1Joxbv9P5tdOYgQJSY%3D";
        window.__genspark_locale = "it-IT";
        window.__genspark_token = "To/BnjzloZ3UfQdcSaYfDsYzwAZas7JM6hY0JbYigj+kcLnbGOEVOm6olqvB+6po+otZEDm1CLxysBfkHWCPiN+vUSvcDgb3gQMK6L1m4JLaGd/OhaSkwicwC2xrIdxwVeM4jKm0JFwmBP7gZRWGFdsBjdu6xBhfrQVnILsxGvYjFW7T2O+kFf4gxu4xltdhUX8yrvoBQo9Ysxlcup2Cra5RBllexF8KoRrW5zt8GWJKFFHtp6wcYLloN6v1+/4+/hgcv7rHsjjbYS8y80SYTKzznUGDDVJ4aqHOrC4PChYUmDfbJ/9WkoIzFuIQ',
    '["PARTNER_NAME", "EMAIL_SOURCE", "LEAD_DATA", "PARSED_FIELDS"]',
    NULL,
    NULL,
    1,
    0,
    'system'
);
