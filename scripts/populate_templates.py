#!/usr/bin/env python3
"""
Script to populate document_templates table in D1 database
Reads templates from /templates/ directory and generates SQL INSERT statements
"""

import json
import os
from pathlib import Path

# Template definitions with metadata
TEMPLATES = [
    {
        "name": "email_notifica_info",
        "category": "EMAIL",
        "description": "Email di notifica info a TelemedCare con tutti i dati del lead",
        "subject": "Nuova Richiesta di Informazioni - {{NOME_RICHIEDENTE}} {{COGNOME_RICHIEDENTE}}",
        "from_name": "TelemedCare Sistema",
        "file": "templates/email_cleaned/email_notifica_info.html",
        "variables": [
            "NOME_RICHIEDENTE", "COGNOME_RICHIEDENTE", "EMAIL_RICHIEDENTE", "TELEFONO_RICHIEDENTE",
            "NOME_ASSISTITO", "COGNOME_ASSISTITO", "ETA_ASSISTITO",
            "TIPO_SERVIZIO", "PIANO_SERVIZIO", "PREZZO_PIANO",
            "VUOLE_BROCHURE", "VUOLE_MANUALE", "VUOLE_CONTRATTO",
            "FONTE_RICHIESTA", "DATA_RICHIESTA", "ORA_RICHIESTA",
            "CONSENSO_PRIVACY", "CONSENSO_MARKETING", "CONSENSO_TERZE",
            "VERSIONE_SISTEMA", "CONDIZIONI_SALUTE", "NOTE_AGGIUNTIVE"
        ]
    },
    {
        "name": "email_documenti_informativi",
        "category": "EMAIL",
        "description": "Email con brochure e manuale informativo (solo richiesta info)",
        "subject": "Documentazione TelemedCare - {{TIPO_SERVIZIO}}",
        "from_name": "TelemedCare",
        "file": "templates/email_cleaned/email_documenti_informativi.html",
        "variables": [
            "NOME_RICHIEDENTE", "COGNOME_RICHIEDENTE", "TIPO_SERVIZIO",
            "LINK_BROCHURE", "LINK_MANUALE"
        ]
    },
    {
        "name": "email_invio_contratto",
        "category": "EMAIL",
        "description": "Email con contratto da firmare digitalmente",
        "subject": "Contratto TelemedCare - {{CODICE_CONTRATTO}}",
        "from_name": "TelemedCare",
        "file": "templates/email_cleaned/email_invio_contratto.html",
        "variables": [
            "NOME_RICHIEDENTE", "COGNOME_RICHIEDENTE", "CODICE_CONTRATTO",
            "TIPO_CONTRATTO", "PREZZO_MENSILE", "DURATA_MESI",
            "LINK_FIRMA", "SCADENZA_FIRMA"
        ]
    },
    {
        "name": "email_invio_proforma",
        "category": "EMAIL",
        "description": "Email con proforma per pagamento",
        "subject": "Proforma {{NUMERO_PROFORMA}} - TelemedCare",
        "from_name": "TelemedCare Amministrazione",
        "file": "templates/email_cleaned/email_invio_proforma.html",
        "variables": [
            "NOME_CLIENTE", "COGNOME_CLIENTE", "NUMERO_PROFORMA",
            "DATA_EMISSIONE", "DATA_SCADENZA", "SCADENZA_PAGAMENTO",
            "TIPO_SERVIZIO", "PREZZO_MENSILE", "DURATA_MESI", "PREZZO_TOTALE", "IMPORTO_TOTALE",
            "IBAN", "CAUSALE", "LINK_PAGAMENTO", "LINK_PROFORMA_PDF"
        ]
    },
    {
        "name": "email_benvenuto",
        "category": "EMAIL",
        "description": "Email di benvenuto dopo pagamento con link configurazione",
        "subject": "Benvenuto in TelemedCare!",
        "from_name": "TelemedCare Team",
        "file": "templates/email_cleaned/email_benvenuto.html",
        "variables": [
            "NOME_RICHIEDENTE", "COGNOME_RICHIEDENTE", "NOME_ASSISTITO", "COGNOME_ASSISTITO",
            "TIPO_SERVIZIO", "LINK_CONFIGURAZIONE", "NUMERO_SUPPORTO"
        ]
    },
    {
        "name": "email_conferma",
        "category": "EMAIL",
        "description": "Email di conferma generica (deprecated - sostituito da email_configurazione)",
        "subject": "Conferma Attivazione TelemedCare",
        "from_name": "TelemedCare",
        "file": "templates/email_cleaned/email_conferma.html",
        "variables": [
            "NOME_CLIENTE", "COGNOME_CLIENTE"
        ]
    },
    {
        "name": "email_conferma_attivazione",
        "category": "EMAIL",
        "description": "Email di conferma attivazione servizio dopo associazione dispositivo",
        "subject": "Servizio Attivato - TelemedCare",
        "from_name": "TelemedCare Team",
        "file": "templates/email_cleaned/email_conferma_attivazione.html",
        "variables": [
            "NOME_ASSISTITO", "COGNOME_ASSISTITO", "TIPO_SERVIZIO",
            "DATA_ATTIVAZIONE", "MODELLO_DISPOSITIVO", "IMEI_DISPOSITIVO", "NUMERO_SIM",
            "NUMERO_SUPPORTO", "EMAIL_SUPPORTO"
        ]
    },
    {
        "name": "email_configurazione",
        "category": "EMAIL",
        "description": "Email per invio form configurazione compilato dal richiedente a info@",
        "subject": "Nuova Configurazione Cliente - {{NOME_RICHIEDENTE}} {{COGNOME_RICHIEDENTE}}",
        "from_name": "TelemedCare Sistema",
        "file": "templates/email_configurazione.html",
        "variables": [
            "NOME_RICHIEDENTE", "COGNOME_RICHIEDENTE", "EMAIL_RICHIEDENTE", "TELEFONO_RICHIEDENTE",
            "NOME_ASSISTITO", "COGNOME_ASSISTITO", "DATA_NASCITA_ASSISTITO", "CF_ASSISTITO",
            "INDIRIZZO", "CITTA", "CAP", "PROVINCIA",
            "CONTATTO_EMERGENZA_1_NOME", "CONTATTO_EMERGENZA_1_TEL", "CONTATTO_EMERGENZA_1_PARENTELA",
            "CONTATTO_EMERGENZA_2_NOME", "CONTATTO_EMERGENZA_2_TEL", "CONTATTO_EMERGENZA_2_PARENTELA",
            "MEDICO_CURANTE", "CENTRO_MEDICO", "CONDIZIONI_SALUTE", "NOTE_MEDICHE",
            "DATA_CONFIGURAZIONE"
        ]
    },
    {
        "name": "form_configurazione",
        "category": "FORM",
        "description": "Form HTML per configurazione dati cliente dopo pagamento",
        "subject": None,
        "from_name": None,
        "file": "templates/form_configurazione.html",
        "variables": [
            "NOME_RICHIEDENTE", "COGNOME_RICHIEDENTE", "EMAIL_RICHIEDENTE", "TELEFONO_RICHIEDENTE",
            "NOME_ASSISTITO", "COGNOME_ASSISTITO", "LEAD_ID", "CONTRACT_ID"
        ]
    },
    {
        "name": "automazione_lead",
        "category": "FORM",
        "description": "Sistema di automazione per importazione lead da email partner",
        "subject": None,
        "from_name": None,
        "file": "templates/automazione_lead.html",
        "variables": [
            "PARTNER_NAME", "EMAIL_SOURCE", "LEAD_DATA", "PARSED_FIELDS"
        ]
    }
]

