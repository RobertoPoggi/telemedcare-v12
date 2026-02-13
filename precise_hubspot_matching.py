import requests
import json
import time
from typing import List, Dict, Optional

API_BASE = "https://telemedcare-v12.pages.dev/api"

def normalize_phone(phone: str) -> str:
    """Normalizza telefono rimuovendo tutto tranne cifre."""
    if not phone:
        return ''
    clean = ''.join(c for c in phone if c.isdigit())
    # Rimuovi prefisso 39 italiano
    if clean.startswith('39') and len(clean) > 10:
        clean = clean[2:]
    return clean

def normalize_text(text: str) -> str:
    """Normalizza testo (lowercase, trim)."""
    if not text:
        return ''
    return text.strip().lower()

def get_all_leads_without_hubspot():
    """Scarica lead senza external_source_id."""
    print("📥 Scaricamento lead senza HubSpot ID...")
    response = requests.get(f"{API_BASE}/leads?limit=500")
    data = response.json()
    all_leads = data.get('leads', [])
    
    excluded = ['Laura Calvi', 'Francesca Grati']
    leads_without_hs = []
    
    for lead in all_leads:
        if lead.get('external_source_id'):
            continue
        nome = (lead.get('nomeRichiedente') or '').strip()
        cognome = (lead.get('cognomeRichiedente') or '').strip()
        if f"{nome} {cognome}" in excluded:
            continue
        leads_without_hs.append(lead)
    
    print(f"✅ {len(leads_without_hs)} lead da processare\n")
    return leads_without_hs

def get_all_hubspot_contacts():
    """Scarica TUTTI i contatti HubSpot con paginazione."""
    print("📥 Scaricamento contatti HubSpot con paginazione...")
    all_contacts = []
    after = None
    page = 1
    
    while True:
        url = f"{API_BASE}/hubspot/contacts?limit=100"
        if after:
            url += f"&after={after}"
        
        print(f"   Pagina {page}...", end='', flush=True)
        response = requests.get(url)
        if response.status_code != 200:
            print(f" ❌ Errore {response.status_code}")
            break
        
        data = response.json()
        contacts = data.get('contacts', [])
        all_contacts.extend(contacts)
        print(f" +{len(contacts)}")
        
        after = data.get('paging', {}).get('next', {}).get('after')
        if not after:
            break
        page += 1
        time.sleep(0.15)
    
    print(f"✅ {len(all_contacts)} contatti HubSpot\n")
    return all_contacts

def find_exact_match(lead: Dict, contacts: List[Dict]) -> Optional[Dict]:
    """
    Cerca match ESATTO usando 3 strategie in ordine:
    1. Email esatta
    2. Telefono esatto (normalizzato)
    3. Nome+Cognome esatto
    """
    # Dati lead
    lead_email = normalize_text(lead.get('email') or lead.get('emailRichiedente') or '')
    lead_phone = normalize_phone(lead.get('telefono') or lead.get('telefonoRichiedente') or '')
    lead_firstname = normalize_text(lead.get('nomeRichiedente') or '')
    lead_lastname = normalize_text(lead.get('cognomeRichiedente') or '')
    
    # STRATEGIA 1: Email esatta
    if lead_email and '@' in lead_email and 'placeholder.com' not in lead_email:
        for contact in contacts:
            props = contact.get('properties', {})
            hs_email = normalize_text(props.get('email') or '')
            if lead_email == hs_email:
                return contact
    
    # STRATEGIA 2: Telefono esatto
    if lead_phone and len(lead_phone) >= 9:
        for contact in contacts:
            props = contact.get('properties', {})
            hs_phone = normalize_phone(props.get('phone') or props.get('mobilephone') or '')
            if lead_phone == hs_phone:
                return contact
    
    # STRATEGIA 3: Nome+Cognome esatto
    if lead_firstname and lead_lastname and len(lead_lastname) > 2:
        for contact in contacts:
            props = contact.get('properties', {})
            hs_firstname = normalize_text(props.get('firstname') or '')
            hs_lastname = normalize_text(props.get('lastname') or '')
            
            if lead_firstname == hs_firstname and lead_lastname == hs_lastname:
                return contact
    
    return None

