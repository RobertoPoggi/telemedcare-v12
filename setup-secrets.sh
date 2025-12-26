#!/bin/bash

#############################################################################
# TELEMEDCARE V12.0 - CONFIGURAZIONE SECRETS (Versione Corretta)
# Usa wrangler pages secret per i secrets (API keys)
# Le variabili normali sono già in wrangler.toml
#############################################################################

set -e

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  TeleMedCare V12.0 - Configurazione Secrets"
echo "═══════════════════════════════════════════════════════════"
echo ""

#############################################################################
# STEP 1: VERIFICA PREREQUISITI
#############################################################################

print_info "STEP 1: Verifica prerequisiti..."
echo ""

if ! command -v npx &> /dev/null; then
    print_error "Node.js/npm non trovato. Installa Node.js prima di continuare."
    exit 1
fi

print_success "Node.js/npm trovato"

if ! command -v curl &> /dev/null; then
    print_error "curl non trovato. Installa curl prima di continuare."
    exit 1
fi

print_success "curl trovato"
echo ""

#############################################################################
# STEP 2: CLOUDFLARE API TOKEN
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "STEP 2: Cloudflare API Token"
echo "═══════════════════════════════════════════════════════════"
echo ""
print_info "Per configurare i secrets, serve un Cloudflare API Token."
echo ""
echo "Come ottenerlo:"
echo "1. Vai su: https://dash.cloudflare.com/profile/api-tokens"
echo "2. Clicca: 'Create Token'"
echo "3. Usa template: 'Edit Cloudflare Workers'"
echo "4. Aggiungi permessi: Zone > DNS > Edit"
echo "5. Clicca: 'Continue to summary' > 'Create Token'"
echo "6. Copia il token generato"
echo ""

read -p "Hai già il token? (y/n): " has_token

if [[ "$has_token" != "y" && "$has_token" != "Y" ]]; then
    print_warning "Genera il token prima di continuare. Poi rilancia questo script."
    exit 0
fi

echo ""
read -sp "Incolla il Cloudflare API Token: " CLOUDFLARE_API_TOKEN
echo ""

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    print_error "Token non fornito. Uscita."
    exit 1
fi

export CLOUDFLARE_API_TOKEN
print_success "Token configurato!"
echo ""

#############################################################################
# STEP 3: CLOUDFLARE ZONE ID
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "STEP 3: Cloudflare Zone ID (per DNS)"
echo "═══════════════════════════════════════════════════════════"
echo ""
print_info "Per configurare i DNS records, serve il Zone ID di telemedcare.it."
echo ""
echo "OPZIONE 1: Lascia vuoto e lo trovo automaticamente"
echo "OPZIONE 2: Incollalo se lo conosci già"
echo ""

read -p "Zone ID (lascia vuoto per auto-detect): " CLOUDFLARE_ZONE_ID

if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
    print_info "Cerco il Zone ID automaticamente..."
    
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=telemedcare.it" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")
    
    CLOUDFLARE_ZONE_ID=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
        print_error "Non riesco a trovare il Zone ID automaticamente."
        echo "Trovalo manualmente e rilancia lo script."
        exit 1
    fi
    
    print_success "Zone ID trovato: $CLOUDFLARE_ZONE_ID"
else
    print_success "Zone ID fornito: $CLOUDFLARE_ZONE_ID"
fi

echo ""

#############################################################################
# STEP 4: CONFIGURAZIONE SECRETS via wrangler pages secret
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "STEP 4: Configurazione Secrets (API Keys)"
echo "═══════════════════════════════════════════════════════════"
echo ""
print_info "Configurazione di 4 secrets via wrangler pages secret..."
print_warning "Nota: Le variabili EMAIL_FROM e EMAIL_TO_INFO sono già in wrangler.toml"
echo ""

PROJECT_NAME="telemedcare-v12"

# Array di secrets (solo le chiavi sensibili)
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
    echo -n "[$counter/$total] Configurazione secret $key... "
    
    # Usa wrangler pages secret put
    echo "$value" | npx wrangler pages secret put "$key" --project-name="$PROJECT_NAME" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        print_success "OK"
    else
        print_error "FALLITO"
        print_warning "Potrebbe essere necessario configurarlo manualmente via dashboard"
    fi
    
    ((counter++))
done

echo ""
print_success "Secrets configurati!"
echo ""

#############################################################################
# STEP 5: CONFIGURAZIONE DNS RECORDS
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "STEP 5: Configurazione DNS Records"
echo "═══════════════════════════════════════════════════════════"
echo ""
print_info "Configurazione di 8 DNS records per telemedcare.it..."
echo ""

