#!/usr/bin/env python3
import json
import requests
import time
import pandas as pd
from datetime import datetime

API_URL = "https://telemedcare-v12.pages.dev"

print("🔄 IMPORTAZIONE E AGGIORNAMENTO LEAD DA 'Tracker Giornaliero'")
print("="*80)
print()

# Leggo il foglio "Tracker Giornaliero"
print("📄 Leggo il foglio Excel...")
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

print(f"✅ Trovati {len(df)} lead nel Tracker Giornaliero")
print()

# Recupero i lead esistenti su TeleMedCare
print("📊 Recupero lead esistenti su TeleMedCare...")
response = requests.get(f"{API_URL}/api/leads")
existing_leads_data = response.json()['leads']
print(f"✅ Trovati {len(existing_leads_data)} lead esistenti")
print()

# Creo dizionario per ricerca rapida
existing_by_email = {}
existing_by_phone = {}
existing_by_name = {}

for lead in existing_leads_data:
    if lead.get('email'):
        existing_by_email[lead['email'].lower().strip()] = lead
    if lead.get('telefono'):
        phone = lead['telefono'].replace(' ', '').replace('-', '').replace('+39', '').replace('+', '')
        existing_by_phone[phone] = lead
    
    nome_r = (lead.get('nomeRichiedente') or '').strip()
    cognome_r = (lead.get('cognomeRichiedente') or '').strip()
    if nome_r and cognome_r:
        existing_by_name[f"{nome_r} {cognome_r}".lower()] = lead

# Statistiche
updated = []
imported = []
skipped = []
errors = []

