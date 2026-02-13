import requests
import json
import time
from typing import List, Dict, Optional

API_BASE = "https://telemedcare-v12.pages.dev/api"

def get_all_leads_without_hubspot():
    """Scarica tutti i lead senza external_source_id da TeleMedCare."""
    print("📥 Scaricamento lead senza HubSpot ID da TeleMedCare...")
    response = requests.get(f"{API_BASE}/leads?limit=500")
    if response.status_code != 200:
        print(f"❌ Errore scaricamento lead: {response.status_code}")
        return []
    
    data = response.json()
    all_leads = data.get('leads', [])
    
    # Filtra lead senza external_source_id
    leads_without_hs = []
    excluded_names = ['Laura Calvi', 'Francesca Grati']
    
    for lead in all_leads:
        external_id = lead.get('external_source_id')
        nome = (lead.get('nomeRichiedente') or '').strip()
        cognome = (lead.get('cognomeRichiedente') or '').strip()
        full_name = f"{nome} {cognome}".strip()
        
        # Escludi se ha già HubSpot ID o se è nella lista esclusi
        if external_id or full_name in excluded_names:
            continue
            
        leads_without_hs.append(lead)
    
    print(f"✅ Trovati {len(leads_without_hs)} lead senza HubSpot ID (esclusi Laura Calvi, Francesca Grati)")
    return leads_without_hs

def get_all_hubspot_contacts():
    """Scarica TUTTI i contatti da HubSpot con paginazione."""
    print("\n📥 Scaricamento contatti HubSpot con paginazione...")
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
            print(f"\n❌ Errore pagina {page}: {response.status_code}")
            break
        
        data = response.json()
        contacts = data.get('contacts', [])
        all_contacts.extend(contacts)
        print(f" +{len(contacts)} contatti")
        
        # Controlla se ci sono altre pagine
        paging = data.get('paging', {})
        after = paging.get('next', {}).get('after')
        
        if not after:
            break
        
        page += 1
        time.sleep(0.2)  # Rate limiting
    
    print(f"✅ Scaricati {len(all_contacts)} contatti totali da HubSpot\n")
    return all_contacts

def normalize_phone(phone: str) -> str:
    """Normalizza il telefono per il matching."""
    if not phone:
        return ''
    # Rimuovi spazi, trattini, parentesi, +39, prefisso internazionale
    clean = ''.join(c for c in phone if c.isdigit())
    if clean.startswith('39') and len(clean) > 10:
        clean = clean[2:]
    return clean

def match_lead_with_hubspot(lead: Dict, hubspot_contacts: List[Dict]) -> Optional[Dict]:
    """Cerca il lead in HubSpot usando email, telefono, nome+cognome."""
    email = (lead.get('email') or lead.get('emailRichiedente') or '').strip().lower()
    phone = lead.get('telefono') or lead.get('telefonoRichiedente') or ''
    nome = (lead.get('nomeRichiedente') or '').strip().lower()
    cognome = (lead.get('cognomeRichiedente') or '').strip().lower()
    
    phone_clean = normalize_phone(phone)
    
    for contact in hubspot_contacts:
        props = contact.get('properties', {})
        
        # Match per email
        hs_email = (props.get('email') or '').strip().lower()
        if email and hs_email == email:
            return contact
        
        # Match per telefono
        hs_phone = props.get('phone') or props.get('mobilephone') or ''
        hs_phone_clean = normalize_phone(hs_phone)
        if phone_clean and hs_phone_clean and phone_clean == hs_phone_clean:
            return contact
        
        # Match per nome+cognome
        hs_firstname = (props.get('firstname') or '').strip().lower()
        hs_lastname = (props.get('lastname') or '').strip().lower()
        if nome and cognome and hs_firstname == nome and hs_lastname == cognome:
            return contact
    
    return None

def update_lead_hubspot_id(lead_id: str, hubspot_id: str) -> bool:
    """Aggiorna l'external_source_id del lead."""
    url = f"{API_BASE}/leads/{lead_id}"
    payload = {
        'external_source_id': hubspot_id
    }
    
    response = requests.put(url, json=payload)
    return response.status_code == 200

