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

# 1. Leggo il file Excel di Ottavia (foglio "Appuntamenti Fissati")
print("📄 Leggo il file Excel di Ottavia...")
excel_file = "/home/user/uploaded_files/REPORT_SETTIMANALE_Ottavia_TEMPLATE.xlsx"
df = pd.read_excel(excel_file, sheet_name="Appuntamenti Fissati", header=1)

# Pulisco i dati - rimuovo righe vuote e esempi
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
    print(f"  {idx+1}. {nome} - {email} - {telefono}")
print()

# 2. Recupero i lead esistenti su TeleMedCare
print("📊 Recupero lead esistenti su TeleMedCare...")
response = requests.get(f"{API_URL}/api/leads")
existing_leads = response.json()['leads']
print(f"✅ Trovati {len(existing_leads)} lead esistenti")
print()

# Creo set di email e telefoni esistenti
existing_emails = set()
existing_phones = set()
existing_names = set()

for lead in existing_leads:
    if lead.get('email'):
        existing_emails.add(lead['email'].lower().strip())
    if lead.get('telefono'):
        phone = lead['telefono'].replace(' ', '').replace('-', '').replace('+39', '').replace('+', '')
        existing_phones.add(phone)
    
    # Nome completo
    nome_r = lead.get('nomeRichiedente', '').strip()
    cognome_r = lead.get('cognomeRichiedente', '').strip()
    if nome_r and cognome_r:
        existing_names.add(f"{nome_r} {cognome_r}".lower())

# 3. Per ogni lead nel file Excel, cerco su HubSpot
imported = []
skipped = []
errors = []

