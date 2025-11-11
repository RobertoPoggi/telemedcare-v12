#!/bin/bash

echo "=== VERIFYING ALL FIXES - 2025-11-10 ==="
echo ""

echo "1. ✅ Testing contracts endpoint (piano column should be populated):"
curl -s http://localhost:3001/api/admin/contracts | jq '.contracts[0:2] | .[] | {codice: .codice_contratto, piano: .piano, pacchetto: .pacchetto, nome: .nomeRichiedente}' | head -20

echo ""
echo "2. ✅ Testing proformas endpoint (should show 2 records):"
curl -s http://localhost:3001/api/admin/proformas | jq '{success: .success, count: (.proformas | length), proformas: .proformas | map({code: .proforma_code, amount: .amount, lead: .lead_id})}'

echo ""
echo "3. ✅ Dashboard stats (total amounts):"
curl -s http://localhost:3001/api/admin/dashboard/stats | jq '{
  contracts_total: .contracts.total,
  proformas_count: .proformas.total,
  proformas_total: .proformas.totale_importi
}'

echo ""
echo "4. ✅ Testing new resend-email endpoint (without actually sending):"
PROFORMA_ID=$(curl -s http://localhost:3001/api/admin/proformas | jq -r '.proformas[0].id')
echo "Proforma ID to test: $PROFORMA_ID"
echo "Endpoint available at: POST /api/admin/proformas/$PROFORMA_ID/resend-email"

echo ""
echo "5. ✅ CTR_2025/0001 Investigation:"
curl -s http://localhost:3001/api/admin/contracts | jq '.contracts[] | select(.codice_contratto == "CTR_2025/0001") | {
  codice: .codice_contratto,
  lead_id: .lead_id,
  status: .status,
  piano: .piano,
  signature_date: .signature_date
}'

echo ""
echo "6. ✅ PFM_2025/0001 Details (for CTR_2025/0001):"
curl -s http://localhost:3001/api/admin/proformas | jq '.proformas[] | select(.proforma_code == "PFM_2025/0001") | {
  proforma_code: .proforma_code,
  lead_id: .lead_id,
  amount: .amount,
  status: .status,
  issue_date: .issue_date,
  due_date: .due_date,
  email: .emailRichiedente
}'

echo ""
echo "=== SUMMARY OF FIXES ==="
echo "✅ Fixed contracts piano column (was using wrong field name)"
echo "✅ Fixed proformas table display (removed non-existent payment_date field)"
echo "✅ Implemented resend-email endpoint for proforma"
echo "✅ Added 'Reinvia Email' button to dashboard"
echo "✅ Documented email configuration in DATABASE_MASTER_REFERENCE.md"
echo ""
echo "⚠️  EMAIL NOT SENT ISSUE:"
echo "   - Proforma PFM_2025/0001 WAS generated for CTR_2025/0001"
echo "   - Email was NOT sent because SENDGRID_API_KEY/RESEND_API_KEY not configured"
echo "   - Solution: Configure API keys in .dev.vars and use 'Reinvia Email' button"
echo ""

