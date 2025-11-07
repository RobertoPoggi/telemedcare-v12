#!/usr/bin/env python3
"""
Script per convertire la migrazione 0012 allo schema corretto della tabella document_templates.

Schema attuale:
- id TEXT PRIMARY KEY
- name TEXT NOT NULL
- type TEXT NOT NULL
- subject TEXT
- html_content TEXT NOT NULL
- variables TEXT (JSON array)
- category TEXT
- active BOOLEAN DEFAULT 1
- created_at TEXT DEFAULT CURRENT_TIMESTAMP
- updated_at TEXT DEFAULT CURRENT_TIMESTAMP

La migrazione originale usa colonne sbagliate:
- description, version, from_name, is_default, author (NON ESISTONO)
"""

import re
import sys

def fix_migration(input_file, output_file):
    """Converti la migrazione dal formato errato a quello corretto."""
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"📄 File originale: {len(content)} caratteri, {content.count('INSERT INTO')} INSERT statements")
    
    # Pattern per trovare gli INSERT statement
    # Cerchiamo il pattern:
    # INSERT INTO document_templates (
    #     name, category, description, version,
    #     html_content, variables,
    #     subject, from_name,
    #     active, is_default, author
    # ) VALUES (
    
    # Pattern per l'intestazione INSERT originale (con colonne sbagliate)
    old_header_pattern = r"INSERT INTO document_templates \(\s*name,\s*category,\s*description,\s*version,\s*html_content,\s*variables,\s*subject,\s*from_name,\s*active,\s*is_default,\s*author\s*\)"
    
    # Nuova intestazione con colonne corrette
    new_header = "INSERT INTO document_templates (id, name, type, subject, html_content, variables, category, active)"
    
    # Sostituisci l'intestazione
    content_fixed = re.sub(old_header_pattern, new_header, content, flags=re.MULTILINE | re.IGNORECASE)
    
    if content == content_fixed:
        print("⚠️  Nessuna sostituzione dell'intestazione effettuata - pattern non trovato")
        print("🔍 Analizziamo le prime 500 righe per capire il formato...")
        lines = content.split('\n')[:500]
        for i, line in enumerate(lines, 1):
            if 'INSERT INTO document_templates' in line:
                print(f"Riga {i}: {line[:200]}")
    else:
        print(f"✅ Intestazione INSERT sostituita")
    
    # Ora dobbiamo riordinare i VALUES per corrispondere al nuovo ordine delle colonne
    # Vecchio ordine: name, category, description, version, html_content, variables, subject, from_name, active, is_default, author
    # Nuovo ordine: id, name, type, subject, html_content, variables, category, active
    #
    # Mapping:
    # - id = name (usiamo il name come id, es: 'email_notifica_info')
    # - name = name
    # - type = 'email' (tutti sono template email)
    # - subject = subject
    # - html_content = html_content
    # - variables = variables
    # - category = category
    # - active = active
    # Ignoriamo: description, version, from_name, is_default, author
    
    # Dividiamo il contenuto in righe
    lines = content_fixed.split('\n')
    output_lines = []
    
    in_values = False
    values_buffer = []
    
    for line in lines:
        if 'VALUES (' in line:
            in_values = True
            values_buffer = [line]
        elif in_values:
            values_buffer.append(line)
            # Controlliamo se abbiamo completato lo statement (finisce con );)
            if line.strip().endswith(');') or line.strip().endswith('),'):
                # Processa il blocco VALUES
                values_text = '\n'.join(values_buffer)
                fixed_values = fix_values_order(values_text)
                output_lines.append(fixed_values)
                in_values = False
                values_buffer = []
        else:
            output_lines.append(line)
    
    content_final = '\n'.join(output_lines)
    
    # Scrivi il file di output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content_final)
    
    print(f"✅ Migrazione convertita salvata in: {output_file}")
    print(f"📊 Dimensione finale: {len(content_final)} caratteri")

