#!/usr/bin/env python3
"""
Script per verificare se i 14 lead "mancanti" sono davvero assenti nel DB
"""
import json
import requests

# Carica i lead mancanti
with open('/home/user/webapp/leads_mancanti_full.json', 'r', encoding='utf-8') as f:
    missing_leads = json.load(f)

# Scarica TUTTI i lead dal DB
print("📥 Scaricando tutti i lead dal database...")
response = requests.get('https://telemedcare-v12.pages.dev/api/leads?limit=500', timeout=30)
api_leads = response.json().get('leads', [])
print(f"✅ Caricati {len(api_leads)} lead\n")

def normalize_text(text):
    """Normalizza testo"""
    if not text:
        return ''
    return str(text).strip().lower()

def normalize_phone(phone):
    """Normalizza telefono"""
    if not phone:
        return ''
    s = str(phone).strip()
    s = s.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
    s = s.replace('+39', '').replace('0039', '').replace('+', '')
    digits = ''.join(c for c in s if c.isdigit())
    if len(digits) >= 9:
        return digits[-10:]
    return digits

print(f"{'='*100}")
print(f"🔍 VERIFICA DETTAGLIATA DEI 14 LEAD 'MANCANTI'")
print(f"{'='*100}\n")

for i, excel_lead in enumerate(missing_leads, 1):
    nome = excel_lead['nome']
    contatto = str(excel_lead['contatto'])
    tipo = excel_lead.get('tipo', '')
    esito = excel_lead.get('esito', '')
    
    print(f"\n{'─'*100}")
    print(f"{i:2}. 📋 LEAD EXCEL: {nome}")
    print(f"   Contatto: {contatto}")
    print(f"   Tipo: {tipo} | Esito: {esito}")
    print(f"{'─'*100}")
    
    # Cerca nel DB
    is_email = '@' in contatto
    
    if is_email:
        excel_email = normalize_text(contatto)
        print(f"   🔍 Cerco per email: '{excel_email}'")
        
        # Cerca per email
        matches = [l for l in api_leads if normalize_text(l.get('email', '')) == excel_email]
        
        if matches:
            print(f"   ✅ TROVATO NEL DB ({len(matches)} match):")
            for m in matches:
                print(f"      ID: {m.get('id')}")
                print(f"      Nome: {m.get('richiedente', 'N/A')}")
                print(f"      Email: {m.get('email', 'N/A')}")
                print(f"      Telefono: {m.get('telefono', 'N/A')}")
                print(f"      Fonte: {m.get('fonte', 'N/A')}")
                print(f"      CM: {m.get('cm', 'N/A')}")
                print(f"      Stato: {m.get('stato', 'N/A')}")
        else:
            print(f"   ❌ NON TROVATO per email")
            
            # Prova a cercare per nome
            excel_nome = normalize_text(nome)
            name_matches = [l for l in api_leads if normalize_text(l.get('richiedente', '')) == excel_nome]
            
            if name_matches:
                print(f"   ⚠️  Ma trovato per NOME ({len(name_matches)} match):")
                for m in name_matches:
                    print(f"      ID: {m.get('id')} | Email DB: {m.get('email', 'N/A')} vs Excel: {contatto}")
    else:
        excel_phone = normalize_phone(contatto)
        print(f"   🔍 Cerco per telefono: '{excel_phone}'")
        
        # Cerca per telefono
        matches = []
        for l in api_leads:
            db_phone = normalize_phone(l.get('telefono', ''))
            if db_phone == excel_phone:
                matches.append(l)
        
        if matches:
            print(f"   ✅ TROVATO NEL DB ({len(matches)} match):")
            for m in matches:
                print(f"      ID: {m.get('id')}")
                print(f"      Nome: {m.get('richiedente', 'N/A')}")
                print(f"      Email: {m.get('email', 'N/A')}")
                print(f"      Telefono: {m.get('telefono', 'N/A')} (normalizzato: {normalize_phone(m.get('telefono', ''))})")
                print(f"      Fonte: {m.get('fonte', 'N/A')}")
                print(f"      CM: {m.get('cm', 'N/A')}")
                print(f"      Stato: {m.get('stato', 'N/A')}")
        else:
            print(f"   ❌ NON TROVATO per telefono")
            
            # Prova a cercare per nome
            excel_nome = normalize_text(nome)
            name_matches = [l for l in api_leads if normalize_text(l.get('richiedente', '')) == excel_nome]
            
            if name_matches:
                print(f"   ⚠️  Ma trovato per NOME ({len(name_matches)} match):")
                for m in name_matches:
                    db_phone_norm = normalize_phone(m.get('telefono', ''))
                    print(f"      ID: {m.get('id')} | Tel DB: {m.get('telefono', 'N/A')} (norm: {db_phone_norm}) vs Excel: {contatto} (norm: {excel_phone})")
            else:
                print(f"   ❌ NON TROVATO nemmeno per nome")
                print(f"   🆕 Questo lead va DAVVERO importato!")

print(f"\n{'='*100}\n")
