#!/usr/bin/env python3
import json
import requests
import time

API_URL = "https://telemedcare-v12.pages.dev"

# 12 lead mancanti con cognomi estratti
missing_leads = [
    {"name": "Giuseppuina", "lastname": "Giuseppuina", "email": "apinucciadaluiso@gmail.com", "phone": None, "row": 64},
    {"name": "Sindaco Delvigo", "lastname": "Delvigo", "email": None, "phone": "3803263069", "row": 67},
    {"name": "Concetta", "lastname": "Concetta", "email": "concettacinardo@gmail.com", "phone": None, "row": 75},
    {"name": "Tonino Ficicchia", "lastname": "Ficicchia", "email": "toninoficicchia4@gmail.com", "phone": None, "row": 83},
    {"name": "Antonia Bonavita", "lastname": "Bonavita", "email": None, "phone": "3386484910", "row": 92},
    {"name": "Mariaelena Torrisi", "lastname": "Torrisi", "email": None, "phone": "393402534586", "row": 96},
    {"name": "Imma Grimaldi", "lastname": "Grimaldi", "email": None, "phone": "+393928995340", "row": 99},
    {"name": "nessun nome", "lastname": "", "email": "kimiamamisegua@live.it", "phone": None, "row": 104},
    {"name": "Vivian Pontarini", "lastname": "Pontarini", "email": "vivianpontarin@gmail.com", "phone": None, "row": 111},
    {"name": "Alina Macii", "lastname": "Macii", "email": None, "phone": "3776759169", "row": 113},
    {"name": "Marilena Cardoni", "lastname": "Cardoni", "email": None, "phone": "3382489222", "row": 117},
    {"name": "Mary De Sanctis", "lastname": "De Sanctis", "email": None, "phone": "3396748762", "row": 143}
]

def normalize_string(s):
    """Normalizza stringa per confronto"""
    if not s:
        return ""
    return s.lower().strip()

print("🔍 RICERCA 12 LEAD PER COGNOME (VERIFICATA CON PAGINAZIONE)")
print("=" * 70)

# STEP 1: Carica TUTTI i contatti HubSpot CON VERIFICA PAGINAZIONE
print("\n📥 Caricamento contatti HubSpot CON PAGINAZIONE...")
all_contacts = []
after = None
page_count = 0

while True:
    page_count += 1
    params = {"limit": 100}
    if after:
        params["after"] = after
    
    print(f"   📄 Pagina {page_count}: richiesta con after={after}...")
    
    try:
        response = requests.get(f"{API_URL}/api/hubspot/contacts", params=params, timeout=30)
        if response.status_code != 200:
            print(f"   ❌ Errore HTTP {response.status_code}")
            break
        
        data = response.json()
        contacts = data.get('contacts', [])
        
        if not contacts:
            print(f"   ⚠️  Nessun contatto in questa pagina, fine.")
            break
        
        all_contacts.extend(contacts)
        print(f"   ✅ Caricati {len(contacts)} contatti (totale: {len(all_contacts)})")
        
        # Verifica se c'è una pagina successiva
        paging = data.get('paging', {})
        next_page = paging.get('next', {})
        after = next_page.get('after')
        
        if not after:
            print(f"   🏁 Nessuna pagina successiva, fine paginazione.")
            break
        
        time.sleep(0.15)  # Rate limiting
        
    except Exception as e:
        print(f"   ❌ Errore: {str(e)}")
        break

print(f"\n✅ PAGINAZIONE COMPLETATA:")
print(f"   • Totale pagine: {page_count}")
print(f"   • Totale contatti caricati: {len(all_contacts)}")

# STEP 2: Crea indice per cognome
print("\n📇 Creazione indice cognomi...")
lastname_index = {}
contacts_without_lastname = 0

for contact in all_contacts:
    props = contact.get('properties', {})
    lastname = normalize_string(props.get('lastname', ''))
    
    if lastname:
        if lastname not in lastname_index:
            lastname_index[lastname] = []
        lastname_index[lastname].append({
            'id': contact.get('id'),
            'firstname': props.get('firstname', ''),
            'lastname': props.get('lastname', ''),
            'email': props.get('email', ''),
            'phone': props.get('phone', ''),
            'mobilephone': props.get('mobilephone', '')
        })
    else:
        contacts_without_lastname += 1

