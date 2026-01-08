# 🚀 Setup GitHub Actions - Reminder Automatici

## 📁 File da Creare

Crea questo file nel repository GitHub:

**Path:** `.github/workflows/reminder-cron.yml`

```yaml
name: Lead Completion Reminders

# Esegui ogni giorno alle 09:00 UTC (10:00 CET / 11:00 CEST)
on:
  schedule:
    - cron: '0 9 * * *'
  
  # Permetti esecuzione manuale
  workflow_dispatch:

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    
    steps:
      - name: 📧 Invia Reminder Lead Incompleti
        run: |
          echo "🔔 Avvio processo reminder..."
          echo "📅 Data: $(date -u)"
          
          # Chiamata API
          RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
            "https://telemedcare-v12.pages.dev/api/cron/send-reminders" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json")
          
          HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
          BODY=$(echo "$RESPONSE" | sed '$d')
          
          echo "📨 HTTP Status: $HTTP_CODE"
          echo "📋 Response Body:"
          echo "$BODY" | jq '.' || echo "$BODY"
          
          # Verifica successo
          if [ "$HTTP_CODE" -eq "200" ]; then
            echo "✅ Reminder inviati con successo!"
            exit 0
          elif [ "$HTTP_CODE" -eq "204" ]; then
            echo "⚠️ Cron disabilitato dalla dashboard (nessuna azione)"
            exit 0
          else
            echo "❌ Errore invio reminder: HTTP $HTTP_CODE"
            exit 1
          fi
          
      - name: 📊 Log Risultati
        if: always()
        run: |
          echo "========================================="
          echo "REMINDER CRON JOB COMPLETATO"
          echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
          echo "========================================="
```

---

## 🔐 STEP 2: Configurare Secret GitHub

### 2.1 Genera Token Sicuro

Esegui questo comando per generare un token random:

```bash
openssl rand -base64 32
```

**Esempio output:**
```
Xk8mN2pQ4rL9vT6wY3zA1hB5nC7dE0fG8jH4kM2sP9qR=
```

**COPIA questo token** (lo userai 2 volte: GitHub + Cloudflare)

### 2.2 Aggiungi Secret su GitHub

1. Vai su: **https://github.com/RobertoPoggi/telemedcare-v12**
2. Click: **Settings** (tab in alto)
3. Menu laterale: **Secrets and variables** → **Actions**
4. Click: **New repository secret**
5. Compila:
   - **Name:** `CRON_SECRET`
   - **Secret:** (incolla il token generato sopra)
6. Click: **Add secret**

### 2.3 Aggiungi Secret su Cloudflare Pages

1. Vai su: **https://dash.cloudflare.com**
2. Naviga: **Pages** → **telemedcare-v12** → **Settings** → **Environment variables**
3. Sezione: **Production** (e **Preview** se vuoi testare)
4. Click: **Add variable**
5. Compila:
   - **Variable name:** `CRON_SECRET`
   - **Value:** (incolla lo STESSO token di GitHub)
   - **Type:** **Encrypted**
6. Click: **Save**

---

## 📂 STEP 3: Crea il File su GitHub

### Metodo A: Via Web Interface (Più Semplice)

1. Vai su: **https://github.com/RobertoPoggi/telemedcare-v12**
2. Click: **Add file** → **Create new file**
3. Nel campo **Name your file** scrivi: `.github/workflows/reminder-cron.yml`
4. Copia-incolla il contenuto del file YAML sopra
5. Scroll in basso:
   - **Commit message:** `feat(cron): GitHub Actions reminder automatici`
   - **Branch:** Seleziona `genspark_ai_developer` o `main`
6. Click: **Commit new file**

### Metodo B: Via Git Locale

```bash
# Crea directory workflows
mkdir -p .github/workflows

# Crea il file
cat > .github/workflows/reminder-cron.yml << 'EOF'
[... copia contenuto YAML sopra ...]
EOF

# Commit e push
git add .github/workflows/reminder-cron.yml
git commit -m "feat(cron): GitHub Actions reminder automatici"
git push origin genspark_ai_developer
```

---

