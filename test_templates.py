#!/usr/bin/env python3
"""
Test script to verify email templates and placeholder substitution
"""

import sqlite3
import re
from datetime import datetime

# Database path
DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/fefe357b0d78a8ad7bf1258d7c2ab0cf7acae5732cacf8116cc3090278c88fca.sqlite'

# Test data
TEST_LEAD_DATA = {
    'NOME_CLIENTE': 'Mario',
    'COGNOME_CLIENTE': 'Rossi',
    'NOME_RICHIEDENTE': 'Mario',
    'COGNOME_RICHIEDENTE': 'Rossi',
    'EMAIL_RICHIEDENTE': 'mario.rossi@example.com',
    'TELEFONO_RICHIEDENTE': '+39 123 456 7890',
    'CF_RICHIEDENTE': 'RSSMRA80A01H501X',
    'INDIRIZZO_RICHIEDENTE': 'Via Roma 123',
    'CAP_RICHIEDENTE': '00100',
    'CITTA_RICHIEDENTE': 'Roma',
    'PROVINCIA_RICHIEDENTE': 'RM',
    'DATA_NASCITA_RICHIEDENTE': '01/01/1980',
    'LUOGO_NASCITA_RICHIEDENTE': 'Roma',
    'NOME_ASSISTITO': 'Giuseppe',
    'COGNOME_ASSISTITO': 'Rossi',
    'EMAIL_ASSISTITO': 'giuseppe.rossi@example.com',
    'TELEFONO_ASSISTITO': '+39 098 765 4321',
    'ETA_ASSISTITO': '85',
    'CF_ASSISTITO': 'RSSGPP40A01H501Y',
    'INDIRIZZO_ASSISTITO': 'Via Milano 456',
    'CAP_ASSISTITO': '20100',
    'CITTA_ASSISTITO': 'Milano',
    'PROVINCIA_ASSISTITO': 'MI',
    'DATA_NASCITA_ASSISTITO': '01/01/1940',
    'LUOGO_NASCITA_ASSISTITO': 'Milano',
    'PIANO_SERVIZIO': 'TeleMedCare Premium',
    'TIPO_SERVIZIO': 'Telemedicina Completa',
    'PREZZO_PIANO': '99.00€',
    'CODICE_CLIENTE': 'TMC-2025-001',
    'CODICE_DISPOSITIVO': 'SIDLY-001',
    'NUMERO_PROFORMA': 'PRF-2025-001',
    'DATA_ATTIVAZIONE': '08/11/2025',
    'DATA_EMISSIONE': '08/11/2025',
    'DATA_SCADENZA': '08/12/2025',
    'DATA_RICHIESTA': '08/11/2025',
    'ORA_RICHIESTA': '11:55',
    'TIMESTAMP_COMPLETO': '2025-11-08 11:55:00',
    'LEAD_ID': 'LEAD-2025-001',
    'FONTE': 'Website',
    'INTESTAZIONE_CONTRATTO': 'Contratto TeleMedCare Premium',
    'VUOLE_CONTRATTO': 'Sì',
    'VUOLE_BROCHURE': 'Sì',
    'VUOLE_MANUALE': 'Sì',
    'CONDIZIONI_SALUTE': 'Monitoraggio cardiaco',
    'URGENZA_RISPOSTA': 'Alta',
    'GIORNI_RISPOSTA': '2',
    'PREFERENZA_CONTATTO': 'Email',
    'NOTE_AGGIUNTIVE': 'Cliente richiede attivazione rapida',
    'IMPORTO_DOVUTO': '99.00€',
    'LINK_CONFIGURAZIONE': 'https://telemedcare.it/config/TMC-2025-001',
    'LINK_FIRMA_CONTRATTO': 'https://telemedcare.it/firma/TMC-2025-001',
    'LINK_PAGAMENTO': 'https://telemedcare.it/pagamento/TMC-2025-001',
    'URL_PAGAMENTO': 'https://telemedcare.it/pagamento/TMC-2025-001',
    'MESSAGGIO': 'Gentile Cliente, ti ricordiamo di completare il pagamento.',
    'BROCHURE_HTML': '<p>Brochure TeleMedCare</p>',
    'MANUALE_HTML': '<p>Manuale Utente</p>',
}

