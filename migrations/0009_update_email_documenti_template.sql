-- Migration: 0009_update_email_documenti_template.sql
-- Description: Aggiorna template email_documenti_informativi con nuovo design
-- Date: 2025-11-07
-- Author: Sistema

-- Aggiorna il template con il nuovo design HTML
-- Nota: Il contenuto HTML completo verrà inserito durante il deploy
UPDATE document_templates 
SET 
  html_content = '<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documenti Informativi TeleMedCare</title>
    <style>
      body { max-width: 600px; margin: 0 auto; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
      .email-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
      .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
      .content { padding: 30px; }
      .greeting { font-size: 16px; color: #1e40af; font-weight: 600; margin-bottom: 20px; }
      .info-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
      .info-box h3 { margin: 0 0 10px 0; color: #1e40af; font-size: 16px; }
      .documents-section { background: #fffbeb; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 25px 0; }
      .documents-section h3 { margin: 0 0 15px 0; color: #d97706; font-size: 16px; }
      .document-item { padding: 8px 0; display: flex; align-items: center; }
      .document-item::before { content: "📄"; margin-right: 10px; font-size: 18px; }
      .cta-box { background: #dbeafe; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center; }
      .cta-box p { margin: 0; color: #1e40af; font-weight: 600; }
      .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
      .contact-info { margin: 15px 0; padding: 15px; background: white; border-radius: 6px; font-size: 14px; }
      ul { margin: 10px 0; padding-left: 20px; }
      li { margin: 8px 0; }
      @media (max-width: 640px) { body { padding: 10px; } .content { padding: 20px; } }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>📚 Documentazione TeleMedCare</h1>
            <p>La tecnologia che Le salva salute e vita</p>
        </div>
        <div class="content">
            <div class="greeting">Gentile {{NOME_CLIENTE}} {{COGNOME_CLIENTE}},</div>
            <p>La ringraziamo per l''interesse mostrato nei confronti di <strong>TeleMedCare</strong>, il servizio di telemedicina e teleassistenza che unisce tecnologia avanzata e cura della persona.</p>
            <p>Come da Lei richiesto, Le inviamo in allegato la documentazione informativa sui nostri servizi.</p>
            <div class="documents-section">
                <h3>📦 Documenti Allegati a Questa Email</h3>
                {{BROCHURE_HTML}}
                {{MANUALE_HTML}}
            </div>
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
            <div class="info-box">
                <h3>✨ Perché Scegliere TeleMedCare?</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>🏥 <strong>Dispositivo Certificato</strong> - Classe IIa Certificato CE, conforme normative europee</li>
                    <li>📡 <strong>Connessione H24</strong> - Sempre collegati con la Centrale Operativa attiva 24/7</li>
                    <li>⚡ <strong>Risposta Rapida</strong> - Intervento immediato in caso di emergenza o necessità</li>
                    <li>💰 <strong>Detraibile Fiscalmente</strong> - Spesa sanitaria detraibile al 19% nella dichiarazione</li>
                    <li>👨‍⚕️ <strong>Supporto Medico</strong> - Team di professionisti sanitari sempre disponibili</li>
                    <li>🔒 <strong>Privacy Garantita</strong> - Dati protetti secondo normativa GDPR</li>
                </ul>
            </div>
            <p><strong>🔔 Prossimi Passi:</strong></p>
            <ol style="margin: 10px 0; padding-left: 25px;">
                <li>Esamini con calma la documentazione allegata</li>
                <li>Per qualsiasi domanda o chiarimento, ci contatti senza impegno</li>
                <li>Quando sarà pronto/a, Le invieremo il contratto personalizzato da firmare</li>
                <li>Dopo la firma, attiveremo il servizio entro 10 giorni lavorativi</li>
                <li>Riceverà il dispositivo SiDLY Care Pro direttamente a casa con istruzioni complete</li>
            </ol>
            <div class="cta-box">
                <p style="margin: 0 0 8px 0;">💬 Domande o Dubbi?</p>
                <p style="margin: 0; font-weight: normal; font-size: 14px;">Il nostro team è a Sua completa disposizione.<br>Ci contatti senza impegno per una consulenza gratuita!</p>
            </div>
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
        <div class="footer">
            <p style="margin: 5px 0;"><strong>TeleMedCare</strong> - Medica GB S.r.l.</p>
            <p style="margin: 5px 0;">Corso Giuseppe Garibaldi, 34 - 20121 Milano</p>
            <p style="margin: 5px 0;">P.IVA: 12435130963</p>
            <p style="margin: 15px 0 5px; font-size: 12px;">Ricevuta questa email per errore? <a href="mailto:privacy@telemedcare.it" style="color: #3b82f6;">Contattaci</a></p>
        </div>
    </div>
</body>
</html>',
  updated_at = datetime('now')
WHERE id = 'email_documenti_informativi';

-- Verifica aggiornamento
SELECT id, name, length(html_content) as html_size, updated_at 
FROM document_templates 
WHERE id = 'email_documenti_informativi';
