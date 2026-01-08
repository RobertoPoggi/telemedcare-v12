# Sistema Reminder Automatici - TeleMedCare

## 📧 Descrizione

Sistema automatico per inviare reminder ai lead incompleti che non hanno completato i dati richiesti.

## 🔧 Configurazione

### 1. Environment Variables Cloudflare Pages

Aggiungi in **Cloudflare Dashboard** → **Pages** → **telemedcare-v12** → **Settings** → **Environment Variables**:

```
CRON_SECRET=your-secure-random-token-here
```

Genera un token sicuro con:
```bash
openssl rand -base64 32
```

### 2. Configurazione Database

I parametri sono configurabili via API `/api/system/config`:

```json
{
  "auto_completion_enabled": false,
  "auto_completion_token_days": 30,
  "auto_completion_reminder_days": 3,
  "auto_completion_max_reminders": 2
}
```

## 🚀 Opzioni di Deployment Cron

### Opzione A: GitHub Actions (Consigliata)

**Vantaggi:**
- Gratuito per repository pubblici/privati
- Configurazione semplice
- Log centralizati
- Notifiche su fallimento

**Setup:**

Crea il file `.github/workflows/reminder-cron.yml` (richiede permessi admin):

```yaml
name: Lead Completion Reminders

on:
  schedule:
    - cron: '0 9 * * *'  # Ogni giorno alle 09:00 UTC
  workflow_dispatch:

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: 📧 Invia Reminder Lead Incompleti
        run: |
          curl -X POST \
            "https://telemedcare-v12.pages.dev/api/cron/send-reminders" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

**Configurazione Secrets:**
1. GitHub → Settings → Secrets → Actions
2. New repository secret: `CRON_SECRET` = (tuo token)

### Opzione B: Cloudflare Workers Cron

**Vantaggi:**
- Integrato con Cloudflare
- Esecuzione edge
- Nessun rate limit

**Setup:**

Crea un Cloudflare Worker separato:

```javascript
export default {
  async scheduled(event, env, ctx) {
    const response = await fetch(
      'https://telemedcare-v12.pages.dev/api/cron/send-reminders',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CRON_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    const result = await response.json()
    console.log('Reminder result:', result)
  }
}
```

Aggiungi trigger in `wrangler.toml`:

```toml
[triggers]
crons = ["0 9 * * *"]
```

### Opzione C: Servizio Esterno (es. EasyCron, Cron-job.org)

**Setup:**
1. Registrati su https://www.easycron.com/ (gratuito)
2. Crea nuovo cron job:
   - URL: `https://telemedcare-v12.pages.dev/api/cron/send-reminders`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`
   - Schedule: `0 9 * * *`

## 📝 API Endpoints

### POST /api/cron/send-reminders
Invia reminder per tutti i lead incompleti.

**Headers:**
```
Authorization: Bearer YOUR_CRON_SECRET
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Processo reminder completato",
  "stats": {
    "success": 5,
    "failed": 0,
    "total": 5
  }
}
```

### GET /api/cron/send-reminders
Test endpoint (richiede auth in production).

**Usage:**
```bash
curl "https://telemedcare-v12.pages.dev/api/cron/send-reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 🧪 Test Manuale

### Locale (Development)
```bash
# Avvia dev server
npm run dev

# Test endpoint
curl -X POST "http://localhost:8788/api/cron/send-reminders" \
  -H "Authorization: Bearer test-secret-change-in-production"
```

### Production
```bash
curl -X POST "https://telemedcare-v12.pages.dev/api/cron/send-reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 📊 Monitoraggio

### Cloudflare Logs
Dashboard → Pages → telemedcare-v12 → Functions → Logs

### Database Logs
Query log reminder:
```sql
SELECT * FROM lead_completion_log 
WHERE action = 'reminder_sent' 
ORDER BY created_at DESC 
LIMIT 50
```

## ⚙️ Configurazione Avanzata

### Cambiare orario esecuzione
- `0 9 * * *` = 09:00 UTC (10:00 CET)
- `0 6 * * *` = 06:00 UTC (07:00 CET)
- `30 8 * * *` = 08:30 UTC

### Cambiare frequenza
- `0 9 * * *` = ogni giorno
- `0 9 * * 1,3,5` = lunedì, mercoledì, venerdì
- `0 9 1,15 * *` = 1° e 15° del mese

## 🔒 Security

- ✅ Authorization Bearer token obbligatorio in production
- ✅ Rate limiting: 1s pausa tra reminder
- ✅ Max 2 reminder per lead
- ✅ Token scadono dopo 30 giorni
- ✅ Log completo di tutte le azioni

## 🐛 Troubleshooting

### Reminder non inviati
1. Verifica configurazione: `GET /api/system/config`
2. Verifica token scaduti: `SELECT * FROM lead_completion_tokens WHERE expires_at < datetime('now')`
3. Verifica log database: `SELECT * FROM lead_completion_log`

### Errore 401 Unauthorized
- Verifica CRON_SECRET in Cloudflare Dashboard
- Verifica header `Authorization: Bearer TOKEN`

### Errore 500 Database
- Verifica D1 binding in Cloudflare Pages
- Esegui migrations: vedere `/migrations/`

## 📚 Riferimenti

- Template Email: `/public/templates/email/email_reminder_completamento.html`
- Modulo Lead Completion: `/src/modules/lead-completion.ts`
- API Routes: `/src/index.tsx` (cerca `/api/cron/send-reminders`)
- Migrations: `/migrations/0022_lead_completion_tokens.sql`
