-- =====================================================
-- Migration 0007: Template email_documenti_informativi
-- =====================================================
-- Data Creazione: 02 Gennaio 2026 - 09:35
-- Autore: Sistema Automatico
-- Scopo: Aggiunge template email per invio brochure/documenti
-- Database: telemedcare-leads
-- =====================================================

INSERT INTO document_templates (id, name, type, subject, html_content, variables, category, active, created_at, updated_at) VALUES
('email_documenti_informativi', 'Invio Documenti Informativi', 'email',
 '📚 eCura - Documenti informativi {{SERVIZIO}}',
 '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 Documenti Informativi eCura</h1>
      <p>I tuoi documenti sono pronti</p>
    </div>
    <div class="content">
      <p>Gentile <strong>{{NOME_CLIENTE}}</strong>,</p>
      
      <p>Grazie per il tuo interesse in <strong>eCura {{SERVIZIO}}</strong>.</p>
      
      <p>In allegato trovi la documentazione completa del servizio richiesto.</p>
      
      <p><strong>Contenuto allegati:</strong></p>
      <ul>
        <li>Brochure tecnica del dispositivo</li>
        <li>Caratteristiche del servizio {{PIANO}}</li>
        <li>Informazioni sui vantaggi fiscali</li>
      </ul>
      
      <p>Per qualsiasi domanda o per procedere con l''attivazione del servizio, non esitare a contattarci.</p>
      
      <p style="margin-top: 30px;">Cordiali saluti,<br>
      <strong>Il Team eCura</strong></p>
    </div>
    <div class="footer">
      <p>eCura - Servizi di Telemedicina</p>
      <p>📧 info@medicagb.it | 📞 335 7301206</p>
    </div>
  </div>
</body>
</html>',
 '["NOME_CLIENTE", "SERVIZIO", "PIANO", "LEAD_ID"]',
 'workflow', 
 1,
 '2026-01-02 09:35:00',
 '2026-01-02 09:35:00');
