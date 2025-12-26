#!/usr/bin/env python3
"""
Update email_documenti_informativi template in local D1 database
"""
import sqlite3
import sys

def update_template():
    # Read template file
    template_path = 'templates/email_cleaned/email_documenti_informativi.html'
    with open(template_path, 'r', encoding='utf-8') as f:
        template_content = f.read()
    
    # Connect to local D1 database (use the one with data)
    db_path = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/97505df135f15360373d775555b661a51027c29c114a5dec16c15f12103da7d6.sqlite'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if template exists
    cursor.execute('SELECT name, length(html_content) as size FROM document_templates WHERE name = ?', ('email_documenti_informativi',))
    existing = cursor.fetchone()
    
    if existing:
        # Update existing template
        cursor.execute('''
            UPDATE document_templates 
            SET html_content = ?, updated_at = datetime('now')
            WHERE name = ?
        ''', (template_content, 'email_documenti_informativi'))
        print(f"✅ Template UPDATED:")
        print(f"   Name: {existing[0]}")
        print(f"   Old Size: {existing[1]} bytes")
        print(f"   New Size: {len(template_content)} bytes")
    else:
        # Insert new template
        cursor.execute('''
            INSERT INTO document_templates (
                name, category, description, version,
                html_content, variables,
                subject, from_name,
                active, is_default, author
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            'email_documenti_informativi',
            'EMAIL',
            'Email con brochure e manuale informativo',
            '1.0',
            template_content,
            '["NOME_CLIENTE", "COGNOME_CLIENTE", "TIPO_SERVIZIO", "DATA_RICHIESTA", "PREZZO_PIANO"]',
            'Documentazione TeleMedCare - {{TIPO_SERVIZIO}}',
            'TeleMedCare',
            1,
            0,
            'system'
        ))
        print(f"✅ Template INSERTED:")
        print(f"   Name: email_documenti_informativi")
        print(f"   Size: {len(template_content)} bytes")
    
    conn.commit()
    
    # Verify update
    cursor.execute('SELECT name, length(html_content) as size, updated_at FROM document_templates WHERE name = ?', ('email_documenti_informativi',))
    result = cursor.fetchone()
    
    if result:
        print(f"\n✅ Verification successful:")
        print(f"   Name: {result[0]}")
        print(f"   Size: {result[1]} bytes")
        print(f"   Updated at: {result[2]}")
    else:
        print("\n❌ Template not found after update")
        sys.exit(1)
    
    conn.close()

if __name__ == '__main__':
    try:
        update_template()
    except Exception as e:
        print(f"❌ Error updating template: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
