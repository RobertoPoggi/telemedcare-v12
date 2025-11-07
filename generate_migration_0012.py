#!/usr/bin/env python3
"""
Genera una nuova migrazione 0012 corretta che carica i template HTML dai file esistenti.

Schema corretto document_templates:
- id TEXT PRIMARY KEY
- name TEXT NOT NULL
- type TEXT NOT NULL ('email', 'contract', 'document', 'proforma', 'form')
- subject TEXT
- html_content TEXT NOT NULL
- variables TEXT (JSON array)
- category TEXT ('workflow', 'notification', 'marketing', 'system')
- active BOOLEAN DEFAULT 1
"""

import json
import re
from pathlib import Path

# Mappa dei template da migrare
TEMPLATES = [
    {
        'id': 'email_notifica_info',
        'name': 'Notifica Nuovo Lead',
        'type': 'email',
        'subject': '🚨 TeleMedCare - Nuovo Lead: {{NOME_CLIENTE}} {{COGNOME_CLIENTE}}',
        'file': 'templates/email_cleaned/email_notifica_info.html',
        'category': 'notification',
        'variables': ['NOME_RICHIEDENTE', 'COGNOME_RICHIEDENTE', 'EMAIL_RICHIEDENTE', 'TELEFONO_RICHIEDENTE', 
                     'SERVIZIO_RICHIESTO', 'LEAD_ID', 'DATA_RICHIESTA', 'ORA_RICHIESTA', 'NOTE']
    },
    {
        'id': 'email_documenti_informativi',
        'name': 'Documenti Informativi',
        'type': 'email',
        'subject': '📄 TeleMedCare - Informazioni e Documenti Richiesti',
        'file': 'templates/email_cleaned/email_documenti_informativi.html',
        'category': 'workflow',
        'variables': ['NOME_CLIENTE', 'COGNOME_CLIENTE', 'EMAIL_CLIENTE', 'TELEFONO_CLIENTE']
    },
    {
        'id': 'email_invio_contratto',
        'name': 'Invio Contratto',
        'type': 'email',
        'subject': '📋 TeleMedCare - Il tuo contratto è pronto!',
        'file': 'templates/email_cleaned/email_invio_contratto.html',
        'category': 'workflow',
        'variables': ['NOME_CLIENTE', 'COGNOME_CLIENTE', 'PIANO_SERVIZIO', 'PREZZO_PIANO', 'CODICE_CLIENTE', 
                     'LINK_FIRMA_CONTRATTO']
    },
    {
        'id': 'email_invio_proforma',
        'name': 'Invio Proforma',
        'type': 'email',
        'subject': '💰 TeleMedCare - Proforma per Pagamento',
        'file': 'templates/email_cleaned/email_invio_proforma.html',
        'category': 'workflow',
        'variables': ['NOME_CLIENTE', 'COGNOME_CLIENTE', 'PIANO_SERVIZIO', 'PREZZO_PIANO', 'CODICE_CLIENTE',
                     'DATA_EMISSIONE', 'LINK_PAGAMENTO']
    },
    {
        'id': 'email_benvenuto',
        'name': 'Benvenuto Cliente',
        'type': 'email',
        'subject': '🎉 Benvenuto in TeleMedCare!',
        'file': 'templates/email_cleaned/email_benvenuto.html',
        'category': 'workflow',
        'variables': ['NOME_CLIENTE', 'COGNOME_CLIENTE', 'CODICE_CLIENTE', 'LINK_CONFIGURAZIONE']
    },
    {
        'id': 'email_conferma',
        'name': 'Conferma Generica',
        'type': 'email',
        'subject': '✅ TeleMedCare - Conferma',
        'file': 'templates/email_cleaned/email_conferma.html',
        'category': 'system',
        'variables': ['NOME_CLIENTE', 'COGNOME_CLIENTE']
    },
    {
        'id': 'email_conferma_attivazione',
        'name': 'Conferma Attivazione Servizio',
        'type': 'email',
        'subject': '✅ TeleMedCare - Servizio Attivato!',
        'file': 'templates/email_cleaned/email_conferma_attivazione.html',
        'category': 'workflow',
        'variables': ['NOME_CLIENTE', 'COGNOME_CLIENTE', 'CODICE_CLIENTE', 'PIANO_SERVIZIO', 
                     'CODICE_DISPOSITIVO', 'DATA_ATTIVAZIONE']
    },
    {
        'id': 'email_configurazione',
        'name': 'Notifica Configurazione Ricevuta',
        'type': 'email',
        'subject': '⚙️ TeleMedCare - Configurazione Cliente Ricevuta',
        'file': 'templates/email_cleaned/email_notifica_info.html',  # Riusa template notifica
        'category': 'notification',
        'variables': ['NOME_CLIENTE', 'COGNOME_CLIENTE', 'CODICE_CLIENTE', 'DATI_CONFIGURAZIONE']
    },
    {
        'id': 'email_promemoria',
        'name': 'Promemoria Generico',
        'type': 'email',
        'subject': '⏰ TeleMedCare - Promemoria',
        'file': 'templates/email_cleaned/email_promemoria.html',
        'category': 'marketing',
        'variables': ['NOME_CLIENTE', 'COGNOME_CLIENTE', 'MESSAGGIO']
    },
    {
        'id': 'email_promemoria_pagamento',
        'name': 'Promemoria Pagamento',
        'type': 'email',
        'subject': '💳 TeleMedCare - Promemoria Pagamento',
        'file': 'templates/email_cleaned/email_promemoria_pagamento.html',
        'category': 'workflow',
        'variables': ['NOME_CLIENTE', 'COGNOME_CLIENTE', 'IMPORTO', 'LINK_PAGAMENTO']
    },
]

