#!/usr/bin/env python3
import pandas as pd
import json
import sys

excel_file = '/home/user/uploaded_files/REPORT_SETTIMANALE_Ottavia_TEMPLATE.xlsx'

print("📖 LETTURA FILE EXCEL DI OTTAVIA")
print("=" * 70)
print("")

# Leggo il foglio "Tracker Giornaliero" (contiene TUTTI i lead)
try:
    df = pd.read_excel(excel_file, sheet_name='Tracker Giornaliero', header=None)
    print(f"✅ Foglio 'Tracker Giornaliero' letto: {len(df)} righe")
    print("")
    
    # Trovo la riga degli header (cerca "NOME/AZIENDA")
    header_row = None
    for idx, row in df.iterrows():
        if any(str(cell).upper().strip() == 'NOME/AZIENDA' for cell in row if pd.notna(cell)):
            header_row = idx
            break
    
    if header_row is None:
        print("❌ Header non trovato")
        sys.exit(1)
    
    print(f"✅ Header trovato alla riga {header_row}")
    
    # Imposto gli header
    df.columns = df.iloc[header_row]
    df = df[header_row + 1:]  # Rimuovo le righe prima dell'header
    
    # Resetto l'indice
    df = df.reset_index(drop=True)
    
    print(f"📊 Colonne trovate: {list(df.columns)}")
    print("")
    
    # Filtro solo le righe con nome/azienda validi
    df = df[df['NOME/AZIENDA'].notna() & (df['NOME/AZIENDA'] != '')]
    df = df[df['NOME/AZIENDA'].astype(str).str.strip() != '']
    
    print(f"✅ Lead trovati nel tracker: {len(df)}")
    print("")
    
    # Estraggo i lead
    leads = []
    for idx, row in df.iterrows():
        nome = str(row['NOME/AZIENDA']).strip() if pd.notna(row['NOME/AZIENDA']) else None
        
        # Skip se è un esempio o placeholder
        if nome and any(x in nome.lower() for x in ['esempio', 'template', 'inserisci']):
            continue
            
        email = str(row['CONTATTO']).strip() if pd.notna(row['CONTATTO']) and '@' in str(row['CONTATTO']) else None
        telefono = str(row['CONTATTO']).strip() if pd.notna(row['CONTATTO']) and '@' not in str(row['CONTATTO']) else None
        
        # Provo anche altre colonne per telefono
        if not telefono and 'TELEFONO' in df.columns and pd.notna(row['TELEFONO']):
            telefono = str(row['TELEFONO']).strip()
        
        lead = {
            'nome': nome,
            'email': email,
            'telefono': telefono,
            'data': str(row['DATA']) if pd.notna(row['DATA']) else None,
            'canale': str(row['CANALE']) if pd.notna(row['CANALE']) else None,
            'note': str(row['NOTE']) if pd.notna(row.get('NOTE')) else None
        }
        
        leads.append(lead)
    
    print(f"✅ Lead estratti: {len(leads)}")
    print("")
    
    # Mostro i primi 10 lead
    print("📋 Primi 10 lead:")
    for i, lead in enumerate(leads[:10], 1):
        print(f"  {i}. {lead['nome']}")
        if lead['email']:
            print(f"     Email: {lead['email']}")
        if lead['telefono']:
            print(f"     Tel: {lead['telefono']}")
    
    if len(leads) > 10:
        print(f"  ... (altri {len(leads) - 10} lead)")
    
    print("")
    
    # Salvo in JSON
    with open('ottavia_all_leads.json', 'w', encoding='utf-8') as f:
        json.dump(leads, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Lead salvati in ottavia_all_leads.json")
    
except Exception as e:
    print(f"❌ Errore: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

