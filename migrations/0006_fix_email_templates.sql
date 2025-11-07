-- Migration 0006: Fix email templates per match con aspettative Roberto
-- Basato sui PDF ricevuti via email

-- ============================================
-- FIX TEMPLATE EMAIL DOCUMENTI INFORMATIVI
-- ============================================
UPDATE document_templates 
SET 
  subject = '📚 TeleMedCare - Documenti Informativi Richiesti',
  html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>TeleMedCare - Documenti Informativi</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0b63a5; margin: 0;">TeleMedCare</h1>
    <p style="color: #666; font-style: italic; margin: 5px 0;">"La tecnologia che Le salva salute e vita"</p>
  </div>

  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #0b63a5; margin-top: 0;">📚 I Tuoi Documenti Informativi</h2>
  </div>

  <p>Gentile <strong>{{NOME_CLIENTE}}</strong>,</p>

  <p>Grazie per l''interesse dimostrato nei confronti di <strong>TeleMedCare</strong>.</p>

  <p>Come richiesto, allegate troverai tutta la documentazione informativa sul nostro servizio di telemedicina:</p>

  <div style="background: #e8f4f8; border-left: 4px solid #0b63a5; padding: 15px; margin: 20px 0;">
    <h3 style="margin-top: 0;">📎 Documenti Allegati</h3>
    <ul style="margin: 10px 0;">
      <li><strong>Brochure TeleMedCare</strong> - Presentazione completa del servizio</li>
      <li><strong>Manuale Utente SiDLY</strong> - Guida all''utilizzo del dispositivo</li>
    </ul>
  </div>

  <p>Questi documenti contengono tutte le informazioni necessarie per comprendere i benefici del nostro servizio di telemedicina e assistenza H24.</p>

  <h3 style="color: #0b63a5;">🏥 Servizi TeleMedCare</h3>
  <ul>
    <li><strong>Monitoraggio H24</strong> dei parametri vitali</li>
    <li><strong>Centrale Operativa</strong> sempre attiva</li>
    <li><strong>Dispositivo SiDLY</strong> facile da usare</li>
    <li><strong>Assistenza Dedicata</strong> per ogni necessità</li>
  </ul>

  <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
    <p style="margin: 0;"><strong>💡 Hai bisogno di ulteriori informazioni?</strong></p>
    <p style="margin: 5px 0 0 0;">Siamo a tua disposizione per qualsiasi chiarimento o domanda.</p>
  </div>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
    <h3 style="color: #0b63a5;">📞 Contattaci</h3>
    <p style="margin: 5px 0;">
      <strong>Email:</strong> <a href="mailto:info@telemedcare.it" style="color: #0b63a5;">info@telemedcare.it</a><br>
      <strong>Telefono:</strong> +39 02 1234567<br>
      <strong>Sito Web:</strong> <a href="https://www.telemedcare.it" style="color: #0b63a5;">www.telemedcare.it</a>
    </p>
  </div>

  <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
    <p>Questa email è stata inviata da <strong>Medica GB S.r.l.</strong></p>
    <p style="margin: 5px 0;">Startup Innovativa a Vocazione Sociale</p>
    <p style="margin: 5px 0;">Via Garibaldi, 34 - 20121 Milano - P.IVA 12435130963</p>
  </div>

</body>
</html>'
WHERE id = 'email_documenti_informativi';

-- ============================================
-- FIX TEMPLATE EMAIL INVIO CONTRATTO
-- ============================================
UPDATE document_templates
SET
  subject = '📄 TeleMedCare - Il Tuo Contratto {{TIPO_SERVIZIO}}',
  html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>TeleMedCare - Contratto</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0b63a5; margin: 0;">TeleMedCare</h1>
    <p style="color: #666; font-style: italic; margin: 5px 0;">"La tecnologia che Le salva salute e vita"</p>
  </div>

  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #0b63a5; margin-top: 0;">📄 Il Tuo Contratto {{TIPO_SERVIZIO}}</h2>
  </div>

  <p>Gentile <strong>{{NOME_CLIENTE}}</strong>,</p>

  <p>Siamo lieti di accompagnarLa nel percorso di attivazione del servizio <strong>TeleMedCare {{TIPO_SERVIZIO}}</strong>.</p>

  <p>In allegato troverai il contratto di servizio pre-compilato con i dati forniti.</p>

  <div style="background: #e8f4f8; border-left: 4px solid #0b63a5; padding: 15px; margin: 20px 0;">
    <h3 style="margin-top: 0;">📋 Dettagli Contratto</h3>
    <p style="margin: 5px 0;"><strong>Codice Contratto:</strong> {{CODICE_CONTRATTO}}</p>
    <p style="margin: 5px 0;"><strong>Servizio:</strong> TeleMedCare {{TIPO_SERVIZIO}}</p>
    <p style="margin: 5px 0;"><strong>Prezzo:</strong> {{PREZZO_PIANO}}</p>
  </div>

  <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
    <h3 style="margin-top: 0;">📝 Prossimi Passi</h3>
    <ol style="margin: 10px 0; padding-left: 20px;">
      <li><strong>Scarica il contratto</strong> allegato a questa email</li>
      <li><strong>Leggi attentamente</strong> tutte le clausole</li>
      <li><strong>Firma il documento</strong> utilizzando il link fornito</li>
      <li><strong>Riceverai la proforma</strong> per procedere con il pagamento</li>
    </ol>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="{{LINK_FIRMA}}" style="display: inline-block; background: #0b63a5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
      ✍️ Firma il Contratto
    </a>
  </div>

  <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0;">
    <p style="margin: 0;"><strong>💡 Domande?</strong></p>
    <p style="margin: 5px 0 0 0;">Il nostro team è a tua disposizione per qualsiasi chiarimento.</p>
  </div>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
    <h3 style="color: #0b63a5;">📞 Contattaci</h3>
    <p style="margin: 5px 0;">
      <strong>Email:</strong> <a href="mailto:info@telemedcare.it" style="color: #0b63a5;">info@telemedcare.it</a><br>
      <strong>Telefono:</strong> +39 02 1234567
    </p>
  </div>

  <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
    <p>Questa email è stata inviata da <strong>Medica GB S.r.l.</strong></p>
    <p style="margin: 5px 0;">Startup Innovativa a Vocazione Sociale</p>
  </div>

</body>
</html>'
WHERE id = 'email_invio_contratto';
