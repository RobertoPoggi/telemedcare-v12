import requests

API_BASE = "https://telemedcare-v12.pages.dev/api"

# ID HubSpot sbagliato che è stato assegnato in massa
WRONG_HS_ID = "335716903109"

def get_leads_with_wrong_id():
    """Trova tutti i lead con l'ID HubSpot sbagliato."""
    response = requests.get(f"{API_BASE}/leads?limit=500")
    if response.status_code != 200:
        return []
    
    data = response.json()
    leads = data.get('leads', [])
    
    wrong_leads = [l for l in leads if l.get('external_source_id') == WRONG_HS_ID]
    return wrong_leads

def clear_hubspot_id(lead_id):
    """Rimuove l'external_source_id da un lead."""
    url = f"{API_BASE}/leads/{lead_id}"
    payload = {'external_source_id': None}
    response = requests.put(url, json=payload)
    return response.status_code == 200

print("🔍 Cerco lead con HubSpot ID errato (335716903109)...")
wrong_leads = get_leads_with_wrong_id()

print(f"\n❌ Trovati {len(wrong_leads)} lead con ID errato!")
print("\n🔄 Pulizia in corso...\n")

cleaned = 0
for lead in wrong_leads:
    lead_id = lead.get('id')
    nome = lead.get('nomeRichiedente') or ''
    cognome = lead.get('cognomeRichiedente') or ''
    
    print(f"Pulizia: {nome} {cognome} (ID: {lead_id})... ", end='')
    
    if clear_hubspot_id(lead_id):
        print("✅")
        cleaned += 1
    else:
        print("❌")

print(f"\n✅ Puliti {cleaned}/{len(wrong_leads)} lead")
print("🔄 Ora riprova il matching corretto!")
