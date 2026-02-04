#!/bin/bash
# Analisi template con date Git reali e identificazione duplicati

echo "🔍 ANALISI TEMPLATE CON DATE REALI E DUPLICATI"
echo "=============================================="
echo ""

# Funzione per ottenere la data reale da Git
get_git_date() {
  local file="$1"
  # Data primo commit (creazione)
  created=$(git log --follow --format=%aI --reverse "$file" 2>/dev/null | head -1)
  # Data ultimo commit (modifica)
  modified=$(git log -1 --format=%aI "$file" 2>/dev/null)
  
  if [ -n "$created" ]; then
    echo "Created: $created | Modified: $modified"
  else
    echo "Not in Git (new file)"
  fi
}

# Funzione per calcolare MD5 hash
get_hash() {
  md5sum "$1" 2>/dev/null | awk '{print $1}'
}

echo "📧 TEMPLATE EMAIL - Analisi completa"
echo "===================================="
echo ""

# Analizza email_notifica_info.html nelle 3 cartelle
echo "Esempio: email_notifica_info.html"
echo ""

for path in "templates/email_notifica_info.html" \
            "templates/email/email_notifica_info.html" \
            "templates/email_cleaned/email_notifica_info.html"; do
  if [ -f "$path" ]; then
    size=$(stat -c%s "$path")
    hash=$(get_hash "$path")
    echo "📄 $path"
    echo "   Size: $size bytes | Hash: ${hash:0:8}..."
    echo "   $(get_git_date "$path")"
    echo ""
  fi
done

echo ""
echo "📊 Trova tutti i duplicati per contenuto (stesso hash MD5):"
echo "==========================================================="
echo ""

# Crea lista file con hash
temp_file=$(mktemp)
find templates/ -name "email_*.html" -type f -exec md5sum {} \; | sort > "$temp_file"

# Trova hash duplicati
duplicates=$(awk '{print $1}' "$temp_file" | sort | uniq -d)

if [ -n "$duplicates" ]; then
  for hash in $duplicates; do
    echo "Hash: $hash"
    grep "^$hash" "$temp_file" | awk '{$1=""; print "  -"$0}'
    echo ""
  done
else
  echo "Nessun duplicato identico trovato (hash diversi)"
fi

rm -f "$temp_file"

echo ""
echo "📅 Date Git per template principali:"
echo "====================================="
echo ""

for file in templates/email_notifica_info.html \
            templates/email_invio_contratto.html \
            templates/email_documenti_informativi.html; do
  if [ -f "$file" ]; then
    echo "📄 $file"
    get_git_date "$file"
    echo ""
  fi
done

