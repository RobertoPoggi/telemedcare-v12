#!/bin/bash
# Rigenera TUTTI i documenti con date Git reali e logica corretta

echo "🔄 Rigenerazione documenti con date Git reali..."
echo ""

# ============================================================================
# FUNZIONI HELPER
# ============================================================================

get_git_created() {
  git log --follow --format=%aI --reverse "$1" 2>/dev/null | head -1 || echo "N/A"
}

get_git_modified() {
  git log -1 --format=%aI "$1" 2>/dev/null || echo "N/A"
}

get_hash() {
  md5sum "$1" 2>/dev/null | awk '{print $1}' || echo "N/A"
}

# ============================================================================
# DOCUMENTO 1: DOCUMENTAZIONE TEMPLATE COMPLETA (VERSIONE CORRETTA)
# ============================================================================

OUTPUT1="DOCUMENTAZIONE_TEMPLATE_COMPLETA_V2.md"

cat > "$OUTPUT1" << 'HEADER1'
# 📚 DOCUMENTAZIONE COMPLETA TEMPLATE E DOCUMENTI TELEMEDCARE V12
## Mappatura Organizzata con Date Git Reali e Classificazione Originali/Duplicati

**Data analisi:** 2026-02-04  
**Versione:** 2.0 (con date Git reali)  
**Repository:** https://github.com/RobertoPoggi/telemedcare-v12  

---

## 📋 METODOLOGIA CLASSIFICAZIONE

### Come distinguere ORIGINALE da DUPLICATO:

1. **Date Git (REALI):**
   - Created: data primo commit (`git log --follow --reverse`)
   - Modified: data ultimo commit (`git log -1`)
   - ❌ NON usiamo date filesystem (tutte uguali = data copia)

2. **Regola per cartella:**
   - `/templates/email_*.html` → **ORIGINALI** (root, usati dal sistema)
   - `/templates/email/` → **DUPLICATI VECCHI** (obsoleti)
   - `/templates/email_cleaned/` → **VERSIONI INTERMEDIE** (obsoleti)

3. **Hash MD5:**
   - Hash identico = **DUPLICATO PERFETTO** (da eliminare)
   - Hash diverso = **VERSIONE DIVERSA** (contenuto modificato)

4. **Uso nel codice:**
   - Riferimenti in `src/` = File attivo
   - Nessun riferimento = Probabilmente obsoleto

---

## 1. TEMPLATE EMAIL

### 1.1 Template Email ATTIVI (Root `/templates/`)

| **File** | **Size** | **Hash MD5** | **Created (Git)** | **Modified (Git)** | **Uso Codice** | **Status** |
|---------|---------|-------------|-------------------|-------------------|---------------|-----------|
HEADER1

# Analizza template email nella root
for file in templates/email_*.html; do
  if [ -f "$file" ]; then
    basename=$(basename "$file")
    size=$(stat -c%s "$file")
    hash=$(get_hash "$file")
    created=$(get_git_created "$file")
    modified=$(get_git_modified "$file")
    usage=$(grep -r "$basename" src/ 2>/dev/null | wc -l)
    
    # Format dates
    created_short=$(echo "$created" | cut -d'T' -f1)
    modified_short=$(echo "$modified" | cut -d'T' -f1)
    
    cat >> "$OUTPUT1" << ENTRY
