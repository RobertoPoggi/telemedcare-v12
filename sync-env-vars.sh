#!/bin/bash
# Script per sincronizzare environment variables da Production a Preview

PROJECT="telemedcare-v12"

echo "📋 Lista variabili in Production:"
npx wrangler pages project list

echo ""
echo "⚠️  NOTA: Per clonare le variabili, devi farlo manualmente dal dashboard"
echo "   oppure usare l'API di Cloudflare."
echo ""
echo "🔗 Dashboard: https://dash.cloudflare.com/pages/view/$PROJECT/settings/environment-variables"