def fix_values_order(values_text):
    """
    Riordina i valori da:
    name, category, description, version, html_content, variables, subject, from_name, active, is_default, author
    
    A:
    id, name, type, subject, html_content, variables, category, active
    """
    
    # Estrai i singoli valori (attenzione: possono contenere virgole all'interno delle stringhe!)
    # Questo è complesso perché abbiamo stringhe SQL con apici singoli che possono contenere virgole
    
    # Cerchiamo il pattern VALUES ( seguito da valori
    match = re.search(r"VALUES\s*\((.*?)\);?$", values_text, re.DOTALL | re.MULTILINE)
    if not match:
        print("⚠️  Non ho trovato VALUES nel blocco")
        return values_text
    
    values_content = match.group(1)
    
    # Estratta dei valori SQL (complessa perché abbiamo stringhe con apici che contengono virgole)
    # Usiamo una regex per trovare le stringhe SQL
    # I valori sono nel formato: 'stringa', 'altra stringa', numero, ...
    
    # Splittiamo manualmente i valori considerando le stringhe SQL
    values = []
    current_value = ""
    in_string = False
    escape_next = False
    paren_depth = 0
    
    for char in values_content:
        if escape_next:
            current_value += char
            escape_next = False
            continue
        
        if char == '\\':
            current_value += char
            escape_next = True
            continue
        
        if char == "'" and not in_string:
            in_string = True
            current_value += char
        elif char == "'" and in_string:
            in_string = False
            current_value += char
        elif char == ',' and not in_string and paren_depth == 0:
            # Fine di un valore
            values.append(current_value.strip())
            current_value = ""
        else:
            current_value += char
            if char == '(' and not in_string:
                paren_depth += 1
            elif char == ')' and not in_string:
                paren_depth -= 1
    
    # Aggiungi l'ultimo valore
    if current_value.strip():
        values.append(current_value.strip())
    
    if len(values) != 11:
        print(f"⚠️  Numero di valori inaspettato: {len(values)} (attesi 11)")
        print(f"   Primi 3 valori: {values[:3] if len(values) >= 3 else values}")
        return values_text
    
    # Vecchio ordine (indici 0-based):
    # 0: name
    # 1: category
    # 2: description (IGNORA)
    # 3: version (IGNORA)
    # 4: html_content
    # 5: variables
    # 6: subject
    # 7: from_name (IGNORA)
    # 8: active
    # 9: is_default (IGNORA)
    # 10: author (IGNORA)
    
    # Nuovo ordine:
    # id, name, type, subject, html_content, variables, category, active
    
    template_id = values[0]  # name diventa anche id
    name = values[0]
    type_val = "'email'"  # Tutti sono template email
    subject = values[6]
    html_content = values[4]
    variables = values[5]
    category = values[1]
    active = values[8]
    
    # Costruisci il nuovo VALUES
    new_values = [template_id, name, type_val, subject, html_content, variables, category, active]
    new_values_str = ',\n    '.join(new_values)
    
    # Ricostruisci lo statement completo
    result = f"VALUES (\n    {new_values_str}\n);"
    
    return result

if __name__ == '__main__':
    input_file = 'migrations/0012_populate_templates.sql'
    output_file = 'migrations/0012_populate_templates_fixed.sql'
    
    print("🔧 Conversione migrazione 0012...")
    print(f"   Input:  {input_file}")
    print(f"   Output: {output_file}")
    print()
    
    try:
        fix_migration(input_file, output_file)
        print()
        print("✅ COMPLETATO!")
        print()
        print("📝 Prossimi passi:")
        print("   1. Verifica il file generato")
        print("   2. Rinomina: mv migrations/0012_populate_templates.sql migrations/0012_populate_templates.sql.old")
        print("   3. Rinomina: mv migrations/0012_populate_templates_fixed.sql migrations/0012_populate_templates.sql")
        print("   4. Applica migrazione: npx wrangler d1 migrations apply telemedcare-leads --local")
        
    except Exception as e:
        print(f"❌ ERRORE: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
