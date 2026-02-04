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


### 📄 email_benvenuto.html

**File ORIGINALE (root):**
- Path: `templates/email_benvenuto.html`
- Size: 8137 bytes
- Hash MD5: `d3a65d4d74fa19d8...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00


**Versione alternativa:**
- Path: `templates/email/email_benvenuto.html`
- Size: 6507 bytes
- Hash MD5: `68ec44c05c895f74...`
- Created: 2025-10-03T18:23:41+00:00
- Modified: 2025-12-26T00:33:57+00:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 1630 bytes)


**Versione alternativa:**
- Path: `templates/email_cleaned/email_benvenuto.html`
- Size: 6479 bytes
- Hash MD5: `1b7be2e24c7d39b3...`
- Created: 2025-10-18T22:52:48+02:00
- Modified: 2025-12-26T00:33:57+00:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 1658 bytes)


**Uso nel codice:** 3 riferimenti in `src/`

---

### 📄 email_checkin_mensile.html

**File ORIGINALE (root):**
- Path: `templates/email_checkin_mensile.html`
- Size: 8753 bytes
- Hash MD5: `222db7c33d570fd4...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00

**Nessuna versione alternativa trovata.**

---

### 📄 email_conferma_attivazione.html

**File ORIGINALE (root):**
- Path: `templates/email_conferma_attivazione.html`
- Size: 7065 bytes
- Hash MD5: `94989cdf5e05ca85...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00


**Versione alternativa:**
- Path: `templates/email/email_conferma_attivazione.html`
- Size: 5380 bytes
- Hash MD5: `0ed1f0d57edbf5d2...`
- Created: 2025-10-04T13:27:44+00:00
- Modified: 2025-10-04T13:27:44+00:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 1685 bytes)


**Versione alternativa:**
- Path: `templates/email_cleaned/email_conferma_attivazione.html`
- Size: 5371 bytes
- Hash MD5: `ae3a634473313c43...`
- Created: 2025-10-18T22:52:48+02:00
- Modified: 2025-10-18T22:52:48+02:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 1694 bytes)


**Uso nel codice:** 3 riferimenti in `src/`

---

### 📄 email_configurazione.html

**File ORIGINALE (root):**
- Path: `templates/email_configurazione.html`
- Size: 7595 bytes
- Hash MD5: `afa352f7b1b17533...`
- Created: 2025-10-18T22:52:48+02:00
- Modified: 2026-01-03T10:40:59+00:00


**Versione alternativa:**
- Path: `templates/email_cleaned/email_configurazione.html`
- Size: 15267 bytes
- Hash MD5: `f5d225856ab1af8c...`
- Created: 2025-12-26T00:33:57+00:00
- Modified: 2025-12-26T00:33:57+00:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: -7672 bytes)


---

### 📄 email_documenti_informativi.html

**File ORIGINALE (root):**
- Path: `templates/email_documenti_informativi.html`
- Size: 8087 bytes
- Hash MD5: `922db4e4cf1b27cc...`
- Created: 2026-01-02T22:41:43+00:00
- Modified: 2026-01-03T10:40:59+00:00


**Versione alternativa:**
- Path: `templates/email/email_documenti_informativi.html`
- Size: 5886 bytes
- Hash MD5: `874f1143f0d38289...`
- Created: 2025-10-04T13:27:44+00:00
- Modified: 2025-10-18T22:52:48+02:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 2201 bytes)


**Versione alternativa:**
- Path: `templates/email_cleaned/email_documenti_informativi.html`
- Size: 6079 bytes
- Hash MD5: `a8573a9b27bb1f50...`
- Created: 2025-10-18T22:52:48+02:00
- Modified: 2025-12-26T00:33:57+00:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 2008 bytes)


**Uso nel codice:** 4 riferimenti in `src/`

---

### 📄 email_emergenza_servizio.html

**File ORIGINALE (root):**
- Path: `templates/email_emergenza_servizio.html`
- Size: 11732 bytes
- Hash MD5: `ccee30dc84e8050b...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00

**Nessuna versione alternativa trovata.**

---

### 📄 email_familiari_assistiti.html

**File ORIGINALE (root):**
- Path: `templates/email_familiari_assistiti.html`
- Size: 9101 bytes
- Hash MD5: `86a6bb712cba2602...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00

**Nessuna versione alternativa trovata.**

---

### 📄 email_followup_call.html

**File ORIGINALE (root):**
- Path: `templates/email_followup_call.html`
- Size: 7399 bytes
- Hash MD5: `e8bc94efa40eed91...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00


