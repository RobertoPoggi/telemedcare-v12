#!/usr/bin/env python3
import json
import requests

API_URL = "https://telemedcare-v12.pages.dev"

# Carico il lead trovato
with open('13_leads_email_phone_search.json', 'r') as f:
    data = json.load(f)
    found = data['found']

if not found:
    print("❌ Nessun lead da importare")
    exit(0)

lead = found[0]

print("🔄 IMPORTAZIONE DOLORES LOMBARDI DA HUBSPOT")
print("="*80)
print()
print(f"Nome Tracker: {lead['nome_tracker']}")
print(f"Nome HubSpot: {lead['hubspot_name']}")
print(f"HubSpot ID: {lead['hubspot_id']}")
print(f"Email: {lead['hubspot_email']}")
print(f"Telefono: {lead['hubspot_phone']}")
print()

# Recupero i dati completi del contatto
print("📊 Recupero dati completi da HubSpot...")
all_contacts = []
after = None

while True:
    url = f"{API_URL}/api/hubspot/contacts?limit=100"
    if after:
        url += f"&after={after}"
    
    response = requests.get(url, timeout=60)
    if response.status_code != 200:
        break
    
    data_hs = response.json()
    all_contacts.extend(data_hs.get('contacts', []))
    
    if data_hs.get('paging', {}).get('next'):
        after = data_hs['paging']['next'].get('after')
    else:
        break

contacts_by_id = {c['id']: c for c in all_contacts}

if lead['hubspot_id'] not in contacts_by_id:
    print("❌ Contatto non trovato in HubSpot")
    exit(1)

contact = contacts_by_id[lead['hubspot_id']]
props = contact['properties']

print("✅ Contatto recuperato")
print()

# Creo il lead su TeleMedCare
print("📥 Importo su TeleMedCare...")

lead_data = {
    'nomeRichiedente': props.get('firstname', ''),
    'cognomeRichiedente': props.get('lastname', ''),
    'email': props.get('email', ''),
    'telefono': props.get('phone', ''),
    'fonte': props.get('hs_object_source_detail_1', 'HubSpot Import'),
    'tipoServizio': 'eCura',
    'external_source_id': lead['hubspot_id'],
    'cm': 'OB',
    'note': f"Importato da Tracker Ottavia - HubSpot ID: {lead['hubspot_id']}"
}

create_response = requests.post(
    f"{API_URL}/api/leads",
    json=lead_data,
    timeout=30
)

if create_response.status_code in [200, 201]:
    result = create_response.json()
    lead_id = result.get('id', 'N/A')
    print(f"✅ IMPORTATO: {lead_id}")
    print()
    print("📊 Dettagli:")
    print(f"   Lead ID: {lead_id}")
    print(f"   Nome: {props.get('firstname', '')} {props.get('lastname', '')}")
    print(f"   Email: {props.get('email', '')}")
    print(f"   Telefono: {props.get('phone', '')}")
    print(f"   HubSpot ID: {lead['hubspot_id']}")
    print(f"   CM: OB")
else:
    print(f"❌ Errore: HTTP {create_response.status_code}")
    print(create_response.text[:300])

