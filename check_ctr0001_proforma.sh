#!/bin/bash

echo "=== INVESTIGATING CTR_2025/0001 PROFORMA EMAIL ISSUE ==="
echo ""

echo "1. Checking contract CTR_2025/0001 details:"
curl -s http://localhost:3001/api/admin/contracts | jq '.contracts[] | select(.codice_contratto == "CTR_2025/0001") | {
  codice: .codice_contratto,
  lead_id: .lead_id,
  status: .status,
  piano: .piano,
  signature_date: .signature_date,
  created_at: .created_at,
  richiedente: "\(.nomeRichiedente) \(.cognomeRichiedente)",
  email: .emailRichiedente
}'

echo ""
echo "2. Checking if proforma exists for this contract's lead:"
LEAD_ID=$(curl -s http://localhost:3001/api/admin/contracts | jq -r '.contracts[] | select(.codice_contratto == "CTR_2025/0001") | .lead_id')
echo "Lead ID: $LEAD_ID"

if [ -n "$LEAD_ID" ] && [ "$LEAD_ID" != "null" ]; then
  echo ""
  echo "Proformas for this lead:"
  curl -s http://localhost:3001/api/admin/proformas | jq ".proformas[] | select(.lead_id == $LEAD_ID) | {
    proforma_code: .proforma_code,
    lead_id: .lead_id,
    amount: .amount,
    status: .status,
    issue_date: .issue_date,
    due_date: .due_date,
    richiedente: \"\(.nomeRichiedente) \(.cognomeRichiedente)\",
    email: .emailRichiedente
  }"
else
  echo "⚠️ No lead_id found for CTR_2025/0001"
fi

echo ""
echo "3. All proformas in system:"
curl -s http://localhost:3001/api/admin/proformas | jq '.proformas[] | {
  proforma_code: .proforma_code,
  lead_id: .lead_id,
  richiedente: "\(.nomeRichiedente) \(.cognomeRichiedente)",
  amount: .amount,
  status: .status,
  issue_date: .issue_date
}'

echo ""
echo "4. Checking database directly for CTR_2025/0001:"
npx wrangler d1 execute telemadcare_db --local --command "
SELECT 
  c.codice_contratto,
  c.lead_id,
  c.status,
  c.signature_date,
  c.contract_type,
  l.nomeRichiedente || ' ' || l.cognomeRichiedente as richiedente,
  l.emailRichiedente,
  l.pacchetto
FROM contracts c
LEFT JOIN leads l ON c.lead_id = l.id
WHERE c.codice_contratto = 'CTR_2025/0001'
"

echo ""
echo "5. Checking if proforma exists in DB for this lead:"
npx wrangler d1 execute telemadcare_db --local --command "
SELECT 
  p.numero_proforma,
  p.lead_id,
  p.prezzo_totale,
  p.status,
  p.data_emissione,
  p.created_at,
  l.nomeRichiedente || ' ' || l.cognomeRichiedente as richiedente
FROM proforma p
LEFT JOIN leads l ON p.lead_id = l.id
WHERE p.lead_id IN (
  SELECT lead_id FROM contracts WHERE codice_contratto = 'CTR_2025/0001'
)
"

