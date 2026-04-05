# 📝 Istruzioni Modifica Workflow GitHub

## ⚠️ IMPORTANTE

Il file `.github/workflows/hubspot-sync-cron.yml` è stato modificato localmente ma **NON è stato pushato su GitHub** perché il GitHub App non ha i permessi per modificare i workflows.

**Devi modificarlo MANUALMENTE su GitHub.**

---

## 🔧 Come Modificare il Workflow su GitHub

### Passo 1: Vai su GitHub
1. Apri: https://github.com/RobertoPoggi/telemedcare-v12
2. Clicca su `.github` → `workflows` → `hubspot-sync-cron.yml`
3. Clicca sul pulsante **✏️ Edit** (in alto a destra)

### Passo 2: Modifica il file

Cerca questa sezione (circa righe 46-54):

```yaml
# Seconda verifica: esegui sync completa
echo "2️⃣ Esecuzione sync completa HubSpot (ultimi 7 giorni)..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://telemedcare-v12.pages.dev/api/hubspot/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "days": 7,
    "dryRun": false,
    "onlyEcura": true
  }')
```

**SOSTITUISCI CON:**

```yaml
# Seconda verifica: esegui sync completa usando /api/hubspot/auto-import
echo "2️⃣ Esecuzione auto-import HubSpot (ultimi 24 ore, solo Form eCura)..."
echo "📡 Endpoint: POST /api/hubspot/auto-import"
echo "📤 Body: {enabled:true, startHour:0, onlyEcura:true, dryRun:false}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://telemedcare-v12.pages.dev/api/hubspot/auto-import" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "startHour": 0,
    "onlyEcura": true,
    "dryRun": false
  }')
```

### Passo 3: Modifica anche l'output dei risultati

Cerca questa sezione (circa righe 69-77):

```yaml
# Estrai statistiche dalla response
CREATED=$(echo "$BODY" | jq -r '.results.created // 0')
SKIPPED=$(echo "$BODY" | jq -r '.results.skipped // 0')
ERRORS=$(echo "$BODY" | jq -r '.results.errors | length // 0')

echo ""
echo "📊 Statistiche Sync:"
echo "   - Lead importati: $CREATED"
echo "   - Lead già esistenti: $SKIPPED"
echo "   - Errori: $ERRORS"
```

**SOSTITUISCI CON:**

```yaml
# Estrai statistiche dalla response
SUCCESS=$(echo "$BODY" | jq -r '.success // false')
IMPORTED=$(echo "$BODY" | jq -r '.imported // 0')
SKIPPED=$(echo "$BODY" | jq -r '.skipped // 0')
ERRORS=$(echo "$BODY" | jq -r '.errors // 0')
MESSAGE=$(echo "$BODY" | jq -r '.message // "N/A"')

echo ""
echo "📊 Statistiche Auto-Import:"
echo "   - Success: $SUCCESS"
echo "   - Lead importati: $IMPORTED"
echo "   - Lead già esistenti: $SKIPPED"
echo "   - Errori: $ERRORS"
echo "   - Messaggio: $MESSAGE"

if [ "$SUCCESS" = "true" ]; then
  exit 0
else
  echo ""
  echo "⚠️  Import completato ma con errori"
  exit 1
fi
```

### Passo 4: Modifica anche la sezione degli errori

Cerca questa sezione (circa righe 84-89):

```yaml
else
  echo ""
  echo "❌ ERRORE SYNC: HTTP $HTTP_CODE"
  echo "💡 Controlla log Cloudflare o esegui manualmente tasto IRBEMA"
  exit 1
fi
```

**SOSTITUISCI CON:**

```yaml
else
  echo ""
  echo "❌ ERRORE AUTO-IMPORT: HTTP $HTTP_CODE"
  echo "💡 Possibili cause:"
  echo "   1. Credenziali HubSpot non configurate (HUBSPOT_ACCESS_TOKEN, HUBSPOT_PORTAL_ID)"
  echo "   2. Database non raggiungibile"
  echo "   3. Errore interno API"
  echo ""
  echo "💡 Azioni suggerite:"
  echo "   1. Verifica variabili d'ambiente su Cloudflare Pages"
  echo "   2. Controlla log Cloudflare Workers"
  echo "   3. Esegui manualmente tasto IRBEMA per testare"
  exit 1
fi
```

### Passo 5: Aggiungi log della response completa

Cerca questa sezione (circa righe 26-28):

```yaml
SWITCH_CHECK=$(curl -s "https://telemedcare-v12.pages.dev/api/settings/hubspot_auto_import_enabled")
SWITCH_VALUE=$(echo "$SWITCH_CHECK" | jq -r '.setting.value // "false"')
```

**SOSTITUISCI CON:**

```yaml
SWITCH_CHECK=$(curl -s "https://telemedcare-v12.pages.dev/api/settings/hubspot_auto_import_enabled")
echo "📡 Response completo: $SWITCH_CHECK"

SWITCH_VALUE=$(echo "$SWITCH_CHECK" | jq -r '.setting.value // "false"' 2>/dev/null || echo "false")
```

### Passo 6: Commit e Salva

1. Scorri in basso su GitHub
2. Nel campo **Commit message** scrivi: `fix: CRON usa /api/hubspot/auto-import per ultimi 24h`
3. Clicca **Commit changes**

---

## ✅ Modifiche Principali

1. **Endpoint cambiato**: Da `/api/hubspot/sync` a `/api/hubspot/auto-import`
2. **Finestra temporale**: Da ultimi 7 giorni a ultimi 24 ore
3. **Logging migliorato**: Aggiunto output completo response e errori dettagliati
4. **Gestione errori**: Messaggi più informativi con azioni suggerite

---

## 🔍 Come Testare

Dopo aver fatto la modifica su GitHub:

1. Vai su: https://github.com/RobertoPoggi/telemedcare-v12/actions
2. Clicca sul workflow **"HubSpot Daily Sync 8:00"**
3. Clicca su **"Run workflow"** (in alto a destra)
4. Clicca sul pulsante verde **"Run workflow"**
5. Aspetta 10-20 secondi e ricarica la pagina
6. Clicca sull'esecuzione più recente per vedere i log

Se tutto funziona, vedrai nei log:
- ✅ Switch status verificato
- 📡 Chiamata API a /api/hubspot/auto-import
- 📊 Statistiche import (lead importati, skipped, errori)

---

## 🚨 Problemi Comuni

### 1. CRON non parte automaticamente
- Verifica che il workflow sia abilitato su GitHub Actions
- Controlla che lo switch "Import Auto HubSpot" sia ON nella dashboard

### 2. Errore "Credenziali HubSpot non configurate"
- Vai su Cloudflare Pages → Settings → Environment Variables
- Verifica che esistano:
  - `HUBSPOT_ACCESS_TOKEN`
  - `HUBSPOT_PORTAL_ID`

### 3. Errore HTTP 500
- Controlla i log su Cloudflare Pages
- Verifica che il database sia raggiungibile
- Esegui manualmente il tasto IRBEMA per testare

---

## 📞 Supporto

Se hai problemi, controlla:
1. Log GitHub Actions: https://github.com/RobertoPoggi/telemedcare-v12/actions
2. Log Cloudflare Pages: Dashboard Cloudflare → Pages → telemedcare-v12 → Logs
3. Console browser (F12) nella Dashboard Operativa per auto-import al refresh

---

**Data ultima modifica**: 9 Febbraio 2026
**Versione**: V12.0.3
