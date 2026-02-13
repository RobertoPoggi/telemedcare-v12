#!/usr/bin/env python3
import json
import requests

API_URL = "https://telemedcare-v12.pages.dev"

# I 12 lead da verificare
leads_to_check = [
    {"name": "Giuseppuina", "email": "apinucciadaluiso@gmail.com", "phone": None},
    {"name": "Sindaco Delvigo", "email": None, "phone": "3803263069"},
    {"name": "Concetta", "email": "concettacinardo@gmail.com", "phone": None},
    {"name": "Tonino Ficicchia", "email": "toninoficicchia4@gmail.com", "phone": None},
    {"name": "Antonia Bonavita", "email": None, "phone": "3386484910"},
    {"name": "Mariaelena Torrisi", "email": None, "phone": "393402534586"},
    {"name": "Imma Grimaldi", "email": None, "phone": "+393928995340"},
    {"name": "nessun nome", "email": "kimiamamisegua@live.it", "phone": None},
    {"name": "Vivian Pontarini", "email": "vivianpontarin@gmail.com", "phone": None},
    {"name": "Alina Macii", "email": None, "phone": "3776759169"},
    {"name": "Marilena Cardoni", "email": None, "phone": "3382489222"},
    {"name": "Mary De Sanctis", "email": None, "phone": "3396748762"}
]

def normalize_phone(phone):
    if not phone:
        return None
    cleaned = ''.join(c for c in phone if c.isdigit())
    if cleaned.startswith('39') and len(cleaned) > 10:
        cleaned = cleaned[2:]
    return cleaned

def normalize_email(email):
    if not email:
        return None
    return email.lower().strip()

def normalize_name(name):
    if not name:
        return None
    return name.lower().strip()

print("🔍 VERIFICA SE I 12 LEAD SONO GIÀ PRESENTI SU TELEMEDCARE")
print("=" * 70)

# Carica TUTTI i lead da TeleMedCare
print("\n📥 Caricamento lead da TeleMedCare...")
all_leads = []
after = None

while True:
    params = {"limit": 100}
    if after:
        params["after"] = after
    
    response = requests.get(f"{API_URL}/api/leads", params=params)
    if response.status_code != 200:
        break
    
    data = response.json()
    leads = data.get('leads', [])
    all_leads.extend(leads)
    
    if len(leads) < 100:
        break
    after = str(len(all_leads))

print(f"✅ Totale lead TeleMedCare caricati: {len(all_leads)}")

# Crea indici
print("\n📇 Creazione indici...")
email_index = {}
phone_index = {}
name_index = {}

for lead in all_leads:
    # Indicizza email
    email = normalize_email(lead.get('email'))
    if email:
        if email not in email_index:
            email_index[email] = []
        email_index[email].append(lead)
    
    # Indicizza telefono
    phone = normalize_phone(lead.get('phone'))
    if phone:
        if phone not in phone_index:
            phone_index[phone] = []
        phone_index[phone].append(lead)
    
    # Indicizza nome completo
    full_name = f"{lead.get('firstName', '')} {lead.get('lastName', '')}".strip()
    name_normalized = normalize_name(full_name)
    if name_normalized:
        if name_normalized not in name_index:
            name_index[name_normalized] = []
        name_index[name_normalized].append(lead)
    
    # Indicizza anche solo cognome
    lastname = normalize_name(lead.get('lastName', ''))
    if lastname:
        if lastname not in name_index:
            name_index[lastname] = []
        name_index[lastname].append(lead)

print(f"✅ Indici creati:")
print(f"   • Email univoche: {len(email_index)}")
print(f"   • Telefoni univoci: {len(phone_index)}")
print(f"   • Nomi univoci: {len(name_index)}")

# Verifica i 12 lead
print("\n🔎 Verifica presenza dei 12 lead...")
results = {
    'found': [],
    'not_found': []
}

for idx, check_lead in enumerate(leads_to_check, 1):
    print(f"\n[{idx}/12] {check_lead['name']}")
    
    found_leads = []
    
    # Cerca per email
    if check_lead['email']:
        normalized_email = normalize_email(check_lead['email'])
        matches = email_index.get(normalized_email, [])
        if matches:
            print(f"   ✅ TROVATO per EMAIL: {check_lead['email']}")
            found_leads.extend(matches)
    
    # Cerca per telefono
    if check_lead['phone'] and not found_leads:
        normalized_phone = normalize_phone(check_lead['phone'])
        matches = phone_index.get(normalized_phone, [])
        if matches:
            print(f"   ✅ TROVATO per TELEFONO: {check_lead['phone']}")
            found_leads.extend(matches)
    
    # Cerca per nome
    if not found_leads:
        normalized_name = normalize_name(check_lead['name'])
        matches = name_index.get(normalized_name, [])
        if matches:
            print(f"   ✅ TROVATO per NOME: {check_lead['name']}")
            found_leads.extend(matches)
    
    if found_leads:
        # Rimuovi duplicati
        unique_leads = []
        seen_ids = set()
        for lead in found_leads:
            if lead['id'] not in seen_ids:
                unique_leads.append(lead)
                seen_ids.add(lead['id'])
        
        for lead in unique_leads:
            print(f"      • ID: {lead['id']}")
            print(f"        Nome: {lead.get('firstName', '')} {lead.get('lastName', '')}")
            print(f"        Email: {lead.get('email', '')}")
            print(f"        Phone: {lead.get('phone', '')}")
            print(f"        CM: {lead.get('commercialManager', '')}")
        
        results['found'].append({
            'excel_data': check_lead,
            'telemedcare_leads': unique_leads
        })
    else:
        print(f"   ❌ NON trovato su TeleMedCare")
        results['not_found'].append(check_lead)

print("\n" + "=" * 70)
print("📊 RISULTATI FINALI")
print("=" * 70)
print(f"✅ Trovati su TeleMedCare: {len(results['found'])}/12")
print(f"❌ Non trovati: {len(results['not_found'])}/12")

if results['found']:
    print(f"\n✅ LEAD GIÀ PRESENTI SU TELEMEDCARE ({len(results['found'])}):")
    for item in results['found']:
        excel = item['excel_data']
        tmc_leads = item['telemedcare_leads']
        print(f"\n   • {excel['name']}")
        for lead in tmc_leads:
            print(f"     → {lead['id']} - {lead.get('firstName', '')} {lead.get('lastName', '')} - {lead.get('email', '')} - {lead.get('phone', '')}")

if results['not_found']:
    print(f"\n❌ LEAD NON PRESENTI SU TELEMEDCARE ({len(results['not_found'])}):")
    for lead in results['not_found']:
        info = []
        if lead.get('email'):
            info.append(f"Email: {lead['email']}")
        if lead.get('phone'):
            info.append(f"Tel: {lead['phone']}")
        print(f"   • {lead['name']} - {' | '.join(info) if info else 'Nessun contatto'}")

# Salva report
with open('12_leads_telemedcare_status.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\n💾 Report salvato in: 12_leads_telemedcare_status.json")
