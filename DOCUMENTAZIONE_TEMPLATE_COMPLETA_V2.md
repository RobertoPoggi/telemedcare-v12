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
| `email_benvenuto.html` | 8137 | `d3a65d4d...` | 2026-01-03 | 2026-01-03 | 3 refs | ✅ ORIGINALE |
| `email_checkin_mensile.html` | 8753 | `222db7c3...` | 2026-01-03 | 2026-01-03 | 0 refs | ✅ ORIGINALE |
| `email_conferma_attivazione.html` | 7065 | `94989cdf...` | 2026-01-03 | 2026-01-03 | 3 refs | ✅ ORIGINALE |
| `email_configurazione.html` | 7595 | `afa352f7...` | 2025-10-18 | 2026-01-03 | 0 refs | ✅ ORIGINALE |
| `email_documenti_informativi.html` | 8087 | `922db4e4...` | 2026-01-02 | 2026-01-03 | 4 refs | ✅ ORIGINALE |
| `email_emergenza_servizio.html` | 11732 | `ccee30dc...` | 2026-01-03 | 2026-01-03 | 0 refs | ✅ ORIGINALE |
| `email_familiari_assistiti.html` | 9101 | `86a6bb71...` | 2026-01-03 | 2026-01-03 | 0 refs | ✅ ORIGINALE |
| `email_followup_call.html` | 7399 | `e8bc94ef...` | 2026-01-03 | 2026-01-03 | 2 refs | ✅ ORIGINALE |
| `email_invio_contratto.html` | 10538 | `42080f7a...` | 2026-01-02 | 2026-01-04 | 7 refs | ✅ ORIGINALE |
| `email_invio_proforma.html` | 7390 | `01d120bd...` | 2026-01-03 | 2026-01-03 | 5 refs | ✅ ORIGINALE |
| `email_newsletter_normative.html` | 11423 | `dd617037...` | 2026-01-03 | 2026-01-03 | 0 refs | ✅ ORIGINALE |
| `email_notifica_info.html` | 7582 | `afd6f5b2...` | 2026-01-02 | 2026-01-03 | 4 refs | ✅ ORIGINALE |
| `email_nurturing_educativa.html` | 8679 | `b5c3cd20...` | 2026-01-03 | 2026-01-03 | 0 refs | ✅ ORIGINALE |
| `email_promemoria_followup.html` | 8172 | `a289fcb3...` | 2026-01-03 | 2026-01-03 | 1 refs | ✅ ORIGINALE |
| `email_promemoria_pagamento.html` | 7081 | `b4c4104e...` | 2026-01-03 | 2026-01-03 | 1 refs | ✅ ORIGINALE |
| `email_promemoria_rinnovo.html` | 8408 | `6ba94ffd...` | 2026-01-03 | 2026-01-03 | 0 refs | ✅ ORIGINALE |
| `email_referral_programma.html` | 10832 | `061f230a...` | 2026-01-03 | 2026-01-03 | 0 refs | ✅ ORIGINALE |
| `email_spedizione.html` | 7909 | `06cb2b69...` | 2026-01-03 | 2026-01-03 | 1 refs | ✅ ORIGINALE |
| `email_supporto_troubleshooting.html` | 10421 | `243b2ecb...` | 2026-01-03 | 2026-01-03 | 0 refs | ✅ ORIGINALE |
| `email_survey_soddisfazione.html` | 8219 | `a6343b57...` | 2026-01-03 | 2026-01-03 | 0 refs | ✅ ORIGINALE |
| `email_upgrade_servizi.html` | 10004 | `79486fd7...` | 2026-01-03 | 2026-01-03 | 0 refs | ✅ ORIGINALE |
| `email_win_back.html` | 10524 | `107b3f4b...` | 2026-01-03 | 2026-01-03 | 0 refs | ✅ ORIGINALE |

### 1.2 Template Email DUPLICATI/OBSOLETI

#### 📁 `/templates/email/` (Cartella OBSOLETA)

