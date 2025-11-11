#!/bin/bash
# Script per restart completo del server preservando il database

echo "🔄 TeleMedCare Dev Server - Smart Restart"
echo "=========================================="

# 1. Backup database se esiste
if [ -d ".wrangler/state/v3/d1" ]; then
    echo ""
    echo "💾 Step 1: Backup database..."
    ./scripts/db-backup.sh
else
    echo ""
    echo "⚠️  Step 1: Database non trovato (prima esecuzione?)"
fi

# 2. Stop server
echo ""
echo "🛑 Step 2: Stopping server..."
lsof -ti:3000,3001 | xargs -r kill -9 2>/dev/null
sleep 3

# 3. Clean build
echo ""
echo "🧹 Step 3: Clean build..."
rm -rf dist .wrangler/tmp
npm run build

# 4. Restore database
if [ -f "db-backups/telemedcare_latest.sqlite" ]; then
    echo ""
    echo "📥 Step 4: Restore database..."
    ./scripts/db-restore.sh
else
    echo ""
    echo "⚠️  Step 4: Nessun backup da ripristinare"
fi

# 5. Restart server
echo ""
echo "🚀 Step 5: Starting server..."
echo ""
echo "Server will start on http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""

npm run dev
