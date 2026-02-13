#!/usr/bin/env python3
import json
import requests
import time

API_URL = "https://telemedcare-v12.pages.dev"

# Gli 8 lead mancanti di Ottavia
MISSING_LEADS = [
    {"nome": "Alberto", "cognome": "Avanzi"},
    {"nome": "Giovanna", "cognome": "Giordano"},
    {"nome": "Mary", "cognome": "De Sanctis"},
    {"nome": "Francesco", "cognome": "Egiziano"},
    {"nome": "Enzo", "cognome": "Pedron"},
    {"nome": "Andrea", "cognome": "Dindo"},
    {"nome": "Maria Chiara", "cognome": "Baldassini"},
    {"nome": "Laura", "cognome": "Bianchi"}
]

print("🔄 RECUPERO 8 LEAD MANCANTI DI OTTAVIA DA HUBSPOT")
print("="*80)
print()

imported = []
errors = []

for idx, lead in enumerate(MISSING_LEADS, 1):
    nome = lead['nome']
    cognome = lead['cognome']
    nome_completo = f"{nome} {cognome}"
    
    print(f"🔍 [{idx}/8] Cerco '{nome_completo}' su HubSpot...")
    
    try:
        # Cerco per nome e cognome su HubSpot (senza filtro eCura)
        search_data = {
            'firstName': nome,
            'lastName': cognome,
            'onlyEcura': False
        }
        
        hs_response = requests.post(
            f"{API_URL}/api/hubspot/search",
            json=search_data,
            timeout=30
        )
        
        if hs_response.status_code == 200:
            contacts = hs_response.json().get('contacts', [])
            
            if contacts:
                contact = contacts[0]
                hubspot_id = contact.get('id')
                props = contact.get('properties', {})
                hs_nome = props.get('firstname', '')
                hs_cognome = props.get('lastname', '')
                hs_email = props.get('email', '')
                hs_phone = props.get('phone', '')
                
                print(f"   ✅ TROVATO: ID {hubspot_id}")
                print(f"      Nome: {hs_nome} {hs_cognome}")
                print(f"      Email: {hs_email}")
                print(f"      Tel: {hs_phone}")
                
                # Importo il lead
                print(f"   📥 Importo su TeleMedCare...")
                
                import_response = requests.post(
                    f"{API_URL}/api/hubspot/import-single",
                    json={'hubspotId': hubspot_id, 'onlyEcura': False},
                    timeout=30
                )
                
                if import_response.status_code == 200:
                    result = import_response.json()
                    if result.get('success'):
                        lead_id = result.get('leadId', 'N/A')
                        print(f"   ✅ IMPORTATO: {lead_id}")
                        imported.append({
                            'nome': nome_completo,
                            'hubspot_id': hubspot_id,
                            'lead_id': lead_id,
                            'email': hs_email,
                            'phone': hs_phone
                        })
                    else:
                        error_msg = result.get('error', 'Errore')
                        print(f"   ❌ Errore importazione: {error_msg}")
                        errors.append({'nome': nome_completo, 'errore': error_msg})
                else:
                    print(f"   ❌ HTTP {import_response.status_code}")
                    errors.append({'nome': nome_completo, 'errore': f'HTTP {import_response.status_code}'})
            else:
                print(f"   ❌ NON TROVATO su HubSpot")
                errors.append({'nome': nome_completo, 'errore': 'Non trovato'})
        else:
            print(f"   ❌ Errore ricerca: HTTP {hs_response.status_code}")
            errors.append({'nome': nome_completo, 'errore': f'HTTP {hs_response.status_code}'})
    
    except Exception as e:
        print(f"   ❌ ERRORE: {str(e)}")
        errors.append({'nome': nome_completo, 'errore': str(e)})
    
    print()
    time.sleep(1)

# Report finale
print("="*80)
print("📊 REPORT FINALE RECUPERO LEAD OTTAVIA")
print("="*80)
print()
print(f"✅ Lead recuperati: {len(imported)}/8")
if imported:
    for lead in imported:
        print(f"   • {lead['nome']} → {lead['lead_id']}")
        print(f"     HubSpot ID: {lead['hubspot_id']}")
        print(f"     Email: {lead['email']}")
        print(f"     Phone: {lead['phone']}")
        print()

print(f"❌ Errori: {len(errors)}")
if errors:
    for err in errors:
        print(f"   • {err['nome']}: {err['errore']}")

# Salvo report
with open('ottavia_recovery_report.json', 'w') as f:
    json.dump({
        'imported': imported,
        'errors': errors
    }, f, indent=2)

print()
print("✅ Report salvato in ottavia_recovery_report.json")

