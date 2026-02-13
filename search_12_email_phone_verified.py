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
    cleaned = ''.join(c for c in phone if c.isdigit() or c == '+')
    if cleaned.startswith('+39'):
        cleaned = cleaned[3:]
    elif cleaned.startswith('39') and len(cleaned) > 10:
        cleaned = cleaned[2:]
    return cleaned

def normalize_email(email):
    """Normalizza email"""
    if not email:
        return None
    return email.lower().strip()

print("🔍 RICERCA 12 LEAD PER EMAIL E TELEFONO (VERIFICATA CON PAGINAZIONE)")
print("=" * 75)

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
        
        paging = data.get('paging', {})
        next_page = paging.get('next', {})
        after = next_page.get('after')
        
        if not after:
            print(f"   🏁 Nessuna pagina successiva, fine paginazione.")
            break
        
        time.sleep(0.15)
        
    except Exception as e:
        print(f"   ❌ Errore: {str(e)}")
        break

print(f"\n✅ PAGINAZIONE COMPLETATA:")
print(f"   • Totale pagine: {page_count}")
print(f"   • Totale contatti caricati: {len(all_contacts)}")

# STEP 2: Crea indici per email e telefono
print("\n📇 Creazione indici email e telefono...")
email_index = {}
phone_index = {}
contacts_without_email = 0
contacts_without_phone = 0

for contact in all_contacts:
    props = contact.get('properties', {})
    
    # Indicizza email
    email = normalize_email(props.get('email'))
    if email:
        if email not in email_index:
            email_index[email] = []
        email_index[email].append(contact)
    else:
        contacts_without_email += 1
    
    # Indicizza phone
    phone = normalize_phone(props.get('phone'))
    if phone:
        if phone not in phone_index:
            phone_index[phone] = []
        phone_index[phone].append(contact)
    
    # Indicizza mobilephone
    mobile = normalize_phone(props.get('mobilephone'))
    if mobile:
        if mobile not in phone_index:
            phone_index[mobile] = []
        phone_index[mobile].append(contact)
    
    if not phone and not mobile:
        contacts_without_phone += 1

print(f"✅ Indici creati:")
print(f"   • Email univoche: {len(email_index)}")
print(f"   • Telefoni univoci: {len(phone_index)}")
print(f"   • Contatti senza email: {contacts_without_email}")
print(f"   • Contatti senza telefono: {contacts_without_phone}")

# STEP 3: Cerca i 12 lead per EMAIL e TELEFONO
print("\n🔎 Ricerca lead per EMAIL e TELEFONO...")
results = {
    'found_by_email': [],
    'found_by_phone': [],
    'not_found': []
}

for idx, lead in enumerate(missing_leads, 1):
    print(f"\n[{idx}/12] {lead['name']}")
    
    found = False
    
    # Cerca per EMAIL
    if lead['email']:
        normalized_email = normalize_email(lead['email'])
        matches = email_index.get(normalized_email, [])
        
        if matches:
            print(f"   ✅ TROVATO per EMAIL: {lead['email']}")
            print(f"      Trovati {len(matches)} contatti:")
            for i, contact in enumerate(matches, 1):
                props = contact.get('properties', {})
                print(f"      [{i}] ID: {contact.get('id')}")
                print(f"          Nome: {props.get('firstname', '')} {props.get('lastname', '')}")
                print(f"          Email: {props.get('email', '')}")
                print(f"          Phone: {props.get('phone', '')}")
                print(f"          Mobile: {props.get('mobilephone', '')}")
            
            results['found_by_email'].append({
                'excel_data': lead,
                'hubspot_matches': [
                    {
                        'id': c.get('id'),
                        'firstname': c.get('properties', {}).get('firstname', ''),
                        'lastname': c.get('properties', {}).get('lastname', ''),
                        'email': c.get('properties', {}).get('email', ''),
                        'phone': c.get('properties', {}).get('phone', ''),
                        'mobilephone': c.get('properties', {}).get('mobilephone', '')
                    } for c in matches
                ],
                'duplicates': len(matches) > 1
            })
            found = True
    
    # Cerca per TELEFONO
    if lead['phone'] and not found:
        normalized_phone = normalize_phone(lead['phone'])
        matches = phone_index.get(normalized_phone, [])
        
        if matches:
            print(f"   ✅ TROVATO per TELEFONO: {lead['phone']}")
            print(f"      Trovati {len(matches)} contatti:")
            for i, contact in enumerate(matches, 1):
                props = contact.get('properties', {})
                print(f"      [{i}] ID: {contact.get('id')}")
                print(f"          Nome: {props.get('firstname', '')} {props.get('lastname', '')}")
                print(f"          Email: {props.get('email', '')}")
                print(f"          Phone: {props.get('phone', '')}")
                print(f"          Mobile: {props.get('mobilephone', '')}")
            
            results['found_by_phone'].append({
                'excel_data': lead,
                'hubspot_matches': [
                    {
                        'id': c.get('id'),
                        'firstname': c.get('properties', {}).get('firstname', ''),
                        'lastname': c.get('properties', {}).get('lastname', ''),
                        'email': c.get('properties', {}).get('email', ''),
                        'phone': c.get('properties', {}).get('phone', ''),
                        'mobilephone': c.get('properties', {}).get('mobilephone', '')
                    } for c in matches
                ],
                'duplicates': len(matches) > 1
            })
            found = True
    
    if not found:
        search_info = []
        if lead['email']:
            search_info.append(f"Email: {lead['email']}")
        if lead['phone']:
            search_info.append(f"Tel: {lead['phone']}")
        print(f"   ❌ NON trovato su HubSpot ({', '.join(search_info)})")
        results['not_found'].append(lead)

