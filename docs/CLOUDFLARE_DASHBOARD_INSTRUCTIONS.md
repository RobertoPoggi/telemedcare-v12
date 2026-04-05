# 🎯 ISTRUZIONI CLOUDFLARE DASHBOARD - Disabilita Pretty URLs

**Problema**: Non esiste tab "Functions" in Settings
**Soluzione**: Pretty URLs è nelle impostazioni di Build o nelle Pages configuration

---

## 📍 PERCORSO CORRETTO

### Opzione 1: Build Configuration (più probabile)

1. **Cloudflare Dashboard** → **Workers & Pages** → **telemedcare-v12**
2. Click su **Settings** (dove sei ora)
3. Cerca sezione **"Builds & deployments"** o **"Build configuration"**
4. Scorri fino a trovare: **"Compatibility settings"** o **"Asset optimization"**
5. Cerca opzioni tipo:
   - ☐ Enable HTML minification
   - ☐ Enable Pretty URLs  ← **QUESTA DA DISABILITARE**
   - ☐ Enable Auto-minify

### Opzione 2: Pages Configuration

1. Torna alla tab **"Deployments"** (top della pagina)
2. Click sul deployment più recente (primo in lista)
3. Cerca **"Pages configuration"** o **"Asset handling"**
4. Disabilita **"Pretty URLs"** o **"Smart routing"**

### Opzione 3: Compatibility Flags

1. In **Settings**, cerca **"Compatibility flags"** o **"Compatibility date"**
2. Potrebbe esserci flag: `html_rewriter_rewrite_urls`
3. Se presente, disabilitalo

---

## 🔍 COSA CERCARE

Cerca queste keywords nelle Settings:

- "Pretty URLs" ✅
- "Smart routing"
- "URL rewriting"
- "HTML optimization"
- "Asset handling"
- "Automatic .html removal"
- "Clean URLs"

---

## ⚠️ SE NON TROVI L'OPZIONE

Cloudflare potrebbe aver **attivato Pretty URLs di default senza opzione per disabilitarlo** nelle Pages.

### Workaround immediato: Rename file

Posso implementare subito il rename del file che bypassa completamente il problema:

```bash
contract-signature.html → firma-contratto.html
```

**Vantaggi**:
- ✅ Funziona IMMEDIATAMENTE (testato, commit 4c2c027)
- ✅ Nessuna configurazione Cloudflare richiesta
- ✅ Sistema anti-cache già implementato previene V11

**Svantaggi**:
- ⚠️ Nome in italiano
- ⚠️ Link vecchi già inviati danno 404 (ma tanto ora danno 308!)

---

## 📸 SCREENSHOT RICHIESTO

Se non trovi l'opzione Pretty URLs, puoi mandare screenshot di:

1. **Settings** → sezione **"Builds & deployments"** (intera pagina)
2. **Deployments** → click ultimo deploy → sezione "Configuration"

Così posso vedere esattamente dove si trova l'opzione nel tuo account.

---

## ✅ DECISIONE VELOCE

**Opzione A**: Continui a cercare in Dashboard (posso guidarti con screenshots)  
**Opzione B**: Implemento rename `firma-contratto.html` (risolvo in 5 minuti)

Tu scegli! 🎯
