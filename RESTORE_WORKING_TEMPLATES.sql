-- RESTORE WORKING EMAIL TEMPLATES FROM 11:55 AM
-- Generated on: 2025-11-08 22:16
-- Source: Old working database

-- First, delete current generic templates
DELETE FROM document_templates;

-- Insert working templates
-- Template: Benvenuto Cliente
INSERT INTO document_templates (id, name, type, subject, html_content, variables, category, active, created_at, updated_at, usage_count, last_used) VALUES (
  'email_benvenuto',
  'Benvenuto Cliente',
  'email',
  '🎉 Benvenuto in TeleMedCare!',
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
  '["NOME_CLIENTE", "COGNOME_CLIENTE", "CODICE_CLIENTE", "LINK_CONFIGURAZIONE"]',
  'workflow',
  1,
  '2025-11-07 14:25:00',
  '2025-11-07 14:25:00',
  0,
  NULL
);

-- Template: Conferma Attivazione Servizio
INSERT INTO document_templates (id, name, type, subject, html_content, variables, category, active, created_at, updated_at, usage_count, last_used) VALUES (
  'email_conferma_attivazione',
  'Conferma Attivazione Servizio',
  'email',
  '✅ TeleMedCare - Servizio Attivato!',
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
  '["NOME_CLIENTE", "COGNOME_CLIENTE", "CODICE_CLIENTE", "PIANO_SERVIZIO", "CODICE_DISPOSITIVO", "DATA_ATTIVAZIONE"]',
  'workflow',
  1,
  '2025-11-07 14:25:00',
  '2025-11-07 14:25:00',
  0,
  NULL
);

-- Template: Conferma Generica
INSERT INTO document_templates (id, name, type, subject, html_content, variables, category, active, created_at, updated_at, usage_count, last_used) VALUES (
  'email_conferma',
  'Conferma Generica',
  'email',
  '✅ TeleMedCare - Conferma',
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
  'system',
  1,
  '2025-11-07 14:25:00',
  '2025-11-07 14:25:00',
  0,
  NULL
);

