-- ========================================================================
-- RESTORE CORRECT EMAIL TEMPLATES FROM YESTERDAY 20:57
-- ========================================================================
-- Source: RESTORE_WORKING_TEMPLATES.sql (templates funzionanti di ieri)
-- Date: 2025-11-10
-- 
-- Questi sono i template CORRETTI con placeholder dinamici:
-- - email_invio_contratto: {{TESTO_DOCUMENTI_AGGIUNTIVI}} e {{ALLEGATI_LISTA}}
-- - email_documenti_informativi: {{BROCHURE_HTML}} e {{MANUALE_HTML}}
-- ========================================================================

-- 1. RESTORE email_invio_contratto (template dinamico per invio contratto)
UPDATE document_templates 
SET 
  html_content = '<!doctype html>
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
  updated_at = datetime('now')
WHERE id = 'email_invio_contratto';

-- 2. RESTORE email_documenti_informativi (template dinamico per invio documenti)
UPDATE document_templates 
SET 
  html_content = '<!DOCTYPE html>
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
  updated_at = datetime('now')
WHERE id = 'email_documenti_informativi';

-- Verifica
SELECT 
  id, 
  name, 
  length(html_content) as html_size, 
  updated_at,
  CASE 
    WHEN html_content LIKE '%{{ALLEGATI_LISTA}}%' THEN '✅ DINAMICO'
    WHEN html_content LIKE '%{{BROCHURE_HTML}}%' THEN '✅ DINAMICO'
    ELSE '❌ STATICO'
  END as tipo
FROM document_templates 
WHERE id IN ('email_invio_contratto', 'email_documenti_informativi')
ORDER BY id;
