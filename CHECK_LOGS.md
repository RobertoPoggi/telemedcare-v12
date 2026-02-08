# 📊 Come Controllare i Log su Cloudflare

## Opzione 1: Dashboard Cloudflare (CONSIGLIATO)

1. Vai su https://dash.cloudflare.com/
2. **Workers & Pages** → **telemedcare-v12**
3. Click su **Logs** (nel menu laterale)
4. Imposta filtro tempo: **Last 15 minutes**
5. Cerca questi messaggi chiave:

### Log Attesi per Email Notification:

```
🔔 [NOTIFICATION] Inizio invio notifica per lead LEAD-IRBEMA-00XXX
🔔 [NOTIFICATION] Lead data: { ... }
🔔 [NOTIFICATION] Controllo switch admin_email_notifications_enabled...
🔔 [NOTIFICATION] Switch value: true
✅ [NOTIFICATION] Switch attivo, procedo con invio email
📧 [NOTIFICATION] Creazione EmailService...
📧 [NOTIFICATION] EmailService creato, preparo dati email...
📧 [NOTIFICATION] Invio email a info@telemedcare.it...
📧 [NOTIFICATION] Subject: 🆕 Nuovo Lead: ...
```

### Log in caso di SUCCESSO:
```
✅ [NOTIFICATION] Email result: { success: true, messageId: "..." }
📧 [NOTIFICATION] Email inviata per nuovo lead ...
```

### Log in caso di PROBLEMA:
```
⏭️ [NOTIFICATION] Notifiche admin disabilitate, skip email per lead ...
```
OPPURE
```
⚠️ [NOTIFICATION] Errore invio email per lead ...: <errore>
```

---

## Opzione 2: Log in Tempo Reale (Wrangler CLI)

Se hai wrangler configurato:

```bash
cd /home/user/webapp
npx wrangler pages deployment tail --project-name=telemedcare-v12
```

---

## 🎯 COSA CERCARE NEI LOG

### Scenario 1: Switch Disabilitato
Se vedi:
```
⏭️ [NOTIFICATION] Notifiche admin disabilitate, skip email per lead
```
**Soluzione**: Attiva lo switch "Notifiche Email Admin" nella dashboard

### Scenario 2: Email Service Fallisce
Se vedi:
```
⚠️ [NOTIFICATION] Errore invio email per lead ...
```
**Soluzione**: Controlla l'errore specifico per capire se è problema Resend/SendGrid

### Scenario 3: Funzione Non Viene Chiamata
Se NON vedi **nessun** log con `[NOTIFICATION]`:
**Soluzione**: Il problema è prima, nell'import HubSpot stesso

### Scenario 4: DEMO MODE Attivo
Se vedi:
```
❌ TUTTI I PROVIDER FALLITI - MODALITÀ DEMO ATTIVA
```
**Soluzione**: API keys non configurate correttamente

---

## 🔍 DEBUG AVANZATO

Se i log mostrano che l'email viene "inviata" ma non arriva:

1. **Controlla Resend Dashboard**: https://resend.com/emails
   - Dovresti vedere l'email nella lista
   - Controlla lo stato: Delivered / Bounced / Failed

2. **Controlla Spam**: L'email potrebbe essere finita in spam

3. **Verifica Dominio**: Il dominio `telemedcare.it` deve essere verificato su Resend

---

## 📞 PROSSIMO STEP

Dopo aver controllato i log:
1. Se vedi i log ma l'email non arriva → problema Resend/dominio
2. Se NON vedi i log → problema nel flusso prima di sendNewLeadNotification()
3. Se vedi errore specifico → possiamo fixare basandoci sul messaggio

**Fammi sapere cosa trovi nei log!**
