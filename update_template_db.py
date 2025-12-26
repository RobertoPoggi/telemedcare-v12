#!/usr/bin/env python3
"""
Update email_notifica_info template in local D1 database
"""
import sqlite3
import sys

def update_template():
    # Read template file
    template_path = 'templates/email_cleaned/email_notifica_info.html'
    with open(template_path, 'r', encoding='utf-8') as f:
        template_content = f.read()
    
    # Connect to local D1 database
    db_path = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/b0cf46b78f16cb0e6d370e3c2aed0cbbc0c43b2cc8aea5ac4b6ce9a8f0d44ff0.sqlite'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Update template
    cursor.execute('''
        UPDATE document_templates 
        SET html_content = ?, updated_at = datetime('now')
        WHERE name = ?
    ''', (template_content, 'email_notifica_info'))
    
    conn.commit()
    
    # Verify update
    cursor.execute('SELECT name, length(html_content) as size, updated_at FROM document_templates WHERE name = ?', ('email_notifica_info',))
    result = cursor.fetchone()
    
    if result:
        print(f"✅ Template updated successfully:")
        print(f"   Name: {result[0]}")
        print(f"   Size: {result[1]} bytes")
        print(f"   Updated at: {result[2]}")
    else:
        print("❌ Template not found")
        sys.exit(1)
    
    conn.close()

if __name__ == '__main__':
    try:
        update_template()
    except Exception as e:
        print(f"❌ Error updating template: {e}")
        sys.exit(1)
