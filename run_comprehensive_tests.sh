#!/bin/bash
#
# 🧪 TeleMedCare V11.0 - Comprehensive Test Runner
# ================================================
# 
# This script runs ALL comprehensive tests as requested by Roberto:
# - Complete BASE workflow (intestazione richiedente)
# - Complete AVANZATO workflow (intestazione assistito)  
# - All 6 email templates verification
# - Partner lead sources (IRBEMA, Luxottica, Pirelli, FAS)
#
# Usage: ./run_comprehensive_tests.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  🧪 TeleMedCare V11.0 - Comprehensive Test Suite            ║${NC}"
echo -e "${CYAN}║  Test completo per Roberto - Verifica tutti i flussi         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if server is running
echo -e "${BLUE}ℹ️  Checking if development server is running...${NC}"
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running on http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Server is NOT running!${NC}"
    echo -e "${YELLOW}⚠️  Please start the server first with:${NC}"
    echo -e "   ${CYAN}npm run dev${NC}"
    echo ""
    exit 1
fi

echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed!${NC}"
    echo -e "${YELLOW}⚠️  Please install Python 3 to run the tests${NC}"
    exit 1
fi

# Check if requests library is installed
if ! python3 -c "import requests" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Installing required Python packages...${NC}"
    pip3 install requests --quiet || {
        echo -e "${RED}❌ Failed to install requests library${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Packages installed${NC}"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Starting comprehensive tests...${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Run the comprehensive test script
python3 test_comprehensive_roberto.py

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Test execution completed${NC}"
else
    echo -e "${YELLOW}⚠️  Test execution completed with warnings/errors${NC}"
fi

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check for results file
LATEST_RESULT=$(ls -t test_results_*.json 2>/dev/null | head -1)
if [ -n "$LATEST_RESULT" ]; then
    echo -e "${BLUE}ℹ️  Detailed results saved to: ${CYAN}$LATEST_RESULT${NC}"
    echo ""
fi

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "   1. Review the test output above"
echo -e "   2. Check email inbox for all 6 templates"
echo -e "   3. Verify contract PDFs have correct addressee"
echo -e "   4. Verify ALL placeholders are replaced"
echo -e "   5. Test with real DocuSign and Stripe integrations"
echo ""

exit $TEST_EXIT_CODE