for idx, row in df.iterrows():
    nome = str(row['NOME/AZIENDA']).strip()
    email_raw = str(row.get('EMAIL', '')).strip() if pd.notna(row.get('EMAIL')) else ''
    telefono_raw = str(row.get('TELEFONO', '')).strip() if pd.notna(row.get('TELEFONO')) else ''
    
    # Pulisco email
    email = email_raw.replace('\n', '').replace(' ', '').strip() if email_raw else ''
    
    # Pulisco il telefono
    telefono = ''
    if telefono_raw and telefono_raw != 'nan':
        telefono = str(telefono_raw).replace(' ', '').replace('-', '').replace('.', '').replace(',', '')
        # Rimuovo decimali se presenti (es. 3276246536.0 → 3276246536)
        if '.' in telefono:
            telefono = telefono.split('.')[0]
        
        if telefono and not telefono.startswith('+'):
            if telefono.startswith('39'):
                telefono = '+' + telefono
            else:
                telefono = '+39' + telefono
    
    print(f"🔍 [{idx+1}/{len(df)}] Cerco '{nome}'...")
    print(f"   Email: {email if email else 'N/A'}")
    print(f"   Telefono: {telefono if telefono else 'N/A'}")
    
    # Verifico se esiste già su TeleMedCare
    email_exists = email.lower() in existing_emails if email else False
    phone_clean = telefono.replace('+39', '').replace('+', '') if telefono else ''
    phone_exists = phone_clean in existing_phones if phone_clean else False
    name_exists = nome.lower() in existing_names
    
    if email_exists or phone_exists or name_exists:
        print(f"   ⏭️  SKIP - Lead già presente su TeleMedCare")
        skipped.append({'nome': nome, 'motivo': 'Già presente'})
        print()
        continue
    
    # Cerco su HubSpot (SENZA filtro eCura)
    try:
        # Provo prima con telefono (più affidabile)
        search_data = {'onlyEcura': False}
        
        if telefono:
            search_data['phone'] = telefono
        elif email and '@' in email:
            search_data['email'] = email
        
        print(f"   🔎 Cerco su HubSpot (senza filtro eCura)...")
        print(f"      Parametri ricerca: {search_data}")
        
        hs_response = requests.post(
            f"{API_URL}/api/hubspot/search",
            json=search_data,
            timeout=30
        )
        
        if hs_response.status_code == 200:
            hs_data = hs_response.json()
            contacts = hs_data.get('contacts', [])
            
            if contacts and len(contacts) > 0:
                contact = contacts[0]
                hubspot_id = contact.get('id')
                hs_name = f"{contact.get('properties', {}).get('firstname', '')} {contact.get('properties', {}).get('lastname', '')}".strip()
                
                print(f"   ✅ TROVATO su HubSpot: ID {hubspot_id} - {hs_name}")
                
                # Importo il lead da HubSpot
                print(f"   📥 Importo il lead su TeleMedCare...")
                
                import_response = requests.post(
                    f"{API_URL}/api/hubspot/import-single",
                    json={
                        'hubspotId': hubspot_id,
                        'onlyEcura': False
                    },
                    timeout=30
                )
                
                if import_response.status_code == 200:
                    result = import_response.json()
                    if result.get('success'):
                        lead_id = result.get('leadId', 'N/A')
                        print(f"   ✅ IMPORTATO con successo: {lead_id}")
                        imported.append({
                            'nome': nome,
                            'email': email,
                            'telefono': telefono,
                            'hubspot_id': hubspot_id,
                            'hubspot_name': hs_name,
                            'lead_id': lead_id
                        })
                    else:
                        error_msg = result.get('error', 'Errore sconosciuto')
                        print(f"   ❌ Errore importazione: {error_msg}")
                        errors.append({'nome': nome, 'errore': error_msg})
                else:
                    error_text = import_response.text[:200]
                    print(f"   ❌ Errore HTTP {import_response.status_code}: {error_text}")
                    errors.append({'nome': nome, 'errore': f'HTTP {import_response.status_code}'})
            else:
                print(f"   ⚠️  NON TROVATO con telefono/email")
                
                # Provo ricerca alternativa per nome/cognome
                if ' ' in nome:
                    parts = nome.split(maxsplit=1)
                    if len(parts) >= 2:
                        print(f"   🔄 Provo ricerca per nome/cognome: {parts[0]} {parts[1]}...")
                        search_name = {
                            'firstName': parts[0],
                            'lastName': parts[1],
                            'onlyEcura': False
                        }
                        
                        hs_response2 = requests.post(
                            f"{API_URL}/api/hubspot/search",
                            json=search_name,
                            timeout=30
                        )
                        
                        if hs_response2.status_code == 200:
                            hs_data2 = hs_response2.json()
                            contacts2 = hs_data2.get('contacts', [])
                            
                            if contacts2 and len(contacts2) > 0:
                                contact2 = contacts2[0]
                                hubspot_id2 = contact2.get('id')
                                hs_name2 = f"{contact2.get('properties', {}).get('firstname', '')} {contact2.get('properties', {}).get('lastname', '')}".strip()
                                
                                print(f"   ✅ TROVATO per nome/cognome: ID {hubspot_id2} - {hs_name2}")
                                
                                # Importo
                                import_response2 = requests.post(
                                    f"{API_URL}/api/hubspot/import-single",
                                    json={'hubspotId': hubspot_id2, 'onlyEcura': False},
                                    timeout=30
                                )
                                
                                if import_response2.status_code == 200 and import_response2.json().get('success'):
                                    lead_id2 = import_response2.json().get('leadId', 'N/A')
                                    print(f"   ✅ IMPORTATO: {lead_id2}")
                                    imported.append({
                                        'nome': nome,
                                        'email': email,
                                        'telefono': telefono,
                                        'hubspot_id': hubspot_id2,
                                        'hubspot_name': hs_name2,
                                        'lead_id': lead_id2
                                    })
                                else:
                                    print(f"   ❌ Errore importazione per nome/cognome")
                                    errors.append({'nome': nome, 'errore': 'Trovato su HubSpot ma errore importazione'})
                            else:
                                print(f"   ❌ NON trovato nemmeno per nome/cognome")
                                errors.append({'nome': nome, 'errore': 'Non trovato su HubSpot'})
                        else:
                            print(f"   ❌ Errore ricerca nome/cognome: HTTP {hs_response2.status_code}")
                            errors.append({'nome': nome, 'errore': 'Errore ricerca HubSpot'})
                else:
                    errors.append({'nome': nome, 'errore': 'Non trovato su HubSpot'})
        else:
            print(f"   ❌ Errore ricerca HubSpot: HTTP {hs_response.status_code}")
            errors.append({'nome': nome, 'errore': f'HTTP {hs_response.status_code}'})
    
    except Exception as e:
        print(f"   ❌ ERRORE: {str(e)}")
        errors.append({'nome': nome, 'errore': str(e)})
    
    print()
    time.sleep(1)  # Pausa per non sovraccaricare API

# 4. Report finale
print()
print("="*80)
print("📊 REPORT FINALE IMPORTAZIONE")
print("="*80)
print()
print(f"✅ Lead importati: {len(imported)}")
if imported:
    for lead in imported:
        print(f"   • {lead['nome']} → {lead['lead_id']}")
        print(f"     HubSpot: {lead['hubspot_id']} - {lead['hubspot_name']}")

print()
print(f"⏭️  Lead skippati (già presenti): {len(skipped)}")
if skipped:
    for lead in skipped:
        print(f"   • {lead['nome']}")

print()
print(f"❌ Errori: {len(errors)}")
if errors:
    for err in errors:
        print(f"   • {err['nome']}: {err['errore']}")

print()

# Salvo report
with open('ottavia_import_report.json', 'w') as f:
    json.dump({
        'imported': imported,
        'skipped': skipped,
        'errors': errors,
        'timestamp': datetime.now().isoformat()
    }, f, indent=2)

print("✅ Report salvato in ottavia_import_report.json")

