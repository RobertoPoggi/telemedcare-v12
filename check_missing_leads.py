import json
import requests

# Leggi lead da Excel
with open('ottavia_leads_from_excel.json', 'r', encoding='utf-8') as f:
    excel_leads = json.load(f)

# Scarica lead da TeleMedCare
response = requests.get('https://telemedcare-v12.pages.dev/api/leads')
db_leads = response.json()['leads']

print("🔍 Verifica Lead Mancanti su TeleMedCare")
print("=" * 80)
print()
print(f"📊 Lead nel file Excel: {len(excel_leads)}")
print(f"📊 Lead nel database: {len(db_leads)}")
print()

# Crea set di email e telefoni nel database (normalizzati)
db_emails = set()
db_phones = set()

for lead in db_leads:
    if lead.get('email'):
        db_emails.add(lead['email'].lower().strip())
    if lead.get('telefono'):
        # Normalizza telefono
        phone = lead['telefono'].replace('-', '').replace(' ', '').replace('+39', '')
        db_phones.add(phone)

# Verifica quali lead Excel non sono nel DB
missing_leads = []
for lead in excel_leads:
    nome = lead.get('NOME/AZIENDA', '')
    email = lead.get('EMAIL', '').lower().strip()
    telefono = lead.get('TELEFONO', '').replace('-', '').replace(' ', '').replace('+39', '')
    
    # Cerca per email o telefono
    found = False
    if email and email in db_emails:
        found = True
    if telefono and telefono in db_phones:
        found = True
    
    if not found:
        missing_leads.append(lead)

print(f"❌ Lead MANCANTI su TeleMedCare: {len(missing_leads)}")
print()

if missing_leads:
    print("📋 Lead da cercare su HubSpot:")
    print("-" * 80)
    for i, lead in enumerate(missing_leads, 1):
        nome = lead.get('NOME/AZIENDA', '')
        telefono = lead.get('TELEFONO', 'N/A')
        email = lead.get('EMAIL', 'N/A')
        print(f"{i}. {nome}")
        print(f"   Email: {email}")
        print(f"   Tel: {telefono}")
        print()
    
    # Salva lead mancanti
    with open('missing_leads_to_import.json', 'w', encoding='utf-8') as f:
        json.dump(missing_leads, f, indent=2, ensure_ascii=False, default=str)
    
    print("✅ Lead mancanti salvati in: missing_leads_to_import.json")
else:
    print("✅ Tutti i lead del file Excel sono già presenti su TeleMedCare")