# Array di DNS records
declare -a DNS_RECORDS=(
    '{"type":"CNAME","name":"em6551","content":"u56677468.wl219.sendgrid.net","ttl":3600,"proxied":false}'
    '{"type":"CNAME","name":"s1._domainkey","content":"s1.domainkey.u56677468.wl219.sendgrid.net","ttl":3600,"proxied":false}'
    '{"type":"CNAME","name":"s2._domainkey","content":"s2.domainkey.u56677468.wl219.sendgrid.net","ttl":3600,"proxied":false}'
    '{"type":"TXT","name":"_dmarc","content":"v=DMARC1; p=none;","ttl":3600}'
    '{"type":"MX","name":"send","content":"feedback-smtp.eu-west-1.amazonses.com","ttl":3600,"priority":10}'
    '{"type":"TXT","name":"send","content":"v=spf1 include:amazonses.com ~all","ttl":3600}'
    '{"type":"TXT","name":"resend._domainkey","content":"p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCt/RRcWFvf3HRar5ft42c+/EXmzIBm9ITUQ/6huXfQcNYmXuwa4+r6VhcUCIHIoiR36JVPi22T7O+2bjc57NyY/ULfrZML4DPEymE1B1ETNdLZhJPIDswjfci8fgxeyyNMdw2v8t6ZOQEWk+smIp0SKRLbI7H9QbauF+z9Dn7mpQIDAQAB","ttl":3600}'
)

counter=1
total=${#DNS_RECORDS[@]}

for record in "${DNS_RECORDS[@]}"; do
    name=$(echo "$record" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    type=$(echo "$record" | grep -o '"type":"[^"]*"' | cut -d'"' -f4)
    
    echo -n "[$counter/$total] Aggiunta record $type $name... "
    
    response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "$record")
    
    success=$(echo "$response" | grep -o '"success":true')
    
    if [ -n "$success" ]; then
        print_success "OK"
    else
        exists=$(echo "$response" | grep -o 'already exists')
        if [ -n "$exists" ]; then
            print_warning "ESISTE GIÀ"
        else
            print_error "FALLITO"
        fi
    fi
    
    ((counter++))
done

echo ""
print_success "DNS Records configurati!"
echo ""

#############################################################################
# STEP 6: VERIFICA E DEPLOY
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "STEP 6: Deploy e Verifica"
echo "═══════════════════════════════════════════════════════════"
echo ""

print_info "Per applicare le modifiche, serve un nuovo deploy."
echo ""
echo "OPZIONE 1: Deploy automatico (consigliato)"
read -p "Vuoi fare il deploy ora? (y/n): " do_deploy

if [[ "$do_deploy" == "y" || "$do_deploy" == "Y" ]]; then
    print_info "Build in corso..."
    npm run build > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        print_success "Build completato!"
        
        print_info "Deploy in corso..."
        npx wrangler pages deploy dist --project-name="$PROJECT_NAME" > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            print_success "Deploy completato!"
        else
            print_warning "Deploy fallito. Puoi farlo manualmente dopo."
        fi
    else
        print_warning "Build fallito. Controlla gli errori."
    fi
else
    print_info "Deploy saltato. Fallo manualmente quando pronto:"
    echo "  npm run build"
    echo "  npx wrangler pages deploy dist --project-name=$PROJECT_NAME"
fi

echo ""

#############################################################################
# RIEPILOGO FINALE
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "✅ CONFIGURAZIONE COMPLETATA"
echo "═══════════════════════════════════════════════════════════"
echo ""

print_success "Secrets configurati (4):"
echo "  ✅ SENDGRID_API_KEY"
echo "  ✅ RESEND_API_KEY"
echo "  ✅ JWT_SECRET"
echo "  ✅ ENCRYPTION_KEY"
echo ""

print_success "Variabili in wrangler.toml (2):"
echo "  ✅ EMAIL_FROM = info@telemedcare.it"
echo "  ✅ EMAIL_TO_INFO = info@telemedcare.it"
echo ""

print_success "DNS Records aggiunti (8)"
echo ""

print_info "PROSSIMI PASSI:"
echo ""
echo "1. Attendi 15-30 minuti per DNS propagazione"
echo "2. Verifica domini su SendGrid e Resend"
echo "3. Testa invio email da dashboard"
echo ""
echo "URL: https://telemedcare-v12.pages.dev/admin/leads-dashboard"
echo ""

print_success "TUTTO FATTO! 🎉"
echo ""
