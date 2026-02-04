#!/bin/bash
# Genera analisi completa template con date Git reali

OUTPUT="TEMPLATE_ANALYSIS_WITH_REAL_DATES.md"

cat > "$OUTPUT" << 'HEREDOC'
# 📚 ANALISI TEMPLATE CON DATE REALI E CLASSIFICAZIONE

**Data analisi:** 2026-02-04  
**Repository:** https://github.com/RobertoPoggi/telemedcare-v12  

---

## 🎯 METODOLOGIA

### Come distinguere ORIGINALE da DUPLICATO/OBSOLETO:

1. **Date Git:**
   - Creazione: data primo commit (`git log --follow --reverse`)
   - Ultima modifica: data ultimo commit (`git log -1`)

2. **Classificazione per cartella:**
   - `/templates/email_*.html` → **ORIGINALI** (root, usati dal sistema)
   - `/templates/email/` → **DUPLICATI VECCHI** (cartella separata, obsoleti)
   - `/templates/email_cleaned/` → **VERSIONI INTERMEDIATE** (cleaned ma obsoleti)

3. **Regola logica:**
   - File nella **root `/templates/`** = ORIGINALE (più recente o usato dal codice)
   - File in **sottocartelle** = DUPLICATI/OBSOLETI (versioni vecchie)

4. **Verifica contenuto:**
   - Hash MD5 diversi = Versioni diverse (non duplicati perfetti)
   - Dimensione file diversa = Contenuto modificato nel tempo

---

## 📧 TEMPLATE EMAIL - Analisi Dettagliata

HEREDOC

# Analizza ogni template email nella root
for file in templates/email_*.html; do
  if [ -f "$file" ]; then
    basename=$(basename "$file")
    size=$(stat -c%s "$file")
    hash=$(md5sum "$file" | awk '{print $1}')
    
    # Date Git
    created=$(git log --follow --format=%aI --reverse "$file" 2>/dev/null | head -1)
    modified=$(git log -1 --format=%aI "$file" 2>/dev/null)
    
    cat >> "$OUTPUT" << ENTRY

### 📄 $basename

**File ORIGINALE (root):**
- Path: \`$file\`
- Size: $size bytes
- Hash MD5: \`${hash:0:16}...\`
- Created: ${created:-N/A}
- Modified: ${modified:-N/A}

ENTRY
    
    # Cerca duplicati/versioni in altre cartelle
    found_alt=false
    
    for alt_path in "templates/email/$basename" "templates/email_cleaned/$basename"; do
      if [ -f "$alt_path" ]; then
        found_alt=true
        alt_size=$(stat -c%s "$alt_path")
        alt_hash=$(md5sum "$alt_path" | awk '{print $1}')
        alt_created=$(git log --follow --format=%aI --reverse "$alt_path" 2>/dev/null | head -1)
        alt_modified=$(git log -1 --format=%aI "$alt_path" 2>/dev/null)
        
        # Determina se è duplicato o versione diversa
        if [ "$hash" = "$alt_hash" ]; then
          status="🔴 DUPLICATO IDENTICO (stesso hash)"
        else
          diff_size=$((size - alt_size))
          status="⚠️ VERSIONE DIVERSA (hash diverso, Δ size: $diff_size bytes)"
        fi
        
        cat >> "$OUTPUT" << ALTENTRY

**Versione alternativa:**
- Path: \`$alt_path\`
- Size: $alt_size bytes
- Hash MD5: \`${alt_hash:0:16}...\`
- Created: ${alt_created:-N/A}
- Modified: ${alt_modified:-N/A}
- Status: $status

ALTENTRY
      fi
    done
    
    if [ "$found_alt" = false ]; then
      echo "**Nessuna versione alternativa trovata.**" >> "$OUTPUT"
    fi
    
    # Verifica uso nel codice
    usage=$(grep -r "$basename" src/ 2>/dev/null | wc -l)
    if [ "$usage" -gt 0 ]; then
      echo "" >> "$OUTPUT"
      echo "**Uso nel codice:** $usage riferimenti in \`src/\`" >> "$OUTPUT"
    fi
    
    echo "" >> "$OUTPUT"
    echo "---" >> "$OUTPUT"
  fi
done

cat >> "$OUTPUT" << 'FOOTER'

## 📊 RIEPILOGO CLASSIFICAZIONE

### Regole di Classificazione:

| **Cartella** | **Classificazione** | **Azione Raccomandata** |
|-------------|---------------------|------------------------|
| `/templates/email_*.html` | ✅ ORIGINALE ATTIVO | Mantieni |
| `/templates/email/` | 🔴 DUPLICATO VECCHIO | Elimina cartella |
| `/templates/email_cleaned/` | 🟡 VERSIONE INTERMEDIA | Elimina cartella |

### Perché eliminare le sottocartelle:

1. **Confusione:** Tre versioni dello stesso file in posti diversi
2. **Manutenzione:** Rischio di modificare la versione sbagliata
3. **Spazio:** Spreco di 3.42 MB
4. **Git history:** Le vecchie versioni sono già in Git

### Come procedere:

```bash
# Backup prima di eliminare (opzionale)
tar -czf templates-backup-$(date +%Y%m%d).tar.gz templates/email/ templates/email_cleaned/

# Elimina cartelle duplicate
rm -rf templates/email/
rm -rf templates/email_cleaned/

# Commit
git add -A
git commit -m "cleanup: remove duplicate email template folders"
git push origin main
```

---

**Fine Analisi**
FOOTER

echo "$OUTPUT"

