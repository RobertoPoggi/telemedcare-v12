#!/bin/bash
################################################################################
# QUICK DEPLOY SCRIPT - TeleMedCare V11.0
# Data: 2025-11-07
# Uso: ./quick-deploy.sh [staging|production]
################################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default to production
ENVIRONMENT="${1:-production}"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}TeleMedCare V11.0 - Quick Deploy${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Step 1: Verify authentication
echo -e "${YELLOW}Step 1/5: Verificando autenticazione Cloudflare...${NC}"
if ! npx wrangler whoami > /dev/null 2>&1; then
    echo -e "${RED}❌ Non sei autenticato con Cloudflare!${NC}"
    echo ""
    echo "Esegui prima:"
    echo "  npx wrangler login"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Autenticato con successo${NC}"
echo ""

# Step 2: List databases
echo -e "${YELLOW}Step 2/5: Verificando database disponibili...${NC}"
npx wrangler d1 list
echo ""

# Step 3: Ask which database to migrate
echo -e "${YELLOW}Step 3/5: Applica migration 0007${NC}"
echo "Quale database vuoi migrare?"
echo "1) telemedcare-leads (produzione)"
echo "2) telemedcare_staging (staging)"
echo "3) Salta migration (già applicata)"
read -p "Scelta (1/2/3): " DB_CHOICE

case $DB_CHOICE in
    1)
        DB_NAME="telemedcare-leads"
        ;;
    2)
        DB_NAME="telemedcare_staging"
        ;;
    3)
        echo -e "${YELLOW}⏭️  Migration saltata${NC}"
        DB_NAME=""
        ;;
    *)
        echo -e "${RED}❌ Scelta non valida${NC}"
        exit 1
        ;;
esac

if [ ! -z "$DB_NAME" ]; then
    echo -e "${YELLOW}Applicando migration 0007 a $DB_NAME...${NC}"
    if npx wrangler d1 execute "$DB_NAME" --remote --file=migrations/0007_fix_proforma_schema.sql; then
        echo -e "${GREEN}✅ Migration applicata con successo${NC}"
    else
        echo -e "${RED}❌ Errore nell'applicazione della migration${NC}"
        echo ""
        echo "Prova manualmente:"
        echo "  npx wrangler d1 migrations apply $DB_NAME --remote"
        echo ""
        exit 1
    fi
fi
echo ""

# Step 4: Build
echo -e "${YELLOW}Step 4/5: Building progetto...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build completato${NC}"
else
    echo -e "${RED}❌ Build fallito${NC}"
    exit 1
fi
echo ""

# Step 5: Deploy
echo -e "${YELLOW}Step 5/5: Deploying su Cloudflare Pages...${NC}"

if [ "$ENVIRONMENT" = "staging" ]; then
    PROJECT_NAME="telemedcare-staging"
    BRANCH="staging"
else
    PROJECT_NAME="telemedcare-v11"
    BRANCH="main"
fi

echo -e "${BLUE}Deploying su: $PROJECT_NAME (branch: $BRANCH)${NC}"

if npx wrangler pages deploy dist --project-name "$PROJECT_NAME" --branch "$BRANCH"; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ DEPLOYMENT COMPLETATO CON SUCCESSO!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}Prossimi passi:${NC}"
    echo "1. Attendi 2-3 minuti per la propagazione"
    echo "2. Testa la landing page: https://$PROJECT_NAME.pages.dev"
    echo "3. Compila il form con dati completi"
    echo "4. Verifica email a rpoggi55@gmail.com e info@telemedcare.it"
    echo ""
    echo -e "${YELLOW}Per vedere i logs in real-time:${NC}"
    echo "  npx wrangler pages deployment tail --project-name $PROJECT_NAME"
    echo ""
else
    echo -e "${RED}❌ Deploy fallito${NC}"
    exit 1
fi
