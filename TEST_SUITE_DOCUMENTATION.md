# 🧪 TeleMedCare V11.0 - Comprehensive Test Suite Documentation

## 📋 Overview

This test suite was created to verify ALL critical fixes requested by Roberto after his testing of the TeleMedCare V11.0 system. It provides comprehensive automated testing of the complete workflow, all email templates, and various scenarios.

## 🎯 Test Coverage

### ✅ What This Test Suite Covers

1. **Complete BASE Workflow - Intestazione RICHIEDENTE**
   - Lead intake with full richiedente and assistito data
   - Contract generation addressed to RICHIEDENTE (payer)
   - Contract signature
   - Proforma generation and email
   - Payment processing with complete Stripe billing data
   - Configuration form submission
   - Device association
   - All corresponding email templates

2. **Complete AVANZATO Workflow - Intestazione ASSISTITO**
   - Lead intake with full data
   - Contract generation addressed to ASSISTITO (care receiver)
   - Contract signature
   - Proforma generation and email
   - Payment processing
   - Configuration and device association
   - All corresponding email templates

3. **Partner Lead Sources**
   - IRBEMA
   - Luxottica
   - Pirelli
   - FAS
   - Verification of automatic landing page sending

4. **All 6 Email Templates**
   - `email_notifica_info` - To info@telemedcare.it with ALL fields
   - `email_documenti_informativi` - Brochure and manual
   - `email_invio_contratto` - Contract PDF
   - `email_invio_proforma` - Proforma after signature
   - `email_benvenuto` - Welcome with configuration form
   - `email_conferma_attivazione` - Activation confirmation

### 🔍 Critical Verifications

#### Contract Addressing (CRITICAL FIX)
- ✅ Verifies contract is addressed to correct person based on `intestazioneContratto` field
- ✅ Tests RICHIEDENTE scenario (payer ≠ care receiver)
- ✅ Tests ASSISTITO scenario (payer = care receiver)
- ✅ Ensures correct name, CF, address, phone, email in contract

#### Email Placeholder Replacement (CRITICAL FIX)
All email templates are verified to have placeholders replaced:
- `{{NOME_CLIENTE}}` / `{{NOME_RICHIEDENTE}}` / `{{NOME_ASSISTITO}}`
- `{{TIPO_SERVIZIO}}` - Was missing, now included
- `{{PIANO_SERVIZIO}}`
- `{{CONDIZIONI_SALUTE}}` - NEW for info@ email
- `{{URGENZA_RISPOSTA}}` - NEW for info@ email
- `{{GIORNI_RISPOSTA}}` - NEW for info@ email
- `{{INTESTAZIONE_CONTRATTO}}` - NEW for info@ email
- All other template-specific placeholders

#### Complete Data for Integrations

**Stripe Payment Fields** (CRITICAL for billing):
- ✅ Complete billing address (via, CAP, città, provincia)
- ✅ Billing name (full name of payer)
- ✅ Billing email (for receipts)
- ✅ Billing phone (for verification)

**DocuSign Signature Fields** (CRITICAL for signing):
- ✅ Recipient email (MANDATORY - who receives the document)
- ✅ Recipient name (for personalization)
- ✅ Recipient phone (optional but recommended)
- ✅ Correct recipient based on intestazioneContratto

#### Email Notifica Info@ (CRITICAL FIX)
Verifies that email to info@telemedcare.it includes ALL fields:
- ✅ All richiedente data (nome, cognome, email, telefono, CF, indirizzo completo)
- ✅ All assistito data (if different from richiedente)
- ✅ Health conditions (`condizioniSalute`)
- ✅ Contact preference (`preferenzaContatto`)
- ✅ Response urgency (`urgenzaRisposta`)
- ✅ Response days (`giorniRisposta`)
- ✅ Contract addressee choice (`intestazioneContratto`)
- ✅ Notes and other fields

## 🚀 Running the Tests

### Prerequisites

1. **Server Running**: Development server must be running on http://localhost:3000
   ```bash
   npm run dev
   ```

2. **Python 3**: Required for test execution
   ```bash
   python3 --version
   ```

3. **Requests Library**: Automatically installed by the test script
   ```bash
   pip3 install requests
   ```

### Execution Methods

#### Method 1: Using the Bash Script (Recommended)
```bash
./run_comprehensive_tests.sh
```

This script will:
- Check if server is running
- Install Python dependencies if needed
- Run all comprehensive tests
- Display colored output with results
- Save detailed results to JSON file

#### Method 2: Direct Python Execution
```bash
python3 test_comprehensive_roberto.py
```

### Expected Output

The test script provides:
- ✅ Green checkmarks for successful operations
- ❌ Red X marks for failures
- ⚠️  Yellow warnings for partial successes
- ℹ️  Blue info messages for context
- Detailed step-by-step progress
- Final summary with pass/fail counts
- JSON file with complete test results

## 📊 Test Results

### Test Results File

After execution, a JSON file is created with timestamp:
```
test_results_YYYYMMDD_HHMMSS.json
```