## ✅ STEP 4: Verifica Setup

### 4.1 Verifica Secret GitHub

1. Vai su: **Settings** → **Secrets and variables** → **Actions**
2. Dovresti vedere: `CRON_SECRET` ✅

### 4.2 Verifica Workflow

1. Vai su: **Actions** tab (in alto)
2. Sidebar sinistra: dovresti vedere **Lead Completion Reminders**
3. Click per aprire

### 4.3 Test Manuale (Prima Esecuzione)

1. Nella pagina del workflow, click: **Run workflow** (bottone a destra)
2. Conferma: **Run workflow**
3. Attendi 10-20 secondi
4. Refresh pagina
5. Dovresti vedere l'esecuzione in corso (pallino giallo) o completata (check verde)

### 4.4 Verifica Log

1. Click sull'esecuzione (es: "Lead Completion Reminders #1")
2. Click su: **send-reminders**
3. Espandi: **📧 Invia Reminder Lead Incompleti**
4. Dovresti vedere:
   ```
   ✅ Reminder inviati con successo!
   Response: {"success":true,"stats":{"success":2,"failed":0,"total":2}}
   ```

---

## 🎯 ORARIO ESECUZIONE

**Impostato:** `0 9 * * *` = **09:00 UTC**

**Conversione ora italiana:**
- **Inverno (CET):** 10:00
- **Estate (CEST):** 11:00

### Cambiare Orario

Modifica la riga `cron:` nel file YAML:

| Orario Desiderato (CET/CEST) | Cron Expression |
|------------------------------|-----------------|
| 08:00 | `0 7 * * *` |
| 09:00 | `0 8 * * *` |
| 10:00 (attuale) | `0 9 * * *` |
| 11:00 | `0 10 * * *` |
| 15:00 | `0 14 * * *` |

---

## 🐛 Troubleshooting

### Errore: "Invalid workflow file"
- ✅ Verifica indentazione YAML (usa spazi, non tab)
- ✅ Controlla che il path sia esattamente `.github/workflows/reminder-cron.yml`

### Errore 401 Unauthorized
- ✅ Verifica che `CRON_SECRET` sia configurato su GitHub E Cloudflare
- ✅ Verifica che i token siano identici

### Workflow non appare in Actions
- ✅ Verifica che il file sia nel branch `main` o `genspark_ai_developer`
- ✅ Aspetta 1-2 minuti (GitHub potrebbe richiedere tempo per rilevarlo)

### Reminder non inviati
- ✅ Verifica che il cron sia **ABILITATO** dalla dashboard (interruttore ON)
- ✅ Controlla log Cloudflare Pages per errori

---

## 📊 Monitoraggio

### Dove Vedere le Esecuzioni:

1. **GitHub Actions:**
   - URL: https://github.com/RobertoPoggi/telemedcare-v12/actions
   - Mostra: Ogni esecuzione giornaliera con log completi

2. **Cloudflare Pages Logs:**
   - Dashboard → Pages → telemedcare-v12 → Functions → Logs
   - Mostra: Log dettagliati API `/api/cron/send-reminders`

3. **Database Logs:**
   - Query: `SELECT * FROM lead_completion_log WHERE action = 'reminder_sent' ORDER BY created_at DESC`
   - Mostra: Ogni reminder inviato con timestamp

---

## 🎉 COMPLETAMENTO

Quando hai completato i passi sopra:
1. ✅ File `.github/workflows/reminder-cron.yml` creato
2. ✅ Secret `CRON_SECRET` configurato su GitHub
3. ✅ Secret `CRON_SECRET` configurato su Cloudflare
4. ✅ Test manuale eseguito con successo

Il sistema è **PRONTO** per inviare reminder automatici ogni giorno alle 09:00 UTC! 🚀

---

## 📞 Supporto

Se riscontri problemi:
1. Controlla i log GitHub Actions
2. Controlla i log Cloudflare Pages
3. Verifica configurazione secrets
4. Testa manualmente l'API: `curl -X POST https://telemedcare-v12.pages.dev/api/cron/send-reminders -H "Authorization: Bearer YOUR_SECRET"`
