# 🛠️ Guida Ambiente di Sviluppo Stabile

## Problema: Database che si Resetta

Il database D1 locale (`.wrangler/state/v3/d1/`) viene spesso resettato quando:
- Si killano i processi wrangler/workerd
- Si riavvia il server
- Si fa rebuild del progetto

## ✅ Soluzione: Backup/Restore Automatico

### 1. **Salva il Database** (dopo aver creato dati di test)

```bash
npm run db:backup
```

Questo crea 2 file:
- `db-backups/telemedcare_YYYYMMDD_HHMMSS.sqlite` (backup con timestamp)
- `db-backups/telemedcare_latest.sqlite` (ultimo backup, facile da ripristinare)

### 2. **Ripristina il Database** (quando serve)

```bash
npm run db:restore
```

Oppure ripristina un backup specifico:

```bash
./scripts/db-restore.sh telemedcare_20251110_143000.sqlite
```

### 3. **Workflow Consigliato**

```bash
# 1. Crea i dati di test nella dashboard
# 2. Salva il database
npm run db:backup

# 3. Lavora normalmente...
# Se il database si resetta:

# 4. Ripristina in 1 secondo!
npm run db:restore

# 5. Riavvia il server
npm run dev
```

---

## 🚀 Server Stabile - Best Practices

### **Opzione A: Usa un Terminal Dedicato**

Non killare mai il processo del server! Tienilo in un terminal separato:

```bash
# Terminal 1 - Server (lascia attivo)
cd /home/user/webapp
npm run dev

# Terminal 2 - Comandi git, build, etc.
git add .
git commit -m "..."
```

### **Opzione B: Script di Restart Intelligente**

Creo uno script che:
1. Salva il database
2. Killa il server
3. Rebuilda
4. Ripristina il database  
5. Riavvia il server

```bash
npm run dev:restart
```

---

## 🔧 Comandi Utili

### Database

```bash
# Backup
npm run db:backup

# Restore
npm run db:restore

# Reset completo (⚠️ perde tutto)
npm run db:reset

# Console SQL
npm run db:console:local
```

### Server

```bash
# Avvia (porta 3000)
npm run dev

# Pulisci porta e riavvia
npm run clean-port
npm run dev

# Kill tutto manualmente
lsof -ti:3000,3001 | xargs -r kill -9
```

### Build

```bash
# Build normale
npm run build

# Build pulito
rm -rf dist && npm run build
```

---

## 📊 Verifica Database

Dopo un restore, verifica i dati:

```bash
npx wrangler d1 execute telemedcare-leads --local --command="
SELECT 
  (SELECT COUNT(*) FROM leads) as leads,
  (SELECT COUNT(*) FROM contracts) as contracts,
  (SELECT COUNT(*) FROM proforma) as proforma,
  (SELECT COUNT(*) FROM document_templates) as templates
"
```

---

## 🎯 Setup Iniziale Consigliato

1. **Crea dati di test completi** nella dashboard:
   - 3-5 Leads (vari stati)
   - 2-3 Contratti (firmati e non)
   - 2-3 Proforma (pending e pagate)

2. **Salva il database**:
   ```bash
   npm run db:backup
   ```

3. **D'ora in poi**: ogni volta che il DB si resetta, fai:
   ```bash
   npm run db:restore
   ```

4. **Tempo di ripristino**: 2 secondi invece di 10 minuti! ⚡

---

## 🐛 Troubleshooting

### "Database non trovato"
```bash
# Avvia il server una volta per creare la struttura
npm run dev
# Ctrl+C dopo che parte
# Poi riprova il restore
```

### "Backup non trovato"
```bash
# Lista i backup disponibili
ls -lh db-backups/

# Se vuoto, crea prima i dati e fai backup
npm run db:backup
```

### "Address already in use"
```bash
# Pulisci le porte
lsof -ti:3000,3001 | xargs -r kill -9
sleep 2
npm run dev
```

---

## 💡 Tip: Backup Automatico

Aggiungi al tuo workflow git:

```bash
# Dopo modifiche importanti
git add .
npm run db:backup  # ← Salva DB prima del commit
git commit -m "feat: nuova funzione"
git push
```
