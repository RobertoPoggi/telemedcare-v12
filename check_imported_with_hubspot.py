#!/usr/bin/env python3
"""
Controlla i 12 lead importati con HubSpot (senza filtro eCura)
"""
import requests
import os

# I 12 lead importati
IMPORTED_LEADS = [
    {'id': 'LEAD-MANUAL-1770946050424', 'nome': 'Laura Bianchi', 'email': 'laurabianchi@placeholder.com', 'telefono': '+393409876543'},
    {'id': 'LEAD-MANUAL-1770946051660', 'nome': 'Paola Scarpin', 'email': 'paolascarpin@placeholder.com', 'telefono': '+393403686122'},
    {'id': 'LEAD-MANUAL-1770946054097', 'nome': 'Adriana Mulassano', 'email': 'adrianamulassano@placeholder.com', 'telefono': '+393387205351'},
    {'id': 'LEAD-MANUAL-1770946055276', 'nome': 'Maria Chiara Baldassini', 'email': 'mariachiara@placeholder.com', 'telefono': '+393922352447'},
    {'id': 'LEAD-MANUAL-1770946057712', 'nome': 'Andrea Mercuri', 'email': 'andreamercuri@placeholder.com', 'telefono': '+39366156266'},
    {'id': 'LEAD-MANUAL-1770946058870', 'nome': 'Enzo Pedron', 'email': 'enzopedron@placeholder.com', 'telefono': '+393484717119'},
    {'id': 'LEAD-MANUAL-1770946060015', 'nome': 'Andrea Dindo', 'email': 'andreadindo1@gmail.com', 'telefono': ''},
    {'id': 'LEAD-MANUAL-1770946061218', 'nome': 'Francesco Egiziano', 'email': 'francescoegiziano@placeholder.com', 'telefono': '+393382933088'},
    {'id': 'LEAD-MANUAL-1770946062533', 'nome': 'Mary De Sanctis', 'email': 'marydesanctis@placeholder.com', 'telefono': '+393396748762'},
    {'id': 'LEAD-MANUAL-1770946063740', 'nome': 'Giovanna Giordano', 'email': 'giovannagiordano@placeholder.com', 'telefono': '+393381084344'},
    {'id': 'LEAD-MANUAL-1770946064859', 'nome': 'Marco Olivieri', 'email': 'marcoolivieri@placeholder.com', 'telefono': '+39348828024'},
    {'id': 'LEAD-MANUAL-1770946067171', 'nome': 'Alberto Avanzi', 'email': 'albertoavanzi@placeholder.com', 'telefono': '+393295954873'}
]

HUBSPOT_TOKEN = os.getenv('HUBSPOT_TOKEN', '')

def normalize_phone(phone):
    """Normalizza telefono"""
    if not phone:
        return ''
    s = str(phone).strip()
    s = s.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
    s = s.replace('+39', '').replace('0039', '').replace('+', '')
    digits = ''.join(c for c in s if c.isdigit())
    if len(digits) >= 9:
        return digits[-10:]
    return digits

def search_hubspot_by_email(email):
    """Cerca in HubSpot per email"""
    if not email or '@placeholder.com' in email:
        return None
    
    try:
        url = f'https://api.hubapi.com/crm/v3/objects/contacts/search'
        headers = {
            'Authorization': f'Bearer {HUBSPOT_TOKEN}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'filterGroups': [{
                'filters': [{
                    'propertyName': 'email',
                    'operator': 'EQ',
                    'value': email
                }]
            }],
            'properties': ['firstname', 'lastname', 'email', 'phone', 'hs_object_id']
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=10)
        if response.status_code == 200:
            results = response.json().get('results', [])
            if results:
                return results[0]
    except Exception as e:
        print(f'      ⚠️  Errore ricerca email: {str(e)[:50]}')
    
    return None

