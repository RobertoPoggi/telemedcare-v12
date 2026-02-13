#!/usr/bin/env python3
"""
Script per importare i 14 lead mancanti nel database con le loro interazioni
"""
import json
import requests
from datetime import datetime

# Carica i lead mancanti
with open('/home/user/webapp/leads_mancanti_full.json', 'r', encoding='utf-8') as f:
    missing_leads = json.load(f)

API_BASE = 'https://telemedcare-v12.pages.dev'

# Mappa esiti -> stati
ESITO_TO_STATO = {
    'Non risponde': 'Da Ricontattare',
    'Inviata': 'Contattato',
    'Interessata': 'Interessato',
    'Interessato': 'Interessato',
    'Non interessata': 'Non Interessato',
    'Da ricontattare': 'Da Ricontattare',
    'In trattativa': 'In Trattativa',
    'Convertito': 'Convertito'
}

print(f"\n{'='*80}")
print(f"📥 IMPORTAZIONE {len(missing_leads)} LEAD MANCANTI")
print(f"{'='*80}\n")

imported_count = 0
skipped_count = 0
errors = []

for i, lead in enumerate(missing_leads, 1):
    nome = lead['nome']
    contatto = str(lead['contatto'])
    tipo = lead.get('tipo', 'Telefonata')
    esito = lead.get('esito', '').strip()
    prossimo_step = lead.get('prossimo_step', '')
    note = lead.get('note', '')
    data_str = lead.get('data', '')
    
    print(f"{i:2}. {nome:30} | {contatto:25} | {tipo:12} | {esito:20}")
    
    # Determina se è email o telefono
    is_email = '@' in contatto
    
    # Prepara i dati del lead
    lead_data = {
        'richiedente': nome,
        'fonte': 'Privati IRBEMA',  # Default
        'tipoServizio': 'eCura PRO',  # Default
        'piano': 'BASE',  # Default
        'prezzoAnno': 480,  # Default
        'cm': 'OB',  # Ottavia Belfa
        'stato': ESITO_TO_STATO.get(esito, 'Nuovo')
    }
    
    if is_email:
        lead_data['email'] = contatto
        lead_data['telefono'] = ''
    else:
        # Normalizza telefono
        phone = contatto.replace(' ', '').replace('-', '')
        if not phone.startswith('+'):
            phone = '+39' + phone.lstrip('0')
        lead_data['telefono'] = phone
        lead_data['email'] = ''
    
    try:
        # Crea il lead
        response = requests.post(
            f'{API_BASE}/api/leads',
            json=lead_data,
            timeout=30
        )
        
        if response.status_code == 200 or response.status_code == 201:
            result = response.json()
            lead_id = result.get('lead', {}).get('id') or result.get('id')
            
            if lead_id:
                # Crea l'interazione
                interaction_data = {
                    'lead_id': lead_id,
                    'tipo': tipo,
                    'operatore': 'Ottavia Belfa',
                    'nota': f"{esito}",
                    'azione': prossimo_step or '',
                    'data': data_str if data_str else datetime.now().isoformat()
                }
                
                if note:
                    interaction_data['nota'] += f" - {note}"
                
                int_response = requests.post(
                    f'{API_BASE}/api/leads/{lead_id}/interactions',
                    json=interaction_data,
                    timeout=30
                )
                
                if int_response.status_code == 200 or int_response.status_code == 201:
                    print(f"   ✅ Lead creato (ID: {lead_id}) + interazione aggiunta")
                    imported_count += 1
                else:
                    print(f"   ⚠️  Lead creato ma interazione fallita: {int_response.status_code}")
                    imported_count += 1
            else:
                print(f"   ⚠️  Lead creato ma ID non trovato")
                imported_count += 1
        else:
            print(f"   ❌ Errore creazione: {response.status_code} - {response.text[:100]}")
            errors.append(f"{nome}: {response.status_code}")
            skipped_count += 1
            
    except Exception as e:
        print(f"   ❌ Eccezione: {str(e)[:100]}")
        errors.append(f"{nome}: {str(e)[:50]}")
        skipped_count += 1

print(f"\n{'='*80}")
print(f"📊 RISULTATI IMPORTAZIONE:")
print(f"   ✅ Importati: {imported_count}")
print(f"   ❌ Saltati: {skipped_count}")
print(f"   📊 Totale: {len(missing_leads)}")
print(f"{'='*80}\n")

if errors:
    print(f"\n⚠️  ERRORI ({len(errors)}):")
    for err in errors:
        print(f"   - {err}")
    print()
