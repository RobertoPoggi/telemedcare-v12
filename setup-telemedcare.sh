#!/bin/bash

#############################################################################
# TELEMEDCARE V12.0 - CONFIGURAZIONE AUTOMATICA
# Script interattivo per configurare Environment Variables e DNS Records
#############################################################################

set -e  # Exit on error

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  TeleMedCare V12.0 - Configurazione Automatica"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Funzione per print colorato
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

#############################################################################
# STEP 1: VERIFICA PREREQUISITI
#############################################################################

echo "STEP 1: Verifica prerequisiti..."
echo ""

# Verifica che wrangler sia installato
if ! command -v npx &> /dev/null; then
    print_error "Node.js/npm non trovato. Installa Node.js prima di continuare."
    exit 1
fi

print_success "Node.js/npm trovato"

# Verifica che curl sia installato
if ! command -v curl &> /dev/null; then
    print_error "curl non trovato. Installa curl prima di continuare."
    exit 1
fi

print_success "curl trovato"

echo ""
print_info "Tutti i prerequisiti soddisfatti!"
echo ""

#############################################################################
# STEP 2: RICHIESTA CLOUDFLARE API TOKEN
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "STEP 2: Cloudflare API Token"
echo "═══════════════════════════════════════════════════════════"
echo ""
print_info "Per configurare il sistema, serve un Cloudflare API Token."
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
# STEP 3: RICHIESTA CLOUDFLARE ACCOUNT ID
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "STEP 3: Cloudflare Account ID"
echo "═══════════════════════════════════════════════════════════"
echo ""
print_info "Serve anche il tuo Cloudflare Account ID."
echo ""
echo "Come trovarlo:"
echo "1. Vai su: https://dash.cloudflare.com/"
echo "2. Seleziona un qualsiasi dominio"
echo "3. Guarda nella barra laterale destra"
echo "4. Troverai: 'Account ID: xxxxxxxxxxxxx'"
echo "5. Copia l'ID"
echo ""

read -p "Incolla il Cloudflare Account ID: " CLOUDFLARE_ACCOUNT_ID

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    print_error "Account ID non fornito. Uscita."
    exit 1
fi

print_success "Account ID configurato!"
echo ""

#############################################################################
# STEP 4: RICHIESTA ZONE ID (per DNS)
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "STEP 4: Cloudflare Zone ID (per telemedcare.it)"
echo "═══════════════════════════════════════════════════════════"
echo ""
print_info "Per configurare i DNS records, serve il Zone ID di telemedcare.it."
echo ""
echo "Come trovarlo:"
echo "1. Vai su: https://dash.cloudflare.com/"
echo "2. Clicca su: 'telemedcare.it'"
echo "3. Scroll nella sidebar destra"
echo "4. Troverai: 'Zone ID: xxxxxxxxxxxxx'"
echo "5. Copia l'ID"
echo ""

read -p "Incolla il Zone ID di telemedcare.it: " CLOUDFLARE_ZONE_ID

if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
    print_error "Zone ID non fornito. Uscita."
    exit 1
fi

print_success "Zone ID configurato!"
echo ""

#############################################################################
# STEP 5: CONFIGURAZIONE ENVIRONMENT VARIABLES
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "STEP 5: Configurazione Environment Variables"
echo "═══════════════════════════════════════════════════════════"
echo ""
print_info "Configurazione di 6 variabili su Cloudflare Pages..."
echo ""

PROJECT_NAME="telemedcare-v12"

# Array di variabili da configurare
declare -A VARIABLES=(
    ["SENDGRID_API_KEY"]="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"
    ["RESEND_API_KEY"]="re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2"
    ["EMAIL_FROM"]="info@telemedcare.it"
    ["EMAIL_TO_INFO"]="info@telemedcare.it"
    ["JWT_SECRET"]="f8adfd1d3ab5f1bcacdb0c09e9eca0904146790112eb3f375516380e75adc534"
    ["ENCRYPTION_KEY"]="492109618a5df3abe44c7086e4983cd776393457381a776bd3c51de67b7573cd"
)