def main():
    print("=" * 80)
    print("🔍 CONTROLLO GLOBALE MATCHING HUBSPOT")
    print("=" * 80)
    
    # 1. Scarica lead senza HubSpot ID
    leads_without_hs = get_all_leads_without_hubspot()
    if not leads_without_hs:
        print("\n✅ Tutti i lead hanno già HubSpot ID!")
        return
    
    # 2. Scarica tutti i contatti HubSpot
    hubspot_contacts = get_all_hubspot_contacts()
    if not hubspot_contacts:
        print("\n❌ Nessun contatto scaricato da HubSpot!")
        return
    
    # 3. Match e aggiornamento
    print("🔄 Matching e aggiornamento lead...")
    print("-" * 80)
    
    matched = 0
    not_matched = 0
    updated = 0
    failed = 0
    
    results = {
        'matched': [],
        'not_matched': [],
        'failed': []
    }
    
    for i, lead in enumerate(leads_without_hs, 1):
        lead_id = lead.get('id', 'N/A')
        nome = lead.get('nomeRichiedente') or ''
        cognome = lead.get('cognomeRichiedente') or ''
        email = lead.get('email') or lead.get('emailRichiedente') or 'N/A'
        telefono = lead.get('telefono') or lead.get('telefonoRichiedente') or 'N/A'
        
        print(f"\n[{i}/{len(leads_without_hs)}] {nome} {cognome}")
        print(f"   ID: {lead_id}")
        print(f"   Email: {email}")
        print(f"   Tel: {telefono}")
        
        # Cerca in HubSpot
        hs_contact = match_lead_with_hubspot(lead, hubspot_contacts)
        
        if hs_contact:
            hs_id = hs_contact['id']
            hs_props = hs_contact.get('properties', {})
            hs_email = hs_props.get('email', 'N/A')
            hs_phone = hs_props.get('phone') or hs_props.get('mobilephone', 'N/A')
            
            print(f"   ✅ TROVATO in HubSpot!")
            print(f"      HubSpot ID: {hs_id}")
            print(f"      HubSpot Email: {hs_email}")
            print(f"      HubSpot Phone: {hs_phone}")
            
            # Aggiorna il lead
            if update_lead_hubspot_id(lead_id, hs_id):
                print(f"      ✅ Aggiornato!")
                updated += 1
                results['matched'].append({
                    'lead_id': lead_id,
                    'name': f"{nome} {cognome}",
                    'hubspot_id': hs_id,
                    'status': 'updated'
                })
            else:
                print(f"      ❌ Errore aggiornamento")
                failed += 1
                results['failed'].append({
                    'lead_id': lead_id,
                    'name': f"{nome} {cognome}",
                    'hubspot_id': hs_id,
                    'reason': 'Update API failed'
                })
            
            matched += 1
        else:
            print(f"   ❌ NON TROVATO in HubSpot")
            not_matched += 1
            results['not_matched'].append({
                'lead_id': lead_id,
                'name': f"{nome} {cognome}",
                'email': email,
                'phone': telefono
            })
        
        time.sleep(0.1)
    
    # 4. Report finale
    print("\n" + "=" * 80)
    print("📊 RISULTATI FINALI")
    print("=" * 80)
    print(f"Lead processati:     {len(leads_without_hs)}")
    print(f"✅ Trovati in HS:    {matched} ({matched/len(leads_without_hs)*100:.1f}%)")
    print(f"   - Aggiornati:     {updated}")
    print(f"   - Falliti:        {failed}")
    print(f"❌ Non trovati:      {not_matched} ({not_matched/len(leads_without_hs)*100:.1f}%)")
    
    # Salva report
    with open('global_matching_report.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Report salvato in: global_matching_report.json")
    
    if results['not_matched']:
        print("\n" + "=" * 80)
        print("❌ LEAD NON TROVATI IN HUBSPOT:")
        print("=" * 80)
        for lead in results['not_matched']:
            print(f"- {lead['name']} (ID: {lead['lead_id']})")
            print(f"  Email: {lead['email']}")
            print(f"  Tel: {lead['phone']}")
            print()

if __name__ == '__main__':
    main()
