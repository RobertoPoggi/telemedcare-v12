#!/usr/bin/env python3
import json
import requests
import time

API_URL = "https://telemedcare-v12.pages.dev"

# Carico i 13 lead veramente mancanti
with open('truly_missing_leads.json', 'r') as f:
    data = json.load(f)
    truly_missing = data['truly_missing']

print("🔍 RICERCA 13 LEAD SU HUBSPOT PER EMAIL/TELEFONO")
print("="*80)
print()

# Recupero tutti i contatti HubSpot con paginazione
print("📊 Recupero tutti i contatti HubSpot...")
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
    
    paging = data_hs.get('paging', {})
    if not paging.get('next'):
        break
    after = paging['next'].get('after')
    time.sleep(0.3)

print(f"✅ Recuperati {len(all_contacts)} contatti")
print()

# Creo indici per email e telefono
contacts_by_email = {}
contacts_by_phone = {}

for contact in all_contacts:
    props = contact.get('properties', {})
    
    # Email
    email = (props.get('email') or '').strip().lower()
    if email:
        contacts_by_email[email] = contact
    
    # Phone
    phone = (props.get('phone') or '').strip()
    if phone:
        # Normalizzo il telefono
        phone_clean = phone.replace(' ', '').replace('-', '').replace('+39', '').replace('+', '').replace('.', '')
        if phone_clean:
            contacts_by_phone[phone_clean] = contact

print(f"📊 Indice: {len(contacts_by_email)} email, {len(contacts_by_phone)} telefoni")
print()

# Cerco i 13 lead
found = []
not_found = []

for idx, lead in enumerate(truly_missing, 1):
    nome = lead['nome']
    contatto = lead['contatto']
    
    print(f"[{idx}/13] {nome}...", end=" ", flush=True)
    
    hubspot_contact = None
    match_type = None
    
    # Verifica per email
    if '@' in contatto:
        email_clean = contatto.strip().lower()
        if email_clean in contacts_by_email:
            hubspot_contact = contacts_by_email[email_clean]
            match_type = 'email'
    else:
        # Verifica per telefono
        phone_clean = contatto.replace(' ', '').replace('-', '').replace('+39', '').replace('+', '').replace('.', '')
        if phone_clean and phone_clean in contacts_by_phone:
            hubspot_contact = contacts_by_phone[phone_clean]
            match_type = 'telefono'
    
    if hubspot_contact:
        props = hubspot_contact.get('properties', {})
        hs_name = f"{props.get('firstname', '')} {props.get('lastname', '')}".strip()
        hs_id = hubspot_contact.get('id')
        
        print(f"✅ TROVATO su HubSpot!")
        print(f"   HubSpot ID: {hs_id}")
        print(f"   Nome: {hs_name}")
        print(f"   Email: {props.get('email', 'N/A')}")
        print(f"   Telefono: {props.get('phone', 'N/A')}")
        print(f"   Match: {match_type}")
        
        found.append({
            'nome_tracker': nome,
            'contatto': contatto,
            'hubspot_id': hs_id,
            'hubspot_name': hs_name,
            'hubspot_email': props.get('email', ''),
            'hubspot_phone': props.get('phone', ''),
            'match_type': match_type,
            'row': lead['row']
        })
    else:
        print(f"❌ Non trovato")
        not_found.append(lead)
    
    print()

# Report finale
print()
print("="*80)
print("📊 REPORT FINALE RICERCA EMAIL/TELEFONO")
print("="*80)
print()
print(f"✅ Trovati su HubSpot: {len(found)}/13")
if found:
    for lead in found:
        print(f"   • {lead['nome_tracker']} → HubSpot ID: {lead['hubspot_id']}")
        print(f"     Nome HubSpot: {lead['hubspot_name']}")
        print(f"     Match: {lead['match_type']} = {lead['contatto']}")
        print()

print(f"❌ Non trovati: {len(not_found)}/13")
if not_found:
    for lead in not_found:
        print(f"   • {lead['nome']} - {lead['contatto']}")

# Salvo
with open('13_leads_email_phone_search.json', 'w') as f:
    json.dump({
        'found': found,
        'not_found': not_found
    }, f, indent=2)

print()
print("✅ Report salvato in 13_leads_email_phone_search.json")
print()

# Se ho trovato lead, propongo l'import
if found:
    print("="*80)
    print(f"🎯 TROVATI {len(found)} LEAD SU HUBSPOT!")
    print("="*80)
    print()
    print("Vuoi importarli su TeleMedCare? (lo script è pronto)")

