# 🚀 QUICK START GUIDE - TeleMedCare V11.0

## ⚡ Avvio Rapido (5 Minuti)

### 1. **Build del Progetto**
```bash
cd /home/user/webapp
npm install  # Se necessario
npm run build
```

### 2. **Avvia Server Locale**
```bash
npx wrangler pages dev --port 8787 --compatibility-date=2025-01-01
```

**Server disponibile su**: `http://localhost:8787`

### 3. **Esegui Test Automatici**
```bash
# In un nuovo terminale
./test-all-workflows.sh
```

**Risultati**: `/tmp/test_results.txt`

---

## 📨 Test Manuale Email

### Test 1: Solo Brochure
```bash
curl -X POST http://localhost:8787/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "emailRichiedente": "rpoggi55@gmail.com",
    "pacchetto": "BASE",
    "vuoleBrochure": true,
    "vuoleManuale": false,
    "vuoleContratto": false
  }'
```

### Test 2: Contratto BASE con PDF
```bash
curl -X POST http://localhost:8787/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "emailRichiedente": "rpoggi55@gmail.com",
    "telefonoRichiedente": "+39 333 1234567",
    "cfRichiedente": "PGGRRT70A01H501Z",
    "indirizzoRichiedente": "Via Test 123, Milano",
    "pacchetto": "BASE",
    "vuoleContratto": true
  }'
```

### Test 3: Canale IRBEMA
```bash
curl -X POST http://localhost:8787/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "emailRichiedente": "rpoggi55@gmail.com",
    "cfRichiedente": "PGGRRT70A01H501Z",
    "indirizzoRichiedente": "Via IRBEMA 1, Milano",
    "canale": "IRBEMA",
    "pacchetto": "ADVANCED",
    "vuoleContratto": true
  }'
```

---

## 🗄️ Database Locale

### Esegui Migrations:
```bash
npx wrangler d1 execute telemedcare-leads --local --file=./migrations/0001_initial_schema.sql
npx wrangler d1 execute telemedcare-leads --local --file=./migrations/0002_add_missing_tables.sql
npx wrangler d1 execute telemedcare-leads --local --file=./migrations/0003_fix_schema.sql
npx wrangler d1 execute telemedcare-leads --local --file=./migrations/0004_add_missing_templates.sql
npx wrangler d1 execute telemedcare-leads --local --file=./migrations/0012_populate_templates.sql
```

### Query Database:
```bash
npx wrangler d1 execute telemedcare-leads --local --command="SELECT * FROM leads ORDER BY created_at DESC LIMIT 5"
npx wrangler d1 execute telemedcare-leads --local --command="SELECT * FROM contracts ORDER BY created_at DESC LIMIT 5"
npx wrangler d1 execute telemedcare-leads --local --command="SELECT id, name, type FROM document_templates"
```

---

## 📊 Verifica Logs

### Logs in Tempo Reale:
```bash
tail -f /tmp/wrangler_clean.log | grep -E "✅|❌|📧|📄|📎"
```

### Cerca Errori:
```bash
tail -100 /tmp/wrangler_clean.log | grep -i error
```

### Verifica PDF Generati:
```bash
tail -100 /tmp/wrangler_clean.log | grep -E "CONTRACT-GEN|PDF generato|buffer PDF"
```

---

## 🎯 Test Specifici per Canale

### IRBEMA (0% commissione):
```bash
curl -X POST http://localhost:8787/api/lead -H "Content-Type: application/json" \
  -d '{"nomeRichiedente":"Test","cognomeRichiedente":"IRBEMA","emailRichiedente":"rpoggi55@gmail.com","cfRichiedente":"TEST00A01H501Z","canale":"IRBEMA","pacchetto":"BASE","vuoleContratto":true}'
```

### BLK Condomini (5% commissione):
```bash
curl -X POST http://localhost:8787/api/lead -H "Content-Type: application/json" \
  -d '{"nomeRichiedente":"Test","cognomeRichiedente":"BLK","emailRichiedente":"rpoggi55@gmail.com","cfRichiedente":"TEST00A01H501Z","canale":"BLK_CONDOMINI","pacchetto":"BASE","vuoleContratto":true}'
```