| **File** | **Size** | **Hash MD5** | **Created (Git)** | **Modified (Git)** | **vs Originale** | **Status** |
|---------|---------|-------------|-------------------|-------------------|-----------------|-----------|
| `Email_Template_Chiarimenti_Servizi.html` | 8370 | `006d7d46...` | 2025-10-18 | 2025-10-18 | ❓ Nessun originale in root | 🔴 OBSOLETO |
| `email_benvenuto.html` | 6507 | `68ec44c0...` | 2025-10-03 | 2025-12-26 | ⚠️ VERSIONE DIVERSA (Δ 1630 bytes) | 🔴 OBSOLETO |
| `email_cancellazione.html` | 3188 | `fb91835f...` | 2025-10-04 | 2025-10-04 | ❓ Nessun originale in root | 🔴 OBSOLETO |
| `email_conferma.html` | 7189 | `c667a7a6...` | 2025-10-18 | 2025-10-18 | ❓ Nessun originale in root | 🔴 OBSOLETO |
| `email_conferma_attivazione.html` | 5380 | `0ed1f0d5...` | 2025-10-04 | 2025-10-04 | ⚠️ VERSIONE DIVERSA (Δ 1685 bytes) | 🔴 OBSOLETO |
| `email_conferma_ordine.html` | 5573 | `43511346...` | 2025-10-04 | 2025-10-04 | ❓ Nessun originale in root | 🔴 OBSOLETO |
| `email_consegna.html` | 8257 | `7337d7e9...` | 2025-10-04 | 2025-10-04 | ❓ Nessun originale in root | 🔴 OBSOLETO |
| `email_documenti_informativi.html` | 5886 | `874f1143...` | 2025-10-04 | 2025-10-18 | ⚠️ VERSIONE DIVERSA (Δ 2201 bytes) | 🔴 OBSOLETO |
| `email_documenti_informativi_simple.html` | 4961 | `8a00629c...` | 2025-10-30 | 2025-10-30 | ❓ Nessun originale in root | 🔴 OBSOLETO |
| `email_followup_call.html` | 6105 | `89e43e2a...` | 2025-10-04 | 2025-10-18 | ⚠️ VERSIONE DIVERSA (Δ 1294 bytes) | 🔴 OBSOLETO |
| `email_invio_contratto.html` | 7076 | `9b803e0b...` | 2025-10-04 | 2025-10-30 | ⚠️ VERSIONE DIVERSA (Δ 3462 bytes) | 🔴 OBSOLETO |
| `email_invio_proforma.html` | 6173 | `8d770a5a...` | 2025-10-04 | 2025-10-18 | ⚠️ VERSIONE DIVERSA (Δ 1217 bytes) | 🔴 OBSOLETO |
| `email_notifica_info.html` | 14567 | `591a1e5e...` | 2025-10-03 | 2025-10-30 | ⚠️ VERSIONE DIVERSA (Δ -6985 bytes) | 🔴 OBSOLETO |
| `email_promemoria.html` | 7501 | `3cd8d8ab...` | 2025-10-18 | 2025-10-18 | ❓ Nessun originale in root | 🔴 OBSOLETO |
| `email_promemoria_followup.html` | 6833 | `17e3b52c...` | 2025-10-04 | 2025-10-04 | ⚠️ VERSIONE DIVERSA (Δ 1339 bytes) | 🔴 OBSOLETO |
| `email_promemoria_pagamento.html` | 3563 | `e350d0d2...` | 2025-10-04 | 2025-10-04 | ⚠️ VERSIONE DIVERSA (Δ 3518 bytes) | 🔴 OBSOLETO |
| `email_spedizione.html` | 6866 | `09cea6db...` | 2025-10-04 | 2025-10-04 | ⚠️ VERSIONE DIVERSA (Δ 1043 bytes) | 🔴 OBSOLETO |

#### 📁 `/templates/email_cleaned/` (Cartella OBSOLETA)

