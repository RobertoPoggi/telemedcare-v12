-- TeleMedCare V12.0 - Migration 0050
-- Aggiornamento template email_invio_contratto
-- Data: 2026-02-11
-- 
-- MODIFICHE:
-- 1. Ordine box: brochure PRIMA, contratto DOPO
-- 2. Nuovo testo introduttivo con dispositivo prescelto
-- 3. Nuovi prossimi passi: firma elettronica o cartacea + proforma + consegna

UPDATE document_templates
SET 
  html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #3b82f6; border-radius: 5px; }
    .info-box h3 { margin-top: 0; color: #1e40af; }
    .button { background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
    .button:hover { background: #2563eb; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    .highlight { background: #fef3c7; padding: 3px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Il tuo contratto è pronto!</h1>
      <p>TeleMedCare V12.0</p>
    </div>
    <div class="content">
      <p>Gentile <strong>{{NOME_CLIENTE}} {{COGNOME_CLIENTE}}</strong>,</p>
      
      <p>Siamo lieti di accompagnarLa in questo importante passo verso una maggiore sicurezza e tranquillità.</p>
      
      <p>Come promesso, in allegato trova la <strong>brochure del dispositivo {{DISPOSITIVO}}</strong> prescelto e il <strong>contratto per il servizio {{PIANO_SERVIZIO}}</strong>, selezionati in base alle Sue preferenze e alle caratteristiche innovative che meglio rispondono alle Sue esigenze.</p>

      <!-- BOX 1: BROCHURE (PRIMO) -->
      <div class="info-box">
        <h3>📘 Brochure del Dispositivo</h3>
        <p>Scopra tutte le funzionalità del dispositivo <strong>{{DISPOSITIVO}}</strong>:</p>
        <ul>
          <li>Caratteristiche tecniche avanzate</li>
          <li>Modalità d''uso e configurazione</li>
          <li>Benefici per la Sua sicurezza e salute</li>
        </ul>
        <a href="{{LINK_BROCHURE}}" class="button">📥 Scarica Brochure</a>
      </div>

      <!-- BOX 2: CONTRATTO (SECONDO) -->
      <div class="info-box">
        <h3>📋 Contratto di Servizio</h3>
        <p><strong>Dettagli del servizio:</strong></p>
        <ul>
          <li><strong>Servizio:</strong> {{PIANO_SERVIZIO}}</li>
          <li><strong>Prezzo annuale:</strong> €{{PREZZO_PIANO}} (IVA esclusa)</li>
          <li><strong>Codice Cliente:</strong> {{CODICE_CLIENTE}}</li>
          <li><strong>Codice Contratto:</strong> {{CODICE_CONTRATTO}}</li>
        </ul>
        <a href="{{LINK_FIRMA}}" class="button">✍️ Firma il Contratto Online</a>
      </div>

      <!-- PROSSIMI PASSI PER L''ATTIVAZIONE -->
      <div class="info-box">
        <h3>✅ Prossimi passi per l''attivazione</h3>
        
        <p><strong>📝 Può scegliere tra due opzioni:</strong></p>
        
        <p><strong>OPZIONE 1 - Firma Elettronica (Consigliata)</strong></p>
        <ol>
          <li>Clicchi sul pulsante <span class="highlight">"Firma il Contratto Online"</span> qui sopra</li>
          <li>Firmi il contratto direttamente dal Suo PC, tablet o smartphone</li>
          <li>Una volta firmato, riceverà automaticamente la <strong>proforma</strong> con tutte le informazioni per effettuare il bonifico</li>
        </ol>
        
        <p><strong>OPZIONE 2 - Firma Cartacea</strong></p>
        <ol>
          <li>Stampi il contratto allegato</li>
          <li>Legga attentamente tutte le pagine</li>
          <li>Firmi in ogni pagina richiesta e nell''ultima pagina</li>
          <li>Ci invii il contratto firmato via <strong>email</strong> o <strong>WhatsApp</strong></li>
          <li>Riceverà quindi la <strong>proforma</strong> con tutte le informazioni per effettuare il bonifico</li>
        </ol>
        
        <p style="margin-top: 20px;"><strong>📦 Ricezione del dispositivo:</strong><br>
        Il dispositivo Le sarà consegnato entro <strong>10 giorni lavorativi</strong> dall''arrivo del pagamento.</p>
      </div>
      
      <p style="margin-top: 30px;">Per qualsiasi domanda o chiarimento, non esiti a contattarci.</p>
      
      <p>Cordiali saluti,<br>
      <strong>Il Team TeleMedCare</strong></p>
    </div>
    <div class="footer">
      <p>TeleMedCare V12.0 - Sistema di Telemedicina Avanzato</p>
      <p>📧 info@telemedcare.it | 📞 +39 080 123 4567</p>
      <p>Data invio: {{DATA_INVIO}}</p>
    </div>
  </div>
</body>
</html>',
  variables = '["NOME_CLIENTE", "COGNOME_CLIENTE", "PIANO_SERVIZIO", "DISPOSITIVO", "PREZZO_PIANO", "CODICE_CLIENTE", "CODICE_CONTRATTO", "LINK_BROCHURE", "LINK_FIRMA", "DATA_INVIO"]',
  updated_at = datetime('now')
WHERE id = 'email_invio_contratto';