def update_lead_hubspot_id(lead_id: str, hubspot_id: str) -> bool:
    """Aggiorna external_source_id del lead."""
    url = f"{API_BASE}/leads/{lead_id}"
    payload = {'external_source_id': hubspot_id}
    response = requests.put(url, json=payload)
    return response.status_code == 200

def main():
    print("=" * 80)
    print("🎯 MATCHING PRECISO HUBSPOT")
    print("=" * 80)
    print()
    
    leads = get_all_leads_without_hubspot()
    if not leads:
        print("✅ Tutti i lead hanno HubSpot ID!")
        return
    
    contacts = get_all_hubspot_contacts()
    
    print("=" * 80)
    print("🔍 MATCHING IN CORSO...")
    print("=" * 80)
    print()
    
    matched = []
    not_found = []
    updated = 0
    failed = 0
    
    for i, lead in enumerate(leads, 1):
        lead_id = lead.get('id', 'N/A')
        nome = lead.get('nomeRichiedente') or ''
        cognome = lead.get('cognomeRichiedente') or ''
        email = lead.get('email') or lead.get('emailRichiedente') or 'N/A'
        phone = lead.get('telefono') or lead.get('telefonoRichiedente') or 'N/A'
        
        print(f"[{i}/{len(leads)}] {nome} {cognome}")
        print(f"   ID: {lead_id}")
        print(f"   Email: {email}")
        print(f"   Tel: {phone}")
        
        contact = find_exact_match(lead, contacts)
        
        if contact:
            hs_id = contact['id']
            hs_props = contact.get('properties', {})
            print(f"   ✅ TROVATO in HubSpot!")
            print(f"      HubSpot ID: {hs_id}")
            print(f"      HubSpot: {hs_props.get('firstname', '')} {hs_props.get('lastname', '')}")
            print(f"      HubSpot Email: {hs_props.get('email', 'N/A')}")
            print(f"      HubSpot Phone: {hs_props.get('phone', 'N/A')}")
            
            if update_lead_hubspot_id(lead_id, hs_id):
                print(f"      ✅ AGGIORNATO!")
                updated += 1
                matched.append({
                    'lead_id': lead_id,
                    'name': f"{nome} {cognome}",
                    'hubspot_id': hs_id,
                    'match_type': 'exact'
                })
            else:
                print(f"      ❌ Errore aggiornamento")
                failed += 1
        else:
            print(f"   ❌ NON TROVATO")
            not_found.append({
                'lead_id': lead_id,
                'name': f"{nome} {cognome}",
                'email': email,
                'phone': phone
            })
        
        print()
        time.sleep(0.05)
    
    # Report finale
    print("=" * 80)
    print("📊 REPORT FINALE")
    print("=" * 80)
    print()
    print(f"Lead processati:       {len(leads)}")
    print(f"✅ Trovati e aggiornati: {updated} ({updated/len(leads)*100:.1f}%)")
    print(f"❌ Errori aggiornamento: {failed}")
    print(f"❌ Non trovati:          {len(not_found)} ({len(not_found)/len(leads)*100:.1f}%)")
    
    # Salva report
    report = {
        'matched': matched,
        'not_found': not_found,
        'stats': {
            'total': len(leads),
            'matched': updated,
            'failed': failed,
            'not_found': len(not_found)
        }
    }
    
    with open('precise_matching_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Report salvato: precise_matching_report.json")
    
    if not_found:
        print(f"\n❌ LEAD NON TROVATI ({len(not_found)}):")
        print("=" * 80)
        for lead in not_found[:20]:  # Solo primi 20
            print(f"- {lead['name']} (ID: {lead['lead_id']})")
            print(f"  Email: {lead['email']}")
            print(f"  Tel: {lead['phone']}")
            print()

if __name__ == '__main__':
    main()
