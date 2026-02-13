#!/usr/bin/env python3
import requests
import json
from datetime import datetime

API_URL = "https://telemedcare-v12.pages.dev"

# Dati dei 2 lead da Excel
leads_to_import = [
    {
        "firstName": "Andrea",
        "lastName": "Dindo",
        "email": "andreadindo1@gmail.com",
        "phone": "",
        "source": "Privati IRBEMA",
        "commercialManager": "OB",
        "status": "CONTACTED",  # Email inviata -> CONTACTED
        "notes": "Importato da Tracker Ottavia - 03/02/2026: Email inviata, attendere risposta",
        "interactions": [
            {
                "date": "2026-02-03",
                "type": "email",
                "description": "Email inviata - Attendere risposta",
                "outcome": "PENDING"
            }
        ]
    },
    {
        "firstName": "Mary",
        "lastName": "De Sanctis",
        "email": "",
        "phone": "3396748762",
        "source": "Privati IRBEMA",
        "commercialManager": "OB",
        "status": "CONTACTED",  # Telefonata non risponde -> CONTACTED
        "notes": "Importato da Tracker Ottavia - 04/02/2026: Telefonata non risponde, messaggio inviato",
        "interactions": [
            {
                "date": "2026-02-04",
                "type": "call",
                "description": "Telefonata - Non risponde. Messagio Inviato",
                "outcome": "NO_ANSWER"
            }
        ]
    }
]

print("📥 IMPORTAZIONE ANDREA DINDO E MARY DE SANCTIS")
print("=" * 70)

results = {
    "imported": [],
    "errors": []
}

for lead_data in leads_to_import:
    print(f"\n📝 Importazione: {lead_data['firstName']} {lead_data['lastName']}")
    
    try:
        # Prepara payload per TeleMedCare
        payload = {
            "firstName": lead_data["firstName"],
            "lastName": lead_data["lastName"],
            "email": lead_data["email"] if lead_data["email"] else None,
            "phone": lead_data["phone"] if lead_data["phone"] else None,
            "source": lead_data["source"],
            "commercialManager": lead_data["commercialManager"],
            "status": lead_data["status"],
            "notes": lead_data["notes"],
            "service": "eCura PRO",
            "plan": "BASE"
        }
        
        # Rimuovi campi vuoti
        payload = {k: v for k, v in payload.items() if v}
        
        print(f"   Dati: {payload['firstName']} {payload['lastName']}")
        print(f"   Email: {payload.get('email', 'N/A')}")
        print(f"   Phone: {payload.get('phone', 'N/A')}")
        print(f"   Source: {payload['source']}")
        print(f"   CM: {payload['commercialManager']}")
        print(f"   Status: {payload['status']}")
        
        # Import lead
        response = requests.post(
            f"{API_URL}/api/leads",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            lead_id = result.get('lead', {}).get('id', 'N/A')
            print(f"   ✅ IMPORTATO con successo!")
            print(f"   Lead ID: {lead_id}")
            
            results["imported"].append({
                "nome": f"{lead_data['firstName']} {lead_data['lastName']}",
                "lead_id": lead_id,
                "email": lead_data["email"],
                "phone": lead_data["phone"],
                "cm": lead_data["commercialManager"],
                "status": lead_data["status"]
            })
        else:
            error_msg = f"HTTP {response.status_code}"
            try:
                error_detail = response.json()
                error_msg = f"{error_msg} - {error_detail}"
            except:
                pass
            
            print(f"   ❌ ERRORE: {error_msg}")
            results["errors"].append({
                "nome": f"{lead_data['firstName']} {lead_data['lastName']}",
                "errore": error_msg
            })
    
    except Exception as e:
        print(f"   ❌ ERRORE: {str(e)}")
        results["errors"].append({
            "nome": f"{lead_data['firstName']} {lead_data['lastName']}",
            "errore": str(e)
        })

print("\n" + "=" * 70)
print("📊 RISULTATI FINALI")
print("=" * 70)
print(f"✅ Importati: {len(results['imported'])}")
print(f"❌ Errori: {len(results['errors'])}")

if results["imported"]:
    print(f"\n✅ LEAD IMPORTATI ({len(results['imported'])}):")
    for lead in results["imported"]:
        print(f"   • {lead['nome']} → {lead['lead_id']}")
        print(f"     Email: {lead['email'] if lead['email'] else 'N/A'}")
        print(f"     Phone: {lead['phone'] if lead['phone'] else 'N/A'}")
        print(f"     CM: {lead['cm']} | Status: {lead['status']}")

if results["errors"]:
    print(f"\n❌ ERRORI ({len(results['errors'])}):")
    for error in results["errors"]:
        print(f"   • {error['nome']}: {error['errore']}")

# Salva report
with open('dindo_desanctis_import_result.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\n💾 Report salvato in: dindo_desanctis_import_result.json")