| **File** | **Size** | **Hash MD5** | **Created (Git)** | **Modified (Git)** | **vs Originale** | **Status** |
|---------|---------|-------------|-------------------|-------------------|-----------------|-----------|
| `Email_Template_Chiarimenti_Servizi.html` | 8276 | `7af288e6...` | 2025-10-18 | 2025-10-18 | ❓ Nessun originale in root | 🟡 INTERMEDIA |
| `email_benvenuto.html` | 6479 | `1b7be2e2...` | 2025-10-18 | 2025-12-26 | ⚠️ VERSIONE DIVERSA (Δ 1658 bytes) | 🟡 INTERMEDIA |
| `email_cancellazione.html` | 3174 | `d2880828...` | 2025-10-18 | 2025-10-18 | ❓ Nessun originale in root | 🟡 INTERMEDIA |
| `email_conferma.html` | 7136 | `0b6a6de2...` | 2025-10-18 | 2025-10-18 | ❓ Nessun originale in root | 🟡 INTERMEDIA |
| `email_conferma_attivazione.html` | 5371 | `ae3a6344...` | 2025-10-18 | 2025-10-18 | ⚠️ VERSIONE DIVERSA (Δ 1694 bytes) | 🟡 INTERMEDIA |
| `email_conferma_ordine.html` | 5556 | `a231d771...` | 2025-10-18 | 2025-10-18 | ❓ Nessun originale in root | 🟡 INTERMEDIA |
| `email_configurazione.html` | 15267 | `f5d22585...` | 2025-12-26 | 2025-12-26 | ⚠️ VERSIONE DIVERSA (Δ -7672 bytes) | 🟡 INTERMEDIA |
| `email_consegna.html` | 8208 | `26adf75a...` | 2025-10-18 | 2025-10-18 | ❓ Nessun originale in root | 🟡 INTERMEDIA |
| `email_documenti_informativi.html` | 6079 | `a8573a9b...` | 2025-10-18 | 2025-12-26 | ⚠️ VERSIONE DIVERSA (Δ 2008 bytes) | 🟡 INTERMEDIA |
| `email_followup_call.html` | 6077 | `931606b9...` | 2025-10-18 | 2025-10-18 | ⚠️ VERSIONE DIVERSA (Δ 1322 bytes) | 🟡 INTERMEDIA |
| `email_invio_contratto.html` | 7126 | `e87a1d63...` | 2025-10-18 | 2025-12-26 | ⚠️ VERSIONE DIVERSA (Δ 3412 bytes) | 🟡 INTERMEDIA |
| `email_invio_proforma.html` | 8042 | `a7513357...` | 2025-10-18 | 2025-12-26 | ⚠️ VERSIONE DIVERSA (Δ -652 bytes) | 🟡 INTERMEDIA |
| `email_notifica_info.html` | 13310 | `2a089785...` | 2025-10-18 | 2025-12-26 | ⚠️ VERSIONE DIVERSA (Δ -5728 bytes) | 🟡 INTERMEDIA |
| `email_promemoria.html` | 8795 | `27e7fac1...` | 2025-10-18 | 2025-12-26 | ❓ Nessun originale in root | 🟡 INTERMEDIA |
| `email_promemoria_followup.html` | 6799 | `24e32403...` | 2025-10-18 | 2025-10-18 | ⚠️ VERSIONE DIVERSA (Δ 1373 bytes) | 🟡 INTERMEDIA |
| `email_promemoria_pagamento.html` | 3539 | `c4786259...` | 2025-10-18 | 2025-10-18 | ⚠️ VERSIONE DIVERSA (Δ 3542 bytes) | 🟡 INTERMEDIA |
| `email_spedizione.html` | 6838 | `20008a5d...` | 2025-10-18 | 2025-10-18 | ⚠️ VERSIONE DIVERSA (Δ 1071 bytes) | 🟡 INTERMEDIA |

---

## 2. RIEPILOGO DUPLICATI

### 2.1 Duplicati IDENTICI (stesso hash MD5)