def escape_sql_string(text):
    """Escape singoli apici per SQL."""
    return text.replace("'", "''")

def read_template_file(filepath):
    """Leggi contenuto HTML da file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        return content.strip()
    except FileNotFoundError:
        print(f"⚠️  File non trovato: {filepath}")
        return None

def generate_migration():
    """Genera il file di migrazione SQL."""
    
    output = []
    output.append("-- Populate document_templates table")
    output.append("-- Generated: 2025-11-07 (Script automatico)")
    output.append("-- Schema: id, name, type, subject, html_content, variables, category, active")
    output.append("")
    
    successful = 0
    failed = 0
    
    for template in TEMPLATES:
        print(f"📄 Processing: {template['id']}...")
        
        # Leggi il contenuto HTML
        html_content = read_template_file(template['file'])
        
        if html_content is None:
            failed += 1
            output.append(f"-- SKIPPED: {template['id']} (file not found)")
            output.append("")
            continue
        
        # Prepara i valori
        id_val = escape_sql_string(template['id'])
        name_val = escape_sql_string(template['name'])
        type_val = escape_sql_string(template['type'])
        subject_val = escape_sql_string(template['subject'])
        html_val = escape_sql_string(html_content)
        variables_val = escape_sql_string(json.dumps(template['variables']))
        category_val = escape_sql_string(template['category'])
        
        # Genera INSERT statement
        output.append(f"-- Template: {template['name']}")
        output.append("INSERT INTO document_templates (")
        output.append("    id, name, type, subject, html_content, variables, category, active")
        output.append(") VALUES (")
        output.append(f"    '{id_val}',")
        output.append(f"    '{name_val}',")
        output.append(f"    '{type_val}',")
        output.append(f"    '{subject_val}',")
        output.append(f"    '{html_val}',")
        output.append(f"    '{variables_val}',")
        output.append(f"    '{category_val}',")
        output.append(f"    1")
        output.append(");")
        output.append("")
        
        successful += 1
    
    # Scrivi il file
    output_file = 'migrations/0012_populate_templates_new.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(output))
    
    print()
    print(f"✅ Migrazione generata: {output_file}")
    print(f"   ✓ Template inseriti: {successful}")
    if failed > 0:
        print(f"   ✗ Template saltati: {failed}")
    print(f"   📊 Dimensione: {len('\n'.join(output))} caratteri")
    print()
    print("📝 Prossimi passi:")
    print("   1. Rinomina vecchia migrazione: mv migrations/0012_populate_templates.sql migrations/0012_old.sql.bak")
    print("   2. Attiva nuova migrazione: mv migrations/0012_populate_templates_new.sql migrations/0012_populate_templates.sql")
    print("   3. Applica migrazione: npx wrangler d1 migrations apply telemedcare-leads --local")

if __name__ == '__main__':
    print("🔧 Generazione migrazione 0012 corretta...")
    print()
    generate_migration()
