#!/usr/bin/env python3
"""
Cerca i 12 lead in HubSpot usando l'API backend con PAGINAZIONE
"""
import requests
import time

# I 12 lead importati
IMPORTED_LEADS = [
    {'id': 'LEAD-MANUAL-1770946050424', 'nome': 'Laura', 'cognome': 'Bianchi', 'telefono': '3409876543'},
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

API_BASE = 'https://telemedcare-v12.pages.dev'

def normalize_phone(phone):
    if not phone:
        return ''
    digits = ''.join(c for c in str(phone) if c.isdigit())
    return digits[-10:] if len(digits) >= 10 else digits[-9:]

def get_all_hubspot_contacts():
    """Scarica TUTTI i contatti da HubSpot con paginazione"""
    all_contacts = []
    after = None
    page = 1
    
    print("📥 Scaricamento TUTTI i contatti da HubSpot con paginazione...")
    
    while True:
        try:
            url = f'{API_BASE}/api/hubspot/contacts?limit=100'
            if after:
                url += f'&after={after}'
            
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                contacts = data.get('contacts', [])
                all_contacts.extend(contacts)
                
                total = data.get('total', 'N/A')
                print(f"   Pagina {page}: {len(contacts)} contatti (totale finora: {len(all_contacts)}, totale HS: {total})")
                
                paging = data.get('paging', {})
                next_info = paging.get('next', {})
                after = next_info.get('after')
                
                if not after:
                    break
                
                page += 1
                time.sleep(0.3)  # Rate limiting
                
            else:
                print(f"   ❌ Errore API {response.status_code}: {response.text[:100]}")
                break
                
        except Exception as e:
            print(f"   ⚠️  Errore: {str(e)[:80]}")
            break
    
    print(f"✅ Totale contatti scaricati: {len(all_contacts)}\n")
    return all_contacts

def search_contact(contacts, nome, cognome, telefono=None, email=None):
    """Cerca un lead nei contatti"""
    matches = []
    
    cognome_norm = cognome.lower().strip()
    nome_norm = nome.lower().strip() if nome else ''
    
    for contact in contacts:
        props = contact.get('properties', {})
        hs_nome = (props.get('firstname') or '').lower().strip()
        hs_cognome = (props.get('lastname') or '').lower().strip()
        hs_email = (props.get('email') or '').lower().strip()
        hs_phone = normalize_phone(props.get('phone', ''))
        
        # Match per cognome
        if cognome_norm and cognome_norm in hs_cognome:
            # Verifica anche il nome se presente
            if not nome or nome_norm in hs_nome:
                matches.append(contact)
                continue
        
        # Match per telefono
        if telefono:
            phone_norm = normalize_phone(telefono)
            if len(phone_norm) >= 9 and phone_norm[-9:] in hs_phone:
                matches.append(contact)
                continue
        
        # Match per email
        if email and '@' in email:
            if email.lower().strip() == hs_email:
                matches.append(contact)
                continue
    
    return matches

print(f"\n{'='*110}")
print(f"🔍 RICERCA 12 LEAD IN HUBSPOT CON PAGINAZIONE COMPLETA")
print(f"{'='*110}\n")

# Scarica TUTTI i contatti
all_contacts = get_all_hubspot_contacts()

if not all_contacts:
    print("❌ Nessun contatto scaricato da HubSpot")
    exit(1)

print(f"{'='*110}")
print(f"🔍 RICERCA DEI 12 LEAD IMPORTATI")
print(f"{'='*110}\n")

matched = []
not_found = []

for i, lead in enumerate(IMPORTED_LEADS, 1):
    nome_completo = f"{lead['nome']} {lead['cognome']}"
    print(f"{i:2}. {'─'*100}")
    print(f"   📋 {nome_completo}")
    print(f"   ID DB: {lead['id']}")
    print(f"   Telefono: {lead.get('telefono', 'N/A')}")
    print(f"   Email: {lead.get('email', 'N/A')}")
    
    matches = search_contact(
        all_contacts,
        lead['nome'],
        lead['cognome'],
        lead.get('telefono'),
        lead.get('email')
    )
    
    if matches:
        print(f"   ✅ TROVATO! ({len(matches)} match)\n")
        
        for idx, contact in enumerate(matches, 1):
            props = contact.get('properties', {})
            hs_id = contact.get('id')
            hs_name = f"{props.get('firstname', '')} {props.get('lastname', '')}".strip()
            hs_email = props.get('email', 'N/A')
            hs_phone = props.get('phone', 'N/A')
            
            marker = '⭐' if idx == 1 else '  '
            print(f"   {marker} Match {idx}:")
            print(f"      HubSpot ID: {hs_id}")
            print(f"      Nome: {hs_name}")
            print(f"      Email: {hs_email}")
            print(f"      Phone: {hs_phone}")
        
        print()
        best = matches[0]
        matched.append({
            'lead_id': lead['id'],
            'nome': nome_completo,
            'hubspot_id': best.get('id'),
            'hubspot_name': f"{best['properties'].get('firstname', '')} {best['properties'].get('lastname', '')}".strip()
        })
    else:
        print(f"   ❌ NON TROVATO\n")
        not_found.append({
            'lead_id': lead['id'],
            'nome': nome_completo
        })

# Report finale
print(f"{'='*110}")
print(f"📊 RISULTATI FINALI:")
print(f"{'='*110}")
print(f"✅ Trovati in HubSpot: {len(matched)}/{len(IMPORTED_LEADS)}")
print(f"❌ Non trovati: {len(not_found)}/{len(IMPORTED_LEADS)}")
print(f"📊 Totale contatti HubSpot: {len(all_contacts)}")
print(f"{'='*110}\n")

if matched:
    print(f"✅ LEAD TROVATI IN HUBSPOT ({len(matched)}):\n")
    for item in matched:
        print(f"   ✓ {item['nome']:30} | DB: {item['lead_id'][:35]:35} | HS: {item['hubspot_id']}")
        print(f"      Nome HS: {item['hubspot_name']}")

if not_found:
    print(f"\n❌ LEAD NON TROVATI ({len(not_found)}):\n")
    for item in not_found:
        print(f"   ✗ {item['nome']:30} | DB: {item['lead_id']}")

print(f"\n{'='*110}\n")
