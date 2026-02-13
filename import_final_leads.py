#!/usr/bin/env python3
"""
Importazione finale dei lead mancanti dal foglio Ottavia
- Esclusi: Mario Rossi (test), Azienda XYZ (test)
- Tutti fonte "Privati IRBEMA" tranne Pedron (fonte "SR")
- Tutti CM="OB"
- Stati mappati da ESITO
"""
import json
import requests
from datetime import datetime
import time

# Lead da importare (esclusi i test)
LEADS_TO_IMPORT = [
    {
        'nome': 'Laura Bianchi',
        'contatto': '340-9876543',
        'tipo': 'Telefonata',
        'esito': 'Interessata',
        'prossimo_step': 'Appuntamento fissato',
        'data_followup': '20/12/2025',
        'note': 'Dir. Comm. ore 11:00',
        'fonte': 'Privati IRBEMA'
    },
    {
        'nome': 'Paola Scarpin',
        'contatto': '3403686122',
        'tipo': 'Telefonata',
        'esito': 'Non risponde',
        'prossimo_step': 'Nessuna email',
        'data_followup': None,
        'note': None,
        'fonte': 'Privati IRBEMA'
    },
    {
        'nome': 'Adriana Mulassano',
        'contatto': '3387205351',
        'tipo': 'Telefonata',
        'esito': 'Non interessata',
        'prossimo_step': None,
        'data_followup': None,
        'note': None,
        'fonte': 'Privati IRBEMA'
    },
    {
        'nome': 'Maria Chiara Baldassini',
        'contatto': '3922352447',
        'tipo': 'Telefonata',
        'esito': 'Non risponde',
        'prossimo_step': None,
        'data_followup': None,
        'note': None,
        'fonte': 'Privati IRBEMA'
    },
    {
        'nome': 'Andrea Mercuri',
        'contatto': '366156266',
        'tipo': 'Telefonata',
        'esito': 'Non risponde',
        'prossimo_step': None,
        'data_followup': None,
        'note': None,
        'fonte': 'Privati IRBEMA'
    },
    {
        'nome': 'Enzo Pedron',
        'contatto': '3484717119',
        'tipo': 'Telefonata',
        'esito': 'Interessato',
        'prossimo_step': 'Appuntamento fissato',
        'data_followup': '2026-02-05',
        'note': 'Dir. Comm. 12.00',
        'fonte': 'SR'  # SPECIALE per Pedron
    },
    {
        'nome': 'Andrea Dindo',
        'contatto': 'andreadindo1@gmail.com',
        'tipo': 'Email',
        'esito': 'Inviata',
        'prossimo_step': 'Attendere risposta',
        'data_followup': None,
        'note': None,
        'fonte': 'Privati IRBEMA'
    },
    {
        'nome': 'Francesco Egiziano',
        'contatto': '3382933088',
        'tipo': 'Telefonata',
        'esito': 'Da ricontattare',
        'prossimo_step': None,
        'data_followup': None,
        'note': None,
        'fonte': 'Privati IRBEMA'
    },
    {
        'nome': 'Mary De Sanctis',
        'contatto': '3396748762',
        'tipo': 'Telefonata',
        'esito': 'Non risponde',
        'prossimo_step': None,
        'data_followup': None,
        'note': None,
        'fonte': 'Privati IRBEMA'
    },
    {
        'nome': 'Giovanna Giordano',
        'contatto': '3381084344',
        'tipo': 'Telefonata',
        'esito': 'Non risponde',
        'prossimo_step': None,
        'data_followup': None,
        'note': None,
        'fonte': 'Privati IRBEMA'
    },
    {
        'nome': 'Marco Olivieri',
        'contatto': '348828024',
        'tipo': 'Telefonata',
        'esito': 'Interessato',
        'prossimo_step': None,
        'data_followup': None,
        'note': None,
        'fonte': 'Privati IRBEMA'
    },
    {
        'nome': 'Alberto Avanzi',
        'contatto': '3295954873',
        'tipo': 'Telefonata',
        'esito': 'Non risponde',
        'prossimo_step': None,
        'data_followup': None,
        'note': None,
        'fonte': 'Privati IRBEMA'
    }
]

# Mappa esiti -> stati
ESITO_TO_STATO = {
    'Non risponde': 'Da Ricontattare',
    'Inviata': 'Contattato',
    'Interessata': 'Interessato',
    'Interessato': 'Interessato',
    'Non interessata': 'Non Interessato',
    'Da ricontattare': 'Da Ricontattare'
}

API_BASE = 'https://telemedcare-v12.pages.dev'

print(f"\n{'='*100}")
print(f"📥 IMPORTAZIONE {len(LEADS_TO_IMPORT)} LEAD DA FOGLIO OTTAVIA")
print(f"{'='*100}\n")
print(f"⚠️  Esclusi (test): Mario Rossi, Azienda XYZ")
print(f"✅ Fonte: Privati IRBEMA (tranne Pedron = SR)")
print(f"✅ CM: OB (Ottavia Belfa)")
print(f"✅ Stati mappati da ESITO\n")

