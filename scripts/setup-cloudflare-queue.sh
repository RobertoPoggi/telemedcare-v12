#!/bin/bash

###############################################################################
# SETUP CLOUDFLARE QUEUE - Script Automatico
# eCura V11.0 - Multi-Channel Lead Ingestion
###############################################################################

set -e  # Exit on error

echo ""
echo "🚀 eCura V11.0 - Setup Cloudflare Queue"
echo "========================================="
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

###############################################################################
# STEP 1: Verifica prerequisiti
###############################################################################

echo -e "${BLUE}📋 STEP 1: Verifica prerequisiti${NC}"
echo ""

# Verifica Wrangler installato
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler non trovato${NC}"
    echo "Installa con: npm install -g wrangler"
    exit 1
fi

echo -e "${GREEN}✅ Wrangler installato${NC}"

# Verifica login Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Non sei autenticato su Cloudflare${NC}"
    echo "Esegui: wrangler login"
    exit 1
fi

echo -e "${GREEN}✅ Autenticato su Cloudflare${NC}"
echo ""

###############################################################################
# STEP 2: Crea Cloudflare Queues
###############################################################################

echo -e "${BLUE}📦 STEP 2: Crea Cloudflare Queues${NC}"
echo ""

# Crea queue principale
echo "Creo ecura-leads-queue..."
if wrangler queues create ecura-leads-queue 2>/dev/null; then
    echo -e "${GREEN}✅ ecura-leads-queue creata${NC}"
else
    echo -e "${YELLOW}⚠️  ecura-leads-queue già esistente${NC}"
fi

# Crea Dead Letter Queue
echo "Creo ecura-leads-dlq..."
if wrangler queues create ecura-leads-dlq 2>/dev/null; then
    echo -e "${GREEN}✅ ecura-leads-dlq creata${NC}"
else
    echo -e "${YELLOW}⚠️  ecura-leads-dlq già esistente${NC}"
fi

echo ""
echo "📊 Queue create:"
wrangler queues list

echo ""

###############################################################################
# STEP 3: Setup Database D1
###############################################################################

echo -e "${BLUE}🗄️  STEP 3: Setup Database D1${NC}"
echo ""

# Lista database esistenti
echo "Database D1 esistenti:"
wrangler d1 list

echo ""
echo -e "${YELLOW}⚠️  Assicurati di avere un database 'ecura-db'${NC}"
echo ""

read -p "Vuoi creare le tabelle leads e lead_tracking? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    
    echo "Creo tabella leads..."
    wrangler d1 execute ecura-db --command "
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_lead_id TEXT UNIQUE,
      source TEXT NOT NULL,
      nome TEXT,
      cognome TEXT,
      email TEXT NOT NULL,
      telefono TEXT,
      servizio TEXT,
      pacchetto TEXT,
      vuole_contratto INTEGER DEFAULT 1,
      vuole_brochure INTEGER DEFAULT 1,
      eta INTEGER,
      message TEXT,
      priority TEXT DEFAULT 'normal',
      status TEXT DEFAULT 'new',
      error_message TEXT,
      metadata TEXT,
      created_at TEXT,
      updated_at TEXT
    );
    "
    
    echo -e "${GREEN}✅ Tabella leads creata${NC}"
    
    echo "Creo tabella lead_tracking..."
    wrangler d1 execute ecura-db --command "
    CREATE TABLE IF NOT EXISTS lead_tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id TEXT NOT NULL,
      source TEXT,
      email TEXT,
      status TEXT,
      created_at TEXT
    );
    "
    
    echo -e "${GREEN}✅ Tabella lead_tracking creata${NC}"
fi

echo ""

###############################################################################
# STEP 4: Setup KV Namespace
###############################################################################

echo -e "${BLUE}🔐 STEP 4: Setup KV Namespace per API Keys${NC}"
echo ""

