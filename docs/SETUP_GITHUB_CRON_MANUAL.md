# 🚨 SETUP MANUALE GITHUB CRON - ISTRUZIONI

**Problema:** Il token GitHub non ha permesso di creare workflow automaticamente.

**Soluzione:** Devi creare il workflow manualmente su GitHub.

---

## 📋 ISTRUZIONI PASSO-PASSO

### Opzione A: Via GitHub Web Interface (RACCOMANDATO)

1. **Vai su GitHub:**
   ```
   https://github.com/RobertoPoggi/telemedcare-v12
   ```

2. **Naviga a Actions:**
   - Click su tab "Actions" in alto

3. **Crea nuovo workflow:**
   - Click "New workflow"
   - Click "set up a workflow yourself"

4. **Incolla questo codice:**
   - Nome file: `hubspot-sync-cron.yml`
   - Path: `.github/workflows/hubspot-sync-cron.yml`
   - Copia il contenuto dal file locale qui sotto

5. **Commit:**
   - Commit message: "feat: add GitHub cron for daily HubSpot sync at 9:00 AM"
   - Click "Commit changes"

---

## 📄 CONTENUTO FILE WORKFLOW

Copia questo contenuto esattamente:

\`\`\`yaml
name: HubSpot Daily Sync 9:00

on:
  schedule:
    - cron: '0 9 * * *'  # Ogni giorno alle 9:00 UTC (10:00 ora italiana)
  workflow_dispatch:      # Permette esecuzione manuale

jobs:
  sync-hubspot:
    runs-on: ubuntu-latest
    
    steps:
      - name: 🔄 Sync Completa HubSpot Lead
        run: |
          echo "========================================="
          echo "🔔 HUBSPOT DAILY SYNC - Avvio processo"
          echo "📅 Data: \$(date -u +"%Y-%m-%d %H:%M:%S UTC")"
          echo "🕐 Ora italiana: \$(TZ='Europe/Rome' date +"%Y-%m-%d %H:%M:%S")"
          echo "========================================="
          
          # Prima verifica: switch abilitato?
          echo ""
          echo "1️⃣ Verifica switch 'Import Auto HubSpot'..."
          
          SWITCH_CHECK=\$(curl -s "https://telemedcare-v12.pages.dev/api/settings/hubspot_auto_import_enabled")
          SWITCH_VALUE=\$(echo "\$SWITCH_CHECK" | jq -r '.setting.value // "false"')
          
          echo "📊 Switch status: \$SWITCH_VALUE"
          
          if [ "\$SWITCH_VALUE" != "true" ]; then
            echo ""
            echo "⏭️  SKIP: Import Auto HubSpot è disabilitato nella dashboard"
            echo "💡 Per abilitare: Dashboard Operativa → Impostazioni Sistema → Import Auto HubSpot → ON"
            echo ""
            echo "========================================="
            echo "✅ CRON COMPLETATO (skipped per switch OFF)"
            echo "========================================="
            exit 0
          fi
          
          echo "✅ Switch abilitato, procedo con sync..."
          echo ""
          
          # Seconda verifica: esegui sync completa
          echo "2️⃣ Esecuzione sync completa HubSpot (ultimi 7 giorni)..."
          
          RESPONSE=\$(curl -s -w "\\n%{http_code}" -X POST \\
            "https://telemedcare-v12.pages.dev/api/hubspot/sync" \\
            -H "Content-Type: application/json" \\
            -d '{
              "days": 7,
              "dryRun": false,
              "onlyEcura": true
            }')
          
          HTTP_CODE=\$(echo "\$RESPONSE" | tail -n 1)
          BODY=\$(echo "\$RESPONSE" | sed '\$d')
          
          echo ""
          echo "📨 HTTP Status: \$HTTP_CODE"
          echo "📋 Response Body:"
          echo "\$BODY" | jq '.' 2>/dev/null || echo "\$BODY"
          
          if [ "\$HTTP_CODE" -eq "200" ]; then
            echo ""
            echo "✅ SYNC COMPLETATA CON SUCCESSO!"
            
            # Estrai statistiche dalla response
            CREATED=\$(echo "\$BODY" | jq -r '.results.created // 0')
            SKIPPED=\$(echo "\$BODY" | jq -r '.results.skipped // 0')
            ERRORS=\$(echo "\$BODY" | jq -r '.results.errors | length // 0')
            
            echo ""
            echo "📊 Statistiche Sync:"
            echo "   - Lead importati: \$CREATED"
            echo "   - Lead già esistenti: \$SKIPPED"
            echo "   - Errori: \$ERRORS"
            
            exit 0
          elif [ "\$HTTP_CODE" -eq "403" ]; then
            echo ""
            echo "⚠️  Sync disabilitata dalla dashboard (switch OFF)"
            exit 0
          else
            echo ""
            echo "❌ ERRORE SYNC: HTTP \$HTTP_CODE"
            echo "💡 Controlla log Cloudflare o esegui manualmente tasto IRBEMA"
            exit 1
          fi
          
      - name: 📊 Log Risultati Finali
        if: always()
        run: |
          echo ""
          echo "========================================="
          echo "HUBSPOT DAILY SYNC COMPLETATO"
          echo "Timestamp: \$(date -u +"%Y-%m-%d %H:%M:%S UTC")"
          echo "Ora italiana: \$(TZ='Europe/Rome' date +"%Y-%m-%d %H:%M:%S")"
          echo "========================================="
\`\`\`

---

## ✅ VERIFICA ATTIVAZIONE

1. **Vai su GitHub Actions:**
   ```
   https://github.com/RobertoPoggi/telemedcare-v12/actions
   ```

2. **Verifica workflow presente:**
   - Dovresti vedere "HubSpot Daily Sync 9:00" nella lista

3. **Test esecuzione manuale:**
   - Click sul workflow "HubSpot Daily Sync 9:00"
   - Click "Run workflow"
   - Select branch: main
   - Click "Run workflow"
   - Attendi completamento (~1 minuto)
   - Verifica log

---

## 🎯 DOPO L'ATTIVAZIONE

### 1. Abilita Switch Dashboard

```
1. Vai su: https://telemedcare-v12.pages.dev/dashboard
2. Scroll → Impostazioni Sistema
3. Trova "Import Auto HubSpot"
4. Cambia da "OFF - Disattivato" a "ON - Attivo"
5. Salva
```

### 2. Prima Esecuzione

- ⏰ Prossima esecuzione automatica: Domani alle 9:00 UTC (10:00 Italia)
- 🧪 Test immediato: Run workflow manuale (vedi sopra)

### 3. Verifica Funzionamento

```bash
# Verifica switch attivo
curl https://telemedcare-v12.pages.dev/api/settings/hubspot_auto_import_enabled