def substitute_placeholders(text, data):
    """Substitute all placeholders in text with data values"""
    if not text:
        return text
    
    result = text
    for key, value in data.items():
        placeholder = f"{{{{{key}}}}}"
        result = result.replace(placeholder, str(value))
    
    return result

def main():
    print("=" * 80)
    print("🧪 TEST EMAIL TEMPLATES - PLACEHOLDER SUBSTITUTION")
    print("=" * 80)
    
    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get all templates
    cursor.execute("""
        SELECT id, name, type, subject, html_content, variables 
        FROM document_templates 
        ORDER BY name
    """)
    templates = cursor.fetchall()
    
    print(f"\n📊 Found {len(templates)} templates in database\n")
    
    total_placeholders = 0
    total_substituted = 0
    total_missing = 0
    
    for template_id, name, type_val, subject, html_content, variables in templates:
        print(f"\n{'─' * 80}")
        print(f"📧 Template: {name}")
        print(f"   ID: {template_id}")
        print(f"   Type: {type_val}")
        print(f"   Subject: {subject}")
        
        # Find all placeholders in subject and content
        placeholders_in_subject = set(re.findall(r'\{\{([A-Z_]+)\}\}', subject or ''))
        placeholders_in_html = set(re.findall(r'\{\{([A-Z_]+)\}\}', html_content or ''))
        all_placeholders = sorted(placeholders_in_subject | placeholders_in_html)
        
        total_placeholders += len(all_placeholders)
        
        print(f"\n   📝 Placeholders found: {len(all_placeholders)}")
        
        # Check which placeholders we can substitute
        can_substitute = []
        cannot_substitute = []
        
        for placeholder in all_placeholders:
            if placeholder in TEST_LEAD_DATA:
                can_substitute.append(placeholder)
                total_substituted += 1
            else:
                cannot_substitute.append(placeholder)
                total_missing += 1
        
        if can_substitute:
            print(f"   ✅ Can substitute ({len(can_substitute)}):")
            for p in can_substitute[:5]:  # Show first 5
                print(f"      - {p} → {TEST_LEAD_DATA[p][:30]}...")
            if len(can_substitute) > 5:
                print(f"      ... and {len(can_substitute) - 5} more")
        
        if cannot_substitute:
            print(f"   ⚠️  Missing test data ({len(cannot_substitute)}):")
            for p in cannot_substitute:
                print(f"      - {p}")
        
        # Test substitution
        substituted_subject = substitute_placeholders(subject, TEST_LEAD_DATA)
        substituted_html = substitute_placeholders(html_content, TEST_LEAD_DATA)
        
        # Check if any placeholders remain
        remaining_in_subject = re.findall(r'\{\{([A-Z_]+)\}\}', substituted_subject or '')
        remaining_in_html = re.findall(r'\{\{([A-Z_]+)\}\}', substituted_html or '')
        remaining = set(remaining_in_subject + remaining_in_html)
        
        if remaining:
            print(f"   ❌ {len(remaining)} placeholders NOT substituted:")
            for p in sorted(remaining):
                print(f"      - {p}")
        else:
            print(f"   ✅ ALL placeholders substituted successfully!")
    
    # Summary
    print(f"\n{'═' * 80}")
    print(f"📊 SUMMARY")
    print(f"{'═' * 80}")
    print(f"Total templates: {len(templates)}")
    print(f"Total placeholders: {total_placeholders}")
    print(f"Can substitute: {total_substituted} ({total_substituted/total_placeholders*100:.1f}%)")
    print(f"Missing test data: {total_missing} ({total_missing/total_placeholders*100:.1f}%)")
    
    if total_missing == 0:
        print(f"\n✅ ALL PLACEHOLDERS CAN BE SUBSTITUTED!")
    else:
        print(f"\n⚠️  Some placeholders need additional test data")
    
    conn.close()

if __name__ == '__main__':
    main()