**Versione alternativa:**
- Path: `templates/email/email_followup_call.html`
- Size: 6105 bytes
- Hash MD5: `89e43e2a68ad7aea...`
- Created: 2025-10-04T13:27:44+00:00
- Modified: 2025-10-18T22:52:48+02:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 1294 bytes)


**Versione alternativa:**
- Path: `templates/email_cleaned/email_followup_call.html`
- Size: 6077 bytes
- Hash MD5: `931606b9df8cb279...`
- Created: 2025-10-18T22:52:48+02:00
- Modified: 2025-10-18T22:52:48+02:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 1322 bytes)


**Uso nel codice:** 2 riferimenti in `src/`

---

### 📄 email_invio_contratto.html

**File ORIGINALE (root):**
- Path: `templates/email_invio_contratto.html`
- Size: 10538 bytes
- Hash MD5: `42080f7a096ea757...`
- Created: 2026-01-02T23:28:29+00:00
- Modified: 2026-01-04T16:23:42+00:00


**Versione alternativa:**
- Path: `templates/email/email_invio_contratto.html`
- Size: 7076 bytes
- Hash MD5: `9b803e0bd8ce05de...`
- Created: 2025-10-04T13:27:44+00:00
- Modified: 2025-10-30T20:37:12+00:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 3462 bytes)


**Versione alternativa:**
- Path: `templates/email_cleaned/email_invio_contratto.html`
- Size: 7126 bytes
- Hash MD5: `e87a1d63222b52f8...`
- Created: 2025-10-18T22:52:48+02:00
- Modified: 2025-12-26T00:33:57+00:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 3412 bytes)


**Uso nel codice:** 7 riferimenti in `src/`

---

### 📄 email_invio_proforma.html

**File ORIGINALE (root):**
- Path: `templates/email_invio_proforma.html`
- Size: 7390 bytes
- Hash MD5: `01d120bd00606283...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00


**Versione alternativa:**
- Path: `templates/email/email_invio_proforma.html`
- Size: 6173 bytes
- Hash MD5: `8d770a5adcbc671b...`
- Created: 2025-10-04T13:27:44+00:00
- Modified: 2025-10-18T22:52:48+02:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 1217 bytes)


**Versione alternativa:**
- Path: `templates/email_cleaned/email_invio_proforma.html`
- Size: 8042 bytes
- Hash MD5: `a75133574304d6d6...`
- Created: 2025-10-18T22:52:48+02:00
- Modified: 2025-12-26T00:33:57+00:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: -652 bytes)


**Uso nel codice:** 5 riferimenti in `src/`

---

### 📄 email_newsletter_normative.html

**File ORIGINALE (root):**
- Path: `templates/email_newsletter_normative.html`
- Size: 11423 bytes
- Hash MD5: `dd617037014aef06...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00

**Nessuna versione alternativa trovata.**

---

### 📄 email_notifica_info.html

**File ORIGINALE (root):**
- Path: `templates/email_notifica_info.html`
- Size: 7582 bytes
- Hash MD5: `afd6f5b29013a1d3...`
- Created: 2026-01-02T22:41:43+00:00
- Modified: 2026-01-03T10:40:59+00:00


**Versione alternativa:**
- Path: `templates/email/email_notifica_info.html`
- Size: 14567 bytes
- Hash MD5: `591a1e5e588156f2...`
- Created: 2025-10-03T18:23:41+00:00
- Modified: 2025-10-30T20:37:12+00:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: -6985 bytes)


**Versione alternativa:**
- Path: `templates/email_cleaned/email_notifica_info.html`
- Size: 13310 bytes
- Hash MD5: `2a089785d96e2ae9...`
- Created: 2025-10-18T22:52:48+02:00
- Modified: 2025-12-26T00:33:57+00:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: -5728 bytes)


**Uso nel codice:** 4 riferimenti in `src/`

---

### 📄 email_nurturing_educativa.html

**File ORIGINALE (root):**
- Path: `templates/email_nurturing_educativa.html`
- Size: 8679 bytes
- Hash MD5: `b5c3cd205ba53a89...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00

**Nessuna versione alternativa trovata.**

---

### 📄 email_promemoria_followup.html

**File ORIGINALE (root):**
- Path: `templates/email_promemoria_followup.html`
- Size: 8172 bytes
- Hash MD5: `a289fcb3aa26bd0c...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00


