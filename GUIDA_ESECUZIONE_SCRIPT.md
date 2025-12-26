# 🚀 GUIDA ESECUZIONE SCRIPT AUTOMATICO

**TeleMedCare V12.0 - Configurazione Automatica con Script**

---

## 📋 COSA FA LO SCRIPT

Lo script `setup-telemedcare.sh` configura automaticamente:

✅ **6 Environment Variables** su Cloudflare Pages:
- SENDGRID_API_KEY
- RESEND_API_KEY
- EMAIL_FROM
- EMAIL_TO_INFO
- JWT_SECRET
- ENCRYPTION_KEY

✅ **8 DNS Records** su telemedcare.it:
- 4 per SendGrid (CNAME em6551, s1._domainkey, s2._domainkey + TXT _dmarc)
- 4 per Resend (MX send, TXT send SPF, TXT resend._domainkey DKIM, TXT _dmarc)

---

## 🎯 PREREQUISITI (prima di eseguire)

### 1. **Cloudflare API Token**

**Come ottenerlo** (2 minuti):

1. Vai su: https://dash.cloudflare.com/profile/api-tokens
2. Clicca: **Create Token**
3. Usa template: **Edit Cloudflare Workers**
4. Aggiungi permessi aggiuntivi:
   - Account > Account Settings > Read
   - Zone > DNS > Edit
   - Zone > Zone > Read
5. Clicca: **Continue to summary**
6. Clicca: **Create Token**
7. **COPIA IL TOKEN** (lo vedrai solo una volta!)

Esempio token:
```
xYz123AbC456DeF789GhI012JkL345MnO678PqR
```

### 2. **Cloudflare Account ID**

**Come trovarlo** (30 secondi):

1. Vai su: https://dash.cloudflare.com/
2. Seleziona qualsiasi dominio
3. Guarda nella **barra laterale destra**
4. Troverai: **Account ID: xxxxxxxxxxxxx**
5. Copia l'ID

Esempio:
```
1234567890abcdef1234567890abcdef
```

### 3. **Cloudflare Zone ID** (per telemedcare.it)

**Come trovarlo** (30 secondi):

1. Vai su: https://dash.cloudflare.com/
2. Clicca su: **telemedcare.it**
3. Scroll nella **sidebar destra**
4. Troverai: **Zone ID: xxxxxxxxxxxxx**
5. Copia l'ID

Esempio:
```
abcdef1234567890abcdef1234567890
```

---

## 🖥️ ESECUZIONE SCRIPT

### **METODO 1: Dal tuo Computer (CONSIGLIATO)** ⭐

#### **Passo 1: Scarica il repository**

```bash
# Se hai già clonato il repository
cd /path/to/telemedcare-v12
git pull origin main

# OPPURE clona ora
git clone https://github.com/RobertoPoggi/telemedcare-v12.git
cd telemedcare-v12
```

#### **Passo 2: Rendi lo script eseguibile**

```bash
chmod +x setup-telemedcare.sh
```

#### **Passo 3: Esegui lo script**

```bash
./setup-telemedcare.sh
```

#### **Passo 4: Segui le istruzioni**

Lo script ti chiederà:

1. **Cloudflare API Token** → Incolla il token che hai generato
2. **Cloudflare Account ID** → Incolla l'Account ID
3. **Cloudflare Zone ID** → Incolla il Zone ID di telemedcare.it

Lo script farà tutto automaticamente! ✨

---

### **METODO 2: Da Windows** (se usi Windows)

#### **Opzione A: Con Git Bash** (se hai Git installato)

1. Apri **Git Bash**
2. Segui gli stessi comandi del Metodo 1

#### **Opzione B: Con WSL** (Windows Subsystem for Linux)

1. Apri **WSL** (Ubuntu)
2. Segui gli stessi comandi del Metodo 1

#### **Opzione C: PowerShell con Node.js**

Se non hai bash, puoi usare i comandi wrangler direttamente:

