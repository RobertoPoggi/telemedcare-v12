#!/usr/bin/env python3
import json
import requests
import time
import pandas as pd
from datetime import datetime

API_URL = "https://telemedcare-v12.pages.dev"

print("🔄 IMPORTAZIONE LEAD DA 'Tracker Giornaliero'")
print("="*80)
print()

# Leggo il foglio "Tracker Giornaliero"
print("📄 Leggo il foglio Excel...")
excel_file = "/home/user/uploaded_files/REPORT_SETTIMANALE_Ottavia_TEMPLATE.xlsx"
df_raw = pd.read_excel(excel_file, sheet_name="Tracker Giornaliero")

# La riga 3 contiene gli header
headers = df_raw.iloc[3].tolist()
# Prendo i dati dalla riga 9 in poi (salto esempi righe 4,5,6 e riga vuota 7,8)
df = pd.DataFrame(df_raw.values[9:], columns=headers)

# Pulisco i dati
df = df.dropna(subset=['NOME/AZIENDA'])
df = df[df['NOME/AZIENDA'].astype(str).str.strip() != '']
df = df[df['NOME/AZIENDA'].astype(str).str.strip().str.lower() != 'nan']

print(f"✅ Trovati {len(df)} lead nel Tracker Giornaliero")
print()

# Stampo i primi 15 lead
print("Lead trovati (primi 15):")
for idx in range(min(15, len(df))):
    row = df.iloc[idx]
    nome = str(row['NOME/AZIENDA']).strip()
    contatto = str(row.get('CONTATTO', '')).strip() if pd.notna(row.get('CONTATTO')) else ''
    print(f"  {idx+1}. {nome} - {contatto}")
print()

if len(df) > 15:
    print(f"... e altri {len(df)-15} lead")
    print()

# Recupero i lead esistenti su TeleMedCare
print("📊 Recupero lead esistenti su TeleMedCare...")
response = requests.get(f"{API_URL}/api/leads")
existing_leads = response.json()['leads']
print(f"✅ Trovati {len(existing_leads)} lead esistenti")
print()

# Creo set per confronto
existing_emails = set()
existing_phones = set()
existing_names = set()

for lead in existing_leads:
    if lead.get('email'):
        existing_emails.add(lead['email'].lower().strip())
    if lead.get('telefono'):
        phone = lead['telefono'].replace(' ', '').replace('-', '').replace('+39', '').replace('+', '')
        existing_phones.add(phone)
    
    nome_r = (lead.get('nomeRichiedente') or '').strip()
    cognome_r = (lead.get('cognomeRichiedente') or '').strip()
    if nome_r and cognome_r:
        existing_names.add(f"{nome_r} {cognome_r}".lower())
    if nome_r:  # Solo nome
        existing_names.add(nome_r.lower())

# Per ogni lead nel Tracker, cerco su HubSpot
imported = []
skipped = []
errors = []

