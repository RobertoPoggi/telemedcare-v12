# 🎛️ Dashboard: Interruttore ON/OFF Cron Reminder

## 📍 Posizione Interfaccia

**Path:** Dashboard → **Impostazioni** → **Sistema Email**

**Sezione:** Configurazione Reminder Automatici

---

## 🎨 UI Design (Da Implementare)

### Layout Proposto:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️  Impostazioni Sistema Email                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 📧 Email Automatiche                                          │
│ ├─ ☑️ Abilita invio automatico email (ON)                    │
│ └─ ☐ Invia copia a info@ecura.it (ON)                  │
│                                                               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                               │
│ 🔔 Reminder Automatici                                        │
│                                                               │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ Invio Reminder Lead Incompleti                       │    │
│ │                                                       │    │
│ │ 🟢 ATTIVO          [●─────────] 🔴 DISATTIVO        │    │
│ │                                                       │    │
│ │ Status: ✅ Cron abilitato e attivo                   │    │
│ │ Ultima esecuzione: 08/01/2026 09:00                  │    │
│ │ Prossima esecuzione: 09/01/2026 09:00                │    │
│ │ Reminder inviati oggi: 3                             │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                               │
│ ⚙️ Configurazione Reminder                                    │
│ ├─ Token validità: [30] giorni                               │
│ ├─ Intervallo reminder: [3] giorni                           │
│ ├─ Max reminder per lead: [2]                                │
│ └─ Orario esecuzione: 09:00 UTC (10:00 CET)                  │
│                                                               │
│ 📊 Statistiche Ultimi 7 Giorni                                │
│ ├─ Reminder inviati: 21                                      │
│ ├─ Lead completati: 5                                        │
│ └─ Tasso conversione: 23.8%                                  │
│                                                               │
│                          [💾 Salva Modifiche]                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 API Integration

### GET /api/system/config

**Recupera configurazione attuale:**

```bash
curl "https://telemedcare-v12.pages.dev/api/system/config"
```

**Response:**
```json
{
  "success": true,
  "config": {
    "auto_completion_enabled": false,
    "auto_completion_token_days": 30,
    "auto_completion_reminder_days": 3,
    "auto_completion_max_reminders": 2,
    "cron_enabled": true
  }
}
```

### POST /api/system/config

**Aggiorna configurazione:**

```bash
curl -X POST "https://telemedcare-v12.pages.dev/api/system/config" \
  -H "Content-Type: application/json" \
  -d '{
    "cron_enabled": false
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Configurazione aggiornata",
  "config": {
    "auto_completion_enabled": false,
    "auto_completion_token_days": 30,
    "auto_completion_reminder_days": 3,
    "auto_completion_max_reminders": 2,
    "cron_enabled": false
  }
}
```

---

## 💻 Codice Frontend (React/TypeScript)

### Component: CronToggleSwitch.tsx

```tsx
import React, { useState, useEffect } from 'react'

interface SystemConfig {
  cron_enabled: boolean
  auto_completion_token_days: number
  auto_completion_reminder_days: number
  auto_completion_max_reminders: number
}

export default function CronToggleSwitch() {
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Carica configurazione
  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/system/config')
      const data = await response.json()
      if (data.success) {
        setConfig(data.config)
      }
    } catch (error) {
      console.error('Errore caricamento config:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCron = async () => {
    if (!config) return

    setSaving(true)
    try {
      const response = await fetch('/api/system/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cron_enabled: !config.cron_enabled
        })
      })

      const data = await response.json()
      if (data.success) {
        setConfig(data.config)
        // Mostra notifica successo
        alert(`Cron reminder ${data.config.cron_enabled ? 'ATTIVATO' : 'DISATTIVATO'}`)
      }
    } catch (error) {
      console.error('Errore aggiornamento config:', error)
      alert('Errore durante il salvataggio')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Caricamento...</div>
  }

  if (!config) {
    return <div>Errore caricamento configurazione</div>
  }

  return (
    <div className="cron-toggle-container">
      <h3>🔔 Reminder Automatici</h3>
      
      <div className="toggle-section">
        <div className="toggle-header">
          <span className="toggle-label">Invio Reminder Lead Incompleti</span>
          <button
            onClick={toggleCron}
            disabled={saving}
            className={`toggle-button ${config.cron_enabled ? 'active' : 'inactive'}`}
          >
            {config.cron_enabled ? '🟢 ATTIVO' : '🔴 DISATTIVO'}
          </button>
        </div>
        
        <div className="toggle-status">
          <p>
            <strong>Status:</strong>{' '}
            {config.cron_enabled 
              ? '✅ Cron abilitato e attivo' 
              : '⚠️ Cron disabilitato - nessuna email verrà inviata'}
          </p>
        </div>
      </div>

      <div className="config-details">
        <h4>⚙️ Configurazione Reminder</h4>
        <ul>
          <li>Token validità: <strong>{config.auto_completion_token_days} giorni</strong></li>
          <li>Intervallo reminder: <strong>{config.auto_completion_reminder_days} giorni</strong></li>
          <li>Max reminder per lead: <strong>{config.auto_completion_max_reminders}</strong></li>
          <li>Orario esecuzione: <strong>09:00 UTC (10:00 CET)</strong></li>
        </ul>
      </div>
    </div>
  )
}
```