for idx in range(len(df)):
    row = df.iloc[idx]
    nome = str(row['NOME/AZIENDA']).strip()
    contatto_raw = str(row.get('CONTATTO', '')).strip() if pd.notna(row.get('CONTATTO')) else ''
    
    # Estraggo email/telefono
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
    
    print(f"🔍 [{idx+1}/{len(df)}] '{nome}' - {email or telefono or 'N/A'}")
    
    # Verifico se esiste già su TeleMedCare
    existing_lead = None
    
    if email and email.lower() in existing_by_email:
        existing_lead = existing_by_email[email.lower()]
    elif telefono:
        phone_clean = telefono.replace('+39', '').replace('+', '')
        if phone_clean in existing_by_phone:
            existing_lead = existing_by_phone[phone_clean]
    
    if not existing_lead and nome.lower() in existing_by_name:
        existing_lead = existing_by_name[nome.lower()]
    
    if existing_lead:
        # LEAD ESISTE - AGGIORNO
        lead_id = existing_lead['id']
        print(f"   📝 Lead esistente: {lead_id}")
        
        try:
            # Cerco su HubSpot per ottenere l'ID
            search_data = {'onlyEcura': False}
            if email and '@' in email:
                search_data['email'] = email
            elif telefono:
                search_data['phone'] = telefono
            
            hs_response = requests.post(
                f"{API_URL}/api/hubspot/search",
                json=search_data,
                timeout=30
            )
            
            hubspot_id = None
            if hs_response.status_code == 200:
                contacts = hs_response.json().get('contacts', [])
                if contacts:
                    hubspot_id = contacts[0].get('id')
            
            # Preparo l'aggiornamento
            update_data = {}
            
            # 1. Aggiungo HubSpot ID se trovato
            if hubspot_id and not existing_lead.get('external_source_id'):
                update_data['external_source_id'] = str(hubspot_id)
                print(f"   + HubSpot ID: {hubspot_id}")
            
            # 2. CM = OB (solo se non valorizzato o non è SR/RP)
            current_cm = existing_lead.get('cm', '').upper()
            if current_cm not in ['SR', 'RP']:
                update_data['cm'] = 'OB'
                print(f"   + CM: OB")
            
            # 3. Aggiorno note/interazioni (se vuote)
            if not existing_lead.get('note') or existing_lead.get('note') == '':
                tipo_attivita = str(row.get('TIPO ATTIVITÀ', '')).strip() if pd.notna(row.get('TIPO ATTIVITÀ')) else ''
                esito = str(row.get('ESITO', '')).strip() if pd.notna(row.get('ESITO')) else ''
                
                if tipo_attivita or esito:
                    interazione = f"Tracker Ottavia - {tipo_attivita}: {esito}".strip()
                    update_data['note'] = interazione
                    print(f"   + Note: {interazione}")
            
            # 4. Aggiorno stato in base all'esito
            if not update_data.get('note'):
                esito = str(row.get('ESITO', '')).strip().lower() if pd.notna(row.get('ESITO')) else ''
                current_status = existing_lead.get('status', '')
                
                if esito and current_status == 'NEW':
                    if 'interessat' in esito or 'appuntamento' in esito:
                        update_data['status'] = 'CONTACTED'
                        print(f"   + Status: CONTACTED")
                    elif 'non rispond' in esito or 'no risposta' in esito:
                        update_data['status'] = 'CONTACTED'
                        print(f"   + Status: CONTACTED")
            
            # Eseguo l'aggiornamento se ci sono modifiche
            if update_data:
                update_response = requests.put(
                    f"{API_URL}/api/leads/{lead_id}",
                    json=update_data,
                    timeout=30
                )
                
                if update_response.status_code == 200:
                    print(f"   ✅ AGGIORNATO")
                    updated.append({
                        'nome': nome,
                        'lead_id': lead_id,
                        'updates': list(update_data.keys())
                    })
                else:
                    print(f"   ❌ Errore aggiornamento: HTTP {update_response.status_code}")
                    errors.append({'nome': nome, 'errore': f'Update failed {update_response.status_code}'})
            else:
                print(f"   ⏭️  Nessun aggiornamento necessario")
                skipped.append({'nome': nome, 'motivo': 'Già aggiornato'})
        
        except Exception as e:
            print(f"   ❌ ERRORE: {str(e)}")
            errors.append({'nome': nome, 'errore': str(e)})
    
    else:
        # LEAD NON ESISTE - IMPORTO DA HUBSPOT
        print(f"   🆕 Lead NON presente - importo da HubSpot...")
        
        # SICUREZZA: fermo se ho già importato più di 14 lead
        if len(imported) >= 14:
            print(f"   ⚠️  STOP - Raggiunti 14 lead importati (limite di sicurezza)")
            skipped.append({'nome': nome, 'motivo': 'Limite 14 lead raggiunto'})
            print()
            continue
        
        try:
            search_data = {'onlyEcura': False}
            
            if email and '@' in email:
                search_data['email'] = email
            elif telefono:
                search_data['phone'] = telefono
            else:
                print(f"   ⚠️  SKIP - Nessun contatto valido")
                skipped.append({'nome': nome, 'motivo': 'Nessun contatto'})
                print()
                continue
            
            hs_response = requests.post(
                f"{API_URL}/api/hubspot/search",
                json=search_data,
                timeout=30
            )
            
            if hs_response.status_code == 200:
                contacts = hs_response.json().get('contacts', [])
                
                if contacts:
                    contact = contacts[0]
                    hubspot_id = contact.get('id')
                    props = contact.get('properties', {})
                    hs_name = f"{props.get('firstname', '')} {props.get('lastname', '')}".strip()
                    
                    print(f"   ✅ Trovato su HubSpot: ID {hubspot_id} - {hs_name}")
                    
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
                            
                            # Aggiorno subito con CM=OB
                            requests.put(
                                f"{API_URL}/api/leads/{lead_id}",
                                json={'cm': 'OB'},
                                timeout=10
                            )
                            
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
    time.sleep(0.8)

# Report finale
print("="*80)
print("📊 REPORT FINALE")
print("="*80)
print()
print(f"✅ Lead aggiornati: {len(updated)}")
for lead in updated[:10]:
    print(f"   • {lead['nome']} ({lead['lead_id']}) - Aggiornati: {', '.join(lead['updates'])}")
if len(updated) > 10:
    print(f"   ... e altri {len(updated)-10}")

print()
print(f"🆕 Lead importati: {len(imported)}")
for lead in imported:
    print(f"   • {lead['nome']} → {lead['lead_id']} (HS: {lead['hubspot_id']})")

print()
print(f"⏭️  Skippati: {len(skipped)}")
for lead in skipped[:5]:
    print(f"   • {lead['nome']}: {lead['motivo']}")

print()
print(f"❌ Errori: {len(errors)}")
for err in errors[:5]:
    print(f"   • {err['nome']}: {err['errore']}")

# Salvo
with open('tracker_import_report.json', 'w') as f:
    json.dump({
        'updated': updated,
        'imported': imported,
        'skipped': skipped,
        'errors': errors,
        'timestamp': datetime.now().isoformat()
    }, f, indent=2)

print()
print("✅ Report salvato in tracker_import_report.json")