-- Template: Documenti Informativi
INSERT INTO document_templates (id, name, type, subject, html_content, variables, category, active, created_at, updated_at, usage_count, last_used) VALUES (
  'email_documenti_informativi',
  'Documenti Informativi',
  'email',
  '📄 TeleMedCare - Informazioni e Documenti Richiesti',
  '<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documenti Informativi TeleMedCare</title>
    <style>
      body {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
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
        font-size: 24px;
        font-weight: 600;
      }

      .header p {
        margin: 8px 0 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .content {
        padding: 30px;
      }

      .greeting {
        font-size: 16px;
        color: #1e40af;
        font-weight: 600;
        margin-bottom: 20px;
      }

      .info-box {
        background: #f0f9ff;
        border-left: 4px solid #3b82f6;
        padding: 15px 20px;
        margin: 20px 0;
        border-radius: 4px;
      }

      .info-box h3 {
        margin: 0 0 10px 0;
        color: #1e40af;
        font-size: 16px;
      }

      .documents-section {
        background: #fffbeb;
        border: 2px solid #fbbf24;
        border-radius: 8px;
        padding: 20px;
        margin: 25px 0;
      }

      .documents-section h3 {
        margin: 0 0 15px 0;
        color: #d97706;
        font-size: 16px;
      }

      .document-item {
        padding: 8px 0;
        display: flex;
        align-items: center;
      }

      .document-item::before {
        content: "📄";
        margin-right: 10px;
        font-size: 18px;
      }

      .cta-box {
        background: #dbeafe;
        border-radius: 8px;
        padding: 20px;
        margin: 25px 0;
        text-align: center;
      }

      .cta-box p {
        margin: 0;
        color: #1e40af;
        font-weight: 600;
      }

      .footer {
        background: #f8fafc;
        padding: 20px;
        text-align: center;
        font-size: 13px;
        color: #64748b;
        border-top: 1px solid #e2e8f0;
      }

      .contact-info {
        margin: 15px 0;
        padding: 15px;
        background: white;
        border-radius: 6px;
        font-size: 14px;
      }

      ul {
        margin: 10px 0;
        padding-left: 20px;
      }

      li {
        margin: 8px 0;
      }

      @media (max-width: 640px) {
        body {
          padding: 10px;
        }
        .content {
          padding: 20px;
        }
      }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>📚 Documentazione TeleMedCare</h1>
            <p>La tecnologia che Le salva salute e vita</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Gentile {{NOME_CLIENTE}} {{COGNOME_CLIENTE}},
            </div>

            <p>La ringraziamo per l''interesse mostrato nei confronti di <strong>TeleMedCare</strong>, il servizio di telemedicina e teleassistenza che unisce tecnologia avanzata e cura della persona.</p>

            <p>Come da Lei richiesto, Le inviamo in allegato la documentazione informativa sui nostri servizi.</p>

            <!-- Documents Section -->
            <div class="documents-section">
                <h3>📦 Documenti Allegati a Questa Email</h3>
                {{BROCHURE_HTML}}
                {{MANUALE_HTML}}
            </div>

            <!-- Info Box -->
            <div class="info-box">
                <h3>🎯 Cosa Troverà nella Documentazione</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li><strong>Servizi TeleMedCare</strong>: Piani BASE e AVANZATO con monitoraggio parametri vitali</li>
                    <li><strong>Dispositivo SiDLY Care Pro</strong>: Caratteristiche tecniche del dispositivo medico certificato</li>
                    <li><strong>Funzionalità</strong>: Monitoraggio continuo, pulsante SOS, videochiamata integrata</li>
                    <li><strong>Centrale Operativa</strong>: Assistenza H24 con personale qualificato</li>
                    <li><strong>Prezzi e modalità</strong>: Investimento annuale e opzioni di pagamento disponibili</li>
                </ul>
            </div>

            <!-- Perché TeleMedCare -->
            <div class="info-box">
                <h3>✨ Perché Scegliere TeleMedCare?</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>🏥 <strong>Dispositivo Certificato</strong> - Classe IIa Certificato CE, conforme normative europee</li>
                    <li>📡 <strong>Connessione H24</strong> - Sempre collegati con la Centrale Operativa attiva 24/7</li>
                    <li>⚡ <strong>Risposta Rapida</strong> - Intervento immediato in caso di emergenza o necessità</li>
                    <li>💰 <strong>Detraibile Fiscalmente</strong> - Spesa sanitaria detraibile al 19% nella dichiarazione</li>
                    <li>🔒 <strong>Privacy Garantita</strong> - Dati protetti secondo normativa GDPR</li>
                </ul>
            </div>

            <!-- Prossimi Passi -->
            <p><strong>🔔 Prossimi Passi:</strong></p>
            <ol style="margin: 10px 0; padding-left: 25px;">
                <li>Esamini con calma la documentazione allegata</li>
                <li>Per qualsiasi domanda o chiarimento, ci contatti senza impegno</li>
                <li>Quando sarà pronto/a, Le invieremo il contratto personalizzato da firmare</li>
                <li>Dopo la firma, attiveremo il servizio entro 10 giorni lavorativi</li>
                <li>Riceverà il dispositivo SiDLY Care Pro direttamente a casa con istruzioni complete</li>
            </ol>

            <!-- CTA Box -->
            <div class="cta-box">
                <p style="margin: 0 0 8px 0;">💬 Domande o Dubbi?</p>
                <p style="margin: 0; font-weight: normal; font-size: 14px;">
                    Il nostro team è a Sua completa disposizione.<br>
                    Ci contatti senza impegno per una consulenza gratuita!
                </p>
            </div>

            <!-- Contatti -->
            <div class="contact-info">
                <strong>📞 Come Contattarci:</strong><br>
                📧 Email: <a href="mailto:info@telemedcare.it" style="color: #3b82f6; text-decoration: none;">info@telemedcare.it</a><br>
                📱 Telefono/WhatsApp: <a href="tel:+393316432390" style="color: #3b82f6; text-decoration: none;">+39 331 643 2390</a><br>
                🌐 Sito Web: <a href="https://www.telemedcare.it" style="color: #3b82f6; text-decoration: none;">www.telemedcare.it</a>
            </div>

            <p style="margin-top: 25px;">Cordiali saluti,</p>
            <p style="margin: 5px 0;"><strong>Il Team TeleMedCare</strong></p>
            <p style="margin: 5px 0; font-size: 14px; color: #64748b;"><em>Medica GB S.r.l. - Startup Innovativa a Vocazione Sociale</em></p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin: 5px 0;"><strong>TeleMedCare</strong> - Medica GB S.r.l.</p>
            <p style="margin: 5px 0;">Corso Giuseppe Garibaldi, 34 - 20121 Milano</p>
            <p style="margin: 5px 0;">P.IVA: 12435130963</p>
            <p style="margin: 15px 0 5px; font-size: 12px;">
                Ricevuta questa email per errore? <a href="mailto:privacy@telemedcare.it" style="color: #3b82f6;">Contattaci</a>
            </p>
        </div>
    </div>
</body>
</html>',
  '["NOME_CLIENTE", "COGNOME_CLIENTE", "EMAIL_CLIENTE", "TELEFONO_CLIENTE"]',
  'workflow',
  1,
  '2025-11-07 14:25:00',
  '2025-11-07 22:09:57',
  0,
  NULL
);

-- Template: Invio Contratto
INSERT INTO document_templates (id, name, type, subject, html_content, variables, category, active, created_at, updated_at, usage_count, last_used) VALUES (
  'email_invio_contratto',
  'Invio Contratto',
  'email',
  '📋 TeleMedCare - Il tuo contratto è pronto!',
  '<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>TeleMedCare - Invio contratto</title>
  <style>
    /* Inline-friendly basic styles for email clients */
    body { margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, Helvetica, sans-serif; color:#333333; }
    .wrapper { width:100%; table-layout:fixed; background-color:#f4f6f8; padding:20px 0; }
    .main { background:#ffffff; margin:0 auto; width:100%; max-width:600px; border-radius:6px; overflow:hidden; }
    .content { padding:24px; }
    h1,h2,h3 { margin:0 0 12px 0; color:#0b63a5; }
    p { margin:0 0 12px 0; line-height:1.4; color:#333; }
    .muted { color:#666666; font-size:14px; }
    .card { background:#f8fbff; border:1px solid #e6f0fa; padding:14px; border-radius:6px; margin:12px 0; }
    .list { margin:12px 0 12px 18px; padding:0; }
    .list li { margin-bottom:8px; }
    .steps { margin:0; padding-left:18px; }
    .footer { font-size:13px; color:#777777; padding:16px 24px; text-align:center; }
    .highlight { font-weight:600; color:#111; }
    .meta { background:#f1f5f8; padding:10px 12px; border-radius:4px; margin-top:10px; font-size:15px; }
    .btn { display:inline-block; background:#0b63a5; color:#ffffff; text-decoration:none; padding:10px 16px; border-radius:4px; font-weight:600; }
    @media only screen and (max-width:520px) {
      .content { padding:16px; }
    }
  </style>
</head>
<body>
  <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center">
        <table class="main" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="background:#0b63a5; padding:18px 24px;">
              <h1 style="color:#ffffff; font-size:20px; margin:0;">TeleMedCare</h1>
            </td>
          </tr>
          <tr>
            <td class="content">
              <p>Gentile <span class="highlight">{{NOME_CLIENTE}}</span>,</p>

              <p>Siamo lieti di accompagnarLa in questo importante passo verso una maggiore sicurezza e tranquillità. Come promesso, in allegato trova il <strong>contratto per il servizio {{PIANO_SERVIZIO}}</strong>{{TESTO_DOCUMENTI_AGGIUNTIVI}}.</p>

              <div class="card" role="article" aria-label="Dettagli piano">
                <h2 style="font-size:16px; margin-bottom:8px;">Il Suo piano TeleMedCare: <span style="color:#0b63a5;">{{PIANO_SERVIZIO}}</span></h2>
                <div class="meta">
                  <div><strong>Piano:</strong> {{PIANO_SERVIZIO}}</div>
                  <div><strong>Investimento:</strong> {{PREZZO_PIANO}}</div>
                  <div><strong>Codice Cliente:</strong> {{CODICE_CLIENTE}}</div>
                </div>
              </div>

              <h3>Perché ha fatto la scelta giusta</h3>
              <ul class="list" style="margin-left:18px;">
                <li><strong>Innovazione Sociale:</strong> Sta supportando una startup innovativa a vocazione sociale che cambia il paradigma della cura tradizionale.</li>
                <li><strong>Assistenza Domiciliare:</strong> Riceve cure e monitoraggio direttamente dove serve, senza doversi spostare.</li>
                <li><strong>Tecnologia Avanzata:</strong> Dispositivo medicale certificato Classe IIa con funzionalità all''avanguardia.</li>
              </ul>

              <h3>Prossimi passi per l''attivazione</h3>
              <ol class="steps">
                <li>Legga attentamente il contratto allegato.</li>
                <li>Firmi in ogni pagina richiesta e nell''ultima pagina.</li>
                <li>Ci invii il contratto firmato via email o WhatsApp.</li>
                <li>Riceverà il dispositivo entro 10 giorni lavorativi.</li>
              </ol>

              <h3>Vantaggi economici e fiscali</h3>
              <ul class="list">
                <li><strong>Detrazione Fiscale 19%:</strong> Il servizio è detraibile come spesa sanitaria nel 730.</li>
                <li><strong>Possibili Rimborsi INPS:</strong> Per ISEE sotto €6.000 + Legge 104.</li>
              </ul>

              <p class="muted">Siamo qui per accompagnarLa in ogni step di questo percorso. Non esiti a contattarci per qualsiasi chiarimento o domanda. La Sua sicurezza e tranquillità sono la nostra priorità.</p>

              <p style="margin-top:18px;"><strong>Benvenuto/a nella famiglia TeleMedCare!</strong><br>Il Team TeleMedCare</p>

              <p style="margin-top:18px;">
                <a href="mailto:info@telemedcare.it" class="btn">Contattaci via Email</a>
                &nbsp;&nbsp;
                <a href="https://wa.me/393316432390" class="btn" style="background:#25D366;">Invia via WhatsApp</a>
              </p>

              <div style="background-color:#f8f9fa;border-left:4px solid #0066cc;padding:15px;margin-top:20px;border-radius:4px;">
                <p style="margin:0;color:#495057;font-size:14px;font-weight:600;">📎 Allegati a questa email:</p>
                <div style="margin-top:8px;color:#333;font-size:14px;line-height:1.6;">{{ALLEGATI_LISTA}}</div>
              </div>

            </td>
          </tr>

          <tr>
            <td class="footer">
              <div>TeleMedCare &middot; Assistenza Domiciliare e Monitoraggio</div>
              <div style="margin-top:6px;font-size:12px;">Privacy garantita &middot; Dati protetti secondo GDPR</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  '["NOME_CLIENTE", "COGNOME_CLIENTE", "PIANO_SERVIZIO", "PREZZO_PIANO", "CODICE_CLIENTE", "LINK_FIRMA_CONTRATTO"]',
  'workflow',
  1,
  '2025-11-07 14:25:00',
  '2025-11-07 22:39:38',
  0,
  NULL
);

-- Template: Invio Proforma
INSERT INTO document_templates (id, name, type, subject, html_content, variables, category, active, created_at, updated_at, usage_count, last_used) VALUES (
  'email_invio_proforma',
  'Invio Proforma',
  'email',
  '💰 TeleMedCare - Proforma per Pagamento',
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
  '["NOME_CLIENTE", "COGNOME_CLIENTE", "PIANO_SERVIZIO", "PREZZO_PIANO", "CODICE_CLIENTE", "DATA_EMISSIONE", "LINK_PAGAMENTO"]',
  'workflow',
  1,
  '2025-11-07 14:25:00',
  '2025-11-07 14:25:00',
  0,
  NULL
);

-- Template: Notifica Configurazione Ricevuta
INSERT INTO document_templates (id, name, type, subject, html_content, variables, category, active, created_at, updated_at, usage_count, last_used) VALUES (
  'email_configurazione',
  'Notifica Configurazione Ricevuta',
  'email',
  '⚙️ TeleMedCare - Configurazione Cliente Ricevuta',
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
  '["NOME_CLIENTE", "COGNOME_CLIENTE", "CODICE_CLIENTE", "DATI_CONFIGURAZIONE"]',
  'notification',
  1,
  '2025-11-07 14:25:00',
  '2025-11-07 14:25:00',
  0,
  NULL
);

-- Template: Notifica Nuovo Lead
INSERT INTO document_templates (id, name, type, subject, html_content, variables, category, active, created_at, updated_at, usage_count, last_used) VALUES (
  'email_notifica_info',
  'Notifica Nuovo Lead',
  'email',
  '🚨 TeleMedCare - Nuovo Lead: {{NOME_CLIENTE}} {{COGNOME_CLIENTE}}',
  '
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
  '["NOME_RICHIEDENTE","COGNOME_RICHIEDENTE","EMAIL_RICHIEDENTE","TELEFONO_RICHIEDENTE","CF_RICHIEDENTE","INDIRIZZO_RICHIEDENTE","CAP_RICHIEDENTE","CITTA_RICHIEDENTE","PROVINCIA_RICHIEDENTE","DATA_NASCITA_RICHIEDENTE","LUOGO_NASCITA_RICHIEDENTE","NOME_ASSISTITO","COGNOME_ASSISTITO","EMAIL_ASSISTITO","TELEFONO_ASSISTITO","ETA_ASSISTITO","CF_ASSISTITO","INDIRIZZO_ASSISTITO","CAP_ASSISTITO","CITTA_ASSISTITO","PROVINCIA_ASSISTITO","DATA_NASCITA_ASSISTITO","LUOGO_NASCITA_ASSISTITO","PIANO_SERVIZIO","TIPO_SERVIZIO","PREZZO_PIANO","INTESTAZIONE_CONTRATTO","VUOLE_CONTRATTO","VUOLE_BROCHURE","VUOLE_MANUALE","CONDIZIONI_SALUTE","URGENZA_RISPOSTA","GIORNI_RISPOSTA","PREFERENZA_CONTATTO","NOTE_AGGIUNTIVE","FONTE","DATA_RICHIESTA","ORA_RICHIESTA","TIMESTAMP_COMPLETO","LEAD_ID"]',
  'notification',
  1,
  '2025-11-07 14:25:00',
  '2025-11-07 16:29:23',
  0,
  NULL
);

-- Template: Promemoria Generico
INSERT INTO document_templates (id, name, type, subject, html_content, variables, category, active, created_at, updated_at, usage_count, last_used) VALUES (
  'email_promemoria',
  'Promemoria Generico',
  'email',
  '⏰ TeleMedCare - Promemoria',
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
<div class="email-header" style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fde047 100%); color: #92400e">
<h3 style="margin: 0; font-size: 24px">🔔 PROMEMORIA</h3>
<p style="margin: 10px 0 0 0">TeleMedCare - Medica GB S.r.l.</p>
<div style="font-size: 14px; opacity: 0.9">{{TIPO_PROMEMORIA}}</div>
</div>
<div class="email-content">
<h3 style="color: #1e40af; margin-top: 0">Gentile {{NOME_CLIENTE}},</h3>
<div class="warning-box">
<h4 style="color: #d97706; margin-top: 0">📅 {{TIPO_PROMEMORIA}}</h4>
<p style="font-size: 18px"><strong>{{MESSAGGIO_PRINCIPALE}}</strong></p>
<p>Data: <strong>{{DATA_SCADENZA}}</strong></p>
<p>Giorni rimanenti: <span style="color: #dc2626; font-weight: bold">{{GIORNI_RIMANENTI}}</span></p>
</div>
<div class="info-box">
<h4 style="color: #3b82f6; margin-top: 0">📋 Dettagli Rinnovo</h4>
<ul>
<li><strong>Piano Attuale:</strong> {{PIANO_SERVIZIO}}</li>
<li><strong>Scadenza:</strong> {{DATA_SCADENZA}}</li>
<li><strong>Costo Rinnovo:</strong> {{COSTO_RINNOVO}}</li>
<li><strong>Codice Cliente:</strong> {{CODICE_CLIENTE}}</li>
</ul>
<p><strong>💡 Vantaggi del Rinnovo:</strong></p>
<p>
              ✅ Prezzo scontato rispetto al primo anno<br/>
              ✅ Nessuna interruzione del servizio<br/>
              ✅ Mantiene tutte le configurazioni personali<br/>
              ✅ Continua a beneficiare delle detrazioni fiscali
            </p>
</div>
<div style="
              text-align: center;
              padding: 20px;
              background: #f8faff;
              border-radius: 6px;
              border: 2px solid #3b82f6;
              margin: 20px 0;
            ">
<strong style="font-size: 18px; color: #3b82f6">🏦 Bonifico Bancario</strong><br/>
<div style="margin-top: 10px">
<strong>IBAN:</strong> {{IBAN_AZIENDALE}}<br/>
<strong>Causale:</strong> Rinnovo {{CODICE_CLIENTE}}<br/>
<strong>Beneficiario:</strong> Medica GB S.r.l.
            </div>
</div>
<div class="highlight-box">
<h4 style="color: #16a34a; margin-top: 0">💰 Non Dimentichi i Benefici Fiscali!</h4>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px">
<div>
<strong>📋 Detrazione 730:</strong><br/>
                19% detraibile come spesa sanitaria<br/>
<em>Risparmio: {{RISPARMIO_FISCALE}}</em>
</div>
<div>
<strong>🏛️ Possibili Rimborsi INPS:</strong><br/>
                Per ISEE &lt; €6.000 + Legge 104<br/>
<em>La aiutiamo con la pratica!</em>
</div>
</div>
</div>
<div style="background: #fee2e2; padding: 20px; border-radius: 6px; border: 1px solid #fca5a5; margin: 20px 0">
<h4 style="color: #dc2626; margin-top: 0">⚠️ Importante</h4>
<p>Senza il rinnovo, il servizio verrà sospeso alla data di scadenza.</p>
<p>
<strong>Non rischi di rimanere scoperto/a!</strong> Rinnovi in tempo per mantenere la Sua protezione H24.
            </p>
</div>
<div class="contact-box">
<h4 style="color: #475569; margin-top: 0">📞 Contatti</h4>
<p><strong>E-MAIL:</strong> <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="325b5c545d725f57565b515355501c5b46">[email&#160;protected]</a></p>
<p><strong>Telefono commerciale:</strong> 335 7301206</p>
<p>
<strong>Telefono tecnico:</strong> 331 64 32 390<br/>
</p>
</div>
<p>Grazie per la fiducia che continua a riporre in TeleMedCare. Siamo qui per proteggerLa sempre!</p>
<p><strong>A presto,</strong><br/>Il Team TeleMedCare</p>
</div>
<div class="footer-standard">
<p><strong>Medica GB S.r.l.</strong> - Startup Innovativa a Vocazione Sociale</p>
<p>Milano: Corso Garibaldi 34, 20121 | Genova: Via delle Eriche 53, 16148</p>
<p>P.IVA: 12435130963 | <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="0c65626a634c616968656f6d6b6e226578">[email&#160;protected]</a> | www.medicagb.it</p>
</div>
</div>
</div>
<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script></body>
</html>',
  '["NOME_CLIENTE", "COGNOME_CLIENTE", "MESSAGGIO"]',
  'marketing',
  1,
  '2025-11-07 14:25:00',
  '2025-11-07 14:25:00',
  0,
  NULL
);

-- Template: Promemoria Pagamento
INSERT INTO document_templates (id, name, type, subject, html_content, variables, category, active, created_at, updated_at, usage_count, last_used) VALUES (
  'email_promemoria_pagamento',
  'Promemoria Pagamento',
  'email',
  '💳 TeleMedCare - Promemoria Pagamento',
  '<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promemoria Pagamento - TeleMedCare</title>
    <style>
        body {
            font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .payment-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .amount {
            font-size: 32px;
            font-weight: bold;
            color: #e67e22;
            margin: 15px 0;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #e67e22 0%, #d68910 100%);
            color: white;
            text-decoration: none;
            padding: 15px 35px;
            border-radius: 25px;
            font-weight: 600;
            margin: 15px 0;
        }
        .footer {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            text-align: center;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1> Promemoria Pagamento</h1>
            <p>Il tuo ordine � in attesa di pagamento</p>
        </div>
        
        <div class="content">
            <p>Ciao <strong>{{NOME_CLIENTE}}</strong>,</p>
            
            <p>Ti ricordiamo che il pagamento per il tuo ordine <strong>#{{NUMERO_ORDINE}}</strong> � ancora in sospeso.</p>
            
            <div class="payment-box">
                <h3> Importo da Pagare</h3>
                <div class="amount"> {{IMPORTO_DOVUTO}}</div>
                <p>Scadenza: <strong>{{DATA_SCADENZA}}</strong></p>
                <a href="{{URL_PAGAMENTO}}" class="btn"> Paga Ora</a>
            </div>
            
            <h3> Dettagli Ordine</h3>
            <ul>
                <li><strong>Data Ordine:</strong> {{DATA_ORDINE}}</li>
                <li><strong>Dispositivo:</strong> {{NOME_DISPOSITIVO}}</li>
                <li><strong>Metodo Pagamento:</strong> {{METODO_PAGAMENTO}}</li>
            </ul>
            
            <p><strong> Importante:</strong> Se il pagamento non sar� completato entro la data di scadenza, l''ordine verr� automaticamente annullato.</p>
            
            <h3> Metodi di Pagamento Accettati</h3>
            <ul>
                <li>Carta di Credito/Debito (Visa, Mastercard, American Express)</li>
                <li>PayPal</li>
                <li>Bonifico Bancario</li>
                <li>Apple Pay / Google Pay</li>
            </ul>
        </div>
        
        <div class="footer">
            <p><strong>TeleMedCare V11.0</strong> - La tua salute, sempre connessa</p>
            <p>� 2024 TeleMedCare S.r.l.</p>
        </div>
    </div>
</body>
</html>',
  '["NOME_CLIENTE", "COGNOME_CLIENTE", "IMPORTO", "LINK_PAGAMENTO"]',
  'workflow',
  1,
  '2025-11-07 14:25:00',
  '2025-11-07 14:25:00',
  0,
  NULL
);

-- Template restoration complete!
