#!/usr/bin/env python3
"""
Ricerca mirata dei 5 lead mancanti con dati corretti da Excel
"""
import requests
import json

API_BASE = 'https://telemedcare-v12.pages.dev'

# Dati CORRETTI dai foglio Excel
MISSING_LEADS = [
    {
        'id': 'LEAD-MANUAL-1770946050424',
        'nome': 'Laura',
        'cognome': 'Bianchi',
        'telefono': '340-9876543',
        'email': None,
        'esito': 'Interessata'
    },
    {
        'id': 'LEAD-MANUAL-1770946051660',
        'nome': 'Paola',
        'cognome': 'Scarpin',
        'telefono': '3403686122',
        'email': None,
        'esito': 'Non risponde'
    },
    {
        'id': 'LEAD-MANUAL-1770946054097',
        'nome': 'Adriana',
        'cognome': 'Mulassano',
        'telefono': '3387205351',
        'email': 'audrey.mulassano@gmail.com',  # HA EMAIL!
        'esito': 'Non interessata'
    },
    {
        'id': 'LEAD-MANUAL-1770946060015',
        'nome': 'Andrea',
        'cognome': 'Dindo',
        'telefono': None,
        'email': 'andreadindo1@gmail.com',
        'esito': 'Inviata'
    },
    {
        'id': 'LEAD-MANUAL-1770946062533',
        'nome': 'Mary',
        'cognome': 'De Sanctis',
        'telefono': '3396748762',
        'email': None,
        'esito': 'Non risponde'
    }
]

def normalize_phone(phone):
    if not phone:
        return ''
    digits = ''.join(c for c in str(phone) if c.isdigit())
    return digits[-10:] if len(digits) >= 10 else digits[-9:]

def search_in_hubspot_contacts(all_contacts, nome, cognome, telefono=None, email=None):
    """Cerca nei contatti già scaricati"""
    matches = []
    
    cognome_norm = cognome.lower().strip()
    nome_norm = nome.lower().strip() if nome else ''
    
    for contact in all_contacts:
        props = contact.get('properties', {})
        hs_nome = (props.get('firstname') or '').lower().strip()
        hs_cognome = (props.get('lastname') or '').lower().strip()
        hs_email = (props.get('email') or '').lower().strip()
        hs_phone = normalize_phone(props.get('phone', ''))
        
        # Match per EMAIL (priorità massima se disponibile)
        if email and '@' in email:
            if email.lower().strip() == hs_email:
                matches.append(contact)
                continue
        
        # Match per cognome + nome
        if cognome_norm in hs_cognome:
            if not nome or nome_norm in hs_nome:
                matches.append(contact)
                continue
        
        # Match per telefono
        if telefono:
            phone_norm = normalize_phone(telefono)
            if len(phone_norm) >= 9 and phone_norm[-9:] in hs_phone:
                matches.append(contact)
                continue
    
    return matches

print(f"\n{'='*110}")
print(f"🔍 RICERCA MIRATA 5 LEAD MANCANTI CON DATI CORRETTI")
print(f"{'='*110}\n")

# Carica i contatti HubSpot già scaricati
print("📥 Caricamento contatti HubSpot...")
with open('hubspot_all_contacts.json', 'w') as f:
    pass  # Placeholder

# Scarica di nuovo tutti i contatti
all_contacts = []
after = None
page = 1

while True:
    url = f'{API_BASE}/api/hubspot/contacts?limit=100'
    if after:
        url += f'&after={after}'
    
    response = requests.get(url, timeout=30)
    if response.status_code == 200:
        data = response.json()
        contacts = data.get('contacts', [])
        all_contacts.extend(contacts)
        
        print(f"   Pagina {page}: {len(contacts)} (totale: {len(all_contacts)})")
        
        paging = data.get('paging', {})
        after = paging.get('next', {}).get('after')
        
        if not after:
            break
        page += 1
    else:
        break

print(f"✅ Totale: {len(all_contacts)} contatti\n")

matched = []
not_found = []

for i, lead in enumerate(MISSING_LEADS, 1):
    nome_completo = f"{lead['nome']} {lead['cognome']}"
    print(f"{i}. {'─'*100}")
    print(f"   📋 {nome_completo}")
    print(f"   ID DB: {lead['id']}")
    print(f"   Email: {lead.get('email', 'N/A')}")
    print(f"   Telefono: {lead.get('telefono', 'N/A')}")
    print(f"   Esito Excel: {lead.get('esito', 'N/A')}")
    
    matches = search_in_hubspot_contacts(
        all_contacts,
        lead['nome'],
        lead['cognome'],
        lead.get('telefono'),
        lead.get('email')
    )
    
    if matches:
        print(f"   ✅ TROVATO! ({len(matches)} match)\n")
        
        for idx, contact in enumerate(matches, 1):
            props = contact.get('properties', {})
            hs_id = contact.get('id')
            hs_name = f"{props.get('firstname', '')} {props.get('lastname', '')}".strip()
            hs_email = props.get('email', 'N/A')
            hs_phone = props.get('phone', 'N/A')
            
            print(f"      Match {idx}:")
            print(f"         HubSpot ID: {hs_id}")
            print(f"         Nome: {hs_name}")
            print(f"         Email: {hs_email}")
            print(f"         Phone: {hs_phone}")
        
        print(f"\n      🔄 Aggiornamento database...")
        best = matches[0]
        hs_id = best.get('id')
        
        try:
            response = requests.put(
                f'{API_BASE}/api/leads/{lead["id"]}',
                json={'external_source_id': hs_id},
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                print(f"      ✅ Lead aggiornato con HS ID: {hs_id}")
                matched.append({
                    'nome': nome_completo,
                    'db_id': lead['id'],
                    'hs_id': hs_id
                })
            else:
                print(f"      ❌ Errore update: {response.status_code}")
        except Exception as e:
            print(f"      ❌ Errore: {str(e)[:50]}")
        
        print()
    else:
        print(f"   ❌ NON TROVATO\n")
        not_found.append({
            'nome': nome_completo,
            'db_id': lead['id']
        })

print(f"{'='*110}")
print(f"📊 RISULTATI:")
print(f"{'='*110}")
print(f"✅ Trovati e aggiornati: {len(matched)}/5")
print(f"❌ Non trovati: {len(not_found)}/5")
print(f"{'='*110}\n")

if matched:
    print(f"✅ LEAD ABBINATI:\n")
    for item in matched:
        print(f"   ✓ {item['nome']:30} | DB: {item['db_id']} | HS: {item['hs_id']}")

if not_found:
    print(f"\n❌ LEAD NON TROVATI:\n")
    for item in not_found:
        print(f"   ✗ {item['nome']:30} | DB: {item['db_id']}")

print(f"\n{'='*110}\n")