print("\n" + "=" * 75)
print("📊 RISULTATI FINALI VERIFICATI")
print("=" * 75)
print(f"✅ Trovati per EMAIL: {len(results['found_by_email'])}")
print(f"✅ Trovati per TELEFONO: {len(results['found_by_phone'])}")
print(f"❌ Non trovati: {len(results['not_found'])}")
print(f"📊 Totale trovati: {len(results['found_by_email']) + len(results['found_by_phone'])}/12")

# Conta duplicati
duplicates_email = sum(1 for r in results['found_by_email'] if r['duplicates'])
duplicates_phone = sum(1 for r in results['found_by_phone'] if r['duplicates'])
print(f"🔄 Lead con DUPLICATI: {duplicates_email + duplicates_phone}")

if results['found_by_email']:
    print(f"\n✅ TROVATI PER EMAIL ({len(results['found_by_email'])}):")
    for item in results['found_by_email']:
        lead = item['excel_data']
        matches = item['hubspot_matches']
        dup_flag = " 🔄 DUPLICATI!" if item['duplicates'] else ""
        print(f"\n   • {lead['name']} - {lead['email']}{dup_flag}")
        for i, m in enumerate(matches, 1):
            print(f"     [{i}] {m['firstname']} {m['lastname']} (ID: {m['id']}) - {m['email']} - {m['phone']}")

if results['found_by_phone']:
    print(f"\n✅ TROVATI PER TELEFONO ({len(results['found_by_phone'])}):")
    for item in results['found_by_phone']:
        lead = item['excel_data']
        matches = item['hubspot_matches']
        dup_flag = " 🔄 DUPLICATI!" if item['duplicates'] else ""
        print(f"\n   • {lead['name']} - {lead['phone']}{dup_flag}")
        for i, m in enumerate(matches, 1):
            print(f"     [{i}] {m['firstname']} {m['lastname']} (ID: {m['id']}) - {m['email']} - {m['phone']}")

if results['not_found']:
    print(f"\n❌ NON TROVATI SU HUBSPOT ({len(results['not_found'])}):")
    for lead in results['not_found']:
        info = []
        if lead.get('email'):
            info.append(f"Email: {lead['email']}")
        if lead.get('phone'):
            info.append(f"Tel: {lead['phone']}")
        print(f"   • {lead['name']} - {' | '.join(info)}")

# Salva report
with open('email_phone_search_verified.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\n💾 Report verificato salvato in: email_phone_search_verified.json")
print(f"\n📌 RIEPILOGO PAGINAZIONE:")
print(f"   • Pagine caricate: {page_count}")
print(f"   • Contatti totali: {len(all_contacts)}")
print(f"   • Email indicizzate: {len(email_index)}")
print(f"   • Telefoni indicizzati: {len(phone_index)}")
