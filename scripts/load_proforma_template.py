#!/usr/bin/env python3
"""
Script per caricare template email_invio_proforma nel database D1
eCura V11.0 - Database Template Loader
"""

import sqlite3
import sys
from pathlib import Path

def load_template_to_db(db_path: str, template_path: str):
    """Carica template email nel database"""
    
    print(f"📁 Database: {db_path}")
    print(f"📄 Template: {template_path}")
    
    # Leggi template HTML
    with open(template_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    print(f"✅ Template letto: {len(html_content)} caratteri")
    
    # Connetti al database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Verifica se template esiste già
    cursor.execute("""
        SELECT id, name FROM document_templates 
        WHERE name = 'email_invio_proforma'
    """)
    existing = cursor.fetchone()
    
    if existing:
        print(f"⚠️  Template esistente trovato (ID: {existing[0]})")
        print("🔄 Aggiornamento template...")
        
        cursor.execute("""
            UPDATE document_templates 
            SET html_content = ?,
                subject = ?,
                updated_at = datetime('now')
            WHERE name = 'email_invio_proforma'
        """, (
            html_content,
            '💰 Proforma eCura {{NUMERO_PROFORMA}} - Completa il Pagamento'
        ))
        
        print(f"✅ Template aggiornato (ID: {existing[0]})")
    else:
        print("➕ Inserimento nuovo template...")
        
        cursor.execute("""
            INSERT INTO document_templates 
            (name, category, subject, html_content, variables, active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        """, (
            'email_invio_proforma',
            'proforma',
            '💰 Proforma eCura {{NUMERO_PROFORMA}} - Completa il Pagamento',
            html_content,
            'NUMERO_PROFORMA,NOME_CLIENTE,COGNOME_CLIENTE,TOTALE,LINK_PAGAMENTO,SERVIZIO_COMPLETO,DISPOSITIVO,SCADENZA_PAGAMENTO,DATA_EMISSIONE,CODICE_CONTRATTO,DETRAZIONE_FISCALE',
            1
        ))
        
        new_id = cursor.lastrowid
        print(f"✅ Template inserito (ID: {new_id})")
    
    # Commit e chiudi
    conn.commit()
    
    # Verifica finale
    cursor.execute("""
        SELECT id, name, category, LENGTH(html_content) as size 
        FROM document_templates 
        WHERE name = 'email_invio_proforma'
    """)
    result = cursor.fetchone()
    
    print(f"\n✅ VERIFICA FINALE:")
    print(f"   ID: {result[0]}")
    print(f"   Nome: {result[1]}")
    print(f"   Categoria: {result[2]}")
    print(f"   Dimensione: {result[3]} caratteri")
    
    conn.close()
    print("\n🎉 Template caricato con successo!")

if __name__ == '__main__':
    # Percorsi di default
    db_path = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/97505df135f15360373d775555b661a51027c29c114a5dec16c15f12103da7d6.sqlite'
    template_path = 'templates/email_cleaned/email_invio_proforma.html'
    
    # Verifica esistenza file
    if not Path(db_path).exists():
        print(f"❌ Database non trovato: {db_path}")
        sys.exit(1)
    
    if not Path(template_path).exists():
        print(f"❌ Template non trovato: {template_path}")
        sys.exit(1)
    
    # Carica template
    try:
        load_template_to_db(db_path, template_path)
    except Exception as e:
        print(f"❌ Errore: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