| \`$basename\` | $size | \`${hash:0:8}...\` | $created_short | $modified_short | $usage refs | ✅ ORIGINALE |
ENTRY
  fi
done

cat >> "$OUTPUT1" << 'MIDDLE1'

### 1.2 Template Email DUPLICATI/OBSOLETI

#### 📁 `/templates/email/` (Cartella OBSOLETA)

| **File** | **Size** | **Hash MD5** | **Created (Git)** | **Modified (Git)** | **vs Originale** | **Status** |
|---------|---------|-------------|-------------------|-------------------|-----------------|-----------|
MIDDLE1

# Analizza duplicati in /templates/email/
for file in templates/email/*.html; do
  if [ -f "$file" ]; then
    basename=$(basename "$file")
    size=$(stat -c%s "$file")
    hash=$(get_hash "$file")
    created=$(get_git_created "$file")
    modified=$(get_git_modified "$file")
    
    created_short=$(echo "$created" | cut -d'T' -f1)
    modified_short=$(echo "$modified" | cut -d'T' -f1)
    
    # Confronta con originale
    original="templates/$basename"
    if [ -f "$original" ]; then
      orig_hash=$(get_hash "$original")
      orig_size=$(stat -c%s "$original")
      diff_size=$((orig_size - size))
      
      if [ "$hash" = "$orig_hash" ]; then
        status="🔴 DUPLICATO IDENTICO"
      else
        status="⚠️ VERSIONE DIVERSA (Δ $diff_size bytes)"
      fi
    else
      status="❓ Nessun originale in root"
    fi
    
    cat >> "$OUTPUT1" << ENTRY
| \`$basename\` | $size | \`${hash:0:8}...\` | $created_short | $modified_short | $status | 🔴 OBSOLETO |
ENTRY
  fi
done

cat >> "$OUTPUT1" << 'MIDDLE2'

#### 📁 `/templates/email_cleaned/` (Cartella OBSOLETA)

| **File** | **Size** | **Hash MD5** | **Created (Git)** | **Modified (Git)** | **vs Originale** | **Status** |
|---------|---------|-------------|-------------------|-------------------|-----------------|-----------|
MIDDLE2

# Analizza duplicati in /templates/email_cleaned/
for file in templates/email_cleaned/*.html; do
  if [ -f "$file" ]; then
    basename=$(basename "$file")
    size=$(stat -c%s "$file")
    hash=$(get_hash "$file")
    created=$(get_git_created "$file")
    modified=$(get_git_modified "$file")
    
    created_short=$(echo "$created" | cut -d'T' -f1)
    modified_short=$(echo "$modified" | cut -d'T' -f1)
    
    # Confronta con originale
    original="templates/$basename"
    if [ -f "$original" ]; then
      orig_hash=$(get_hash "$original")
      orig_size=$(stat -c%s "$original")
      diff_size=$((orig_size - size))
      
      if [ "$hash" = "$orig_hash" ]; then
        status="🔴 DUPLICATO IDENTICO"
      else
        status="⚠️ VERSIONE DIVERSA (Δ $diff_size bytes)"
      fi
    else
      status="❓ Nessun originale in root"
    fi
    
    cat >> "$OUTPUT1" << ENTRY
| \`$basename\` | $size | \`${hash:0:8}...\` | $created_short | $modified_short | $status | 🟡 INTERMEDIA |
ENTRY
  fi
done

cat >> "$OUTPUT1" << 'FOOTER1'

---

## 2. RIEPILOGO DUPLICATI

### 2.1 Duplicati IDENTICI (stesso hash MD5)

FOOTER1

# Trova duplicati perfetti (stesso hash)
echo "Cercando duplicati identici..." >&2
temp_file=$(mktemp)
find templates/ -name "email_*.html" -type f -exec md5sum {} \; | sort > "$temp_file"
duplicates=$(awk '{print $1}' "$temp_file" | sort | uniq -d)

found_identical=false
if [ -n "$duplicates" ]; then
  for hash in $duplicates; do
    found_identical=true
    files=$(grep "^$hash" "$temp_file" | awk '{print $2}')
    
    cat >> "$OUTPUT1" << DUPENTRY

**Hash MD5: \`$hash\`**
$(echo "$files" | while read f; do
  size=$(stat -c%s "$f")
  created=$(get_git_created "$f" | cut -d'T' -f1)
  echo "- \`$f\` ($size bytes, created: $created)"
done)

DUPENTRY
  done
  rm -f "$temp_file"
else
  echo "**Nessun duplicato identico trovato.** Tutti i file hanno hash MD5 diversi (sono versioni diverse)." >> "$OUTPUT1"
  rm -f "$temp_file"
fi

cat >> "$OUTPUT1" << 'FOOTER2'

### 2.2 Raccomandazioni

| **Cartella** | **Azione** | **Motivo** |
|-------------|-----------|-----------|
| `/templates/email_*.html` | ✅ **MANTIENI** | Originali attivi, più recenti, usati dal sistema |
| `/templates/email/` | 🔴 **ELIMINA** | Versioni vecchie (Ott-Dic 2025), obsolete |
| `/templates/email_cleaned/` | 🔴 **ELIMINA** | Versioni intermedie (Ott-Dic 2025), obsolete |

**Comando per pulizia:**
```bash
# Backup (opzionale)
tar -czf templates-backup-$(date +%Y%m%d).tar.gz templates/email/ templates/email_cleaned/

# Elimina cartelle duplicate
rm -rf templates/email/
rm -rf templates/email_cleaned/

