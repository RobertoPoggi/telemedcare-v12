#!/bin/bash
echo "🗑️  PULIZIA RAPIDA LEAD DI TEST"
echo "======================================"
echo ""

# Conta prima
TOTAL=$(curl -s 'https://telemedcare-v12.pages.dev/api/leads?limit=1000' | jq '[.leads[] | select(.id | startswith("LEAD-MANUAL-"))] | length')
echo "📊 Lead LEAD-MANUAL-* da cancellare: $TOTAL"

if [ "$TOTAL" -eq "0" ]; then
    echo "✅ Nessun lead di test da cancellare"
    exit 0
fi

echo ""
echo "⚠️  CONFERMA: Cancellare $TOTAL lead di test?"
echo "Digita 'YES' per confermare:"
read CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo "❌ Annullato"
    exit 1
fi

echo ""
echo "🗑️  Cancellazione in corso..."

# Ottieni IDs
IDS=$(curl -s 'https://telemedcare-v12.pages.dev/api/leads?limit=1000' | jq -r '.leads[] | select(.id | startswith("LEAD-MANUAL-")) | .id')

DELETED=0
for ID in $IDS; do
    if [ ! -z "$ID" ]; then
        RES=$(curl -s -X DELETE "https://telemedcare-v12.pages.dev/api/leads/$ID")
        if echo "$RES" | grep -q "success.*true"; then
            DELETED=$((DELETED + 1))
            echo "  ✓ $ID"
        else
            echo "  ✗ $ID (errore)"
        fi
    fi
done

echo ""
echo "✅ Cancellati: $DELETED / $TOTAL"
