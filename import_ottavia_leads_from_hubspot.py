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

# Pulisco i dati
df = df.dropna(subset=['NOME/AZIENDA'])
df = df[df['NOME/AZIENDA'].str.strip() != '']
df = df[~df['NOME/AZIENDA'].str.contains('esempio', case=False, na=False)]

print(f"✅ Trovati {len(df)} lead nel file Excel")
print()

# 2. Recupero i lead esistenti su TeleMedCare
print("📊 Recupero lead esistenti su TeleMedCare...")
response = requests.get(f"{API_URL}/api/leads")
existing_leads = response.json()['leads']
print(f"✅ Trovati {len(existing_leads)} lead esistenti")
print()

# Creo set di email e telefoni esistenti per confronto veloce
existing_emails = {lead.get('email', '').lower().strip() for lead in existing_leads if lead.get('email')}
existing_phones = {lead.get('telefono', '').replace(' ', '').replace('-', '').replace('+39', '') 
                   for lead in existing_leads if lead.get('telefono')}

# 3. Per ogni lead nel file Excel, cerco su HubSpot
imported = []
skipped = []
errors = []

for idx, row in df.iterrows():
    nome = str(row['NOME/AZIENDA']).strip()
    email = str(row.get('EMAIL', '')).strip() if pd.notna(row.get('EMAIL')) else ''
    telefono = str(row.get('TELEFONO', '')).strip() if pd.notna(row.get('TELEFONO')) else ''
    
    # Pulisco il telefono
    if telefono:
        telefono = str(telefono).replace(' ', '').replace('-', '').replace('.', '')
        if telefono.startswith('39'):
            telefono = '+' + telefono
        elif not telefono.startswith('+'):
            telefono = '+39' + telefono
    
    print(f"🔍 [{idx+1}/{len(df)}] Cerco '{nome}'...")
    print(f"   Email: {email if email else 'N/A'}")
    print(f"   Telefono: {telefono if telefono else 'N/A'}")
    
    # Verifico se esiste già su TeleMedCare
    email_exists = email.lower() in existing_emails if email else False
    phone_clean = telefono.replace(' ', '').replace('-', '').replace('+39', '') if telefono else ''
    phone_exists = phone_clean in existing_phones if phone_clean else False
    
    if email_exists or phone_exists:
        print(f"   ⏭️  SKIP - Lead già presente su TeleMedCare")
        skipped.append({'nome': nome, 'motivo': 'Già presente'})
        print()
        continue
    
    # Cerco su HubSpot (SENZA filtro eCura)
    try:
        search_data = {
            'onlyEcura': False  # IMPORTANTE: senza filtro eCura come richiesto
        }
        
        if email and '@' in email and not 'placeholder' in email.lower():
            search_data['email'] = email
        
        if telefono:
            search_data['phone'] = telefono
        
        print(f"   🔎 Cerco su HubSpot (senza filtro eCura)...")
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
                
                print(f"   ✅ TROVATO su HubSpot: ID {hubspot_id}")
                
                # Importo il lead da HubSpot
                print(f"   📥 Importo il lead su TeleMedCare...")
                
                import_response = requests.post(
                    f"{API_URL}/api/hubspot/import-single",
                    json={
                        'hubspotId': hubspot_id,
                        'onlyEcura': False  # Importo anche se non è eCura
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
                            'lead_id': lead_id
                        })
                    else:
                        error_msg = result.get('error', 'Errore sconosciuto')
                        print(f"   ❌ Errore importazione: {error_msg}")
                        errors.append({'nome': nome, 'errore': error_msg})
                else:
                    print(f"   ❌ Errore HTTP {import_response.status_code}")
                    errors.append({'nome': nome, 'errore': f'HTTP {import_response.status_code}'})
            else:
                print(f"   ❌ NON TROVATO su HubSpot")
                
                # Provo ricerca alternativa per nome/cognome
                if ' ' in nome:
                    parts = nome.split()
                    if len(parts) >= 2:
                        print(f"   🔄 Provo ricerca per nome/cognome...")
                        search_name = {
                            'firstName': parts[0],
                            'lastName': ' '.join(parts[1:]),
                            'onlyEcura': False
                        }
                        
                        hs_response2 = requests.post(
                            f"{API_URL}/api/hubspot/search",
                            json=search_name,
                            timeout=30
                        )
                        
                        if hs_response2.status_code == 200 and hs_response2.json().get('contacts'):
                            contact2 = hs_response2.json()['contacts'][0]
                            hubspot_id2 = contact2.get('id')
                            print(f"   ✅ TROVATO per nome/cognome: ID {hubspot_id2}")
                            
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
                                    'lead_id': lead_id2
                                })
                            else:
                                errors.append({'nome': nome, 'errore': 'Non trovato su HubSpot'})
                        else:
                            errors.append({'nome': nome, 'errore': 'Non trovato su HubSpot'})
                else:
                    errors.append({'nome': nome, 'errore': 'Non trovato su HubSpot'})
        else:
            print(f"   ❌ Errore ricerca HubSpot: HTTP {hs_response.status_code}")
            errors.append({'nome': nome, 'errore': f'HTTP {hs_response.status_code}'})
    
    except Exception as e:
        print(f"   ❌ ERRORE: {str(e)}")
        errors.append({'nome': nome, 'errore': str(e)})
    
    print()
    time.sleep(0.5)  # Pausa per non sovraccaricare API

# 4. Report finale
print()
print("="*80)
print("📊 REPORT FINALE IMPORTAZIONE")
print("="*80)
print()
print(f"✅ Lead importati: {len(imported)}")
if imported:
    for lead in imported:
        print(f"   • {lead['nome']} (HubSpot ID: {lead['hubspot_id']}) → {lead['lead_id']}")

print()
print(f"⏭️  Lead skippati (già presenti): {len(skipped)}")
if skipped:
    for lead in skipped[:5]:
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

