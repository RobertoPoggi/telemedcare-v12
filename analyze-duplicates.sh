#!/bin/bash
# Script per analizzare duplicati template TeleMedCare V12

echo "🔍 ANALISI DUPLICATI TEMPLATE TELEMEDCARE V12"
echo "=============================================="
echo ""

# 1. Template Email Duplicati
echo "📧 TEMPLATE EMAIL:"
echo "Confronto dimensioni file..."
echo ""

for file in templates/email_*.html; do
  if [ -f "$file" ]; then
    basename_file=$(basename "$file")
    size_root=$(stat -c%s "$file" 2>/dev/null || echo "0")
    
    # Cerca duplicati in altre cartelle
    duplicates=""
    if [ -f "templates/email/$basename_file" ]; then
      size_dup=$(stat -c%s "templates/email/$basename_file")
      diff_size=$((size_root - size_dup))
      duplicates="$duplicates\n  templates/email/$basename_file ($size_dup bytes, diff: $diff_size)"
    fi
    
    if [ -f "templates/email_cleaned/$basename_file" ]; then
      size_dup=$(stat -c%s "templates/email_cleaned/$basename_file")
      diff_size=$((size_root - size_dup))
      duplicates="$duplicates\n  templates/email_cleaned/$basename_file ($size_dup bytes, diff: $diff_size)"
    fi
    
    if [ -n "$duplicates" ]; then
      echo "File: $basename_file ($size_root bytes)"
      echo -e "Duplicati:$duplicates"
      echo ""
    fi
  fi
done

# 2. Dashboard HTML
echo ""
echo "📊 DASHBOARD HTML:"
find public/ -name "dashboard*.html" -exec ls -lh {} \; | awk '{print $9, $5}'
echo ""

# 3. Moduli Backup
echo ""
echo "💾 MODULI BACKUP:"
find src/modules/ -name "*.backup*" -o -name "*.bak" | while read file; do
  size=$(stat -c%s "$file")
  echo "$file ($size bytes)"
done
echo ""

# 4. Contratti DOCX
echo ""
echo "📄 CONTRATTI DOCX:"
find . -name "Template_Contratto_*.docx" -not -path "*/node_modules/*" -not -path "*/.git/*" -exec ls -lh {} \; | awk '{print $9, $5}'
echo ""

# 5. Riepilogo
echo ""
echo "📊 RIEPILOGO TOTALE:"
echo "==================="

total_email=$(find templates/ -name "email_*.html" | wc -l)
total_dashboard=$(find public/ -name "dashboard*.html" | wc -l)
total_backup=$(find src/modules/ -name "*.backup*" -o -name "*.bak" | wc -l)
total_contracts=$(find . -name "Template_Contratto_*.docx" -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l)

echo "Template Email: $total_email file"
echo "Dashboard HTML: $total_dashboard file"
echo "Moduli Backup: $total_backup file"
echo "Contratti DOCX: $total_contracts file"
echo ""

echo "✅ Analisi completata!"
