#!/usr/bin/env python3
import json
import requests

API_URL = "https://telemedcare-v12.pages.dev"

# I 5 lead trovati su HubSpot ma con errore HTTP 404
LEADS_TO_IMPORT = [
    {"nome": "Alberto Avanzi", "hubspot_id": "688331078853"},
    {"nome": "Giovanna Giordano", "hubspot_id": "682330208477"},
    {"nome": "Francesco Egiziano", "hubspot_id": "678450709720"},
    {"nome": "Enzo Pedron", "hubspot_id": "676141858038"},
    {"nome": "Maria Chiara Baldassini", "hubspot_id": "671621029092"}
]

print("🔄 IMPORTAZIONE DIRETTA 5 LEAD DA HUBSPOT")
print("="*80)
print()

# Recupero i dati completi da HubSpot
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
    
    data = response.json()
    all_contacts.extend(data.get('contacts', []))
    
    paging = data.get('paging', {})
    if not paging.get('next'):
        break
    after = paging['next'].get('after')

print(f"✅ Recuperati {len(all_contacts)} contatti")
print()

# Creo dizionario per ID
contacts_by_id = {c['id']: c for c in all_contacts}

# Importo i 5 lead
imported = []
errors = []

for idx, lead_info in enumerate(LEADS_TO_IMPORT, 1):
    nome = lead_info['nome']
    hubspot_id = lead_info['hubspot_id']
    
    print(f"[{idx}/5] {nome} (HS ID: {hubspot_id})...", end=" ", flush=True)
    
    # Recupero i dati completi del contatto
    if hubspot_id not in contacts_by_id:
        print("❌ Contatto non trovato")
        errors.append({'nome': nome, 'errore': 'Contatto non trovato'})
        continue
    
    contact = contacts_by_id[hubspot_id]
    props = contact['properties']
    
    # Creo il lead manualmente chiamando l'API leads
    try:
        lead_data = {
            'nomeRichiedente': props.get('firstname', ''),
            'cognomeRichiedente': props.get('lastname', ''),
            'email': props.get('email', ''),
            'telefono': props.get('phone', ''),
            'fonte': props.get('hs_object_source_detail_1', 'HubSpot Import'),
            'tipoServizio': 'eCura',
            'external_source_id': hubspot_id,
            'cm': 'OB',
            'note': f"Importato manualmente da HubSpot - ID: {hubspot_id}"
        }
        
        # Chiamata POST per creare il lead
        create_response = requests.post(
            f"{API_URL}/api/leads",
            json=lead_data,
            timeout=30
        )
        
        if create_response.status_code in [200, 201]:
            result = create_response.json()
            lead_id = result.get('id', 'N/A')
            print(f"✅ CREATO: {lead_id}")
            
            imported.append({
                'nome': nome,
                'hubspot_id': hubspot_id,
                'lead_id': lead_id,
                'email': props.get('email', ''),
                'phone': props.get('phone', '')
            })
        else:
            error_text = create_response.text[:200]
            print(f"❌ HTTP {create_response.status_code}: {error_text}")
            errors.append({'nome': nome, 'errore': f'HTTP {create_response.status_code}'})
    
    except Exception as e:
        print(f"❌ {str(e)}")
        errors.append({'nome': nome, 'errore': str(e)})

# Report finale
print()
print("="*80)
print("📊 REPORT FINALE")
print("="*80)
print()
print(f"✅ Lead importati: {len(imported)}/5")
if imported:
    for lead in imported:
        print(f"   • {lead['nome']} → {lead['lead_id']}")
        print(f"     HubSpot ID: {lead['hubspot_id']}")
        print(f"     Email: {lead['email']}")
        print(f"     Phone: {lead['phone']}")
        print()

print(f"⚠️  Errori: {len(errors)}")
for err in errors:
    print(f"   • {err['nome']}: {err['errore']}")

# Salvo
with open('5_leads_direct_import.json', 'w') as f:
    json.dump({'imported': imported, 'errors': errors}, f, indent=2)

print()
print("✅ Report salvato in 5_leads_direct_import.json")

