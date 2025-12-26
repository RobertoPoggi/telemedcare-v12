#!/usr/bin/env python3
"""
Script per caricare template email_promemoria.html nel database
Email inviata per ricordare scadenza e rinnovo servizio (30/15/7/1 giorni prima)
"""

import sqlite3
import sys

# Database path (Cloudflare D1 local)
DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/97505df135f15360373d775555b661a51027c29c114a5dec16c15f12103da7d6.sqlite'

# Template path
TEMPLATE_PATH = 'templates/email_cleaned/email_promemoria.html'

def load_template():
    """Carica template email_promemoria nel database"""
    
    # 1. Leggi template HTML
    try:
        with open(TEMPLATE_PATH, 'r', encoding='utf-8') as f:
            template_content = f.read()
        print(f"✅ Template letto: {TEMPLATE_PATH} ({len(template_content)} caratteri)")
    except FileNotFoundError:
        print(f"❌ Template non trovato: {TEMPLATE_PATH}")
        sys.exit(1)
    
    # 2. Connetti al database
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        print(f"✅ Connesso al database: {DB_PATH}")
    except sqlite3.Error as e:
        print(f"❌ Errore connessione DB: {e}")
        sys.exit(1)
    
    # 3. Verifica se esiste già
    cursor.execute("SELECT id FROM document_templates WHERE name = ?", ('email_promemoria',))
    existing = cursor.fetchone()
    
    if existing:
        # Update
        cursor.execute("""
            UPDATE document_templates 
            SET html_content = ?, subject = ?, updated_at = CURRENT_TIMESTAMP
            WHERE name = 'email_promemoria'
        """, (template_content, 'Promemoria Scadenza Servizio eCura - Rinnovo'))
        print(f"✅ Template 'email_promemoria' aggiornato (ID: {existing[0]})")
    else:
        # Insert
        cursor.execute("""
            INSERT INTO document_templates (name, category, subject, html_content, active, created_at, updated_at)
            VALUES ('email_promemoria', 'promemoria', ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """, ('Promemoria Scadenza Servizio eCura - Rinnovo', template_content))
        template_id = cursor.lastrowid
        print(f"✅ Template 'email_promemoria' inserito (ID: {template_id})")
    
    # 4. Commit e chiudi
    conn.commit()
    conn.close()
    
    # 5. Mostra variabili template
    print("\n📋 Variabili template rilevate:")
    variables = [
        'NOME_CLIENTE',
        'TIPO_PROMEMORIA',
        'MESSAGGIO_PRINCIPALE',
        'DATA_SCADENZA',
        'GIORNI_RIMANENTI',
        'CLASSE_URGENZA',
        'PIANO_SERVIZIO',
        'COSTO_RINNOVO',
        'CODICE_CLIENTE',
        'RISPARMIO_FISCALE',
        'IBAN_AZIENDALE'
    ]
    for var in variables:
        if f'{{{{{var}}}}}' in template_content:
            print(f"  ✓ {{{{{var}}}}}")
    
    print("\n✅ Template 'email_promemoria' pronto per l'uso!")
    print("💡 Usare in: Sistema automatico promemoria rinnovo (cron job)")
    print("📅 Inviare a: 30, 15, 7, 1 giorni prima della scadenza")

if __name__ == '__main__':
    load_template()