read -p "Vuoi creare un KV namespace 'API_KEYS'? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creo KV namespace API_KEYS..."
    
    if wrangler kv:namespace create API_KEYS 2>/dev/null; then
        echo -e "${GREEN}✅ KV Namespace creato${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Copia l'ID del namespace e aggiornalo in wrangler-producer.toml${NC}"
    else
        echo -e "${YELLOW}⚠️  KV Namespace già esistente${NC}"
    fi
fi

echo ""

###############################################################################
# STEP 5: Deploy Producer Worker
###############################################################################

echo -e "${BLUE}🚀 STEP 5: Deploy Producer Worker${NC}"
echo ""

read -p "Vuoi deployare il Producer Worker? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploy in corso..."
    
    if wrangler deploy --config wrangler-producer.toml; then
        echo ""
        echo -e "${GREEN}✅ Producer Worker deployato con successo!${NC}"
        echo ""
        echo "🌐 URL Producer:"
        wrangler deployments list --name ecura-producer | head -5
    else
        echo -e "${RED}❌ Errore deploy Producer${NC}"
        exit 1
    fi
fi

echo ""

###############################################################################
# STEP 6: Deploy Consumer Worker
###############################################################################

echo -e "${BLUE}🔄 STEP 6: Deploy Consumer Worker${NC}"
echo ""

read -p "Vuoi deployare il Consumer Worker? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploy in corso..."
    
    if wrangler deploy --config wrangler-consumer.toml; then
        echo ""
        echo -e "${GREEN}✅ Consumer Worker deployato con successo!${NC}"
        echo ""
        echo "📊 Consumer status:"
        wrangler queues consumer list ecura-leads-queue
    else
        echo -e "${RED}❌ Errore deploy Consumer${NC}"
        exit 1
    fi
fi

echo ""

###############################################################################
# STEP 7: Test End-to-End
###############################################################################

echo -e "${BLUE}🧪 STEP 7: Test End-to-End${NC}"
echo ""

read -p "Vuoi fare un test con un lead di prova? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    
    echo ""
    echo "Inserisci l'URL del Producer Worker:"
    read -p "URL: " PRODUCER_URL
    
    echo ""
    echo "Inserisci la tua email per il test:"
    read -p "Email: " TEST_EMAIL
    
    echo ""
    echo "Invio lead di test..."
    
    RESPONSE=$(curl -s -X POST "${PRODUCER_URL}/api/lead" \
      -H "Content-Type: application/json" \
      -d "{
        \"nome\": \"Test\",
        \"cognome\": \"Workflow\",
        \"email\": \"${TEST_EMAIL}\",
        \"telefono\": \"335 999 8888\",
        \"servizio\": \"PRO\",
        \"pacchetto\": \"AVANZATO\",
        \"vuoleContratto\": true,
        \"vuoleBrochure\": true,
        \"eta\": 75
      }")
    
    echo ""
    echo "📬 Response:"
    echo "$RESPONSE" | jq '.'
    
    echo ""
    echo -e "${GREEN}✅ Test inviato!${NC}"
    echo ""
    echo "Controlla:"
    echo "1. Log consumer: wrangler tail ecura-consumer"
    echo "2. Database: wrangler d1 execute ecura-db --command 'SELECT * FROM leads ORDER BY id DESC LIMIT 1'"
    echo "3. La tua email: ${TEST_EMAIL}"
fi

echo ""

###############################################################################
# FINE
###############################################################################

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✅ Setup Cloudflare Queue Completato!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "📚 Documentazione:"
echo "   - docs/DEPLOYMENT_CLOUDFLARE_QUEUE.md"
echo "   - docs/INTEGRAZIONE_ASINCRONA.md"
echo ""
echo "🔧 Prossimi step:"
echo "   1. Configura HubSpot webhook"
echo "   2. Implementa Dashboard completa"
echo "   3. Test end-to-end con tutti i canali"
echo ""
echo "🎉 Buon lavoro!"
echo ""
