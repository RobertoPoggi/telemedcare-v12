#!/usr/bin/env python3
import json
import requests
import time
import pandas as pd
from datetime import datetime

API_URL = "https://telemedcare-v12.pages.dev"

print("🔄 IMPORTAZIONE LEAD DI OTTAVIA DA HUBSPOT")
print("="*80)
print()

# 1. Leggo il file Excel di Ottavia
print("📄 Leggo il file Excel di Ottavia...")
excel_file = "/home/user/uploaded_files/REPORT_SETTIMANALE_Ottavia_TEMPLATE.xlsx"
df_raw = pd.read_excel(excel_file, sheet_name="Appuntamenti Fissati")

# La riga 1 contiene gli header veri
headers = df_raw.iloc[1].tolist()
df = pd.DataFrame(df_raw.values[2:], columns=headers)

# Pulisco i dati
df = df.dropna(subset=['NOME/AZIENDA'])
df = df[df['NOME/AZIENDA'].astype(str).str.strip() != '']
df = df[df['NOME/AZIENDA'].astype(str).str.strip() != 'nan']

print(f"✅ Trovati {len(df)} lead nel file Excel")
print()

# Stampo i lead trovati
print("Lead nel file Excel:")
for idx, row in df.iterrows():
    nome = str(row['NOME/AZIENDA']).strip()
    email = str(row.get('EMAIL', '')).strip() if pd.notna(row.get('EMAIL')) else ''
    telefono = str(row.get('TELEFONO', '')).strip() if pd.notna(row.get('TELEFONO')) else ''
    print(f"  {idx-1}. {nome} - {email} - {telefono}")
print()

# 2. Recupero i lead esistenti su TeleMedCare
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

# 3. Per ogni lead nel file Excel, cerco su HubSpot
imported = []
skipped = []
errors = []

counter = 0
for idx, row in df.iterrows():
    counter += 1
    nome = str(row['NOME/AZIENDA']).strip()
    email_raw = str(row.get('EMAIL', '')).strip() if pd.notna(row.get('EMAIL')) else ''
    telefono_raw = str(row.get('TELEFONO', '')).strip() if pd.notna(row.get('TELEFONO')) else ''
    
    # Pulisco email
    email = email_raw.replace('\n', '').replace(' ', '').strip() if email_raw else ''
    
    # Pulisco telefono
    telefono = ''
    if telefono_raw and telefono_raw != 'nan':
        telefono = str(telefono_raw).replace(' ', '').replace('-', '').replace('.', '').replace(',', '')
        if '.' in telefono:
            telefono = telefono.split('.')[0]
        
        if telefono and not telefono.startswith('+'):
            if telefono.startswith('39') and len(telefono) > 10:
                telefono = '+' + telefono
            else:
                telefono = '+39' + telefono
    
    print(f"🔍 [{counter}/{len(df)}] Cerco '{nome}'...")
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
        
        if telefono:
            search_data['phone'] = telefono
        elif email and '@' in email:
            search_data['email'] = email
        
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
                hs_name = f"{props.get('firstname', '')} {props.get('lastname', '')}".strip()
                
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
                # Provo per nome/cognome
                if ' ' in nome:
                    parts = nome.split(maxsplit=1)
                    print(f"   🔄 Provo con nome/cognome: {parts[0]} {parts[1]}...")
                    
                    hs_response2 = requests.post(
                        f"{API_URL}/api/hubspot/search",
                        json={'firstName': parts[0], 'lastName': parts[1], 'onlyEcura': False},
                        timeout=30
                    )
                    
                    if hs_response2.status_code == 200:
                        contacts2 = hs_response2.json().get('contacts', [])
                        if contacts2:
                            contact2 = contacts2[0]
                            hubspot_id2 = contact2.get('id')
                            props2 = contact2.get('properties', {})
                            hs_name2 = f"{props2.get('firstname', '')} {props2.get('lastname', '')}".strip()
                            
                            print(f"   ✅ TROVATO: ID {hubspot_id2} - {hs_name2}")
                            
                            import_response2 = requests.post(
                                f"{API_URL}/api/hubspot/import-single",
                                json={'hubspotId': hubspot_id2, 'onlyEcura': False},
                                timeout=30
                            )
                            
                            if import_response2.status_code == 200 and import_response2.json().get('success'):
                                lead_id2 = import_response2.json().get('leadId')
                                print(f"   ✅ IMPORTATO: {lead_id2}")
                                imported.append({
                                    'nome': nome,
                                    'hubspot_id': hubspot_id2,
                                    'hubspot_name': hs_name2,
                                    'lead_id': lead_id2
                                })
                            else:
                                errors.append({'nome': nome, 'errore': 'Errore importazione'})
                        else:
                            print(f"   ❌ Non trovato")
                            errors.append({'nome': nome, 'errore': 'Non trovato su HubSpot'})
                else:
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
print("📊 REPORT FINALE")
print("="*80)
print()
print(f"✅ Importati: {len(imported)}")
for lead in imported:
    print(f"   • {lead['nome']} → {lead['lead_id']} (HS: {lead['hubspot_id']})")

print()
print(f"⏭️  Skippati: {len(skipped)}")
for lead in skipped:
    print(f"   • {lead['nome']}")

print()
print(f"❌ Errori: {len(errors)}")
for err in errors:
    print(f"   • {err['nome']}: {err['errore']}")

# Salvo
with open('ottavia_import_report.json', 'w') as f:
    json.dump({
        'imported': imported,
        'skipped': skipped,
        'errors': errors,
        'timestamp': datetime.now().isoformat()
    }, f, indent=2)

print()
print("✅ Report salvato in ottavia_import_report.json")

