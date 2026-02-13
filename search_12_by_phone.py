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

def search_by_phone(phone):
    """Cerca contatto su HubSpot per telefono"""
    try:
        # Normalizza il telefono
        normalized = normalize_phone(phone)
        if not normalized:
            return None
            
        response = requests.get(f"{API_URL}/api/hubspot/contacts", params={"limit": 100})
        if response.status_code != 200:
            return None
            
        data = response.json()
        contacts = data.get('contacts', [])
        
        # Cerca tra tutti i contatti (con paginazione)
        after = data.get('paging', {}).get('next', {}).get('after')
        all_contacts = contacts.copy()
        
        while after:
            time.sleep(0.2)  # Rate limiting
            response = requests.get(f"{API_URL}/api/hubspot/contacts", params={"limit": 100, "after": after})
            if response.status_code != 200:
                break
            data = response.json()
            all_contacts.extend(data.get('contacts', []))
            after = data.get('paging', {}).get('next', {}).get('after')
        
        # Cerca match per telefono
        for contact in all_contacts:
            props = contact.get('properties', {})
            hs_phone = normalize_phone(props.get('phone'))
            hs_mobile = normalize_phone(props.get('mobilephone'))
            
            if normalized == hs_phone or normalized == hs_mobile:
                return {
                    'id': contact.get('id'),
                    'firstname': props.get('firstname', ''),
                    'lastname': props.get('lastname', ''),
                    'email': props.get('email', ''),
                    'phone': props.get('phone', ''),
                    'mobilephone': props.get('mobilephone', '')
                }
        
        return None
        
    except Exception as e:
        print(f"❌ Errore ricerca telefono {phone}: {str(e)}")
        return None

print("🔍 RICERCA 12 LEAD MANCANTI PER TELEFONO")
print("=" * 60)

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
    
    contact = search_by_phone(lead['phone'])
    
    if contact:
        print(f"   ✅ TROVATO su HubSpot!")
        print(f"      ID: {contact['id']}")
        print(f"      Nome: {contact['firstname']} {contact['lastname']}")
        print(f"      Email: {contact['email']}")
        print(f"      Phone: {contact['phone']}")
        print(f"      Mobile: {contact['mobilephone']}")
        results['found'].append({
            'excel_data': lead,
            'hubspot_contact': contact
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

# Salva report
with open('phone_search_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\n💾 Report salvato in: phone_search_results.json")
