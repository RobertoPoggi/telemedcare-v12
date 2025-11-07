# 🚀 QUICK START - Deployment e Test (5 minuti)

**Data:** 2025-11-07  
**Status:** ✅ CODICE PRONTO - Solo deployment richiesto

---

## ⚡ DEPLOYMENT RAPIDO (3 comandi)

### 1. Autenticati con Cloudflare
```bash
cd /home/user/webapp
npx wrangler login
```

### 2. Deploy con script automatico
```bash
./quick-deploy.sh
```
Lo script farà:
- ✅ Verifica autenticazione
- ✅ Applica migration 0007 al database
- ✅ Build del progetto
- ✅ Deploy su Cloudflare Pages

### 3. Test automatico
```bash
./quick-test.sh https://telemedcare-v11.pages.dev
```
Lo script testerà:
- ✅ Health check sistema
- ✅ Lead intake BASE + intestazione RICHIEDENTE
- ✅ Lead intake AVANZATO + intestazione ASSISTITO
- ✅ Partner leads (IRBEMA, Luxottica)

---

## 📧 VERIFICA EMAIL (2 minuti)

Dopo il test automatico, controlla:

**1. rpoggi55@gmail.com:**
- ✅ 2 email di conferma ricevute
- ✅ Subject: "Conferma richiesta TeleMedCare - Roberto Poggi"
- ✅ Nessun placeholder {{VARIABILE}} visibile
- ✅ Tutti i dati presenti e corretti

**2. info@telemedcare.it:**
- ✅ 2 email di notifica interna
- ✅ Subject: "Nuova richiesta TeleMedCare - Roberto Poggi"
- ✅ Include campi: CF, indirizzo, condizioni salute, urgenza
- ✅ Sender: info@telemedcare.it (NON noreply@)

---

## ✅ CHECKLIST VELOCE

- [ ] Login Cloudflare completato
- [ ] Script `quick-deploy.sh` eseguito con successo
- [ ] URL produzione ottenuto (es: https://telemedcare-v11.pages.dev)
- [ ] Script `quick-test.sh` eseguito
- [ ] Email ricevute e verificate
- [ ] Nessun placeholder {{VARIABILE}} nelle email
- [ ] Nessun campo "DA FORNIRE" nelle email
- [ ] Sender email corretto (info@telemedcare.it)

---

## 🐛 PROBLEMI?

**Email non arrivano:**
```bash
# Verifica environment variables
npx wrangler pages deployment list --project-name telemedcare-v11

# Verifica logs
npx wrangler pages deployment tail --project-name telemedcare-v11
```

**Database error:**
```bash
# Applica migration manualmente
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0007_fix_proforma_schema.sql
```

**Deploy fallisce:**
```bash
# Rebuild
npm run build

# Rideploy
npx wrangler pages deploy dist --project-name telemedcare-v11
```

---

## 📚 DOCUMENTAZIONE COMPLETA

Per guida dettagliata step-by-step:
- **GUIDA_DEPLOYMENT_TESTING_ROBERTO.md** - Guida completa 20 pagine
- **FINAL_STATUS_ROBERTO.md** - Status completo delle modifiche

---

## 🎯 DOPO IL TEST

Una volta che tutto funziona:

1. **Testa firma contratto:**
   ```bash
   curl -X POST https://telemedcare-v11.pages.dev/api/contract/sign \
     -H "Content-Type: application/json" \
     -d '{"leadId": "LEAD_ID", "firmaDigitale": "Roberto Poggi - Test"}'
   ```

2. **Verifica proforma generata**

3. **Test completo workflow 360°** con tutti gli scenari

---

**TEMPO TOTALE: 5-10 minuti** ⚡

**Buon deployment! 🚀**
