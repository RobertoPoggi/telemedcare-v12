#!/usr/bin/env python3
"""
Test completo di tutte le varianti TeleMedCare V11
Email test: rpoggi55@gmail.com
"""

import requests
import json
import time
from datetime import datetime

API_URL = "http://localhost:8787"
TEST_EMAIL = "rpoggi55@gmail.com"
TEST_PHONE = "+39 333 123 4567"

# Colori output
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BLUE = '\033[94m'
ENDC = '\033[0m'

def print_success(msg):
    print(f"{GREEN}✅ {msg}{ENDC}")

def print_error(msg):
    print(f"{RED}❌ {msg}{ENDC}")

def print_info(msg):
    print(f"{BLUE}ℹ️  {msg}{ENDC}")

def print_test(msg):
    print(f"\n{YELLOW}{'='*60}")
    print(f"🧪 {msg}")
    print(f"{'='*60}{ENDC}\n")

def send_lead(data):
    """Invia un lead e ritorna la response"""
    try:
        response = requests.post(f"{API_URL}/api/lead", json=data, timeout=30)
        return response.json()
    except Exception as e:
        return {"success": False, "error": str(e)}

def verify_database(lead_id):
    """Verifica che il lead sia nel database"""
    # Questa funzione richiede accesso al database
    # Per ora solo printiamo il lead_id
    print_info(f"Lead ID: {lead_id}")

# ==========================================
# TEST VARIANTS
# ==========================================

results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "leads": []
}

print(f"""
╔═══════════════════════════════════════════════════════╗
║   TEST COMPLETO TELEMEDCARE V11 - TUTTE LE VARIANTI  ║
╚═══════════════════════════════════════════════════════╝

Email test: {TEST_EMAIL}
API URL: {API_URL}
Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
""")

# TEST 1: SOLO BROCHURE
print_test("TEST 1: Solo Brochure")
response1 = send_lead({
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "emailRichiedente": TEST_EMAIL,
    "telefonoRichiedente": TEST_PHONE,
    "servizio": "Solo informazioni",
    "vuoleBrochure": True,
    "vuoleManuale": False,
    "vuoleContratto": False,
    "note": "TEST 1: Richiesta solo brochure"
})
results["total"] += 1
if response1.get("success"):
    print_success(f"Lead creato: {response1.get('leadId')}")
    print_info(f"Workflow: {response1.get('workflow', {}).get('message')}")
    results["passed"] += 1
    results["leads"].append({"test": 1, "id": response1.get('leadId')})
else:
    print_error(f"Fallito: {response1.get('error', 'Unknown')}")
    results["failed"] += 1

time.sleep(2)

# TEST 2: BROCHURE + MANUALE
print_test("TEST 2: Brochure + Manuale SiDLY")
response2 = send_lead({
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "emailRichiedente": TEST_EMAIL,
    "telefonoRichiedente": TEST_PHONE,
    "servizio": "Pacchetto Base",
    "vuoleBrochure": True,
    "vuoleManuale": True,
    "vuoleContratto": False,
    "note": "TEST 2: Brochure + Manuale"
})
results["total"] += 1
if response2.get("success"):
    print_success(f"Lead creato: {response2.get('leadId')}")
    results["passed"] += 1
    results["leads"].append({"test": 2, "id": response2.get('leadId')})
else:
    print_error("Fallito")
    results["failed"] += 1

time.sleep(2)

# TEST 3: INFO GENERICHE
print_test("TEST 3: Info generiche (solo brochure automatica)")
response3 = send_lead({
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "emailRichiedente": TEST_EMAIL,
    "telefonoRichiedente": TEST_PHONE,
    "servizio": "Richiesta informazioni",
    "vuoleBrochure": False,
    "vuoleManuale": False,
    "vuoleContratto": False,
    "note": "TEST 3: Solo info generiche, invio brochure automatico"
})
results["total"] += 1
if response3.get("success"):
    print_success(f"Lead creato: {response3.get('leadId')}")
    results["passed"] += 1
    results["leads"].append({"test": 3, "id": response3.get('leadId')})
else:
    print_error("Fallito")
    results["failed"] += 1