This file contains:
- Summary of all tests (passed/failed)
- Detailed results for each test
- Lead IDs, Contract IDs, Proforma IDs, Payment IDs
- Timestamps for each operation
- Error messages for failed tests

### Interpreting Results

**100% Pass Rate**: All tests passed - system ready for production
**Partial Pass Rate**: Some steps failed - review logs for issues
**0% Pass Rate**: Major issues - check server logs and fix critical bugs

## 🔍 Manual Verification Required

### Email Template Verification

The test script sends real emails but cannot automatically verify content. **Manual verification required**:

1. **Check Email Inbox**: Review all test emails sent to:
   - info@telemedcare.it (notifica)
   - roberto.poggi@test.com (TEST 1)
   - anna.verdi@test.com (TEST 2)
   - Partner test emails

2. **Verify Placeholders**: Ensure NO placeholders like `{{VARIABLE}}` remain
   - All `{{NOME_CLIENTE}}` replaced with actual names
   - All `{{TIPO_SERVIZIO}}` replaced with "BASE" or "AVANZATO"
   - All `{{CONDIZIONI_SALUTE}}` replaced with health conditions
   - etc.

3. **Verify Contract PDFs**: Check generated contract PDFs
   - TEST 1: Should be addressed to "Roberto Poggi" (richiedente)
   - TEST 2: Should be addressed to "Anna Verdi" (assistito)
   - No "DA FORNIRE" text for CF, address, phone, email
   - Complete address with CAP, città, provincia

4. **Verify Data Completeness**: All fields populated
   - CF (Codice Fiscale)
   - Complete address (Via, CAP, Città, Provincia)
   - Email (CRITICAL for DocuSign)
   - Phone

## 🐛 Troubleshooting

### Common Issues

#### Server Not Running
```
❌ Server is NOT running at http://localhost:3000
```
**Solution**: Start the server with `npm run dev`

#### Connection Refused
```
❌ Connection error - is the server running?
```
**Solution**: Verify server is accessible on port 3000

#### Test Timeout
```
❌ Request timeout after 30s
```
**Solution**: Check server logs for errors, ensure database is accessible

#### Email Not Sent
```
⚠️  Manual verification needed - check email inbox!
```
**Solution**: 
- Verify email service API keys are configured (SENDGRID_API_KEY or RESEND_API_KEY)
- Check server logs for email sending errors
- Verify email templates exist in database

#### Missing Fields
```
❌ Field 'TIPO_SERVIZIO' not replaced in email
```
**Solution**: 
- Check that templateData in workflow-email-manager.ts includes the field
- Verify email template in database has the correct placeholder
- Review FIXES_ROBERTO_CRITICAL.md for field mappings

## 📝 Test Data

### Test 1: BASE - Richiedente
- **Richiedente** (payer/signer): Roberto Poggi
- **Assistito** (care receiver): Rosaria Ressa
- **Service**: BASE
- **Contract to**: RICHIEDENTE
- **Email for DocuSign**: roberto.poggi@test.com

### Test 2: AVANZATO - Assistito
- **Richiedente** (requester): Marco Bianchi
- **Assistito** (payer/signer): Anna Verdi
- **Service**: AVANZATO
- **Contract to**: ASSISTITO
- **Email for DocuSign**: anna.verdi@test.com

### Test 3: Partner Sources
- **IRBEMA**: test@irbema.it
- **Luxottica**: test@luxottica.com
- **Pirelli**: test@pirelli.com
- **FAS**: test@fas.it

## 🔄 Next Steps After Testing

1. **Review Test Results**: Check JSON file and console output
2. **Manual Email Verification**: Verify all 6 email templates
3. **Contract PDF Verification**: Check addressee is correct
4. **Clean Mock Data**: Remove test data from database
5. **Integration Testing**:
   - Test with real DocuSign API
   - Test with real Stripe API (test mode)
6. **Production Deployment**: If all tests pass

## 📚 Related Documentation

- `FIXES_ROBERTO_CRITICAL.md` - Details of all critical fixes made
- `WORKFLOW_COMPLETE_DOCUMENTATION.md` - Complete workflow documentation
- `migrations/0006_fix_email_templates.sql` - Email template definitions
- `src/modules/workflow-email-manager.ts` - Email sending logic
- `src/modules/contract-generator.ts` - Contract generation logic
- `src/modules/complete-workflow-orchestrator.ts` - Workflow orchestration

## 🎯 Success Criteria

All tests should pass with these outcomes:

✅ All workflows complete without errors
✅ All email templates sent successfully
✅ All placeholders replaced in emails
✅ Contracts addressed to correct person (intestatario)
✅ Complete data present in contracts (no "DA FORNIRE")
✅ Complete billing data for Stripe
✅ Complete recipient data for DocuSign
✅ Email notifica info@ includes ALL fields
✅ Partner lead sources work correctly
✅ All 6 email templates verified

---

**Created**: 2025-01-XX
**For**: Roberto Poggi - TeleMedCare V11.0
**Purpose**: Comprehensive testing of critical fixes
**Status**: Ready for execution
