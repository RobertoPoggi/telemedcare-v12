import requests
import json
import time
from typing import List, Dict, Optional
import re

API_BASE = "https://telemedcare-v12.pages.dev/api"

def normalize_phone(phone: str) -> List[str]:
    """Normalizza telefono e genera tutte le varianti possibili."""
    if not phone:
        return []
    
    # Rimuovi tutto tranne i numeri
    clean = ''.join(c for c in phone if c.isdigit())
    
    variants = set()
    
    # Variante pulita
    if clean:
        variants.add(clean)
    
    # Rimuovi prefisso 39
    if clean.startswith('39') and len(clean) > 10:
        without_prefix = clean[2:]
        variants.add(without_prefix)
    
    # Aggiungi prefisso 39 se non c'è
    if not clean.startswith('39') and len(clean) == 10:
        variants.add('39' + clean)
    
    # Aggiungi +39
    if not phone.startswith('+'):
        variants.add('+39' + clean[-10:] if len(clean) >= 10 else '+39' + clean)
    
    return list(variants)

def normalize_email(email: str) -> str:
    """Normalizza email."""
    if not email or email == 'N/A':
        return ''
    return email.strip().lower()

def normalize_name(name: str) -> str:
    """Normalizza nome/cognome."""
    if not name:
        return ''
    # Lowercase, rimuovi accenti, spazi multipli
    name = name.lower().strip()
    name = re.sub(r'\s+', ' ', name)
    return name

def get_all_leads_without_hubspot():
    """Scarica tutti i lead senza external_source_id."""
    print("📥 Scaricamento lead senza HubSpot ID...")
    response = requests.get(f"{API_BASE}/leads?limit=500")
    if response.status_code != 200:
        print(f"❌ Errore: {response.status_code}")
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
        
        if external_id or full_name in excluded_names:
            continue
            
        leads_without_hs.append(lead)
    
    print(f"✅ {len(leads_without_hs)} lead da processare\n")
    return leads_without_hs

def get_all_hubspot_contacts():
    """Scarica TUTTI i contatti HubSpot."""
    print("📥 Scaricamento contatti HubSpot...")
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
        print(f" +{len(contacts)}")
        
        paging = data.get('paging', {})
        after = paging.get('next', {}).get('after')
        
        if not after:
            break
        
        page += 1
        time.sleep(0.2)
    
    print(f"✅ {len(all_contacts)} contatti HubSpot\n")
    return all_contacts

def search_by_lastname(lead: Dict, contacts: List[Dict]) -> Optional[Dict]:
    """STRATEGIA 1: Ricerca per COGNOME."""
    cognome = (lead.get('cognomeRichiedente') or '').strip().lower()
    if not cognome or len(cognome) < 3:
        return None
    
    matches = []
    for contact in contacts:
        props = contact.get('properties', {})
        hs_lastname = (props.get('lastname') or '').strip().lower()
        
        if hs_lastname == cognome:
            matches.append(contact)
    
    if len(matches) == 1:
        return matches[0]
    
    # Se ci sono più match, prova a disambiguare con nome
    if len(matches) > 1:
        nome = (lead.get('nomeRichiedente') or '').strip().lower()
        for contact in matches:
            props = contact.get('properties', {})
            hs_firstname = (props.get('firstname') or '').strip().lower()
            if nome and hs_firstname and nome in hs_firstname or hs_firstname in nome:
                return contact
        # Ritorna il primo se non si può disambiguare
        return matches[0]
    
    return None

def search_by_email(lead: Dict, contacts: List[Dict]) -> Optional[Dict]:
    """STRATEGIA 2: Ricerca per EMAIL."""
    email = normalize_email(lead.get('email') or lead.get('emailRichiedente') or '')
    if not email or email == 'n/a':
        return None
    
    for contact in contacts:
        props = contact.get('properties', {})
        hs_email = normalize_email(props.get('email') or '')
        
        if email == hs_email:
            return contact
    
    return None

