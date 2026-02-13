#!/usr/bin/env python3
import json
import pandas as pd

# Leggo il foglio "Tracker Giornaliero"
excel_file = "/home/user/uploaded_files/REPORT_SETTIMANALE_Ottavia_TEMPLATE.xlsx"
df_raw = pd.read_excel(excel_file, sheet_name="Tracker Giornaliero")

# La riga 3 contiene gli header
headers = df_raw.iloc[3].tolist()
# Prendo i dati dalla riga 9 in poi (salto esempi)
df = pd.DataFrame(df_raw.values[9:], columns=headers)

# Pulisco i dati
df = df.dropna(subset=['NOME/AZIENDA'])
df = df[df['NOME/AZIENDA'].astype(str).str.strip() != '']
df = df[df['NOME/AZIENDA'].astype(str).str.strip().str.lower() != 'nan']

print(f"📊 Trovati {len(df)} lead nel Tracker Giornaliero")
print()

# Carico l'indice HubSpot dal report precedente
with open('12_leads_recovery_report.json', 'r') as f:
    report = json.load(f)

print(f"📊 HubSpot: {report['total_hubspot_contacts']} contatti totali")
print()

# Creo set dei nomi su HubSpot (già ho l'indice nel report precedente)
# Devo ricreare l'indice
print("🔄 Ricreo indice HubSpot...")

import requests
import time

API_URL = "https://telemedcare-v12.pages.dev"

all_hubspot_contacts = []
after = None

while True:
    url = f"{API_URL}/api/hubspot/contacts?limit=100"
    if after:
        url += f"&after={after}"
    
    response = requests.get(url, timeout=60)
    if response.status_code != 200:
        break
    
    data = response.json()
    all_hubspot_contacts.extend(data.get('contacts', []))
    
    paging = data.get('paging', {})
    if not paging.get('next'):
        break
    after = paging['next'].get('after')
    time.sleep(0.3)

print(f"✅ Recuperati {len(all_hubspot_contacts)} contatti")
print()

# Creo indice per nome+cognome
hubspot_names = set()
for contact in all_hubspot_contacts:
    props = contact.get('properties', {})
    firstname = (props.get('firstname') or '').strip().lower()
    lastname = (props.get('lastname') or '').strip().lower()
    
    if firstname and lastname:
        hubspot_names.add(f"{firstname} {lastname}")
    if firstname:
        hubspot_names.add(firstname)

print(f"📊 Indice HubSpot: {len(hubspot_names)} nomi unici")
print()

# Verifico quali lead del Tracker NON sono su HubSpot
missing_from_hubspot = []

for idx in range(len(df)):
    row = df.iloc[idx]
    nome = str(row['NOME/AZIENDA']).strip()
    contatto = str(row.get('CONTATTO', '')).strip() if pd.notna(row.get('CONTATTO')) else ''
    
    # Normalizzo il nome per il confronto
    nome_normalized = nome.lower()
    
    # Verifico se esiste su HubSpot
    found = False
    
    # Provo prima il nome completo
    if nome_normalized in hubspot_names:
        found = True
    else:
        # Provo solo il primo nome (per casi come "Giuseppe" senza cognome)
        first_name = nome.split()[0].lower() if ' ' in nome else nome_normalized
        if first_name in hubspot_names:
            found = True
    
    if not found:
        missing_from_hubspot.append({
            'nome': nome,
            'contatto': contatto,
            'row': idx + 9  # Numero riga originale nel file Excel
        })

# Report
print("="*80)
print("❌ LEAD DEL TRACKER NON PRESENTI SU HUBSPOT")
print("="*80)
print()
print(f"📊 Totale: {len(missing_from_hubspot)}/{len(df)} lead")
print()

if missing_from_hubspot:
    print("Lista completa:")
    for idx, lead in enumerate(missing_from_hubspot, 1):
        print(f"{idx:3d}. {lead['nome']:<40} | {lead['contatto']:<35} | Riga Excel: {lead['row']}")
else:
    print("✅ Tutti i lead del Tracker sono presenti su HubSpot!")

# Salvo
with open('tracker_leads_missing_from_hubspot.json', 'w') as f:
    json.dump(missing_from_hubspot, f, indent=2)

print()
print("✅ Report salvato in tracker_leads_missing_from_hubspot.json")

