#!/usr/bin/env python3
import json
import requests

API_URL = "https://telemedcare-v12.pages.dev"

# Carico i 17 lead non presenti su HubSpot
with open('tracker_leads_missing_from_hubspot.json', 'r') as f:
    missing_from_hubspot = json.load(f)

print(f"📊 Lead NON su HubSpot: {len(missing_from_hubspot)}")
print()

# Recupero tutti i lead esistenti su TeleMedCare
print("🔄 Recupero lead da TeleMedCare...")
response = requests.get(f"{API_URL}/api/leads")
existing_leads = response.json()['leads']
print(f"✅ Trovati {len(existing_leads)} lead esistenti")
print()

# Creo indice per nome, email e telefono
existing_names = set()
existing_emails = set()
existing_phones = set()

for lead in existing_leads:
    # Nome completo
    nome_r = (lead.get('nomeRichiedente') or '').strip().lower()
    cognome_r = (lead.get('cognomeRichiedente') or '').strip().lower()
    if nome_r and cognome_r:
        existing_names.add(f"{nome_r} {cognome_r}")
    if nome_r:
        existing_names.add(nome_r)
    
    # Email
    if lead.get('email'):
        existing_emails.add(lead['email'].lower().strip())
    
    # Telefono
    if lead.get('telefono'):
        phone = lead['telefono'].replace(' ', '').replace('-', '').replace('+39', '').replace('+', '')
        existing_phones.add(phone)

print(f"📊 Indice TeleMedCare: {len(existing_names)} nomi, {len(existing_emails)} email, {len(existing_phones)} telefoni")
print()

# Filtro i lead NON presenti su TeleMedCare
truly_missing = []
already_on_telemedcare = []

for lead in missing_from_hubspot:
    nome = lead['nome'].strip().lower()
    contatto = lead['contatto'].strip()
    
    found = False
    where_found = []
    
    # Verifica per nome
    if nome in existing_names:
        found = True
        where_found.append('nome')
    
    # Verifica per email
    if '@' in contatto:
        if contatto.lower() in existing_emails:
            found = True
            where_found.append('email')
    else:
        # Telefono
        phone_clean = contatto.replace(' ', '').replace('-', '').replace('+39', '').replace('+', '').replace('.', '')
        if phone_clean and phone_clean in existing_phones:
            found = True
            where_found.append('telefono')
    
    if found:
        already_on_telemedcare.append({
            'nome': lead['nome'],
            'contatto': contatto,
            'row': lead['row'],
            'trovato_per': where_found
        })
    else:
        truly_missing.append(lead)

# Report
print("="*80)
print("✅ LEAD GIÀ PRESENTI SU TELEMEDCARE")
print("="*80)
print()
print(f"📊 Totale: {len(already_on_telemedcare)}/17")
print()

if already_on_telemedcare:
    for idx, lead in enumerate(already_on_telemedcare, 1):
        match_info = ', '.join(lead['trovato_per'])
        print(f"{idx:2d}. {lead['nome']:<35} | {lead['contatto']:<30} | Match: {match_info}")

print()
print("="*80)
print("❌ LEAD VERAMENTE MANCANTI (non su HubSpot E non su TeleMedCare)")
print("="*80)
print()
print(f"📊 Totale: {len(truly_missing)}/17")
print()

if truly_missing:
    for idx, lead in enumerate(truly_missing, 1):
        print(f"{idx:2d}. {lead['nome']:<35} | {lead['contatto']:<30} | Riga Excel: {lead['row']}")
else:
    print("✅ Tutti i lead sono già presenti su TeleMedCare!")

# Salvo
with open('truly_missing_leads.json', 'w') as f:
    json.dump({
        'already_on_telemedcare': already_on_telemedcare,
        'truly_missing': truly_missing
    }, f, indent=2)

print()
print("✅ Report salvato in truly_missing_leads.json")
print()
print(f"📊 RIEPILOGO:")
print(f"   • Non su HubSpot: 17")
print(f"   • Già su TeleMedCare: {len(already_on_telemedcare)}")
print(f"   • VERAMENTE mancanti: {len(truly_missing)}")

