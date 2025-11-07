#!/bin/bash
echo "╔══════════════════════════════════════════════════════╗"
echo "║     TeleMedCare V11 - Quick Test Suite              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

BASE_URL="https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai"

echo "1️⃣ Testing Homepage..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/)
TIME=$(curl -s -o /dev/null -w "%{time_total}" $BASE_URL/)
if [ "$STATUS" = "200" ]; then
    echo "   ✅ Homepage OK (${TIME}s)"
else
    echo "   ❌ Homepage FAILED (Status: $STATUS)"
fi

echo ""
echo "2️⃣ Testing API Dashboard..."
curl -s $BASE_URL/api/data/dashboard | head -100
echo "   ✅ Dashboard API OK"

echo ""
echo "3️⃣ Testing Lead Submission..."
curl -X POST $BASE_URL/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test Suite",
    "email": "testsuite@telemedcare.it",
    "telefono": "+39 333 1111111",
    "servizio": "BASE",
    "privacy": true,
    "source": "QUICK_TEST_SUITE"
  }' 2>/dev/null | head -200

echo ""
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║     ✅ Test Completati!                              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "🔗 Landing Page URL:"
echo "   $BASE_URL/"
echo ""
