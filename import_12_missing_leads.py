#!/usr/bin/env python3
import json
import requests
import time

API_URL = "https://telemedcare-v12.pages.dev"

# I 12 lead mancanti di Ottavia (da ieri)
MISSING_LEADS = [
    {"nome": "Alberto", "cognome": "Avanzi"},
    {"nome": "Marco", "cognome": "Olivieri"},
    {"nome": "Giovanna", "cognome": "Giordano"},
    {"nome": "Mary", "cognome": "De Sanctis"},
    {"nome": "Francesco", "cognome": "Egiziano"},
    {"nome": "Enzo", "cognome": "Pedron"},
    {"nome": "Andrea", "cognome": "Dindo"},
    {"nome": "Andrea", "cognome": "Mercuri"},
    {"nome": "Maria Chiara", "cognome": "Baldassini"},
    {"nome": "Adriana", "cognome": "Mulassano"},
    {"nome": "Paola", "cognome": "Scarpin"},
    {"nome": "Laura", "cognome": "Bianchi"}
]

print("🔄 RECUPERO 12 LEAD MANCANTI DA HUBSPOT CON PAGINAZIONE")
print("="*80)
print()

# Step 1: Recupero tutti i contatti HubSpot con paginazione
print("📊 STEP 1: Recupero TUTTI i contatti da HubSpot (oltre 4600)...")
print()

all_hubspot_contacts = []
after = None
page = 0

while True:
    page += 1
    url = f"{API_URL}/api/hubspot/contacts?limit=100"
    if after:
        url += f"&after={after}"
    
    print(f"   Pagina {page}...", end=" ", flush=True)
    
    response = requests.get(url, timeout=60)
    
    if response.status_code != 200:
        print(f"❌ Errore HTTP {response.status_code}")
        break
    
    data = response.json()
    contacts = data.get('contacts', [])
    all_hubspot_contacts.extend(contacts)
    
    print(f"✅ {len(contacts)} contatti (totale finora: {len(all_hubspot_contacts)})")
    
    # Verifica se ci sono altre pagine
    paging = data.get('paging', {})
    if paging.get('next'):
        after = paging['next'].get('after')
        time.sleep(0.5)  # Pausa per non sovraccaricare API
    else:
        break

print()
print(f"✅ Recuperati {len(all_hubspot_contacts)} contatti totali da HubSpot")
print()

# Creo un dizionario per ricerca veloce
hubspot_by_name = {}
for contact in all_hubspot_contacts:
    props = contact.get('properties', {})
    firstname = (props.get('firstname') or '').strip().lower()
    lastname = (props.get('lastname') or '').strip().lower()
    
    if firstname and lastname:
        key = f"{firstname} {lastname}"
        if key not in hubspot_by_name:
            hubspot_by_name[key] = []
        hubspot_by_name[key].append(contact)

print(f"📊 Indice creato con {len(hubspot_by_name)} combinazioni nome+cognome uniche")
print()

# Step 2: Cerco i 12 lead mancanti
print("🔍 STEP 2: Cerco i 12 lead mancanti...")
print()

# Recupero lead esistenti su TeleMedCare
existing_response = requests.get(f"{API_URL}/api/leads")
existing_leads = existing_response.json()['leads']
existing_names = set()

for lead in existing_leads:
    nome_r = (lead.get('nomeRichiedente') or '').strip().lower()
    cognome_r = (lead.get('cognomeRichiedente') or '').strip().lower()
    if nome_r and cognome_r:
        existing_names.add(f"{nome_r} {cognome_r}")

print(f"✅ Trovati {len(existing_leads)} lead esistenti su TeleMedCare")
print()

# Cerco e importo i 12 lead
imported = []
not_found = []
already_exists = []
errors = []

for idx, lead_info in enumerate(MISSING_LEADS, 1):
    nome = lead_info['nome'].strip()
    cognome = lead_info['cognome'].strip()
    nome_completo = f"{nome} {cognome}"
    search_key = nome_completo.lower()
    
    print(f"[{idx}/12] {nome_completo}...", end=" ", flush=True)
    
    # Verifico se esiste già
    if search_key in existing_names:
        print("⏭️  Già presente")
        already_exists.append(nome_completo)
        continue
    
    # Cerco su HubSpot
    if search_key in hubspot_by_name:
        matches = hubspot_by_name[search_key]
        contact = matches[0]  # Prendo il primo match
        hubspot_id = contact.get('id')
        props = contact.get('properties', {})
        
        print(f"✅ Trovato (HS ID: {hubspot_id})", end=" → ", flush=True)
        
        # Importo il lead
        try:
            import_response = requests.post(
                f"{API_URL}/api/hubspot/import-single",
                json={'hubspotId': hubspot_id, 'onlyEcura': False},
                timeout=30
            )
            
            if import_response.status_code == 200:
                result = import_response.json()
                if result.get('success'):
                    lead_id = result.get('leadId', 'N/A')
                    print(f"✅ IMPORTATO: {lead_id}")
                    
                    # Aggiorno con CM=OB
                    requests.put(
                        f"{API_URL}/api/leads/{lead_id}",
                        json={'cm': 'OB'},
                        timeout=10
                    )
                    
                    imported.append({
                        'nome': nome_completo,
                        'hubspot_id': hubspot_id,
                        'lead_id': lead_id,
                        'email': props.get('email', ''),
                        'phone': props.get('phone', '')
                    })
                else:
                    error_msg = result.get('error', 'Errore')
                    print(f"❌ {error_msg}")
                    errors.append({'nome': nome_completo, 'errore': error_msg})
            else:
                print(f"❌ HTTP {import_response.status_code}")
                errors.append({'nome': nome_completo, 'errore': f'HTTP {import_response.status_code}'})
        
        except Exception as e:
            print(f"❌ {str(e)}")
            errors.append({'nome': nome_completo, 'errore': str(e)})
    else:
        print("❌ Non trovato su HubSpot")
        not_found.append(nome_completo)
    
    time.sleep(0.5)

# Report finale
print()
print("="*80)
print("📊 REPORT FINALE RECUPERO 12 LEAD")
print("="*80)
print()
print(f"✅ Lead importati: {len(imported)}/12")
if imported:
    for lead in imported:
        print(f"   • {lead['nome']} → {lead['lead_id']}")
        print(f"     HubSpot ID: {lead['hubspot_id']}")
        print(f"     Email: {lead['email']}")
        print(f"     Phone: {lead['phone']}")
        print()

print(f"⏭️  Già presenti: {len(already_exists)}")
for nome in already_exists:
    print(f"   • {nome}")

print()
print(f"❌ Non trovati: {len(not_found)}")
for nome in not_found:
    print(f"   • {nome}")

print()
print(f"⚠️  Errori: {len(errors)}")
for err in errors:
    print(f"   • {err['nome']}: {err['errore']}")

# Salvo report
with open('12_leads_recovery_report.json', 'w') as f:
    json.dump({
        'total_hubspot_contacts': len(all_hubspot_contacts),
        'imported': imported,
        'already_exists': already_exists,
        'not_found': not_found,
        'errors': errors
    }, f, indent=2)

print()
print(f"📊 Totale contatti HubSpot recuperati: {len(all_hubspot_contacts)}")
print("✅ Report salvato in 12_leads_recovery_report.json")

