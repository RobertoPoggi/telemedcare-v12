#!/bin/bash

# =============================================
# AUDIT COMPLETO: Schema DB vs Codice
# =============================================

echo "🔍 AUDIT SCHEMA DB vs CODICE"
echo "=============================="
echo ""

echo "📋 CAMPI AGGIUNTI NELLE MIGRATION:"
echo "-----------------------------------"
find migrations/ -name "*.sql" -exec grep -h "ALTER TABLE leads ADD COLUMN" {} \; 2>/dev/null | sort | uniq

echo ""
echo "📋 CAMPI USATI NEL CODICE (Form completamento):"
echo "------------------------------------------------"
grep -A 30 "const fieldMapping" src/index.tsx | grep ":" | head -20

echo ""
echo "🔍 VERIFICA CAMPI POTENZIALMENTE SBAGLIATI:"
echo "--------------------------------------------"

# Lista campi che potrebbero essere sbagliati
check_field() {
    local field="$1"
    local count=$(grep -r "$field" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
    if [ $count -gt 0 ]; then
        echo "⚠️  $field: $count occorrenze nel codice"
    fi
}

echo ""
echo "Campi 'Richiedente' vs 'Intestatario':"
check_field "Richiedente"
check_field "Intestatario"
check_field "cfRichiedente"
check_field "cfIntestatario"
check_field "indirizzoRichiedente"
check_field "indirizzoIntestatario"

echo ""
echo "Campi Assistito:"
check_field "cfAssistito"
check_field "codiceFiscaleAssistito"

echo ""
echo "✅ Audit completato"