for idx in range(len(df)):
    row = df.iloc[idx]
    nome = str(row['NOME/AZIENDA']).strip()
    contatto_raw = str(row.get('CONTATTO', '')).strip() if pd.notna(row.get('CONTATTO')) else ''
    
    # Determino se il contatto è email o telefono
    email = ''
    telefono = ''
    
    if '@' in contatto_raw:
        email = contatto_raw.replace('\n', '').replace(' ', '').strip()
    else:
        telefono = contatto_raw.replace(' ', '').replace('-', '').replace('.', '').replace(',', '')
        if '.' in telefono:
            telefono = telefono.split('.')[0]
        
        if telefono and not telefono.startswith('+'):
            if telefono.startswith('39') and len(telefono) > 10:
                telefono = '+' + telefono
            elif telefono and len(telefono) >= 9:
                telefono = '+39' + telefono
    
    print(f"🔍 [{idx+1}/{len(df)}] Cerco '{nome}'...")
    print(f"   Email: {email if email else 'N/A'}")
    print(f"   Telefono: {telefono if telefono else 'N/A'}")
    
    # Verifico se esiste già
    email_exists = email.lower() in existing_emails if email else False
    phone_clean = telefono.replace('+39', '').replace('+', '') if telefono else ''
    phone_exists = phone_clean in existing_phones if phone_clean else False
    name_exists = nome.lower() in existing_names
    
    if email_exists or phone_exists or name_exists:
        print(f"   ⏭️  SKIP - Lead già presente su TeleMedCare")
        skipped.append({'nome': nome, 'motivo': 'Già presente'})
        print()
        continue
    
    # Cerco su HubSpot
    try:
        search_data = {'onlyEcura': False}
        
        if email and '@' in email:
            search_data['email'] = email
        elif telefono:
            search_data['phone'] = telefono
        
        if not email and not telefono:
            print(f"   ⚠️  SKIP - Nessun contatto valido")
            skipped.append({'nome': nome, 'motivo': 'Nessun contatto'})
            print()
            continue
        
        print(f"   🔎 Cerco su HubSpot...")
        
        hs_response = requests.post(
            f"{API_URL}/api/hubspot/search",
            json=search_data,
            timeout=30
        )
        
        if hs_response.status_code == 200:
            hs_data = hs_response.json()
            contacts = hs_data.get('contacts', [])
            
            if contacts:
                contact = contacts[0]
                hubspot_id = contact.get('id')
                props = contact.get('properties', {})
                hs_nome = props.get('firstname', '')
                hs_cognome = props.get('lastname', '')
                hs_name = f"{hs_nome} {hs_cognome}".strip()
                
                print(f"   ✅ TROVATO su HubSpot: ID {hubspot_id} - {hs_name}")
                print(f"   📥 Importo...")
                
                import_response = requests.post(
                    f"{API_URL}/api/hubspot/import-single",
                    json={'hubspotId': hubspot_id, 'onlyEcura': False},
                    timeout=30
                )
                
                if import_response.status_code == 200:
                    result = import_response.json()
                    if result.get('success'):
                        lead_id = result.get('leadId', 'N/A')
                        print(f"   ✅ IMPORTATO: {lead_id}")
                        imported.append({
                            'nome': nome,
                            'hubspot_id': hubspot_id,
                            'hubspot_name': hs_name,
                            'lead_id': lead_id
                        })
                    else:
                        error_msg = result.get('error', 'Errore')
                        print(f"   ❌ Errore: {error_msg}")
                        errors.append({'nome': nome, 'errore': error_msg})
                else:
                    print(f"   ❌ HTTP {import_response.status_code}")
                    errors.append({'nome': nome, 'errore': f'HTTP {import_response.status_code}'})
            else:
                print(f"   ❌ Non trovato su HubSpot")
                errors.append({'nome': nome, 'errore': 'Non trovato'})
        else:
            errors.append({'nome': nome, 'errore': f'HTTP {hs_response.status_code}'})
    
    except Exception as e:
        print(f"   ❌ ERRORE: {str(e)}")
        errors.append({'nome': nome, 'errore': str(e)})
    
    print()
    time.sleep(1)

# Report finale
print("="*80)
print("📊 REPORT FINALE IMPORTAZIONE")
print("="*80)
print()
print(f"✅ Importati: {len(imported)}")
for lead in imported:
    print(f"   • {lead['nome']} → {lead['lead_id']} (HS: {lead['hubspot_id']})")

print()
print(f"⏭️  Skippati: {len(skipped)}")
for lead in skipped[:10]:
    print(f"   • {lead['nome']}")
if len(skipped) > 10:
    print(f"   ... e altri {len(skipped)-10}")

print()
print(f"❌ Errori: {len(errors)}")
for err in errors[:10]:
    print(f"   • {err['nome']}: {err['errore']}")
if len(errors) > 10:
    print(f"   ... e altri {len(errors)-10}")

# Salvo
with open('tracker_import_report.json', 'w') as f:
    json.dump({
        'imported': imported,
        'skipped': skipped,
        'errors': errors,
        'timestamp': datetime.now().isoformat()
    }, f, indent=2)

print()
print("✅ Report salvato in tracker_import_report.json")

