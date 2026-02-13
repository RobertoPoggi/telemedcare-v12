#!/usr/bin/env python3
"""
Controllo GLOBALE: cerca TUTTI i lead senza external_source_id in HubSpot
con paginazione completa e aggiorna quelli trovati.
Eccezioni: Laura Calvi e Francesca Grati (non cercare)
"""
import requests
import time

API_BASE = 'https://telemedcare-v12.pages.dev'

def normalize_phone(phone):
    if not phone:
        return ''
    digits = ''.join(c for c in str(phone) if c.isdigit())
    return digits[-10:] if len(digits) >= 10 else digits[-9:]

def normalize_text(text):
    if not text:
        return ''
    return str(text).strip().lower()

def get_all_hubspot_contacts():
    """Scarica TUTTI i contatti HubSpot con paginazione"""
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
                
                if page % 10 == 0:
                    print(f"   Pagina {page}: totale finora {len(all_contacts)} contatti")
                
                paging = data.get('paging', {})
                after = paging.get('next', {}).get('after')
                
                if not after:
                    break
                
                page += 1
                time.sleep(0.2)
                
            else:
                print(f"   ❌ Errore API {response.status_code}")
                break
                
        except Exception as e:
            print(f"   ⚠️  Errore: {str(e)[:80]}")
            break
    
    print(f"✅ Totale contatti HubSpot: {len(all_contacts)}\n")
    return all_contacts

def search_contact(contacts, lead):
    """Cerca un lead nei contatti HubSpot"""
    nome = normalize_text(lead.get('nomeRichiedente', ''))
    cognome = normalize_text(lead.get('cognomeRichiedente', ''))
    email = normalize_text(lead.get('email', ''))
    telefono = normalize_phone(lead.get('telefono', ''))
    
    matches = []
    
    for contact in contacts:
        props = contact.get('properties', {})
        hs_nome = normalize_text(props.get('firstname', ''))
        hs_cognome = normalize_text(props.get('lastname', ''))
        hs_email = normalize_text(props.get('email', ''))
        hs_phone = normalize_phone(props.get('phone', ''))
        
        # Match per email (massima priorità)
        if email and '@' in email and email == hs_email:
            matches.append(contact)
            continue
        
        # Match per cognome + nome
        if cognome and cognome in hs_cognome:
            if not nome or nome in hs_nome:
                matches.append(contact)
                continue
        
        # Match per telefono (ultime 9 cifre)
        if telefono and len(telefono) >= 9:
            phone_search = telefono[-9:]
            if phone_search in hs_phone:
                matches.append(contact)
                continue
    
    return matches

def update_lead_hubspot_id(lead_id, hubspot_id):
    """Aggiorna il lead con l'ID HubSpot"""
    try:
        response = requests.put(
            f'{API_BASE}/api/leads/{lead_id}',
            json={'external_source_id': hubspot_id},
            timeout=10
        )
        return response.status_code in [200, 201]
    except:
        return False

print(f"\n{'='*120}")
print(f"🔍 CONTROLLO GLOBALE: ABBINAMENTO TUTTI I LEAD SENZA HUBSPOT ID")
print(f"{'='*120}\n")

# Scarica TUTTI i lead dal DB
print("📥 Caricamento TUTTI i lead dal database...")
response = requests.get(f'{API_BASE}/api/leads?limit=500', timeout=30)
all_db_leads = response.json().get('leads', [])
print(f"✅ Caricati {len(all_db_leads)} lead dal database\n")

# Filtra lead senza external_source_id
leads_without_hs = []
eccezioni = ['laura calvi', 'francesca grati']

for lead in all_db_leads:
    ext_id = lead.get('external_source_id')
    nome_completo = f"{lead.get('nomeRichiedente', '')} {lead.get('cognomeRichiedente', '')}".strip().lower()
    
    # Salta se ha già HubSpot ID
    if ext_id:
        continue
    
    # Salta eccezioni
    if any(exc in nome_completo for exc in eccezioni):
        continue
    
    leads_without_hs.append(lead)

print(f"📊 Lead senza HubSpot ID: {len(leads_without_hs)}")
print(f"   (Escluse eccezioni: Laura Calvi, Francesca Grati)\n")

# Scarica TUTTI i contatti HubSpot
hubspot_contacts = get_all_hubspot_contacts()

if not hubspot_contacts:
    print("❌ Impossibile scaricare contatti HubSpot")
    exit(1)

