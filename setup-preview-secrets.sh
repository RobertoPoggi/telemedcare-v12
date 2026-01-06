#!/bin/bash
# Script finale per configurare TUTTE le environment variables su Preview
# Usa wrangler pages secret bulk per impostare le secret

echo "🔐 Configurazione Environment Variables su Preview"
echo "=================================================="

cd /home/user/webapp

export CLOUDFLARE_API_TOKEN="7qHv_fdmFEXaRI8v1LKOTXWC7P7iPaYXB4-9HqqD"
export CLOUDFLARE_ACCOUNT_ID="8eee3bb064814aa60b770a979332a914"

echo ""
echo "📝 Configurazione variabili Preview..."
echo ""

# Set RESEND_API_KEY
echo "1/4 RESEND_API_KEY..."
echo "re_Pnq97oxZ_Mc2X78wVvsaxDHZhpvpA8JGt" | npx wrangler pages secret put RESEND_API_KEY --project-name=telemedcare-v12 --env=preview

# Set SENDGRID_API_KEY  
echo "2/4 SENDGRID_API_KEY..."
echo "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" | npx wrangler pages secret put SENDGRID_API_KEY --project-name=telemedcare-v12 --env=preview

# Set EMAIL_FROM
echo "3/4 EMAIL_FROM..."
echo "info@telemedcare.it" | npx wrangler pages secret put EMAIL_FROM --project-name=telemedcare-v12 --env=preview

# Set EMAIL_TO_INFO
echo "4/4 EMAIL_TO_INFO..."
echo "info@telemedcare.it" | npx wrangler pages secret put EMAIL_TO_INFO --project-name=telemedcare-v12 --env=preview

echo ""
echo "✅ Configurazione completata!"
echo ""
echo "Attendi 2-3 minuti per il redeploy automatico di Cloudflare Pages"
echo "Poi testa: https://genspark-ai-developer.telemedcare-v12.pages.dev/api/debug/env"
