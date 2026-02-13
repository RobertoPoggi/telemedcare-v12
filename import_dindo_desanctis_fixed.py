#!/usr/bin/env python3
import requests
import json

API_URL = "https://telemedcare-v12.pages.dev"

# Dati dei 2 lead da Excel
leads_to_import = [
    {
        "nomeRichiedente": "Andrea",
        "cognomeRichiedente": "Dindo",
        "email": "andreadindo1@gmail.com",
        "telefono": "",
        "fonte": "Privati IRBEMA",
        "cm": "OB",
        "stato": "CONTACTED",
        "note": "Importato da Tracker Ottavia - 03/02/2026: Email inviata, attendere risposta"
    },
    {
        "nomeRichiedente": "Mary",
        "cognomeRichiedente": "De Sanctis",
        "email": "maryde.sanctis@placeholder.com",  # Email placeholder richiesta
        "telefono": "3396748762",
        "fonte": "Privati IRBEMA",
        "cm": "OB",
        "stato": "CONTACTED",
        "note": "Importato da Tracker Ottavia - 04/02/2026: Telefonata non risponde, messaggio inviato"
    }
]

print("📥 IMPORTAZIONE ANDREA DINDO E MARY DE SANCTIS (FIXED)")
print("=" * 70)

results = {
    "imported": [],
    "errors": []
}

for lead_data in leads_to_import:
    print(f"\n📝 Importazione: {lead_data['nomeRichiedente']} {lead_data['cognomeRichiedente']}")
    
    try:
        print(f"   Dati: {lead_data['nomeRichiedente']} {lead_data['cognomeRichiedente']}")
        print(f"   Email: {lead_data['email']}")
        print(f"   Phone: {lead_data.get('telefono', 'N/A')}")
        print(f"   Fonte: {lead_data['fonte']}")
        print(f"   CM: {lead_data['cm']}")
        print(f"   Status: {lead_data['stato']}")
        
        # Import lead
        response = requests.post(
            f"{API_URL}/api/leads",
            json=lead_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            lead_id = result.get('lead', {}).get('id', 'N/A')
            print(f"   ✅ IMPORTATO con successo!")
            print(f"   Lead ID: {lead_id}")
            
            results["imported"].append({
                "nome": f"{lead_data['nomeRichiedente']} {lead_data['cognomeRichiedente']}",
                "lead_id": lead_id,
                "email": lead_data["email"],
                "phone": lead_data.get("telefono", ""),
                "cm": lead_data["cm"],
                "status": lead_data["stato"]
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
                "nome": f"{lead_data['nomeRichiedente']} {lead_data['cognomeRichiedente']}",
                "errore": error_msg
            })
    
    except Exception as e:
        print(f"   ❌ ERRORE: {str(e)}")
        results["errors"].append({
            "nome": f"{lead_data['nomeRichiedente']} {lead_data['cognomeRichiedente']}",
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
        print(f"     Email: {lead['email']}")
        print(f"     Phone: {lead['phone'] if lead['phone'] else 'N/A'}")
        print(f"     CM: {lead['cm']} | Status: {lead['status']}")

if results["errors"]:
    print(f"\n❌ ERRORI ({len(results['errors'])}):")
    for error in results["errors"]:
        print(f"   • {error['nome']}: {error['errore']}")

# Salva report
with open('dindo_desanctis_import_fixed.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\n💾 Report salvato in: dindo_desanctis_import_fixed.json")