print(f"✅ Indice cognomi creato:")
print(f"   • Cognomi univoci: {len(lastname_index)}")
print(f"   • Contatti senza cognome: {contacts_without_lastname}")

# STEP 3: Cerca i 12 lead per cognome
print("\n🔎 Ricerca lead per cognome...")
results = {
    'found': [],
    'not_found': [],
    'no_lastname': []
}

for idx, lead in enumerate(missing_leads, 1):
    print(f"\n[{idx}/12] {lead['name']}")
    
    if not lead['lastname']:
        print(f"   ⚠️  Nessun cognome disponibile")
        results['no_lastname'].append(lead)
        continue
    
    print(f"   🔍 Cerco cognome: '{lead['lastname']}'")
    
    # Cerca nel lastname_index
    normalized_lastname = normalize_string(lead['lastname'])
    matches = lastname_index.get(normalized_lastname, [])
    
    if matches:
        print(f"   ✅ TROVATI {len(matches)} contatti con cognome '{lead['lastname']}' su HubSpot:")
        
        for i, contact in enumerate(matches, 1):
            print(f"      [{i}] ID: {contact['id']}")
            print(f"          Nome: {contact['firstname']} {contact['lastname']}")
            print(f"          Email: {contact['email']}")
            print(f"          Phone: {contact['phone']}")
            print(f"          Mobile: {contact['mobilephone']}")
            if i < len(matches):
                print()
        
        results['found'].append({
            'excel_data': lead,
            'hubspot_matches': matches,
            'duplicates': len(matches) > 1
        })
    else:
        print(f"   ❌ NON trovato su HubSpot")
        results['not_found'].append(lead)

print("\n" + "=" * 70)
print("📊 RISULTATI FINALI VERIFICATI")
print("=" * 70)
print(f"✅ Trovati su HubSpot (per cognome): {len(results['found'])}")
print(f"❌ Non trovati: {len(results['not_found'])}")
print(f"⚠️  Senza cognome: {len(results['no_lastname'])}")

# Conta duplicati
duplicates_count = sum(1 for r in results['found'] if r['duplicates'])
print(f"🔄 Lead con DUPLICATI su HubSpot: {duplicates_count}")

if results['found']:
    print(f"\n🎯 LEAD TROVATI ({len(results['found'])}):")
    for item in results['found']:
        lead = item['excel_data']
        matches = item['hubspot_matches']
        duplicate_flag = " 🔄 DUPLICATI!" if item['duplicates'] else ""
        print(f"\n   • {lead['name']} (cognome: {lead['lastname']}){duplicate_flag}")
        print(f"     Trovati {len(matches)} contatti su HubSpot:")
        for i, contact in enumerate(matches, 1):
            print(f"       [{i}] {contact['firstname']} {contact['lastname']} - {contact['email']} - {contact['phone']}")

if results['not_found']:
    print(f"\n❌ LEAD NON TROVATI SU HUBSPOT ({len(results['not_found'])}):")
    for lead in results['not_found']:
        print(f"   • {lead['name']} (cognome: {lead['lastname']}) - Email: {lead.get('email', 'N/A')} - Tel: {lead.get('phone', 'N/A')}")

if results['no_lastname']:
    print(f"\n⚠️  LEAD SENZA COGNOME ({len(results['no_lastname'])}):")
    for lead in results['no_lastname']:
        print(f"   • {lead['name']} - Email: {lead.get('email', 'N/A')}")

# Salva report
with open('lastname_search_verified.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\n💾 Report verificato salvato in: lastname_search_verified.json")
print(f"\n📌 RIEPILOGO PAGINAZIONE:")
print(f"   • Pagine caricate: {page_count}")
print(f"   • Contatti totali: {len(all_contacts)}")
print(f"   • Cognomi indicizzati: {len(lastname_index)}")
