#!/usr/bin/env python3
"""
Fix HTML encoding issues in email templates.
Converts HTML entities and fixes character encoding problems.
"""

import html
import os
from pathlib import Path

def fix_encoding(content):
    """Fix encoding issues in HTML content."""
    # First, decode HTML entities
    content = html.unescape(content)
    
    # Fix common malformed characters
    # Note: Order matters! More specific patterns first
    replacements = {
        # Italian accented characters
        'Ã¨': 'è',
        'Ã ': 'à',
        'Ã©': 'é',
        'Ã¹': 'ù',
        'Ã²': 'ò',
        'Ã¬': 'ì',
        'Ã¢': 'â',
        'Ã´': 'ô',
        'Ã»': 'û',
        'Ã®': 'î',
        'Ã§': 'ç',
        'Ã±': 'ñ',
        'Ã¼': 'ü',
        'Ã¶': 'ö',
        'Ã¤': 'ä',
        'Ã«': 'ë',
        'Ã¯': 'ï',
        # Symbols
        'â¬': '€',
        'â': '—',
        'â': '"',
        'â': '"',
        'â': ''',
        'â': ''',
        'â¢': '•',
        'â¦': '…',
        'â ï¸': '⚠️',
        'â': '✅',
        # Emojis - using hex codes
        '💚\u00a4': '👤',  # Fix malformed user emoji
        '💚¤': '👤',  # Alternative fix
        '💚¥': '👥',  # Fix malformed group emoji
        '💚¯': '🎯',  # Fix malformed target emoji
        '💚°': '💰',  # Fix malformed money emoji
        # Handlebars conditionals
        '{{#if': '<!-- {{#if',
        '{{/if}}': '{{/if}} -->',
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    return content

def process_template(input_path, output_path):
    """Process a single template file."""
    print(f"Processing: {input_path.name}")
    
    try:
        # Read with UTF-8 encoding
        with open(input_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        # Fix encoding
        fixed_content = fix_encoding(content)
        
        # Write to output
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        
        print(f"  ✅ Saved to: {output_path.name}")
        return True
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    """Main function to process all templates."""
    script_dir = Path(__file__).parent
    input_dir = script_dir / 'templates' / 'email'
    output_dir = script_dir / 'templates' / 'email_cleaned'
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Process all HTML files
    html_files = list(input_dir.glob('*.html'))
    print(f"\n📧 Processing {len(html_files)} email templates...\n")
    
    success = 0
    failed = 0
    
    for input_file in html_files:
        output_file = output_dir / input_file.name
        if process_template(input_file, output_file):
            success += 1
        else:
            failed += 1
    
    print(f"\n{'='*60}")
    print(f"✅ Successfully processed: {success}")
    print(f"❌ Failed: {failed}")
    print(f"📁 Output directory: {output_dir}")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()
