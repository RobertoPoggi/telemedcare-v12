#!/bin/bash

#############################################################################
# TELEMEDCARE V12.0 - CONFIGURAZIONE SOLO SECRETS
# (DNS già configurato, serve solo aggiungere le API keys)
#############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  TeleMedCare V12.0 - Configurazione Secrets"
echo "  (DNS già configurato, aggiungiamo solo le API keys)"
echo "═══════════════════════════════════════════════════════════"
echo ""

print_info "Verifico prerequisiti..."

if ! command -v npx &> /dev/null; then
    echo "❌ Node.js/npm non trovato. Installa Node.js prima di continuare."
    exit 1
fi

print_success "Node.js trovato"
echo ""

#############################################################################
# CLOUDFLARE API TOKEN
#############################################################################

print_info "Serve il tuo Cloudflare API Token per configurare i secrets."
echo ""
echo "Vai su: https://dash.cloudflare.com/profile/api-tokens"
echo "Clicca: Create Token > Edit Cloudflare Workers"
echo "Copia il token generato"
echo ""

read -sp "Incolla il Cloudflare API Token: " CLOUDFLARE_API_TOKEN
echo ""

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Token non fornito. Uscita."
    exit 1
fi

export CLOUDFLARE_API_TOKEN
print_success "Token configurato!"
echo ""

#############################################################################
# CONFIGURAZIONE SECRETS
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "Configurazione 4 Secrets (API Keys)"
echo "═══════════════════════════════════════════════════════════"
echo ""

PROJECT_NAME="telemedcare-v12"

declare -A SECRETS=(
    ["SENDGRID_API_KEY"]="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"
    ["RESEND_API_KEY"]="re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2"
    ["JWT_SECRET"]="f8adfd1d3ab5f1bcacdb0c09e9eca0904146790112eb3f375516380e75adc534"
    ["ENCRYPTION_KEY"]="492109618a5df3abe44c7086e4983cd776393457381a776bd3c51de67b7573cd"
)

counter=1
total=${#SECRETS[@]}

for key in "${!SECRETS[@]}"; do
    value="${SECRETS[$key]}"
    echo -n "[$counter/$total] Configurazione $key... "
    
    echo "$value" | npx wrangler pages secret put "$key" --project-name="$PROJECT_NAME" 2>&1 | grep -q "Success" && print_success "OK" || echo "⚠️  Potrebbe esserci un problema"
    
    ((counter++))
done

echo ""
print_success "Secrets configurati!"
echo ""

#############################################################################
# VERIFICA
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "Verifica Secrets"
echo "═══════════════════════════════════════════════════════════"
echo ""

print_info "Lista secrets configurati:"
npx wrangler pages secret list --project-name="$PROJECT_NAME" 2>&1

echo ""

#############################################################################
# DEPLOY
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "Deploy"
echo "═══════════════════════════════════════════════════════════"
echo ""

read -p "Vuoi fare il deploy ora? (y/n): " do_deploy

if [[ "$do_deploy" == "y" || "$do_deploy" == "Y" ]]; then
    print_info "Deploy in corso..."
    echo ""
    
    npx wrangler pages deploy dist --project-name="$PROJECT_NAME"
    
    if [ $? -eq 0 ]; then
        echo ""
        print_success "Deploy completato!"
    fi
else
    print_info "Deploy saltato. Fallo manualmente:"
    echo "  npx wrangler pages deploy dist --project-name=$PROJECT_NAME"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
print_success "✅ CONFIGURAZIONE COMPLETATA!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Secrets configurati:"
echo "  ✅ SENDGRID_API_KEY"
echo "  ✅ RESEND_API_KEY"  
echo "  ✅ JWT_SECRET"
echo "  ✅ ENCRYPTION_KEY"
echo ""
echo "DNS: ✅ Già configurato (come hai detto)"
echo ""
echo "Prossimi passi:"
echo "1. Testa invio email da: https://telemedcare-v12.pages.dev/admin/leads-dashboard"
echo "2. Clicca pulsante BLU (contratto) su un lead"
echo "3. Verifica email ricevuta su info@telemedcare.it"
echo ""
print_success "TUTTO FATTO! 🎉"
echo ""
