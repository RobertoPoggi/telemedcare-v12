#!/bin/bash

# Script per scaricare tutti i template TeleMedCare
BASE_DIR="/home/user/webapp/templates"

echo "📥 Download Template TeleMedCare..."
echo ""

# Email Templates
echo "📧 Email Templates..."
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/bfc4d973-f2e7-4b32-a856-32fe59fc99fb" -o "$BASE_DIR/email/email_documenti_informativi_simple.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/2cbc4e4c-1dc5-422f-ab7f-6641177ca43a" -o "$BASE_DIR/email/email_cancellazione.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/3562b02c-e1bd-4f59-a80c-14a93b592eed" -o "$BASE_DIR/email/email_conferma_attivazione.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/dd75bb7b-4064-4b23-ae73-4a4eca995b11" -o "$BASE_DIR/email/email_invio_contratto.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/7090e88a-3932-43e2-8ac3-ac0826600d8e" -o "$BASE_DIR/email/email_invio_proforma.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/bc63c5c4-769f-4f12-b1ad-1dd51adb3752" -o "$BASE_DIR/email/email_promemoria_followup.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/ba54a1ad-ec18-4d9f-9c73-83fb7ef84f99" -o "$BASE_DIR/email/email_spedizione.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/075886ce-441d-4899-bfad-f1b9de86f03a" -o "$BASE_DIR/email/email_promemoria_pagamento.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/1feb1fc2-b9dd-49c4-b3ee-176d86c51b93" -o "$BASE_DIR/email/email_promemoria.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/bc0e85e7-a2fa-4e52-a8ee-cf3d5303842c" -o "$BASE_DIR/email/email_notifica_info.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/be84a6ed-8bbf-40ed-9dce-09fd2a12dd2f" -o "$BASE_DIR/email/email_followup_call.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/f73a0a46-6c03-4028-a2d8-901337885960" -o "$BASE_DIR/email/Email_Template_Chiarimenti_Servizi.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/19ca24bd-3efc-4021-b0e5-152a5f62b088" -o "$BASE_DIR/email/email_conferma.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/3383e772-dd8d-47fd-9eaa-b102c5c1e62a" -o "$BASE_DIR/email/email_consegna.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/dd4d5386-b869-4f54-9edb-2df36fea9a31" -o "$BASE_DIR/email/email_conferma_ordine.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/d5941c69-26de-4586-8f5e-8aa79a018be7" -o "$BASE_DIR/email/email_documenti_informativi.html"

echo "✅ 16 Email templates scaricati"
echo ""

# Contract Templates
echo "📄 Contract Templates..."
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/b9dd4bdb-6952-43e8-9999-0e9fb141af73" -o "$BASE_DIR/contracts/contratto_vendita.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/d5e18ff5-0a0b-4e65-b2cc-dc5bb767fc37" -o "$BASE_DIR/contracts/Template_Contratto_Avanzato_TeleMedCare.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/8ec0fa22-9d7e-40c2-8ea1-7e9613d4418e" -o "$BASE_DIR/contracts/Template_Contratto_Base_TeleMedCare.html"

echo "✅ 3 Contract templates scaricati"
echo ""

# Proforma Templates
echo "💰 Proforma Templates..."
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/e4c9a326-dbd8-4fcf-822e-17affe6268f4" -o "$BASE_DIR/proforma/proforma_commerciale.html"
curl -s "https://page.gensparksite.com/get_upload_url/b30264f639f6e2249e674de75e9670bae99abf0d3c1b265044f490094829b16d/default/f6c63140-0302-48b9-8c17-0d3ae08d289e" -o "$BASE_DIR/proforma/Template_Proforma_Unificato_TeleMedCare.html"

echo "✅ 2 Proforma templates scaricati"
echo ""

echo "═══════════════════════════════════════════"
echo "🎉 DOWNLOAD COMPLETATO!"
echo "═══════════════════════════════════════════"
echo ""
echo "📊 Riepilogo:"
echo "  📧 Email: 16 templates"
echo "  📄 Contracts: 3 templates"
echo "  💰 Proforma: 2 templates"
echo "  📦 Totale: 21 templates"
echo ""
echo "📂 Directory: /home/user/webapp/templates/"
echo ""