def search_hubspot_by_phone(phone):
    """Cerca in HubSpot per telefono"""
    if not phone:
        return None
    
    phone_normalized = normalize_phone(phone)
    if not phone_normalized:
        return None
    
    try:
        url = f'https://api.hubapi.com/crm/v3/objects/contacts/search'
        headers = {
            'Authorization': f'Bearer {HUBSPOT_TOKEN}',
            'Content-Type': 'application/json'
        }
        
        # Prova vari formati
        phone_formats = [
            phone_normalized,
            '+39' + phone_normalized,
            '0039' + phone_normalized,
            phone_normalized.lstrip('39')
        ]
        
        for phone_fmt in phone_formats:
            data = {
                'filterGroups': [{
                    'filters': [{
                        'propertyName': 'phone',
                        'operator': 'CONTAINS_TOKEN',
                        'value': phone_fmt
                    }]
                }],
                'properties': ['firstname', 'lastname', 'email', 'phone', 'hs_object_id']
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=10)
            if response.status_code == 200:
                results = response.json().get('results', [])
                if results:
                    return results[0]
    except Exception as e:
        print(f'      ⚠️  Errore ricerca telefono: {str(e)[:50]}')
    
    return None

print(f"\n{'='*100}")
print(f"🔍 CONTROLLO 12 LEAD IMPORTATI CON HUBSPOT (SENZA FILTRO eCura)")
print(f"{'='*100}\n")

matched = []
not_found = []

for i, lead in enumerate(IMPORTED_LEADS, 1):
    print(f"{i:2}. {'─'*90}")
    print(f"   📋 {lead['nome']}")
    print(f"   ID DB: {lead['id']}")
    print(f"   Email: {lead['email']}")
    print(f"   Telefono: {lead['telefono']}")
    print()
    
    # Cerca per email
    hubspot_contact = None
    if lead['email'] and '@placeholder.com' not in lead['email']:
        print(f"   🔍 Ricerca HubSpot per email...")
        hubspot_contact = search_hubspot_by_email(lead['email'])
    
    # Se non trovato per email, cerca per telefono
    if not hubspot_contact and lead['telefono']:
        print(f"   🔍 Ricerca HubSpot per telefono...")
        hubspot_contact = search_hubspot_by_phone(lead['telefono'])
    
    if hubspot_contact:
        hs_id = hubspot_contact.get('id')
        hs_name = f"{hubspot_contact['properties'].get('firstname', '')} {hubspot_contact['properties'].get('lastname', '')}".strip()
        hs_email = hubspot_contact['properties'].get('email', 'N/A')
        hs_phone = hubspot_contact['properties'].get('phone', 'N/A')
        
        print(f"   ✅ TROVATO IN HUBSPOT!")
        print(f"      HubSpot ID: {hs_id}")
        print(f"      Nome HS: {hs_name}")
        print(f"      Email HS: {hs_email}")
        print(f"      Telefono HS: {hs_phone}")
        
        matched.append({
            'lead_id': lead['id'],
            'nome': lead['nome'],
            'hubspot_id': hs_id,
            'hubspot_name': hs_name
        })
    else:
        print(f"   ❌ NON TROVATO in HubSpot")
        not_found.append({
            'lead_id': lead['id'],
            'nome': lead['nome']
        })
    
    print()

# Report finale
print(f"{'='*100}")
print(f"📊 RISULTATI:")
print(f"{'='*100}")
print(f"✅ Trovati in HubSpot: {len(matched)}")
print(f"❌ Non trovati: {len(not_found)}")
print(f"📊 Totale: {len(IMPORTED_LEADS)}")
print(f"{'='*100}\n")

if matched:
    print(f"✅ LEAD ABBINATI A HUBSPOT:\n")
    for item in matched:
        print(f"   ✓ {item['nome']:30} | DB: {item['lead_id'][:30]:30} | HS: {item['hubspot_id']}")

if not_found:
    print(f"\n❌ LEAD NON TROVATI IN HUBSPOT:\n")
    for item in not_found:
        print(f"   ✗ {item['nome']:30} | DB: {item['lead_id']}")

print(f"\n{'='*100}\n")
