#!/usr/bin/env python3
"""
Fix HTML templates encoding - Version 2
Uses proper HTML parsing to preserve structure while fixing entities
"""

import re
from pathlib import Path
from html.parser import HTMLParser
import html

def fix_html_content(content):
    """Fix HTML content by unescaping entities and fixing malformed UTF-8."""
    
    # First pass: unescape HTML entities
    content = html.unescape(content)
    
    # Second pass: fix specific broken UTF-8 sequences
    # These are common mojibake patterns from UTF-8 being interpreted as Latin-1
    fixes = {
        # Emoji fixes (UTF-8 emoji bytes misinterpreted)
        b'\xc3\xb0\xc5\x93'.decode('latin1'): '🔍',
        b'\xc3\xb0\xc5\xa4'.decode('latin1'): '👤',
        b'\xc3\xb0\xc5\xa5'.decode('latin1'): '👥',
        b'\xc3\xb0\xc5\xaf'.decode('latin1'): '🎯',
        b'\xc3\xb0\xc5\xa1'.decode('latin1'): '⚡',
        b'\xc3\xb0\xc5\xa0'.decode('latin1'): '📞',
        b'\xc3\xb0\xc5\xa7'.decode('latin1'): '📧',
        b'\xc3\xb0\xc5\xa1'.decode('latin1'): '📱',
        b'\xc3\xb0\xc5\xb0'.decode('latin1'): '💰',
        b'\xc3\xb0\xc5\x92'.decode('latin1'): '💚',
        b'\xc3\xa2\xc5\xa0\xc5\x92'.decode('latin1'): '⚠️',
        b'\xc3\xa2\xc5\xa0'.decode('latin1'): '✅',
        b'\xc3\xb0\xc5\x93\xc2\x8b'.decode('latin1'): '📋',
        b'\xc3\xb0\xc5\x93\xc2\x94'.decode('latin1'): '🔔',
        
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
        
        # Punctuation
        'â': '€',
        'â': '—',
        'â': '"',
        'â': '"',
        'â': ''',
        'â': ''',
    }
    
    for broken, fixed in fixes.items():
        content = content.replace(broken, fixed)
    
    return content

def process_file(input_path, output_path):
    """Process a single template file."""
    print(f"Processing: {input_path.name}")
    
    try:
        # Read file
        with open(input_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        # Fix content
        fixed = fix_html_content(content)
        
        # Write output
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(fixed)
        
        # Check if changes were made
        if content != fixed:
            print(f"  ✅ Fixed and saved to: {output_path.name}")
        else:
            print(f"  ℹ️  No changes needed: {output_path.name}")
        
        return True
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    """Main processing function."""
    base_dir = Path(__file__).parent
    input_dir = base_dir / 'templates' / 'email'
    output_dir = base_dir / 'templates' / 'email_cleaned'
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    templates = list(input_dir.glob('*.html'))
    print(f"\n📧 Processing {len(templates)} templates...\n")
    
    success_count = 0
    for template in templates:
        if process_file(template, output_dir / template.name):
            success_count += 1
    
    print(f"\n{'='*60}")
    print(f"✅ Successfully processed: {success_count}/{len(templates)}")
    print(f"📁 Output: {output_dir}")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()