counter=1
total=${#VARIABLES[@]}

for key in "${!VARIABLES[@]}"; do
    value="${VARIABLES[$key]}"
    echo -n "[$counter/$total] Configurazione $key... "
    
    # Usa wrangler per settare la variabile
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
print_success "Environment Variables configurate!"
echo ""

#############################################################################
# STEP 6: CONFIGURAZIONE DNS RECORDS
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "STEP 6: Configurazione DNS Records"
echo "═══════════════════════════════════════════════════════════"
echo ""
print_info "Configurazione di 8 DNS records per telemedcare.it..."
echo ""

# Array di DNS records
declare -a DNS_RECORDS=(
    # SendGrid CNAME records
    '{"type":"CNAME","name":"em6551","content":"u56677468.wl219.sendgrid.net","ttl":3600,"proxied":false}'
    '{"type":"CNAME","name":"s1._domainkey","content":"s1.domainkey.u56677468.wl219.sendgrid.net","ttl":3600,"proxied":false}'
    '{"type":"CNAME","name":"s2._domainkey","content":"s2.domainkey.u56677468.wl219.sendgrid.net","ttl":3600,"proxied":false}'
    
    # SendGrid DMARC
    '{"type":"TXT","name":"_dmarc","content":"v=DMARC1; p=none;","ttl":3600}'
    
    # Resend MX record
    '{"type":"MX","name":"send","content":"feedback-smtp.eu-west-1.amazonses.com","ttl":3600,"priority":10}'
    
    # Resend SPF
    '{"type":"TXT","name":"send","content":"v=spf1 include:amazonses.com ~all","ttl":3600}'
    
    # Resend DKIM
    '{"type":"TXT","name":"resend._domainkey","content":"p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCt/RRcWFvf3HRar5ft42c+/EXmzIBm9ITUQ/6huXfQcNYmXuwa4+r6VhcUCIHIoiR36JVPi22T7O+2bjc57NyY/ULfrZML4DPEymE1B1ETNdLZhJPIDswjfci8fgxeyyNMdw2v8t6ZOQEWk+smIp0SKRLbI7H9QbauF+z9Dn7mpQIDAQAB","ttl":3600}'
)

counter=1
total=${#DNS_RECORDS[@]}

for record in "${DNS_RECORDS[@]}"; do
    # Estrai il name per logging
    name=$(echo "$record" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    type=$(echo "$record" | grep -o '"type":"[^"]*"' | cut -d'"' -f4)
    
    echo -n "[$counter/$total] Aggiunta record $type $name... "
    
    # Crea il DNS record via API
    response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "$record")
    
    # Verifica se ha successo
    success=$(echo "$response" | grep -o '"success":true')
    
    if [ -n "$success" ]; then
        print_success "OK"
    else
        # Controlla se esiste già
        exists=$(echo "$response" | grep -o 'already exists')
        if [ -n "$exists" ]; then
            print_warning "ESISTE GIÀ"
        else
            print_error "FALLITO"
            print_warning "Errore: $(echo "$response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)"
        fi
    fi
    
    ((counter++))
done

echo ""
print_success "DNS Records configurati!"
echo ""

#############################################################################
# STEP 7: VERIFICA CONFIGURAZIONE
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "STEP 7: Verifica Configurazione"
echo "═══════════════════════════════════════════════════════════"
echo ""

print_info "Verifica Environment Variables..."
echo ""
echo "Le variabili sono state configurate. Per verificarle:"
echo "1. Vai su: https://dash.cloudflare.com/"
echo "2. Workers & Pages > telemedcare-v12 > Settings"
echo "3. Environment Variables"
echo ""
echo "Dovresti vedere 6 variabili configurate."
echo ""

print_info "Verifica DNS Records..."
echo ""
echo "I DNS records sono stati aggiunti. Per verificarli:"
echo "1. Vai su: https://dash.cloudflare.com/"
echo "2. Seleziona: telemedcare.it"
echo "3. DNS > Records"
echo ""
echo "Dovresti vedere 8+ nuovi record (em6551, s1._domainkey, s2._domainkey, _dmarc, send, resend._domainkey)."
echo ""

#############################################################################
# STEP 8: ISTRUZIONI FINALI
#############################################################################

echo "═══════════════════════════════════════════════════════════"
echo "STEP 8: Prossimi Passi"
echo "═══════════════════════════════════════════════════════════"
echo ""

print_success "Configurazione completata!"
echo ""
print_info "TIMELINE:"
echo ""
echo "✅ ORA:        Environment Variables attive"
echo "✅ ORA:        DNS Records aggiunti"
echo "⏳ +15 min:    DNS propagazione iniziata"
echo "⏳ +2 ore:     DNS propagati globalmente"
echo "✅ +2 ore:     Domini verificati automaticamente"
echo "✅ +2 ore:     Sistema pronto per invio email"
echo ""

print_info "COSA FARE DOPO 2 ORE:"
echo ""
echo "1. Verifica dominio su SendGrid:"
echo "   https://app.sendgrid.com/ > Settings > Sender Authentication"
echo ""
echo "2. Verifica dominio su Resend:"
echo "   https://resend.com/ > Settings > Domains"
echo ""
echo "3. Testa invio email:"
echo "   https://telemedcare-v12.pages.dev/admin/leads-dashboard"
echo "   Clicca pulsante BLU su un lead"
echo ""

print_success "TUTTO FATTO! 🎉"
echo ""
echo "Il sistema TeleMedCare V12.0 è configurato e sarà pronto tra 2 ore."
echo ""

#############################################################################
# FINE SCRIPT
#############################################################################
