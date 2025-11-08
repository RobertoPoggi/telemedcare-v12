#!/bin/bash

# Script SEMPLIFICATO per ottenere DocuSign Token usando JWT Grant

echo "=================================================="
echo "🔐 DocuSign Token - Metodo JWT (Semplificato)"
echo "=================================================="
echo ""

source .dev.vars

INTEGRATION_KEY="$DOCUSIGN_INTEGRATION_KEY"
USER_ID="$DOCUSIGN_USER_ID"

echo "📋 Questo metodo richiede configurazione one-time su DocuSign:"
echo ""
echo "1. Vai su: https://admindemo.docusign.com/apps-and-keys"
echo "2. Trova la tua app: $INTEGRATION_KEY"
echo "3. Genera una coppia di chiavi RSA"
echo "4. Concedi consenso JWT alla tua app"
echo ""
echo "Una volta configurato, il token si rinnova AUTOMATICAMENTE"
echo "senza bisogno di login manuale ogni volta!"
echo ""
echo "=================================================="
echo ""

read -p "Hai già configurato JWT sulla tua app DocuSign? (s/n): " CONFIGURED

if [ "$CONFIGURED" != "s" ]; then
    echo ""
    echo "❌ Configurazione JWT necessaria prima di procedere."
    echo ""
    echo "📖 Guida rapida:"
    echo "   1. https://admindemo.docusign.com/apps-and-keys"
    echo "   2. Seleziona app: $INTEGRATION_KEY"
    echo "   3. Click 'Add RSA Keypair' → Genera"
    echo "   4. Salva la chiave privata"
    echo "   5. Click 'Grant Consent' e autorizza"
    echo ""
    exit 1
fi

echo "✅ Ottimo! Procediamo..."
echo ""
echo "💡 NOTA: Il metodo JWT è il metodo CORRETTO per app server-side"
echo "   come la tua. I token durano 1 ora e si rinnovano automaticamente."
echo ""
