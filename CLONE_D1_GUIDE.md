# 📦 Guida: Clonare Database D1 da Production a Preview

## 🎯 Situazione Attuale

**Production e Preview condividono LO STESSO database D1:**
- Nome: `telemedcare-leads`
- ID: `e49ad96c-a4c7-4d3e-b2b9-4f3e8a1c5d7f`

Questo significa che:
- ✅ I dati sono sempre sincronizzati
- ✅ Non serve clonare nulla (usano lo stesso DB)
- ⚠️ Modifiche in Preview impattano Production

---

## 🔀 Scenari

### Scenario 1: Vuoi continuare a condividere il DB
**Non serve fare nulla!** Production e Preview già condividono lo stesso database.

### Scenario 2: Vuoi separare i database
Crea un database D1 separato per Preview e clona i dati.

---

## 🚀 Soluzione: Script di Clonazione

Ho creato **2 script** per clonare il database D1:

### 📝 Script 1: Quick Clone (CONSIGLIATO)

File: `clone-d1-quick.sh`

**Cosa fa:**
1. Esporta tutto il database Production in un file SQL
2. Ti chiede se vuoi creare un nuovo database per Preview
3. Importa automaticamente i dati

**Uso:**
```bash
cd /home/user/webapp
./clone-d1-quick.sh
```

**Output atteso:**
```
🚀 D1 Database Quick Clone - Production → Preview
==================================================

📥 Step 1: Backup database Production...

✅ Backup completato: /tmp/d1_backup_20260106_120000.sql
   Dimensione: 2.4M
   Righe SQL: 15847

📤 Step 2: Opzioni di restore...

Opzioni:
  1) Creare nuovo database 'telemedcare-leads-preview' e importare
  2) Solo salvare il backup

Scelta (1/2): 1

Creazione database: telemedcare-leads-preview
✅ Database creato

Import dati...
✅ Import completato su telemedcare-leads-preview

📝 Prossimi passi:
  1. Vai su Cloudflare Pages → Settings → Bindings
  2. Modifica binding 'DB' per environment Preview
  3. Seleziona database: telemedcare-leads-preview
  4. Salva
```

---

### 📝 Script 2: Clone Avanzato

File: `clone-d1-database.sh`

**Cosa fa:**
- Export tabella per tabella
- Maggiore controllo e logging
- Supporta export JSON per analisi

**Uso:**
```bash
cd /home/user/webapp
./clone-d1-database.sh
```

---

## 🛠️ Metodo Manuale (Wrangler CLI)

Se preferisci il controllo totale:

### Step 1: Export Production
```bash
npx wrangler d1 export telemedcare-leads --remote --output=/tmp/backup.sql
```

### Step 2: Crea database Preview
```bash
npx wrangler d1 create telemedcare-leads-preview
```

Output:
```
✅ Successfully created DB 'telemedcare-leads-preview'
Database ID: <NUOVO-ID>
```

**IMPORTANTE**: Copia il Database ID!

### Step 3: Import dati
```bash
npx wrangler d1 execute telemedcare-leads-preview --remote --file=/tmp/backup.sql
```

### Step 4: Configura binding Preview
1. Vai su Cloudflare Pages → Settings → Bindings
2. Modifica binding `DB` per Preview
3. Cambia da `telemedcare-leads` a `telemedcare-leads-preview`
4. Salva (triggera redeploy automatico)

---

## 📊 Confronto: Database Condiviso vs Separato

### Database Condiviso (Attuale)

**Vantaggi:**
- ✅ Dati sempre sincronizzati
- ✅ Zero manutenzione
- ✅ Preview riflette Production
- ✅ Non serve clonare

**Svantaggi:**
- ⚠️ Test in Preview impattano Production
- ⚠️ Non puoi testare migration senza rischi

### Database Separato

**Vantaggi:**
- ✅ Test isolati (zero impatto su Production)
- ✅ Puoi testare migration
- ✅ Puoi modificare dati senza paura

**Svantaggi:**
- ⚠️ Devi sincronizzare manualmente
- ⚠️ Costi extra (minimo, D1 è quasi gratis)
- ⚠️ Manutenzione aggiuntiva

---

## 💰 Costi D1 (Cloudflare)

D1 è **quasi gratis** con il piano Workers Paid:

### Free Tier (per account)
- 5 GB storage
- 5 milioni read/giorno
- 100k write/giorno

Il tuo database `telemedcare-leads` con 51 leads è circa **< 10 MB**. Averne 2 (Production + Preview) non impatta i costi.

---

## 🔄 Sincronizzazione Periodica

Se crei un database separato, puoi sincronizzare periodicamente:

### Script di sync automatico

```bash
#!/bin/bash
# sync-d1-preview.sh

npx wrangler d1 export telemedcare-leads --remote --output=/tmp/sync.sql
npx wrangler d1 execute telemedcare-leads-preview --remote --file=/tmp/sync.sql

echo "✅ Preview sincronizzato con Production"
```

Puoi eseguirlo:
- Manualmente quando serve
- Con cron job (es. ogni notte)
- Prima di ogni test importante

---

## 🚨 Warning: Migration Schema

Se hai migration SQL da applicare:

### Con Database Condiviso
Migration si applica automaticamente sia a Production che Preview (stesso DB).

### Con Database Separato
Devi applicare le migration a ENTRAMBI i database:

```bash
# Production
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0001_new_table.sql

# Preview (separato)
npx wrangler d1 execute telemedcare-leads-preview --remote --file=migrations/0001_new_table.sql
```

---

## 📝 Raccomandazione

### Per sviluppo attivo (ora)
**Usa database condiviso** (configurazione attuale)
- Più semplice
- Zero manutenzione
- I dati di test sono reali

### Per testing isolato
**Crea database separato** con gli script
- Test senza impatto su Production
- Libertà di modificare/cancellare dati

---

## 🔗 Link Utili

- **Documentazione D1**: https://developers.cloudflare.com/d1/
- **Wrangler D1 Commands**: https://developers.cloudflare.com/workers/wrangler/commands/#d1
- **D1 Pricing**: https://developers.cloudflare.com/d1/platform/pricing/

---

## ✅ Checklist: Creazione Database Separato

- [ ] Esegui `./clone-d1-quick.sh`
- [ ] Prendi nota del Database ID generato
- [ ] Vai su Cloudflare Pages → Settings → Bindings
- [ ] Modifica binding `DB` per Preview
- [ ] Seleziona il nuovo database `telemedcare-leads-preview`
- [ ] Salva (attendi redeploy 2-3 min)
- [ ] Testa Preview: https://genspark-ai-developer.telemedcare-v12.pages.dev/admin/leads-dashboard
- [ ] Verifica che i dati siano visibili

---

**File**: `clone-d1-quick.sh`, `clone-d1-database.sh`  
**Documentazione**: `CLONE_D1_GUIDE.md`  
**Data**: 2026-01-06