**Versione alternativa:**
- Path: `templates/email/email_promemoria_followup.html`
- Size: 6833 bytes
- Hash MD5: `17e3b52ca2aec9d1...`
- Created: 2025-10-04T13:27:44+00:00
- Modified: 2025-10-04T13:27:44+00:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 1339 bytes)


**Versione alternativa:**
- Path: `templates/email_cleaned/email_promemoria_followup.html`
- Size: 6799 bytes
- Hash MD5: `24e32403131516a4...`
- Created: 2025-10-18T22:52:48+02:00
- Modified: 2025-10-18T22:52:48+02:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 1373 bytes)


**Uso nel codice:** 1 riferimenti in `src/`

---

### 📄 email_promemoria_pagamento.html

**File ORIGINALE (root):**
- Path: `templates/email_promemoria_pagamento.html`
- Size: 7081 bytes
- Hash MD5: `b4c4104ed6f95a06...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00


**Versione alternativa:**
- Path: `templates/email/email_promemoria_pagamento.html`
- Size: 3563 bytes
- Hash MD5: `e350d0d29969e161...`
- Created: 2025-10-04T13:27:44+00:00
- Modified: 2025-10-04T13:27:44+00:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 3518 bytes)


**Versione alternativa:**
- Path: `templates/email_cleaned/email_promemoria_pagamento.html`
- Size: 3539 bytes
- Hash MD5: `c47862594469f9d3...`
- Created: 2025-10-18T22:52:48+02:00
- Modified: 2025-10-18T22:52:48+02:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 3542 bytes)


**Uso nel codice:** 1 riferimenti in `src/`

---

### 📄 email_promemoria_rinnovo.html

**File ORIGINALE (root):**
- Path: `templates/email_promemoria_rinnovo.html`
- Size: 8408 bytes
- Hash MD5: `6ba94ffd7f3c0925...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00

**Nessuna versione alternativa trovata.**

---

### 📄 email_referral_programma.html

**File ORIGINALE (root):**
- Path: `templates/email_referral_programma.html`
- Size: 10832 bytes
- Hash MD5: `061f230aa956c0f1...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00

**Nessuna versione alternativa trovata.**

---

### 📄 email_spedizione.html

**File ORIGINALE (root):**
- Path: `templates/email_spedizione.html`
- Size: 7909 bytes
- Hash MD5: `06cb2b69f952e1bc...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00


**Versione alternativa:**
- Path: `templates/email/email_spedizione.html`
- Size: 6866 bytes
- Hash MD5: `09cea6dba9b5fbfe...`
- Created: 2025-10-04T13:27:44+00:00
- Modified: 2025-10-04T13:27:44+00:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 1043 bytes)


**Versione alternativa:**
- Path: `templates/email_cleaned/email_spedizione.html`
- Size: 6838 bytes
- Hash MD5: `20008a5dfda07750...`
- Created: 2025-10-18T22:52:48+02:00
- Modified: 2025-10-18T22:52:48+02:00
- Status: ⚠️ VERSIONE DIVERSA (hash diverso, Δ size: 1071 bytes)


**Uso nel codice:** 1 riferimenti in `src/`

---

### 📄 email_supporto_troubleshooting.html

**File ORIGINALE (root):**
- Path: `templates/email_supporto_troubleshooting.html`
- Size: 10421 bytes
- Hash MD5: `243b2ecb60559547...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00

**Nessuna versione alternativa trovata.**

---

### 📄 email_survey_soddisfazione.html

**File ORIGINALE (root):**
- Path: `templates/email_survey_soddisfazione.html`
- Size: 8219 bytes
- Hash MD5: `a6343b575d6ad0a6...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00

**Nessuna versione alternativa trovata.**

---

### 📄 email_upgrade_servizi.html

**File ORIGINALE (root):**
- Path: `templates/email_upgrade_servizi.html`
- Size: 10004 bytes
- Hash MD5: `79486fd7139625f9...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00

**Nessuna versione alternativa trovata.**

---

### 📄 email_win_back.html

**File ORIGINALE (root):**
- Path: `templates/email_win_back.html`
- Size: 10524 bytes
- Hash MD5: `107b3f4bdfcec6b4...`
- Created: 2026-01-03T10:40:59+00:00
- Modified: 2026-01-03T10:40:59+00:00

**Nessuna versione alternativa trovata.**

---

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