```powershell
# Configura token
$env:CLOUDFLARE_API_TOKEN="il-tuo-token-qui"

# Naviga al progetto
cd C:\path\to\telemedcare-v12

# Configura le variabili una per una
echo "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" | npx wrangler pages secret put SENDGRID_API_KEY --project-name=telemedcare-v12

echo "re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2" | npx wrangler pages secret put RESEND_API_KEY --project-name=telemedcare-v12

echo "info@telemedcare.it" | npx wrangler pages secret put EMAIL_FROM --project-name=telemedcare-v12

echo "info@telemedcare.it" | npx wrangler pages secret put EMAIL_TO_INFO --project-name=telemedcare-v12

echo "f8adfd1d3ab5f1bcacdb0c09e9eca0904146790112eb3f375516380e75adc534" | npx wrangler pages secret put JWT_SECRET --project-name=telemedcare-v12

echo "492109618a5df3abe44c7086e4983cd776393457381a776bd3c51de67b7573cd" | npx wrangler pages secret put ENCRYPTION_KEY --project-name=telemedcare-v12
```

Per i DNS dovrai usare la dashboard Cloudflare manualmente.

---

## 📺 ESEMPIO OUTPUT DELLO SCRIPT

Quando esegui lo script vedrai qualcosa così:

```
═══════════════════════════════════════════════════════════
  TeleMedCare V12.0 - Configurazione Automatica
═══════════════════════════════════════════════════════════

STEP 1: Verifica prerequisiti...

✅ Node.js/npm trovato
✅ curl trovato

ℹ️  Tutti i prerequisiti soddisfatti!

═══════════════════════════════════════════════════════════
STEP 2: Cloudflare API Token
═══════════════════════════════════════════════════════════

ℹ️  Per configurare il sistema, serve un Cloudflare API Token.

Come ottenerlo:
1. Vai su: https://dash.cloudflare.com/profile/api-tokens
2. Clicca: 'Create Token'
...

Hai già il token? (y/n): y

Incolla il Cloudflare API Token: [incolla qui]

✅ Token configurato!

═══════════════════════════════════════════════════════════
STEP 3: Cloudflare Account ID
═══════════════════════════════════════════════════════════

...

Incolla il Cloudflare Account ID: [incolla qui]

✅ Account ID configurato!

═══════════════════════════════════════════════════════════
STEP 5: Configurazione Environment Variables
═══════════════════════════════════════════════════════════

ℹ️  Configurazione di 6 variabili su Cloudflare Pages...

[1/6] Configurazione SENDGRID_API_KEY... ✅ OK
[2/6] Configurazione RESEND_API_KEY... ✅ OK
[3/6] Configurazione EMAIL_FROM... ✅ OK
[4/6] Configurazione EMAIL_TO_INFO... ✅ OK
[5/6] Configurazione JWT_SECRET... ✅ OK
[6/6] Configurazione ENCRYPTION_KEY... ✅ OK

✅ Environment Variables configurate!

═══════════════════════════════════════════════════════════
STEP 6: Configurazione DNS Records
═══════════════════════════════════════════════════════════

ℹ️  Configurazione di 8 DNS records per telemedcare.it...

[1/8] Aggiunta record CNAME em6551... ✅ OK
[2/8] Aggiunta record CNAME s1._domainkey... ✅ OK
[3/8] Aggiunta record CNAME s2._domainkey... ✅ OK
[4/8] Aggiunta record TXT _dmarc... ✅ OK
[5/8] Aggiunta record MX send... ✅ OK
[6/8] Aggiunta record TXT send... ✅ OK
[7/8] Aggiunta record TXT resend._domainkey... ✅ OK
[8/8] Aggiunta record TXT _dmarc... ⚠️  ESISTE GIÀ

✅ DNS Records configurati!

═══════════════════════════════════════════════════════════
STEP 8: Prossimi Passi
═══════════════════════════════════════════════════════════

✅ TUTTO FATTO! 🎉

Il sistema TeleMedCare V12.0 è configurato e sarà pronto tra 2 ore.
```

---

## ⏱️ TIMELINE DOPO L'ESECUZIONE