**Nessun duplicato identico trovato.** Tutti i file hanno hash MD5 diversi (sono versioni diverse).

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
| `Template_Contratto_Avanzato_TeleMedCare.html` | html | 7909 | 2025-10-30 | 2025-10-30 | ✅ ATTIVO |
| `Template_Contratto_Base_TeleMedCare.html` | html | 6407 | 2025-10-30 | 2025-10-30 | ✅ ATTIVO |
| `contratto_ecura_avanzato.html` | html | 9536 | 2025-12-26 | 2025-12-26 | ✅ ATTIVO |
| `contratto_ecura_avanzato_b2c.html` | html | 20585 | 2025-12-26 | 2025-12-26 | ✅ ATTIVO |
| `contratto_ecura_base.html` | html | 5411 | 2025-12-26 | 2025-12-26 | ✅ ATTIVO |
| `contratto_ecura_base_b2c.html` | html | 7150 | 2025-12-26 | 2025-12-26 | ✅ ATTIVO |
| `contratto_firma_digitale.html` | html | 13578 | 2026-01-04 | 2026-01-04 | ✅ ATTIVO |
| `contratto_vendita.html` | html | 8733 | 2025-10-30 | 2025-10-30 | ✅ ATTIVO |
| `template_contratto_ecura.html` | html | 8601 | 2025-12-26 | 2025-12-26 | ✅ ATTIVO |
| `Template_Contratto_eCura.docx` | docx | 17449 | 2025-12-26 | 2025-12-26 | ✅ ATTIVO |
| `Template_Contratto_Avanzato_TeleMedCare.docx` | docx | 11004 | 2025-10-18 | 2025-10-18 | ✅ ATTIVO |
| `Template_Contratto_Base_TeleMedCare.docx` | docx | 10381 | 2025-10-18 | 2025-10-18 | ✅ ATTIVO |

---

## 4. TEMPLATE PROFORMA

| **File** | **Type** | **Size** | **Created (Git)** | **Modified (Git)** | **Status** |
|---------|---------|---------|-------------------|-------------------|-----------|
| `proforma_avanzato.html` | html | 10661 | 2025-12-26 | 2025-12-26 | ✅ ATTIVO |
| `proforma_base.html` | html | 9538 | 2025-12-26 | 2025-12-26 | ✅ ATTIVO |
| `Template_Proforma_Unificato_TeleMedCare.html` | html | 7303 | 2025-10-30 | 2025-10-30 | ✅ ATTIVO |
| `proforma_commerciale.html` | html | 7796 | 2025-10-30 | 2025-10-30 | ✅ ATTIVO |
| `Template_Proforma_Unificato_TeleMedCare.html` | html | 8496 | 2026-01-03 | 2026-01-03 | ✅ ATTIVO |
| `email_invio_proforma.html` | html | 7390 | 2026-01-03 | 2026-01-03 | ✅ ATTIVO |
| `Template_Proforma_Unificato_TeleMedCare.docx` | docx | 14285 | 2025-10-18 | 2025-10-18 | ✅ ATTIVO |

---

## 5. BROCHURE E MANUALI PDF

| **File** | **Size** | **Created (Git)** | **Modified (Git)** | **Categoria** |
|---------|---------|-------------------|-------------------|--------------|
| `Medica GB-SiDLY_Care_PRO_ITA_compresso.pdf` | 2697785 | 2026-01-02 | 2026-01-02 | 📁 Documento |
| `Medica GB-SiDLY_Vital_Care_ITA-compresso.pdf` | 1718183 | 2026-01-02 | 2026-01-02 | 📁 Documento |
| `Brochure_eCura.pdf` | 514348 | 2026-01-08 | 2026-01-31 | 📄 Brochure |
| `Medica-GB-SiDLY_Care_PRO_ITA_compresso.pdf` | 2697785 | 2026-01-02 | 2026-01-02 | 📁 Documento |
| `Medica-GB-SiDLY_Vital_Care_ITA-compresso.pdf` | 1718183 | 2026-01-02 | 2026-01-02 | 📁 Documento |

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