### Mondadori (10% sconto):
```bash
curl -X POST http://localhost:8787/api/lead -H "Content-Type: application/json" \
  -d '{"nomeRichiedente":"Test","cognomeRichiedente":"Mondadori","emailRichiedente":"rpoggi55@gmail.com","cfRichiedente":"TEST00A01H501Z","canale":"MONDADORI","pacchetto":"ADVANCED","vuoleContratto":true}'
```

---

## 🔧 Troubleshooting

### Problema: Server non si avvia
```bash
# Kill processi esistenti
lsof -ti:8787 | xargs kill -9
# Pulisci cache
rm -rf .wrangler
# Rebuild
npm run build
# Restart
npx wrangler pages dev --port 8787
```

### Problema: Database vuoto
```bash
# Re-run migrations
cd /home/user/webapp
npx wrangler d1 execute telemedcare-leads --local --file=./migrations/0001_initial_schema.sql
# ... continua con altre migrations
```

### Problema: PDF non generati
```bash
# Verifica jsPDF installato
npm list jspdf
# Se manca, reinstalla
npm install jspdf
npm run build
```

---

## 📧 Verifica Email

### Email di Test Inviate a: `rpoggi55@gmail.com`

**Controlla inbox per:**
1. ✉️ Email notifica nuovo lead (a info@telemedcare.it simulated)
2. ✉️ Email documenti informativi (con allegati PDF)
3. ✉️ Email contratto (con PDF contratto allegato)

**Allegati Previsti:**
- 📄 Brochure TeleMedCare (1117 KB)
- 📄 Manuale SiDLY (716 KB)
- 📄 Contratto PDF (7-8 KB)

---

## 🎨 Prezzi e Commissioni

### Prezzi Configurati:
```typescript
BASE:
  - Primo anno: 480€ + IVA 22% = 585,60€
  - Rinnovo: 240€ + IVA 22% = 292,80€

ADVANCED:
  - Primo anno: 840€ + IVA 22% = 1.024,80€
  - Rinnovo: 600€ + IVA 22% = 732,00€
```

### Commissioni per Canale:
```
IRBEMA: 0% (eccezione)
BLK, Welfare, Partner: 5%
Mondadori: 10% sconto (no commissione)
```

---

## 📁 File Chiave

### Configurazione:
- `src/config/pricing-config.ts` - **LEGGI QUESTO PRIMA**
- `wrangler.toml` - Config Cloudflare

### Moduli Principali:
- `src/modules/complete-workflow-orchestrator.ts` - Orchestratore workflow
- `src/modules/contract-generator.ts` - Generatore PDF
- `src/modules/email-service.ts` - Servizio email
- `src/modules/workflow-email-manager.ts` - Gestione email workflow

### Test:
- `test-all-workflows.sh` - Test automatico
- `TEST_REPORT.md` - Report dettagliato
- `RESOCONTO_ROBERTO.md` - Summary per Roberto

---

## ⚡ Comandi Rapidi

```bash
# Build
npm run build

# Dev server
npx wrangler pages dev --port 8787

# Test tutti i workflow
./test-all-workflows.sh

# Vedi ultimi 5 lead
npx wrangler d1 execute telemedcare-leads --local \
  --command="SELECT id, nome_richiedente, email_richiedente, pacchetto, status FROM leads ORDER BY created_at DESC LIMIT 5"

# Vedi contratti generati
npx wrangler d1 execute telemedcare-leads --local \
  --command="SELECT id, codice_contratto, contract_type, prezzo, status FROM contracts ORDER BY created_at DESC LIMIT 5"

# Logs real-time
tail -f /tmp/wrangler_clean.log

# Git status
git status
git log --oneline -5
```

---

## ✅ Checklist Verifiche

- [ ] Server si avvia senza errori
- [ ] Test automatico: 12/12 passati
- [ ] Email ricevute su rpoggi55@gmail.com
- [ ] PDF allegati leggibili
- [ ] Placeholders sostituiti nei template
- [ ] Prezzi corretti (480€/840€ + IVA 22%)
- [ ] Database salvato correttamente
- [ ] Logs senza errori critici

---

**Per assistenza**: Vedi `RESOCONTO_ROBERTO.md` o `TEST_REPORT.md`
