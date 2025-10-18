#!/usr/bin/env python3
"""
Final template encoding fix - handles double-encoded UTF-8
"""

from pathlib import Path

def fix_double_encoded_utf8(data):
    """Fix double-encoded UTF-8 bytes."""
    # The file contains UTF-8 bytes that were interpreted as Latin-1 and then saved as UTF-8
    # We need to decode as UTF-8, then encode as Latin-1, then decode as UTF-8 again
    
    try:
        # First decode from UTF-8 (what's currently in the file)
        text = data.decode('utf-8')
        # Re-encode as Latin-1 (this gets us the original bytes)
        latin1_bytes = text.encode('latin-1', errors='ignore')
        # Now decode properly as UTF-8
        fixed_text = latin1_bytes.decode('utf-8', errors='replace')
        return fixed_text
    except:
        # Fallback: just decode as UTF-8 with replacement
        return data.decode('utf-8', errors='replace')

def process_template(input_file, output_file):
    """Process a single template."""
    print(f"Processing: {input_file.name}")
    
    try:
        # Read as binary
        with open(input_file, 'rb') as f:
            data = f.read()
        
        # Fix encoding
        fixed = fix_double_encoded_utf8(data)
        
        # Write as UTF-8
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(fixed)
        
        print(f"  ✅ Saved: {output_file.name}")
        return True
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    """Main function."""
    base = Path(__file__).parent
    input_dir = base / 'templates' / 'email'
    output_dir = base / 'templates' / 'email_cleaned'
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    templates = list(input_dir.glob('*.html'))
    print(f"\n📧 Fixing {len(templates)} templates...\n")
    
    success = 0
    for t in templates:
        if process_template(t, output_dir / t.name):
            success += 1
    
    print(f"\n{'='*60}")
    print(f"✅ Success: {success}/{len(templates)}")
    print(f"📁 Output: {output_dir}")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()
