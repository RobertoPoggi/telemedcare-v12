#!/usr/bin/env python3
"""
Script per trovare duplicati dei lead appena importati
"""
import requests
import json

# Lead appena importati che potrebbero essere duplicati
POSSIBLY_DUPLICATES = [
    {'nome': 'Andrea Mercuri', 'new_id': 'LEAD-MANUAL-1770946057712', 'telefono': '366156266'},
    {'nome': 'Paola Scarpin', 'new_id': 'LEAD-MANUAL-1770946051660', 'telefono': '3403686122'},
    {'nome': 'Adriana Mulassano', 'new_id': 'LEAD-MANUAL-1770946054097', 'telefono': '3387205351'},
    {'nome': 'Marco Olivieri', 'new_id': 'LEAD-MANUAL-1770946064859', 'telefono': '348828024'}
]

def normalize_text(text):
    if not text:
        return ''
    return str(text).strip().lower()

def normalize_phone(phone):
    if not phone:
        return ''
    s = str(phone).strip()
    s = s.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
    s = s.replace('+39', '').replace('0039', '').replace('+', '')
    digits = ''.join(c for c in s if c.isdigit())
    if len(digits) >= 9:
        return digits[-10:]
    return digits

print("📥 Scaricando tutti i lead dal database...")
response = requests.get('https://telemedcare-v12.pages.dev/api/leads?limit=500', timeout=30)
all_leads = response.json().get('leads', [])
print(f"✅ Caricati {len(all_leads)} lead totali\n")

print(f"{'='*100}")
print(f"🔍 RICERCA DUPLICATI")
print(f"{'='*100}\n")

duplicates_found = []
leads_to_delete = []

for check in POSSIBLY_DUPLICATES:
    nome = check['nome']
    new_id = check['new_id']
    telefono = check['telefono']
    
    print(f"\n{'─'*100}")
    print(f"🔍 Cercando duplicati per: {nome}")
    print(f"   ID appena importato: {new_id}")
    print(f"   Telefono: {telefono}")
    print(f"{'─'*100}")
    
    # Cerca per nome
    nome_norm = normalize_text(nome)
    matches = [l for l in all_leads if normalize_text(l.get('richiedente', '')) == nome_norm]
    
    if len(matches) > 1:
        print(f"   ⚠️  DUPLICATI TROVATI: {len(matches)} occorrenze\n")
        
        older_lead = None
        newer_lead = None
        
        for m in matches:
            is_new = m.get('id') == new_id
            marker = "🆕 NUOVO" if is_new else "📅 VECCHIO"
            
            print(f"   {marker}:")
            print(f"      ID: {m.get('id')}")
            print(f"      Nome: {m.get('richiedente')}")
            print(f"      Email: {m.get('email', 'N/A')}")
            print(f"      Telefono: {m.get('telefono', 'N/A')}")
            print(f"      Fonte: {m.get('fonte', 'N/A')}")
            print(f"      CM: {m.get('cm', 'N/A')}")
            print(f"      Stato: {m.get('stato', 'N/A')}")
            print(f"      Created: {m.get('created_at', 'N/A')}")
            print()
            
            if is_new:
                newer_lead = m
            else:
                older_lead = m
        
        if newer_lead:
            duplicates_found.append({
                'nome': nome,
                'old': older_lead,
                'new': newer_lead
            })
            
            # Il lead da eliminare è quello nuovo (appena importato)
            leads_to_delete.append({
                'id': newer_lead['id'],
                'nome': nome,
                'reason': 'duplicate'
            })
            
            print(f"   ❌ AZIONE: Eliminare il lead NUOVO ({new_id})")
            print(f"   ✅ MANTENERE: Lead vecchio (ID: {older_lead.get('id') if older_lead else 'N/A'})")
    
    elif len(matches) == 1:
        print(f"   ✅ Nessun duplicato - Solo 1 occorrenza trovata (il nuovo lead)")
    else:
        print(f"   ⚠️  Nessuna occorrenza trovata (strano!)")

# Riepilogo
print(f"\n{'='*100}")
print(f"📊 RIEPILOGO DUPLICATI")
print(f"{'='*100}\n")

print(f"✅ Lead da mantenere (già esistenti): {len(duplicates_found)}")
print(f"❌ Lead da eliminare (appena importati): {len(leads_to_delete)}")
print(f"📊 Lead puliti (nessun duplicato): {4 - len(duplicates_found)}\n")

if leads_to_delete:
    print(f"🗑️  LEAD DA ELIMINARE:\n")
    for lead in leads_to_delete:
        print(f"   ✗ {lead['nome']:30} | ID: {lead['id']}")
    
    # Salva la lista per lo script di eliminazione
    with open('/home/user/webapp/leads_to_delete.json', 'w') as f:
        json.dump(leads_to_delete, f, indent=2)
    
    print(f"\n💾 Lista salvata in: /home/user/webapp/leads_to_delete.json")
    print(f"\n⚠️  Per eliminare i duplicati, esegui:")
    print(f"     python3 delete_duplicate_leads.py")
else:
    print(f"✅ Nessun duplicato trovato! I lead erano effettivamente mancanti.")

print(f"\n{'='*100}\n")