print(f"{'='*120}")
print(f"🔍 RICERCA E ABBINAMENTO")
print(f"{'='*120}\n")

matched = []
not_found = []
updated = []
update_failed = []

for i, lead in enumerate(leads_without_hs, 1):
    lead_id = lead.get('id', '')
    nome_completo = f"{lead.get('nomeRichiedente', '')} {lead.get('cognomeRichiedente', '')}".strip()
    email = lead.get('email', 'N/A')
    telefono = lead.get('telefono', 'N/A')
    
    if i % 10 == 0:
        print(f"[{i}/{len(leads_without_hs)}] Processati {i} lead...")
    
    # Cerca in HubSpot
    matches = search_contact(hubspot_contacts, lead)
    
    if matches:
        best_match = matches[0]
        hs_id = best_match.get('id')
        props = best_match.get('properties', {})
        hs_name = f"{props.get('firstname', '')} {props.get('lastname', '')}".strip()
        hs_email = props.get('email', 'N/A')
        
        matched.append({
            'nome': nome_completo,
            'lead_id': lead_id,
            'hs_id': hs_id,
            'hs_name': hs_name,
            'hs_email': hs_email
        })
        
        # Aggiorna subito
        if update_lead_hubspot_id(lead_id, hs_id):
            updated.append(nome_completo)
        else:
            update_failed.append(nome_completo)
    else:
        not_found.append({
            'nome': nome_completo,
            'lead_id': lead_id[:35],
            'email': email,
            'telefono': telefono
        })

# Report finale
print(f"\n{'='*120}")
print(f"📊 RISULTATI FINALI:")
print(f"{'='*120}")
print(f"📊 Lead analizzati: {len(leads_without_hs)}")
print(f"✅ Trovati in HubSpot: {len(matched)}")
print(f"✅ Aggiornati nel DB: {len(updated)}")
print(f"❌ Update falliti: {len(update_failed)}")
print(f"❌ Non trovati: {len(not_found)}")
print(f"📈 Tasso di abbinamento: {(len(matched)/len(leads_without_hs)*100):.1f}%")
print(f"{'='*120}\n")

if matched:
    print(f"✅ LEAD ABBINATI E AGGIORNATI ({len(matched)}):\n")
    for i, item in enumerate(matched[:50], 1):  # Mostra primi 50
        status = '✅' if item['nome'] in updated else '❌'
        print(f"{i:3}. {status} {item['nome']:35} | DB: {item['lead_id'][:35]:35} | HS: {item['hs_id']}")
        if item['hs_email'] != 'N/A':
            print(f"       Email HS: {item['hs_email']}")
    
    if len(matched) > 50:
        print(f"\n   ... e altri {len(matched)-50} lead\n")

if not_found:
    print(f"\n❌ LEAD NON TROVATI IN HUBSPOT ({len(not_found)}):\n")
    for i, item in enumerate(not_found[:30], 1):  # Mostra primi 30
        print(f"{i:3}. {item['nome']:35} | Email: {item['email'][:35]:35} | Tel: {item['telefono'][:15]}")
    
    if len(not_found) > 30:
        print(f"\n   ... e altri {len(not_found)-30} lead\n")

print(f"\n{'='*120}")
print(f"🎯 OBIETTIVO: 100% abbinamento (escluse Laura Calvi e Francesca Grati)")
print(f"{'='*120}")
print(f"✅ Lead con HubSpot ID: {len(all_db_leads) - len(leads_without_hs) + len(matched)}")
print(f"❌ Lead senza HubSpot ID: {len(not_found) + 2}  (include le 2 eccezioni)")
print(f"{'='*120}\n")

# Salva report
with open('/home/user/webapp/global_hubspot_matching_report.txt', 'w') as f:
    f.write(f"REPORT ABBINAMENTO GLOBALE HUBSPOT\n")
    f.write(f"{'='*120}\n\n")
    f.write(f"Lead analizzati: {len(leads_without_hs)}\n")
    f.write(f"Trovati: {len(matched)}\n")
    f.write(f"Aggiornati: {len(updated)}\n")
    f.write(f"Non trovati: {len(not_found)}\n\n")
    
    if not_found:
        f.write(f"LEAD NON TROVATI:\n")
        f.write(f"{'-'*120}\n")
        for item in not_found:
            f.write(f"{item['nome']:40} | {item['lead_id']:40} | {item['email']}\n")

print(f"💾 Report salvato in: global_hubspot_matching_report.txt\n")