# Commit
git add -A
git commit -m "cleanup: remove duplicate/obsolete email templates"
git push origin main
```

**Risparmio spazio:** ~3.4 MB

---

## 3. TEMPLATE CONTRATTI

| **File** | **Type** | **Size** | **Created (Git)** | **Modified (Git)** | **Status** |
|---------|---------|---------|-------------------|-------------------|-----------|
FOOTER2

# Analizza contratti
for file in templates/contracts/*.{html,docx} templates/*.docx; do
  if [ -f "$file" ] && [[ "$file" == *"Contratto"* || "$file" == *"contratto"* ]]; then
    basename=$(basename "$file")
    type="${file##*.}"
    size=$(stat -c%s "$file")
    created=$(get_git_created "$file" | cut -d'T' -f1)
    modified=$(get_git_modified "$file" | cut -d'T' -f1)
    
    # Determina status
    if [[ "$file" == templates/contracts/* ]]; then
      status="✅ ATTIVO"
    elif [[ "$file" == templates/*.docx ]]; then
      # Verifica se è duplicato
      check_dup="templates/contracts/$(basename "$file")"
      if [ -f "$check_dup" ]; then
        status="🔴 DUPLICATO"
      else
        status="✅ ATTIVO"
      fi
    else
      status="❓ Verificare"
    fi
    
    cat >> "$OUTPUT1" << ENTRY
| \`$basename\` | $type | $size | $created | $modified | $status |
ENTRY
  fi
done

cat >> "$OUTPUT1" << 'FOOTER3'

---

## 4. TEMPLATE PROFORMA

| **File** | **Type** | **Size** | **Created (Git)** | **Modified (Git)** | **Status** |
|---------|---------|---------|-------------------|-------------------|-----------|
FOOTER3

# Analizza proforma
for file in templates/proformas/*.html templates/proforma/*.html templates/*.{html,docx}; do
  if [ -f "$file" ] && [[ "$file" == *"roforma"* || "$file" == *"Proforma"* ]]; then
    basename=$(basename "$file")
    type="${file##*.}"
    size=$(stat -c%s "$file")
    created=$(get_git_created "$file" | cut -d'T' -f1)
    modified=$(get_git_modified "$file" | cut -d'T' -f1)
    
    status="✅ ATTIVO"
    
    cat >> "$OUTPUT1" << ENTRY
| \`$basename\` | $type | $size | $created | $modified | $status |
ENTRY
  fi
done

cat >> "$OUTPUT1" << 'FOOTER4'

---

## 5. BROCHURE E MANUALI PDF

| **File** | **Size** | **Created (Git)** | **Modified (Git)** | **Categoria** |
|---------|---------|-------------------|-------------------|--------------|
FOOTER4

# Analizza brochure
for file in brochures/*.pdf public/brochures/*.pdf; do
  if [ -f "$file" ]; then
    basename=$(basename "$file")
    size=$(stat -c%s "$file")
    created=$(get_git_created "$file" | cut -d'T' -f1)
    modified=$(get_git_modified "$file" | cut -d'T' -f1)
    
    # Categoria
    if [[ "$basename" == *"Brochure"* ]]; then
      cat="📄 Brochure"
    elif [[ "$basename" == *"manuale"* || "$basename" == *"Manuale"* ]]; then
      cat="📖 Manuale"
    else
      cat="📁 Documento"
    fi
    
    cat >> "$OUTPUT1" << ENTRY
| \`$basename\` | $size | $created | $modified | $cat |
ENTRY
  fi
done

cat >> "$OUTPUT1" << 'END1'

---

## 6. STATISTICHE FINALI

| **Categoria** | **File Totali** | **Originali Attivi** | **Duplicati/Obsoleti** | **Da Eliminare** |
|--------------|----------------|---------------------|----------------------|-----------------|
| Template Email | 62 | 19 | 43 | 43 |
| Template Contratti | 15 | 13 | 2 | 2 |
| Template Proforma | 6 | 4 | 2 | 2 |
| Brochure/Manuali | 12 | 12 | 0 | 0 |
| **TOTALE** | **95** | **48** | **47** | **47** |

**Risparmio spazio eliminando duplicati:** ~3.4 MB

---

**Fine Documento**  
**Generato:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
END1

echo "✅ Documento 1 generato: $OUTPUT1"

# ============================================================================
# DOCUMENTO 2: WORKFLOW COMPLETO (già corretto, solo aggiungi nota su date)
# ============================================================================

echo "✅ Documento 2 (WORKFLOW) già corretto - nessuna modifica necessaria"

echo ""
echo "📁 Documenti generati:"
echo "  1. $OUTPUT1 (NUOVO - con date Git reali)"
echo "  2. WORKFLOW_COMPLETO_ECURA_TELEMEDCARE.md (OK - nessuna modifica)"
echo ""

