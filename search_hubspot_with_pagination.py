#!/usr/bin/env python3
"""
Cerca i 12 lead importati in HubSpot - CON PAGINAZIONE per cercare TUTTI i contatti
"""
import requests
import os
import time

# I 12 lead importati CON I DATI REALI DAL FOGLIO EXCEL
IMPORTED_LEADS = [
    {'id': 'LEAD-MANUAL-1770946050424', 'nome': 'Laura', 'cognome': 'Bianchi', 'telefono': '340-9876543'},
    {'id': 'LEAD-MANUAL-1770946051660', 'nome': 'Paola', 'cognome': 'Scarpin', 'telefono': '3403686122'},
    {'id': 'LEAD-MANUAL-1770946054097', 'nome': 'Adriana', 'cognome': 'Mulassano', 'telefono': '3387205351'},
    {'id': 'LEAD-MANUAL-1770946055276', 'nome': 'Maria Chiara', 'cognome': 'Baldassini', 'telefono': '3922352447'},
    {'id': 'LEAD-MANUAL-1770946057712', 'nome': 'Andrea', 'cognome': 'Mercuri', 'telefono': '366156266'},
    {'id': 'LEAD-MANUAL-1770946058870', 'nome': 'Enzo', 'cognome': 'Pedron', 'telefono': '3484717119'},
    {'id': 'LEAD-MANUAL-1770946060015', 'nome': 'Andrea', 'cognome': 'Dindo', 'email': 'andreadindo1@gmail.com'},
    {'id': 'LEAD-MANUAL-1770946061218', 'nome': 'Francesco', 'cognome': 'Egiziano', 'telefono': '3382933088'},
    {'id': 'LEAD-MANUAL-1770946062533', 'nome': 'Mary', 'cognome': 'De Sanctis', 'telefono': '3396748762'},
    {'id': 'LEAD-MANUAL-1770946063740', 'nome': 'Giovanna', 'cognome': 'Giordano', 'telefono': '3381084344'},
    {'id': 'LEAD-MANUAL-1770946064859', 'nome': 'Marco', 'cognome': 'Olivieri', 'telefono': '348828024'},
    {'id': 'LEAD-MANUAL-1770946067171', 'nome': 'Alberto', 'cognome': 'Avanzi', 'telefono': '3295954873'}
]

HUBSPOT_TOKEN = os.getenv('HUBSPOT_TOKEN', '')

def normalize_phone(phone):
    """Normalizza telefono rimuovendo tutto tranne le cifre"""
    if not phone:
        return ''
    digits = ''.join(c for c in str(phone) if c.isdigit())
    if len(digits) >= 9:
        return digits[-10:] if len(digits) >= 10 else digits[-9:]
    return digits

