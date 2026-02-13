#!/usr/bin/env python3
"""
Script per correggere le fonti invalide nei lead TeleMedCare

Mappatura:
- Form eCura → Privati IRBEMA
- Form eCura x Test → Privati IRBEMA
- B2B IRBEMA → Referral
- Sito web Medica GB → Form Contattaci
- NETWORKING → Referral
"""

import json
import requests
from typing import List, Dict

# Configurazione
API_BASE_URL = "https://telemedcare-v12.pages.dev"

# Mapping fonti invalide → fonti valide
FONTE_MAPPING = {
    'Form eCura': 'Privati IRBEMA',
    'Form eCura x Test': 'Privati IRBEMA',
    'B2B IRBEMA': 'Referral',
    'Sito web Medica GB': 'Form Contattaci',
    'NETWORKING': 'Referral'
}

def load_invalid_leads() -> List[Dict]:
    """Carica i lead con fonte invalida"""
    with open('lead_fonte_invalida.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def update_lead_fonte(lead_id: str, new_fonte: str) -> bool:
    """Aggiorna la fonte di un lead"""
    try:
        url = f"{API_BASE_URL}/api/leads/{lead_id}"
        response = requests.put(url, json={'fonte': new_fonte})
        
        if response.status_code == 200:
            result = response.json()
            return result.get('success', False)
        else:
            print(f"  ❌ HTTP {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"  ❌ Errore: {e}")
        return False

def main():
    print("🔧 CORREZIONE FONTI INVALIDE")
    print("=" * 80)
    
    # Carica lead invalidi
    invalid_leads = load_invalid_leads()
    print(f"\n📋 Totale lead da correggere: {len(invalid_leads)}")
    
    # Raggruppa per fonte
    by_fonte = {}
    for lead in invalid_leads:
        fonte = lead.get('fonte') or 'NULL'
        if fonte not in by_fonte:
            by_fonte[fonte] = []
        by_fonte[fonte].append(lead)
    
    print(f"\n📊 Fonti invalide trovate: {len(by_fonte)}")
    for fonte, leads in by_fonte.items():
        new_fonte = FONTE_MAPPING.get(fonte, 'Privati IRBEMA')
        print(f"   • {fonte} ({len(leads)} lead) → {new_fonte}")
    
    # Conferma
    print("\n" + "=" * 80)
    confirm = input("⚠️  Procedere con la correzione? (s/n): ").strip().lower()
    
    if confirm != 's':
        print("❌ Operazione annullata")
        return
    
    print("\n🔄 Avvio correzione...")
    print("-" * 80)
    
    # Processa ogni fonte invalida
    results = {
        'success': [],
        'failed': []
    }
    
    for fonte_invalida, leads in by_fonte.items():
        new_fonte = FONTE_MAPPING.get(fonte_invalida, 'Privati IRBEMA')
        
        print(f"\n🔹 Correzione: {fonte_invalida} → {new_fonte}")
        print(f"   Lead da aggiornare: {len(leads)}")
        
        for i, lead in enumerate(leads, 1):
            lead_id = lead['id']
            nome = f"{lead.get('nome', '')} {lead.get('cognome', '')}".strip()
            
            print(f"   [{i}/{len(leads)}] {lead_id} - {nome}...", end=' ')
            
            if update_lead_fonte(lead_id, new_fonte):
                print("✅")
                results['success'].append({
                    'id': lead_id,
                    'nome': nome,
                    'old_fonte': fonte_invalida,
                    'new_fonte': new_fonte
                })
            else:
                print("❌")
                results['failed'].append({
                    'id': lead_id,
                    'nome': nome,
                    'old_fonte': fonte_invalida,
                    'new_fonte': new_fonte
                })
    
    # Riepilogo finale
    print("\n" + "=" * 80)
    print("📊 RIEPILOGO FINALE")
    print("-" * 80)
    print(f"✅ Corretti con successo: {len(results['success'])} / {len(invalid_leads)}")
    print(f"❌ Errori: {len(results['failed'])}")
    
    if results['failed']:
        print("\n⚠️  Lead con errori:")
        for fail in results['failed']:
            print(f"   • {fail['id']} - {fail['nome']}")
    
    # Salva risultati
    with open('fonte_correction_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Risultati salvati in: fonte_correction_results.json")
    
    # Statistiche finali per fonte
    print("\n📈 NUOVA DISTRIBUZIONE FONTI:")
    print("-" * 80)
    
    fonte_stats = {}
    for item in results['success']:
        new_fonte = item['new_fonte']
        fonte_stats[new_fonte] = fonte_stats.get(new_fonte, 0) + 1
    
    for fonte, count in sorted(fonte_stats.items(), key=lambda x: x[1], reverse=True):
        print(f"   • {fonte}: +{count} lead")
    
    print("\n✅ Correzione completata!")

if __name__ == '__main__':
    main()