time.sleep(2)

# TEST 4: CONTRATTO BASE
print_test("TEST 4: Contratto Base")
response4 = send_lead({
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "emailRichiedente": TEST_EMAIL,
    "telefonoRichiedente": TEST_PHONE,
    "servizio": "Pacchetto Base",
    "pacchetto": "BASE",
    "vuoleBrochure": False,
    "vuoleManuale": False,
    "vuoleContratto": True,
    "note": "TEST 4: Richiesta contratto Base (€585.60 IVA inclusa)"
})
results["total"] += 1
if response4.get("success"):
    print_success(f"Lead creato: {response4.get('leadId')}")
    print_info("Verifica: Contratto Base generato con prezzo €585.60")
    results["passed"] += 1
    results["leads"].append({"test": 4, "id": response4.get('leadId'), "type": "CONTRACT_BASE"})
else:
    print_error("Fallito")
    results["failed"] += 1

time.sleep(2)

# TEST 5: CONTRATTO AVANZATO
print_test("TEST 5: Contratto Avanzato")
response5 = send_lead({
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "emailRichiedente": TEST_EMAIL,
    "telefonoRichiedente": TEST_PHONE,
    "servizio": "Pacchetto Avanzato",
    "pacchetto": "AVANZATO",
    "vuoleBrochure": False,
    "vuoleManuale": False,
    "vuoleContratto": True,
    "note": "TEST 5: Richiesta contratto Avanzato (€1024.80 IVA inclusa)"
})
results["total"] += 1
if response5.get("success"):
    print_success(f"Lead creato: {response5.get('leadId')}")
    print_info("Verifica: Contratto Avanzato generato con prezzo €1024.80")
    results["passed"] += 1
    results["leads"].append({"test": 5, "id": response5.get('leadId'), "type": "CONTRACT_AVANZATO"})
else:
    print_error("Fallito")
    results["failed"] += 1

time.sleep(2)

# TEST 6: CONTRATTO + DOCUMENTI
print_test("TEST 6: Contratto Avanzato + Brochure + Manuale")
response6 = send_lead({
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "emailRichiedente": TEST_EMAIL,
    "telefonoRichiedente": TEST_PHONE,
    "servizio": "Pacchetto Avanzato",
    "pacchetto": "AVANZATO",
    "vuoleBrochure": True,
    "vuoleManuale": True,
    "vuoleContratto": True,
    "note": "TEST 6: Richiesta completa - tutto"
})
results["total"] += 1
if response6.get("success"):
    print_success(f"Lead creato: {response6.get('leadId')}")
    print_info("Verifica: Email documenti + contratto inviati")
    results["passed"] += 1
    results["leads"].append({"test": 6, "id": response6.get('leadId'), "type": "COMPLETO"})
else:
    print_error("Fallito")
    results["failed"] += 1

# ==========================================
# SUMMARY
# ==========================================

print(f"""
{'='*60}
📊 RIEPILOGO TEST
{'='*60}

Totale test:    {results['total']}
✅ Passati:     {results['passed']}
❌ Falliti:     {results['failed']}
📧 Email test:  {TEST_EMAIL}

{'='*60}
LEAD CREATI:
{'='*60}
""")

for lead in results["leads"]:
    test_num = lead.get("test")
    lead_id = lead.get("id")
    lead_type = lead.get("type", "INFO")
    print(f"  Test {test_num}: {lead_id} ({lead_type})")

print(f"""
{'='*60}
VERIFICA EMAIL
{'='*60}

Controlla la tua casella email: {TEST_EMAIL}

Dovresti aver ricevuto:
  - Test 1: Email con brochure
  - Test 2: Email con brochure + manuale
  - Test 3: Email con brochure (automatica)
  - Test 4: Email notifica + contratto Base
  - Test 5: Email notifica + contratto Avanzato
  - Test 6: Email documenti + contratto Avanzato

Totale email attese: ~10-12 email

{'='*60}
""")

# Salva lead ID per test successivi
with open('/tmp/test_leads.json', 'w') as f:
    json.dump(results, f, indent=2)

print_success("Lead ID salvati in /tmp/test_leads.json")
print("")