def search_by_phone(lead: Dict, contacts: List[Dict]) -> Optional[Dict]:
    """STRATEGIA 3: Ricerca per TELEFONO (tutte le varianti)."""
    phone = lead.get('telefono') or lead.get('telefonoRichiedente') or ''
    phone_variants = normalize_phone(phone)
    
    if not phone_variants:
        return None
    
    for contact in contacts:
        props = contact.get('properties', {})
        hs_phone = props.get('phone') or props.get('mobilephone') or ''
        hs_variants = normalize_phone(hs_phone)
        
        # Cerca intersezione tra varianti
        for pv in phone_variants:
            for hv in hs_variants:
                if pv == hv or pv in hv or hv in pv:
                    return contact
    
    return None

def update_lead_hubspot_id(lead_id: str, hubspot_id: str) -> bool:
    """Aggiorna external_source_id."""
    url = f"{API_BASE}/leads/{lead_id}"
    payload = {'external_source_id': hubspot_id}
    response = requests.put(url, json=payload)
    return response.status_code == 200

def main():
    print("=" * 80)
    print("🔥 MATCHING AGGRESSIVO HUBSPOT - 3 STRATEGIE")
    print("=" * 80)
    print()
    
    # 1. Carica dati
    leads = get_all_leads_without_hubspot()
    if not leads:
        print("✅ Tutti i lead hanno HubSpot ID!")
        return
    
    contacts = get_all_hubspot_contacts()
    if not contacts:
        print("❌ Nessun contatto HubSpot!")
        return
    
    # 2. Matching con 3 strategie
    results = {
        'by_lastname': {'matched': [], 'updated': 0, 'failed': 0},
        'by_email': {'matched': [], 'updated': 0, 'failed': 0},
        'by_phone': {'matched': [], 'updated': 0, 'failed': 0},
        'not_found': []
    }
    
    print("=" * 80)
    print("🔍 FASE 1: RICERCA PER COGNOME")
    print("=" * 80)
    
    remaining_leads = []
    for i, lead in enumerate(leads, 1):
        lead_id = lead.get('id', 'N/A')
        nome = lead.get('nomeRichiedente') or ''
        cognome = lead.get('cognomeRichiedente') or ''
        
        print(f"\n[{i}/{len(leads)}] {nome} {cognome} (ID: {lead_id})")
        
        contact = search_by_lastname(lead, contacts)
        
        if contact:
            hs_id = contact['id']
            hs_props = contact.get('properties', {})
            print(f"   ✅ TROVATO per COGNOME!")
            print(f"      HubSpot ID: {hs_id}")
            print(f"      HubSpot: {hs_props.get('firstname', 'N/A')} {hs_props.get('lastname', 'N/A')}")
            
            if update_lead_hubspot_id(lead_id, hs_id):
                print(f"      ✅ Aggiornato!")
                results['by_lastname']['updated'] += 1
                results['by_lastname']['matched'].append({
                    'lead_id': lead_id,
                    'name': f"{nome} {cognome}",
                    'hubspot_id': hs_id
                })
            else:
                print(f"      ❌ Errore aggiornamento")
                results['by_lastname']['failed'] += 1
        else:
            print(f"   ⏭️  Non trovato per cognome")
            remaining_leads.append(lead)
        
        time.sleep(0.05)
    
    print("\n" + "=" * 80)
    print("🔍 FASE 2: RICERCA PER EMAIL (lead rimanenti)")
    print("=" * 80)
    
    remaining_leads_2 = []
    for i, lead in enumerate(remaining_leads, 1):
        lead_id = lead.get('id', 'N/A')
        nome = lead.get('nomeRichiedente') or ''
        cognome = lead.get('cognomeRichiedente') or ''
        email = lead.get('email') or lead.get('emailRichiedente') or 'N/A'
        
        print(f"\n[{i}/{len(remaining_leads)}] {nome} {cognome}")
        print(f"   Email: {email}")
        
        contact = search_by_email(lead, contacts)
        
        if contact:
            hs_id = contact['id']
            hs_props = contact.get('properties', {})
            print(f"   ✅ TROVATO per EMAIL!")
            print(f"      HubSpot ID: {hs_id}")
            print(f"      HubSpot: {hs_props.get('email', 'N/A')}")
            
            if update_lead_hubspot_id(lead_id, hs_id):
                print(f"      ✅ Aggiornato!")
                results['by_email']['updated'] += 1
                results['by_email']['matched'].append({
                    'lead_id': lead_id,
                    'name': f"{nome} {cognome}",
                    'hubspot_id': hs_id
                })
            else:
                print(f"      ❌ Errore aggiornamento")
                results['by_email']['failed'] += 1
        else:
            print(f"   ⏭️  Non trovato per email")
            remaining_leads_2.append(lead)
        
        time.sleep(0.05)
    
    print("\n" + "=" * 80)
    print("🔍 FASE 3: RICERCA PER TELEFONO (lead rimanenti)")
    print("=" * 80)
    
    for i, lead in enumerate(remaining_leads_2, 1):
        lead_id = lead.get('id', 'N/A')
        nome = lead.get('nomeRichiedente') or ''
        cognome = lead.get('cognomeRichiedente') or ''
        phone = lead.get('telefono') or lead.get('telefonoRichiedente') or 'N/A'
        
        print(f"\n[{i}/{len(remaining_leads_2)}] {nome} {cognome}")
        print(f"   Tel: {phone}")
        
        contact = search_by_phone(lead, contacts)
        
        if contact:
            hs_id = contact['id']
            hs_props = contact.get('properties', {})
            print(f"   ✅ TROVATO per TELEFONO!")
            print(f"      HubSpot ID: {hs_id}")
            print(f"      HubSpot: {hs_props.get('phone', 'N/A')}")
            
            if update_lead_hubspot_id(lead_id, hs_id):
                print(f"      ✅ Aggiornato!")
                results['by_phone']['updated'] += 1
                results['by_phone']['matched'].append({
                    'lead_id': lead_id,
                    'name': f"{nome} {cognome}",
                    'hubspot_id': hs_id
                })
            else:
                print(f"      ❌ Errore aggiornamento")
                results['by_phone']['failed'] += 1
        else:
            print(f"   ❌ NON TROVATO")
            results['not_found'].append({
                'lead_id': lead_id,
                'name': f"{nome} {cognome}",
                'email': lead.get('email') or lead.get('emailRichiedente') or 'N/A',
                'phone': phone
            })
        
        time.sleep(0.05)
    
    # Report finale
    print("\n" + "=" * 80)
    print("📊 REPORT FINALE - 3 STRATEGIE")
    print("=" * 80)
    
    total_matched = (results['by_lastname']['updated'] + 
                     results['by_email']['updated'] + 
                     results['by_phone']['updated'])
    total_not_found = len(results['not_found'])
    total_processed = len(leads)
    
    print(f"\n🎯 TOTALI:")
    print(f"   Lead processati:       {total_processed}")
    print(f"   ✅ Trovati e aggiornati: {total_matched} ({total_matched/total_processed*100:.1f}%)")
    print(f"   ❌ Non trovati:          {total_not_found} ({total_not_found/total_processed*100:.1f}%)")
    
    print(f"\n📈 DETTAGLIO PER STRATEGIA:")
    print(f"   🔤 Per COGNOME:  {results['by_lastname']['updated']} aggiornati")
    print(f"   ✉️  Per EMAIL:    {results['by_email']['updated']} aggiornati")
    print(f"   📞 Per TELEFONO: {results['by_phone']['updated']} aggiornati")
    
    # Salva report
    with open('aggressive_matching_report.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Report salvato: aggressive_matching_report.json")
    
    if results['not_found']:
        print("\n" + "=" * 80)
        print(f"❌ LEAD NON TROVATI ({len(results['not_found'])}):")
        print("=" * 80)
        for lead in results['not_found']:
            print(f"- {lead['name']} (ID: {lead['lead_id']})")
            print(f"  Email: {lead['email']}")
            print(f"  Tel: {lead['phone']}")
            print()

if __name__ == '__main__':
    main()
