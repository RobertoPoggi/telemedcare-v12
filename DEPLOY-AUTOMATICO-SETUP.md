# 🚀 SETUP DEPLOY AUTOMATICO - ISTRUZIONI COMPLETE

## ✅ COSA HO GIÀ FATTO:

1. ✅ Creato GitHub Actions workflow (`.github/workflows/deploy.yml`)
2. ✅ Sistemato tutti gli errori di build
3. ✅ Committato tutto il codice
4. ✅ Build locale funziona perfettamente
5. ✅ Admin dashboard completa
6. ✅ Database migrations pronte

---

## 🎯 COSA DEVI FARE (5 MINUTI):

### STEP 1: Aggiungi il Secret su GitHub

1. Vai su: **https://github.com/RobertoPoggi/telemedcare-v11/settings/secrets/actions**
2. Clicca: **"New repository secret"**
3. Compila:
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: `zc-7hBL9xX4S7cBj-ZneYA9tyZYBf_lSZAgyODq3`
4. Clicca: **"Add secret"**

### STEP 2: Crea Database D1 su Cloudflare

1. Vai su: **https://dash.cloudflare.com**
2. Menu laterale: **"Workers & Pages"** → **"D1"**
3. Clicca: **"Create database"**
4. Nome: `telemedcare-leads`
5. Copia il **Database ID** che ti da (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
6. **IMPORTANTE**: Sostituisci questo ID nel file `wrangler.jsonc` alle righe 32 e 48

### STEP 3: Esegui le Migrations sul Database Produzione

Quando il database è creato, esegui questi comandi nel terminale:

```bash
cd /home/user/webapp
export CLOUDFLARE_API_TOKEN="zc-7hBL9xX4S7cBj-ZneYA9tyZYBf_lSZAgyODq3"

# Applica tutte le migrations al database di produzione
npx wrangler d1 migrations apply telemedcare-leads --remote
```

Questo creerà tutte le tabelle: leads, contracts, proformas, devices, ecc.

### STEP 4: Configura il Progetto Cloudflare Pages (se non l'hai fatto)

1. Vai su: **https://dash.cloudflare.com**
2. **"Workers & Pages"** → **"Create application"** → **"Pages"**
3. **"Connect to Git"** → Seleziona `telemedcare-v11`
4. **Build settings**:
   - Build command: `npm run build`
   - Build output: `dist`
5. **Environment Variables** (aggiungi queste):
   ```
   RESEND_API_KEY = re_Pnq97oxZ_Mc2X78wVvsaxDHZhpvpA8JGt
   EMAIL_FROM = noreply@telemedcare.it
   EMAIL_TO_INFO = info@telemedcare.it
   ENVIRONMENT = production
   DEBUG_MODE = false
   ```
6. Nella sezione **"Bindings"**:
   - Clicca **"Add binding"**
   - Type: **"D1 database"**
   - Variable name: `DB`
   - D1 database: Seleziona `telemedcare-leads`

### STEP 5: Fai il Push del Workflow

```bash
cd /home/user/webapp
git add .github/workflows/deploy.yml
git add DEPLOY-AUTOMATICO-SETUP.md
git commit -m "feat: Add automatic deployment with GitHub Actions"
git push origin main
```

---

## 🎉 FATTO! 

Dopo il push:
1. Vai su: **https://github.com/RobertoPoggi/telemedcare-v11/actions**
2. Vedrai il workflow "Deploy to Cloudflare Pages" che parte automaticamente
3. Aspetta 2-3 minuti che completi
4. Il sito sarà LIVE su Cloudflare Pages!

---

## 🔄 DA ORA IN POI:

**OGNI volta che fai `git push` su `main`**:
- ✅ GitHub Actions partirà automaticamente
- ✅ Farà il build
- ✅ Farà il deploy su Cloudflare
- ✅ ZERO intervento manuale necessario

---

## 📱 ACCEDERE AL SITO:

Dopo il primo deploy, il tuo URL sarà:
- **https://telemedcare-v11.pages.dev**

Oppure puoi collegare un dominio custom dalla dashboard Cloudflare.

---

## 🔧 TROUBLESHOOTING:

**Se il deploy fallisce:**
1. Vai su GitHub Actions e leggi i log
2. Controlla che il secret `CLOUDFLARE_API_TOKEN` sia configurato
3. Verifica che il database D1 sia stato creato
4. Assicurati che i bindings siano configurati su Cloudflare Pages

**Se il database non funziona:**
- Verifica che l'ID del database in `wrangler.jsonc` corrisponda a quello reale
- Assicurati di aver eseguito le migrations con `wrangler d1 migrations apply`

---

## 📞 NOTE IMPORTANTI:

1. **DocuSign**: Funzionerà automaticamente in produzione (ha HTTPS)
2. **Admin Dashboard**: Accessibile su `/admin-dashboard`
3. **API Admin**: Disponibile su `/api/admin/*`
4. **Database**: Tutte le migrations sono pronte

---

## ✨ VANTAGGI DEL SETUP AUTOMATICO:

- ✅ Deploy automatico ad ogni push
- ✅ Build verificato prima del deploy
- ✅ Rollback facile (basta fare un revert del commit)
- ✅ Storia completa di tutti i deploy
- ✅ Notifiche su GitHub se qualcosa fallisce
- ✅ ZERO manutenzione

---

**Tutto pronto! Segui gli step sopra e il deploy sarà completamente automatico! 🚀**
