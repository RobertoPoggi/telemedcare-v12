#!/usr/bin/env python3
import json
import requests
import time

API_URL = "https://telemedcare-v12.pages.dev"

# 12 lead mancanti
missing_leads = [
    {"name": "Giuseppuina", "email": "apinucciadaluiso@gmail.com", "phone": None, "row": 64},
    {"name": "Sindaco Delvigo", "email": None, "phone": "3803263069", "row": 67},
    {"name": "Concetta", "email": "concettacinardo@gmail.com", "phone": None, "row": 75},
    {"name": "Tonino Ficicchia", "email": "toninoficicchia4@gmail.com", "phone": None, "row": 83},
    {"name": "Antonia Bonavita", "email": None, "phone": "3386484910", "row": 92},
    {"name": "Mariaelena Torrisi", "email": None, "phone": "393402534586", "row": 96},
    {"name": "Imma Grimaldi", "email": None, "phone": "+393928995340", "row": 99},
    {"name": "nessun nome", "email": "kimiamamisegua@live.it", "phone": None, "row": 104},
    {"name": "Vivian Pontarini", "email": "vivianpontarin@gmail.com", "phone": None, "row": 111},
    {"name": "Alina Macii", "email": None, "phone": "3776759169", "row": 113},
    {"name": "Marilena Cardoni", "email": None, "phone": "3382489222", "row": 117},
    {"name": "Mary De Sanctis", "email": None, "phone": "3396748762", "row": 143}
]

def normalize_phone(phone):
    """Normalizza numero di telefono"""
    if not phone:
        return None
    # Rimuovi spazi, trattini, parentesi
    cleaned = ''.join(c for c in phone if c.isdigit() or c == '+')
    # Rimuovi +39 iniziale se presente
    if cleaned.startswith('+39'):
        cleaned = cleaned[3:]
    elif cleaned.startswith('39') and len(cleaned) > 10:
        cleaned = cleaned[2:]
    return cleaned

print("🔍 RICERCA 12 LEAD MANCANTI PER TELEFONO (OTTIMIZZATO)")
print("=" * 60)

# STEP 1: Carica TUTTI i contatti HubSpot UNA SOLA VOLTA
print("\n📥 Caricamento contatti HubSpot...")
all_contacts = []
after = None

while True:
    params = {"limit": 100}
    if after:
        params["after"] = after
    
    response = requests.get(f"{API_URL}/api/hubspot/contacts", params=params)
    if response.status_code != 200:
        break
    
    data = response.json()
    contacts = data.get('contacts', [])
    all_contacts.extend(contacts)
    
    after = data.get('paging', {}).get('next', {}).get('after')
    if not after:
        break
    
    print(f"   Caricati {len(all_contacts)} contatti...")
    time.sleep(0.1)  # Rate limiting

print(f"✅ Totale contatti HubSpot caricati: {len(all_contacts)}")

# STEP 2: Crea indice per telefono
print("\n📇 Creazione indice telefoni...")
phone_index = {}

for contact in all_contacts:
    props = contact.get('properties', {})
    
    # Indicizza phone
    phone = normalize_phone(props.get('phone'))
    if phone and phone not in phone_index:
        phone_index[phone] = contact
    
    # Indicizza mobilephone
    mobile = normalize_phone(props.get('mobilephone'))
    if mobile and mobile not in phone_index:
        phone_index[mobile] = contact

print(f"✅ Indice telefoni creato: {len(phone_index)} numeri univoci")

# STEP 3: Cerca i 12 lead
print("\n🔎 Ricerca lead...")
results = {
    'found': [],
    'not_found': [],
    'no_phone': []
}

for idx, lead in enumerate(missing_leads, 1):
    print(f"\n[{idx}/12] {lead['name']}")
    
    if not lead['phone']:
        print(f"   ⚠️  Nessun telefono disponibile (solo email: {lead.get('email', 'N/A')})")
        results['no_phone'].append(lead)
        continue
    
    print(f"   📞 Cerco telefono: {lead['phone']}")
    
    # Cerca nel phone_index
    normalized = normalize_phone(lead['phone'])
    contact = phone_index.get(normalized)
    
    if contact:
        props = contact.get('properties', {})
        print(f"   ✅ TROVATO su HubSpot!")
        print(f"      ID: {contact.get('id')}")
        print(f"      Nome: {props.get('firstname', '')} {props.get('lastname', '')}")
        print(f"      Email: {props.get('email', '')}")
        print(f"      Phone: {props.get('phone', '')}")
        print(f"      Mobile: {props.get('mobilephone', '')}")
        results['found'].append({
            'excel_data': lead,
            'hubspot_contact': {
                'id': contact.get('id'),
                'firstname': props.get('firstname', ''),
                'lastname': props.get('lastname', ''),
                'email': props.get('email', ''),
                'phone': props.get('phone', ''),
                'mobilephone': props.get('mobilephone', '')
            }
        })
    else:
        print(f"   ❌ Non trovato")
        results['not_found'].append(lead)

print("\n" + "=" * 60)
print("📊 RISULTATI FINALI")
print("=" * 60)
print(f"✅ Trovati su HubSpot (per telefono): {len(results['found'])}")
print(f"❌ Non trovati: {len(results['not_found'])}")
print(f"⚠️  Senza telefono (solo email): {len(results['no_phone'])}")

if results['found']:
    print(f"\n🎯 LEAD TROVATI ({len(results['found'])}):")
    for item in results['found']:
        lead = item['excel_data']
        contact = item['hubspot_contact']
        print(f"   • {lead['name']} (tel: {lead['phone']})")
        print(f"     → HubSpot: {contact['firstname']} {contact['lastname']} (ID: {contact['id']})")

if results['no_phone']:
    print(f"\n⚠️  LEAD SENZA TELEFONO ({len(results['no_phone'])}):")
    for lead in results['no_phone']:
        print(f"   • {lead['name']} - {lead.get('email', 'N/A')}")

if results['not_found']:
    print(f"\n❌ LEAD NON TROVATI ({len(results['not_found'])}):")
    for lead in results['not_found']:
        print(f"   • {lead['name']} - Tel: {lead.get('phone', 'N/A')}")

# Salva report
with open('phone_search_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\n💾 Report salvato in: phone_search_results.json")
