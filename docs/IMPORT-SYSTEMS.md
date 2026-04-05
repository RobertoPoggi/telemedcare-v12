# 📋 SISTEMI DI IMPORT HUBSPOT

## 🔒 REGOLA CRITICA
**IL FILTRO `hs_object_source_detail_1 = "Form eCura"` È HARDCODED E NON PUÒ ESSERE RIMOSSO!**

---

## 3 Sistemi di Import (identici, differiscono solo per periodo)

### 1️⃣ Autorun al Refresh (Cmd+Shift+R o cambio dashboard)
- **File**: `src/dashboard.tsx` 
- **Periodo**: Ultimi **7 giorni**
- **Filtro**: 🔒 **HARDCODED** `Form eCura`
- **Trigger**: Manuale (refresh browser o cambio dashboard)

### 2️⃣ Tasto IRBEMA (Dashboard Operativa)
- **File**: `src/index.tsx` endpoint `/api/hubspot/sync`
- **Periodo**: Dal **1 febbraio 2026** in avanti (`useFixedDate: true`)
- **Filtro**: 🔒 **HARDCODED** `Form eCura`
- **Trigger**: Click sul pulsante "IRBEMA" nella dashboard

### 3️⃣ GitHub Actions (Automatico)
- **File**: `.github/workflows/hubspot-auto-import.yml`
- **Periodo**: Ultimi **2 giorni** (48h)
- **Filtro**: 🔒 **HARDCODED** `Form eCura`
- **Trigger**: **Automatico ogni giorno alle 08:00** (ora italiana)

---

## 🛡️ Protezioni Implementate

### Filtro Form eCura HARDCODED
Il filtro `hs_object_source_detail_1 = 'Form eCura'` è ora **HARDCODED** in tutti i sistemi:

```typescript
// ❌ PRIMA (parametro modificabile)
const onlyEcura = body.onlyEcura !== false // Poteva essere disabilitato!

// ✅ ADESSO (hardcoded)
const onlyEcura = true // 🔒 SEMPRE attivo (NON MODIFICARE!)
```

### Commit: `[HASH_QUI]`
- **Modificato**: `src/index.tsx` (endpoint `/api/hubspot/sync`)
- **Modificato**: `src/index.tsx` (endpoint `/api/hubspot/auto-import`)
- **Creato**: `.github/workflows/hubspot-auto-import.yml`

---

## ⏰ Periodi di Import

| Sistema | Periodo | Configurabile? |
|---------|---------|----------------|
| **Refresh Dashboard** | Ultimi 7 giorni | ✅ Modificabile in `src/dashboard.tsx` |
| **Tasto IRBEMA** | Dal 1 feb 2026 | ❌ Fisso (`useFixedDate: true`) |
| **GitHub Actions** | Ultimi 2 giorni | ✅ Modificabile in workflow YAML |

---

## 🔧 Come Modificare i Periodi (se necessario)

### Autorun Dashboard (7 giorni)
```typescript
// File: src/dashboard.tsx
const days = 7 // Modifica qui per cambiare periodo
```

### GitHub Actions (2 giorni)
```yaml
# File: .github/workflows/hubspot-auto-import.yml
inputs:
  days:
    default: '2' # Modifica qui
```

### Tasto IRBEMA (1 feb 2026 → oggi)
```typescript
// File: src/index.tsx
if (useFixedDate) {
  createdAfter = new Date('2026-01-30T00:00:00.000Z') // Data fissa
}
```

---

## 🧪 Test dei Sistemi

### Test Autorun Dashboard
1. Apri dashboard operativa
2. Premi `Cmd+Shift+R` (Mac) o `Ctrl+Shift+R` (Windows)
3. Verifica console browser: `"🔍 Filtro attivo: solo lead da Form eCura"`

### Test Tasto IRBEMA
1. Apri dashboard operativa
2. Click sul pulsante "IRBEMA"
3. Verifica risposta API con `"onlyEcura": true`

### Test GitHub Action
1. Vai su GitHub → Actions
2. Seleziona "HubSpot Auto Import (Form eCura)"
3. Click "Run workflow" → "Run workflow"
4. Attendi completamento e verifica log

---

## 📊 Monitoraggio

### Log da Verificare
```bash
# Autorun Dashboard
🔍 [HUBSPOT SYNC] Filtro HARDCODED attivo: solo lead da Form eCura

# Tasto IRBEMA
🔄 [HUBSPOT SYNC] Inizio sincronizzazione dal 30/01/2026 (campagna eCura)

# GitHub Action
✅ Import completato con successo!
📥 Importati: X
```

### Cloudflare Pages Logs
1. Dashboard Cloudflare → Pages → telemedcare-v12
2. Functions → Logs
3. Filtra per `[HUBSPOT SYNC]`

---

## 🚨 Troubleshooting

### Il GitHub Action non parte alle 08:00
- Verifica in GitHub → Actions → Workflows
- Controlla i "Recent Workflow runs"
- Il workflow potrebbe avere ritardi fino a 15 minuti

### Import non trova lead
- Verifica che i lead in HubSpot abbiano:
  - `hs_object_source_detail_1 = "Form eCura"`
  - Data creazione nel periodo specificato
- Controlla credenziali HubSpot in Cloudflare Pages:
  - `HUBSPOT_ACCESS_TOKEN`
  - `HUBSPOT_PORTAL_ID`

### Lead duplicati
- Il sistema controlla già email e `external_source_id`
- Lead esistenti vengono automaticamente skippati

---

## 📝 Note Importanti

1. **NON RIMUOVERE MAI** il filtro `Form eCura` dal codice
2. Il filtro è ora **HARDCODED** per sicurezza
3. Tutti e 3 i sistemi usano lo stesso filtro
4. GitHub Actions richiede **jq** installato (già presente in ubuntu-latest)
5. L'import automatico NON sovrascrive lead esistenti

---

## 🔗 Link Utili

- **Repository**: https://github.com/RobertoPoggi/telemedcare-v12
- **Live App**: https://telemedcare-v12.pages.dev
- **GitHub Actions**: https://github.com/RobertoPoggi/telemedcare-v12/actions
- **HubSpot API**: https://developers.hubspot.com/docs/api/crm/search
