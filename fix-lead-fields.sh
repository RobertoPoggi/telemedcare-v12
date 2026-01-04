#!/bin/bash

echo "🔧 FIX: Normalizza campi vuoleBrochure/Contratto/Manuale"
echo "========================================================"
echo ""
echo "Questo script aggiorna i lead con valori NULL/vuoti nei campi:"
echo "  - vuoleBrochure"
echo "  - vuoleContratto"
echo "  - vuoleManuale"
echo ""
echo "I valori verranno impostati a 'No' se sono NULL o vuoti."
echo ""
read -p "Vuoi procedere? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operazione annullata"
    exit 1
fi

echo ""
echo "📝 Esegui questi comandi SQL nel tuo DB Cloudflare D1:"
echo ""
echo "UPDATE leads SET vuoleBrochure = 'No' WHERE vuoleBrochure IS NULL OR vuoleBrochure = '';"
echo "UPDATE leads SET vuoleContratto = 'No' WHERE vuoleContratto IS NULL OR vuoleContratto = '';"
echo "UPDATE leads SET vuoleManuale = 'No' WHERE vuoleManuale IS NULL OR vuoleManuale = '';"
echo ""
echo "========================================================"
