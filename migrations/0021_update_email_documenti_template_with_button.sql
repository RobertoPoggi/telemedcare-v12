UPDATE document_templates 
SET 
  html_content = '<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Documenti Informativi TeleMedCare</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f6f8">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f8;padding:20px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:white;border-radius:8px">
<tr><td style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);color:white;padding:30px;text-align:center">
<h1 style="margin:0;font-size:24px">📋 Documenti Informativi</h1>
<p style="margin:10px 0 0;font-size:14px">TeleMedCare - La sua salute, sempre connessa</p>
</td></tr>
<tr><td style="padding:30px">
<p style="margin:0 0 15px">Gentile <strong>{{NOME_CLIENTE}}</strong>,</p>
<p style="margin:0 0 15px">La ringraziamo per l interesse nei nostri servizi TeleMedCare. Come richiesto, Le inviamo la documentazione relativa al piano <strong>{{PACCHETTO}}</strong> per {{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}}.</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:25px 0;background:#f0f9ff;border:2px solid #3b82f6;border-radius:8px">
<tr><td style="padding:25px;text-align:center">
<h3 style="margin:0 0 10px;color:#1e40af;font-size:16px">📄 Brochure {{DISPOSITIVO}}</h3>
<p style="margin:0 0 20px;font-size:14px;color:#666">Documentazione tecnica completa del dispositivo</p>
<table cellpadding="0" cellspacing="0" border="0" align="center">
<tr><td style="background-color:#3b82f6;border-radius:6px;text-align:center">
<a href="{{BROCHURE_URL}}" style="display:inline-block;color:#ffffff;text-decoration:none;padding:14px 32px;font-weight:bold;font-size:16px;font-family:Arial,sans-serif">📥 Scarica Brochure {{DISPOSITIVO}}</a>
</td></tr>
</table>
<p style="margin:15px 0 0;font-size:11px;color:#999">Se il pulsante non funziona, copi questo link:<br><a href="{{BROCHURE_URL}}" style="color:#3b82f6;word-break:break-all">{{BROCHURE_URL}}</a></p>
</td></tr>
</table>
<p style="margin:20px 0 10px;font-size:14px"><strong>📋 Documentazione inclusa:</strong></p>
<ul style="margin:0 0 20px;padding-left:20px;font-size:14px">
<li style="margin-bottom:8px">Brochure TeleMedCare - Panoramica servizi</li>
<li style="margin-bottom:8px">Scheda Tecnica {{DISPOSITIVO}}</li>
<li style="margin-bottom:8px">Informativa Prezzi e Piani</li>
<li style="margin-bottom:8px">Informativa Privacy e GDPR</li>
</ul>
<p style="margin:0 0 15px;font-size:14px">Non esiti a contattarci per qualsiasi chiarimento.</p>
<p style="margin:25px 0 0">Cordiali saluti,<br><strong>Il Team TeleMedCare - Medica GB S.r.l.</strong></p>
</td></tr>
<tr><td style="background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#6b7280">
<p style="margin:0 0 5px"><strong>TeleMedCare</strong> - Medica GB S.r.l.</p>
<p style="margin:0">📧 info@telemedcare.it | 📞 +39 331 643 2390</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>',
  variables = '["NOME_CLIENTE","COGNOME_CLIENTE","NOME_ASSISTITO","COGNOME_ASSISTITO","PACCHETTO","DISPOSITIVO","BROCHURE_URL","PIANO","SERVIZIO","LEAD_ID"]',
  updated_at = datetime('now')
WHERE id = 'email_documenti_informativi';