### CSS: cron-toggle.css

```css
.cron-toggle-container {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.toggle-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.toggle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toggle-label {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
}

.toggle-button {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-button.active {
  background: linear-gradient(135deg, #00A86B 0%, #20B2AA 100%);
  color: white;
}

.toggle-button.inactive {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
}

.toggle-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.toggle-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-status {
  padding: 12px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #0066CC;
}

.config-details {
  margin-top: 24px;
}

.config-details h4 {
  color: #0066CC;
  margin-bottom: 12px;
}

.config-details ul {
  list-style: none;
  padding: 0;
}

.config-details li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.config-details li:last-child {
  border-bottom: none;
}
```

---

## 🔄 Comportamento Interruttore

### Quando ATTIVO (🟢):
```
GitHub Actions (09:00 UTC)
    ↓
POST /api/cron/send-reminders
    ↓
Verifica: cron_enabled = true
    ↓
Processa reminder
    ↓
Invia email reminder
    ↓
HTTP 200 + stats
```

### Quando DISATTIVO (🔴):
```
GitHub Actions (09:00 UTC)
    ↓
POST /api/cron/send-reminders
    ↓
Verifica: cron_enabled = false
    ↓
❌ STOP - nessuna azione
    ↓
HTTP 204 No Content
    ↓
GitHub Actions: success (⚠️ Cron disabilitato)
```

**Vantaggio:** Il cron GitHub continua a eseguire (nessun errore), ma il sistema non invia email.

---

## 🧪 Test Funzionalità

### 1. Test Toggle ON → OFF

```bash
# Disabilita cron
curl -X POST "https://telemedcare-v12.pages.dev/api/system/config" \
  -H "Content-Type: application/json" \
  -d '{"cron_enabled": false}'

# Test cron (dovrebbe ritornare 204)
curl -X POST "https://telemedcare-v12.pages.dev/api/cron/send-reminders" \
  -H "Authorization: Bearer YOUR_SECRET"

# Expected response: HTTP 204
# Body: {"success":true,"message":"Cron disabilitato dalla dashboard","stats":{"success":0,"failed":0,"total":0,"disabled":true}}
```

### 2. Test Toggle OFF → ON

```bash
# Abilita cron
curl -X POST "https://telemedcare-v12.pages.dev/api/system/config" \
  -H "Content-Type: application/json" \
  -d '{"cron_enabled": true}'

# Test cron (dovrebbe ritornare 200 + reminder inviati)
curl -X POST "https://telemedcare-v12.pages.dev/api/cron/send-reminders" \
  -H "Authorization: Bearer YOUR_SECRET"

# Expected response: HTTP 200
# Body: {"success":true,"message":"Processo reminder completato","stats":{"success":2,"failed":0,"total":2}}
```

---

## 📊 Monitoraggio

### Cloudflare Pages Logs

Quando cron DISABILITATO:
```
[CRON] Avvio processo reminder...
[REMINDER] Cron disabilitato dalla dashboard - nessuna azione eseguita
[CRON] Cron disabilitato - nessuna azione
```

Quando cron ABILITATO:
```
[CRON] Avvio processo reminder...
[REMINDER] Cron abilitato - avvio processo reminder
[REMINDER] Trovati 3 token che necessitano reminder
[REMINDER] Email inviata a user1@example.com (reminder #1)
[REMINDER] Email inviata a user2@example.com (reminder #1)
[CRON] Processo reminder completato: 2/2 successo, 0 falliti
```

### GitHub Actions Logs

Quando cron DISABILITATO:
```
📨 HTTP Status: 204
📋 Response: {"success":true,"message":"Cron disabilitato dalla dashboard","stats":{...}}
⚠️ Cron disabilitato dalla dashboard (nessuna azione)
```

Quando cron ABILITATO:
```
📨 HTTP Status: 200
📋 Response: {"success":true,"stats":{"success":2,"failed":0,"total":2}}
✅ Reminder inviati con successo!
```

---

## 🎯 Prossimi Passi Implementazione

1. ✅ Backend API implementato (cron_enabled config)
2. ✅ Migration SQL creata (0023_cron_enabled_config.sql)
3. ⏳ **Frontend Dashboard UI** (da implementare)
   - Creare componente CronToggleSwitch.tsx
   - Integrare in pagina Impostazioni
   - Aggiungere CSS styling
4. ⏳ **Test E2E**
   - Test toggle ON/OFF
   - Verifica GitHub Actions risposta
   - Verifica email non inviate quando OFF

---

## 📝 Note Tecniche

- **Default:** `cron_enabled = true` (attivo di default)
- **Database:** Config salvata in tabella `system_config`
- **API:** Endpoint `/api/system/config` gestisce lettura/scrittura
- **HTTP Status:** 204 quando disabilitato (GitHub Actions non interpreta come errore)
- **Sicurezza:** Solo admin dashboard può modificare config

---

## ✅ Completamento

Quando avrai implementato il frontend:
1. Testa toggle dalla dashboard
2. Verifica che GitHub Actions riceva 204 quando OFF
3. Verifica che email non vengano inviate quando OFF
4. Testa riattivazione (ON) e invio email

🎉 **Sistema di controllo cron completo e funzionante!**
