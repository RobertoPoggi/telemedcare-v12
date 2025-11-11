#!/bin/bash

echo "=== VERIFICATION OF PRICE FIX - 2025-11-10 ==="
echo ""

echo "1. ✅ Corrected Proforma Amounts:"
curl -s http://localhost:3001/api/admin/proformas | jq '.proformas[] | {
  code: .proforma_code,
  pacchetto: .pacchetto,
  amount_OLD: "❌ Wrong",
  amount_NEW: .amount,
  expected: (if .pacchetto == "AVANZATO" then "€1,024.80" elif .pacchetto == "BASE" then "€585.60" else "?" end),
  correct: (if .pacchetto == "AVANZATO" then (.amount == 1024.8) elif .pacchetto == "BASE" then (.amount == 585.6) else false end),
  email: .emailRichiedente
}'

echo ""
echo "2. ✅ Dashboard Total (should be €1,610.40 now):"
curl -s http://localhost:3001/api/admin/dashboard/stats | jq '{
  proformas_count: .proformas.total,
  total_amount: .proformas.totale_importi,
  expected: "€1,610.40 (585.60 + 1024.80)"
}'

echo ""
echo "3. ✅ Price Calculation Reference:"
echo "BASE:     €480 + IVA 22% = €585.60"
echo "AVANZATO: €840 + IVA 22% = €1,024.80"
echo "TOTAL:    €585.60 + €1,024.80 = €1,610.40"

echo ""
echo "4. ❌ OLD (WRONG) Amounts:"
echo "BASE:     €89.90 × 12 = €1,078.80 ❌"
echo "AVANZATO: €149.90 × 12 = €1,798.80 ❌"
echo "TOTAL:    €1,078.80 + €1,798.80 = €2,877.60 ❌"

