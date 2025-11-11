#!/bin/bash

echo "=== TESTING PROFORMA EMAIL FOR CTR_2025/0001 ==="
echo ""

# Get contract ID
CONTRACT_ID=$(curl -s http://localhost:3001/api/admin/contracts | jq -r '.contracts[] | select(.codice_contratto == "CTR_2025/0001") | .id')

echo "Contract ID: $CONTRACT_ID"
echo ""

if [ -z "$CONTRACT_ID" ] || [ "$CONTRACT_ID" == "null" ]; then
  echo "❌ Contract CTR_2025/0001 not found"
  exit 1
fi

# Check if proforma already exists
echo "Checking if proforma already exists..."
EXISTING_PROFORMA=$(curl -s http://localhost:3001/api/admin/proformas | jq -r '.proformas[] | select(.lead_id == "LEAD_2025-11-10T073941376Z_5DMO0A") | .proforma_code')

if [ -n "$EXISTING_PROFORMA" ] && [ "$EXISTING_PROFORMA" != "null" ]; then
  echo "⚠️  Proforma already exists: $EXISTING_PROFORMA"
  echo "The proforma was already generated, but email might not have been sent."
  echo ""
  echo "Possible reasons for missing email:"
  echo "1. Email service failed silently"
  echo "2. SendGrid/Resend API keys not configured"
  echo "3. Email was sent to spam folder"
  echo ""
  
  echo "Checking proforma details from database..."
  curl -s http://localhost:3001/api/admin/proformas | jq '.proformas[] | select(.proforma_code == "'"$EXISTING_PROFORMA"'") | {
    proforma_code: .proforma_code,
    amount: .amount,
    status: .status,
    issue_date: .issue_date,
    due_date: .due_date,
    email: .emailRichiedente
  }'
  
  echo ""
  echo "To resend the proforma email, you would need to:"
  echo "1. Implement a 'resend email' endpoint"
  echo "2. Or manually trigger the email from the admin panel"
  echo "3. Or delete the proforma and re-confirm the signature"
else
  echo "No existing proforma found. Ready to generate..."
fi

