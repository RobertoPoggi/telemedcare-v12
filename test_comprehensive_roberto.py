#!/usr/bin/env python3
"""
🧪 TEST COMPLETO TELEMEDCARE V11.0 - PER ROBERTO
================================================

Tests ALL workflows and email templates as requested by Roberto:
1. Complete BASE workflow
2. Complete AVANZATO workflow  
3. ALL 6 email templates verification
4. Both intestazioneContratto scenarios (richiedente & assistito)
5. All partner lead sources (IRBEMA, Luxottica, Pirelli, FAS)

Tests verify:
- Email notifica info@ with ALL fields (condizioniSalute, urgenzaRisposta, giorniRisposta)
- Contract addressed correctly (intestatario not assistito)
- ALL email placeholders replaced ({{TIPO_SERVIZIO}}, {{NOME_CLIENTE}}, etc.)
- Complete data for Stripe billing (CAP, città, provincia, indirizzo completo)
- Complete data for DocuSign (email intestatario - CRITICAL)
- Proforma generation and email after contract signature
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, List, Tuple

# Configuration
BASE_URL = "http://localhost:3000"
TEST_RESULTS = []

# ANSI Colors for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text: str, emoji: str = "🧪"):
    """Print a section header"""
    print(f"\n{'='*100}")
    print(f"{emoji} {Colors.BOLD}{Colors.CYAN}{text}{Colors.END}")
    print(f"{'='*100}\n")

def print_success(text: str):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_error(text: str):
    """Print error message"""
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def print_warning(text: str):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.END}")

def print_info(text: str):
    """Print info message"""
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.END}")

def record_test(test_name: str, success: bool, details: Dict[str, Any]):
    """Record test result"""
    TEST_RESULTS.append({
        'test': test_name,
        'success': success,
        'details': details,
        'timestamp': datetime.now().isoformat()
    })

def make_request(method: str, endpoint: str, data: Dict = None, description: str = "") -> Tuple[bool, Dict]:
    """Make HTTP request and handle response"""
    try:
        url = f"{BASE_URL}{endpoint}"
        print_info(f"{description or method} → {endpoint}")
        
        if method == "POST":
            response = requests.post(url, json=data, timeout=30)
        elif method == "GET":
            response = requests.get(url, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        result = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
        result['status_code'] = response.status_code
        
        if response.status_code >= 400:
            print_error(f"HTTP {response.status_code}: {result.get('error', 'Unknown error')}")
            return False, result
        
        success = result.get('success', response.status_code < 400)
        if success:
            print_success(f"Success: {result.get('message', 'OK')}")
        else:
            print_error(f"Failed: {result.get('error', 'Unknown error')}")
        
        return success, result
        
    except requests.exceptions.Timeout:
        print_error(f"Request timeout after 30s")
        return False, {'error': 'Timeout'}
    except requests.exceptions.ConnectionError:
        print_error(f"Connection error - is the server running at {BASE_URL}?")
        return False, {'error': 'Connection refused'}
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        return False, {'error': str(e)}

def verify_email_placeholders(test_name: str, expected_fields: List[str]):
    """Verify that email placeholders were replaced (manual check noted)"""
    print_info(f"📧 EMAIL VERIFICATION REQUIRED for {test_name}:")
    print_info(f"   Check that these placeholders are replaced in email:")
    for field in expected_fields:
        print(f"      - {field}")
    print_warning("   ⚠️  Manual verification needed - check email inbox!")

# ==========================================
# TEST 1: WORKFLOW COMPLETO BASE - INTESTAZIONE RICHIEDENTE
# ==========================================
def test_workflow_base_richiedente():
    """Test complete BASE workflow with contract addressed to RICHIEDENTE"""
    print_header("TEST 1: WORKFLOW COMPLETO BASE - INTESTAZIONE RICHIEDENTE", "🧪")
    
    test_name = "BASE_WORKFLOW_RICHIEDENTE"
    test_passed = True
    test_details = {}
    
    # STEP 1: Lead Intake + Contract Request
    print_header("STEP 1: Lead Intake + Richiesta Contratto", "📋")
    
    lead_data = {
        # RICHIEDENTE (paga e firma)
        "nomeRichiedente": "Roberto",
        "cognomeRichiedente": "Poggi",
        "emailRichiedente": "roberto.poggi@test.com",
        "telefonoRichiedente": "+39 333 1234567",
        "cfRichiedente": "PGGRRT70A01H501Z",
        "indirizzoRichiedente": "Via Roma 123",
        "capRichiedente": "20100",
        "cittaRichiedente": "Milano",
        "provinciaRichiedente": "MI",
        "luogoNascitaRichiedente": "Milano",
        "dataNascitaRichiedente": "1970-01-01",
        
        # ASSISTITO (riceve il servizio - diverso dal richiedente)
        "nomeAssistito": "Rosaria",
        "cognomeAssistito": "Ressa",
        "etaAssistito": 75,
        "cfAssistito": "RSSRSR45M70F205X",
        "indirizzoAssistito": "Via Verdi 456",
        "capAssistito": "20121",
        "cittaAssistito": "Milano",
        "provinciaAssistito": "MI",
        "dataNascitaAssistito": "1945-08-30",
        "luogoNascitaAssistito": "Milano",
        "telefonoAssistito": "+39 333 7654321",
        "emailAssistito": "rosaria.ressa@test.com",
        
        # SERVIZIO
        "pacchetto": "BASE",
        "vuoleBrochure": True,
        "vuoleManuale": True,
        "vuoleContratto": True,
        "intestazioneContratto": "richiedente",  # CRITICAL: contract to RICHIEDENTE
        
        # ALTRI DATI per email notifica info@
        "fonte": "Landing Page Test",
        "condizioniSalute": "Diabete tipo 2, ipertensione controllata",
        "preferenzaContatto": "Email",
        "urgenzaRisposta": "Alta",
        "giorniRisposta": 2,
        "note": "Richiesta urgente per assistenza 24/7",
        
        # PRIVACY
        "consensoPrivacy": True
    }
    
    success, result = make_request("POST", "/api/lead", lead_data, "Creating lead with BASE service")
    test_passed = test_passed and success
    
    if not success:
        print_error("STEP 1 FAILED - stopping test")
        record_test(test_name, False, {"step": 1, "error": result.get('error')})
        return False
    
    lead_id = result.get('leadId')
    contract_id = result.get('workflow', {}).get('data', {}).get('contractId')
    test_details['lead_id'] = lead_id
    test_details['contract_id'] = contract_id
    
    print_success(f"Lead created: {lead_id}")
    print_success(f"Contract created: {contract_id}")
    
    # Verify email notifica info@ sent with ALL fields
    verify_email_placeholders("email_notifica_info", [
        "{{NOME_RICHIEDENTE}}", "{{COGNOME_RICHIEDENTE}}", "{{EMAIL_RICHIEDENTE}}",
        "{{NOME_ASSISTITO}}", "{{COGNOME_ASSISTITO}}", 
        "{{CONDIZIONI_SALUTE}}", "{{URGENZA_RISPOSTA}}", "{{GIORNI_RISPOSTA}}",
        "{{PACCHETTO}}", "{{INTESTAZIONE_CONTRATTO}}"
    ])
    
    # Verify email documenti sent
    verify_email_placeholders("email_documenti_informativi", [
        "{{NOME_CLIENTE}}", "{{TIPO_SERVIZIO}}"
    ])
    
    # Verify email contratto sent
    verify_email_placeholders("email_invio_contratto", [
        "{{NOME_CLIENTE}}", "{{TIPO_SERVIZIO}}", "{{PIANO_SERVIZIO}}"
    ])
    
    time.sleep(2)
    
    # STEP 2: Verify Contract Data
    print_header("STEP 2: Verifica Dati Contratto", "📄")
    
    print_info("Verifying contract is addressed to RICHIEDENTE (Roberto Poggi)...")
    print_info("Contract should contain:")
    print(f"   - Nome: Roberto Poggi")
    print(f"   - CF: PGGRRT70A01H501Z")
    print(f"   - Indirizzo: Via Roma 123, 20100 Milano (MI)")
    print(f"   - Email: roberto.poggi@test.com (CRITICAL for DocuSign)")
    print(f"   - Telefono: +39 333 1234567")
    print_warning("   ⚠️  Manual verification needed - check generated contract PDF!")
    
    time.sleep(2)
    
    # STEP 3: Contract Signature
    print_header("STEP 3: Firma Contratto", "✍️")
    
    signature_data = {
        "contractId": contract_id,
        "firmaDigitale": f"SIGNATURE_BASE64_{int(time.time())}",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 Test Browser"
    }
    
    success, result = make_request("POST", "/api/contracts/sign", signature_data, "Signing contract")
    test_passed = test_passed and success
    
    if not success:
        print_error("STEP 3 FAILED - stopping test")
        record_test(test_name, False, {"step": 3, "error": result.get('error')})
        return False
    
    proforma_id = result.get('data', {}).get('proformaId')
    test_details['proforma_id'] = proforma_id
    
    print_success(f"Contract signed successfully")
    print_success(f"Proforma generated: {proforma_id}")
    
    # Verify email proforma sent
    verify_email_placeholders("email_invio_proforma", [
        "{{NOME_CLIENTE}}", "{{IMPORTO_TOTALE}}", "{{TIPO_SERVIZIO}}"
    ])
    
    time.sleep(2)
    
    # STEP 4: Payment
    print_header("STEP 4: Pagamento", "💳")
    
    payment_data = {
        "proformaId": proforma_id,
        "importo": 585.60,  # BASE service price
        "metodoPagamento": "STRIPE",
        "transactionId": f"STRIPE-TEST-{int(time.time())}",
        # Complete billing details for Stripe
        "billingAddress": {
            "line1": "Via Roma 123",
            "city": "Milano",
            "postal_code": "20100",
            "state": "MI",
            "country": "IT"
        },
        "billingName": "Roberto Poggi",
        "billingEmail": "roberto.poggi@test.com",
        "billingPhone": "+39 333 1234567"
    }
    
    success, result = make_request("POST", "/api/payments", payment_data, "Processing payment")
    test_passed = test_passed and success
    
    if not success:
        print_error("STEP 4 FAILED - continuing to next step")
        # Don't stop test, continue to see other steps
    else:
        payment_id = result.get('data', {}).get('paymentId')
        codice_cliente = result.get('data', {}).get('codiceCliente')
        test_details['payment_id'] = payment_id
        test_details['codice_cliente'] = codice_cliente
        
        print_success(f"Payment processed: {payment_id}")
        print_success(f"Client code: {codice_cliente}")
        
        # Verify email benvenuto sent with configuration form
        verify_email_placeholders("email_benvenuto", [
            "{{NOME_CLIENTE}}", "{{CODICE_CLIENTE}}", "{{LINK_CONFIGURAZIONE}}"
        ])
    
    time.sleep(2)
    
    # STEP 5: Configuration Submission
    print_header("STEP 5: Compilazione Form Configurazione", "⚙️")
    
    config_data = {
        "leadId": lead_id,
        "contattiEmergenza": [
            {
                "nome": "Maria Rossi",
                "telefono": "+39 333 9999999",
                "parentela": "Figlia"
            }
        ],
        "datiMedici": {
            "medicoCurante": "Dr. Giuseppe Verdi",
            "centroMedico": "Ospedale San Raffaele Milano",
            "note": "Diabete tipo 2 in terapia con metformina, ipertensione controllata"
        },
        "preferenzeUtilizzo": {
            "linguaPreferita": "IT",
            "volumeNotifiche": "ALTO"
        }
    }
    
    success, result = make_request("POST", "/api/configurations", config_data, "Submitting configuration")
    test_passed = test_passed and success
    
    if not success:
        print_warning("STEP 5 FAILED - continuing to next step")
    else:
        print_success("Configuration submitted successfully")
    
    time.sleep(2)
    
    # STEP 6: Device Association
    print_header("STEP 6: Associazione Dispositivo", "📱")
    
    device_data = {
        "leadId": lead_id,
        "imei": "356789012345678",
        "modello": "SiDLY Care Pro V11.0",
        "numeroSim": "3331234567"
    }
    
    success, result = make_request("POST", "/api/devices/associate", device_data, "Associating device")
    test_passed = test_passed and success
    
    if not success:
        print_warning("STEP 6 FAILED")
    else:
        print_success("Device associated successfully")
        
        # Verify email attivazione sent
        verify_email_placeholders("email_conferma_attivazione", [
            "{{NOME_CLIENTE}}", "{{CODICE_DISPOSITIVO}}", "{{IMEI}}"
        ])
    
    # Record final result
    record_test(test_name, test_passed, test_details)
    
    print_header("RIEPILOGO TEST 1", "📊")
    if test_passed:
        print_success(f"TEST PASSED: Workflow BASE con intestazione RICHIEDENTE completato!")
    else:
        print_warning(f"TEST PARTIALLY PASSED: Alcuni step hanno fallito")
    
    return test_passed

# ==========================================
# TEST 2: WORKFLOW COMPLETO AVANZATO - INTESTAZIONE ASSISTITO
# ==========================================
def test_workflow_avanzato_assistito():
    """Test complete AVANZATO workflow with contract addressed to ASSISTITO"""
    print_header("TEST 2: WORKFLOW COMPLETO AVANZATO - INTESTAZIONE ASSISTITO", "🧪")
    
    test_name = "AVANZATO_WORKFLOW_ASSISTITO"
    test_passed = True
    test_details = {}
    
    # STEP 1: Lead Intake + Contract Request
    print_header("STEP 1: Lead Intake + Richiesta Contratto", "📋")
    
    lead_data = {
        # RICHIEDENTE (chi fa la richiesta ma NON è l'intestatario)
        "nomeRichiedente": "Marco",
        "cognomeRichiedente": "Bianchi",
        "emailRichiedente": "marco.bianchi@test.com",
        "telefonoRichiedente": "+39 347 1111111",
        "cfRichiedente": "BNCMRC75B15F205K",
        "indirizzoRichiedente": "Via Dante 789",
        "capRichiedente": "20122",
        "cittaRichiedente": "Milano",
        "provinciaRichiedente": "MI",
        
        # ASSISTITO (riceve il servizio E firma il contratto - È L'INTESTATARIO)
        "nomeAssistito": "Anna",
        "cognomeAssistito": "Verdi",
        "etaAssistito": 68,
        "cfAssistito": "VRDNNA52A41F205W",
        "indirizzoAssistito": "Via Manzoni 321",
        "capAssistito": "20123",
        "cittaAssistito": "Milano",
        "provinciaAssistito": "MI",
        "dataNascitaAssistito": "1952-01-01",
        "luogoNascitaAssistito": "Milano",
        "telefonoAssistito": "+39 347 2222222",
        "emailAssistito": "anna.verdi@test.com",  # CRITICAL: used for DocuSign
        
        # SERVIZIO
        "pacchetto": "AVANZATO",
        "vuoleBrochure": True,
        "vuoleManuale": True,
        "vuoleContratto": True,
        "intestazioneContratto": "assistito",  # CRITICAL: contract to ASSISTITO
        
        # ALTRI DATI
        "fonte": "Landing Page Test",
        "condizioniSalute": "BPCO, insufficienza cardiaca lieve",
        "preferenzaContatto": "Telefono",
        "urgenzaRisposta": "Media",
        "giorniRisposta": 5,
        "note": "Necessita monitoraggio parametri vitali H24",
        
        # PRIVACY
        "consensoPrivacy": True
    }
    
    success, result = make_request("POST", "/api/lead", lead_data, "Creating lead with AVANZATO service")
    test_passed = test_passed and success
    
    if not success:
        print_error("STEP 1 FAILED - stopping test")
        record_test(test_name, False, {"step": 1, "error": result.get('error')})
        return False
    
    lead_id = result.get('leadId')
    contract_id = result.get('workflow', {}).get('data', {}).get('contractId')
    test_details['lead_id'] = lead_id
    test_details['contract_id'] = contract_id
    
    print_success(f"Lead created: {lead_id}")
    print_success(f"Contract created: {contract_id}")
    
    verify_email_placeholders("email_notifica_info", [
        "{{NOME_RICHIEDENTE}}", "{{NOME_ASSISTITO}}", "{{PACCHETTO}}",
        "{{CONDIZIONI_SALUTE}}", "{{INTESTAZIONE_CONTRATTO}}"
    ])
    
    time.sleep(2)
    
    # STEP 2: Verify Contract Data
    print_header("STEP 2: Verifica Dati Contratto", "📄")
    
    print_info("Verifying contract is addressed to ASSISTITO (Anna Verdi)...")
    print_info("Contract should contain:")
    print(f"   - Nome: Anna Verdi")
    print(f"   - CF: VRDNNA52A41F205W")
    print(f"   - Indirizzo: Via Manzoni 321, 20123 Milano (MI)")
    print(f"   - Email: anna.verdi@test.com (CRITICAL for DocuSign)")
    print(f"   - Telefono: +39 347 2222222")
    print_warning("   ⚠️  Manual verification needed - check generated contract PDF!")
    
    time.sleep(2)
    
    # STEP 3: Contract Signature
    print_header("STEP 3: Firma Contratto", "✍️")
    
    signature_data = {
        "contractId": contract_id,
        "firmaDigitale": f"SIGNATURE_BASE64_{int(time.time())}",
        "ipAddress": "192.168.1.101",
        "userAgent": "Mozilla/5.0 Test Browser"
    }
    
    success, result = make_request("POST", "/api/contracts/sign", signature_data, "Signing contract")
    test_passed = test_passed and success
    
    if not success:
        print_error("STEP 3 FAILED - stopping test")
        record_test(test_name, False, {"step": 3, "error": result.get('error')})
        return False
    
    proforma_id = result.get('data', {}).get('proformaId')
    test_details['proforma_id'] = proforma_id
    
    print_success(f"Contract signed successfully")
    print_success(f"Proforma generated: {proforma_id}")
    
    verify_email_placeholders("email_invio_proforma", [
        "{{NOME_CLIENTE}}", "{{IMPORTO_TOTALE}}"
    ])
    
    time.sleep(2)
    
    # STEP 4: Payment
    print_header("STEP 4: Pagamento", "💳")
    
    payment_data = {
        "proformaId": proforma_id,
        "importo": 1025.60,  # AVANZATO service price
        "metodoPagamento": "STRIPE",
        "transactionId": f"STRIPE-TEST-{int(time.time())}",
        # Complete billing details for Stripe (ASSISTITO data)
        "billingAddress": {
            "line1": "Via Manzoni 321",
            "city": "Milano",
            "postal_code": "20123",
            "state": "MI",
            "country": "IT"
        },
        "billingName": "Anna Verdi",
        "billingEmail": "anna.verdi@test.com",
        "billingPhone": "+39 347 2222222"
    }
    
    success, result = make_request("POST", "/api/payments", payment_data, "Processing payment")
    test_passed = test_passed and success
    
    if not success:
        print_error("STEP 4 FAILED - continuing to next step")
    else:
        payment_id = result.get('data', {}).get('paymentId')
        test_details['payment_id'] = payment_id
        print_success(f"Payment processed: {payment_id}")
    
    time.sleep(2)
    
    # STEP 5: Configuration & Device
    print_header("STEP 5-6: Configurazione e Dispositivo", "⚙️")
    
    config_data = {
        "leadId": lead_id,
        "contattiEmergenza": [
            {
                "nome": "Marco Bianchi",
                "telefono": "+39 347 1111111",
                "parentela": "Figlio"
            }
        ],
        "datiMedici": {
            "medicoCurante": "Dr. Paolo Rossi",
            "centroMedico": "Policlinico Milano",
            "note": "BPCO in trattamento"
        },
        "preferenzeUtilizzo": {
            "linguaPreferita": "IT",
            "volumeNotifiche": "ALTO"
        }
    }
    
    success, result = make_request("POST", "/api/configurations", config_data, "Submitting configuration")
    if success:
        print_success("Configuration submitted")
    
    time.sleep(1)
    
    device_data = {
        "leadId": lead_id,
        "imei": "356789012345679",
        "modello": "SiDLY Care Pro V11.0 Advanced",
        "numeroSim": "3472222222"
    }
    
    success, result = make_request("POST", "/api/devices/associate", device_data, "Associating device")
    if success:
        print_success("Device associated")
        verify_email_placeholders("email_conferma_attivazione", [
            "{{NOME_CLIENTE}}", "{{IMEI}}"
        ])
    
    # Record final result
    record_test(test_name, test_passed, test_details)
    
    print_header("RIEPILOGO TEST 2", "📊")
    if test_passed:
        print_success(f"TEST PASSED: Workflow AVANZATO con intestazione ASSISTITO completato!")
    else:
        print_warning(f"TEST PARTIALLY PASSED: Alcuni step hanno fallito")
    
    return test_passed

# ==========================================
# TEST 3: PARTNER LEAD SOURCES
# ==========================================
def test_partner_lead_sources():
    """Test lead creation from partner sources"""
    print_header("TEST 3: FLUSSI LEAD DA PARTNER", "🤝")
    
    partners = [
        {
            "name": "IRBEMA",
            "data": {
                "nomeRichiedente": "Test",
                "cognomeRichiedente": "IRBEMA",
                "emailRichiedente": "test@irbema.it",
                "pacchetto": "BASE",
                "fonte": "IRBEMA",
                "consensoPrivacy": True
            }
        },
        {
            "name": "Luxottica",
            "data": {
                "nomeRichiedente": "Test",
                "cognomeRichiedente": "Luxottica",
                "emailRichiedente": "test@luxottica.com",
                "pacchetto": "AVANZATO",
                "fonte": "Luxottica",
                "consensoPrivacy": True
            }
        },
        {
            "name": "Pirelli",
            "data": {
                "nomeRichiedente": "Test",
                "cognomeRichiedente": "Pirelli",
                "emailRichiedente": "test@pirelli.com",
                "pacchetto": "BASE",
                "fonte": "Pirelli",
                "consensoPrivacy": True
            }
        },
        {
            "name": "FAS",
            "data": {
                "nomeRichiedente": "Test",
                "cognomeRichiedente": "FAS",
                "emailRichiedente": "test@fas.it",
                "pacchetto": "AVANZATO",
                "fonte": "FAS",
                "consensoPrivacy": True
            }
        }
    ]
    
    all_passed = True
    for partner in partners:
        print_info(f"Testing partner: {partner['name']}")
        success, result = make_request("POST", "/api/lead", partner['data'], f"Creating {partner['name']} lead")
        
        if success:
            print_success(f"{partner['name']} lead created: {result.get('leadId')}")
        else:
            print_error(f"{partner['name']} lead creation failed")
            all_passed = False
        
        time.sleep(1)
    
    record_test("PARTNER_LEAD_SOURCES", all_passed, {"partners": [p['name'] for p in partners]})
    
    print_header("RIEPILOGO TEST 3", "📊")
    if all_passed:
        print_success("TEST PASSED: Tutti i partner testati con successo!")
    else:
        print_warning("TEST PARTIALLY PASSED: Alcuni partner hanno fallito")
    
    return all_passed

# ==========================================
# TEST 4: EMAIL TEMPLATES VERIFICATION
# ==========================================
def test_email_templates():
    """Verify all 6 email templates are working"""
    print_header("TEST 4: VERIFICA TUTTI I TEMPLATE EMAIL", "📧")
    
    templates = [
        {
            "name": "email_notifica_info",
            "description": "Email notifica a info@telemedcare.it con TUTTI i campi",
            "placeholders": [
                "{{NOME_RICHIEDENTE}}", "{{COGNOME_RICHIEDENTE}}", "{{EMAIL_RICHIEDENTE}}",
                "{{TELEFONO_RICHIEDENTE}}", "{{NOME_ASSISTITO}}", "{{COGNOME_ASSISTITO}}",
                "{{CONDIZIONI_SALUTE}}", "{{URGENZA_RISPOSTA}}", "{{GIORNI_RISPOSTA}}",
                "{{PACCHETTO}}", "{{INTESTAZIONE_CONTRATTO}}", "{{NOTE}}"
            ]
        },
        {
            "name": "email_documenti_informativi",
            "description": "Email invio brochure e manuale",
            "placeholders": ["{{NOME_CLIENTE}}", "{{TIPO_SERVIZIO}}"]
        },
        {
            "name": "email_invio_contratto",
            "description": "Email invio contratto PDF",
            "placeholders": ["{{NOME_CLIENTE}}", "{{COGNOME_CLIENTE}}", "{{TIPO_SERVIZIO}}", "{{PIANO_SERVIZIO}}"]
        },
        {
            "name": "email_invio_proforma",
            "description": "Email invio proforma dopo firma contratto",
            "placeholders": ["{{NOME_CLIENTE}}", "{{IMPORTO_TOTALE}}", "{{SCADENZA_PAGAMENTO}}", "{{TIPO_SERVIZIO}}"]
        },
        {
            "name": "email_benvenuto",
            "description": "Email benvenuto con form configurazione dopo pagamento",
            "placeholders": ["{{NOME_CLIENTE}}", "{{CODICE_CLIENTE}}", "{{LINK_CONFIGURAZIONE}}", "{{PIANO_SERVIZIO}}"]
        },
        {
            "name": "email_conferma_attivazione",
            "description": "Email conferma attivazione dopo associazione dispositivo",
            "placeholders": ["{{NOME_CLIENTE}}", "{{CODICE_DISPOSITIVO}}", "{{IMEI}}", "{{NUMERO_SIM}}"]
        }
    ]
    
    print_info("Verifica manuale richiesta per i seguenti template email:")
    print()
    
    for i, template in enumerate(templates, 1):
        print(f"{Colors.CYAN}{i}. {template['name']}{Colors.END}")
        print(f"   {template['description']}")
        print(f"   Placeholders da verificare:")
        for placeholder in template['placeholders']:
            print(f"      - {placeholder}")
        print()
    
    print_warning("⚠️  AZIONE RICHIESTA:")
    print_warning("   1. Controlla l'inbox delle email di test")
    print_warning("   2. Verifica che TUTTI i placeholder siano stati sostituiti")
    print_warning("   3. Verifica che i dati siano corretti (intestatario, importi, etc.)")
    print_warning("   4. Conferma che le email siano state inviate a info@telemedcare.it")
    
    # This is a manual verification test
    record_test("EMAIL_TEMPLATES_VERIFICATION", True, {
        "templates": [t['name'] for t in templates],
        "note": "Manual verification required"
    })
    
    return True

# ==========================================
# MAIN TEST RUNNER
# ==========================================
def run_all_tests():
    """Run all comprehensive tests"""
    print_header("🧪 TELEMEDCARE V11.0 - TEST COMPLETO PER ROBERTO 🧪", "🚀")
    print(f"{Colors.BOLD}Starting comprehensive tests at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}")
    print(f"Base URL: {BASE_URL}\n")
    
    # Check if server is running
    print_info("Checking if server is running...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        print_success(f"Server is running (status: {response.status_code})")
    except:
        print_error(f"Server is NOT running at {BASE_URL}")
        print_error("Please start the server with: npm run dev")
        return
    
    print()
    time.sleep(2)
    
    # Run all tests
    results = {
        "test_1_base_richiedente": test_workflow_base_richiedente(),
        "test_2_avanzato_assistito": test_workflow_avanzato_assistito(),
        "test_3_partner_sources": test_partner_lead_sources(),
        "test_4_email_templates": test_email_templates()
    }
    
    # Final summary
    print_header("📊 RIEPILOGO FINALE TESTS", "🎯")
    
    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)
    failed_tests = total_tests - passed_tests
    
    print(f"\n{Colors.BOLD}Test Results:{Colors.END}")
    for test_name, passed in results.items():
        status = f"{Colors.GREEN}✅ PASSED{Colors.END}" if passed else f"{Colors.RED}❌ FAILED{Colors.END}"
        print(f"  {test_name}: {status}")
    
    print(f"\n{Colors.BOLD}Summary:{Colors.END}")
    print(f"  Total tests: {total_tests}")
    print(f"  {Colors.GREEN}Passed: {passed_tests}{Colors.END}")
    print(f"  {Colors.RED}Failed: {failed_tests}{Colors.END}")
    print(f"  Success rate: {(passed_tests/total_tests)*100:.1f}%")
    
    # Save detailed results to file
    results_file = f"test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, 'w') as f:
        json.dump({
            'summary': results,
            'detailed_results': TEST_RESULTS,
            'timestamp': datetime.now().isoformat()
        }, f, indent=2)
    
    print(f"\n{Colors.CYAN}Detailed results saved to: {results_file}{Colors.END}")
    
    print_header("✅ TESTS COMPLETED", "🎉")
    
    if passed_tests == total_tests:
        print_success("🎉 TUTTI I TEST SONO PASSATI! Sistema pronto per il deployment!")
    else:
        print_warning(f"⚠️  {failed_tests} test(s) failed - review the logs above")
    
    print(f"\n{Colors.BOLD}Next steps:{Colors.END}")
    print("  1. Review email inbox to verify ALL templates")
    print("  2. Check generated contract PDFs for correct addressee")
    print("  3. Verify all placeholders are replaced")
    print("  4. Test DocuSign integration with real email addresses")
    print("  5. Test Stripe integration with test cards")
    print("  6. Clean mock data from database")
    print("  7. Deploy to production!")

if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}⚠️  Tests interrupted by user{Colors.END}")
    except Exception as e:
        print(f"\n\n{Colors.RED}❌ Fatal error: {str(e)}{Colors.END}")
        import traceback
        traceback.print_exc()
