#!/usr/bin/env python3
"""
Test Complete Workflow - Step by Step
Tests the entire 5-step workflow for TeleMedCare
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:3000"

def print_section(title):
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def print_result(step, response, success_field='success'):
    status = "✅ SUCCESS" if response.get(success_field) else "❌ FAILED"
    print(f"\n{status} - {step}")
    print(f"Status Code: {response.get('status_code', 'N/A')}")
    print(f"Response: {json.dumps(response, indent=2)}")

def test_workflow_base_service():
    """Test complete workflow for BASE service"""
    print_section("🧪 TEST WORKFLOW COMPLETO - SERVIZIO BASE")
    
    # ============================================
    # STEP 1: Lead Intake + Contract Request
    # ============================================
    print_section("STEP 1: Lead Intake + Contract Request")
    
    lead_data = {
        "nomeRichiedente": "Giovanni",
        "cognomeRichiedente": "Bianchi",
        "email": "giovanni.bianchi@test.com",
        "telefono": "+39 333 1111111",
        "tipoServizio": "BASE",
        "vuoleBrochure": "Si",
        "vuoleManuale": "Si",
        "vuoleContratto": "Si",
        "consensoPrivacy": True
    }
    
    response = requests.post(f"{BASE_URL}/api/lead", json=lead_data)
    result_step1 = {
        'status_code': response.status_code,
        **response.json()
    }
    print_result("STEP 1: Lead Intake", result_step1)
    
    if not result_step1.get('success'):
        print("❌ STEP 1 failed, stopping test")
        return
    
    lead_id = result_step1.get('leadId')
    contract_id = result_step1.get('workflow', {}).get('data', {}).get('contractId')
    
    print(f"\n📋 Lead ID: {lead_id}")
    print(f"📄 Contract ID: {contract_id}")
    
    if not contract_id:
        print("❌ No contract generated, stopping test")
        return
    
    time.sleep(2)
    
    # ============================================
    # STEP 2: Contract Signature
    # ============================================
    print_section("STEP 2: Contract Signature")
    
    signature_data = {
        "contractId": contract_id,
        "firmaDigitale": f"SIGNATURE_BASE64_{int(time.time())}",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 Test"
    }
    
    response = requests.post(f"{BASE_URL}/api/contracts/sign", json=signature_data)
    result_step2 = {
        'status_code': response.status_code,
        **response.json()
    }
    print_result("STEP 2: Contract Signature", result_step2)
    
    if not result_step2.get('success'):
        print("❌ STEP 2 failed, stopping test")
        return
    
    proforma_id = result_step2.get('data', {}).get('proformaId')
    print(f"\n💰 Proforma ID: {proforma_id}")
    
    if not proforma_id:
        print("❌ No proforma generated, stopping test")
        return
    
    time.sleep(2)
    
    # ============================================
    # STEP 3: Payment
    # ============================================
    print_section("STEP 3: Payment")
    
    payment_data = {
        "proformaId": proforma_id,
        "importo": 585.60,
        "metodoPagamento": "BONIFICO",
        "transactionId": f"BONIFICO-TEST-{int(time.time())}"
    }
    
    response = requests.post(f"{BASE_URL}/api/payments", json=payment_data)
    result_step3 = {
        'status_code': response.status_code
    }
    
    try:
        result_step3.update(response.json())
    except:
        result_step3['error'] = response.text
    
    print_result("STEP 3: Payment", result_step3)
    
    if not result_step3.get('success'):
        print("❌ STEP 3 failed, stopping test")
        print(f"Error details: {result_step3}")
        return
    
    payment_id = result_step3.get('data', {}).get('paymentId')
    codice_cliente = result_step3.get('data', {}).get('codiceCliente')
    print(f"\n💳 Payment ID: {payment_id}")
    print(f"👤 Codice Cliente: {codice_cliente}")
    
    time.sleep(2)
    
    # ============================================
    # STEP 4: Configuration Submission
    # ============================================
    print_section("STEP 4: Configuration Submission")
    
    config_data = {
        "leadId": lead_id,
        "contattiEmergenza": [
            {
                "nome": "Maria Bianchi",
                "telefono": "+39 333 2222222",
                "parentela": "Moglie"
            }
        ],
        "datiMedici": {
            "medicoCurante": "Dr. Rossi",
            "centroMedico": "Ospedale San Raffaele",
            "note": "Diabete tipo 2 controllato"
        },
        "preferenzeUtilizzo": {
            "linguaPreferita": "IT",
            "volumeNotifiche": "MEDIO"
        }
    }
    
    response = requests.post(f"{BASE_URL}/api/configurations", json=config_data)
    result_step4 = {
        'status_code': response.status_code
    }
    
    try:
        result_step4.update(response.json())
    except:
        result_step4['error'] = response.text
    
    print_result("STEP 4: Configuration", result_step4)
    
    if not result_step4.get('success'):
        print("⚠️ STEP 4 failed, but continuing to STEP 5")
    
    time.sleep(2)
    
    # ============================================
    # STEP 5: Device Association
    # ============================================
    print_section("STEP 5: Device Association")
    
    device_data = {
        "leadId": lead_id,
        "imei": f"356789012345678",
        "modello": "SiDLY Care Pro V11.0",
        "numeroSim": "3331234567"
    }
    
    response = requests.post(f"{BASE_URL}/api/devices/associate", json=device_data)
    result_step5 = {
        'status_code': response.status_code
    }
    
    try:
        result_step5.update(response.json())
    except:
        result_step5['error'] = response.text
    
    print_result("STEP 5: Device Association", result_step5)
    
    # ============================================
    # FINAL SUMMARY
    # ============================================
    print_section("📊 WORKFLOW TEST SUMMARY")
    
    steps = [
        ("STEP 1: Lead Intake", result_step1.get('success', False)),
        ("STEP 2: Contract Signature", result_step2.get('success', False)),
        ("STEP 3: Payment", result_step3.get('success', False)),
        ("STEP 4: Configuration", result_step4.get('success', False)),
        ("STEP 5: Device Association", result_step5.get('success', False))
    ]
    
    for step_name, success in steps:
        status = "✅" if success else "❌"
        print(f"{status} {step_name}")
    
    all_success = all(success for _, success in steps)
    
    if all_success:
        print("\n🎉 ALL STEPS COMPLETED SUCCESSFULLY!")
    else:
        print("\n⚠️ Some steps failed - check details above")
    
    print(f"\nTest completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    print(f"\n🚀 Starting Complete Workflow Test")
    print(f"Base URL: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        test_workflow_base_service()
    except Exception as e:
        print(f"\n❌ Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