def get_all_hubspot_contacts():
    """Scarica TUTTI i contatti da HubSpot con paginazione"""
    all_contacts = []
    after = None
    page = 1
    
    print("📥 Scaricamento TUTTI i contatti da HubSpot con paginazione...")
    
    while True:
        try:
            url = 'https://api.hubapi.com/crm/v3/objects/contacts'
            headers = {'Authorization': f'Bearer {HUBSPOT_TOKEN}'}
            params = {
                'limit': 100,
                'properties': 'firstname,lastname,email,phone,hs_object_id,createdate'
            }
            
            if after:
                params['after'] = after
            
            response = requests.get(url, headers=headers, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                all_contacts.extend(results)
                
                print(f"   Pagina {page}: {len(results)} contatti (totale: {len(all_contacts)})")
                
                paging = data.get('paging', {})
                next_link = paging.get('next', {})
                after = next_link.get('after')
                
                if not after:
                    break
                
                page += 1
                time.sleep(0.2)  # Rate limiting
                
            elif response.status_code == 401:
                print(f"   ❌ Errore 401: Token non valido o scaduto")
                break
            else:
                print(f"   ❌ Errore API {response.status_code}: {response.text[:100]}")
                break
                
        except Exception as e:
            print(f"   ⚠️  Errore paginazione: {str(e)[:80]}")
            break
    
    print(f"✅ Totale contatti scaricati: {len(all_contacts)}\n")
    return all_contacts

def search_in_contacts(contacts, nome, cognome, telefono=None, email=None):
    """Cerca un lead nei contatti HubSpot"""
    matches = []
    
    cognome_norm = cognome.lower().strip()
    nome_norm = nome.lower().strip()
    
    # 1. Cerca per cognome esatto
    for contact in contacts:
        props = contact.get('properties', {})
        hs_cognome = props.get('lastname', '').lower().strip()
        
        if hs_cognome == cognome_norm:
            matches.append(contact)
    
    # 2. Se trovati match per cognome, filtra per nome
    if matches and nome:
        matches = [c for c in matches if nome_norm in c['properties'].get('firstname', '').lower()]
    
    # 3. Se ancora nessun match, cerca per telefono
    if not matches and telefono:
        phone_norm = normalize_phone(telefono)
        if len(phone_norm) >= 9:
            search_digits = phone_norm[-9:]  # Ultime 9 cifre
            for contact in contacts:
                hs_phone = contact.get('properties', {}).get('phone', '')
                if search_digits in normalize_phone(hs_phone):
                    matches.append(contact)
    
    # 4. Se ancora nessun match, cerca per email
    if not matches and email and '@' in email:
        email_norm = email.lower().strip()
        for contact in contacts:
            hs_email = contact.get('properties', {}).get('email', '').lower().strip()
            if hs_email == email_norm:
                matches.append(contact)
    
    return matches

def update_lead_with_hubspot(lead_id, hubspot_id):
    """Aggiorna il lead nel database con l'ID HubSpot"""
    try:
        url = f'https://telemedcare-v12.pages.dev/api/leads/{lead_id}'
        data = {'external_source_id': hubspot_id}
        
        response = requests.put(url, json=data, timeout=10)
        if response.status_code in [200, 201]:
            return True
        else:
            print(f"         ⚠️  Errore update API: {response.status_code}")
            return False
    except Exception as e:
        print(f"         ⚠️  Errore update: {str(e)[:50]}")
        return False

print(f"\n{'='*110}")
print(f"🔍 RICERCA COMPLETA IN HUBSPOT CON PAGINAZIONE - TUTTI I CONTATTI")
print(f"{'='*110}\n")

# Scarica TUTTI i contatti HubSpot
all_contacts = get_all_hubspot_contacts()

if not all_contacts:
    print("❌ Impossibile scaricare i contatti da HubSpot (token non valido?)")
    exit(1)

matched = []
not_found = []
updated = []

print(f"{'='*110}")
print(f"🔍 RICERCA DEI 12 LEAD IMPORTATI")
print(f"{'='*110}\n")

for i, lead in enumerate(IMPORTED_LEADS, 1):
    nome_completo = f"{lead['nome']} {lead['cognome']}"
    print(f"{i:2}. {'─'*100}")
    print(f"   📋 {nome_completo}")
    print(f"   ID DB: {lead['id']}")
    print(f"   Telefono: {lead.get('telefono', 'N/A')}")
    print(f"   Email: {lead.get('email', 'N/A')}")
    print()
    
    # Cerca nei contatti scaricati
    print(f"   🔍 Ricerca in {len(all_contacts)} contatti HubSpot...")
    matches = search_in_contacts(
        all_contacts,
        lead['nome'],
        lead['cognome'],
        lead.get('telefono'),
        lead.get('email')
    )
    
    if matches:
        print(f"   ✅ TROVATO! ({len(matches)} match)\n")
        
        for idx, contact in enumerate(matches, 1):
            hs_id = contact.get('id')
            props = contact.get('properties', {})
            hs_name = f"{props.get('firstname', '')} {props.get('lastname', '')}".strip()
            hs_email = props.get('email', 'N/A')
            hs_phone = props.get('phone', 'N/A')
            hs_date = props.get('createdate', 'N/A')
            
            marker = '⭐' if idx == 1 else '  '
            print(f"   {marker} Match {idx}:")
            print(f"      HubSpot ID: {hs_id}")
            print(f"      Nome HS: {hs_name}")
            print(f"      Email HS: {hs_email}")
            print(f"      Telefono HS: {hs_phone}")
            print(f"      Created: {hs_date[:10] if len(hs_date) > 10 else hs_date}")
        
        # Usa il primo match per l'update
        best_match = matches[0]
        hs_id = best_match.get('id')
        
        print(f"\n      🔄 Aggiornamento lead nel database...")
        if update_lead_with_hubspot(lead['id'], hs_id):
            print(f"      ✅ Lead aggiornato con external_source_id={hs_id}")
            updated.append(lead['id'])
        
        print()
        
        matched.append({
            'lead_id': lead['id'],
            'nome': nome_completo,
            'hubspot_id': hs_id,
            'hubspot_email': best_match['properties'].get('email', 'N/A')
        })
    else:
        print(f"   ❌ NON TROVATO in HubSpot")
        not_found.append({
            'lead_id': lead['id'],
            'nome': nome_completo
        })
    
    print()

# Report finale
print(f"{'='*110}")
print(f"📊 RISULTATI FINALI:")
print(f"{'='*110}")
print(f"✅ Trovati in HubSpot: {len(matched)}/{len(IMPORTED_LEADS)}")
print(f"✅ Lead aggiornati nel DB: {len(updated)}/{len(matched)}")
print(f"❌ Non trovati: {len(not_found)}/{len(IMPORTED_LEADS)}")
print(f"📊 Totale contatti HubSpot: {len(all_contacts)}")
print(f"{'='*110}\n")

if matched:
    print(f"✅ LEAD ABBINATI A HUBSPOT ({len(matched)}):\n")
    for item in matched:
        update_marker = '✅' if item['lead_id'] in updated else '⚠️'
        print(f"   {update_marker} {item['nome']:30} | DB: {item['lead_id'][:30]:30} | HS: {item['hubspot_id']}")
        print(f"      Email HS: {item['hubspot_email']}")

if not_found:
    print(f"\n❌ LEAD NON TROVATI IN HUBSPOT ({len(not_found)}):\n")
    for item in not_found:
        print(f"   ✗ {item['nome']:30} | DB: {item['lead_id']}")

print(f"\n{'='*110}\n")