imported = []
failed = []

for i, lead in enumerate(LEADS_TO_IMPORT, 1):
    nome = lead['nome']
    contatto = lead['contatto']
    tipo = lead['tipo']
    esito = lead['esito'].strip()
    fonte = lead['fonte']
    
    print(f"\n{i:2}. {'─'*90}")
    print(f"   📋 {nome}")
    print(f"   📞 {contatto} | {tipo} | Esito: {esito}")
    print(f"   🏢 Fonte: {fonte}")
    
    # Determina email o telefono
    is_email = '@' in contatto
    
    # Split nome/cognome (semplice split sullo spazio)
    nome_parts = nome.strip().split(' ', 1)
    nome_rich = nome_parts[0] if len(nome_parts) > 0 else nome
    cognome_rich = nome_parts[1] if len(nome_parts) > 1 else ''
    
    # Prepara dati lead
    lead_data = {
        'nomeRichiedente': nome_rich,
        'cognomeRichiedente': cognome_rich,
        'fonte': fonte,
        'tipoServizio': 'eCura PRO',
        'piano': 'BASE',
        'prezzoAnno': 480,
        'cm': 'OB',
        'stato': ESITO_TO_STATO.get(esito, 'Nuovo')
    }
    
    if is_email:
        lead_data['email'] = contatto
        lead_data['telefono'] = ''
    else:
        # Normalizza telefono
        phone = contatto.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        if not phone.startswith('+'):
            phone = '+39' + phone.lstrip('0')
        lead_data['telefono'] = phone
        lead_data['email'] = f"{nome.replace(' ', '').lower()}@placeholder.com"  # Email placeholder
    
    print(f"   📊 Stato: {lead_data['stato']}")
    
    try:
        # Crea lead
        print(f"   📤 Creazione lead...")
        response = requests.post(
            f'{API_BASE}/api/leads',
            json=lead_data,
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            result = response.json()
            lead_id = result.get('lead', {}).get('id') or result.get('id')
            
            if lead_id:
                print(f"   ✅ Lead creato - ID: {lead_id}")
                
                # Crea interazione
                nota_completa = f"{esito}"
                if lead.get('note'):
                    nota_completa += f" - {lead['note']}"
                
                interaction_data = {
                    'lead_id': lead_id,
                    'tipo': tipo,
                    'operatore': 'Ottavia Belfa',
                    'nota': nota_completa,
                    'azione': lead.get('prossimo_step', '') or '',
                    'data': datetime.now().isoformat()
                }
                
                print(f"   📝 Aggiunta interazione...")
                int_response = requests.post(
                    f'{API_BASE}/api/leads/{lead_id}/interactions',
                    json=interaction_data,
                    timeout=30
                )
                
                if int_response.status_code in [200, 201]:
                    print(f"   ✅ Interazione aggiunta")
                    imported.append({'nome': nome, 'id': lead_id, 'fonte': fonte})
                else:
                    print(f"   ⚠️  Lead OK ma interazione fallita: {int_response.status_code}")
                    imported.append({'nome': nome, 'id': lead_id, 'fonte': fonte, 'warning': 'no_interaction'})
            else:
                print(f"   ⚠️  Lead creato ma ID non trovato")
                imported.append({'nome': nome, 'id': 'unknown', 'fonte': fonte})
        else:
            error_msg = response.text[:200]
            print(f"   ❌ Errore {response.status_code}: {error_msg}")
            failed.append({'nome': nome, 'error': error_msg})
            
    except Exception as e:
        print(f"   ❌ Eccezione: {str(e)[:100]}")
        failed.append({'nome': nome, 'error': str(e)[:100]})
    
    # Pausa tra le richieste
    time.sleep(0.5)

# Report finale
print(f"\n{'='*100}")
print(f"📊 RISULTATI IMPORTAZIONE:")
print(f"{'='*100}")
print(f"✅ Importati con successo: {len(imported)}")
print(f"❌ Falliti: {len(failed)}")
print(f"📊 Totale processati: {len(LEADS_TO_IMPORT)}")
print(f"{'='*100}\n")

if imported:
    print(f"✅ LEAD IMPORTATI:\n")
    for item in imported:
        warning = f" [⚠️ {item.get('warning', '')}]" if item.get('warning') else ''
        print(f"   ✓ {item['nome']:30} | ID: {item['id']:20} | Fonte: {item['fonte']}{warning}")

if failed:
    print(f"\n❌ ERRORI:\n")
    for item in failed:
        print(f"   ✗ {item['nome']:30} | {item['error']}")

print(f"\n{'='*100}\n")
print(f"🎯 Dopo l'importazione, il DB avrà {181 + len(imported)} lead totali")
print(f"🔍 Verifica su: https://telemedcare-v12.pages.dev/admin/leads-dashboard")
print(f"\n{'='*100}\n")
