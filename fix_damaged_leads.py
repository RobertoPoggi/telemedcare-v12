#!/usr/bin/env python3
"""
Script per correggere i 4 lead danneggiati durante l'importazione
"""
import requests
import time

API_BASE = 'https://telemedcare-v12.pages.dev'

# Dati dei lead da correggere
LEADS_TO_FIX = [
    {
        'id': 'LEAD-MANUAL-1770946057712',
        'nomeRichiedente': 'Andrea',
        'cognomeRichiedente': 'Mercuri',
        'telefono': '+39366156266',
        'fonte': 'Privati IRBEMA',
        'cm': 'OB',
        'stato': 'Da Ricontattare'
    },
    {
        'id': 'LEAD-MANUAL-1770946051660',
        'nomeRichiedente': 'Paola',
        'cognomeRichiedente': 'Scarpin',
        'telefono': '+393403686122',
        'fonte': 'Privati IRBEMA',
        'cm': 'OB',
        'stato': 'Da Ricontattare'
    },
    {
        'id': 'LEAD-MANUAL-1770946054097',
        'nomeRichiedente': 'Adriana',
        'cognomeRichiedente': 'Mulassano',
        'telefono': '+393387205351',
        'fonte': 'Privati IRBEMA',
        'cm': 'OB',
        'stato': 'Non Interessato'
    },
    {
        'id': 'LEAD-MANUAL-1770946064859',
        'nomeRichiedente': 'Marco',
        'cognomeRichiedente': 'Olivieri',
        'telefono': '+39348828024',
        'fonte': 'Privati IRBEMA',
        'cm': 'OB',
        'stato': 'Interessato'
    }
]

print(f"\n{'='*100}")
print(f"🔧 CORREZIONE {len(LEADS_TO_FIX)} LEAD DANNEGGIATI")
print(f"{'='*100}\n")

fixed = []
failed = []

for i, lead_fix in enumerate(LEADS_TO_FIX, 1):
    lead_id = lead_fix['id']
    nome = f"{lead_fix['nomeRichiedente']} {lead_fix['cognomeRichiedente']}"
    
    print(f"{i}. {'─'*90}")
    print(f"   🔧 Fixing: {nome} (ID: {lead_id})")
    
    # Prepara i dati di update
    update_data = {
        'nomeRichiedente': lead_fix['nomeRichiedente'],
        'cognomeRichiedente': lead_fix['cognomeRichiedente'],
        'fonte': lead_fix['fonte'],
        'cm': lead_fix['cm'],
        'stato': lead_fix['stato'],
        'tipoServizio': 'eCura PRO',
        'piano': 'BASE'
    }
    
    try:
        # Aggiorna il lead
        response = requests.put(
            f'{API_BASE}/api/leads/{lead_id}',
            json=update_data,
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            print(f"   ✅ Lead corretto")
            print(f"      Nome: {lead_fix['nomeRichiedente']} {lead_fix['cognomeRichiedente']}")
            print(f"      CM: {lead_fix['cm']}")
            print(f"      Stato: {lead_fix['stato']}")
            fixed.append(nome)
        else:
            error_msg = response.text[:200]
            print(f"   ❌ Errore {response.status_code}: {error_msg}")
            failed.append({'nome': nome, 'error': error_msg})
            
    except Exception as e:
        print(f"   ❌ Eccezione: {str(e)[:100]}")
        failed.append({'nome': nome, 'error': str(e)[:100]})
    
    time.sleep(0.3)

# Report finale
print(f"\n{'='*100}")
print(f"📊 RISULTATI CORREZIONE:")
print(f"{'='*100}")
print(f"✅ Corretti: {len(fixed)}")
print(f"❌ Falliti: {len(failed)}")
print(f"📊 Totale: {len(LEADS_TO_FIX)}")
print(f"{'='*100}\n")

if fixed:
    print(f"✅ LEAD CORRETTI:\n")
    for nome in fixed:
        print(f"   ✓ {nome}")

if failed:
    print(f"\n❌ ERRORI:\n")
    for item in failed:
        print(f"   ✗ {item['nome']:30} | {item['error']}")

print(f"\n{'='*100}\n")
print(f"🔍 Verifica su: https://telemedcare-v12.pages.dev/admin/leads-dashboard")
print(f"   Filtra per CM = OB per vedere i lead di Ottavia")
print(f"\n{'='*100}\n")