```
✅ IMMEDIATAMENTE:  Environment Variables attive
✅ IMMEDIATAMENTE:  DNS Records aggiunti
⏳ +15-30 minuti:   DNS propagazione iniziata
⏳ +1-2 ore:        DNS propagati globalmente
✅ +2 ore:          Domini verificati automaticamente
✅ +2 ore:          Sistema pronto per invio email
```

---

## 🔍 VERIFICA MANUALE (opzionale)

### **1. Verifica Environment Variables**

```bash
# Via CLI
npx wrangler pages secret list --project-name=telemedcare-v12
```

Oppure via dashboard:
- https://dash.cloudflare.com/
- Workers & Pages > telemedcare-v12 > Settings > Environment Variables

### **2. Verifica DNS Records**

```bash
# Via CLI (dopo 15+ minuti)
dig em6551.telemedcare.it CNAME
dig s1._domainkey.telemedcare.it CNAME
dig s2._domainkey.telemedcare.it CNAME
dig _dmarc.telemedcare.it TXT
dig send.telemedcare.it MX
```

Oppure via dashboard:
- https://dash.cloudflare.com/
- telemedcare.it > DNS > Records

---

## 🚨 TROUBLESHOOTING

### **Problema: "npx: command not found"**

**Soluzione**: Installa Node.js
```bash
# macOS
brew install node

# Ubuntu/Debian
sudo apt-get install nodejs npm

# Windows
# Scarica da: https://nodejs.org/
```

### **Problema: "Permission denied"**

**Soluzione**: Rendi lo script eseguibile
```bash
chmod +x setup-telemedcare.sh
```

### **Problema: "Invalid API Token"**

**Soluzione**: 
1. Verifica che il token sia copiato correttamente
2. Verifica che il token abbia i permessi corretti:
   - Account > Account Settings > Read
   - Workers > Workers Scripts > Edit
   - Zone > DNS > Edit
   - Zone > Zone > Read

### **Problema: "DNS record already exists"**

**Non è un problema!** Significa che il record esiste già. Lo script continuerà.

---

## ✅ CHECKLIST PRE-ESECUZIONE

Prima di eseguire lo script, assicurati di avere:

- [ ] **Cloudflare API Token** (generato e copiato)
- [ ] **Cloudflare Account ID** (copiato)
- [ ] **Cloudflare Zone ID** per telemedcare.it (copiato)
- [ ] **Node.js** installato (verifica con: `node --version`)
- [ ] **npm** installato (verifica con: `npm --version`)
- [ ] **Repository** clonato o scaricato
- [ ] **Connessione internet** attiva

---

## 🎯 DOPO L'ESECUZIONE

Dopo che lo script completa:

1. ✅ **Attendi 2 ore** per DNS propagazione completa

2. ✅ **Verifica domini**:
   - SendGrid: https://app.sendgrid.com/ > Settings > Sender Authentication
   - Resend: https://resend.com/ > Settings > Domains

3. ✅ **Testa invio email**:
   - Vai su: https://telemedcare-v12.pages.dev/admin/leads-dashboard
   - Clicca pulsante **BLU** (contratto) su un lead
   - Conferma invio
   - Controlla email su **info@telemedcare.it**

---

## 📞 SUPPORTO

Se hai problemi:

1. Controlla il file **PROBLEMI_RILEVATI_E_FIX.md**
2. Controlla i log dello script (stderr)
3. Verifica manualmente via dashboard Cloudflare
4. Se necessario, configura manualmente seguendo **CONFIGURAZIONE_RAPIDA_COPY_PASTE.md**

---

## 🎉 RISULTATO

**Dopo l'esecuzione dello script**:
- ✅ 6 Environment Variables configurate
- ✅ 8 DNS Records aggiunti
- ✅ Sistema pronto (dopo 2 ore)
- ✅ Email inviate da info@telemedcare.it

**Tempo totale**: 5 minuti di esecuzione + 2 ore di attesa DNS

---

**Lo script è pronto! Eseguilo e tutto sarà configurato automaticamente!** 🚀

---

**File**: `setup-telemedcare.sh`  
**Versione**: 1.0  
**Data**: 2024-12-26
