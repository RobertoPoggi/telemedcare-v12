-- TeleMedCare V11.0 - Migration 0004
-- Aggiungi template email mancanti
-- Data: 2025-11-07

-- Template documenti informativi (MANCAVA!)
INSERT OR REPLACE INTO document_templates (id, name, type, subject, html_content, variables, category, active) VALUES
('email_documenti_informativi', 'Invio Documenti Informativi', 'email',
 '📚 TeleMedCare - Documenti Informativi Richiesti',
 '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4; }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
    .document-list { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; }
    .button { background: #0ea5e9; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 I Tuoi Documenti Informativi</h1>
      <p>TeleMedCare - Sistema di Telemedicina</p>
    </div>
    <div class="content">
      <p>Gentile <strong>{{NOME_CLIENTE}} {{COGNOME_CLIENTE}}</strong>,</p>
      
      <p>Come richiesto, allegate troverai la documentazione informativa sul nostro servizio <strong>TeleMedCare {{TIPO_SERVIZIO}}</strong>.</p>
      
      <div class="document-list">
        <h3 style="margin-top: 0; color: #0ea5e9;">📎 Documenti Allegati</h3>
        <p>I documenti sono allegati a questa email in formato PDF:</p>
        <ul>
          <li><strong>Brochure TeleMedCare</strong> - Panoramica completa dei servizi</li>
          <li><strong>Manuale Utente SiDLY</strong> - Guida all''uso del dispositivo</li>
        </ul>
      </div>
      
      <h3>📋 Prossimi Passi</h3>
      <p>Dopo aver letto la documentazione:</p>
      <ol>
        <li>Contattaci per qualsiasi domanda o chiarimento</li>
        <li>Se interessato, possiamo inviarti il contratto da firmare</li>
        <li>Ti guideremo in ogni fase del processo di attivazione</li>
      </ol>
      
      <p style="margin-top: 30px;">
        <strong>Hai domande?</strong><br>
        Il nostro team è a tua disposizione per qualsiasi chiarimento.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="mailto:info@telemedcare.it" class="button">📧 Contattaci</a>
        <a href="tel:+390801234567" class="button">📞 Chiamaci</a>
      </div>
      
      <p>Cordiali saluti,<br>
      <strong>Il Team TeleMedCare</strong></p>
    </div>
    <div class="footer">
      <p><strong>TeleMedCare V11.0</strong> - Sistema di Telemedicina Avanzato</p>
      <p>📧 info@telemedcare.it | 📞 +39 080 123 4567</p>
      <p style="margin-top: 10px; font-size: 10px;">
        Hai ricevuto questa email perché hai richiesto informazioni sui nostri servizi il {{DATA_RICHIESTA}}<br>
        Per modificare le tue preferenze, contattaci a info@telemedcare.it
      </p>
    </div>
  </div>
</body>
</html>',
 '["NOME_CLIENTE", "COGNOME_CLIENTE", "TIPO_SERVIZIO", "DATA_RICHIESTA"]',
 'workflow', 1);