# Atteso:
{
  "success": true,
  "setting": {
    "key": "hubspot_auto_import_enabled",
    "value": "true",
    "enabled": true
  }
}
```

---

## 📊 MONITORAGGIO

### Log GitHub Actions

```
1. GitHub → Actions
2. Click "HubSpot Daily Sync 9:00"
3. Vedi tutte le esecuzioni (giornaliere)
4. Click su un'esecuzione per vedere log dettagliato
```

### Cosa Aspettarti nei Log

**Se Switch OFF:**
```
⏭️  SKIP: Import Auto HubSpot è disabilitato nella dashboard
✅ CRON COMPLETATO (skipped per switch OFF)
```

**Se Switch ON:**
```
✅ Switch abilitato, procedo con sync...
📨 HTTP Status: 200
✅ SYNC COMPLETATA CON SUCCESSO!
📊 Statistiche Sync:
   - Lead importati: 3
   - Lead già esistenti: 47
   - Errori: 0
```

---

## 🆘 TROUBLESHOOTING

### Workflow non appare in Actions

**Problema:** File non committato correttamente

**Soluzione:**
1. Verifica file esiste: `.github/workflows/hubspot-sync-cron.yml`
2. Verifica sintassi YAML corretta
3. Push di nuovo il file

### Cron non si attiva alle 9:00

**Problema:** GitHub Actions potrebbe avere delay

**Soluzione:**
- Normale: GitHub Actions può avere ritardi fino a 10-15 minuti
- Usa "Run workflow" manuale per test immediato

### Sync fallisce con HTTP 403

**Problema:** Switch dashboard è OFF

**Soluzione:**
- Vai su dashboard
- Abilita switch "Import Auto HubSpot"
- Riprova

### Sync fallisce con HTTP 500

**Problema:** Credenziali HubSpot mancanti

**Soluzione:**
- Verifica variabili ambiente Cloudflare:
  - `HUBSPOT_ACCESS_TOKEN`
  - `HUBSPOT_PORTAL_ID`
- Testa endpoint manualmente

---

## 📋 CHECKLIST FINALE

Dopo aver creato il workflow su GitHub:

- [ ] Workflow `hubspot-sync-cron.yml` committato su GitHub
- [ ] Workflow appare in GitHub → Actions
- [ ] Test esecuzione manuale completato con successo
- [ ] Switch "Import Auto HubSpot" abilitato in dashboard
- [ ] Endpoint `/api/settings/hubspot_auto_import_enabled` ritorna `true`
- [ ] Prima esecuzione automatica schedulata per domani 9:00

---

## 🎉 SISTEMA COMPLETO

Dopo setup:

✅ **Cron GitHub 9:00** → Sync completa automatica  
✅ **Auto-import incrementale** → Durante il giorno  
✅ **Switch dashboard** → Controllo ON/OFF  
✅ **Tasto IRBEMA** → Sync manuale  

**Lead coperti 24/7:**
- 🌙 Notturni (00:00-08:00) → Importati alle 9:00
- ☀️ Mattina (08:00-09:00) → Importati alle 9:00
- 📊 Giornata (09:00-18:00) → Auto-import real-time
- 🌆 Sera (18:00-24:00) → Importati alle 9:00 giorno dopo

---

**Pronto! Segui le istruzioni sopra per completare il setup.** ✅