def escape_sql_string(text):
    """Escape single quotes for SQL"""
    if text is None:
        return "NULL"
    return "'" + text.replace("'", "''") + "'"

def read_template_file(filepath):
    """Read template file content"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return None

def generate_sql_inserts():
    """Generate SQL INSERT statements for all templates"""
    
    sql_statements = []
    sql_statements.append("-- Populate document_templates table")
    sql_statements.append("-- Generated: 2025-10-18")
    sql_statements.append("")
    
    for template in TEMPLATES:
        # Read template content
        content = read_template_file(template["file"])
        if content is None:
            continue
        
        # Build INSERT statement
        variables_json = json.dumps(template["variables"], ensure_ascii=False)
        
        sql = f"""INSERT INTO document_templates (
    name, category, description, version,
    html_content, variables,
    subject, from_name,
    active, is_default, author
) VALUES (
    {escape_sql_string(template['name'])},
    {escape_sql_string(template['category'])},
    {escape_sql_string(template['description'])},
    '1.0',
    {escape_sql_string(content)},
    {escape_sql_string(variables_json)},
    {escape_sql_string(template['subject'])},
    {escape_sql_string(template['from_name'])},
    1,
    0,
    'system'
);"""
        
        sql_statements.append(sql)
        sql_statements.append("")
        print(f"✅ Generated INSERT for: {template['name']}")
    
    return "\n".join(sql_statements)

def main():
    print("🔄 Generating SQL to populate document_templates...")
    print()
    
    # Change to script directory
    script_dir = Path(__file__).parent.parent
    os.chdir(script_dir)
    
    # Generate SQL
    sql_content = generate_sql_inserts()
    
    # Write to migration file
    output_file = "migrations/0012_populate_templates.sql"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print()
    print(f"✅ SQL migration created: {output_file}")
    print(f"📊 Total templates: {len(TEMPLATES)}")
    print()
    print("Next steps:")
    print("  1. Review the generated SQL file")
    print("  2. Apply migration: npx wrangler d1 execute telemedcare-leads --local --file=migrations/0012_populate_templates.sql")

if __name__ == "__main__":
    main()
